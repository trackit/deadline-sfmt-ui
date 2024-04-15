import React, { useState } from 'react';
import { Modal, Typography, List, Row, Col, Checkbox } from 'antd';
import logo from '../assets/logo.avif';
import { CheckboxChangeEvent } from 'antd/es/checkbox';

const { Title, Paragraph } = Typography;

interface LandingPageProps {
  showModal?: boolean;
  handleModalCancel: (hideModal: boolean) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ showModal, handleModalCancel }) => {
  const [checked, setChecked] = useState(false);
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

  
  return (
    <Modal
      centered
      open={showModal}
      onCancel={handleModalClose}
      width={1400}
      footer={[
        <Checkbox key="doNotShowAgainCheckbox" onChange={onChange}>
          Do not show again
        </Checkbox>,
      ]}
    >
      <Row>
        <Col span={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <a href="https://trackit.io/" target="_blank" rel="noreferrer">
            <img 
            data-fetchpriority='high'
            className='logo-modal'
            src={logo}
             alt="Logo" />
          </a>
        </Col>
        <Col span={12}>
          <Typography>
            <Title level={3}>What is the SFMT</Title>
            <Paragraph>
            The Spot Fleet Management Tool (SFMT) is a user-friendly solution that simplifies Spot Fleet (JSON) configuration setup.
            </Paragraph>
            <Paragraph>
            SFMT is an easy-to-use platform that enables Deadline render farm admins who lack access to specialized deployment frameworks such as the Thinkbox Deadline RFDK (Render Farm Deployment Kit).
            </Paragraph>

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
            <Title level={3}>Resources</Title>
            <Typography.Link
            href="https://trackit.io/how-to-configure-spot-fleets-using-the-sfmt/"
            target="_blank"
            style={{ textAlign: 'right' }}
            >
              How to Configure Spot Fleets Using the Spot Fleet Management Tool
              </Typography.Link>
          </Typography>
        </Col>
      </Row>
    </Modal>
  );
};

export default LandingPage;
