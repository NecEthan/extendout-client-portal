import type { Page } from "@playwright/test";

export class LoginPage {
  constructor(private readonly page: Page) {}

  get errorAlert() {
    return this.page.getByRole("alert");
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.page.fill("#email", email);
    await this.page.fill("#password", password);
    await this.page.getByRole("button", { name: "Log in" }).click();
  }
}
