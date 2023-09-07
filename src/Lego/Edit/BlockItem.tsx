import React, { useState } from "react";
import {
  Button,
  Form,
  Row,
  Col,
  Input,
  Select,
  Switch,
  Radio,
  Drawer,
  message,
  Card,
} from "antd";
import { PlusOutlined, CloseOutlined } from "@ant-design/icons";

import { BlockConfig } from "./types";
import FieldItem from "./FieldItem";
import "./index.css";
import { defaultFieldItem } from "../mock";

const FormItem = Form.Item;
const Option = Select.Option;

interface IProps {
  config: BlockConfig;
  setBlocks: React.Dispatch<React.SetStateAction<BlockConfig[]>>;
  queque: number;
  blockLength: number;
}

const BlockItem = ({ config, setBlocks, queque, blockLength }: IProps) => {
  const [show, setShow] = useState(false);
  const [form] = Form.useForm();

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

        setBlocks((v) => {
          v[queque] = {
            ...v[queque],
            ...values,
          };
          return ([] as BlockConfig[]).concat(v);
        });
        onDrawerCancel();
      })
      .catch();
  };

  const changeBlock = (type: "up" | "down" | "del") => {
    switch (type) {
      case "del":
        setBlocks((v) => {
          v.splice(queque, 1);
          return ([] as BlockConfig[]).concat(v);
        });
        break;
      case "down":
        setBlocks((v) => {
          let temp = v[queque + 1];
          v[queque + 1] = v[queque];
          v[queque] = temp;
          return ([] as BlockConfig[]).concat(v);
        });
        break;

      case "up":
        setBlocks((v) => {
          let temp = v[queque - 1];
          v[queque - 1] = v[queque];
          v[queque] = temp;
          return ([] as BlockConfig[]).concat(v);
        });
        break;
      default:
        return;
    }
  };

  const changeField = (
    type: "up" | "down" | "del" | "add",
    fieldIndex: number
  ) => {
    const newFields = [...(config.fields || [])];
    switch (type) {
      case "add":
        newFields.push({ ...defaultFieldItem });
        setBlocks((v) => {
          v[queque].fields = newFields;
          return ([] as BlockConfig[]).concat(v);
        });
        break;
      case "del":
        newFields.splice(fieldIndex, 1);
        setBlocks((v) => {
          v[queque].fields = newFields;
          return ([] as BlockConfig[]).concat(v);
        });
        break;
      default:
        return;
    }
  };

  const onFieldSave = (fieldIndex: number, values: any) => {
    const newFields = [...(config.fields || [])];
    newFields[fieldIndex] = {
      ...newFields[fieldIndex],
      ...values,
    };
    setBlocks((v) => {
      v[queque].fields = newFields;
      return ([] as BlockConfig[]).concat(v);
    });
  };

  return (
    <>
      <Card
        title={config.title || "{title}"}
        style={{ marginBottom: 20 }}
        extra={
          <>
            {queque > 0 && (
              <Button
                type="link"
                onClick={() => {
                  changeBlock("up");
                }}
              >
                上移
              </Button>
            )}
            {queque < blockLength - 1 && (
              <Button
                type="link"
                onClick={() => {
                  changeBlock("down");
                }}
              >
                下移
              </Button>
            )}

            <Button
              type="link"
              onClick={() => {
                setShow(true);
                form.setFieldsValue({
                  ...config,
                  propsJson: config.propsJson || "{\n\n\n\n\n}",
                });
              }}
            >
              设置
            </Button>
            <Button
              type="link"
              onClick={() => {
                changeBlock("del");
              }}
            >
              删除
            </Button>
          </>
        }
      >
        <Row gutter={24}>
          {config.fields?.map((v, index) => (
            <Col
              span={v.alignSpan || v.span}
              key={index}
              style={{ position: "relative" }}
            >
              <FieldItem config={v} queque={index} onFieldSave={onFieldSave} />

              <CloseOutlined
                className={"delIcon"}
                onClick={(e:any) => {
                  e.stopPropagation();
                  changeField("del", index);
                }}
              />
            </Col>
          ))}
        </Row>
        <Button
          type={"dashed"}
          onClick={() => {
            changeField("add", -1);
          }}
          icon={<PlusOutlined />}
          className={"addButton"}
        >
          新建字段
        </Button>
      </Card>
      <Drawer
        title="区块配置"
        placement="right"
        onClose={onDrawerCancel}
        visible={show}
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
            label="标题"
            name="title"
            required
            rules={[{ required: true }]}
          >
            <Input />
          </FormItem>
          <FormItem label="布局" name="span" required>
            <Radio.Group>
              <Radio.Button value={6}>1</Radio.Button>
              <Radio.Button value={12}>2</Radio.Button>
              <Radio.Button value={18}>3</Radio.Button>
              <Radio.Button value={24}>4</Radio.Button>
            </Radio.Group>
          </FormItem>
          <FormItem label="区块类型" name="componentName" required>
            <Select>
              <Option value="Card">卡片</Option>
            </Select>
          </FormItem>
          <FormItem label="默认展示" name="visible" valuePropName="checked">
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
export default BlockItem;
