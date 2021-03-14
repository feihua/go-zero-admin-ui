import { request } from 'umi';
import { TableListParams, TableListItem } from './data.d';

export async function queryRule(params?: TableListParams) {
  return request('/api/sys/user/list', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function removeUserOne(params: { id: number }) {
  return request('/api/sys/user/delete', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function removeUser(params: { key: number[] }) {
  return request('/api/sys/user/delete', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function addUser(params: TableListItem) {
  return request('/api/sys/user/add', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function updateUser(params: TableListParams) {
  return request('/api/sys/user/update', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function updateUserRole(params: TableListParams) {
  return request('/api/sys/user/updateUserRole', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}