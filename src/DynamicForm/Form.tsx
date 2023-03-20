/*
 * @Author: sumiaoli
 * @Date: 2023-01-30 13:48:22
 * @Last Modified by: sumiaoli
 * @Last Modified time: 2023-03-02 18:24:12
 * @Description: 动态表单
 */
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useState, useEffect, useRef } from 'react';

import { Spin, Col, Form, Row } from 'antd';
import FormCard from './FormCard';
import { formatSchemaInit, initEnums } from './utils';
import { PageConfig, IDynamicFormProps, IDynamicFormApi, BlockConfig, IContextValue, ISchemeInit } from './types';
import Context from './context';

const DynamicForm = forwardRef<IDynamicFormApi, IDynamicFormProps>(({ schema, enums = {}, onFormChange, fetchConfig, header, footer }, ref) => {
    // 初始化
    const schemaInit = useMemo(() => {
        return formatSchemaInit(schema);
    }, [schema]);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);
    const [pageLoading, setPageLoading] = useState<boolean>(false);
    const [enumData, setEnumData] = useState({});
    const [blockSchema, setBlockSchema] = useState<BlockConfig[]>(schemaInit.filteredBlocks);
    // 处理后的schema备份，也是渲染视图的shema源
    const schemaInitRef = useRef<ISchemeInit>(schemaInit);
    // fetchOption请求数据的备份
    const pageDetailRef = useRef<any>({});

    useImperativeHandle(ref, () => ({
        /**
         *
         * @param isValidate
         * @returns 获取表单值
         */
        getFieldsValue: async (isValidate = true) => {
            if (loading || pageLoading) {
                throw new Error('api is pending');
            }
            if (isValidate) {
                const values = await form.validateFields();
                if (!values) return null;
                return values;
                // return formatedOutFormValue(values, schemaInitRef.current.fields);
            }
            return form.getFieldsValue(true);
        },
        /**
         *
         * @returns 获取预设枚举
         */
        getEnumsMap: () => {
            return enumData;
        },
        /**
         *
         * @returns 获取预设的page详情
         */
        getPageDetail: () => pageDetailRef.current,
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
        setPageLoading(true);
        try {
            const { api, onGetData, beforeGetData } = fetchConfig;
            if (beforeGetData) {
                beforeGetData({ schema: schemaInitRef.current.schema });
            }
            const pageDetail = await api();
            pageDetailRef.current = pageDetail;
            // 表单内置对数据处理
            // const values = formatedInFormValue(pageDetail, schemaInitRef.current.fields);

            let formatedData = {};
            // onGetData的处理
            if (onGetData) {
                const {
                    doReload,
                    doUpdate,
                    schema: newSchema,
                    data: newData,
                } = await onGetData({ data: pageDetail, schema: schemaInitRef.current.schema });

                if (doUpdate) {
                    formatedData = newData;
                }

                if (doReload) {
                    updateNewSchema(newSchema);
                }
            }
            form.setFieldsValue({
                ...pageDetail,
                ...formatedData,
            });
            setPageLoading(false);
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
            case 'Card':
                return <FormCard title={title} fields={fields!} className={className} {...others} />;
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

    if (!schemaInitRef.current.blocks.length) {
        return null;
    }

    return (
        <div id="vscodeSchema" key={schemaInitRef.current.scene}>
            <Context.Provider value={contextValue}>
                <Spin spinning={loading || pageLoading}>
                    {header ? header : null}

                    <Form form={form} layout="vertical" initialValues={schemaInitRef.current.defaultValue} onValuesChange={onValuesChange}>
                        <Row gutter={24}>
                            {blockSchema.map(block => (
                                <Col key={block.code} span={block.span || 24}>
                                    {renderBlock(block)}
                                </Col>
                            ))}
                        </Row>
                    </Form>
                    {footer ? footer : null}
                </Spin>
            </Context.Provider>
        </div>
    );
});

export default DynamicForm;
