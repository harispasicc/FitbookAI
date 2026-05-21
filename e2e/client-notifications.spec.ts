import { test, expect, freshClientApi } from "./fixtures";
import {
  listNotifications,
  markNotificationRead,
} from "./helpers/api";

test.describe("Client notifications", () => {
  test("seeded notifications are listed and mark-read persists", async ({
    clientPage,
    baseURL,
  }) => {
    const api = await freshClientApi(baseURL!);

    try {
      const notifications = await listNotifications(api);
      expect(notifications.length).toBeGreaterThan(0);

      const unread = notifications.find((n) => !n.read);
      test.skip(!unread, "all notifications already read in this environment");

      await markNotificationRead(api, unread!.id);

      const afterApi = await listNotifications(api);
      const updated = afterApi.find((n) => n.id === unread!.id);
      expect(updated?.read).toBe(true);

      await clientPage.goto("/me");
      await clientPage
        .getByRole("button", { name: /Notifications/i })
        .click();
      await expect(clientPage.getByText(unread!.title).first()).toBeVisible();
    } finally {
      await api.dispose();
    }
  });
});
