import React from 'react';
import { Form, Select, Typography } from 'antd';

interface GeneralInfosProps {
    label: string;
    name: string[];
    items: string[];
    onChange?: (value: string) => void;
}

const DropDownSelector: React.FC<GeneralInfosProps> = ({ label, name, items, onChange }) => {
    return (
        <>
            <Typography.Title level={5}>{label}</Typography.Title>
            <Form.Item name={name}>
                <Select
                    placeholder="Select an option"
                    variant='filled'
                    options={items.map((item) => ({ label: item, value: item }))}
                    onChange={onChange}
                />
            </Form.Item >
        </>
    );
}

export default DropDownSelector;