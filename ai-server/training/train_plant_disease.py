import argparse
import json
import os
from typing import Dict

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms

DATASET_DIR = os.path.join("ai-server", "datasets", "plant-disease")
MODEL_PATH = os.path.join("ai-server", "models", "plant-disease", "model.pt")
LABELS_PATH = os.path.join("ai-server", "models", "plant-disease", "labels.json")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train plant disease classification model")
    parser.add_argument("--epochs", type=int, default=5, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=16, help="Training batch size")
    parser.add_argument("--learning-rate", type=float, default=0.001, help="Learning rate")
    parser.add_argument(
        "--max-train-batches",
        type=int,
        default=0,
        help="Maximum number of training batches per epoch; 0 disables the limit",
    )
    parser.add_argument(
        "--max-val-batches",
        type=int,
        default=0,
        help="Maximum number of validation batches; 0 disables the limit",
    )
    return parser.parse_args()


def build_dataloaders(batch_size: int) -> tuple[DataLoader, DataLoader, dict[str, int]]:
    train_dir = os.path.join(DATASET_DIR, "train")
    val_dir = os.path.join(DATASET_DIR, "val")

    train_transforms = transforms.Compose(
        [
            transforms.Resize((224, 224)),
            transforms.RandomHorizontalFlip(),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ]
    )

    val_transforms = transforms.Compose(
        [
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ]
    )

    train_dataset = datasets.ImageFolder(train_dir, transform=train_transforms)
    val_dataset = datasets.ImageFolder(val_dir, transform=val_transforms)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

    print(f"Dataset loaded: {len(train_dataset)} training images, {len(val_dataset)} validation images")
    print(f"Number of classes: {len(train_dataset.classes)}")

    return train_loader, val_loader, train_dataset.class_to_idx


def build_model(num_classes: int, device: torch.device) -> nn.Module:
    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
    in_features = model.fc.in_features
    model.fc = nn.Linear(in_features, num_classes)
    return model.to(device)


def train_one_epoch(
    model: nn.Module,
    dataloader: DataLoader,
    criterion: nn.Module,
    optimizer: torch.optim.Optimizer,
    device: torch.device,
    max_batches: int = 0,
) -> float:
    model.train()
    running_loss = 0.0
    total_batches = len(dataloader)

    for batch_index, (inputs, labels) in enumerate(dataloader, start=1):
        inputs = inputs.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * inputs.size(0)

        if batch_index % 10 == 0 or batch_index == total_batches:
            print(f"Train batch {batch_index}/{total_batches}, loss: {loss.item():.4f}")

        if max_batches > 0 and batch_index >= max_batches:
            break

    processed_batches = min(total_batches, max_batches) if max_batches > 0 else total_batches
    processed_examples = processed_batches * dataloader.batch_size if dataloader.batch_size else 0
    if max_batches > 0:
        processed_examples = min(processed_examples, len(dataloader.dataset))

    return running_loss / max(processed_examples, 1)


@torch.no_grad()
def evaluate(model: nn.Module, dataloader: DataLoader, device: torch.device, max_batches: int = 0) -> float:
    model.eval()
    correct = 0
    total = 0
    total_batches = len(dataloader)

    for batch_index, (inputs, labels) in enumerate(dataloader, start=1):
        inputs = inputs.to(device)
        labels = labels.to(device)

        outputs = model(inputs)
        predictions = torch.argmax(outputs, dim=1)
        correct += (predictions == labels).sum().item()
        total += labels.size(0)

        if batch_index % 10 == 0 or batch_index == total_batches:
            print(f"Validation batch {batch_index}/{total_batches}")

        if max_batches > 0 and batch_index >= max_batches:
            break

    if total == 0:
        return 0.0

    return correct / total


def save_labels(class_to_idx: Dict[str, int]) -> None:
    os.makedirs(os.path.dirname(LABELS_PATH), exist_ok=True)
    labels = {str(index): class_name for class_name, index in class_to_idx.items()}

    with open(LABELS_PATH, "w", encoding="utf-8") as file:
        json.dump(labels, file, indent=2)


def main() -> None:
    args = parse_args()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    train_loader, val_loader, class_to_idx = build_dataloaders(args.batch_size)
    model = build_model(len(class_to_idx), device)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=args.learning_rate)

    print("Training started")

    for epoch in range(1, args.epochs + 1):
        epoch_loss = train_one_epoch(
            model,
            train_loader,
            criterion,
            optimizer,
            device,
            max_batches=args.max_train_batches,
        )
        val_accuracy = evaluate(model, val_loader, device, max_batches=args.max_val_batches)
        print(f"Epoch {epoch}/{args.epochs} - loss: {epoch_loss:.4f}")
        print(f"Validation accuracy: {val_accuracy:.4f}")

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    torch.save(
        {
            "model_state_dict": model.state_dict(),
            "class_to_idx": class_to_idx,
        },
        MODEL_PATH,
    )
    save_labels(class_to_idx)
    print(f"Model saved: {MODEL_PATH}")
    print(f"Labels saved: {LABELS_PATH}")


if __name__ == "__main__":
    main()
