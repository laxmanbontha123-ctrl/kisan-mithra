-- CreateTable
CREATE TABLE "public"."Crop" (
    "id" TEXT NOT NULL,
    "cropName" TEXT NOT NULL,
    "cropVariety" TEXT NOT NULL,
    "landArea" DOUBLE PRECISION NOT NULL,
    "soilType" TEXT NOT NULL,
    "irrigationMethod" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "sowingDate" TIMESTAMP(3) NOT NULL,
    "expectedHarvestDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Crop_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Crop" ADD CONSTRAINT "Crop_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
