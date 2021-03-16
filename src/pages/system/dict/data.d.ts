export interface DictListItem {
  id: number;
  disabled?: boolean;
  href: string;
  avatar: string;
  name: string;
  owner: string;
  description: string;
  callNo: number;
  status: number;
  updatedAt: Date;
  createdAt: Date;
  progress: number;
  value?: string;
  label?: string;
  type?: string;
  remarks?: string;
  sort?: string;

}

export interface DictListPagination {
  total: number;
  pageSize: number;
  current: number;
}

export interface DictListData {
  list: DictListItem[];
  pagination: Partial<DictListPagination>;
}

export interface DictListParams {
  id?: number;
  status?: string;
  name?: string;
  description?: string;
  key?: number;
  pageSize?: number;
  currentPage?: number;
  filter?: { [key: string]: any[] };
  sorter?: { [key: string]: any };
  value?: string;
  label?: string;
  type?: string;
  remarks?: string;
  sort?: string;
}
