import { BlockConfig, IFieldConfig } from './Edit/types';
export const TplSchema = {
    scene: 'DeviceTypeTemplateCreate',
    sceneDesc: '普通设备模板创建',
    gmtModify: '2023-1-2',
    blocks: [
        {
            code: 'template',
            title: '新建设备模板',
            componentName: 'Card',
            span: 24,
            fields: [
                {
                    code: 'name',
                    name: '模板名称',
                    component: 'Input',
                    span: 8,
                    alignSpan: 24,
                    required: true,
                    props: {
                        maxLength: 30,
                    },
                    propsJson: JSON.stringify({
                        maxLength: 30,
                    }),
                },
                {
                    code: 'types',
                    name: '设备类型',
                    component: 'Select',
                    span: 8,
                    alignSpan: 24,
                    required: true,
                    props: {
                        placeholder: '输入设备类型后按Enter',
                        mode: 'tags',
                    },
                    propsJson: JSON.stringify({
                        placeholder: '输入设备类型后按Enter',
                        mode: 'tags',
                    }),
                },
                {
                    code: 'expirationReminder',
                    name: '设备到期提醒',
                    component: 'Switch',
                    span: 6,
                    required: true,
                    defaultValue: false,
                },
                {
                    code: 'bindHardware',
                    name: '智能设备对接',
                    component: 'Switch',
                    span: 6,
                    required: true,
                    defaultValue: false,
                },
                {
                    code: 'autoDis',
                    name: '智能设备自动禁用',
                    component: 'Switch',
                    span: 6,
                    required: true,
                    defaultValue: false,
                    show: false,
                },
                {
                    code: 'autoRule',
                    name: '自动禁用规则',
                    component: 'Custom',
                    span: 6,
                    customComponent: 'ForbiddenRule',
                    required: true,
                    show: false,
                },
                {
                    code: 'charge',
                    name: '是否收费设备',
                    component: 'Radio',
                    span: 8,
                    required: true,
                    props: {
                        options: [
                            { label: '是', value: true },
                            { label: '否', value: false },
                        ],
                    },
                    propsJson: JSON.stringify({
                        options: [
                            { label: '是', value: true },
                            { label: '否', value: false },
                        ],
                    }),
                },
                {
                    code: 'associatedObjectTypes',
                    name: '关联对象',
                    component: 'Select',
                    span: 8,
                    alignSpan: 16,
                    required: true,
                    props: {
                        mode: 'multiple',
                        options: [
                            { label: '关联项目', value: 'PROJECT' },
                            { label: '关联楼宇', value: 'BUILDING' },
                            { label: '关联房源', value: 'ROOM' },
                            { label: '关联公共资源', value: 'CUSTOM_RESOURCE' },
                        ],
                    },
                    propsJson: JSON.stringify({
                        mode: 'multiple',
                        options: [
                            { label: '关联项目', value: 'PROJECT' },
                            { label: '关联楼宇', value: 'BUILDING' },
                            { label: '关联房源', value: 'ROOM' },
                            { label: '关联公共资源', value: 'CUSTOM_RESOURCE' },
                        ],
                    }),
                },
                {
                    code: 'priceUnit',
                    name: '设备单价单位',
                    component: 'Input',
                    span: 8,
                    required: true,
                    props: {
                        maxLength: 30,
                    },
                    propsJson: JSON.stringify({
                        maxLength: 30,
                    }),
                    show: false,
                },
                {
                    code: 'feeType',
                    name: '费用类型',
                    component: 'Select',
                    span: 8,
                    required: true,
                    props: {
                        showSearch: true,
                        optionsEnum: 'costType',
                        sourceMapping: {
                            label: 'name',
                            value: 'name',
                        },
                    },
                    propsJson: JSON.stringify({
                        showSearch: true,
                        optionsEnum: 'costType',
                        sourceMapping: {
                            label: 'name',
                            value: 'name',
                        },
                    }),
                    show: false,
                },
            ],
        },
    ],
};

export const mockList = [TplSchema];

export const defaultBlockItem: BlockConfig = {
    span: 24,
    code: '',
    title: '',
    componentName: 'Card',
    visible: true,
    propsJson: `{\n\n\n\n\n}`,
};

export const defaultFieldItem: IFieldConfig = {
    span: 24,
    code: '',
    name: '',
    component: 'Input',
    show: true,
    propsJson: `{\n\n\n\n\n}`,
};
