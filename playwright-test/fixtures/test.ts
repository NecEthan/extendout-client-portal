import { test as base, expect } from "@playwright/test";
import { LoginPage } from "../poms/LoginPage";
import { ChangePasswordPage } from "../poms/ChangePasswordPage";
import { HomePage } from "../poms/HomePage";
import { ProjectsPage } from "../poms/ProjectsPage";
import { ProjectPage } from "../poms/ProjectPage";
import { TestData, type TestUser } from "./testData";

// This suite runs against the persistent dev database (the one behind docker compose)
// but doesn't depend on what's in it: every test creates its own e2e-* users/projects
// through `testData`, which deletes them again when the test finishes.

type Fixtures = {
  loginPage: LoginPage;
  changePasswordPage: ChangePasswordPage;
  homePage: HomePage;
  projectsPage: ProjectsPage;
  projectPage: ProjectPage;
  testData: TestData;
  loginAs: (user: TestUser) => Promise<void>;
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
  projectsPage: async ({ page }, use) => {
    await use(new ProjectsPage(page));
  },
  projectPage: async ({ page }, use) => {
    await use(new ProjectPage(page));
  },
  testData: async ({}, use) => {
    const testData = new TestData();
    try {
      await use(testData);
    } finally {
      await testData.cleanup();
    }
  },
  loginAs: async ({ page }, use) => {
    await use(async (user: TestUser) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(user.email, user.password);
      await page.waitForURL("/");
    });
  },
});

export { expect };
