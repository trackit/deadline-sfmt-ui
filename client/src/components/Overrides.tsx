import React, { useEffect, useState } from "react";
import { Button, Space, Select, InputNumber, Tag, type SelectProps, Row, notification, Typography } from "antd";
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
  const [idErrorMessages, setIdErrorMessages] = useState<string[]>(Array.from({ length: overrides.length }, () => ''));
  const [existingInstanceTypes, setExistingInstanceTypes] = useState(new Array(localOverrides.length).fill(false));
  


  useEffect(() => {
    const uniqueSubnetIds = getUniqueSubnetIds(overrides);
    const newSubnets = currentSubnets.filter(subnet => !uniqueSubnetIds.includes(subnet));
    setSubnetIdValues([...uniqueSubnetIds, ...newSubnets]);
    console.log(localOverrides.length)
  }, [overrides]);


    const handleAddOverride = () => {
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
    if (field === 'SubnetId') {
      const pattern = /^subnet-[a-zA-Z0-9]{0,17}$/; // Pattern for subnet ids
      const invalidValues = (value as string[]).filter(subnetId => !pattern.test(subnetId.trim()));
      const newIdErrorMessages = [...idErrorMessages];
      newIdErrorMessages[index] = invalidValues.length > 0 ? 'Invalid input. Please follow the specified pattern.' : '';
      setIdErrorMessages(newIdErrorMessages);
    }

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


const renderPriority = (doPriority: boolean, index: number) => {
  const priority = localOverrides[index].Priority;

  if (!doPriority) {
    return null;
  }

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
        borderColor: (priority === undefined || priority === null) ? 'red' : undefined,
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
                className={existingInstanceTypes[index] || override.InstanceType === '' ? 'existing-instance-type' : ''}
                style={{
                  width: '8vw',
                  marginRight: '0.3vw',
                }}
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
              className={override.SubnetId.length === 0 ? 'empty-subnet-id' : ''}
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
      { localOverrides.length === 0 ? (
  <Button danger onClick={handleAddOverride} block icon={<PlusOutlined />}>
     Add Override (Required)
  </Button>
) : (
  <Button type="dashed" onClick={handleAddOverride} block icon={<PlusOutlined />}>
    Add Override
  </Button>
)}

    </div>
  );

}

export default Overrides;