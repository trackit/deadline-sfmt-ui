import React from 'react';
import { AllocationStrategyValue, InstanceTypeValue, TypeValue } from '../data/ItemsValues';
import { Fleets, Fleet, LaunchTemplateConfig, TagSpecification } from '../interface';
import { notification } from 'antd';

class FormVerification {

    static notificationError = (message: string, description: string) => {
        return notification.error({
            message: message,
            description: description,
            placement: 'topLeft',
        });
    };
    static notificationWarning = (message: string, description: string) => {
        return notification.warning({
            message: message,
            description: description,
            placement: 'topLeft',
        });
    };

    static isValidFleet = (fleetName: string, fleet: Fleet): boolean => {
        if (!FormVerification.checkLaunchTemplateConfig(fleetName, fleet.LaunchTemplateConfigs))
            return false;
        if (!this.checkTagSpecification(fleetName, fleet.TagSpecifications))
            return false;
        if (!FormVerification.isValidIamFleetRole(fleet.IamFleetRole))
            return false;
        return true;
    };

    static isValidIamFleetRole = (iamFleetRole: string | null): boolean => {
        const pattern = /^arn:aws:iam::\d{12}:role\/[a-zA-Z0-9_-]+$/;

        if (!iamFleetRole || iamFleetRole === '') {
            FormVerification.notificationError('Empty Field', 'IAM Fleet Role is required.');
            return false;
        }
        if (!pattern.test(iamFleetRole)) {
            FormVerification.notificationError(
                'Invalid Format',
                'Please provide an IamFleetRole in the following format: arn:aws:iam::accountid:role/fleet-role-name'
            );
            return false;
        }
        return true;
    };

    static isValidInstanceType = (instanceType: string): boolean => {
        const isValid = InstanceTypeValue.includes(instanceType);
        if (!isValid)
            if (instanceType === '') {
                FormVerification.notificationError('Duplicate Instance Type', `Choose a valid Instance Type`);
            } else {
                FormVerification.notificationError('Invalid Instance Type', `The instance type '${instanceType}' is not valid. It must be part of the list.`);
            }
        return isValid;
    };

    static isValidLaunchTemplateId = (launchTemplateId: string): boolean => {
        const isValid = /^lt-[a-zA-Z0-9]{17}$/.test(launchTemplateId);

        if (!isValid)
            return false;
        return true;
    };


    static isValidSubnetId = (subnetId: string | string[]): boolean => {
        if (subnetId === null) {
            FormVerification.notificationError('Null Subnet ID', 'Subnet ID cannot be null.');
            return false;
        }
        if (typeof subnetId === 'string') {
            const isValid = /^subnet-[a-zA-Z0-9]{17}$/.test(subnetId);
            if (!isValid) {
                FormVerification.notificationError('Invalid Subnet ID', `The subnet ID '${subnetId}' does not match the required pattern.\nIt must be like 'subnet-xxxxxxxxxxxxxxxxx'`);
            }
            return isValid;
        } else if (Array.isArray(subnetId)) {
            let allValid = true;
            for (const id of subnetId) {
                if (!FormVerification.isValidSubnetId(id))
                    allValid = false;
            }
            return allValid;
        }
        return false;
    };

    static checkLaunchTemplateConfig = (fleetName: string, configs: LaunchTemplateConfig[]): boolean => {
        if (!configs || configs.length === 0) {
            FormVerification.notificationError('Invalid Launch Template Config', `Launch Template Specification must be complete in fleet: ${fleetName}`);
            return false;
        }

        for (const value of configs) {
            if (!value.LaunchTemplateSpecification ||
                !value.LaunchTemplateSpecification.LaunchTemplateId ||
                !value.LaunchTemplateSpecification.Version) {
                return false;
            }
            if (!FormVerification.isValidLaunchTemplateId(value.LaunchTemplateSpecification.LaunchTemplateId))
                return false;
            if (!value.Overrides || value.Overrides.length === 0)
                return false;
            for (const override of value.Overrides) {
                if (!FormVerification.isValidInstanceType(override.InstanceType) ||
                    !FormVerification.isValidSubnetId(override.SubnetId)) return false;
                if (Array.isArray(override.SubnetId) && override.SubnetId.length === 0) {
                    FormVerification.notificationError('Invalid Launch Template Config', 'At least one subnet is required.');
                    return false;
                }
                if (override.WeightedCapacity === null) {
                    delete override.WeightedCapacity; 
                }
                if (override.Priority !== undefined && override.Priority === null) {
                    FormVerification.notificationError('Null Priority', 'Priority cannot be null.');
                    return false;
                }
            }
        }
        return true;
    };

    static isDuplicateTagKeys = (values: TagSpecification[]): boolean => {
        const keySet: Set<string> = new Set();

        for (const tagSpec of values) {
            for (const tag of tagSpec.Tags) {
                if (keySet.has(tag.Key)) {
                    FormVerification.notificationError('Duplicate Tag Key', `The tag key '${tag.Key}' is duplicated.`);
                    return true;
                } else
                    keySet.add(tag.Key);
            }
        }
        return false;
    };

    static isAllValidTag = (tags: TagSpecification): boolean => {
        for (const tag of tags.Tags) {
            if (!tag.Key || !tag.Value) {
                FormVerification.notificationError('Empty Field', 'When specifying a tag, please provide both the tag key and the tag value.');
                return false;
            }
        }
        return true;
    };

    static isAwsTag = (fleetName: string, values: TagSpecification[]): boolean => {
        const tags = values.flatMap((tagSpec: { Tags?: any[] }) => tagSpec.Tags || []);
        const awsTags = tags.filter((tag: { Key: string }) => tag && tag.Key && tag.Key.startsWith('aws:'));

        if (awsTags.length > 0) {
            FormVerification.notificationError('Restricted Tag Modification', `System created tags that begin with the "aws:" prefix cannot be modified or deleted for fleet: ${fleetName}.`);
            return false;
        }
        return true;
    };

    static checkTagSpecification = (fleetName: string, tagSpecifications: TagSpecification[]): boolean => {
        if (!tagSpecifications || tagSpecifications.length === 0)
            return true;
        if (tagSpecifications.length > 1) {
            FormVerification.notificationError('An error occured', `There was an error with the tags specification at fleet ${fleetName}.`);
            return false;
        }
        if (!tagSpecifications[0].Tags || tagSpecifications[0].Tags.length === 0)
            return true;
        if (FormVerification.isDuplicateTagKeys(tagSpecifications))
            return false;
        if (!FormVerification.isAllValidTag(tagSpecifications[0]))
            return false;
        if (!FormVerification.isAwsTag(fleetName, tagSpecifications))
            return false;
        return true;
    };

}

export default FormVerification;
