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
        crop: {
          equals: crop,
          mode: "insensitive",
        },
        targetProblem: {
          contains: problem,
          mode: "insensitive",
        },
      },
      include: {
        shopProducts: {
          include: {
            shop: true,
          },
          orderBy: {
            approximatePrice: "asc",
          },
        },
      },
      orderBy: [
        { isVerified: "desc" },
        { brandName: "asc" },
      ],
    });

    return {
      success: true,
      message:
        products.length > 0
          ? "Agri product recommendations fetched successfully."
          : "No verified local agri products found for this crop and problem yet.",
      data: products.map((product) => ({
        id: product.id,
        brandName: product.brandName,
        productName: product.productName,
        category: product.category,
        crop: product.crop,
        targetProblem: product.targetProblem,
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
        "Product names, prices, dosage, and availability must be verified with a licensed local input dealer or agriculture officer before purchase or use.",
    };
  }
}

export const agriProductService = new AgriProductService();
export default agriProductService;
