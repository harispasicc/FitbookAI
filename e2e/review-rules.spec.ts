import { test, expect } from "@playwright/test";
import {
  createApiContext,
  createBooking,
  expectReviewConflict,
  findBookableSlot,
  findDemoCoachId,
  getPrimaryServiceId,
  loginApi,
  patchBooking,
  submitReview,
  DEMO_CLIENT,
  DEMO_TRAINER,
} from "./helpers/api";

test.describe("Review business rules", () => {
  test("review allowed only after completed; duplicate review is rejected", async ({
    baseURL,
  }) => {
    const client = await createApiContext(baseURL!);
    const trainer = await createApiContext(baseURL!);

    await loginApi(client, {
      email: DEMO_CLIENT.email,
      password: DEMO_CLIENT.password,
      role: "client",
    });
    await loginApi(trainer, {
      email: DEMO_TRAINER.email,
      password: DEMO_TRAINER.password,
      role: "trainer",
    });

    try {
      const coachId = await findDemoCoachId(client);
      const serviceId = await getPrimaryServiceId(client, coachId);
      const { slotId } = await findBookableSlot(client, coachId);

      const pending = await createBooking(client, {
        trainerProfileId: coachId,
        serviceId,
        availabilitySlotId: slotId,
      });

      const reviewWhilePending = await client.post(
        `/api/me/bookings/${pending.id}/review`,
        { data: { rating: 5 } },
      );
      expect(reviewWhilePending.status()).toBe(422);

      await patchBooking(trainer, pending.id, { status: "confirmed" });
      await patchBooking(trainer, pending.id, { status: "completed" });

      await submitReview(client, pending.id, 5, "E2E review");
      await expectReviewConflict(client, pending.id);
    } finally {
      await client.dispose();
      await trainer.dispose();
    }
  });
});
