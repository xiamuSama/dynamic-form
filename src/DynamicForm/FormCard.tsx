import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
} from "react";
import { Form, Row, Col, Card } from "antd";
import {
  getComponent,
  getDefaultPlaceholder,
  getDefaultRequiredMsg,
} from "./components";
import { IFormCardApi, IFormCardProps, IFieldConfig } from "./types";
// import { isNull } from './utils';

const FormItem = Form.Item;

const FormCard = forwardRef<IFormCardApi, IFormCardProps>(
  ({ title, fields = [], className, ...other }, ref) => {
    const filteredFields = useMemo(() => {
      return fields.filter((v) => v.show !== false);
    }, [fields]);

    useImperativeHandle(ref, () => ({}));

    const renderField = useCallback((field: IFieldConfig) => {
      const { component, props = {} } = field;
      const Field = getComponent(component);
      const placeholder = getDefaultPlaceholder(component);

      if (Field) {
        // @ts-ignore
        return <Field placeholder={placeholder} {...props} />;
      }

      return null;
    }, []);

    const formatItemProps = useCallback((field: IFieldConfig) => {
      const {
        name,
        code,
        required,
        requiredMsg,
        iconTips,
        disable,
        component,
      } = field;
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

      return {
        name: code,
        label: name,
        required,
        rules: rulesList.length ? rulesList : undefined,
        tooltip: iconTips,
        disable,
      };
    }, []);

    return (
      <Card title={title} className={className} style={{ marginBottom: 20 }}>
        <Row gutter={24}>
          {filteredFields.map((field) => (
            <Col span={field.span} key={field.code}>
              <FormItem {...formatItemProps(field)}>
                {renderField(field)}
              </FormItem>
            </Col>
          ))}
        </Row>
      </Card>
    );
  }
);

export default FormCard;
