CREATE TYPE "ClientGoalKey" AS ENUM ('LOSE', 'MUSCLE', 'CONDITIONING', 'REHAB');
CREATE TYPE "NotificationTone" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'NEUTRAL');

ALTER TABLE "ClientProfile" ADD COLUMN "headline" TEXT;
ALTER TABLE "ClientProfile" ADD COLUMN "phone" TEXT;
ALTER TABLE "ClientProfile" ADD COLUMN "city" TEXT;
ALTER TABLE "ClientProfile" ADD COLUMN "timezone" TEXT DEFAULT 'Europe/Sarajevo';
ALTER TABLE "ClientProfile" ADD COLUMN "bio" TEXT;
ALTER TABLE "ClientProfile" ADD COLUMN "selectedTrainerProfileId" TEXT;

CREATE TABLE "ClientGoals" (
    "id" TEXT NOT NULL,
    "clientProfileId" TEXT NOT NULL,
    "activeGoal" "ClientGoalKey" NOT NULL DEFAULT 'CONDITIONING',
    "pctLose" INTEGER NOT NULL DEFAULT 34,
    "pctMuscle" INTEGER NOT NULL DEFAULT 52,
    "pctConditioning" INTEGER NOT NULL DEFAULT 68,
    "pctRehab" INTEGER NOT NULL DEFAULT 41,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientGoals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClientWorkout" (
    "id" TEXT NOT NULL,
    "clientProfileId" TEXT NOT NULL,
    "workoutDate" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "calories" INTEGER NOT NULL,
    "trainerNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientWorkout_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClientNotification" (
    "id" TEXT NOT NULL,
    "clientProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tone" "NotificationTone" NOT NULL DEFAULT 'INFO',
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientNotification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClientGoals_clientProfileId_key" ON "ClientGoals"("clientProfileId");
CREATE INDEX "ClientWorkout_clientProfileId_workoutDate_idx" ON "ClientWorkout"("clientProfileId", "workoutDate");
CREATE INDEX "ClientNotification_clientProfileId_createdAt_idx" ON "ClientNotification"("clientProfileId", "createdAt");

ALTER TABLE "ClientProfile" ADD CONSTRAINT "ClientProfile_selectedTrainerProfileId_fkey" FOREIGN KEY ("selectedTrainerProfileId") REFERENCES "TrainerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ClientGoals" ADD CONSTRAINT "ClientGoals_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientWorkout" ADD CONSTRAINT "ClientWorkout_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClientNotification" ADD CONSTRAINT "ClientNotification_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
