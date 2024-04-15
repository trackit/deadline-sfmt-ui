import React from "react";
import { Form, Input, Typography } from "antd";
import FormList from "./FormList";

interface TagSpecificationsProps {
    name: (string | number)[];
    subItems: string[];
}

const TagSpecifications: React.FC<TagSpecificationsProps> = ({ name, subItems }) => {
    return (
        <div>
            <Typography.Title level={5}>{name[name.length - 1]}</Typography.Title>
            <Form.Item
                label={subItems[0]}
                name={['TagSpecifications', 0, subItems[0]]}
                initialValue="spot-fleet-request" >
                <Input variant="filled" disabled />
            </Form.Item>
            <FormList name={['TagSpecifications', 0, subItems[1]]} subItems={['Key', 'Value']} />
        </div>
    );
}

export default TagSpecifications;