-- Link availability slots to a specific service (optional for legacy seed rows).
ALTER TABLE "TrainerAvailabilitySlot" ADD COLUMN "serviceId" TEXT;

ALTER TABLE "TrainerAvailabilitySlot" ADD CONSTRAINT "TrainerAvailabilitySlot_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "TrainerService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "TrainerAvailabilitySlot_serviceId_startsAt_idx" ON "TrainerAvailabilitySlot"("serviceId", "startsAt");
