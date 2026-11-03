import { test as base, expect } from "@playwright/test";
import { execSync } from "node:child_process";
import { LoginPage } from "../poms/LoginPage";
import { ChangePasswordPage } from "../poms/ChangePasswordPage";
import { HomePage } from "../poms/HomePage";

// This suite runs against a persistent dev database (the real one behind
// docker compose), not a throwaway one per run. It never touches the seeded
// ADMIN account below or its sessions — only throwaway e2e-* users it creates
// and cleans up itself via `deleteTestUser`.
export const ADMIN_EMAIL = "test@gmail.com";
export const ADMIN_PASSWORD = "password";

type Fixtures = {
  loginPage: LoginPage;
  changePasswordPage: ChangePasswordPage;
  homePage: HomePage;
  loginAsAdmin: () => Promise<void>;
  deleteTestUser: (email: string) => void;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  changePasswordPage: async ({ page }, use) => {
    await use(new ChangePasswordPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  loginAsAdmin: async ({ page }, use) => {
    await use(async () => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      await page.waitForURL("/");
    });
  },
  deleteTestUser: async ({}, use) => {
    await use((email: string) => {
      execSync(
        `npx prisma db execute --stdin <<'EOF'\nDELETE FROM "User" WHERE email = '${email}';\nEOF`,
        { shell: "/bin/bash", stdio: "ignore" },
      );
    });
  },
});

export { expect };
