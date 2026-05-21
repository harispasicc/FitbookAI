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
      const sessionWhen = new Date(booking.startsAt).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
      const sessionRow = clientPage
        .getByRole("row")
        .filter({ hasText: booking.service.title })
        .filter({ hasText: sessionWhen });
      await expect(sessionRow).toHaveCount(1);
      await expect(sessionRow).toContainText(/confirmed/i);

      await patchBooking(trainerApi, booking.id, { status: "completed" });

      await clientPage.reload();
      await expect(sessionRow).toContainText(/completed/i);
      const rateButton = sessionRow.getByRole("button", { name: "Rate session" });
      await expect(rateButton).toBeVisible();

      await rateButton.click();
      await expect(
        clientPage.getByRole("heading", { name: "Rate your session" }),
      ).toBeVisible();
      await clientPage
        .getByLabel("Comment (optional)")
        .fill("E2E: strong session, would book again.");
      await clientPage.getByRole("button", { name: "Submit review" }).click();
      await expect(rateButton).toHaveCount(0);

      await trainerPage.goto("/calendar");
      await expect(trainerPage.getByText(/completed/i).first()).toBeVisible();
    } finally {
      await clientApi.dispose();
      await trainerApi.dispose();
    }
  });
});
