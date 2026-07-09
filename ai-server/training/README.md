# Plant Disease Training Dataset

Place the plant disease image dataset under `ai-server/datasets/plant-disease/`.

The dataset should be arranged by class folders like this:

```text
ai-server/datasets/plant-disease/
  train/
    healthy/
    leaf_blight/
  val/
    healthy/
    leaf_blight/
  test/
    healthy/
    leaf_blight/
```

The final trained model should be saved as:

```text
ai-server/models/plant-disease/model.pt
```

Keep `labels.json` aligned with the class order used during training. The label indices in `ai-server/models/plant-disease/labels.json` must match the exact class ordering from the training pipeline.