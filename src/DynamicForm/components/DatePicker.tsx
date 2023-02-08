import React from 'react';
import { DatePicker, DatePickerProps } from 'antd';
const { RangePicker } = DatePicker;
// import moment from 'moment';

const DatePickerWrapper = ({ format }: DatePickerProps) => {
    return <DatePicker style={{ width: '100%' }} format={format || 'YYYY-MM-DD'} />;
};

const RangePickerWrapper = ({ format }: DatePickerProps) => {
    return <RangePicker style={{ width: '100%' }} format={format || 'YYYY-MM-DD'} />;
};

export { DatePickerWrapper, RangePickerWrapper };
