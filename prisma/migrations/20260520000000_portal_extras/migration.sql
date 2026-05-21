-- Trainer CRM notes, notification read state, email prefs JSON
CREATE TABLE "TrainerClientNote" (
    "id" TEXT NOT NULL,
    "trainerProfileId" TEXT NOT NULL,
    "clientUserId" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainerClientNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TrainerNotificationRead" (
    "id" TEXT NOT NULL,
    "trainerUserId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainerNotificationRead_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "TrainerProfile" ADD COLUMN "notificationPrefs" JSONB;

CREATE UNIQUE INDEX "TrainerClientNote_trainerProfileId_clientUserId_key" ON "TrainerClientNote"("trainerProfileId", "clientUserId");
CREATE INDEX "TrainerClientNote_trainerProfileId_idx" ON "TrainerClientNote"("trainerProfileId");

CREATE UNIQUE INDEX "TrainerNotificationRead_trainerUserId_notificationId_key" ON "TrainerNotificationRead"("trainerUserId", "notificationId");
CREATE INDEX "TrainerNotificationRead_trainerUserId_idx" ON "TrainerNotificationRead"("trainerUserId");

ALTER TABLE "TrainerClientNote" ADD CONSTRAINT "TrainerClientNote_trainerProfileId_fkey" FOREIGN KEY ("trainerProfileId") REFERENCES "TrainerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TrainerNotificationRead" ADD CONSTRAINT "TrainerNotificationRead_trainerUserId_fkey" FOREIGN KEY ("trainerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
