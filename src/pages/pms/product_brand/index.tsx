import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Divider, message, Drawer, Modal } from 'antd';
import React, { useState, useRef } from 'react';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import ProDescriptions from '@ant-design/pro-descriptions';
import CreateBrandForm from './components/CreateBrandForm';
import UpdateBrandForm from './components/UpdateBrandForm';
import { BrandListItem } from './data.d';
import { queryBrand, updateBrand, addBrand, removeBrand } from './service';


const { confirm } = Modal;

/**
 * 添加节点
 * @param fields
 */
const handleAdd = async (fields: BrandListItem) => {
  const hide = message.loading('正在添加');
  try {
    await addBrand({ ...fields });
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
const handleUpdate = async (fields: Partial<BrandListItem>) => {
  const hide = message.loading('正在更新');
  try {
    await updateBrand(fields as BrandListItem);
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
    await removeBrand({
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
const handleRemove = async (selectedRows: BrandListItem[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeBrand({
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
  const [row, setRow] = useState<BrandListItem>();
  const [selectedRowsState, setSelectedRows] = useState<BrandListItem[]>([]);

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

  const columns: ProColumns<BrandListItem>[] = [
    {
      title: '编号',
      dataIndex: 'id',
      hideInSearch: true,
    },
    {
      title: '品牌名',
      dataIndex: 'name',
      render: (dom, entity) => {
        return <a onClick={() => setRow(entity)}>{dom}</a>;
      },
    },
    {
      title: '产品数量',
      dataIndex: 'productCount',
    },
    {
      title: '产品评论数量',
      dataIndex: 'productCommentCount',
    },
    {
      title: '品牌logo',
      dataIndex: 'logo',
    },
    {
      title: '专区大图',
      dataIndex: 'bigPic',
    },
    {
      title: '品牌故事',
      dataIndex: 'brandStory',
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
      <ProTable<BrandListItem>
        headerTitle="品牌列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button type="primary" onClick={() => handleModalVisible(true)}>
            <PlusOutlined /> 新建品牌
          </Button>,
        ]}
        request={(params, sorter, filter) => queryBrand({ ...params, sorter, filter })}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => setSelectedRows(selectedRows),
        }}
        pagination={{pageSize:10}}
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


      <CreateBrandForm
        key={'CreateBrandForm'}
        onSubmit={async (value) => {
          const success = await handleAdd(value);
          if (success) {
            handleModalVisible(false);
            setStepFormValues({});
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          handleModalVisible(false);
          setStepFormValues({});
        }}
        createModalVisible={createModalVisible}
      />

      <UpdateBrandForm
        key={'UpdateBrandForm'}
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
        currentData={stepFormValues}
      />
      <Drawer
        width={600}
        visible={!!row}
        onClose={() => {
          setRow(undefined);
        }}
        closable={false}
      >
        {row?.id && (
          <ProDescriptions<BrandListItem>
            column={2}
            title={row?.id}
            request={async () => ({
              data: row || {},
            })}
            params={{
              id: row?.id,
            }}
            columns={columns}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
