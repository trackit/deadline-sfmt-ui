import React, { useState, useEffect } from 'react';
import { Form, Button, InputNumber, Typography, Space, Popconfirm, Modal, notification } from 'antd';
import { Fleet, LaunchTemplateConfig, Override } from '../interface';
import { QuestionCircleOutlined } from '@ant-design/icons';
import InputField from './InputField';
import BooleanSelector from './BooleanSelector';
import DropDownSelector from './DropDownSelector';
import { AllocationStrategyValue, TypeValue } from '../data/ItemsValues';
import TagSpecifications from './TagSpecifications';
import LaunchTemplateConfigs from './LaunchTemplateConfigs';
import FormVerification from '../services/FormVerification';
import InputFleetName from './InputFleetName';
import '../index.css';

interface DynamicFormProps {
  fleetName: string;
  formData: Fleet;
  submitted: boolean;
  onDataUpdate: (fleetName: string, fleetData: Fleet, newFleetName?: string) => boolean;
  onFleetDelete: (name: string) => void;
  hasChanged: (changed: Fleet, name: string, launchTemplateConfig?: LaunchTemplateConfig[]) => void;
  currentSubnets: string[];
}

const DynamicForm: React.FC<DynamicFormProps> = ({ fleetName, formData, submitted, onDataUpdate, onFleetDelete, hasChanged, currentSubnets }: DynamicFormProps) => {
  const [formValues, setFormValues] = useState<Fleet>(formData);
  const [launchTemplateConfig, setLaunchTemplateConfig] = useState<Map<string, LaunchTemplateConfig>>(new Map<string, LaunchTemplateConfig>());
  const [priority, setPriority] = useState<Map<string, boolean>>(new Map<string, boolean>());
  const [updatedForm, setUpdatedForm] = useState<Fleet>(formData);
  const [submit, setSubmit] = useState<boolean>(submitted);

  useEffect(() => {
    setFormValues(formData);
    setSubmit(submitted);
  }, [formData, submitted]);

  const handleAllocationStrategyChange = (fleetName: string, allocationStrategy: string) => {
    const updatedPriority = new Map<string, boolean>(priority);

    updatedPriority.set(fleetName, (allocationStrategy === 'capacityOptimizedPrioritized'));
    setPriority(updatedPriority);
  };

  const handleFormChange = (changedValues: any, allValues: Fleet) => {
    const updatedValues = { ...updatedForm, ...allValues };
    setUpdatedForm(updatedValues);
    hasChanged(updatedValues, fleetName);
  };

  const handleLaunchTemplateConfigChange = (fleetName: string, updatedValue: LaunchTemplateConfig) => {
    setLaunchTemplateConfig(prevState => {
      const newState = new Map<string, LaunchTemplateConfig>(prevState);
      newState.set(fleetName, updatedValue);
      return newState;
    });
    const updatedLaunchTemplateConfig = updateLaunchTemplateConfig(updatedValue);
    const updatedValues = { ...formValues, ...updatedForm };
    updatedValues.LaunchTemplateConfigs = updatedLaunchTemplateConfig;
    setUpdatedForm(updatedValues);
    hasChanged(updatedValues, fleetName, updatedLaunchTemplateConfig);
  };

  const getLaunchTemplateConfig = (values: Fleet): LaunchTemplateConfig => {
    const overridesMap: { [key: string]: { InstanceType: string; SubnetIds: string[]; Priorities: number | undefined, WeightedCapacities: number| undefined } } = {};
    const LaunchTemplateSpecification = { LaunchTemplateId: '', Version: '$Latest' };
    const allOverrides: Override[] = [];

    if (!values.LaunchTemplateConfigs || values.LaunchTemplateConfigs.length === 0)
      return { LaunchTemplateSpecification: LaunchTemplateSpecification, Overrides: [] };

    values.LaunchTemplateConfigs.forEach((config: LaunchTemplateConfig) => {
      LaunchTemplateSpecification.LaunchTemplateId = config.LaunchTemplateSpecification.LaunchTemplateId;
      LaunchTemplateSpecification.Version = config.LaunchTemplateSpecification.Version;

      if (!config.Overrides || config.Overrides.length === 0)
        return config;
      config.Overrides.forEach((override: Override) => {
        if (!overridesMap[override.InstanceType])
          overridesMap[override.InstanceType] = { InstanceType: override.InstanceType, SubnetIds: [], Priorities: override.Priority, WeightedCapacities: override.WeightedCapacity };

        if (Array.isArray(override.SubnetId)) {
          override.SubnetId.forEach(subnet => {
            overridesMap[override.InstanceType].SubnetIds.push(subnet);
          });
          return;
        }
        overridesMap[override.InstanceType].SubnetIds.push(override.SubnetId);
      });
      return config;
    });

    for (const key in overridesMap) {
      if (!Object.prototype.hasOwnProperty.call(overridesMap, key))
        continue;
      const override = overridesMap[key];
      const newOverride: Override = { InstanceType: override.InstanceType, SubnetId: override.SubnetIds, Priority: override.Priorities, WeightedCapacity: override.WeightedCapacities};
      allOverrides.push(newOverride);
    }
    return ({ LaunchTemplateSpecification, Overrides: allOverrides });
  };

  const updateLaunchTemplateConfig = (updatedLaunchTemplateConfig: LaunchTemplateConfig): LaunchTemplateConfig[] => {
    const allTemplateConfigs: LaunchTemplateConfig[] = [];

    updatedLaunchTemplateConfig.Overrides.forEach((override) => {
      if (!Array.isArray(override.SubnetId))
        return;
      override.SubnetId.forEach((subnetId) => {
        const newLaunchTemplateConfig: LaunchTemplateConfig = {
          LaunchTemplateSpecification: updatedLaunchTemplateConfig.LaunchTemplateSpecification,
          Overrides: [{
            InstanceType: override.InstanceType,
            SubnetId: subnetId,
            Priority: override.Priority,
            WeightedCapacity: override.WeightedCapacity,
          }]
        };
        allTemplateConfigs.push(newLaunchTemplateConfig);
      });
    });
    return allTemplateConfigs;
  };

  const onFinish = (values: Fleet) => {
    setSubmit(true);
    const updatedValues = { ...formValues, ...values };
    const newLaunchTemplateConfig = launchTemplateConfig.get(fleetName);

    if (newLaunchTemplateConfig)
      updatedValues.LaunchTemplateConfigs = updateLaunchTemplateConfig(newLaunchTemplateConfig);
    else
      updatedValues.LaunchTemplateConfigs = formValues.LaunchTemplateConfigs;
    updatedValues.LaunchSpecifications = updatedValues.LaunchSpecifications || [];

    if (
      updatedValues.AllocationStrategy !== "capacityOptimizedPrioritized" &&
      updatedValues.LaunchTemplateConfigs.some(config => config.Overrides.some(override => override.Priority))
    ) {
      Modal.confirm({
        title: 'Warning',
        className: 'customModal',
        okText: 'Yes',
        cancelText: 'No',
        content: `The allocation strategy for ${fleetName} is set to ${updatedValues.AllocationStrategy}. Priority will not be used. Do you want to delete them?`,
        onOk: () => {
          updatedValues.LaunchTemplateConfigs.forEach(config => {
            config.Overrides.forEach(override => {
              delete override.Priority;
            });
          });
          handleSubmission(updatedValues, values);
        },
        onCancel: () => {
          handleSubmission(updatedValues, values);
        },
      });
    } else {
      handleSubmission(updatedValues, values);
    }
  };

  const handleSubmission = (updatedValues: Fleet, values: Fleet) => {
    if (updatedValues.AllocationStrategy === "capacityOptimizedPrioritized") {
      if (updatedValues.LaunchTemplateConfigs.some(config => config.Overrides.some(override => override.Priority === undefined || override.Priority === null))) {
          FormVerification.notificationError('Empty Priority', 'Priority cannot be empty when AllocationStrategy is set on capacityOptimizedPrioritized');
          return false; 
      }
  }
  if (updatedValues.LaunchTemplateConfigs.some(config => config.Overrides.some(override => override.WeightedCapacity === undefined || override.WeightedCapacity === null))) {
    FormVerification.notificationWarning('Empty WeightedCapacity', 'WeightedCapacity is empty, it will be not created on Override');
}
    if (!FormVerification.isValidFleet(fleetName, updatedValues))
      return;
    if (!updatedValues.TagSpecifications) {
      updatedValues.TagSpecifications = [{
        ResourceType: "spot-fleet-request",
        Tags: [{
          Key: "DeadlineTrackedAWSResource",
          Value: "SpotEventPlugin"
        }]
      }];
    } else {
      updatedValues.TagSpecifications.forEach(tagSpec => {
        if (!tagSpec.Tags) {
          tagSpec.Tags = [{
            Key: "DeadlineTrackedAWSResource",
            Value: "SpotEventPlugin"
          }];
        } else {
          const existingTag = tagSpec.Tags.find(tag => tag.Key === "DeadlineTrackedAWSResource");
          if (!existingTag) {
            tagSpec.Tags.push({
              Key: "DeadlineTrackedAWSResource",
              Value: "SpotEventPlugin"
            });
          }
        }
      });
    }
    if (onDataUpdate(fleetName, updatedValues, values.FleetName))
      setSubmit(false);
  };

  const renderLaunchTemplateConfig = (fleetName: string, values: Fleet) => {
    let isPrioritized = priority.get(fleetName);
    if (isPrioritized === undefined)
      isPrioritized = values.AllocationStrategy === 'capacityOptimizedPrioritized';
    const fleetLaunchTemplateConfig = getLaunchTemplateConfig(values);

    return (
      <LaunchTemplateConfigs submit={submit} prioritise={isPrioritized} launchTemplateConfig={fleetLaunchTemplateConfig} handleChanges={(value) => { handleLaunchTemplateConfigChange(fleetName, value) }} currentSubnets={currentSubnets} />
    );
  }

  return (
    <Form key={JSON.stringify(formValues)} onFinish={onFinish} onValuesChange={handleFormChange} initialValues={formValues}>
      <InputFleetName
        title="Setup your fleet"
        sentence="Edit your fleet name:"
        placeholder="Fleet name"
        initialValue={fleetName}
        name={['FleetName']}
      />
      <DropDownSelector label="AllocationStrategy" name={['AllocationStrategy']} items={AllocationStrategyValue} onChange={(value) => handleAllocationStrategyChange(fleetName, value)} />
      <InputField title='IamFleetRole' name={['IamFleetRole']} placeholder="Enter an IamFleetRole" pattern="^arn:aws:iam::\d{12}:role\/[a-zA-Z0-9_-]+$" msg='Please provide an IamFleetRole in the following format: arn:aws:iam::accountid:role/fleet-role-name' isRequired={true} />
      <BooleanSelector label="TerminateInstancesWithExpiration" name={['TerminateInstancesWithExpiration']} />
      <Typography.Title level={5}>Worker maximum capacity</Typography.Title>
      <Form.Item name={['TargetCapacity']}
        rules={[
          {
            required: true,
            message: 'Please input a TargetCapacity, must be a number',
          }
        ]}>
        <InputNumber type="number" min={0} variant="filled" placeholder='Select a number' style={{ width: 'auto' }} />
      </Form.Item>
      <BooleanSelector label="ReplaceUnhealthyInstances" name={['ReplaceUnhealthyInstances']} />
      <DropDownSelector label="Type" name={['Type']} items={TypeValue} />
      <TagSpecifications name={['TagSpecifications']} subItems={['ResourceType', 'Tags']} />
      {renderLaunchTemplateConfig(fleetName, formValues)}
      <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
        <Popconfirm
          title="Delete the fleet"
          description="Are you sure to delete this fleet?"
          onConfirm={() => onFleetDelete(fleetName)}
          icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
          okText="Yes"
          cancelText="No"
        >
          <Button danger>Delete</Button>
        </Popconfirm>
        <Button type="primary" htmlType="submit" >Submit</Button>
      </Space>
    </Form>
  );
};

export default DynamicForm;
