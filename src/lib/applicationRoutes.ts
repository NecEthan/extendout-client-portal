export const ApplicationRoutes = {
  home: "/",
  login: "/login",
  changePassword: "/change-password",
  projects: "/projects",
  project: (projectId: string) => `/projects/${projectId}`,
};
