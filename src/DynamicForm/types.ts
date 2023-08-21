import { ReactNode, MutableRefObject } from 'react';

interface IPageHeader {
    title: string;
}

interface IPageFooter {
    buttons: ('ok' | 'cancel')[];
}
export interface PageConfig {
    scene: string;
    blocks: BlockConfig[];
    /**
     * 给每个区块包裹一个col，用于流式布局
     */
    wrapCol?: (12 | 24)[];
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
    componentName: 'Card' | 'FormItem';
    visible?: boolean;
    fields?: IFieldConfig[];
    className?: string;
    // 独立模型模式, 字段的数据格式会套上区块code
    independentModel?: boolean;
    footer?: () => ReactNode;
    /**
     * 卡片上的操作
     */
    action?: string;
    /**
     * 配合wrapCol，指定在哪个容器
     */
    wrapColIndex?: number;
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
    | 'Checkbox'
    | 'UploadImageMultiple'
    | 'Custom';

export interface IFieldConfig {
    // 自带属性
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
        disabled?: boolean;
        [key: string]: any;
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
    /**
     * 外层自己注册formItem，搭配customComponent
     */
    withoutFormItem?: boolean;
}

export interface IDynamicFormProps {
    schema: PageConfig;
    enums?: {
        [key: string]: () => Promise<TEnumItem[]>;
    };
    afterGetEnums?: (enums: any) => void;
    /**
     * 注册了事件行为，可拓展为弹窗等事件
     */
    actions?: {
        [key: string]: () => ReactNode;
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
        onGetData?: (a: {
            /**
             * api返回的数据
             */
            data: any;
            /**
             * schema
             */
            schema: PageConfig;
            /**
             * 经dynamic处理过的数据
             */
            formatedData: any;
        }) => Promise<IFormReturn>;
    };
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
     * 塞入表单最新的值，需注意：如果是多模型的数据，key需要加上区块Code,如{区块Code}.{字段key}
     */
    data: any;
    /**
     * 是否更新最新的表单值
     */
    doUpdate?: boolean;
}

export interface IFieldInputProps {
    style?: object;
    maxLength?: number;
    placeholder?: string;
    addonAfter?: ReactNode;
    suffix?: ReactNode;
    // 金额类
    numberType?: 'Cell' | 'Int';
    min?: number;
    precision?: number;
}
export interface IFieldSelectProps {
    placeholder?: string;
    /**
     * 优先级optionsEnum > options
     */
    options?: { value: any; label: string }[];
    optionsEnum?: string | 'bool';
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
    wrapCol?: (12 | 24)[];
}

export interface IDynamicFormApi {
    /**
     *
     * @param isValidate
     * @returns 获取表单值
     */
    getFieldsValue: (isValidate?: boolean) => Promise<any>;
    /**
     *
     * @returns 获取预设枚举
     */
    getEnumsMap: () => { [key: string]: any };
    /**
     *
     * @returns 获取预设的page详情
     */
    getPageDetail: () => { [key: string]: any };
    /**
     *
     * @returns 获取schema详情
     */
    getCurrentSchema: () => PageConfig;
    /**
     *
     * @param data 塞入表单最新的值，需注意：如果是多模型的数据，key需要加上区块Code,如{区块Code}.{字段key}
     */
    unsafe_forceSetFormData: (data: { [key: string]: any }) => void;
    /**
     *
     * @param schema 塞入表单最新的schema
     */
    unsafe_forceSetFormSchema: (schema: PageConfig) => void;
    /**
     *
     * @param isData 是否重置formData
     * @param isSchema 是否重置组件
     */
    unsafe_forceResetForm: (isData: boolean, isSchema: boolean) => void;
}

export interface IFormCardApi {}
export interface IFormCardProps {
    title: string;
    fields: IFieldConfig[];
    className?: string;
    independentModel?: boolean;
    blockCode: string;
    extra?: ReactNode;
}

export interface IContextValue {
    enums: {
        [key: string]: TEnumItem[];
    };
    formRef?: ((instance: IDynamicFormApi | null) => void) | MutableRefObject<IDynamicFormApi | null> | null;
}

export type TEnumItem = string | { [key: string]: any };

export type IUseForm = () => [MutableRefObject<IDynamicFormApi | null>];
