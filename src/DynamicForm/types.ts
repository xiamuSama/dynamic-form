import { ReactNode } from 'react';

interface IPageHeader {
    title: string;
}

interface IPageFooter {
    buttons: ('ok' | 'cancel')[];
}
export interface PageConfig {
    scene: string;
    blocks: BlockConfig[];
    header?: IPageHeader;
    footer?: IPageFooter;
}

export interface BlockConfig {
    /**
     * 区块占款，gutter：24
     */
    span?: number;
    code: string;
    title: string;
    // todo: 待拓展
    componentName: 'Card';
    visible?: boolean;
    fields?: IFieldConfig[];
    className?: string;
    footer?: () => ReactNode;
}

export type ComponentEnum = 'Input' | 'InputNumber' | 'TextArea' | 'Select' | 'DatePicker' | 'RangePicker' | 'Switch' | 'Radio' | 'Custom';

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
    props?: {
        style?: {
            [key: string]: string;
        };
        className?: string;
    } & IFieldInputProps &
        IFieldSelectProps &
        IFieldDatePickerProps;
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

export interface IDynamicFormProps {
    schema: PageConfig;
    enums?: {
        [key: string]: () => Promise<TEnumItem[]>;
    };
    onFormChange?: IDynamicFormChange<any>;
    /**
     * 编辑时获取数据回填
     */
    fetchConfig?: {
        doFetch?: boolean;
        api: () => Promise<any>;
        /**
         * 请求详情前的钩子，设置全局loading这些
         */
        beforeGetData?: (a: { schema: PageConfig }) => void;
        /**
         * 获取详情，对回填数据和联动进行处理
         */
        onGetData?: (a: { data: any; schema: PageConfig }) => Promise<IFormReturn>;
    };
    header?: ReactNode;
    footer?: ReactNode;
}

export type IDynamicFormChange<T> = (a: {
    /**
     * change的行
     */
    name: keyof T;
    schema: PageConfig;
    /**
     * 表单此时的data
     */
    data: T;
    /**
     * 存的枚举
     */
    enums: {
        [key: string]: string[] | object[];
    };
}) => Promise<IFormReturn>;

interface IFormReturn {
    /**
     * 塞入表单最新的schema
     */
    schema: PageConfig;
    /**
     * 是否更新最新的schema
     */
    doReload?: boolean;
    /**
     * 塞入表单最新的值
     */
    data: any;
    /**
     * 是否更新最新的表单值
     */
    doUpdate?: boolean;
}

export interface IFieldInputProps {
    maxLength?: number;
    placeholder?: string;
    addonAfter?: ReactNode;
    suffix?: ReactNode;
}
export interface IFieldSelectProps {
    placeholder?: string;
    /**
     * 优先级optionsEnum > options
     */
    options?: { value: any; label: string }[];
    optionsEnum?: string;
    /**
     * 远程数据源的labl，value对应
     */
    sourceMapping?: {
        label: string;
        value: string;
    };
    allowClear?: boolean;
    mode?: 'multiple' | 'tags';
    showSearch?: boolean;
    maxTagCount?: number;
    labelInValue?: boolean;
}

export interface IFieldDatePickerProps {
    allowClear?: boolean;
    format?: string;
}

export interface ISchemeInit {
    schema: PageConfig;
    scene: string;
    blocks: BlockConfig[];
    filteredBlocks: BlockConfig[];
    fields: IFieldConfig[];
    // filteredFields: IFieldConfig[];
    defaultValue: object;
}

export interface IDynamicFormApi {
    getFieldsValue: (isValidate?: boolean) => Promise<any>;
}

export interface IFormCardApi {}
export interface IFormCardProps {
    title: string;
    fields: IFieldConfig[];
    className?: string;
}

export interface IContextValue {
    enums: {
        [key: string]: TEnumItem[];
    };
}

export type TEnumItem = string | { [key: string]: any };
