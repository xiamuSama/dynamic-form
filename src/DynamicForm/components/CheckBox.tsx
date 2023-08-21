import React from 'react';
import { Checkbox } from 'antd';

const CheckboxWrapper = ({ options, ...others }) => {
    return <Checkbox.Group options={options} {...others} />;
};

export default CheckboxWrapper;
