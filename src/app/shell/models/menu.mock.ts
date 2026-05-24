import { MenuItem } from './menu-item.model';

export const ENTERPRISE_MENU_ITEMS: MenuItem[] = [
  { id: 1, title: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
  {
    id: 2,
    title: 'Employee Management',
    icon: 'groups',
    children: [
      { id: 21, title: 'Employee Directory', icon: 'badge', route: '/employees' },
      { id: 22, title: 'Onboarding', icon: 'person_add', route: '/employees/onboarding' },
      { id: 23, title: 'Organization Hierarchy', icon: 'account_tree', route: '/organization/org-chart' },
    ],
  },
  {
    id: 3,
    title: 'Attendance',
    icon: 'schedule',
    children: [
      { id: 31, title: 'Daily Logs', icon: 'calendar_today', route: '/attendance/logs' },
      { id: 32, title: 'Shifts', icon: 'work_history', route: '/attendance/shifts' },
      { id: 33, title: 'Regularization', icon: 'rule', route: '/attendance/regularization' },
    ],
  },
  {
    id: 4,
    title: 'Leave',
    icon: 'event_available',
    children: [
      { id: 41, title: 'Leave Requests', icon: 'fact_check', route: '/leave/requests' },
      { id: 42, title: 'Balances', icon: 'hourglass_empty', route: '/leave/balances' },
      { id: 43, title: 'Holiday Calendar', icon: 'date_range', route: '/leave/holidays' },
    ],
  },
  {
    id: 5,
    title: 'Payroll',
    icon: 'payments',
    children: [
      { id: 51, title: 'Salary Run', icon: 'receipt_long', route: '/payroll/salary-run' },
      { id: 52, title: 'Payslips', icon: 'article', route: '/payroll/payslips' },
      { id: 53, title: 'Statutory Reports', icon: 'summarize', route: '/payroll/statutory' },
    ],
  },
  {
    id: 6,
    title: 'Recruitment',
    icon: 'person_search',
    children: [
      { id: 61, title: 'Open Positions', icon: 'assignment_ind', route: '/recruitment/jobs' },
      { id: 62, title: 'Candidates', icon: 'supervisor_account', route: '/recruitment/candidates' },
      { id: 63, title: 'Interviews', icon: 'video_call', route: '/recruitment/interviews' },
    ],
  },
  { id: 7, title: 'Reports', icon: 'analytics', route: '/reports' },
  {
    id: 8,
    title: 'Settings',
    icon: 'settings',
    children: [
      { id: 81, title: 'Company Profile', icon: 'business', route: '/settings/company' },
      { id: 82, title: 'Roles & Access', icon: 'admin_panel_settings', route: '/settings/access' },
      { id: 83, title: 'Workflow Rules', icon: 'schema', route: '/settings/workflows' },
    ],
  },
];
