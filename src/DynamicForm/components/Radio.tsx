import React, { useMemo } from 'react';
import { Radio } from 'antd';

const RadioWrapper = ({ options, optionsEnum, ...others }) => {
    const optionsMemo = useMemo(() => {
        if (optionsEnum === 'bool') {
            return [
                { label: '是', value: true },
                { label: '否', value: false },
            ];
        }
        // todo远程数据源
        return options || [];
    }, [optionsEnum, options]);

    return <Radio.Group options={optionsMemo} {...others} />;
};

export default RadioWrapper;
