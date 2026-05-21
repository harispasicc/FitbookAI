import { test, expect } from "@playwright/test";
import {
  cancelBooking,
  createApiContext,
  createBooking,
  expectBookingPostConflict,
  findBookableSlot,
  findDemoCoachId,
  getPrimaryServiceId,
  loginApi,
  DEMO_CLIENT,
} from "./helpers/api";

test("cannot double-book the same availability slot", async ({ baseURL }) => {
  const client = await createApiContext(baseURL!);
  await loginApi(client, {
    email: DEMO_CLIENT.email,
    password: DEMO_CLIENT.password,
    role: "client",
  });

  try {
    const coachId = await findDemoCoachId(client);
    const serviceId = await getPrimaryServiceId(client, coachId);
    const { slotId } = await findBookableSlot(client, coachId);

    const booking = await createBooking(client, {
      trainerProfileId: coachId,
      serviceId,
      availabilitySlotId: slotId,
    });
    expect(booking.status).toBe("pending");

    await expectBookingPostConflict(client, {
      trainerProfileId: coachId,
      serviceId,
      availabilitySlotId: slotId,
    });

    const cancelled = await cancelBooking(client, booking.id);
    expect(cancelled.status).toBe("cancelled");
  } finally {
    await client.dispose();
  }
});
