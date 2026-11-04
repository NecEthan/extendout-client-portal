import type { Page } from "@playwright/test";

export class ProjectsPage {
  constructor(private readonly page: Page) {}

  get heading() {
    return this.page.getByRole("heading", { name: "Projects" });
  }

  get navLink() {
    return this.page.getByRole("link", { name: "Projects" });
  }

  async goto() {
    await this.page.goto("/projects");
  }

  async waitUntilLoaded() {
    await this.page.waitForURL("/projects");
    await this.heading.waitFor();
  }

  get emptyState() {
    return this.page.getByText("No projects yet.");
  }

  // table body rows only (thead's row has no <td>)
  get rows() {
    return this.page.locator("tbody tr");
  }

  row(projectName: string) {
    return this.rows.filter({ has: this.page.getByRole("cell", { name: projectName, exact: true }) });
  }

  documentCount(projectName: string) {
    return this.row(projectName).getByRole("cell").nth(1);
  }

  async createProject(name: string) {
    return this.page.request.post("/api/projects", { data: { name } });
  }
}
