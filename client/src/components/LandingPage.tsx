import React, { useState } from 'react';
import { Modal, Typography, List, Row, Col, Checkbox, Button, Space } from 'antd';
import logo from '../assets/logo.avif';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { useFleetContext } from '../context/FleetContext';

const { Title, Paragraph } = Typography;

interface LandingPageProps {
  showModal?: boolean;
  handleModalCancel: (hideModal: boolean) => void;
}



const LandingPage: React.FC<LandingPageProps> = ({ showModal, handleModalCancel }) => {
  const [checked, setChecked] = useState(false);
  const { setFleetData } = useFleetContext();
  const data = [
    {
      title: 'Adding a Fleet',
      description: 'Create a new fleet with an empty configuration or upload a Spot Fleet configuration file.'
    },
    {
      title: 'Deleting a Fleet',
      description: 'Locate the fleet you want to remove, and simply click on the delete option to confirm the deletion.'
    },
    {
      title: 'Editing the Fleet',
      description: 'Make necessary changes to the fleet configuration either through the form or the JSON editor.'
    },
    {
      title: 'Exporting a Fleet Configuration',
      description: 'After making desired edits to the fleet configuration, locate the option to export the Spot Fleet configuration.'
    },
  ];

  const handleModalClose = () => {
    handleModalCancel(checked);
  };

  const onChange = (e: CheckboxChangeEvent) => {
    setChecked(e.target.checked);
  };
  const handleButtonClick = () => {
    const newFleetData = {
      "farm-3dsmax": {
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
                          "SubnetId": "subnet-9knxxx5fjlh73esrg"
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
                          "SubnetId": "subnet-20onxs4fjl65revbh"
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
                          "SubnetId": "subnet-9knxxx5fjlh73esrg"
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
                      }
                  ]
              }
          ],
          "TargetCapacity": 20,
          "TerminateInstancesWithExpiration": true,
          "Type": "maintain"
      },
      "farm-c4d": {
          "AllocationStrategy": "capacityOptimizedPrioritized",
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
                          "InstanceType": "m5.8xlarge",
                          "SubnetId": "subnet-20onxs4fjl65revbh",
                          "Priority": 1
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
                          "InstanceType": "c5.2xlarge",
                          "SubnetId": "subnet-9knxxx5fjlh73esrg",
                          "Priority": 2
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
                      }
                  ]
              }
          ],
          "TargetCapacity": 15,
          "TerminateInstancesWithExpiration": true,
          "Type": "maintain"
      }
  };
  
    setFleetData(newFleetData);
  };
  
  return (
    <Modal
      centered
      open={showModal}
      onCancel={handleModalClose}
      width={1500}
      footer={[
        <Checkbox key="doNotShowAgainCheckbox" onChange={onChange}>
          Do not show again
        </Checkbox>,
      ]}
    >
      <div style={{ height: '70vh',overflow: 'auto' }}>
      <Row>
      <Col span={12} style={{display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '150px'}}>
            
              <a href="https://trackit.io/" target="_blank" rel="noreferrer">
                <img
                  data-fetchpriority='high'
                  className='logo-modal'
                  src={logo}
                  alt="Logo"
                />
              </a>
           
          </Col>
        <Col span={12}>
          <Typography>
            <Title level={3}>What is the Spot Fleet Management Tool</Title>
            <Paragraph>
            The Spot Fleet Management Tool (SFMT) is a user-friendly solution that simplifies Spot Fleet (JSON) configuration setup.
            </Paragraph>
            <Paragraph>
            SFMT is an easy-to-use platform that enables Deadline render farm admins who lack access to specialized deployment frameworks such as the Thinkbox Deadline RFDK (Render Farm Deployment Kit).
            </Paragraph>
            <Title level={3}>Spot Fleet Example Configuration</Title>
            <Paragraph>If you want to have a quick look at what the tool can do, here is an example spot fleet configuration you can inject to the tool :</Paragraph>
            <Button type="link" onClick={handleButtonClick}><strong>Click me to upload the Spot Fleet example configuration</strong></Button>
            <Paragraph>
              The setup is divided into four subnets, each corresponding to a different Availability Zone. For 3DS Max, the c5.4xlarge and m5.4xlarge instances have been chosen, while Blender will be provisioned with m5.8xlarge and c5.2xlarge instances. It has been identified that 20 workers are needed for 3DS Max and 15 for Blender to efficiently handle the workload.
            </Paragraph>
            <Space direction='horizontal' size={3}>
              <Paragraph style={{ margin: 0 }}>You can also access here our blog post describing this example</Paragraph>
              <Typography.Link
                href="https://trackit.io/spot-fleet-management-tool-simplified-render-farm-setup/"
                target="_blank"
                style={{ textAlign: 'right' }}
              >
                <strong>here!</strong>
              </Typography.Link>
            </Space>

            <Title level={3}>How to Use the Tool</Title>
            <List
              itemLayout='horizontal'
              dataSource={data}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta title={item.title} description={item.description} />
                </List.Item>
              )}
            />
            <Title id='resources-section' level={3}>Resources</Title>
            <Typography.Link
            href="https://trackit.io/spot-fleet-management-tool-simplified-render-farm-setup/"
            target="_blank"
            style={{ textAlign: 'right' }}
            >
              How to Configure Spot Fleets Using the Spot Fleet Management Tool
              </Typography.Link>
          </Typography>
        </Col>
      </Row>
      </div>
    </Modal>
  );
};

export default LandingPage;
