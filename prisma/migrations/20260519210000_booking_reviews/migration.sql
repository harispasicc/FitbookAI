-- AlterTable
ALTER TABLE "TrainerReview" ADD COLUMN "clientUserId" TEXT,
ADD COLUMN "bookingId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TrainerReview_bookingId_key" ON "TrainerReview"("bookingId");

-- CreateIndex
CREATE INDEX "TrainerReview_clientUserId_idx" ON "TrainerReview"("clientUserId");

-- AddForeignKey
ALTER TABLE "TrainerReview" ADD CONSTRAINT "TrainerReview_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerReview" ADD CONSTRAINT "TrainerReview_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
