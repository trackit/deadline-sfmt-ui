import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Flex, notification, Popconfirm, Tooltip, Space } from 'antd';
import { syntaxHighlight } from '../utils/syntaxHighlight';
import JsonEditor from './JsonEditor';
import '../index.css'
import { Fleet } from '../interface';
import { AllocationStrategyValue, InstanceTypeValue, TypeValue } from '../data/ItemsValues';
import { QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import * as Joi from '@hapi/joi';

interface JsonPreviewCardProps {
    data: Record<string, Fleet>;
    onDataUpdate: (updatedData: Record<string, Fleet>) => void;
    editButtonRef: React.MutableRefObject<null>;
}
const key = 'updatable'
const JsonPreviewCard: React.FC<JsonPreviewCardProps> = ({ data, onDataUpdate, editButtonRef }) => {
    const [fleetNameError, setFleetNameError] = useState<string[]>([]);
    const [formattedError, setFormattedError] = useState<string[]>([]);
    const [notificationKey, setNotificationKey] = useState<string>(key);
    const [currentIndex, setCurrentIndex] = useState(0); 
    const [formattedJson, setFormattedJson] = useState(() => JSON.stringify(data, null, 2));
    const [isEditing, setIsEditing] = useState(false);
    const [originalJson, setOriginalJson] = useState('');
    const initialRef: any = null;
    const editorRef = React.useRef(initialRef);
    const hasConsistentPriorities = (overrides: any) => {
        const priorities: any = {};
        for (const override of overrides) {
            if (!(override.InstanceType in priorities)) {
                priorities[override.InstanceType] = override.Priority;
            } else {
                if (priorities[override.InstanceType] !== override.Priority) {
                    return false;
                }
            }
        }
        return true;
    };


    const keySchema = Joi.string().pattern(/^[A-Za-z0-9_-]+$/);
    const fleetSchema = Joi.object({
        AllocationStrategy: Joi.string().valid(...AllocationStrategyValue).required().messages({
            "any.only": `must be one of the following: "capacityOptimized", "diversified", "capacityOptimizedPrioritized", "lowestPrice".`
        }),
        IamFleetRole: Joi.string().pattern(/^arn:aws:iam::\d{12}:role\/[a-zA-Z0-9_-]+$/).required().messages({
            "string.pattern.base": `must be in the format arn:aws:iam::accountid:role/fleet-role-name`,
        }),
        TerminateInstancesWithExpiration: Joi.boolean().strict().required(),
        TargetCapacity: Joi.number().strict().min(0).required().messages({
            "number.min": `must be greater than or equal to zero`
        }),
        ReplaceUnhealthyInstances: Joi.boolean().strict().required(),
        Type: Joi.string().valid(...TypeValue).required().messages({
            "any.only": `must be one of the following: "maintain", "request".`
        }),
        TagSpecifications: Joi.array().items(Joi.object({
            ResourceType: Joi.string().valid('spot-fleet-request').required().messages({
                "any.only": `must be "spot-fleet-request".`
            }),
            Tags: Joi.array().items(Joi.object({
                Key: Joi.string().pattern(/^[\w\s+=:.@/-]+$/).required().messages({
                    "string.pattern.base": `allowed characters are letters, numbers, spaces representable in UTF-8, and the following characters: _ . : / = + - @.`,
                }),
                Value: Joi.string().pattern(/^[\w\s+=:.@/-]+$/).required().messages({
                    "string.pattern.base": `allowed characters are letters, numbers, spaces representable in UTF-8, and the following characters: _ . : / = + - @.`,
                }),
            })).unique((a, b) => a.Key === b.Key).required().concat(Joi.array().items(
                Joi.object({
                    Key: Joi.string().valid('DeadlineTrackedAWSResource').required(),
                    Value: Joi.string().valid('SpotEventPlugin').required()
                }).required(),
            )).required().messages({
                "array.includesRequiredUnknowns": `The tag with Key DeadlineTrackedAWSResource and Value SpotEventPlugin is required.`,
            }),
        })),
        LaunchTemplateConfigs: Joi.array().items(Joi.object({
            LaunchTemplateSpecification: Joi.object({
                LaunchTemplateId: Joi.string().regex(/^lt-[a-zA-Z0-9]{17}$/).required().messages({
                    "string.pattern.base": `does not match the required pattern. It must be like 'lt-xxxxxxxxxxxxxxxxx'`,
                }),
                Version: Joi.string().required(),
            }).required(),
            Overrides: Joi.array().items(Joi.object({
                InstanceType: Joi.string().valid(...InstanceTypeValue).required(),
                SubnetId: Joi.string().regex(/^subnet-[a-zA-Z0-9]{17}$/).required().messages({
                    "string.pattern.base": `does not match the required pattern. It must be like 'subnet-xxxxxxxxxxxxxxxxx'`,
                }),
                Priority: Joi.when('......AllocationStrategy', {
                    is: 'capacityOptimizedPrioritized',
                    then: Joi.number().strict().min(0).required().messages({
                        "number.min": `must be greater than or equal to zero`
                    }),
                }).messages({
                    "any.required": `is required when AllocationStrategy is set on capacityOptimizedPrioritized`,
                }),
                WeightedCapacity: Joi.number().strict().min(0).messages({
                    "number.min": `must be greater than or equal to zero`
                }),
            })).required().unique((a, b) => a.InstanceType === b.InstanceType && a.SubnetId === b.SubnetId).required(),
        })).custom((value, helpers) => {
            const allOverrides = value.reduce((acc: any, config: { Overrides: any[]; }) => {
                const overridesWithPriority = config.Overrides.filter(override => override.Priority !== undefined);
                return [...acc, ...overridesWithPriority];
            }, []);

            if (!hasConsistentPriorities(allOverrides)) {
                return helpers.error('any.custom', { message: 'Overrides must have consistent priorities for the same InstanceType.' });
            }
            return value;
        }, 'custom validation').unique((a, b) => {
            if (
                JSON.stringify(a.LaunchTemplateSpecification) === JSON.stringify(b.LaunchTemplateSpecification)
            ) {
                if (JSON.stringify(a.Overrides) === JSON.stringify(b.Overrides)) {
                    return true;
                }
            }
            return false;
        }).min(1).messages({
            'array.min': 'must contain LaunchTemplateSpefications and Overrides items'
        }).required(),
        LaunchSpecifications: Joi.array().items(Joi.object()).custom((value, helpers) => {
            if (value.length > 0) {
                return helpers.error('any.invalid');
            }
            return value;
        }).messages({
            'any.invalid': 'is not supported'
        }).required().messages({
            "any.required": `is required, please add "LaunchSpecifications : []"`,
        }),
    });
    const fleetsSchema = Joi.object().pattern(
        keySchema,
        fleetSchema
    );
    useEffect(() => {
        setFormattedJson(JSON.stringify(data, null, 2));
        setOriginalJson(JSON.stringify(data, null, 2));
        
    }, [data]);

    const handleSearchClick = () => {
        if (editorRef.current) {
            editorRef.current.getAction('actions.find').run();
        }
    };
    
    const openNotification = (currentError: string) => {
        const totalErrors = formattedError.length;
        notification.error({
            key: notificationKey,
            message: `Validation Error (${currentIndex + 1}/${totalErrors})`,
            description: (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {currentError}
                </div>
            ),
            btn: (
                <Space direction='horizontal' size={190}>
                    <Button onClick={handlePreviousError} disabled={currentIndex === 0}>Previous</Button>
                    <Button onClick={handleNextError} disabled={currentIndex === formattedError.length - 1}>Next</Button>
                </Space>
            )
        });
    };
    
    const handleNextError = () => {
        setCurrentIndex(prevIndex => prevIndex + 1);
        notification.destroy();
        openNotification(formattedError[currentIndex + 1]);
    };

    const handlePreviousError = () => {
        setCurrentIndex(prevIndex => prevIndex - 1);
        notification.destroy();
        openNotification(formattedError[currentIndex - 1]);
    };
    useEffect(() => {
        if (formattedError.length > 0) {
          openNotification(formattedError[currentIndex]);
        }
      }, [formattedError, currentIndex]);
      
    const handleEditClick = (state: boolean) => {
        if (!state) {
            setIsEditing(!state);
            return;
        }
        try {
            const updatedData = JSON.parse(formattedJson);
            let tagsAdded = false;
            const fleetsWithAddedTags: string[] = [];
            const addRequiredTag = (data: Record<string, any>) => {
                Object.keys(data).forEach(key => {
                    const fleet = data[key];
                    fleet.TagSpecifications.forEach((tagSpecification: any) => {
                        
                            const hasRequiredTag = tagSpecification.Tags.some(
                                (tag: any) => tag.Key === 'DeadlineTrackedAWSResource' && tag.Value === 'SpotEventPlugin'
                            );
    
                            if (!hasRequiredTag) {
                                tagSpecification.Tags.push({
                                    Key: 'DeadlineTrackedAWSResource',
                                    Value: 'SpotEventPlugin'
                                });
                                tagsAdded = true; 
                                fleetsWithAddedTags.push(key);
                            }
                    });
                });
            };
            addRequiredTag(updatedData);
            const { error } = fleetsSchema.validate(updatedData,{  abortEarly: false });
            if (error) {
                if (currentIndex < 0 || currentIndex >= error.details.length) {
                    setCurrentIndex(0); 
                }
                const fleetNameErrors = error.details.filter(detail => detail.path.length === 1);
                const otherErrors = error.details.filter(detail => detail.path.length > 1);
                const formattedFleetNameErrors = fleetNameErrors.map(fleetNameError => {
                    return (fleetNameError.message).concat(' valid Fleetname contain A-Z, a-z, 0-9, - and _');
                });
                const formattedErrors = otherErrors.map(detail => {
                        const errorPath = detail.path
                        const context = detail.context?.message
                        const value = detail.context?.value;
                        const stack: any[] = [];
                        const formattedPath = errorPath.map((segment, index) => {
                            if (!isNaN(Number(segment))) {
                                const arrayIndex = Number(segment) + 1;
                                return `item ${arrayIndex}`;
                            } else {
                                stack.push(segment);
                                return segment;
                            }
                        }).join(' -> ');

                        const message = detail.message.replace(/".*"\s/, '');
                        if (context !== undefined) {
                            return `${formattedPath}  ${context}`

                        }
                        else if (typeof value === 'object' || value === undefined) {
                            return `${formattedPath} ${message}`;

                        } else {
                            const errorMessage = `${formattedPath} -> value: ${value} ${message}  `;
                            return errorMessage;

                        }
                    });
                    if (fleetNameErrors.length > 0) {
                        setFleetNameError(formattedFleetNameErrors);
                        setFormattedError(formattedFleetNameErrors);
                    } else {
                        setFleetNameError([]);
                        setFormattedError(formattedErrors);
                    }
        
                    setCurrentIndex(0);
                    openNotification(formattedFleetNameErrors.length > 0 ? formattedFleetNameErrors[currentIndex] : formattedErrors[currentIndex]);
                   
                
                return;
            }
            onDataUpdate(updatedData);
            setIsEditing(!state);
            setOriginalJson(formattedJson);
            if (tagsAdded) {
                notification.info({
                    message: 'Required Tag Added',
                    description: `The required tag "DeadlineTrackedAWSResource: SpotEventPlugin" was automatically added to the following fleets: ${fleetsWithAddedTags.join(', ')}`,
                });
            }
            notification.success({
                message: 'Edit Successful',
                description: 'Your config file data has been updated successfully',
                placement: "top"
            });
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
            return <JsonEditor initialValue={formattedJson} onChange={handleJsonEditorChange} editorRef={editorRef} />;
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
            <Card
            title={
                <Flex gap="small" wrap="wrap">
                    <span>JSON Code preview</span>
                    {isEditing && (
                        <Tooltip title="Find in JSON">
                            <SearchOutlined onClick={handleSearchClick} style={{ fontSize: '20px', marginLeft: '8px', color: '#1677ff', cursor: 'pointer' }} />
                        </Tooltip>
                    )}
                </Flex>
            } extra={
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