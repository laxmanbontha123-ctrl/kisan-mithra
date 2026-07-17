-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "fullName" SET DEFAULT 'Kisan Mithra Farmer',
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;
