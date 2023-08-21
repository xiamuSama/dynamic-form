import React from 'react';
import { Input, InputProps, InputNumber } from 'antd';
import { IFieldInputProps } from '../types';

const InputWrapper = ({ suffix, placeholder, maxLength, addonAfter, ...others }: InputProps) => {
    return <Input placeholder={placeholder || '请输入'} {...others} />;
};

const InputNumberWrapper = ({ placeholder, style = {}, numberType, ...others }: IFieldInputProps) => {
    let extraProps = {};
    if (numberType === 'Cell') {
        extraProps = {
            ...extraProps,
            addonAfter: '元',
            min: 0,
            precision: 2,
        };
    }
    if (numberType === 'Int') {
        extraProps = {
            ...extraProps,
            min: 0,
            precision: 0,
        };
    }
    return <InputNumber style={{ width: '100%', ...style }} placeholder={placeholder || '请输入'} {...extraProps} {...others} />;
};

export { InputWrapper, InputNumberWrapper };
