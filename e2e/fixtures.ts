import { test as base, type BrowserContext, type Page } from "@playwright/test";
import {
  createApiContext,
  DEMO_CLIENT,
  DEMO_TRAINER,
  loginApi,
  storageStateFromLogin,
} from "./helpers/api";

type RoleFixtures = {
  clientContext: BrowserContext;
  trainerContext: BrowserContext;
  clientPage: Page;
  trainerPage: Page;
};

export const test = base.extend<RoleFixtures>({
  clientContext: async ({ browser, baseURL }, use) => {
    const state = await storageStateFromLogin(baseURL!, {
      email: DEMO_CLIENT.email,
      password: DEMO_CLIENT.password,
      role: "client",
    });
    const context = await browser.newContext({ storageState: state });
    await use(context);
    await context.close();
  },
  trainerContext: async ({ browser, baseURL }, use) => {
    const state = await storageStateFromLogin(baseURL!, {
      email: DEMO_TRAINER.email,
      password: DEMO_TRAINER.password,
      role: "trainer",
    });
    const context = await browser.newContext({ storageState: state });
    await use(context);
    await context.close();
  },
  clientPage: async ({ clientContext }, use) => {
    const page = await clientContext.newPage();
    await use(page);
    await page.close();
  },
  trainerPage: async ({ trainerContext }, use) => {
    const page = await trainerContext.newPage();
    await use(page);
    await page.close();
  },
});

export { expect } from "@playwright/test";

export async function freshClientApi(baseURL: string) {
  const ctx = await createApiContext(baseURL);
  await loginApi(ctx, {
    email: DEMO_CLIENT.email,
    password: DEMO_CLIENT.password,
    role: "client",
  });
  return ctx;
}

export async function freshTrainerApi(baseURL: string) {
  const ctx = await createApiContext(baseURL);
  await loginApi(ctx, {
    email: DEMO_TRAINER.email,
    password: DEMO_TRAINER.password,
    role: "trainer",
  });
  return ctx;
}
