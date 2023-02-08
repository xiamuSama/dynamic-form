/*
 * @Author: sumiaoli
 * @Date: 2023-01-30 13:48:22
 * @Last Modified by: sumiaoli
 * @Last Modified time: 2023-02-08 15:56:19
 * @Description: 动态表单
 */
import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";

import { Spin, Col, Form, Row, Button } from "antd";
import FormCard from "./FormCard";
import {
  formatSchemaInit,
  initEnums,
  formatedOutFormValue,
  formatedInFormValue,
  updateSchemaBlockHook,
  updateSchemaFieldHook,
} from "./utils";
import {
  PageConfig,
  IDynamicFormProps,
  IDynamicFormApi,
  BlockConfig,
  IContextValue,
  ISchemeInit,
} from "./types";
import Context from "./context";

const DynamicForm = forwardRef<IDynamicFormApi, IDynamicFormProps>(
  ({ schema, enums = {}, onFormChange, fetchConfig }, ref) => {
    const schemaInit = useMemo(() => {
      return formatSchemaInit(schema);
    }, [schema]);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);
    const [pageLoading, setPageLoading] = useState<boolean>(false);
    const [enumData, setEnumData] = useState({});
    const [blockSchema, setBlockSchema] = useState<BlockConfig[]>(
      schemaInit.filteredBlocks
    );
    // 先存一份
    const schemaInitRef = useRef<ISchemeInit>(schemaInit);

    useImperativeHandle(ref, () => ({
      getFieldsValue: async (isValidate = true) => {
        if (isValidate) {
          const values = await form.validateFields().catch((e) => {
            return null;
          });

          if (!values) return null;
          return formatedOutFormValue(
            values,
            schemaInitRef.current.filteredFields
          );
        }
        return form.getFieldsValue(true);
      },
    }));

    useEffect(() => {
      // 构建enums， todo：变同步？
      getEnums();
      getPageDetail();
    }, []);

    const getEnums = useCallback(async () => {
      if (Object.keys(enums).length) {
        setLoading(true);
        const res = await initEnums(enums);
        setEnumData(res);
        setLoading(false);
      }
    }, []);

    const getPageDetail = useCallback(async () => {
      if (!fetchConfig || !fetchConfig.doFetch) {
        return;
      }
      // setPageLoading(true);
      try {
        const { api, onGetData } = fetchConfig;
        const pageDetail = await api();
        // 表单内置对数据处理
        const values = formatedInFormValue(
          pageDetail,
          schemaInit.filteredFields
        );
        let formatedData = {};
        // onGetData的处理
        if (onGetData) {
          const {
            doReload,
            doUpdate,
            schema: newSchema,
            data: newData,
          } = await onGetData({ data: values, schema });
          if (doUpdate) {
            formatedData = newData;
          }
          if (doReload) {
            updateNewSchema(newSchema);
          }
        }
        form.setFieldsValue({
          ...values,
          ...formatedData,
        });
      } catch (error) {
        setPageLoading(false);
      }
    }, []);

    const updateNewSchema = useCallback((schema: PageConfig) => {
      const formatedInit = formatSchemaInit(schema);
      setBlockSchema(formatedInit.filteredBlocks);
      schemaInitRef.current = formatedInit;
    }, []);

    const contextValue: IContextValue = useMemo(() => {
      return {
        enums: enumData,
      };
    }, [enumData]);

    const renderBlock = useCallback((block: BlockConfig) => {
      const { componentName, title, fields, className, ...others } = block;

      switch (componentName) {
        case "Card":
          return (
            <FormCard
              title={title}
              fields={fields!}
              className={className}
              {...others}
            />
          );
        default:
          return null;
      }
    }, []);

    const onValuesChange = useCallback(
      async (changedValues, allValues) => {
        if (!onFormChange) {
          return;
        }
        try {
          const itemName = Object.keys(changedValues)[0];
          // ?? onFormChange集成字符串
          const {
            doReload,
            doUpdate,
            schema: newSchema,
            data: newData,
          } = await onFormChange({
            name: itemName,
            data: allValues,
            schema,
            enums: enumData,
          });
          if (doReload) {
            updateNewSchema(newSchema);
          }
          if (doUpdate) {
            form.setFieldsValue({
              ...newData,
            });
          }
        } catch (error) {
          console.error(error);
        }
      },
      [enumData]
    );

    if (!schemaInit.blocks.length) {
      return null;
    }

    return (
      <div id="vscodeSchema" key={schemaInit.scene}>
        <Context.Provider value={contextValue}>
          <Spin spinning={loading || pageLoading}>
            <Form
              form={form}
              layout="vertical"
              initialValues={schemaInit.defaultValue}
              onValuesChange={onValuesChange}
            >
              <Row gutter={24}>
                {blockSchema.map((block) => (
                  <Col key={block.code} span={block.span || 24}>
                    {renderBlock(block)}
                  </Col>
                ))}
              </Row>
            </Form>
          </Spin>
        </Context.Provider>
      </div>
    );
  }
);

export default memo(DynamicForm);
export { type IDynamicFormApi, updateSchemaBlockHook, updateSchemaFieldHook };
