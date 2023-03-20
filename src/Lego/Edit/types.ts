export interface BlockConfig {
    span?: number;
    code: string;
    title: string;
    componentName: string;
    visible?: boolean;
    props?: object;
    propsJson?: string;
    fields?: IFieldConfig[];
}
export type ComponentEnum =
    | 'Input'
    | 'InputNumber'
    | 'TextArea'
    | 'Select'
    | 'DatePicker'
    | 'RangePicker'
    | 'Switch'
    | 'Radio'
    | 'Custom';

export interface IFieldConfig {
    key?: string;
    name: string;
    code: string;
    defaultValue?: any;
    component: ComponentEnum; // 内置组件
    /**
     * 自定义拓展的业务组件名，启用时component：Custom
     */
    customComponent?: string;
    /**
     * 组件实际渲染的width
     */
    span: number;
    /**
     * 组件实际在栅格渲染的width,用于布局，一般
     * 常见select单独占一行，宽度却要1/3,此时设置span:8,alignSpan:24
     */
    alignSpan?: 6 | 12 | 18 | 24 | 8 | 16;
    props?: object;
    propsJson?: string;
    show?: boolean;
    required?: boolean;
    requiredMsg?: string;
    /**
     * 内置的校验器
     */
    rules?: [];
    /**
     * 提示
     */
    iconTips?: string;
    /**
     * 字段隐藏时保持布局
     */
    hiddenKeepAlign?: boolean;
}
