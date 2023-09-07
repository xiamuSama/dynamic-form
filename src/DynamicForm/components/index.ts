import { ReactNode } from 'react';
import { ComponentEnum } from '../types';
import { Input, FormItemProps } from 'antd';
import { getCustomComponent } from './Custom';
import ErrorText from './Error';
import { InputNumberWrapper } from './Input';
import SelectWraper from './Select';
import { DatePickerWrapper, RangePickerWrapper } from './DatePicker';
import SwitchWrapper from './Switch';
import RadioWrapper from './Radio';
import CheckboxWrapper from './CheckBox';

const { TextArea } = Input;

const componentMap: {
    [key in ComponentEnum]: ReactNode;
} = {
    // todos: input系列暂时没有二次封装的用途,直接用antd的内置, 后面再拓展
    // 内置通用
    Input,
    InputNumber: InputNumberWrapper,
    Select: SelectWraper,
    DatePicker: DatePickerWrapper,
    RangePicker: RangePickerWrapper,
    TextArea,
    Switch: SwitchWrapper,
    Radio: RadioWrapper,
    Checkbox: CheckboxWrapper,
    // 自定义拓展的业务组件
    Custom: ErrorText,
};

export const getComponent = (component: ComponentEnum, customComponent?: string) => {
    // 自定义拓展的业务组件
    if (component === 'Custom' && customComponent) {
        const mapped = getCustomComponent(customComponent);
        return mapped ? mapped : componentMap['Custom'];
    }
    return componentMap[component];
};

export const getDefaultPlaceholder = (component: ComponentEnum) => {
    switch (component) {
        case 'Input':
        case 'InputNumber':
        case 'TextArea':
            return '请输入';
        case 'Select':
        case 'Switch':
        case 'Radio':
            return '请选择';
        default:
            return undefined;
    }
};

export const getDefaultRequiredMsg = (component: ComponentEnum, label: string) => {
    switch (component) {
        case 'Input':
        case 'InputNumber':
        case 'TextArea':
            return `请输入${label}`;
        case 'Select':
        case 'Radio':
        case 'Switch':
        case 'UploadImageMultiple':
            return `请选择${label}`;
        default:
            return undefined;
    }
};

export const getFormItemExtraProps = (component: ComponentEnum): Object => {
    const obj = {} as FormItemProps;
    switch (component) {
        case 'Switch':
            obj.valuePropName = 'checked';
            break;
        default:
            break;
    }
    return obj;
};
