import React, { useState, useEffect } from 'react';
import { Card, Button, Flex, notification, Popconfirm } from 'antd';
import { syntaxHighlight } from '../utils/syntaxHighlight';
import IntroductionTour from './IntroductionTour';
import JsonEditor from './JsonEditor';
import '../index.css'
import { Fleet, Tag } from '../interface';
import { AllocationStrategyValue, InstanceTypeValue, TypeValue } from '../data/ItemsValues';
import { QuestionCircleOutlined } from '@ant-design/icons';
import * as Joi from '@hapi/joi';
interface JsonPreviewCardProps {
    data: Record<string, Fleet>;
    onDataUpdate: (updatedData: Record<string, Fleet>) => void;
    editButtonRef: React.MutableRefObject<null>;
}
const JsonPreviewCard: React.FC<JsonPreviewCardProps> = ({ data, onDataUpdate, editButtonRef }) => {
    const [formattedJson, setFormattedJson] = useState(() => JSON.stringify(data, null, 2));
    const [isEditing, setIsEditing] = useState(false);
    const [originalJson, setOriginalJson] = useState('');
    
    const keySchema = Joi.string().pattern(/^[A-Za-z0-9_-]+$/);
    const fleetSchema = Joi.object({
            AllocationStrategy: Joi.string().valid("capacityOptimized",
            "capacityOptimizedPrioritized",
            "diversified",
            "lowestPrice").allow(''),
            IamFleetRole: Joi.string().pattern(/^arn:aws:iam::\d{12}:role\/[a-zA-Z0-9_-]+$/).messages({
                "string.pattern.base": `must be in the format arn:aws:iam::accountid:role/fleet-role-name`,
              }),
            TerminateInstancesWithExpiration: Joi.boolean().strict(),
            TargetCapacity: Joi.number().strict().min(0).required(),
            ReplaceUnhealthyInstances: Joi.boolean().strict().optional(),
            Type: Joi.string().valid(...TypeValue , ''),
            TagSpecifications: Joi.array().items(Joi.object({
                ResourceType: Joi.string().valid('spot-fleet-request').required(),
                Tags: Joi.array().items(Joi.object({
                    Key: Joi.string().pattern(/^[\w\s+=:.@/-]+$/).required().messages({
                        "string.pattern.base": `allowed characters are letters, numbers, spaces representable in UTF-8, and the following characters: _ . : / = + - @.`,
                      }),
                    Value: Joi.string().pattern(/^[\w\s+=:.@/-]+$/).required().messages({
                        "string.pattern.base": `allowed characters are letters, numbers, spaces representable in UTF-8, and the following characters: _ . : / = + - @.`,
                      }),
                })).unique((a, b) => a.Key === b.Key).optional(),
            })),
            LaunchTemplateConfigs: Joi.array().items(Joi.object({
                LaunchTemplateSpecification: Joi.object({
                    LaunchTemplateId: Joi.string().regex(/^lt-[a-zA-Z0-9]{17}$/).optional().messages({
                        "string.pattern.base": `must be in the format lt-<17 characters alphanumeric> Example: lt-111111111111111111`,
                      }),
                    Version: Joi.string().optional(),
                }).optional(),
                Overrides: Joi.array().items(Joi.object({
                    InstanceType: Joi.string().valid(...InstanceTypeValue).required(),
                    SubnetId: Joi.string().regex(/^subnet-[a-zA-Z0-9]{17}$/).required().messages({
                        "string.pattern.base": `must be in the format subnet-<17 characters alphanumeric> Example: subnet-111111111111111111`,
                      }),
                      Priority: Joi.when('......AllocationStrategy', {
                        is: 'capacityOptimizedPrioritized',
                        then: Joi.number().strict().min(0).required(),
                        otherwise: Joi.forbidden()
                    }),
                    })).unique((a,b) => a.InstanceType === b.InstanceType && a.SubnetId === b.SubnetId).required(),
            })).unique((a, b) => {
                if (
                    JSON.stringify(a.LaunchTemplateSpecification) === JSON.stringify(b.LaunchTemplateSpecification)
                ) {
                    if (JSON.stringify(a.Overrides) === JSON.stringify(b.Overrides)) {
                        return true;
                    }
                }
                return false;
            }),
            LaunchSpecifications: Joi.array().items(Joi.object()).custom((value, helpers) => {
                if (value.length > 0) {
                    return helpers.error('any.invalid');
                }
                return value;
            }).messages({
                'any.invalid': 'is not supported'
            }).required(),
        });
        const fleetsSchema = Joi.object().pattern(
            keySchema,
            fleetSchema
        );
    useEffect(() => {
        setFormattedJson(JSON.stringify(data, null, 2));
        setOriginalJson(JSON.stringify(data, null, 2));
    }, [data]);
    const getLineNumber = (errorPath: string, jsonString: string, fleetName: string) => {
        const lines = jsonString.split('\n');
        let fleetStartIndex = -1;
        let fleetEndIndex = -1;
    console.log(fleetName)
        lines.forEach((line, index) => {
            if (line.includes(`"${fleetName}": {`)) {
                fleetStartIndex = index;
            }
            if (line.trim() === '},') {
                fleetEndIndex = index;
            }
        });
        for (let i = fleetStartIndex; i <= fleetEndIndex; i++) {
            if (lines[i].includes(errorPath)) {
                console.log(errorPath)
                return i + 1;
            }
        }
        return null;
    };
    const handleEditClick = (state: boolean) => {
        if (!state) {
            setIsEditing(!state);
            return;
        }
        try {
            const updatedData = JSON.parse(formattedJson);
            const { error } = fleetsSchema.validate(updatedData);
            if (error) {
                const fleetNameError = error.details.find(detail => detail.path.length === 1);
                if (fleetNameError) {
                    const fieldName = fleetNameError.path[0].toString();
                    const lineNumber = getLineNumber(fieldName, formattedJson, fieldName);
                    notification.error({
                        message: 'Validation Error',
                        description: `[Line: ${lineNumber}] ${fleetNameError.message}: valid characters are A-Z, a-z, 0-9, - and _`,
                    });
                } else {
                    const formattedError = error.details.map(detail => {
                        const path = detail.path.join('.');
                        const fleetName = path.split('.')[0];
                        const fieldName = path.replace(/\.\d+$/, '').split('.').pop();
                        const message = detail.message.replace(/".*"\s/, '');
                        const lineNumber = getLineNumber(fieldName || '', formattedJson, fleetName);
                        return `${fleetName} ${fieldName} ${message} `;
                    }).join('\n');
                    notification.error({
                        message: 'Validation Error',
                        description: (
                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {formattedError}
                            </div>
                        ),
                    });
                    
                }
                return;
            }
            onDataUpdate(updatedData);
            setIsEditing(!state);
            setOriginalJson(formattedJson);
        } catch (error) {
            notification.open({
                message: 'Invalid JSON format',
                description: 'Please make sure the JSON is correctly formatted.',
            });
        }
    };
    const handleJsonEditorChange = (newValue: string) => {
        setFormattedJson(newValue);
    };
    const getRenderedContent = (state: boolean) => {
        if (state)
            return <JsonEditor initialValue={formattedJson} onChange={handleJsonEditorChange} />;
        return (
            <div className="scrollable-content">
                <pre
                    dangerouslySetInnerHTML={{
                        __html: syntaxHighlight(formattedJson)
                    }}
                />
            </div >
        );
    };
    const handleCancelClick = () => {
        setIsEditing(false);
        setFormattedJson(originalJson);
    };
    return (
        <div className='card'>
            <Card title="JSON Code preview" extra={
                <Flex gap="small" wrap="wrap">
                   {isEditing &&
                     <Popconfirm
                     title="Cancel"
                     description="Are you sure to cancel your edits ?"
                     onConfirm={handleCancelClick}
                     icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                     okText="Yes"
                     cancelText="No"
                   >
                     <Button danger>Cancel</Button>
                   </Popconfirm>
                    }
                    <Button type="default" onClick={() => handleEditClick(isEditing)} ref={editButtonRef}>{isEditing ? 'Save' : 'Edit'}</Button>
                </Flex>
            } style={{ height: '100%' }}>
                {getRenderedContent(isEditing)}
            </Card>
        </div>
    );
};
export default JsonPreviewCard;