import React from 'react';
import { Space, InputNumber } from 'antd';

const ForbiddenRule = ({ ...others }) => {
    return (
        <Space>
            账单逾期天数 &gt;
            <InputNumber style={{ width: 120 }} addonAfter="天" min={1} precision={0} {...others} />
        </Space>
    );
};

export default ForbiddenRule;
