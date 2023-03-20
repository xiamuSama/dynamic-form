import React from 'react';
import { Switch } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

const SwitchWrapper = ({ ...others }) => {
    return <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} {...others} />;
};

export default SwitchWrapper;
