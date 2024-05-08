
interface Ebs {
    DeleteOnTermination: boolean;
    Encrypted: boolean;
    SnapshotId: string;
    VolumeSize: number;
    VolumeType: string;

}

export interface LaunchTemplateSpecification {
    LaunchTemplateId: string;
    Version: string;
}

export interface Override {
    InstanceType: string;
    SubnetId: string | string[];
    Priority?: number;
    WeightedCapacity?: number;
}

export interface LaunchTemplateConfig {
    LaunchTemplateSpecification: LaunchTemplateSpecification;
    Overrides: Override[];
}

export interface Tag {
    Value: string;
    Key: string;
}

export interface TagSpecification {
    ResourceType: string;
    Tags: Tag[];
}

export interface Fleets {
    [key: string]: Fleet;
}

export interface Fleet {
    AllocationStrategy: string;
    IamFleetRole: string;
    LaunchSpecifications: [];
    LaunchTemplateConfigs: LaunchTemplateConfig[];
    ReplaceUnhealthyInstances: boolean;
    TargetCapacity: number;
    TerminateInstancesWithExpiration: boolean;
    Type: string;
    TagSpecifications: TagSpecification[];
    ValidFrom?: string;
    ValidUntil?: string;
    FleetName?: string;
}
