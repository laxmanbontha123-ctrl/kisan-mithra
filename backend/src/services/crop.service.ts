import { prisma } from '../utils/prisma';

export interface CreateCropInput {
  cropName: string;
  cropVariety: string;
  landArea: number;
  soilType: string;
  irrigationMethod: string;
  location: string;
  sowingDate: Date;
  expectedHarvestDate?: Date | null;
}

export interface UpdateCropInput extends Partial<CreateCropInput> {}

const cropSelection = {
  id: true,
  cropName: true,
  cropVariety: true,
  landArea: true,
  soilType: true,
  irrigationMethod: true,
  location: true,
  sowingDate: true,
  expectedHarvestDate: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
};

export class CropService {
  public async createCrop(userId: string, input: CreateCropInput) {
    const crop = await prisma.crop.create({
      data: {
        ...input,
        userId,
      },
      select: cropSelection,
    });

    return {
      success: true,
      message: 'Crop created successfully',
      data: crop,
    };
  }

  public async getCrops(userId: string) {
    const crops = await prisma.crop.findMany({
      where: { userId },
      select: cropSelection,
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      message: 'Crops fetched successfully',
      data: crops,
    };
  }

  public async getCropById(userId: string, cropId: string) {
    const crop = await prisma.crop.findFirst({
      where: { id: cropId, userId },
      select: cropSelection,
    });

    if (!crop) {
      throw new Error('Crop not found.');
    }

    return {
      success: true,
      message: 'Crop fetched successfully',
      data: crop,
    };
  }

  public async updateCrop(userId: string, cropId: string, input: UpdateCropInput) {
    const existingCrop = await prisma.crop.findFirst({
      where: { id: cropId, userId },
    });

    if (!existingCrop) {
      throw new Error('Crop not found.');
    }

    const crop = await prisma.crop.update({
      where: { id: cropId },
      data: input,
      select: cropSelection,
    });

    return {
      success: true,
      message: 'Crop updated successfully',
      data: crop,
    };
  }

  public async deleteCrop(userId: string, cropId: string) {
    const existingCrop = await prisma.crop.findFirst({
      where: { id: cropId, userId },
    });

    if (!existingCrop) {
      throw new Error('Crop not found.');
    }

    await prisma.crop.delete({ where: { id: cropId } });

    return {
      success: true,
      message: 'Crop deleted successfully',
      data: null,
    };
  }
}

export const cropService = new CropService();
export default cropService;
