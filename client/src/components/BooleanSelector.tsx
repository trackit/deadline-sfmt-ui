import React from 'react';
import { Form, Switch, Typography } from 'antd';

interface BooleanSelectorProps {
    label: string | number;
    name: (string | number)[];
}

const BooleanSelector: React.FC<BooleanSelectorProps> = ({ label, name }) => {
    return (
        <>
            <Typography.Title level={5}>{label}</Typography.Title>
            <Form.Item name={name}>
                <Switch checkedChildren="True" unCheckedChildren="False" />
            </Form.Item>
        </>
    );
}

export default BooleanSelector;