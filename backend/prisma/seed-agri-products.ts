import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const demoShopNames = ["Demo Khammam Agri Inputs", "Demo Hyderabad Farmer Mart"];
  const demoProductNames = [
    "Copper-based Bacterial Blight Support",
    "Rice Blast Fungicide Category",
    "Rice Brown Spot Fungicide Category",
    "Tungro Vector Management Category",
    "Rice Crop Stress Nutrition Support",
  ];

  await prisma.agriProduct.deleteMany({
    where: { productName: { in: demoProductNames } },
  });

  await prisma.agriShop.deleteMany({
    where: { name: { in: demoShopNames } },
  });

  const khammamShop = await prisma.agriShop.create({
    data: {
      name: "Demo Khammam Agri Inputs",
      phone: "Verify locally",
      address: "Khammam, Telangana - demo shop data",
      district: "Khammam",
      state: "Telangana",
      latitude: 17.2473,
      longitude: 80.1514,
      isVerified: false,
    },
  });

  const hyderabadShop = await prisma.agriShop.create({
    data: {
      name: "Demo Hyderabad Farmer Mart",
      phone: "Verify locally",
      address: "Hyderabad, Telangana - demo shop data",
      district: "Hyderabad",
      state: "Telangana",
      latitude: 17.3850,
      longitude: 78.4867,
      isVerified: false,
    },
  });

  const products = await Promise.all([
    prisma.agriProduct.create({
      data: {
        brandName: "DemoAgri",
        productName: "Copper-based Bacterial Blight Support",
        category: "bactericide / disease management",
        crop: "Rice",
        targetProblem: "Bacterial blight",
        targetType: "disease",
        productPurpose: "Bacterial disease management support",
        activeIngredient: "Copper-based crop protection category",
        formulation: "Use only label-approved formulation",
        dosageNote: "Do not use AI dosage directly. Follow product label and local agriculture officer guidance.",
        safetyNote: "Wear PPE. Avoid spraying during wind, rain, or extreme heat. Verify label before use.",
        organic: false,
        isVerified: false,
      },
    }),

    prisma.agriProduct.create({
      data: {
        brandName: "DemoAgri",
        productName: "Rice Blast Fungicide Category",
        category: "fungicide",
        crop: "Rice",
        targetProblem: "Blast",
        targetType: "disease",
        productPurpose: "Fungal disease management support",
        activeIngredient: "Rice blast fungicide category",
        formulation: "Use only registered crop-specific formulation",
        dosageNote: "Use only as per product label for rice blast and land area.",
        safetyNote: "Confirm diagnosis before chemical use. Wear mask, gloves, and eye protection.",
        organic: false,
        isVerified: false,
      },
    }),

    prisma.agriProduct.create({
      data: {
        brandName: "DemoAgri",
        productName: "Rice Brown Spot Fungicide Category",
        category: "fungicide",
        crop: "Rice",
        targetProblem: "Brown spot",
        targetType: "disease",
        productPurpose: "Leaf spot disease management support",
        activeIngredient: "Brown spot disease-management category",
        formulation: "Use only registered crop-specific formulation",
        dosageNote: "Follow product label exactly. Confirm with agriculture officer for your district.",
        safetyNote: "Avoid unnecessary spraying. Follow waiting period and re-entry instructions.",
        organic: false,
        isVerified: false,
      },
    }),

    prisma.agriProduct.create({
      data: {
        brandName: "DemoAgri",
        productName: "Tungro Vector Management Category",
        category: "pest / vector management",
        crop: "Rice",
        targetProblem: "Tungro",
        targetType: "pest / vector",
        productPurpose: "Leafhopper vector monitoring and management support",
        activeIngredient: "Leafhopper vector management category",
        formulation: "Use only if vector pressure is confirmed",
        dosageNote: "Tungro is viral; chemical products do not cure infected plants. Follow expert advice.",
        safetyNote: "Remove severely infected plants when advised and manage vectors safely.",
        organic: false,
        isVerified: false,
      },
    }),

    prisma.agriProduct.create({
      data: {
        brandName: "DemoAgri",
        productName: "Rice Crop Stress Nutrition Support",
        category: "fertilizer / nutrition support",
        crop: "Rice",
        targetProblem: "Bacterial blight",
        targetType: "nutrition",
        productPurpose: "Crop stress nutrition support, not disease cure",
        activeIngredient: "Balanced nutrition support category",
        formulation: "Use soil-test-based fertilizer plan",
        dosageNote: "Fertilizer does not directly cure disease. Use only based on soil test and crop stage.",
        safetyNote: "Avoid excess nitrogen because it can increase disease risk in some conditions.",
        organic: false,
        isVerified: false,
      },
    }),
  ]);

  const shops = [khammamShop, hyderabadShop];

  for (const product of products) {
    for (const shop of shops) {
      await prisma.agriShopProduct.create({
        data: {
          shopId: shop.id,
          productId: product.id,
          approximatePrice: null,
          priceUnit: "Verify at shop",
          availabilityStatus: "unknown",
          lastVerifiedAt: null,
        },
      });
    }
  }

  console.log("Demo agri shops and products seeded successfully with target type and purpose.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
