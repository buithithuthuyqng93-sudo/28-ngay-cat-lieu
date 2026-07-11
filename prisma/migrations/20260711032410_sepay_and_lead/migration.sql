-- DropIndex
DROP INDEX "Order_payosOrderCode_key";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "checkoutUrl",
DROP COLUMN "paymentLinkId",
DROP COLUMN "payosOrderCode",
DROP COLUMN "qrCode",
ADD COLUMN     "orderCode" TEXT NOT NULL,
ADD COLUMN     "qrImageUrl" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "pharmacyName" TEXT NOT NULL,
    "surveyRole" TEXT NOT NULL,
    "surveyChallenge" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_userId_key" ON "Lead"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderCode_key" ON "Order"("orderCode");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

