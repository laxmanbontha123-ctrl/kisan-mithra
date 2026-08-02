import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const demoShopNames = [
  "Demo Khammam Agri Inputs",
  "Demo Hyderabad Farmer Mart",
];

const demoProductNames = [
  "Copper-based Bacterial Blight Support",
  "Rice Blast Fungicide Category",
  "Rice Brown Spot Fungicide Category",
  "Tungro Vector Management Category",
  "Rice Crop Stress Nutrition Support",
];

async function main() {
  const demoProducts = await prisma.agriProduct.findMany({
    where: {
      productName: {
        in: demoProductNames,
      },
    },
    select: {
      id: true,
    },
  });

  const demoShops = await prisma.agriShop.findMany({
    where: {
      name: {
        in: demoShopNames,
      },
    },
    select: {
      id: true,
    },
  });

  const productIds = demoProducts.map((product) => product.id);
  const shopIds = demoShops.map((shop) => shop.id);

  const result = await prisma.$transaction(async (database) => {
    const deletedLinks = await database.agriShopProduct.deleteMany({
      where: {
        OR: [
          {
            productId: {
              in: productIds,
            },
          },
          {
            shopId: {
              in: shopIds,
            },
          },
        ],
      },
    });

    const deletedProducts = await database.agriProduct.deleteMany({
      where: {
        productName: {
          in: demoProductNames,
        },
      },
    });

    const deletedShops = await database.agriShop.deleteMany({
      where: {
        name: {
          in: demoShopNames,
        },
      },
    });

    return {
      links: deletedLinks.count,
      products: deletedProducts.count,
      shops: deletedShops.count,
    };
  });

  console.log("Demo agriculture data cleanup completed.");
  console.log(`Deleted shop-product links: ${result.links}`);
  console.log(`Deleted demo products: ${result.products}`);
  console.log(`Deleted demo shops: ${result.shops}`);
}

main()
  .catch((error) => {
    console.error("Demo agriculture data cleanup failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
