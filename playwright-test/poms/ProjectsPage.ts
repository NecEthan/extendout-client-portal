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

  get cards() {
    return this.page.getByRole("main").getByRole("listitem");
  }

  card(projectName: string) {
    return this.cards.filter({ has: this.page.getByRole("heading", { name: projectName, exact: true }) });
  }

  link(projectName: string) {
    return this.card(projectName).getByRole("link");
  }

  documentCount(projectName: string) {
    return this.card(projectName).getByTestId("document-count");
  }

  async createProject(name: string) {
    return this.page.request.post("/api/projects", { data: { name } });
  }
}
