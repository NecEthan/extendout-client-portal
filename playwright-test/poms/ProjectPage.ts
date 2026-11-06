import type { Page } from "@playwright/test";

// A single project: /projects/[id]
export class ProjectPage {
  constructor(private readonly page: Page) {}

  async goto(projectId: string) {
    await this.page.goto(`/projects/${projectId}`);
  }

  async waitUntilLoaded(projectName: string) {
    await this.page.waitForURL("**/projects/*");
    await this.heading(projectName).waitFor();
  }

  heading(projectName: string) {
    return this.page.getByRole("heading", { name: projectName, level: 1 });
  }

  tab(name: string) {
    return this.page.getByRole("tab", { name });
  }

  async openTab(name: string) {
    await this.tab(name).click();
  }

  get allProjectsLink() {
    return this.page.getByRole("link", { name: "All projects" });
  }

  // our Alert component, not Next's (always present, empty) route announcer
  get errorAlert() {
    return this.page.locator('[data-slot="alert"]');
  }

  get emptyState() {
    return this.page.getByText("No documents yet.");
  }

  get uploadButton() {
    return this.page.getByRole("button", { name: "Upload" });
  }

  get uploadStatus() {
    return this.page.getByRole("status");
  }

  async upload(fileName: string, content = "e2e test file") {
    await this.page.getByLabel("File").setInputFiles({
      name: fileName,
      mimeType: "text/plain",
      buffer: Buffer.from(content),
    });
    await this.uploadButton.click();
  }

  get photosEmptyState() {
    return this.page.getByText("No photos yet.");
  }

  // A 1x1 PNG per name, so the browser can actually render them.
  async uploadPhotos(fileNames: string[]) {
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    );
    await this.page
      .getByLabel("Photos")
      .setInputFiles(fileNames.map((name) => ({ name, mimeType: "image/png", buffer: png })));
    await this.uploadButton.click();
  }

  photo(fileName: string) {
    return this.page.getByRole("img", { name: fileName });
  }

  async getPhotosViaApi(projectId: string) {
    return this.page.request.get(`/api/projects/${projectId}/photos`);
  }

  get rows() {
    return this.page.locator("tbody tr");
  }

  row(fileName: string) {
    return this.rows.filter({ hasText: fileName });
  }

  async getViaApi(projectId: string) {
    return this.page.request.get(`/api/projects/${projectId}`);
  }

  // Step 1 of an upload: ask for a presigned URL.
  async requestUploadViaApi(
    projectId: string,
    file: { fileName: string; sizeBytes: number; mimeType?: string; type?: "DOCUMENT" | "PHOTO" },
  ) {
    return this.page.request.post(`/api/projects/${projectId}/documents`, {
      data: { mimeType: "text/plain", ...file },
    });
  }

  // Step 2: PUT the bytes straight to the bucket.
  async putToBucket(uploadUrl: string, content: string) {
    return this.page.request.put(uploadUrl, {
      data: Buffer.from(content),
      headers: { "Content-Type": "text/plain" },
    });
  }

  // Step 3: confirm the upload.
  async completeUploadViaApi(documentId: string) {
    return this.page.request.post(`/api/documents/${documentId}/complete`);
  }
}
