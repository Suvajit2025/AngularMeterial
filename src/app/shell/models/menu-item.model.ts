// export interface MenuItem {
//   id: number;
//   title: string;
//   icon: string;
//   route?: string;
//   expanded?: boolean;
//   children?: MenuItem[];
// }
export interface MenuItem {
  id: number;
  title: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  permission?: string;
  expanded?: boolean;
  hidden?: boolean;
  badge?: string;
}