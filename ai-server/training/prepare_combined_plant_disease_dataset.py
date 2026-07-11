import json
import random
import shutil
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[1]
PLANTVILLAGE_RAW_DIR = BASE_DIR / "datasets" / "plant-disease" / "_raw" / "PlantVillage" / "PlantVillage"
RICE_RAW_DIR = BASE_DIR / "datasets" / "plant-disease" / "_raw" / "rice"
TRAIN_DIR = BASE_DIR / "datasets" / "plant-disease" / "train"
VAL_DIR = BASE_DIR / "datasets" / "plant-disease" / "val"
TEST_DIR = BASE_DIR / "datasets" / "plant-disease" / "test"
LABELS_PATH = BASE_DIR / "models" / "plant-disease" / "labels.json"
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
RANDOM_SEED = 42

RICE_CLASS_MAP = {
    "Bacterialblight": "Rice___Bacterial_blight",
    "Blast": "Rice___Blast",
    "Brownspot": "Rice___Brown_spot",
    "Tungro": "Rice___Tungro",
}


def clear_directory_contents(directory: Path) -> None:
    directory.mkdir(parents=True, exist_ok=True)
    for item in directory.iterdir():
        if item.is_dir():
            shutil.rmtree(item)
        else:
            item.unlink()


def collect_images(class_dir: Path) -> list[Path]:
    return sorted(
        [
            path
            for path in class_dir.iterdir()
            if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
        ]
    )


def split_images(images: list[Path]) -> tuple[list[Path], list[Path], list[Path]]:
    shuffled_images = images[:]
    random.Random(RANDOM_SEED).shuffle(shuffled_images)

    total = len(shuffled_images)
    train_count = int(total * 0.70)
    val_count = int(total * 0.15)
    test_count = total - train_count - val_count

    train_images = shuffled_images[:train_count]
    val_images = shuffled_images[train_count : train_count + val_count]
    test_images = shuffled_images[train_count + val_count :]

    return train_images, val_images, test_images


def copy_images(images: list[Path], destination_dir: Path) -> None:
    destination_dir.mkdir(parents=True, exist_ok=True)
    for image_path in images:
        shutil.copy2(image_path, destination_dir / image_path.name)


def build_dataset_entries() -> list[tuple[str, Path]]:
    if not PLANTVILLAGE_RAW_DIR.exists():
        raise FileNotFoundError(f"PlantVillage raw dataset directory not found: {PLANTVILLAGE_RAW_DIR}")

    if not RICE_RAW_DIR.exists():
        raise FileNotFoundError(f"Rice raw dataset directory not found: {RICE_RAW_DIR}")

    dataset_entries: list[tuple[str, Path]] = []

    plantvillage_class_dirs = sorted(path for path in PLANTVILLAGE_RAW_DIR.iterdir() if path.is_dir())
    for class_dir in plantvillage_class_dirs:
        dataset_entries.append((class_dir.name, class_dir))

    for rice_source_name, rice_target_name in RICE_CLASS_MAP.items():
        source_dir = RICE_RAW_DIR / rice_source_name
        if not source_dir.exists():
            raise FileNotFoundError(f"Rice class folder not found: {source_dir}")
        dataset_entries.append((rice_target_name, source_dir))

    return dataset_entries


def prepare_dataset() -> None:
    for split_dir in (TRAIN_DIR, VAL_DIR, TEST_DIR):
        clear_directory_contents(split_dir)

    dataset_entries = build_dataset_entries()

    for class_name, class_dir in dataset_entries:
        images = collect_images(class_dir)
        train_images, val_images, test_images = split_images(images)

        copy_images(train_images, TRAIN_DIR / class_name)
        copy_images(val_images, VAL_DIR / class_name)
        copy_images(test_images, TEST_DIR / class_name)

        print(f"{class_name}: train={len(train_images)} val={len(val_images)} test={len(test_images)}")

    write_labels_json()


def write_labels_json() -> None:
    train_class_dirs = sorted(path for path in TRAIN_DIR.iterdir() if path.is_dir())
    labels = {str(index): class_dir.name for index, class_dir in enumerate(train_class_dirs)}

    LABELS_PATH.parent.mkdir(parents=True, exist_ok=True)
    with LABELS_PATH.open("w", encoding="utf-8") as file:
        json.dump(labels, file, indent=2)

    print(f"Labels saved: {LABELS_PATH}")


def main() -> None:
    prepare_dataset()


if __name__ == "__main__":
    main()