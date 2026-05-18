CREATE TABLE "TrainerService" (
    "id" TEXT NOT NULL,
    "trainerProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "durationMinutes" INTEGER NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainerService_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TrainerReview" (
    "id" TEXT NOT NULL,
    "trainerProfileId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainerReview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TrainerWeeklyAvailability" (
    "id" TEXT NOT NULL,
    "trainerProfileId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,

    CONSTRAINT "TrainerWeeklyAvailability_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TrainerAvailabilitySlot" (
    "id" TEXT NOT NULL,
    "trainerProfileId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TrainerAvailabilitySlot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TrainerService_trainerProfileId_isActive_sortOrder_idx" ON "TrainerService"("trainerProfileId", "isActive", "sortOrder");

CREATE INDEX "TrainerReview_trainerProfileId_createdAt_idx" ON "TrainerReview"("trainerProfileId", "createdAt");

CREATE INDEX "TrainerWeeklyAvailability_trainerProfileId_dayOfWeek_idx" ON "TrainerWeeklyAvailability"("trainerProfileId", "dayOfWeek");

CREATE INDEX "TrainerAvailabilitySlot_trainerProfileId_startsAt_idx" ON "TrainerAvailabilitySlot"("trainerProfileId", "startsAt");

ALTER TABLE "TrainerService" ADD CONSTRAINT "TrainerService_trainerProfileId_fkey" FOREIGN KEY ("trainerProfileId") REFERENCES "TrainerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TrainerReview" ADD CONSTRAINT "TrainerReview_trainerProfileId_fkey" FOREIGN KEY ("trainerProfileId") REFERENCES "TrainerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TrainerWeeklyAvailability" ADD CONSTRAINT "TrainerWeeklyAvailability_trainerProfileId_fkey" FOREIGN KEY ("trainerProfileId") REFERENCES "TrainerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TrainerAvailabilitySlot" ADD CONSTRAINT "TrainerAvailabilitySlot_trainerProfileId_fkey" FOREIGN KEY ("trainerProfileId") REFERENCES "TrainerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
