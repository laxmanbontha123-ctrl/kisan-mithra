# Plant Disease Dataset Acquisition Guide

This guide explains the recommended dataset plan for the plant disease model.

## Recommended Plan

1. Start with **PlantVillage** for initial training.
2. Use **PlantDoc** later for real-world validation and testing.
3. Do **not** commit dataset images to GitHub.

Keep the dataset local and only track the placeholder files needed to preserve empty folders.

## Current Target Classes

The model is currently aligned to these classes:

- `healthy`
- `leaf_blight`
- `leaf_spot`
- `rust`
- `powdery_mildew`
- `bacterial_blight`
- `brown_spot`
- `blast`
- `early_blight`
- `late_blight`

## Folder Structure

Organize the dataset with one folder per class under train, val, and test:

```text
ai-server/datasets/plant-disease/train/<class_name>
ai-server/datasets/plant-disease/val/<class_name>
ai-server/datasets/plant-disease/test/<class_name>
```

Example:

```text
ai-server/datasets/plant-disease/train/healthy
ai-server/datasets/plant-disease/train/leaf_blight
ai-server/datasets/plant-disease/val/healthy
ai-server/datasets/plant-disease/val/leaf_blight
```

## labels.json Alignment

The `labels.json` file must match the class folders exactly.

If the folder names or class order change, update `ai-server/models/plant-disease/labels.json` to keep the label indices aligned with training.

## Notes

- Do not mix unrelated classes into the same folder.
- Keep train, validation, and test splits separate.
- Use the same class names everywhere: folder names, training labels, and `labels.json`.
