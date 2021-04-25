import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Divider, message, Drawer, Modal } from 'antd';
import React, { useState, useRef } from 'react';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import ProDescriptions from '@ant-design/pro-descriptions';
import UpdateAddressForm, { AddressFormValueType } from './components/UpdateAddressForm';
import { AddressTableListItem } from './data.d';
import { queryAddress, updateAddress, addAddress, removeAddress } from './service';

import ProForm, { ModalForm, ProFormText, ProFormSelect, ProFormRadio } from '@ant-design/pro-form';

const { confirm } = Modal;

/**
 * 添加节点
 * @param fields
 */
const handleAdd = async (fields: AddressTableListItem) => {
  const hide = message.loading('正在添加');
  try {
    await addAddress({ ...fields });
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    message.error('添加失败请重试！');
    return false;
  }
};

/**
 * 更新节点
 * @param fields
 */
const handleUpdate = async (fields: AddressFormValueType) => {
  const hide = message.loading('正在更新');
  try {
    await updateAddress({
      name: fields.name,
      nick_name: fields.nick_name,
      email: fields.email,
      id: fields.id,
      mobile: fields.mobile,
      dept_id: fields.dept_id,
      status: fields.status,
      role_id: fields.role_id,
    });
    hide();

    message.success('更新成功');
    return true;
  } catch (error) {
    hide();
    message.error('更新失败请重试！');
    return false;
  }
};

/**
 *  删除节点(单个)
 * @param id
 */
const handleRemoveOne = async (id: number) => {
  const hide = message.loading('正在删除');
  try {
    await removeAddress({
      ids: [id],
    });
    hide();
    message.success('删除成功，即将刷新');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

/**
 *  删除节点
 * @param selectedRows
 */
const handleRemove = async (selectedRows: AddressTableListItem[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeAddress({
      ids: selectedRows.map((row) => row.id),
    });
    hide();
    message.success('删除成功，即将刷新');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

const TableList: React.FC<{}> = () => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [stepFormValues, setStepFormValues] = useState({});
  const actionRef = useRef<ActionType>();
  const [row, setRow] = useState<AddressTableListItem>();
  const [selectedRowsState, setSelectedRows] = useState<AddressTableListItem[]>([]);

  const showDeleteConfirm = (id: number) => {
    confirm({
      title: '是否删除记录?',
      icon: <ExclamationCircleOutlined />,
      content: '删除的记录不能恢复,请确认!',
      onOk() {
        handleRemoveOne(id).then((r) => {
          actionRef.current?.reloadAndRest?.();
        });
      },
      onCancel() {},
    });
  };

  const columns: ProColumns<AddressTableListItem>[] = [
    {
      title: '编号',
      dataIndex: 'id',
      hideInSearch: true,
    },
    {
      title: '会员',
      dataIndex: 'memberId',
      render: (dom, entity) => {
        return <a onClick={() => setRow(entity)}>{dom}</a>;
      },
    },
    {
      title: '收货人名称',
      dataIndex: 'name',
    },
    {
      title: '收货人电话',
      dataIndex: 'phoneNumber',
    },
    {
      title: '是否为默认',
      dataIndex: 'defaultStatus',
      valueEnum: {
        0: { text: '否', status: 'Error' },
        1: { text: '是', status: 'Success' },
      },
    },
    {
      title: '邮政编码',
      dataIndex: 'postCode',
    },
    {
      title: '省份/直辖市',
      dataIndex: 'province',
    },
    {
      title: '城市',
      dataIndex: 'city',
    },
    {
      title: '区',
      dataIndex: 'region',
    },
    {
      title: '详细地址(街道)',
      dataIndex: 'detailAddress',
      hideInSearch: true,
    },

    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <Button
            type="primary"
            size="small"
            onClick={() => {
              handleUpdateModalVisible(true);
              setStepFormValues(record);
            }}
          >
            编辑
          </Button>
          <Divider type="vertical" />
          <Button
            type="primary"
            danger
            size="small"
            onClick={() => {
              showDeleteConfirm(record.id);
            }}
          >
            删除
          </Button>
        </>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<AddressTableListItem>
        headerTitle="会员地址列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={false}
        request={(params, sorter, filter) => queryAddress({ ...params, sorter, filter })}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => setSelectedRows(selectedRows),
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择 <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a> 项&nbsp;&nbsp;
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            批量删除
          </Button>
        </FooterToolbar>
      )}

      <ModalForm
        title="新建用户"
        width="480px"
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        onFinish={async (value) => {
          const success = await handleAdd(value as AddressTableListItem);
          if (success) {
            handleModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
          return true;
        }}
      >
        <ProForm.Group>
          <ProFormText
            name="name"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名！' }]}
          />
          <ProFormText
            name="nick_name"
            label="昵称"
            rules={[{ required: true, message: '请输入昵称！' }]}
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormText
            name="mobile"
            label="手机号码"
            rules={[{ required: true, message: '请输入手机号码！' }]}
          />

          <ProFormText
            name="email"
            label="邮箱"
            rules={[{ required: true, message: '请输入邮箱！' }]}
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormText
            name="dept_id"
            label="部门"
            rules={[{ required: true, message: '请输入部门！' }]}
          />

          <ProFormRadio.Group
            name="status"
            label="状态"
            width={1}
            options={[
              {
                label: '正常',
                value: 'a',
              },
              {
                label: '禁用',
                value: 'b',
              },
            ]}
          />
        </ProForm.Group>
        <ProFormSelect
          name="role_id"
          label="角色"
          style={{ width: '100%' }}
          request={async () => [
            { label: '超级管理员', value: '1' },
            { label: '项目经理', value: '2' },
            { label: '开发人员', value: '3' },
            { label: '测试人员', value: '4' },
          ]}
          placeholder="Please select a role"
          rules={[{ required: true, message: 'Please select your role!' }]}
        />
      </ModalForm>

      {stepFormValues && Object.keys(stepFormValues).length ? (
        <UpdateAddressForm
          onSubmit={async (value) => {
            const success = await handleUpdate(value);
            if (success) {
              handleUpdateModalVisible(false);
              setStepFormValues({});
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          onCancel={() => {
            handleUpdateModalVisible(false);
            setStepFormValues({});
          }}
          updateModalVisible={updateModalVisible}
          values={stepFormValues}
        />
      ) : null}

      <Drawer
        width={600}
        visible={!!row}
        onClose={() => {
          setRow(undefined);
        }}
        closable={false}
      >
        {row?.name && (
          <ProDescriptions<AddressTableListItem>
            column={2}
            title={row?.name}
            request={async () => ({
              data: row || {},
            })}
            params={{
              id: row?.name,
            }}
            columns={columns}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
