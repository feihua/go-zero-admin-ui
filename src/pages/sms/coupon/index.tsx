import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Divider, message, Drawer, Modal } from 'antd';
import React, { useState, useRef } from 'react';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import ProDescriptions from '@ant-design/pro-descriptions';
import UpdateCouponForm, { CouponFormValueType } from './components/UpdateCouponForm';
import { CouponListItem } from './data.d';
import { queryCoupon, updateCoupon, addCoupon, removeCoupon } from './service';

import ProForm, { ModalForm, ProFormText, ProFormSelect, ProFormRadio } from '@ant-design/pro-form';

const { confirm } = Modal;

/**
 * 添加节点
 * @param fields
 */
const handleAdd = async (fields: CouponListItem) => {
  const hide = message.loading('正在添加');
  try {
    await addCoupon({ ...fields });
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
const handleUpdate = async (fields: CouponFormValueType) => {
  const hide = message.loading('正在更新');
  try {
    await updateCoupon({
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
    await removeCoupon({
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
const handleRemove = async (selectedRows: CouponListItem[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeCoupon({
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
  const [row, setRow] = useState<CouponListItem>();
  const [selectedRowsState, setSelectedRows] = useState<CouponListItem[]>([]);

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

  const columns: ProColumns<CouponListItem>[] = [
    {
      title: '编号',
      dataIndex: 'id',
      hideInSearch: true,
    },
    {
      title: '优惠券名',
      dataIndex: 'name',
      render: (dom, entity) => {
        return <a onClick={() => setRow(entity)}>{dom}</a>;
      },
    },
    {
      title: '数量',
      dataIndex: 'count',
      hideInSearch: true,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      hideInSearch: true,
    },
    {
      title: '每人限领张数',
      dataIndex: 'perLimit',
      hideInSearch: true,
    },
    {
      title: '发行数量',
      dataIndex: 'publishCount',
      hideInSearch: true,
    },
    {
      title: '已使用数量',
      dataIndex: 'useCount',
      hideInSearch: true,
    },
    {
      title: '领取数量',
      dataIndex: 'receiveCount',
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
      <ProTable<CouponListItem>
        headerTitle="优惠券列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button type="primary" onClick={() => handleModalVisible(true)}>
            <PlusOutlined /> 新建优惠券
          </Button>,
        ]}
        request={(params, sorter, filter) => queryCoupon({ ...params, sorter, filter })}
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
        title="新建优惠券"
        width="480px"
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        onFinish={async (value) => {
          const success = await handleAdd(value as CouponListItem);
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
        <UpdateCouponForm
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
          <ProDescriptions<CouponListItem>
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
