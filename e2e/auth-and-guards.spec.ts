import { test, expect } from "@playwright/test";
import {
  DEMO_CLIENT,
  DEMO_TRAINER,
  loginApi,
  storageStateFromLogin,
} from "./helpers/api";

test("authentication, session cookie, and role boundaries", async ({
  page,
  browser,
  request,
  baseURL,
}) => {
  const unauth = await request.get("/api/me/bookings");
  expect(unauth.status()).toBe(401);

  const user = await loginApi(request, {
    email: DEMO_CLIENT.email,
    password: DEMO_CLIENT.password,
    role: "client",
  });
  const me = await request.get("/api/me");
  expect(me.ok()).toBeTruthy();
  expect((await me.json()).data.email).toBe(user.email);

  await page.goto("/login?demo=1");
  await page.getByRole("button", { name: /Sign in as Marko/i }).click();
  await expect(page).toHaveURL(/\/me$/);

  const trainerState = await storageStateFromLogin(baseURL!, {
    email: DEMO_TRAINER.email,
    password: DEMO_TRAINER.password,
    role: "trainer",
  });
  const trainerCtx = await browser.newContext({ storageState: trainerState });
  const trainerPage = await trainerCtx.newPage();
  await trainerPage.goto("/me");
  await expect(trainerPage).toHaveURL(/\/dashboard/);
  await trainerCtx.close();

  const clientState = await storageStateFromLogin(baseURL!, {
    email: DEMO_CLIENT.email,
    password: DEMO_CLIENT.password,
    role: "client",
  });
  const clientCtx = await browser.newContext({ storageState: clientState });
  const clientPage = await clientCtx.newPage();
  await clientPage.goto("/dashboard");
  await expect(clientPage).toHaveURL(/\/me/);
  await clientCtx.close();

  await page.context().clearCookies();
  await page.goto("/trainer/login");
  await expect(page.getByLabel("Email")).toBeVisible();
  await page.getByLabel("Email").fill(DEMO_CLIENT.email);
  await page.getByLabel("Password").fill(DEMO_CLIENT.password);
  await page.getByRole("button", { name: /^Sign in$/i }).click();
  await expect(page.getByText(/client account|client sign in/i)).toBeVisible();
});
