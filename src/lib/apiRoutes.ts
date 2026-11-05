export const ApiRoutes = {
  auth: {
    betterAuth: "/api/auth",
    completePasswordChange: "/api/account/complete-password-change",
  },
  users: {
    create: "/api/admin/users",
    createAdmin: "/api/admin/create-admin",
    listSessions: (userId: string) => `/api/admin/users/${userId}/sessions`,
    revokeSessions: (userId: string) => `/api/admin/users/${userId}/sessions`,
  },
  projects: {
    list: "/api/projects",
    create: "/api/projects",
    get: (projectId: string) => `/api/projects/${projectId}`,
  },
};
