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

  test.describe("document uploads", () => {
    test("a member can upload a document, and it's stored in the bucket", async ({
      testData,
      loginAs,
      projectPage,
    }) => {
      const client = await testData.createUser({ role: "CLIENT", name: "E2E Uploader" });
      const project = await testData.createProject({ members: [client] });
      const fileName = `${uniqueName("upload")}.txt`;
      const content = `hello from ${fileName}`;

      await loginAs(client);
      await projectPage.goto(project.id);
      await projectPage.waitUntilLoaded(project.name);
      await projectPage.openTab("Documents");
      await expect(projectPage.emptyState).toBeVisible();

      await projectPage.upload(fileName, content);

      await expect(projectPage.uploadStatus).toHaveText(`Uploaded ${fileName}.`);
      await expect(projectPage.row(fileName)).toContainText("E2E Uploader");

      const document = await testData.findDocument(project.id, fileName);
      expect(document?.status).toBe("READY");
      expect(document?.storageKey).toMatch(new RegExp(`^projects/${project.id}/`));
      expect(await testData.objectSize(document!.storageKey)).toBe(Buffer.byteLength(content));
    });

    test("rejects files over 100 MB before anything is uploaded", async ({ testData, loginAs, projectPage }) => {
      const client = await testData.createUser({ role: "CLIENT" });
      const project = await testData.createProject({ members: [client] });

      await loginAs(client);
      const res = await projectPage.requestUploadViaApi(project.id, {
        fileName: "huge.pdf",
        sizeBytes: 100 * 1024 * 1024 + 1,
      });
      expect(res.status()).toBe(413);
      expect(await testData.findDocument(project.id, "huge.pdf")).toBeNull();
    });

    test("a file with a different size than approved is rejected and discarded", async ({
      testData,
      loginAs,
      projectPage,
    }) => {
      const client = await testData.createUser({ role: "CLIENT" });
      const project = await testData.createProject({ members: [client] });
      const fileName = `${uniqueName("liar")}.txt`;

      await loginAs(client);
      const res = await projectPage.requestUploadViaApi(project.id, { fileName, sizeBytes: 5 });
      expect(res.status()).toBe(201);
      const { documentId, uploadUrl } = await res.json();

      // the upload URL is locked to 5 bytes, so the bucket refuses a bigger file
      const put = await projectPage.putToBucket(uploadUrl, "way more than five bytes");
      expect(put.ok()).toBe(false);

      const complete = await projectPage.completeUploadViaApi(documentId);
      expect(complete.status()).toBe(400);
      expect(await testData.findDocument(project.id, fileName)).toBeNull();
    });

    test("unfinished uploads don't appear in the documents list", async ({ testData, loginAs, projectPage }) => {
      const client = await testData.createUser({ role: "CLIENT" });
      const project = await testData.createProject({ members: [client] });

      await loginAs(client);
      const res = await projectPage.requestUploadViaApi(project.id, { fileName: "pending.txt", sizeBytes: 10 });
      expect(res.status()).toBe(201);

      await projectPage.goto(project.id);
      await projectPage.waitUntilLoaded(project.name);
      await projectPage.openTab("Documents");
      await expect(projectPage.emptyState).toBeVisible();
    });

    test("a non-member can't request or complete an upload", async ({
      page,
      testData,
      loginAs,
      projectPage,
    }) => {
      const member = await testData.createUser({ role: "CLIENT" });
      const outsider = await testData.createUser({ role: "CLIENT" });
      const project = await testData.createProject({ members: [member] });

      await loginAs(member);
      const res = await projectPage.requestUploadViaApi(project.id, { fileName: "mine.txt", sizeBytes: 10 });
      const { documentId } = await res.json();

      await page.context().clearCookies();
      await loginAs(outsider);
      expect((await projectPage.requestUploadViaApi(project.id, { fileName: "x.txt", sizeBytes: 10 })).status()).toBe(404);
      expect((await projectPage.completeUploadViaApi(documentId)).status()).toBe(404);
    });
  });

  test.describe("photos", () => {
    test("a member can upload photos, and they show in Photos but not Documents", async ({
      page,
      testData,
      loginAs,
      projectPage,
    }) => {
      const builder = await testData.createUser({ role: "BUILDER", name: "E2E Builder" });
      const project = await testData.createProject({ members: [builder] });
      const first = `${uniqueName("slab")}.png`;
      const second = `${uniqueName("framing")}.png`;

      await loginAs(builder);
      await projectPage.goto(project.id);
      await projectPage.waitUntilLoaded(project.name);
      await projectPage.openTab("Photos");
      await expect(projectPage.photosEmptyState).toBeVisible();

      await projectPage.uploadPhotos([first, second]);

      await expect(projectPage.uploadStatus).toHaveText("Uploaded 2 photos.");
      for (const name of [first, second]) {
        const img = projectPage.photo(name);
        await expect(img).toBeVisible();
        // Actually loaded from the bucket through the presigned URL, not a broken image
        await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBe(1);
        expect((await testData.findDocument(project.id, name))?.type).toBe("PHOTO");
      }
      await expect(page.getByText("E2E Builder ·").first()).toBeVisible();

      await projectPage.openTab("Documents");
      await expect(projectPage.emptyState).toBeVisible();
      const { documents } = await (await projectPage.getViaApi(project.id)).json();
      expect(documents).toHaveLength(0);
    });

    test("only accepts image types for photos", async ({ testData, loginAs, projectPage }) => {
      const client = await testData.createUser({ role: "CLIENT" });
      const project = await testData.createProject({ members: [client] });

      await loginAs(client);
      const res = await projectPage.requestUploadViaApi(project.id, {
        fileName: "notes.html",
        sizeBytes: 10,
        mimeType: "text/html",
        type: "PHOTO",
      });
      expect(res.status()).toBe(400);
      expect(await testData.findDocument(project.id, "notes.html")).toBeNull();
    });

    test("a non-member can't list a project's photos", async ({ testData, loginAs, projectPage }) => {
      const outsider = await testData.createUser({ role: "CLIENT" });
      const project = await testData.createProject();

      await loginAs(outsider);
      expect((await projectPage.getPhotosViaApi(project.id)).status()).toBe(404);
    });
  });
});
