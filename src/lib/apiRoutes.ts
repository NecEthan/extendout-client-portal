export const ApiRoutes = {
  authBase: "/api/auth",
  adminBootstrap: "/api/admin/bootstrap",
  adminUsers: "/api/admin/users",
  adminUserSessions: (userId: string) => `/api/admin/users/${userId}/sessions`,
  completePasswordChange: "/api/account/complete-password-change",
  documents: "/api/documents",
  projects: "/api/projects",
};
