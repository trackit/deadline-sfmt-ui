import React, { useState, useEffect } from 'react';
import { Button, Row, Typography, Collapse, Space, Popconfirm, notification } from 'antd';
import { Fleets, Fleet } from '../interface';
import { ArrowUpOutlined, DeleteOutlined, QuestionCircleOutlined, PlusOutlined } from '@ant-design/icons';
import DynamicForm from './DynamicForm';
import '../index.css';

interface FleetFormProps {
    formData: Fleets;
    onDataUpdate: (updatedData: Record<string, any>) => void;
    addRef: React.MutableRefObject<null>;
}

const FleetsForm = ({ formData, onDataUpdate, addRef }: FleetFormProps) => {
    const [activeKey, setActiveKey] = useState<string | string[]>([]);
    const [formValues, setFormValues] = useState<Fleets>(formData);

    useEffect(() => {
        setFormValues(formData);
    }, [formData]);

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
    };

    const getCurrentSubnetIds = (fleets: Fleets): string[] => {
        const subnetIds: string[] = [];

        Object.values(fleets).forEach((fleet) => {
            fleet.LaunchTemplateConfigs.forEach((config) => {
                config.Overrides.forEach((override) => {
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

    const collapseItems = Object.entries(formValues).map(([fleetName]) => ({
        key: fleetName,
        label: (
            <Row style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography.Text strong>{fleetName}</Typography.Text>
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
            </Row>
        ),
        children: (
            <DynamicForm fleetName={fleetName} formData={formValues[fleetName]} onDataUpdate={handleFleetSubmit} onFleetDelete={handleDeleteFleet} currentSubnets={getCurrentSubnetIds(formValues)} />
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
