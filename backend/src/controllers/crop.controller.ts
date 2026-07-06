import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import { cropService } from '../services/crop.service';

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const isValidNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isValidCoordinate = (value: unknown, min: number, max: number): value is number => isValidNumber(value) && value >= min && value <= max;
const toDate = (value: unknown): Date | undefined => {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return undefined;
};

export const createCrop = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const { cropName, cropVariety, landArea, soilType, irrigationMethod, location, latitude, longitude, sowingDate, expectedHarvestDate } = req.body ?? {};

  if (!isNonEmptyString(cropName) || !isNonEmptyString(cropVariety) || !isNonEmptyString(soilType) || !isNonEmptyString(irrigationMethod) || !isNonEmptyString(location)) {
    res.status(400).json({ success: false, message: 'cropName, cropVariety, soilType, irrigationMethod, and location are required.' });
    return;
  }

  if (!isValidNumber(landArea)) {
    res.status(400).json({ success: false, message: 'landArea must be a valid number.' });
    return;
  }

  if (!isValidCoordinate(latitude, -90, 90)) {
    res.status(400).json({ success: false, message: 'latitude must be between -90 and 90.' });
    return;
  }

  if (!isValidCoordinate(longitude, -180, 180)) {
    res.status(400).json({ success: false, message: 'longitude must be between -180 and 180.' });
    return;
  }

  const parsedSowingDate = toDate(sowingDate);
  if (!parsedSowingDate) {
    res.status(400).json({ success: false, message: 'sowingDate must be a valid date.' });
    return;
  }

  const parsedExpectedHarvestDate = expectedHarvestDate === '' || expectedHarvestDate === null ? null : toDate(expectedHarvestDate);
  if (expectedHarvestDate !== undefined && expectedHarvestDate !== null && expectedHarvestDate !== '' && !parsedExpectedHarvestDate) {
    res.status(400).json({ success: false, message: 'expectedHarvestDate must be a valid date.' });
    return;
  }

  try {
    const result = await cropService.createCrop(req.user.id, {
      cropName: cropName.trim(),
      cropVariety: cropVariety.trim(),
      landArea,
      soilType: soilType.trim(),
      irrigationMethod: irrigationMethod.trim(),
      location: location.trim(),
      latitude,
      longitude,
      sowingDate: parsedSowingDate,
      expectedHarvestDate: parsedExpectedHarvestDate ?? null,
    });

    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create crop.';
    res.status(500).json({ success: false, message });
  }
};

export const listCrops = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  try {
    const result = await cropService.getCrops(req.user.id);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch crops.';
    res.status(500).json({ success: false, message });
  }
};

export const getCrop = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const cropId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  try {
    const result = await cropService.getCropById(req.user.id, cropId);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch crop.';
    const statusCode = message === 'Crop not found.' ? 404 : 500;
    res.status(statusCode).json({ success: false, message });
  }
};

export const updateCrop = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const cropId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { cropName, cropVariety, landArea, soilType, irrigationMethod, location, latitude, longitude, sowingDate, expectedHarvestDate } = req.body ?? {};
  const updatePayload: Record<string, unknown> = {};

  if (isNonEmptyString(cropName)) {
    updatePayload.cropName = cropName.trim();
  }

  if (isNonEmptyString(cropVariety)) {
    updatePayload.cropVariety = cropVariety.trim();
  }

  if (isValidNumber(landArea)) {
    updatePayload.landArea = landArea;
  }

  if (isNonEmptyString(soilType)) {
    updatePayload.soilType = soilType.trim();
  }

  if (isNonEmptyString(irrigationMethod)) {
    updatePayload.irrigationMethod = irrigationMethod.trim();
  }

  if (isNonEmptyString(location)) {
    updatePayload.location = location.trim();
  }

  if (isValidCoordinate(latitude, -90, 90)) {
    updatePayload.latitude = latitude;
  }

  if (isValidCoordinate(longitude, -180, 180)) {
    updatePayload.longitude = longitude;
  }

  if (sowingDate !== undefined) {
    const parsedSowingDate = toDate(sowingDate);
    if (!parsedSowingDate) {
      res.status(400).json({ success: false, message: 'sowingDate must be a valid date.' });
      return;
    }

    updatePayload.sowingDate = parsedSowingDate;
  }

  if (expectedHarvestDate !== undefined) {
    const parsedExpectedHarvestDate = expectedHarvestDate === '' || expectedHarvestDate === null ? null : toDate(expectedHarvestDate);
    if (expectedHarvestDate !== '' && expectedHarvestDate !== null && !parsedExpectedHarvestDate) {
      res.status(400).json({ success: false, message: 'expectedHarvestDate must be a valid date.' });
      return;
    }

    updatePayload.expectedHarvestDate = parsedExpectedHarvestDate ?? null;
  }

  if (Object.keys(updatePayload).length === 0) {
    res.status(400).json({ success: false, message: 'No valid fields provided for update.' });
    return;
  }

  try {
    const result = await cropService.updateCrop(req.user.id, cropId, updatePayload);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update crop.';
    const statusCode = message === 'Crop not found.' ? 404 : 500;
    res.status(statusCode).json({ success: false, message });
  }
};

export const deleteCrop = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const cropId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  try {
    const result = await cropService.deleteCrop(req.user.id, cropId);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete crop.';
    const statusCode = message === 'Crop not found.' ? 404 : 500;
    res.status(statusCode).json({ success: false, message });
  }
};

export default { createCrop, listCrops, getCrop, updateCrop, deleteCrop };
