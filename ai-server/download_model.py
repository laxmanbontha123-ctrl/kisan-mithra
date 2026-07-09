from huggingface_hub import hf_hub_download

model_path = hf_hub_download(
    repo_id="keremberke/yolov8m-plant-disease-detection",
    filename="best.pt"
)

print("Model downloaded successfully!")
print(model_path)