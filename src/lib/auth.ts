import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin as adminPlugin } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 400, // 400 days, browser Max-Age ceiling
    updateAge: 60 * 60 * 24, // sliding: refresh if used within last day
  },
  rateLimit: {
    customRules: {
      "/sign-in/*": { window: 10, max: 30 },
      "/change-password": { window: 10, max: 30 },
    },
  },
  user: {
    additionalFields: {
      // named portalRole, not role: the admin plugin owns its own `role` column
      portalRole: {
        type: "string",
        required: true,
        defaultValue: "CLIENT",
        input: false, // not settable by the client, only via admin API
      },
      requirePasswordChange: {
        type: "boolean",
        required: true,
        defaultValue: true,
        input: false,
      },
    },
  },
  plugins: [
    // only used for the createUser API (account provisioning without self-signup);
    // authorization in this app runs on the custom `portalRole` field above, not this plugin's own role.
    adminPlugin(),
  ],
});
