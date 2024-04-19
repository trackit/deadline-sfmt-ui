import React, { useState, useEffect } from 'react';
import { Button, Row, Typography, Collapse, Space, Popconfirm, notification, Modal } from 'antd';
import { ArrowUpOutlined, DeleteOutlined, QuestionCircleOutlined, PlusOutlined, SaveTwoTone } from '@ant-design/icons';
import FormVerification from '../services/FormVerification';
import { Fleets, Fleet, LaunchTemplateConfig } from '../interface';
import DynamicForm from './DynamicForm';
import '../index.css';

interface FleetFormProps {
    formData: Fleets;
    onDataUpdate: (updatedData: Record<string, any>) => void;
    addRef: React.MutableRefObject<null>;
}

const FleetsForm: React.FC<FleetFormProps> = ({ formData, onDataUpdate, addRef }: FleetFormProps) => {
    const [activeKey, setActiveKey] = useState<string | string[]>([]);
    const [formValues, setFormValues] = useState<Fleets>(formData);
    const [unsavedForm, setUnsavedForm] = useState<Fleets>({});
    const [shouldRerender, setShouldRerender] = useState<boolean>(false);

    useEffect(() => {
        setFormValues(formData);
    }, [formData]);

    const triggerRerender = () => {
        setShouldRerender(prevState => !prevState);
    };

    const getDefaultFleet = (): Fleets[string] => ({
        AllocationStrategy: '',
        IamFleetRole: '',
        LaunchSpecifications: [],
        LaunchTemplateConfigs: [],
        ReplaceUnhealthyInstances: true,
        TargetCapacity: 1,
        TerminateInstancesWithExpiration: true,
        Type: 'maintain',
        TagSpecifications: []
    });

    const handleAddFleet = () => {
        let index = 0;
        while (Object.keys(formData).includes(`fleet_${index}`))
            index++;
        const newFleetName = `fleet_${index}`;
        setFormValues(prevFormValues => ({
            ...prevFormValues,
            [newFleetName]: getDefaultFleet(),
        }));
        onDataUpdate({
            ...formData,
            [newFleetName]: getDefaultFleet(),
        });
    };

    const handlePanelChange = (key: string | string[]) => {
        setActiveKey(key);
    };

    const handleDeleteFleet = (fleetName: string) => {
        const updatedFormValues = { ...formValues };
        delete updatedFormValues[fleetName];
        setFormValues(updatedFormValues);
        onDataUpdate(updatedFormValues)
        delete unsavedForm[fleetName];
        setUnsavedForm(unsavedForm);
    };

    const updateFleetName = (fleetName: string, newFleetName: string, allFleets: Fleets, updatedValues: Fleet) => {
        const fleetValues: any = {};

        for (const name in allFleets) {
            if (name === fleetName)
                fleetValues[newFleetName] = updatedValues;
            else
                fleetValues[name] = allFleets[name];
        }
        delete fleetValues[newFleetName].FleetName;
        return fleetValues;
    };

    const handleFleetSubmit = (fleetName: string, fleetData: Fleet, newFleetName?: string) => {
        let updatedFormValues = { ...formValues };
        updatedFormValues[fleetName] = fleetData;
        if (newFleetName) {
            if (formValues[newFleetName] && newFleetName !== fleetName) {
                notification.error({
                    message: "Fleet name already exists",
                    description: `'${newFleetName}'is an already existing fleet. Please enter another name.`,
                    placement: 'topLeft',
                });
                return;
            }
            updatedFormValues = updateFleetName(fleetName, newFleetName, formValues, fleetData);
        }
        setFormValues(updatedFormValues);
        onDataUpdate(updatedFormValues);
        delete unsavedForm[fleetName];
        setUnsavedForm(unsavedForm);
        triggerRerender();
    };

    const getCurrentSubnetIds = (fleets: Fleets): string[] => {
        const subnetIds: string[] = [];

        if (!fleets)
            return subnetIds;
        Object.values(fleets).forEach((fleet) => {
            if (!fleet || !fleet.LaunchTemplateConfigs || !Array.isArray(fleet.LaunchTemplateConfigs))
                return subnetIds;
            fleet.LaunchTemplateConfigs.forEach((config) => {
                if (!config || !config.Overrides || !Array.isArray(config.Overrides))
                    return subnetIds;
                config.Overrides.forEach((override) => {
                    if (!override || override.SubnetId === undefined)
                        return subnetIds;
                    if (typeof override.SubnetId === 'string') {
                        if (!subnetIds.includes(override.SubnetId))
                            subnetIds.push(override.SubnetId);
                    } else if (Array.isArray(override.SubnetId)) {
                        override.SubnetId.forEach((subnetId) => {
                            if (!subnetIds.includes(subnetId))
                                subnetIds.push(subnetId);
                        });
                    }
                });
            });
        });
        return subnetIds;
    };

    const handleSubmission = (fleetName: string, updatedValues: Fleet, values: Fleet) => {
        if (!FormVerification.isValidFleet(fleetName, updatedValues))
            return false;
        console.log(updatedValues.TagSpecifications[0]);
        if (!updatedValues.TagSpecifications[0] || !updatedValues.TagSpecifications[0].Tags || updatedValues.TagSpecifications[0].Tags.length === 0)
            updatedValues.TagSpecifications = [];
        handleFleetSubmit(fleetName, updatedValues, values.FleetName);
        return true;
    };

    const submitFleet = (fleetName: string, updatedValues: Fleet): boolean => {
        let submit = false;

        if (!updatedValues)
            return submit;
        updatedValues.LaunchSpecifications = updatedValues.LaunchSpecifications || [];
        submit = true;
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
                    submit = handleSubmission(fleetName, updatedValues, formValues[fleetName]);
                },
                onCancel: () => {
                    submit = handleSubmission(fleetName, updatedValues, formValues[fleetName]);
                },
            });
        }
        handleSubmission(fleetName, updatedValues, formValues[fleetName]);
        return submit;
    };

    const renderSaveButton = (fleetName: string) => {
        if (unsavedForm[fleetName] === undefined)
            return;
        return (
            <Space>
                <Typography.Text type='secondary' >Unsaved changes</Typography.Text>
                <SaveTwoTone onClick={() => submitFleet(fleetName, unsavedForm[fleetName])} />
            </Space>)
    };

    const handleDynamicFormChange = (value: Fleet, name: string, launchTemplateConfig?: LaunchTemplateConfig[]) => {
        if (launchTemplateConfig)
            value.LaunchTemplateConfigs = launchTemplateConfig;
        unsavedForm[name] = value;
        setUnsavedForm(unsavedForm);
        triggerRerender();
    }

    const collapseItems = Object.entries(formValues).map(([fleetName]) => ({
        key: fleetName,
        label: (
            <Row style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography.Text strong>{fleetName}</Typography.Text>
                <Space>
                    {renderSaveButton(fleetName)}
                    <Popconfirm
                        title="Delete the fleet"
                        description="Are you sure to delete this fleet?"
                        onConfirm={() => handleDeleteFleet(fleetName)}
                        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            </Row>
        ),
        children: (
            <DynamicForm
                fleetName={fleetName}
                formData={formValues[fleetName]}
                onDataUpdate={handleFleetSubmit}
                onFleetDelete={handleDeleteFleet}
                hasChanged={handleDynamicFormChange}
                currentSubnets={getCurrentSubnetIds(formValues)} />
        ),
    }));

    return (
        <>
            <div style={{ marginBottom: '16px', height: '86vh', overflow: 'auto' }}>
                <Space direction="vertical" size="small" style={{ display: 'flex' }}>
                    {collapseItems.map(({ key, label, children }) => (
                        <Collapse
                            key={key}
                            accordion
                            activeKey={activeKey}
                            onChange={handlePanelChange}
                            expandIconPosition='end'
                            expandIcon={({ isActive }) => <ArrowUpOutlined style={{ paddingTop: '10px' }} rotate={isActive ? 0 : 180} />}
                            collapsible="icon"
                            items={[{ key, label, children }]}
                            className="custom"
                        />
                    ))}
                </Space>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddFleet} ref={addRef}>Add Fleet</Button>
        </>
    );
};

export default FleetsForm;
