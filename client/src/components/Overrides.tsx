import React, { useEffect, useState } from "react";
import { Button, Space, Select, InputNumber, Tag, type SelectProps, Row, notification } from "antd";
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
    const uniqueSubnetIds = getUniqueSubnetIds(overrides);
    const newSubnets = currentSubnets.filter(subnet => !uniqueSubnetIds.includes(subnet));
    setSubnetIdValues([...uniqueSubnetIds, ...newSubnets]);
  }, [overrides]);


  const handleAddOverride = () => {
    if (localOverrides.length === 0) {
      const newOverrides = [...localOverrides, { SubnetId: [], InstanceType: '' }];
      setLocalOverrides(newOverrides);
      onChange(newOverrides);
      return;
    }

    const existingInstanceTypes = localOverrides.map(override => override.InstanceType);
    const existingInstanceTypesText = existingInstanceTypes.length === 1 ? 'Instance type' : 'Instance types';
    notification.info({
      message: 'Existing Instance Types',
      description: `${existingInstanceTypesText} already used: ${existingInstanceTypes.join(', ')} will not be available in instance types list.`,
      placement: 'topLeft',
      duration: 8
    });
    const newOverrides = [...localOverrides, { SubnetId: [], InstanceType: '' }];
    setLocalOverrides(newOverrides);
    onChange(newOverrides);
    return;
  };



  const handleRemoveOverride = (index: number) => {
    const newOverrides = localOverrides.filter((_, i) => i !== index);
    setLocalOverrides(newOverrides);
    onChange(newOverrides);
  };

  const handleChange = (index: number, field: keyof Override, value: string | number | string[] | null) => {
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
        placeholder="Priority"
        style={{ width: '7vw', marginRight: '0.3vw' }}
      />
    );
  };

  return (
    <div style={{ paddingBottom: '26.72px' }}>
      {localOverrides.map((override, index) => (
        <div key={index} style={{ display: 'flex', marginBottom: 8 }}>
          <Row style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'nowrap' }}>
            <Select
              showSearch
              variant='filled'
              style={{ width: '8vw', marginRight: '0.3vw' }}
              value={override.InstanceType || undefined}
              onChange={e => handleChange(index, 'InstanceType', e)}
              placeholder="Instance Type"
              options={InstanceTypeValue
                .filter(instanceType => !localOverrides.some(override => override.InstanceType === instanceType))
                .map((instanceType) => ({ label: instanceType, value: instanceType }))
              }
            />
            <Select
              mode="tags"
              variant='filled'
              tagRender={tagRender}
              allowClear
              style={{ width: '100%', marginRight: '0.3vw' }}
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
              {subnetIdValues.map((subnetId, idx) => (
                <Select.Option key={`${subnetId}-${idx}`} value={subnetId}>
                  {subnetId}
                </Select.Option>
              ))}

            </Select>
            {renderPriority(prioritize, index)}
          </Row>
          <Button danger onClick={() => handleRemoveOverride(index)}>
            Remove
          </Button>
        </div>
      ))}
      <Button type="dashed" onClick={handleAddOverride} block icon={<PlusOutlined />}>
        Add Override
      </Button>
    </div>
  );

}

export default Overrides;