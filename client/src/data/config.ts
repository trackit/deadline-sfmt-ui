
const fleetData = {
    "fleet_1": {
      "AllocationStrategy": "capacityOptimized",
      "IamFleetRole": "arn:aws:iam::450006745611:role/aws-ec2-spot-fleet-tagging-role",
      "LaunchSpecifications": [],
      "LaunchTemplateConfigs": [
        {
          "LaunchTemplateSpecification": {
            "LaunchTemplateId": "lt-x4r3bb9jhc53ddzx4",
            "Version": "$Latest"
          },
          "Overrides": [
            {
              "InstanceType": "c5.4xlarge",
              "SubnetId": "subnet-9knxxx5fjlh73esrg",
              "WeightedCapacity": 1
            }
          ]
        },
        {
          "LaunchTemplateSpecification": {
            "LaunchTemplateId": "lt-x4r3bb9jhc53ddzx4",
            "Version": "$Latest"
          },
          "Overrides": [
            {
              "InstanceType": "c5.4xlarge",
              "SubnetId": "subnet-20onxs4fjl65revbh",
              "WeightedCapacity": 1
            }
          ]
        },
        {
          "LaunchTemplateSpecification": {
            "LaunchTemplateId": "lt-x4r3bb9jhc53ddzx4",
            "Version": "$Latest"
          },
          "Overrides": [
            {
              "InstanceType": "m5.4xlarge",
              "SubnetId": "subnet-9knxxx5fjlh73esrg",
              "WeightedCapacity": 2
            }
          ]
        }
      ],
      "ReplaceUnhealthyInstances": true,
      "TagSpecifications": [
        {
          "ResourceType": "spot-fleet-request",
          "Tags": [
            {
              "Key": "aws-rfdk",
              "Value": "0.42.0:SpotEventPluginFleet"
            },
            {
              "Key": "deployedByStudioBuilder",
              "Value": "true"
            },
            {
              "Key": "DeadlineTrackedAWSResource",
              "Value": "SpotEventPlugin"
            }
          ]
        }
      ],
      "TargetCapacity": 20,
      "TerminateInstancesWithExpiration": true,
      "Type": "maintain"
    }
  };

export default fleetData;
