-- CreateTable
CREATE TABLE "public"."AuthOtp" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthOtp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuthOtp_identifier_type_idx" ON "public"."AuthOtp"("identifier", "type");

-- CreateIndex
CREATE INDEX "AuthOtp_expiresAt_idx" ON "public"."AuthOtp"("expiresAt");
