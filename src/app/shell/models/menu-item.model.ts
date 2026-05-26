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
  externalUrl?: string;
  parentId?: number;
  children?: MenuItem[];
  moduleName?: string;
  permission?: string;
  expanded?: boolean;
  hidden?: boolean;
  badge?: string;
  loaded?: boolean;
  loading?: boolean;
  disabled?: boolean;
}
