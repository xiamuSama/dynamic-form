import { ReactNode } from "react";
import { ComponentEnum } from "../types";
import { Input, InputNumber, DatePicker } from "antd";
import Select from "./Select";

const { RangePicker } = DatePicker;
const { TextArea } = Input;
// import { InputWrapper, InputNumberWrapper } from './Input';
// import { DatePickerWrapper, RangePickerWrapper } from './DatePicker';

export const getComponent = (component: ComponentEnum): ReactNode => {
  const componentMap: {
    [key in ComponentEnum]: ReactNode;
  } = {
    // 内置通用
    Input,
    InputNumber,
    Select,
    DatePicker,
    RangePicker,
    TextArea,
    // 业务组件
  };
  return componentMap[component] as ReactNode;
};

export const getDefaultPlaceholder = (component: ComponentEnum) => {
  switch (component) {
    case "Input":
    case "InputNumber":
    case "TextArea":
      return "请输入";
    case "Select":
      return "请选择";
    default:
      return undefined;
  }
};

export const getDefaultRequiredMsg = (
  component: ComponentEnum,
  label: string
) => {
  switch (component) {
    case "Input":
    case "InputNumber":
    case "TextArea":
      return `请输入${label}`;
    case "Select":
      return `请选择${label}`;
    default:
      return undefined;
  }
};
