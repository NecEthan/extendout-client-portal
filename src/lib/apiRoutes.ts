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
    requestDocumentUpload: (projectId: string) => `/api/projects/${projectId}/documents`,
  },
  documents: {
    completeUpload: (documentId: string) => `/api/documents/${documentId}/complete`,
  },
};
