import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { PageLayout, Box } from '@/components';
import { Button } from 'antd';

import { IDynamicFormProps, IDynamicFormApi } from './types';
import Form from './Form';

const { Header: PageHeader, Footer: PageFooter } = PageLayout;

interface IDynamicPageProps extends IDynamicFormProps {
    header?: string;
    footer?: ('ok' | 'cancel')[];
    /**
     *
     * @param values 表单数据
     * @returns 请求防重，需要把接口await住
     */
    onOk?: (values: any) => Promise<any>;
    onCancel?: () => void;
}

interface IDynamicPageApi {
    getFormApi: () => IDynamicFormApi | null;
}

const DynamicPage = forwardRef<IDynamicPageApi, IDynamicPageProps>(({ header, footer, onCancel, onOk, ...others }, ref) => {
    const [btnLoading, setBtnLoading] = useState(false);

    const formRef = useRef<IDynamicFormApi>(null);

    useImperativeHandle(ref, () => ({
        /**
         *
         * @returns 最好别用，用了就应该考虑直接用dynamicForm
         */
        getFormApi: () => formRef.current,
    }));

    const headerMemo = useMemo(() => {
        return header ? <PageHeader title={header} /> : undefined;
    }, [header]);

    const handleCancel = useCallback(() => {
        if (onCancel) {
            onCancel();
            return;
        }
        history.back();
    }, []);

    const handleSave = useCallback(async () => {
        if (!onOk) {
            return;
        }
        setBtnLoading(true);
        try {
            const vals = await formRef.current?.getFieldsValue();
            await onOk(vals);
            setBtnLoading(false);
        } catch (error) {
            setBtnLoading(false);
        }
    }, []);

    const footerMemo = useMemo(() => {
        return footer && footer.length ? (
            <PageFooter
                extra={
                    <>
                        {footer.includes('cancel') && (
                            <Button onClick={handleCancel} loading={btnLoading}>
                                取消
                            </Button>
                        )}
                        {footer.includes('ok') && (
                            <Button onClick={handleSave} loading={btnLoading} type="primary">
                                保存
                            </Button>
                        )}
                    </>
                }
            />
        ) : undefined;
    }, [footer, btnLoading]);

    return (
        <PageLayout>
            {headerMemo}
            <Box>
                <Form {...others} ref={formRef} />
            </Box>
            {footerMemo}
        </PageLayout>
    );
});

export default DynamicPage;
