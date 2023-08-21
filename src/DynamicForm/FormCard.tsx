import React, { forwardRef, memo, useImperativeHandle, useMemo } from 'react';
import { Row, Col, Card } from 'antd';
// import {  } from '@/components';
import { IFormCardApi, IFormCardProps } from './types';
import Item from './Item';
// import { isNull } from './utils';

const FormCard = forwardRef<IFormCardApi, IFormCardProps>(({ title, fields = [], className, blockCode, independentModel, extra }, ref) => {
    const filteredFields = useMemo(() => {
        return fields.filter(v => v.show !== false || v.hiddenKeepAlign);
    }, [fields]);

    useImperativeHandle(ref, () => ({}));

    return (
        <Card title={title} className={className} style={{ marginBottom: 20 }} extra={extra}>
            <Row gutter={24}>
                {filteredFields.map(field => {
                    const item = <Item independentModel={independentModel} field={field} blockCode={blockCode} />;

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
});

export default memo(FormCard);
