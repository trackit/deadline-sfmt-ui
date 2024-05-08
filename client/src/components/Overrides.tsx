import React, { useEffect, useState } from "react";
import { Button, Select, InputNumber, Tag, type SelectProps, Row, notification } from "antd";
import { InstanceTypeValue } from "../data/ItemsValues";
import { PlusOutlined } from "@ant-design/icons";
import { Override } from '../interface';

type TagRender = SelectProps['tagRender'];

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

interface OverridesProps {
  submit: boolean;
  overrides: Override[];
  prioritize: boolean;
  onChange: (overrides: Override[]) => void;
  currentSubnets: string[];
}

const Overrides: React.FC<OverridesProps> = ({ submit, overrides, prioritize, onChange, currentSubnets }) => {
  const [typedSubnetIds, setTypedSubnetIds] = useState<string[]>([]);
  const [localOverrides, setLocalOverrides] = useState<Override[]>(overrides);
  const [subnetIdValues, setSubnetIdValues] = useState<string[]>([]);
  const [existingInstanceTypes, setExistingInstanceTypes] = useState(new Array(localOverrides.length).fill(false));

  useEffect(() => {
    const uniqueSubnetIds = getUniqueSubnetIds(localOverrides);
    const newSubnets = currentSubnets.filter(subnet => !uniqueSubnetIds.includes(subnet));
    const allSubnetIds = Array.from(new Set([...uniqueSubnetIds, ...newSubnets, ...typedSubnetIds]));
    setSubnetIdValues(allSubnetIds); 
  }, [localOverrides, currentSubnets, typedSubnetIds]);
  


  const handleAddOverride = () => {
    const newOverrides = [...localOverrides, { SubnetId: [], InstanceType: '', WeightedCapacity:1 }];
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

  const handleSearch = (value: string, currentIndex: number) => {
    const existingInstanceTypesCopy = [...existingInstanceTypes];
    const existingInstanceTypesOverride = localOverrides
      .map(override => override.InstanceType.trim())
      .filter(instanceType => instanceType !== '');

    if (existingInstanceTypesOverride.includes(value.trim())) {
      existingInstanceTypesCopy[currentIndex] = true;
      setExistingInstanceTypes(existingInstanceTypesCopy);
      notification.warning({
        message: `Existing Instance Type`,
        description: `Instance type "${value}" already used will not be available in instance types list.`,
        placement: 'topLeft',
        duration: 8
      });
    } else {
      existingInstanceTypesCopy[currentIndex] = false;
      setExistingInstanceTypes(existingInstanceTypesCopy);
    }
};
const handleSearchForSubnetId = (value: string) => {
  const pattern = /^subnet-[a-zA-Z0-9]{17}$/;
  
  if (value.trim() !== '' && pattern.test(value.trim())) {
    setTypedSubnetIds(prevIds => {
      const newSet = new Set(prevIds);
      newSet.add(value.trim());
      return Array.from(newSet); 
    });
  }
};



  const renderAddButton = () => {
    if (localOverrides.length !== 0)
      return (
        <Button type="dashed" onClick={handleAddOverride} block icon={<PlusOutlined />}>
          Add Override
        </Button>
      );
    if (submit)
      return (
        <Button danger onClick={handleAddOverride} block icon={<PlusOutlined />}>
          Add Override (Required)
        </Button>
      );
    return (
      <Button onClick={handleAddOverride} block icon={<PlusOutlined />}>
        Add Override (Required)
      </Button>
    );
  };

  const handleSubnetIdChange = (value: string | string[], index: number) => {
    const pattern = /^subnet-[a-zA-Z0-9]{17,17}$/;
    const lastValue = value[value.length - 1];

    if (lastValue !== undefined && !pattern.test(lastValue)) {
      notification.error({
        message: 'Invalid Subnet ID',
        description: `The subnet ID '${lastValue}' does not match the required pattern.\nIt must be like 'subnet-xxxxxxxxxxxxxxxxx'`,
        placement: 'topLeft',
      });
      return;
    }
    const uniqueSelectedValues = Array.from(new Set(value));
    setSubnetIdValues((prevValues) => {
      const newValues = uniqueSelectedValues.filter((value) => !prevValues.includes(value));
      return [...prevValues, ...newValues];
    });
    handleChange(index, 'SubnetId', uniqueSelectedValues);
  };

  const renderPriority = (doPriority: boolean, index: number) => {
    const priority = localOverrides[index].Priority;

    if (!doPriority)
      return null;

    return (
      <InputNumber
        min={1}
        variant={(priority === undefined || priority === null) ? undefined : 'filled'}
        value={priority}
        onChange={value => handleChange(index, 'Priority', value)}
        placeholder="Priority"
        style={{
          width: '7vw',
          marginRight: '0.3vw',
          borderColor: ((priority === undefined || priority === null) && submit) ? 'red' : undefined,
        }}
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
              className={existingInstanceTypes[index] || (override.InstanceType === '' && submit) ? 'existing-instance-type' : ''}
              style={{ width: '8vw', marginRight: '0.3vw' }}
              value={override.InstanceType || undefined}
              onChange={e => handleChange(index, 'InstanceType', e)}
              onSearch={value => handleSearch(value, index)}
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
              className={(override.SubnetId.length === 0 && submit) ? 'empty-subnet-id' : ''}
              style={{ width: '100%', marginRight: '0.3vw' }}
              value={override.SubnetId}
              suffixIcon={null}
              onSearch={handleSearchForSubnetId}
              onChange={(value) => handleSubnetIdChange(value, index)}
              placeholder="Enter Subnets Id"
            >
              {subnetIdValues.map((subnetId, idx) => (
                <Select.Option key={`${subnetId}-${idx}`} value={subnetId}>
                  {subnetId}
                </Select.Option>
              ))}
            </Select>
            {renderPriority(prioritize, index)}
            <InputNumber
              min={1}
              value={override.WeightedCapacity}
              variant= 'filled'
              onChange={value => handleChange(index, 'WeightedCapacity', value)}
              placeholder="Weighted Capacity"
              style={{
                width: '7vw',
                marginRight: '0.3vw',
              }}
             />
          </Row>
          <Button danger onClick={() => handleRemoveOverride(index)}>
            Remove
          </Button>
        </div>
      ))}
      {renderAddButton()}
    </div>
  );

}

export default Overrides;