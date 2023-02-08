import React from 'react';
import { Input, InputProps, InputNumber, InputNumberProps } from 'antd';

const InputWrapper = ({ suffix, placeholder, maxLength, addonAfter, ...others }: InputProps) => {
    return <Input placeholder={placeholder || '请输入'} {...others} />;
};

const InputNumberWrapper = ({ placeholder, maxLength, addonAfter, min, max, precision, style = {} }: InputNumberProps) => {
    return (
        <InputNumber
            style={{ width: '100%', ...style }}
            maxLength={maxLength}
            placeholder={placeholder || '请输入'}
            addonAfter={addonAfter}
            min={min}
            max={max}
            precision={precision}
        />
    );
};

export { InputWrapper, InputNumberWrapper };
