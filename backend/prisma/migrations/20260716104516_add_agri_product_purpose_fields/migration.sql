-- AlterTable
ALTER TABLE "public"."AgriProduct" ADD COLUMN     "productPurpose" TEXT NOT NULL DEFAULT 'Disease management',
ADD COLUMN     "targetType" TEXT NOT NULL DEFAULT 'disease';
