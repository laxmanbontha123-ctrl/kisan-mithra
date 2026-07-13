-- CreateTable
CREATE TABLE "public"."DiseaseScan" (
    "id" UUID NOT NULL,
    "userId" TEXT,
    "imageUrl" TEXT,
    "prediction" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "crop" TEXT,
    "disease" TEXT,
    "severity" TEXT,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiseaseScan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."DiseaseScan" ADD CONSTRAINT "DiseaseScan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
