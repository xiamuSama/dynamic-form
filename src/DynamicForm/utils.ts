import { PageConfig, ISchemeInit, IDynamicFormProps, TEnumItem, IFieldConfig, BlockConfig } from './types';
import moment from 'moment';

// tools
export const formatSchemaInit: (schema: PageConfig) => ISchemeInit = schema => {
    const newSchema: PageConfig = JSON.parse(JSON.stringify(schema));
    const { scene, blocks = [] } = newSchema || {};
    const defaultValue = {};
    const filteredBlocks = [] as BlockConfig[];
    const fields = [] as IFieldConfig[];
    const filteredFields = [] as IFieldConfig[];
    // 默认值
    blocks.forEach(block => {
        if (block.visible !== false) {
            filteredBlocks.push(block);
        }
        block.fields?.forEach(field => {
            fields.push(field);
            if (field.show !== false) {
                filteredFields.push(field);
            }
            if (typeof field.defaultValue !== 'undefined') {
                defaultValue[field.code] = field.defaultValue;
            }
        });
    });

    return {
        scene,
        /**
         * 全区块
         */
        blocks,
        /**
         * 过滤后的
         */
        filteredBlocks,
        fields,
        filteredFields,
        defaultValue,
    };
};

export const initEnums = async (
    enums: Required<IDynamicFormProps>['enums']
): Promise<{
    [key: string]: TEnumItem[];
}> => {
    const res = {};
    const enumList = Object.keys(enums);
    const promiseList = [] as any;
    // object.values可能会乱序？
    enumList.forEach(v => {
        promiseList.push(enums[v]());
    });

    const contents = await Promise.allSettled(promiseList);
    contents.forEach((item, index) => {
        if (item.status === 'fulfilled') {
            res[enumList[index]] = item.value;
            return;
        }
        res[enumList[index]] = [];
    });
    // enums.for
    return res;
};
// change出去的字段统一处理
export const formatedOutFormValue = (value = {}, fields: IFieldConfig[]) => {
    const formatedValue = { ...value };

    fields.forEach(v => {
        const itemValue = formatedValue[v.code];
        if (v.component === 'DatePicker' && itemValue) {
            formatedValue[v.code] = moment(itemValue).format(v.props?.format || 'YYYY-MM-DD');
        }
        if (v.component === 'RangePicker' && itemValue) {
            const [a, b] = itemValue;
            const start = moment(a).format(v.props?.format || 'YYYY-MM-DD');
            const end = moment(b).format(v.props?.format || 'YYYY-MM-DD');
            formatedValue[v.code] = [start, end];
            if (v.props?.rangeFormat) {
                const [startKey, endKey] = v.props?.rangeFormat || [];
                formatedValue[startKey] = start;
                formatedValue[endKey] = end;
            }
        }
    });

    return formatedValue;
};

// 塞进表单字段统一处理
export const formatedInFormValue = (value = {}, fields: IFieldConfig[]) => {
    const formatedValue = { ...value };

    fields.forEach(v => {
        const itemValue = formatedValue[v.code];
        if (v.component === 'DatePicker' && itemValue) {
            formatedValue[v.code] = moment(itemValue);
        }
        if (v.component === 'RangePicker' && v.props?.rangeFormat) {
            const [startCode, endCode] = v.props?.rangeFormat || [];
            const start = formatedValue[startCode];
            const end = formatedValue[endCode];
            if (start && end) {
                formatedValue[v.code] = [moment(start), moment(end)];
            }
        }
    });

    return formatedValue;
};

// api.....

/**
 *
 * @param val
 * @returns
 */
export const isNull = val => typeof val === 'undefined' || val === '' || val === null;

/**
 *
 * @param schema
 * @param rule 规则：区块code.字段code.属性，如改props，BaseInfo.remark.props
 * @param value 改后的值
 * exp: 如显隐：updateSchmeHook(schema, 'BaseInfo.remark.show', false),
 */
export const updateSchemaFieldHook = (schema: PageConfig, rule: string, value: any) => {
    const [blockCode, fieldCode, property] = rule.split('.');
    if (!blockCode || !fieldCode || !property) {
        return;
    }
    schema.blocks.forEach(block => {
        if (block.code === blockCode) {
            block.fields?.forEach(field => {
                if (field.code === fieldCode) {
                    field[property] = value;
                }
            });
        }
    });
};
/**
 *
 * @param schema
 * @param rule 规则：区块code.属性，如改props，BaseInfo.remark.props
 * @param value 改后的值
 * exp: 如显隐：updateSchmeHook(schema, 'BaseInfo.visible', false),
 */
export const updateSchemaBlockHook = (schema: PageConfig, rule: string, value: any) => {
    const [blockCode, property] = rule.split('.');
    if (!blockCode || !property) {
        return;
    }
    schema.blocks.forEach(block => {
        if (block.code === blockCode) {
            block[property] = value;
        }
    });
};
