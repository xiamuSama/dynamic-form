import React from 'react';
import { Radio, RadioGroupProps } from 'antd';

const RadioWrapper = ({ options, ...others }: RadioGroupProps) => {
    return <Radio.Group options={options} {...others} />;
};

export default RadioWrapper;
