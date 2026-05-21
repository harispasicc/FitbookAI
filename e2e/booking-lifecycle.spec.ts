import { test, expect, freshClientApi, freshTrainerApi } from "./fixtures";
import {
  createBooking,
  findBookableSlot,
  findDemoCoachId,
  getPrimaryServiceId,
  patchBooking,
} from "./helpers/api";

test.describe("Booking lifecycle", () => {
  test("client books, coach confirms and completes, client rates in UI", async ({
    clientPage,
    trainerPage,
    baseURL,
  }) => {
    const clientApi = await freshClientApi(baseURL!);
    const trainerApi = await freshTrainerApi(baseURL!);

    try {
      const coachId = await findDemoCoachId(clientApi);
      const serviceId = await getPrimaryServiceId(clientApi, coachId);
      const { slotId } = await findBookableSlot(clientApi, coachId);

      const booking = await createBooking(clientApi, {
        trainerProfileId: coachId,
        serviceId,
        availabilitySlotId: slotId,
        notes: "E2E lifecycle",
      });
      expect(booking.status).toBe("pending");

      await patchBooking(trainerApi, booking.id, { status: "confirmed" });

      await clientPage.goto("/me/sessions");
      await expect(clientPage.getByText(booking.service.title)).toBeVisible();
      await expect(
        clientPage.getByText(/confirmed/i).first(),
      ).toBeVisible();

      await patchBooking(trainerApi, booking.id, { status: "completed" });

      await clientPage.reload();
      await expect(
        clientPage.getByRole("button", { name: "Rate session" }),
      ).toBeVisible();

      await clientPage.getByRole("button", { name: "Rate session" }).click();
      await expect(
        clientPage.getByRole("heading", { name: "Rate your session" }),
      ).toBeVisible();
      await clientPage
        .getByLabel("Comment (optional)")
        .fill("E2E: strong session, would book again.");
      await clientPage.getByRole("button", { name: "Submit review" }).click();
      await expect(
        clientPage.getByRole("button", { name: "Rate session" }),
      ).toHaveCount(0);

      await trainerPage.goto("/calendar");
      await expect(trainerPage.getByText(/completed/i).first()).toBeVisible();
    } finally {
      await clientApi.dispose();
      await trainerApi.dispose();
    }
  });
});
