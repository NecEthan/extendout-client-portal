import type { Page } from "@playwright/test";

export class ChangePasswordPage {
  constructor(private readonly page: Page) {}

  async changePassword(currentPassword: string, newPassword: string) {
    await this.page.fill("#currentPassword", currentPassword);
    await this.page.fill("#newPassword", newPassword);
    await this.page.getByRole("button", { name: "Save password" }).click();
  }
}
