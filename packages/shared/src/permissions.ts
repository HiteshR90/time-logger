export const PERMISSIONS = {
  // Monitoring
  "live_feed.view": "View live employee screens",
  "screenshots.view": "Browse employee screenshots",
  "app_usage.view": "View app usage data",

  // Time
  "timesheets.view": "View timesheets",
  "timesheets.approve": "Approve/reject timesheets",

  // People
  "members.view": "View member list",
  "members.invite": "Invite new members",
  "members.edit": "Edit member details",
  "salary.view": "View employee salaries",
  "salary.edit": "Set employee salaries",

  // Business
  "clients.view": "View clients",
  "clients.manage": "Create/edit/delete clients",
  "projects.view": "View projects",
  "projects.manage": "Create/edit/delete projects",
  "invoices.view": "View invoices",
  "invoices.manage": "Create/edit invoices",

  // Organization
  "teams.manage": "Manage departments/teams",
  "reports.view": "View reports",
  "reports.earnings": "View employee earnings report",
  "settings.manage": "Manage organization settings",
  "roles.manage": "Create/edit roles & permissions",
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

export const PERMISSION_CATEGORIES = {
  Monitoring: ["live_feed.view", "screenshots.view", "app_usage.view"],
  Time: ["timesheets.view", "timesheets.approve"],
  People: ["members.view", "members.invite", "members.edit", "salary.view", "salary.edit"],
  Business: ["clients.view", "clients.manage", "projects.view", "projects.manage", "invoices.view", "invoices.manage"],
  Organization: ["teams.manage", "reports.view", "reports.earnings", "settings.manage", "roles.manage"],
} as const;

const ALL_TRUE = Object.keys(PERMISSIONS).reduce(
  (acc, k) => ({ ...acc, [k]: true }), {} as Record<string, boolean>,
);

export const DEFAULT_ROLE_PERMISSIONS: Record<string, Record<string, boolean>> = {
  owner: { ...ALL_TRUE },
  manager: {
    "live_feed.view": true,
    "screenshots.view": true,
    "app_usage.view": true,
    "timesheets.view": true,
    "timesheets.approve": true,
    "members.view": true,
    "members.invite": true,
    "members.edit": true,
    "salary.view": false,
    "salary.edit": false,
    "clients.view": true,
    "clients.manage": true,
    "projects.view": true,
    "projects.manage": true,
    "invoices.view": true,
    "invoices.manage": false,
    "teams.manage": false,
    "reports.view": true,
    "reports.earnings": false,
    "settings.manage": false,
    "roles.manage": false,
  },
  employee: {
    "live_feed.view": false,
    "screenshots.view": false,
    "app_usage.view": false,
    "timesheets.view": true,
    "timesheets.approve": false,
    "members.view": false,
    "members.invite": false,
    "members.edit": false,
    "salary.view": false,
    "salary.edit": false,
    "clients.view": true,
    "clients.manage": false,
    "projects.view": true,
    "projects.manage": false,
    "invoices.view": false,
    "invoices.manage": false,
    "teams.manage": false,
    "reports.view": false,
    "reports.earnings": false,
    "settings.manage": false,
    "roles.manage": false,
  },
};
