import React, { memo, useContext, useMemo } from 'react';
import { Select } from 'antd';
import { IFieldSelectProps } from '../types';
import context from '../context';

const SelectWrapper = ({ options, showSearch, optionsEnum, sourceMapping, ...other }: IFieldSelectProps) => {
    const { enums } = useContext(context);

    const optionsMemo = useMemo(() => {
        if (optionsEnum && enums[optionsEnum]) {
            // sourceMapping匹配
            const mappedItem = enums[optionsEnum] || [];
            if (!mappedItem.length) {
                return [];
            }
            return mappedItem.map(v => {
                if (typeof v === 'string') {
                    return {
                        label: v,
                        value: v,
                    };
                }
                // else object
                if (sourceMapping) {
                    return {
                        label: v[sourceMapping.label],
                        value: v[sourceMapping.value],
                    };
                }
                return {
                    label: v.label,
                    value: v.value,
                };
            });
        }
        if (options && options.length) {
            // sourceMapping匹配必要性？？
            return options;
        }
        return [];
    }, [enums]);

    return <Select options={optionsMemo} showSearch={showSearch} optionFilterProp={showSearch ? 'label' : 'value'} {...other} />;
};

export default memo(SelectWrapper);
