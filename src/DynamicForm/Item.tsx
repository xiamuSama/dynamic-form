import React, { useCallback, useMemo } from 'react';
import { Form } from 'antd';

import { IFieldConfig } from './types';
import { getComponent, getDefaultPlaceholder, getDefaultRequiredMsg, getFormItemExtraProps } from './components';

const FormItem = Form.Item;

interface ItemProps {
    field: IFieldConfig;
    independentModel?: boolean;
    blockCode?: string;
}

const Item = ({ field, independentModel, blockCode }: ItemProps) => {
    const formatItemProps = useMemo(() => {
        const { name, code, required, requiredMsg, iconTips, component } = field;
        // todo: rules拓展
        const rulesList = [] as any;
        if (required) {
            rulesList.push({
                // todo: 自定义组件
                // validator: (rule, value) => {
                //     return isNull(value) ? Promise.reject(requiredMsg || `请输入${label}`) : Promise.resolve();
                // },
                required: true,
                message: requiredMsg || getDefaultRequiredMsg(component, name),
            });
        }
        // 组件差异化的formItem属性
        const others = getFormItemExtraProps(component);

        return {
            ...others,
            name: independentModel ? `${blockCode}.${code}` : code,
            label: name,
            required,
            rules: rulesList.length ? rulesList : undefined,
            tooltip: iconTips ? <div style={{ whiteSpace: 'pre-line' }}>{iconTips}</div> : undefined,
        };
    }, [field]);

    const renderField = useCallback(() => {
        const { component, props = {}, customComponent } = field;
        const Field = getComponent(component, customComponent);
        const placeholder = getDefaultPlaceholder(component);
        if (Field) {
            // @ts-ignore
            return <Field placeholder={placeholder} {...props} />;
        }
        return null;
    }, [field]);

    // // 隐藏时组件保持布局
    if (field.hiddenKeepAlign && field.show === false) {
        return <></>;
    }
    // 不需要formItem，自定义整个表单item
    if (field.component === 'Custom' && field.customComponent && field.withoutFormItem) {
        return renderField();
    }

    return <FormItem {...formatItemProps}>{renderField()}</FormItem>;
};

export default Item;
