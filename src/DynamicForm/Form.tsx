/*
 * @Author: sumiaoli
 * @Date: 2023-01-30 13:48:22
 * @Last Modified by: sumiaoli
 * @Last Modified time: 2023-08-09 16:47:09
 * @Description: 动态表单,有改动告知sml
 */
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useState, useEffect, useRef } from 'react';

import { Spin, Col, Form, Row } from 'antd';
import FormCard from './FormCard';
import Item from './Item';
import { formatSchemaInit, initEnums, formatedOutFormValue, formatedInFormValue, getWrapColBlocks } from './utils';
import { PageConfig, IDynamicFormProps, IDynamicFormApi, BlockConfig, IContextValue, ISchemeInit, IUseForm } from './types';
import Context from './context';
import useForm from './useForm';

const DynamicForm = forwardRef<IDynamicFormApi, IDynamicFormProps>(
    ({ schema, enums = {}, actions = {}, onFormChange, fetchConfig, afterGetEnums }, ref) => {
        // 初始化
        const schemaInit = useMemo(() => {
            return formatSchemaInit(schema);
        }, [schema]);
        const [form] = Form.useForm();
        const [loading, setLoading] = useState<boolean>(false);
        const [enumData, setEnumData] = useState({});
        const [blockSchema, setBlockSchema] = useState<BlockConfig[]>(schemaInit.filteredBlocks);
        // 处理后的schema备份，也是渲染视图的shema源
        const schemaInitRef = useRef<ISchemeInit>(schemaInit);
        // fetchOption请求数据的备份
        const pageDetailRef = useRef<any>({});
        const enumDataRef = useRef<any>({});

        useImperativeHandle(ref, () => ({
            /**
             *
             * @param isValidate
             * @returns 获取表单值
             */
            getFieldsValue: async (isValidate = true) => {
                if (loading) {
                    throw new Error('api is pending');
                }
                if (isValidate) {
                    const values = await form.validateFields();
                    if (!values) return null;
                    return formatedOutFormValue(values);
                }
                return formatedOutFormValue(form.getFieldsValue());
            },
            /**
             *
             * @returns 获取预设枚举
             */
            getEnumsMap: () => {
                return enumDataRef.current;
            },
            /**
             *
             * @returns 获取预设的page详情
             */
            getPageDetail: () => pageDetailRef.current,
            /**
             *
             * @returns 获取最新的schema
             */
            getCurrentSchema: () => schemaInitRef.current.schema,
            /**
             *
             * @param data 塞入表单最新的值，需注意：如果是多模型的数据，key需要加上区块Code,如{区块Code}.{字段key}
             */
            unsafe_forceSetFormData: (data: { [key: string]: any }) => {
                form.setFieldsValue({
                    ...data,
                });
            },
            /**
             *
             * @param schema 塞入表单最新的schema
             */
            unsafe_forceSetFormSchema: (schema: PageConfig) => {
                updateNewSchema(schema);
            },
            /**
             *
             * @param isData 是否重置formData
             * @param isSchema 是否重置组件
             */
            unsafe_forceResetForm: (isData: boolean, isSchema: boolean) => {
                isData && form.resetFields();
                isSchema && updateNewSchema(schema);
            },
        }));

        useEffect(() => {
            initFetchData();
            return () => {
                enumDataRef.current = null;
                pageDetailRef.current = null;
            };
        }, []);

        const initFetchData = useCallback(async () => {
            try {
                setLoading(true);
                // 构建enums
                await fetchEnums();
                await fetchPageDetail();
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        }, []);

        const fetchEnums = useCallback(async () => {
            if (Object.keys(enums).length) {
                const res = await initEnums(enums);
                setEnumData(res);
                enumDataRef.current = res;
                afterGetEnums && afterGetEnums(JSON.parse(JSON.stringify(res)));
            }
        }, []);

        const fetchPageDetail = useCallback(async () => {
            if (!fetchConfig || !fetchConfig.doFetch) {
                return;
            }
            const { api, onGetData, beforeGetData } = fetchConfig;
            if (beforeGetData) {
                await beforeGetData({ schema: schemaInitRef.current.schema });
            }
            const pageDetail = await api();
            pageDetailRef.current = pageDetail;
            // 表单内置对数据处理
            const values = formatedInFormValue(pageDetail, schemaInitRef.current.blocks);
            let formatedData = {};

            // onGetData的处理
            if (onGetData) {
                const {
                    doReload,
                    doUpdate,
                    schema: newSchema,
                    data: newData,
                } = await onGetData({ data: pageDetail, schema: schemaInitRef.current.schema, formatedData: values });

                if (doUpdate) {
                    formatedData = newData;
                }
                if (doReload) {
                    updateNewSchema(newSchema);
                }
            }
            form.setFieldsValue({
                ...values,
                // onGetData返回的数据优先级更高
                ...formatedData,
            });
        }, []);

        const updateNewSchema = useCallback((schema: PageConfig) => {
            const formatedInit = formatSchemaInit(schema);
            setBlockSchema(formatedInit.filteredBlocks);
            schemaInitRef.current = formatedInit;
        }, []);

        const contextValue: IContextValue = useMemo(() => {
            return {
                enums: enumData,
                formRef: ref,
            };
        }, [enumData]);

        const renderBlock = useCallback(
            (block: BlockConfig) => {
                const { componentName, title, fields, className, code, independentModel, action } = block;

                switch (componentName) {
                    case 'Card':
                        const extra = action && actions[action] ? actions[action]() : undefined;

                        return (
                            <FormCard
                                blockCode={code}
                                title={title}
                                fields={fields!}
                                className={className}
                                independentModel={independentModel}
                                extra={extra}
                            />
                        );
                    case 'FormItem':
                        return <Item blockCode={code} field={fields![0]} />;
                    default:
                        return null;
                }
            },
            [actions]
        );

        const onValuesChange = useCallback(
            async (changedValues, _) => {
                if (!onFormChange) {
                    return;
                }
                const allValues = form.getFieldsValue(true);

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
                        schema: schemaInitRef.current.schema,
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

        /**
         * 包了一层col
         */
        const renderWrapCol = useCallback(
            (wrapCol: (12 | 24)[]) => {
                const blockSlots = getWrapColBlocks(wrapCol, blockSchema);

                return blockSlots.map((v, index) => (
                    <Col key={index} span={v.col}>
                        <Row gutter={24}>
                            {v.blocks.map(block => (
                                <Col key={block.code} span={block.span || 24}>
                                    {renderBlock(block)}
                                </Col>
                            ))}
                        </Row>
                    </Col>
                ));
            },
            [blockSchema]
        );

        if (!schemaInitRef.current.blocks.length) {
            return null;
        }

        return (
            <div id="vscodeSchema" key={schemaInitRef.current.scene}>
                <Context.Provider value={contextValue}>
                    <Spin spinning={loading}>
                        <Form
                            form={form}
                            layout="vertical"
                            initialValues={schemaInitRef.current.defaultValue}
                            onValuesChange={onValuesChange}
                            // preserve={false}
                        >
                            <Row gutter={24}>
                                {schemaInit.wrapCol && schemaInit.wrapCol.length
                                    ? renderWrapCol(schemaInit.wrapCol)
                                    : blockSchema.map(block => (
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

// 慎用=============
/**
 * 获取当前组件被包裹的form实例
 */
(DynamicForm as any).useFormRef = useForm;

export default DynamicForm as React.ForwardRefExoticComponent<IDynamicFormProps & React.RefAttributes<IDynamicFormApi>> & {
    useFormRef: IUseForm;
};
