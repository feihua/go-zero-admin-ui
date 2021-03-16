import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Divider, message, Input, Drawer, Modal } from 'antd';
import React, { useState, useRef } from 'react';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import ProDescriptions from '@ant-design/pro-descriptions';
import UpdateMenuForm, { MenuFormValueType } from './components/UpdateMenuForm';
import CreateMenuChildForm from './components/CreateMenuChildForm';
import { MenuListItem } from './data.d';
import { queryMenu, updateRule, addMenu, removeMenu, removeMenuOne } from './service';
import { tree } from '@/utils/utils';

import ProForm, { ModalForm, ProFormText } from '@ant-design/pro-form';

const { confirm } = Modal;

/**
 * 添加节点
 * @param fields
 */
const handleAdd = async (fields: MenuListItem) => {
  fields.order_num = Number(fields.order_num);
  fields.type = Number(fields.type);
  const hide = message.loading('正在添加');
  try {
    await addMenu({ ...fields });
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
const handleUpdate = async (fields: MenuFormValueType) => {
  const hide = message.loading('正在更新');
  try {
    await updateRule({
      name: fields.name,
      id: fields.id,
      parent_id: fields.parent_id,
      url: fields.url,
      type: fields.type,
      order_num: Number(fields.order_num),
      icon: fields.icon,
      perms: fields.perms,
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
    await removeMenuOne({
      id,
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
const handleRemove = async (selectedRows: MenuListItem[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeMenu({
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
  const [createChildModalVisible, handleChildModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [stepFormValues, setStepFormValues] = useState<MenuListItem>();
  const actionRef = useRef<ActionType>();
  const [row, setRow] = useState<MenuListItem>();
  const [selectedRowsState, setSelectedRows] = useState<MenuListItem[]>([]);

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

  const columns: ProColumns<MenuListItem>[] = [
    {
      title: '菜单名称',
      dataIndex: 'name',
      // formItemProps: {
      //   rules: [
      //     {
      //       required: true,
      //       message: '规则名称为必填项',
      //     },
      //   ],
      // },
      render: (dom, entity) => {
        return <a onClick={() => setRow(entity)}>{dom}</a>;
      },
    },
    {
      title: '父id',
      dataIndex: 'parent_id',
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '路径',
      dataIndex: 'url',
    },
    {
      title: '类型',
      dataIndex: 'type',
      hideInSearch: true,
    },
    {
      title: '排序',
      dataIndex: 'order_num',
      hideInSearch: true,
    },
    {
      title: '图标',
      dataIndex: 'icon',
      hideInSearch: true,
    },
    {
      title: '权限',
      dataIndex: 'perms',
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '创建人',
      dataIndex: 'create_by',
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      valueType: 'dateTime',
      hideInSearch: true,
      renderFormItem: (item, { defaultRender, ...rest }, form) => {
        const status = form.getFieldValue('status');
        if (`${status}` === '0') {
          return false;
        }
        if (`${status}` === '3') {
          return <Input {...rest} placeholder="请输入异常原因！" />;
        }
        return defaultRender(item);
      },
    },
    {
      title: '更新人',
      dataIndex: 'last_update_by',
      hideInSearch: true,
    },
    {
      title: '更新时间',
      dataIndex: 'last_update_time',
      valueType: 'dateTime',
      hideInSearch: true,
      renderFormItem: (item, { defaultRender, ...rest }, form) => {
        const status = form.getFieldValue('status');
        if (`${status}` === '0') {
          return false;
        }
        if (`${status}` === '3') {
          return <Input {...rest} placeholder="请输入异常原因！" />;
        }
        return defaultRender(item);
      },
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
            size="small"
            onClick={() => {
              handleChildModalVisible(true);
              setStepFormValues(record);
            }}
          >
            添加子菜单
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
      <ProTable<MenuListItem>
        headerTitle="菜单列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button type="primary" onClick={() => handleModalVisible(true)}>
            <PlusOutlined /> 新建
          </Button>,
        ]}
        request={(params, sorter, filter) => queryMenu({ ...params, sorter, filter })}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => setSelectedRows(selectedRows),
        }}
        postData={(data) => tree(data, 0, 'parent_id')}
        pagination={false}
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
        title="新建菜单"
        width="500px"
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        onFinish={async (value) => {
          const success = await handleAdd(value as MenuListItem);
          if (success) {
            handleModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProForm.Group>
          <ProFormText
            name="name"
            label="菜单名称"
            rules={[{ required: true, message: '请输入用户名！' }]}
          />
          <ProFormText name="type" label="类型" />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormText name="icon" label="图标" />
          <ProFormText name="order_num" label="排序" />
        </ProForm.Group>
        <ProFormText name="url" label="路径" width="l" />
      </ModalForm>
      {stepFormValues && Object.keys(stepFormValues).length ? (
        <CreateMenuChildForm
          onSubmit={async (value) => {
            const success = await handleAdd(value as MenuListItem);
            if (success) {
              handleChildModalVisible(false);
              setStepFormValues(undefined);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          onCancel={() => {
            handleChildModalVisible(false);
            setStepFormValues(undefined);
          }}
          createChildModalVisible={createChildModalVisible}
          parent_id={stepFormValues?.id || 0}
        />
      ) : null}
      {stepFormValues && Object.keys(stepFormValues).length ? (
        <UpdateMenuForm
          onSubmit={async (value) => {
            const success = await handleUpdate(value);
            if (success) {
              handleUpdateModalVisible(false);
              setStepFormValues(undefined);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          onCancel={() => {
            handleUpdateModalVisible(false);
            setStepFormValues(undefined);
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
          <ProDescriptions<MenuListItem>
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
