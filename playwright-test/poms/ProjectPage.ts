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

  get rows() {
    return this.page.locator("tbody tr");
  }

  row(fileName: string) {
    return this.rows.filter({ hasText: fileName });
  }

  async getViaApi(projectId: string) {
    return this.page.request.get(`/api/projects/${projectId}`);
  }
}
