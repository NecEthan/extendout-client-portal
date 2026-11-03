import { test, expect, ADMIN_EMAIL, ADMIN_PASSWORD } from "./fixtures/test";

test.describe("auth", () => {
  test("redirects an unauthenticated visitor to /login", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL("**/login");
  });

  test("bootstrap endpoint refuses once a user already exists", async ({ request }) => {
    const res = await request.post("/api/admin/bootstrap", {
      data: { email: "should-not-be-created@test.com", name: "X", password: "whatever123" },
    });
    expect(res.status()).toBe(403);
  });

  test("admin can log in and reach the dashboard", async ({ loginPage, homePage }) => {
    await loginPage.goto();
    await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
    await homePage.waitUntilLoaded();
    await expect(homePage.roleText("ADMIN")).toBeVisible();
  });

  test("rejects a wrong password", async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(ADMIN_EMAIL, "definitely-wrong");
    await expect(loginPage.errorAlert).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("admin-created user is forced through change-password on first login, then logs out", async ({
    page,
    loginPage,
    changePasswordPage,
    homePage,
    loginAsAdmin,
    deleteTestUser,
  }) => {
    const email = `e2e-client-${Date.now()}@test.com`;

    try {
      await loginAsAdmin();

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
    } finally {
      deleteTestUser(email);
    }
  });
});
