import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
} from "react";
import { Form, Row, Col, Card } from "antd";
import {
  getComponent,
  getDefaultPlaceholder,
  getDefaultRequiredMsg,
  getFormItemExtraProps,
} from "./components";
import { IFormCardApi, IFormCardProps, IFieldConfig } from "./types";
// import { isNull } from './utils';

const FormItem = Form.Item;

const FormCard = forwardRef<IFormCardApi, IFormCardProps>(
  ({ title, fields = [], className, ...other }, ref) => {
    const filteredFields = useMemo(() => {
      return fields.filter((v) => v.show !== false || v.hiddenKeepAlign);
    }, [fields]);

    useImperativeHandle(ref, () => ({}));

    const renderField = useCallback((field: IFieldConfig) => {
      const { component, props = {}, customComponent } = field;
      const Field = getComponent(component, customComponent);
      const placeholder = getDefaultPlaceholder(component);
      if (Field) {
        // @ts-ignore
        return <Field placeholder={placeholder} {...props} />;
      }
      return null;
    }, []);

    const formatItemProps = useCallback((field: IFieldConfig) => {
      const { name, code, required, requiredMsg, iconTips, component } = field;
      // todo: rules拓展
      const rulesList = [] as any;
      if (required) {
        rulesList.push({
          // todo: 自定义组件
          // validator: (rule, value) => {
          //     return isNull(value) ? Promise.reject(requiredMsg || `请输入${label}`) : Promise.resolve();
          // },
          required: true,
          message: requiredMsg || getDefaultRequiredMsg(component, name),
        });
      }
      // 组件差异化的formItem属性
      const others = getFormItemExtraProps(component);

      return {
        ...others,
        name: code,
        label: name,
        required,
        rules: rulesList.length ? rulesList : undefined,
        tooltip: iconTips,
      };
    }, []);

    return (
      <Card title={title} className={className} style={{ marginBottom: 20 }}>
        <Row gutter={24}>
          {filteredFields.map((field) => {
            // 隐藏时组件保持布局
            const item =
              field.hiddenKeepAlign && !field.show ? (
                <></>
              ) : (
                <FormItem {...formatItemProps(field)}>
                  {renderField(field)}
                </FormItem>
              );

            const { alignSpan, code, span } = field;

            if (alignSpan) {
              const rate = alignSpan / 24;
              return (
                <Col span={alignSpan} key={code}>
                  {/* 需要还原item里span的占比 */}
                  <Row gutter={24}>
                    <Col span={span / rate}>{item}</Col>
                  </Row>
                </Col>
              );
            }

            return (
              <Col span={span} key={code}>
                {item}
              </Col>
            );
          })}
        </Row>
      </Card>
    );
  }
);

export default memo(FormCard);
