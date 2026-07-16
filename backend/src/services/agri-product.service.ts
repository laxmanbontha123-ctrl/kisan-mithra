import { prisma } from "../utils/prisma";

export interface AgriProductRecommendationInput {
  crop: string;
  problem: string;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export class AgriProductService {
  public async getRecommendations(input: AgriProductRecommendationInput) {
    const crop = normalize(input.crop);
    const problem = normalize(input.problem);

    const products = await prisma.agriProduct.findMany({
      where: {
        isVerified: true,
        crop: {
          equals: crop,
          mode: "insensitive",
        },
        targetProblem: {
          contains: problem,
          mode: "insensitive",
        },
        shopProducts: {
          some: {
            shop: {
              isVerified: true,
            },
          },
        },
      },
      include: {
        shopProducts: {
          where: {
            shop: {
              isVerified: true,
            },
          },
          include: {
            shop: true,
          },
          orderBy: {
            approximatePrice: "asc",
          },
        },
      },
      orderBy: [
        { brandName: "asc" },
        { productName: "asc" },
      ],
    });

    return {
      success: true,
      message:
        products.length > 0
          ? "Verified agri product recommendations fetched successfully."
          : "No verified product or local shop data is available for this crop problem yet. Use the nearby shop finder or consult a local agriculture officer.",
      data: products.map((product) => ({
        id: product.id,
        brandName: product.brandName,
        productName: product.productName,
        category: product.category,
        crop: product.crop,
        targetProblem: product.targetProblem,
        targetType: product.targetType,
        productPurpose: product.productPurpose,
        activeIngredient: product.activeIngredient,
        formulation: product.formulation,
        dosageNote: product.dosageNote,
        safetyNote: product.safetyNote,
        organic: product.organic,
        isVerified: product.isVerified,
        shops: product.shopProducts.map((item) => ({
          shopProductId: item.id,
          approximatePrice: item.approximatePrice,
          priceUnit: item.priceUnit,
          availabilityStatus: item.availabilityStatus,
          lastVerifiedAt: item.lastVerifiedAt,
          shop: {
            id: item.shop.id,
            name: item.shop.name,
            phone: item.shop.phone,
            address: item.shop.address,
            district: item.shop.district,
            state: item.shop.state,
            latitude: item.shop.latitude,
            longitude: item.shop.longitude,
            isVerified: item.shop.isVerified,
            mapsUrl: `https://www.google.com/maps/search/?api=1&query=${item.shop.latitude},${item.shop.longitude}`,
          },
        })),
      })),
      disclaimer:
        "Only verified product and shop records are shown here. Always confirm label dosage, stock, price, and suitability with a licensed input dealer or agriculture officer before use.",
    };
  }
}

export const agriProductService = new AgriProductService();
export default agriProductService;
