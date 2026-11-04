import { test, expect } from "./fixtures/test";
import { uniqueName } from "./fixtures/testData";

test.describe("auth", () => {
  test("redirects an unauthenticated visitor to /login", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL("**/login");
  });

  test("an admin can create as many admins as they like", async ({ page, testData, loginAs }) => {
    const admin = await testData.createUser({ role: "ADMIN" });
    await loginAs(admin);

    for (let i = 0; i < 2; i++) {
      const email = `${uniqueName("admin")}@test.com`;
      testData.trackUserEmail(email);

      const res = await page.request.post("/api/admin/create-admin", {
        data: { email, name: "E2E Extra Admin", password: "whatever123" },
      });
      expect(res.status()).toBe(201);
    }
  });

  test("admin can log in and reach the dashboard", async ({ testData, loginPage, homePage }) => {
    const admin = await testData.createUser({ role: "ADMIN" });

    await loginPage.goto();
    await loginPage.login(admin.email, admin.password);
    await homePage.waitUntilLoaded();
    await expect(homePage.roleText("ADMIN")).toBeVisible();
  });

  test("a user with a temporary password can't skip change-password by visiting other pages", async ({
    page,
    testData,
    loginPage,
    projectsPage,
  }) => {
    const user = await testData.createUser({ role: "CLIENT", requirePasswordChange: true });

    await loginPage.goto();
    await loginPage.login(user.email, user.password);
    await page.waitForURL("**/change-password");

    await projectsPage.goto();
    await page.waitForURL("**/change-password");
  });

  test("rejects a wrong password", async ({ page, testData, loginPage }) => {
    const admin = await testData.createUser({ role: "ADMIN" });

    await loginPage.goto();
    await loginPage.login(admin.email, "definitely-wrong");
    await expect(loginPage.errorAlert).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("admin-created user is forced through change-password on first login, then logs out", async ({
    page,
    testData,
    loginAs,
    loginPage,
    changePasswordPage,
    homePage,
  }) => {
    const admin = await testData.createUser({ role: "ADMIN" });
    const email = `${uniqueName("client")}@test.com`;
    testData.trackUserEmail(email); // created through the API below, not testData

    await loginAs(admin);

    const createRes = await homePage.createUser({
      email,
      name: "E2E Client",
      role: "CLIENT",
      password: "temp12345",
    });
    expect(createRes.status()).toBe(201);

    // log out of admin, log in as the new client
    await page.context().clearCookies();
    await loginPage.goto();
    await loginPage.login(email, "temp12345");

    // forced to change-password before reaching the dashboard
    await page.waitForURL("**/change-password");
    await changePasswordPage.changePassword("temp12345", "newrealpass123");

    // lands on the dashboard afterwards, as CLIENT
    await homePage.waitUntilLoaded();
    await expect(homePage.roleText("CLIENT")).toBeVisible();

    // log back in with the new password to confirm it actually stuck
    await page.context().clearCookies();
    await loginPage.goto();
    await loginPage.login(email, "newrealpass123");
    await homePage.waitUntilLoaded();

    // logging out sends you back to /login, and / is gated again
    await homePage.logout();
    await page.waitForURL("**/login");
    await page.goto("/");
    await page.waitForURL("**/login");
  });
});
