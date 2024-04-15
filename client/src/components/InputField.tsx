import React, { useState } from 'react';
import { Form, Input, Typography } from 'antd';

interface InputFieldProps {
  title?: string;
  sentence?: string;
  placeholder?: string;
  initialValue?: string;
  name: (string | number)[];
  pattern?: string;
  msg?: string;
  isRequired?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ title, sentence, placeholder, initialValue, name, pattern, msg, isRequired }) => {
  const [value, setValue] = useState(initialValue || '');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <div>
      <Typography.Title level={5}>{title}</Typography.Title>
      <p>{sentence}</p>
      <Form.Item name={name} 
      rules={[
        {
          required: isRequired,
          message: `Please input a ${title}`
        },
          {
            pattern: pattern ? new RegExp(pattern) : undefined,
            message: msg
          }
        ]}>
        <Input placeholder={placeholder} variant='filled' value={value} onChange={handleChange} defaultValue={value}  />
      </Form.Item>
    </div>
  );
};

export default InputField;