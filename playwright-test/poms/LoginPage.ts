import type { Page } from "@playwright/test";

export class LoginPage {
  constructor(private readonly page: Page) {}

  get errorAlert() {
    return this.page.getByRole("alert");
  }

  async goto() {
    await this.page.goto("/login");
    // In dev, typing before React hydrates gets wiped when the controlled inputs mount.
    await this.page.waitForLoadState("networkidle");
  }

  async login(email: string, password: string) {
    await this.page.fill("#email", email);
    await this.page.fill("#password", password);
    await this.page.getByRole("button", { name: "Log in" }).click();
  }
}
