import React, {useEffect} from 'react';
import { Form, Input, Modal } from 'antd';
import { SettingListItem } from '../data.d';

export interface UpdateFormProps {
  onCancel: () => void;
  onSubmit: (values: Partial<SettingListItem>) => void;
  updateModalVisible: boolean;
  currentData: Partial<SettingListItem>;
}
const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 10 },
};

const UpdateSettingForm: React.FC<UpdateFormProps> = (props) => {
  const [form] = Form.useForm();

  const {
    onSubmit,
    onCancel,
    updateModalVisible,
    currentData,
  } = props;

  useEffect(() => {
    if (form && !updateModalVisible) {
      form.resetFields();
    }
  }, [props.updateModalVisible]);

  useEffect(() => {
    if (currentData) {
      form.setFieldsValue({
        ...currentData,
      });
    }
  }, [props.currentData]);

  const handleSubmit = () => {
    if (!form) return;
    form.submit();
  };

  const handleFinish = (values: { [key: string]: any }) => {
    if (onSubmit) {
      onSubmit(values);
    }
  };

  const renderContent = () => {
    return (
      <>
        <FormItem
          name="id"
          label="主键"
          hidden
        >
          <Input id="update-id" placeholder="请输入主键" />
        </FormItem>
        <FormItem
          name="flashOrderOvertime"
          label="秒杀订单超时关闭时间(分)"
        >
          <Input id="update-flashOrderOvertime" placeholder={'请输入秒杀订单超时关闭时间(分)'}/>
        </FormItem>
        <FormItem
          name="normalOrderOvertime"
          label="正常订单超时时间(分)"
        >
          <Input id="update-normalOrderOvertime" placeholder={'请输入正常订单超时时间(分)'}/>
        </FormItem>
        <FormItem
          name="confirmOvertime"
          label="发货后自动确认收货时间（天）"
        >
          <Input id="update-confirmOvertime" placeholder={'请输入发货后自动确认收货时间（天）'}/>
        </FormItem>
        <FormItem
          name="finishOvertime"
          label="自动完成交易时间（天）"
        >
          <Input id="update-finishOvertime" placeholder={'请输入自动完成交易时间（天）'}/>
        </FormItem>
        <FormItem
          name="commentOvertime"
          label="订单完成后自动好评时间（天）"
        >
          <Input id="update-commentOvertime" placeholder={'请输入订单完成后自动好评时间（天）'}/>
        </FormItem>
      </>
    );
  };


  const modalFooter = { okText: '保存', onOk: handleSubmit, onCancel };

  return (
    <Modal
      forceRender
      destroyOnClose
      title="修改订单设置"
      visible={updateModalVisible}
      {...modalFooter}
    >
      <Form
        {...formLayout}
        form={form}
        onFinish={handleFinish}
      >
        {renderContent()}
      </Form>
    </Modal>
  );
};

export default UpdateSettingForm;
