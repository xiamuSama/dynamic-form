import React, { useCallback, useEffect, useRef } from "react";
import { Button } from "antd";
import "./App.css";
import {
  DynamicForm,
  IDynamicFormApi,
  updateSchemaFieldHook,
} from "./DynamicForm";
import Edit from "./Lego/Edit";

function App() {
  const formRef = useRef<IDynamicFormApi>(null);

  useEffect(() => {}, []);

  const handleClick = useCallback(() => {
    formRef.current?.getFieldsValue().then((values) => {
      console.log("values", values);
    });
  }, []);

  return (
    <div className="App">
      <DynamicForm
        ref={formRef}
        enums={{
          hobbys: () => {
            return new Promise((r) => {
              setTimeout(() => {
                r([
                  { name: "唱", id: "c" },
                  { name: "跳", id: "t" },
                  { name: "rap", id: "r" },
                  { name: "篮球", id: "l" },
                ]);
              }, 300);
            });
          },
        }}
        onFormChange={async ({ name, schema, data }) => {
          const checkedItem = data[name];
          if (name === "name") {
            data.remark = checkedItem;
          }
          if (name === "hobbys") {
            updateSchemaFieldHook(
              schema,
              "baseInfo.display.show",
              !checkedItem
            );
          }
          return {
            data,
            schema,
            doUpdate: true,
            doReload: true,
          };
        }}
        schema={{
          scene: "Create",
          blocks: [
            {
              span: 24,
              code: "baseInfo",
              componentName: "Card",
              title: "基本信息",
              fields: [
                {
                  code: "name",
                  name: "姓名",
                  span: 6,
                  component: "Input",
                  required: true,
                },
                {
                  code: "name2",
                  name: "姓名(默认值)",
                  span: 6,
                  component: "Input",
                  defaultValue: "cxk",
                },
                {
                  code: "hobbys",
                  name: "爱好",
                  span: 6,
                  component: "Select",
                  props: {
                    allowClear: true,
                    options: [
                      { label: "唱", value: "c" },
                      { label: "跳", value: "t" },
                      { label: "rap", value: "r" },
                      { label: "篮球", value: "l" },
                    ],
                  },
                },
                {
                  code: "hobbys2",
                  name: "爱好（远程数据源）",
                  span: 6,
                  component: "Select",
                  props: {
                    optionsEnum: "hobbys",
                    sourceMapping: {
                      label: "name",
                      value: "id",
                    },
                  },
                },
                {
                  code: "duration",
                  name: "时长",
                  span: 6,
                  component: "InputNumber",
                  defaultValue: 2.5,
                  props: {
                    addonAfter: "年",
                    style: {
                      width: "100%",
                    },
                  },
                },
                {
                  code: "date",
                  name: "开始时间",
                  span: 6,
                  component: "DatePicker",
                  props: {
                    addonAfter: "年",
                    style: {
                      width: "100%",
                    },
                  },
                },
                {
                  code: "display",
                  name: "联动显隐（有爱好时隐藏）",
                  span: 6,
                  component: "Input",
                  defaultValue: "只因",
                  props: {
                    disabled: true,
                  },
                },
                {
                  code: "remark",
                  name: "备注(输入姓名联动到备注)",
                  span: 24,
                  component: "TextArea",
                  props: {
                    style: {
                      // width: "0%",
                    },
                  },
                },
              ],
            },
          ],
        }}
      />
      <Button onClick={handleClick}>获取数据</Button>
      <hr />
      <Edit />
    </div>
  );
}

export default App;
