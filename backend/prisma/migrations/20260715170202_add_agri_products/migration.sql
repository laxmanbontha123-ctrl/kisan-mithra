-- CreateTable
CREATE TABLE "public"."AgriShop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgriShop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgriProduct" (
    "id" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "crop" TEXT NOT NULL,
    "targetProblem" TEXT NOT NULL,
    "activeIngredient" TEXT,
    "formulation" TEXT,
    "dosageNote" TEXT NOT NULL,
    "safetyNote" TEXT NOT NULL,
    "organic" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgriProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgriShopProduct" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "approximatePrice" DOUBLE PRECISION,
    "priceUnit" TEXT,
    "availabilityStatus" TEXT NOT NULL DEFAULT 'unknown',
    "lastVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgriShopProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgriShop_district_state_idx" ON "public"."AgriShop"("district", "state");

-- CreateIndex
CREATE INDEX "AgriProduct_crop_targetProblem_idx" ON "public"."AgriProduct"("crop", "targetProblem");

-- CreateIndex
CREATE INDEX "AgriProduct_category_idx" ON "public"."AgriProduct"("category");

-- CreateIndex
CREATE INDEX "AgriShopProduct_shopId_idx" ON "public"."AgriShopProduct"("shopId");

-- CreateIndex
CREATE INDEX "AgriShopProduct_productId_idx" ON "public"."AgriShopProduct"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "AgriShopProduct_shopId_productId_key" ON "public"."AgriShopProduct"("shopId", "productId");

-- AddForeignKey
ALTER TABLE "public"."AgriShopProduct" ADD CONSTRAINT "AgriShopProduct_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."AgriShop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgriShopProduct" ADD CONSTRAINT "AgriShopProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."AgriProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
