import { test, expect } from "./fixtures/test";
import { uniqueName } from "./fixtures/testData";

test.describe("project page", () => {
  test("redirects an unauthenticated visitor to /login", async ({ page, projectPage }) => {
    await projectPage.goto("anything");
    await page.waitForURL("**/login");
  });

  test("clicking a project in the list opens it", async ({ page, testData, loginAs, projectsPage, projectPage }) => {
    const builder = await testData.createUser({ role: "BUILDER" });
    const kitchen = await testData.createProject({ members: [builder] });
    await testData.createProject({ members: [builder] });

    await loginAs(builder);
    await projectsPage.goto();
    await projectsPage.waitUntilLoaded();
    await projectsPage.link(kitchen.name).click();

    await page.waitForURL(`**/projects/${kitchen.id}`);
    await projectPage.waitUntilLoaded(kitchen.name);
    await expect(projectPage.allProjectsLink).toBeVisible();
  });

  test("a user on one project is taken straight to it", async ({ page, testData, loginAs, projectsPage, projectPage }) => {
    const client = await testData.createUser({ role: "CLIENT" });
    const project = await testData.createProject({ members: [client] });

    await loginAs(client);
    await projectsPage.goto();

    await page.waitForURL(`**/projects/${project.id}`);
    await projectPage.waitUntilLoaded(project.name);
    // "All projects" would only bounce them back here
    await expect(projectPage.allProjectsLink).toHaveCount(0);
  });

  test("has Overview, Documents, Photos and People tabs, opening on Overview", async ({
    testData,
    loginAs,
    projectPage,
  }) => {
    const client = await testData.createUser({ role: "CLIENT" });
    const project = await testData.createProject({ members: [client] });

    await loginAs(client);
    await projectPage.goto(project.id);
    await projectPage.waitUntilLoaded(project.name);

    for (const name of ["Overview", "Documents", "Photos", "People"]) {
      await expect(projectPage.tab(name)).toBeVisible();
    }
    await expect(projectPage.tab("Overview")).toHaveAttribute("aria-selected", "true");

    await projectPage.openTab("Photos");
    await expect(projectPage.tab("Photos")).toHaveAttribute("aria-selected", "true");
    await expect(projectPage.tab("Overview")).toHaveAttribute("aria-selected", "false");
  });

  test("shows only this project's documents", async ({ testData, loginAs, projectPage }) => {
    const admin = await testData.createUser({ role: "ADMIN" });
    const thisFile = `${uniqueName("this")}.pdf`;
    const otherFile = `${uniqueName("other")}.pdf`;
    const project = await testData.createProject({ documents: [thisFile], uploadedBy: admin });
    await testData.createProject({ documents: [otherFile], uploadedBy: admin });

    await loginAs(admin);
    await projectPage.goto(project.id);
    await projectPage.waitUntilLoaded(project.name);

    await projectPage.openTab("Documents");
    await expect(projectPage.rows).toHaveCount(1);
    await expect(projectPage.row(thisFile)).toBeVisible();
    await expect(projectPage.row(otherFile)).toHaveCount(0);
  });

  test("a non-member can't see a project", async ({
    testData,
    loginAs,
    projectPage,
  }) => {
    const outsider = await testData.createUser({ role: "CLIENT" });
    const project = await testData.createProject();

    await loginAs(outsider);

    await projectPage.goto(project.id);
    await expect(projectPage.errorAlert).toHaveText("Project not found");

    expect((await projectPage.getViaApi(project.id)).status()).toBe(404);
  });
});
