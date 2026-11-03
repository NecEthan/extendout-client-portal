import type { Page } from "@playwright/test";

export class HomePage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/");
  }

  async waitUntilLoaded() {
    await this.page.waitForURL("/");
  }

  roleText(role: string) {
    return this.page.getByText(role).first();
  }

  async logout() {
    await this.page.getByRole("button", { name: "Log out" }).click();
  }

  async createUser(data: { email: string; name: string; role: string; password: string }) {
    return this.page.request.post("/api/admin/users", { data });
  }
}
