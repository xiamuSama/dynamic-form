import React, { useCallback, useState } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  Switch,
  Radio,
  Drawer,
  message,
} from "antd";

import { IFieldConfig } from "./types";
import "./index.css";

const FormItem = Form.Item;
const Option = Select.Option;

interface IProps {
  config: IFieldConfig;
  queque: number;
  onFieldSave: (queque, values) => void;
}

type IwatchForm = Pick<IFieldConfig, "required" | "component">;

const FieldItem = ({ config, queque, onFieldSave }: IProps) => {
  const [show, setShow] = useState(false);
  const [form] = Form.useForm();
  const [watchForm, setWatchForm] = useState<IwatchForm>({});

  const onDrawerCancel = () => {
    setShow(false);
    form.resetFields();
  };

  const onDrawerSave = () => {
    form
      .validateFields()
      .then((values) => {
        try {
          if (values.propsJson) {
            values.props = JSON.parse(values.propsJson);
          }
        } catch (err) {
          message.error("props 解析错误");
          return;
        }
        try {
          if (values.defaultValue) {
            values.defaultValue = JSON.parse(values.defaultValue);
          }
        } catch (err) {
          message.error("defaultValue 解析错误");
          return;
        }
        onFieldSave(queque, values);
        // setBlocks((v) => {
        //     v[queque] = {
        //         ...v[queque],
        //         ...values,
        //     };
        //     return ([] as BlockConfig[]).concat(v);
        // });
        onDrawerCancel();
      })
      .catch();
  };

  const handleChange = useCallback((changedValues, allValues) => {
    if (changedValues.required) {
      setWatchForm((v) => {
        return {
          ...v,
          required: true,
        };
      });
    }
    if (changedValues.component) {
      setWatchForm((v) => {
        return {
          ...v,
          component: changedValues.component,
        };
      });
    }
  }, []);

  return (
    <>
      <div
        className={"field"}
        onClick={() => {
          setShow(true);
          setWatchForm({
            required: config.required,
            component: config.component,
          });
          form.setFieldsValue({
            ...config,
            propsJson: config.propsJson || "{\n\n\n\n\n}",
            defaultValue:
              typeof config.defaultValue !== "undefined"
                ? JSON.stringify(config.defaultValue)
                : undefined,
          });
        }}
      >
        <div
          className={"fieldCode"}
          style={{ borderBottom: "1px solid #f0f0f0" }}
        >
          {config.name || "{name}"}-{config.code || "{code}"}
        </div>
        <div className={"fieldCode"}>
          {config.customComponent || config.component}
        </div>
      </div>

      <Drawer
        title="字段配置"
        placement="right"
        onClose={onDrawerCancel}
        visible={show}
        width={500}
        footer={
          <div className={"flexSpace"}>
            <Button onClick={onDrawerCancel}>取消</Button>
            <Button type="primary" onClick={onDrawerSave}>
              保存
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          labelCol={{ span: 6 }} // </Drawer>initialValues={defaultBlockItem}
          onValuesChange={handleChange}
        >
          <FormItem
            label="code"
            name="code"
            required
            rules={[{ required: true }]}
            tooltip="需保证唯一性"
          >
            <Input />
          </FormItem>
          <FormItem
            label="字段名"
            name="name"
            required
            rules={[{ required: true }]}
          >
            <Input />
          </FormItem>
          <FormItem label="字段类型" name="component" required>
            <Select>
              <Option value="Input">输入框{`Input`}</Option>
              <Option value="InputNumber">数字输入框{`InputNumber`}</Option>
              <Option value="TextArea">长文本输入框{`TextArea`}</Option>
              <Option value="Select">下拉选择{`Select`}</Option>
              <Option value="DatePicker">日期选择{`DatePicker`}</Option>
              <Option value="RangePicker">日期范围选择{`RangePicker`}</Option>
              <Option value="Switch">开关{`Switch`}</Option>
              <Option value="Radio">单选框{`Radio`}</Option>
              <Option value="Custom">自定义{`Custom`}</Option>
            </Select>
          </FormItem>
          {watchForm.component === "Custom" && (
            <FormItem label="自定义组件名" name="customComponent">
              <Input></Input>
            </FormItem>
          )}

          <FormItem label="必填" name="required" valuePropName="checked">
            <Switch />
          </FormItem>
          <FormItem label="默认值" name="defaultValue">
            <Input></Input>
          </FormItem>
          {/* {watchForm.require && (
                        <FormItem label="必填提示文案" name="requiredMsg">
                            <Input />
                        </FormItem>
                    )} */}
          <FormItem label="组件宽度" name="span" required>
            <Radio.Group>
              <Radio.Button value={6}>6</Radio.Button>
              <Radio.Button value={8}>8</Radio.Button>
              <Radio.Button value={12}>12</Radio.Button>
              <Radio.Button value={16}>16</Radio.Button>
              <Radio.Button value={18}>18</Radio.Button>
              <Radio.Button value={24}>24</Radio.Button>
            </Radio.Group>
          </FormItem>
          <FormItem
            label="布局宽度"
            name="alignSpan"
            tooltip="组件实际在栅格渲染的width,用于布局，\n常见select单独占一行，宽度却要1/3,此时设置span:8,alignSpan:24"
          >
            <Radio.Group>
              <Radio.Button value={6}>6</Radio.Button>
              <Radio.Button value={8}>8</Radio.Button>
              <Radio.Button value={12}>12</Radio.Button>
              <Radio.Button value={16}>16</Radio.Button>
              <Radio.Button value={18}>18</Radio.Button>
              <Radio.Button value={24}>24</Radio.Button>
            </Radio.Group>
          </FormItem>
          <FormItem label="默认展示" name="visible" valuePropName="checked">
            <Switch />
          </FormItem>
          <FormItem label="提示文案" name="iconTips">
            <Input />
          </FormItem>
          <FormItem
            label="隐藏时保持布局"
            name="hiddenKeepAlign"
            valuePropName="checked"
          >
            <Switch />
          </FormItem>
          <FormItem label="props" name="propsJson">
            <Input.TextArea rows={6} />
          </FormItem>
        </Form>
      </Drawer>
    </>
  );
};
export default FieldItem;
