import { PageConfig, ISchemeInit, IDynamicFormProps, TEnumItem, IFieldConfig, BlockConfig } from './types';
import { cloneDeep } from 'lodash';
import { registerComponent, unmountCustomCompoent } from './components/Custom';

// tools
export const formatSchemaInit: (schema: PageConfig) => ISchemeInit = schema => {
    const newSchema: PageConfig = cloneDeep(schema);
    const { scene, blocks = [], wrapCol } = newSchema || {};
    const defaultValue = {};
    const filteredBlocks = [] as BlockConfig[];
    const fields = [] as IFieldConfig[];
    // const filteredFields = [] as IFieldConfig[];
    // 默认值
    blocks.forEach(block => {
        if (block.visible !== false) {
            filteredBlocks.push(block);
        }

        block.fields?.forEach(field => {
            fields.push(field);
            // if (field.show !== false) {
            //     filteredFields.push(field);
            // }
            if (typeof field.defaultValue !== 'undefined') {
                const valueKey = block.independentModel ? `${block.code}.${field.code}` : field.code;
                defaultValue[valueKey] = field.defaultValue;
            }
        });
    });

    return {
        schema: newSchema,
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
        // filteredFields,
        defaultValue,

        wrapCol,
    };
};

/**
 *
 * 根据wrapCol将blocks分类
 */
export const getWrapColBlocks = (
    wrapCol: (12 | 24)[],
    blocks: BlockConfig[]
): {
    col: 12 | 24;
    blocks: BlockConfig[];
}[] => {
    const rList = wrapCol[wrapCol.length - 1] === 24 ? [...wrapCol] : [...wrapCol, 24];
    const wrapColBlocks: any = rList.map(v => ({ col: v, blocks: [] }));

    blocks.forEach(block => {
        const { wrapColIndex } = block;
        if (typeof wrapColIndex !== 'undefined' && wrapColBlocks[wrapColIndex]) {
            wrapColBlocks[wrapColIndex].blocks.push(block);
            return;
        } else {
            // 没匹配到统一都丢到最后
            wrapColBlocks[wrapColBlocks.length - 1].blocks.push(block);
        }
    });

    return wrapColBlocks;
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
export const formatedOutFormValue = (value = {}, fields?: IFieldConfig[]) => {
    const formatedValue = cloneDeep(value);

    Object.keys(formatedValue).forEach(key => {
        if (key) {
            // 独立模型的深度数据处理,形如{blockCode}.{fieldCode}
            const [blockCode, fieldCode] = key.split('.');
            // 深度1
            if (blockCode && fieldCode) {
                if (!formatedValue[blockCode]) {
                    formatedValue[blockCode] = {};
                }
                formatedValue[blockCode][fieldCode] = formatedValue[key];
                delete formatedValue[key];
            }
        }
    });

    // fields.forEach(v => {
    //     const itemValue = formatedValue[v.code];
    //     if (v.component === 'DatePicker' && itemValue) {
    //         formatedValue[v.code] = moment(itemValue).format(v.props?.format || 'YYYY-MM-DD');
    //     }
    //     if (v.component === 'RangePicker' && itemValue) {
    //         const [a, b] = itemValue;
    //         const start = moment(a).format(v.props?.format || 'YYYY-MM-DD');
    //         const end = moment(b).format(v.props?.format || 'YYYY-MM-DD');
    //         formatedValue[v.code] = [start, end];
    //         if (v.props?.rangeFormat) {
    //             const [startKey, endKey] = v.props?.rangeFormat || [];
    //             formatedValue[startKey] = start;
    //             formatedValue[endKey] = end;
    //         }
    //     }
    // });

    return formatedValue;
};

// 塞进表单字段统一处理
export const formatedInFormValue = (value = {}, blocks: BlockConfig[]) => {
    const formatedValue = cloneDeep(value);

    Object.keys(formatedValue).forEach(key => {
        // 独立模型的深度数据拍平处理,拍成{blockCode}.{fieldCode}
        const val = formatedValue[key];
        if (Object.prototype.toString.call(val) === '[object Object]') {
            const findBlock = blocks.find(v => v.code === key);
            if (findBlock && findBlock.independentModel) {
                Object.keys(val).forEach(item => {
                    formatedValue[`${key}.${item}`] = val[item];
                });
                delete formatedValue[key];
            }
        }
    });

    // fields.forEach(v => {
    //     const itemValue = formatedValue[v.code];
    //     if (v.component === 'DatePicker' && itemValue) {
    //         formatedValue[v.code] = moment(itemValue);
    //     }
    //     if (v.component === 'RangePicker' && v.props?.rangeFormat) {
    //         const [startCode, endCode] = v.props?.rangeFormat || [];
    //         const start = formatedValue[startCode];
    //         const end = formatedValue[endCode];
    //         if (start && end) {
    //             formatedValue[v.code] = [moment(start), moment(end)];
    //         }
    //     }
    // });

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
 * @param logic: {rule,value}[]
 * @param rule: 支持多条，规则：区块code.字段code.属性，如改props，BaseInfo.remark.props
 * @param value: 改后的值,如果是改props的value的话，会做合并
 * @exp 显隐：updateSchmeHook(schema, [{rule: 'BaseInfo.remark.show', value: false}]),
 * @exp props：updateSchmeHook(schema, [{rule: 'BaseInfo.remark.props', value: { maxLength: 6 }}]),
 */

export const updateSchemaFieldHook = (
    schema: PageConfig,
    logic: {
        rule: string;
        value: any;
    }[]
) => {
    const ruleList = Array.isArray(logic) ? logic : [logic];
    const ruleMap = {};
    ruleList.forEach(v => {
        const [blockCode, fieldCode, property] = v.rule.split('.');
        if (!blockCode || !fieldCode || !property) {
            return;
        }
        !ruleMap[blockCode] && (ruleMap[blockCode] = {});
        !ruleMap[blockCode][fieldCode] && (ruleMap[blockCode][fieldCode] = {});
        // 对props做合并
        if (property === 'props') {
            ruleMap[blockCode][fieldCode]['props'] = {
                ...(ruleMap[blockCode][fieldCode]['props'] || {}),
                ...v.value,
            };
        } else {
            ruleMap[blockCode][fieldCode][property] = v.value;
        }
    });

    schema.blocks.forEach(block => {
        // 存在规则
        const ruleBlockItem = ruleMap[block.code];
        if (!ruleBlockItem) {
            return;
        }
        block.fields?.forEach(field => {
            const ruleFieldItem = ruleBlockItem[field.code];
            if (!ruleFieldItem) {
                return;
            }
            for (let propertykey in ruleFieldItem) {
                if (propertykey) {
                    if (propertykey === 'props') {
                        field['props'] = {
                            ...(field['props'] || {}),
                            ...ruleFieldItem['props'],
                        };
                    } else {
                        field[propertykey] = ruleFieldItem[propertykey];
                    }
                }
            }
        });
    });
};
/**
 *
 * @param schema
 * @param rule 规则：区块code.属性，如改props，BaseInfo.props
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

export { registerComponent, unmountCustomCompoent };
