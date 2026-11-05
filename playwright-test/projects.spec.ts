import { test, expect } from "./fixtures/test";
import { uniqueName } from "./fixtures/testData";

test.describe("projects page", () => {
  test("redirects an unauthenticated visitor to /login", async ({ page, projectsPage }) => {
    await projectsPage.goto();
    await page.waitForURL("**/login");
  });

  test("admin sees every project, including ones they aren't a member of", async ({
    testData,
    loginAs,
    projectsPage,
  }) => {
    const admin = await testData.createUser({ role: "ADMIN" });
    const client = await testData.createUser({ role: "CLIENT" });
    const withMember = await testData.createProject({ members: [client] });
    const withoutMembers = await testData.createProject();

    await loginAs(admin);
    await projectsPage.goto();
    await projectsPage.waitUntilLoaded();

    await expect(projectsPage.card(withMember.name)).toBeVisible();
    await expect(projectsPage.card(withoutMembers.name)).toBeVisible();
  });

  test("shows the document count for each project", async ({ testData, loginAs, projectsPage }) => {
    const admin = await testData.createUser({ role: "ADMIN" });
    const threeDocs = await testData.createProject({
      documents: ["a.pdf", "b.pdf", "c.pdf"],
      uploadedBy: admin,
    });
    const oneDoc = await testData.createProject({ documents: ["a.pdf"], uploadedBy: admin });
    const noDocs = await testData.createProject();

    await loginAs(admin);
    await projectsPage.goto();
    await projectsPage.waitUntilLoaded();

    await expect(projectsPage.documentCount(threeDocs.name)).toHaveText("3 documents");
    await expect(projectsPage.documentCount(oneDoc.name)).toHaveText("1 document");
    await expect(projectsPage.documentCount(noDocs.name)).toHaveText("0 documents");
  });

  test("clients and builders only see projects they're a member of", async ({
    page,
    testData,
    loginAs,
    projectsPage,
  }) => {
    const clientA = await testData.createUser({ role: "CLIENT" });
    const clientB = await testData.createUser({ role: "CLIENT" });
    const builder = await testData.createUser({ role: "BUILDER" });

    const kitchen = await testData.createProject({ members: [clientA, builder] });
    const garage = await testData.createProject({ members: [clientA] });
    const loft = await testData.createProject({ members: [clientB, builder] });
    // everyone needs 2+ projects, otherwise /projects redirects them into their only one
    const bathroom = await testData.createProject({ members: [clientB] });

    const cases = [
      { user: clientA, sees: [kitchen, garage], hidden: [loft, bathroom] },
      { user: clientB, sees: [loft, bathroom], hidden: [kitchen, garage] },
      { user: builder, sees: [kitchen, loft], hidden: [garage, bathroom] },
    ];

    for (const { user, sees, hidden } of cases) {
      await test.step(`${user.role} ${user.email}`, async () => {
        await page.context().clearCookies();
        await loginAs(user);
        await projectsPage.goto();
        await projectsPage.waitUntilLoaded();

        await expect(projectsPage.cards).toHaveCount(sees.length);
        for (const project of sees) {
          await expect(projectsPage.card(project.name)).toBeVisible();
        }
        for (const project of hidden) {
          await expect(projectsPage.card(project.name)).toHaveCount(0);
        }
      });
    }
  });

  test("shows an empty state for a user with no projects", async ({ testData, loginAs, projectsPage }) => {
    const client = await testData.createUser({ role: "CLIENT" });

    await loginAs(client);
    await projectsPage.goto();
    await projectsPage.waitUntilLoaded();

    await expect(projectsPage.emptyState).toBeVisible();
    await expect(projectsPage.cards).toHaveCount(0);
  });

  test("non-admin can't create a project", async ({ testData, loginAs, projectsPage }) => {
    const client = await testData.createUser({ role: "CLIENT" });

    await loginAs(client);
    const res = await projectsPage.createProject(uniqueName("project"));
    expect(res.status()).toBe(403);
  });

  test("admin-created project shows for admin but not for non-members", async ({
    page,
    testData,
    loginAs,
    projectsPage,
  }) => {
    const admin = await testData.createUser({ role: "ADMIN" });
    const client = await testData.createUser({ role: "CLIENT" });
    const clientsProject = await testData.createProject({ members: [client] });
    const name = uniqueName("project");

    await loginAs(admin);
    const res = await projectsPage.createProject(name);
    expect(res.status()).toBe(201);
    testData.trackProject((await res.json()).id);

    await projectsPage.goto();
    await projectsPage.waitUntilLoaded();
    await expect(projectsPage.card(name)).toBeVisible();
    await expect(projectsPage.documentCount(name)).toHaveText("0 documents");

    // nobody is a member of the new project, so the client still only has their one
    // project, and /projects takes them straight into it
    await page.context().clearCookies();
    await loginAs(client);
    await projectsPage.goto();
    await page.waitForURL(`**/projects/${clientsProject.id}`);
  });

  test("rejects creating a project without a name", async ({ testData, loginAs, projectsPage }) => {
    const admin = await testData.createUser({ role: "ADMIN" });

    await loginAs(admin);
    const res = await projectsPage.createProject("   ");
    expect(res.status()).toBe(400);
  });
});
