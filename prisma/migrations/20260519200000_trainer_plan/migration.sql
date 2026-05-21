-- CreateEnum
CREATE TYPE "TrainerPlan" AS ENUM ('FREE', 'PRO', 'AI_PRO');

-- AlterTable
ALTER TABLE "TrainerProfile" ADD COLUMN "plan" "TrainerPlan" NOT NULL DEFAULT 'FREE';
