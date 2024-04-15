import React, { useEffect, useState } from "react";
import { Button, Space, Select, InputNumber, Tag, type SelectProps } from "antd";
import FormVerification from "../services/FormVerification";
import { InstanceTypeValue } from "../data/ItemsValues";
import { PlusOutlined } from "@ant-design/icons";
import { Override } from '../interface';

type TagRender = SelectProps['tagRender'];

interface OverridesProps {
    overrides: Override[];
    prioritize: boolean;
    onChange: (overrides: Override[]) => void;
    currentSubnets: string[];
}

const tagRender: TagRender = (props) => {
    const { label, value, closable, onClose } = props;
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };
    return (
        <Tag
            color='blue'
            onMouseDown={onPreventMouseDown}
            closable={closable}
            onClose={onClose}
            style={{ marginInlineEnd: 4 }}
        >
            {label}
        </Tag>
    );
};
const getUniqueSubnetIds = (overrides: Override[]): string[] => {
    const subnetIdsSet = new Set<string>();
    overrides.forEach((override) => {
        if (typeof override.SubnetId === 'string') {
            subnetIdsSet.add(override.SubnetId);
        } else if (Array.isArray(override.SubnetId)) {
            override.SubnetId.forEach((subnetId) => {
                subnetIdsSet.add(subnetId);
            });
        }
    });
    return Array.from(subnetIdsSet);
};

const Overrides: React.FC<OverridesProps> = ({ overrides, prioritize, onChange, currentSubnets }) => {
    const [localOverrides, setLocalOverrides] = useState<Override[]>(overrides);
    const [subnetIdValues, setSubnetIdValues] = useState<string[]>([]);

    useEffect(() => {
        setSubnetIdValues(getUniqueSubnetIds(overrides).concat(currentSubnets));
    }, [overrides]);

    const handleAddOverride = () => {
        const newOverrides = [...localOverrides, { SubnetId: [], InstanceType: '' }];
        setLocalOverrides(newOverrides);
        onChange(newOverrides);
    };

    const handleRemoveOverride = (index: number) => {
        const newOverrides = localOverrides.filter((_, i) => i !== index);
        setLocalOverrides(newOverrides);
        onChange(newOverrides);
    };

    const handleChange = (index: number, field: keyof Override, value: string | number | string[] | null) => {
        if (field === 'InstanceType') {
            const instanceType = value as string;
            const instanceTypeExists = localOverrides.some((override, i) => i !== index && override.InstanceType === instanceType);

            if (instanceTypeExists)
                FormVerification.notificationError('Duplicate Instance Type', `Instance type '${instanceType}' is already used in another override.`);
        }
        const newOverrides = localOverrides.map((override, i) => i === index ? { ...override, [field]: value } : override);
        setLocalOverrides(newOverrides);
        onChange(newOverrides);

    };
    
    const renderPriority = (doPriority: boolean, index: number) => {
        if (!doPriority)
            return null;
        return (
            <InputNumber
                min={1}
                variant='filled'
                value={localOverrides[index].Priority}
                onChange={value => handleChange(index, 'Priority', value)}
                placeholder="Set Priority"
                style={{ width: 'auto' }}
            />
        );
    };

    return (
        <div style={{ paddingBottom: '26.72px' }}>
            {localOverrides.map((override, index) => (
                <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Select
                        showSearch
                        variant='filled'
                        style={{ minWidth: '7vw' }}
                        value={override.InstanceType || undefined}
                        onChange={e => handleChange(index, 'InstanceType', e)}
                        placeholder="Enter an Instance Type"
                        options={InstanceTypeValue.map((instanceType) => ({ label: instanceType, value: instanceType }))}
                    />
                    <Select
                        mode="tags"
                        variant='filled'
                        tagRender={tagRender}
                        allowClear
                        style={{ minWidth: '15vw' }}
                        value={override.SubnetId}
                        suffixIcon={null}
                        onChange={(value) => {
                            const uniqueSelectedValues = Array.from(new Set(value));
                            setSubnetIdValues((prevValues) => {
                                const newValues = uniqueSelectedValues.filter((value) => !prevValues.includes(value));
                                return [...prevValues, ...newValues];
                            });
                            handleChange(index, 'SubnetId', uniqueSelectedValues);
                        }}
                        placeholder="Enter Subnets Id"
                    >
                        {subnetIdValues.map((subnetId) => (
                            <Select.Option key={subnetId} value={subnetId}>
                                {subnetId}
                            </Select.Option>
                        ))}
                    </Select>
                    {renderPriority(prioritize, index)}
                    <Button danger onClick={() => handleRemoveOverride(index)}>Remove</Button>
                </Space>
            ))}
            <Button type="dashed" onClick={handleAddOverride} block icon={<PlusOutlined />}>
                Add Override
            </Button>
        </div>
    );
}

export default Overrides;