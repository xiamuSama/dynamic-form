import React, { useCallback, useMemo } from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';

const { RangePicker } = DatePicker;

const DatePickerWrapper = ({ format, value, onChange, ...others }) => {
    const valueMemo = useMemo(() => {
        if (!value) {
            return undefined;
        }
        return moment(value);
    }, [value]);

    const handleChange = useCallback(
        val => {
            if (val) {
                const formatedValue = moment(val).format(format || 'YYYY-MM-DD');
                onChange(formatedValue);
                return;
            }
            onChange(undefined);
        },
        [format]
    );

    return <DatePicker value={valueMemo} style={{ width: '100%' }} format={format || 'YYYY-MM-DD'} onChange={handleChange} {...others} />;
};

const RangePickerWrapper = ({ format, rangeFormat, value, onChange, ...others }) => {
    const valueMemo = useMemo(() => {
        if (!value || value.length !== 2) {
            return undefined;
        }
        const [a, b] = value;
        return [moment(a), moment(b)];
    }, [value]);

    const handleChange = useCallback(
        val => {
            if (val) {
                const [a, b] = val;
                const start = moment(a).format(format || 'YYYY-MM-DD');
                const end = moment(b).format(format || 'YYYY-MM-DD');

                onChange([start, end]);
                return;
            }
            onChange(undefined);
        },
        [format]
    );

    return <RangePicker value={valueMemo as any} style={{ width: '100%' }} format={format || 'YYYY-MM-DD'} onChange={handleChange} {...others} />;
};

export { DatePickerWrapper, RangePickerWrapper };
