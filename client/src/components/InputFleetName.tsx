import React, { useState } from 'react';
import { Form, Input, Typography } from 'antd';
import '../index.css';

interface InputFleetNameProps {
  title?: string;
  sentence?: string;
  placeholder?: string;
  initialValue?: string;
  name: (string | number)[];
}

const InputFleetName: React.FC<InputFleetNameProps> = ({ title, sentence, placeholder, initialValue, name }) => {
  const [value, setValue] = useState(initialValue || '');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <>
      <Typography.Title style={{ margin: 0 }} level={5}>{title}</Typography.Title>
      <div style={{ marginBottom: '8px' }}>{sentence}</div>
      <Form.Item
        name={name}
        rules={[
          {
            pattern: new RegExp(
              /^[a-zA-Z0-9_-]+$/i
            ),
            message: "Fleet name contained invalid characters. Valid characters are A-Z, a-z, 0-9, - and _"
          }
        ]}
      >
        <Input placeholder={placeholder} variant='filled' value={value} onChange={handleChange} defaultValue={value} />
      </Form.Item>
    </>
  );
};

export default InputFleetName;