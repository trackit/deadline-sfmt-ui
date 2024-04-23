import React, { useEffect, useState } from 'react';
import { LaunchTemplateConfig, LaunchTemplateSpecification } from '../interface';
import { Input, Typography } from 'antd';
import Overrides from './Overrides';

interface Props {
  prioritise: boolean;
  launchTemplateConfig: LaunchTemplateConfig;
  handleChanges: (values: LaunchTemplateConfig) => void;
  currentSubnets: string[];
}

const LaunchTemplateConfigs: React.FC<Props> = ({ prioritise, launchTemplateConfig, handleChanges, currentSubnets }) => {
  const [launchTemplateSpecification, setLaunchTemplateSpecification] = useState<LaunchTemplateSpecification>(launchTemplateConfig.LaunchTemplateSpecification);
  const [overrides, setOverrides] = useState<any>(launchTemplateConfig.Overrides);
  const [idErrorMessageLaunchTemplateId, setIdErrorMessageLaunchTemplateId] = useState<string>('');
  const [idErrorMessageVersion, setIdErrorMessageVersion] = useState<string>('');

  const handleLaunchTemplateIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.trim(); // Remove leading and trailing spaces
    const pattern = /^lt-[a-zA-Z0-9]{17}$/;
  
    if (inputValue === '') {
      setIdErrorMessageLaunchTemplateId('Please provide a Launch Template ID.'); // Set error message for empty input
    } else if (!pattern.test(inputValue)) {
      setIdErrorMessageLaunchTemplateId('Please provide a Launch Template ID in the following format: lt-xxxxxxxxxxxxxxxxx.'); // Set error message for invalid format
    } else {
      setIdErrorMessageLaunchTemplateId(''); // Reset error message
    }
  
    const newLaunchTemplateSpecification = { ...launchTemplateSpecification, LaunchTemplateId: inputValue };
    setLaunchTemplateSpecification(newLaunchTemplateSpecification);
    handleChanges({ ...launchTemplateConfig, LaunchTemplateSpecification: newLaunchTemplateSpecification, Overrides: overrides });
  };
  
  
  

  const handleVersionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.trim();
    if (inputValue === '') {
      setIdErrorMessageVersion('Please provide a Version.'); // Set error message for empty input
    } else {
      setIdErrorMessageVersion(''); // Reset error message
    }
    const newLaunchTemplateSpecification = { ...launchTemplateSpecification, Version: e.target.value };
    setLaunchTemplateSpecification(newLaunchTemplateSpecification);
    handleChanges({ ...launchTemplateConfig, LaunchTemplateSpecification: newLaunchTemplateSpecification, Overrides: overrides });
  };

  const handleOverridesChange = (overrides: any) => {
    const newLaunchTemplateConfig: LaunchTemplateConfig = { ...launchTemplateConfig, LaunchTemplateSpecification: launchTemplateSpecification, Overrides: overrides };
    setOverrides(overrides);
    handleChanges(newLaunchTemplateConfig);
  };
  const validateInitialLaunchTemplateId = (value: string) => {
    const inputValue = value.trim(); // Remove leading and trailing spaces
    const pattern = /^lt-[a-zA-Z0-9]{17}$/;
  
    if (inputValue === '') {
      setIdErrorMessageLaunchTemplateId('Please provide a Launch Template ID.'); // Set error message for empty input
    } else if (!pattern.test(inputValue)) {
      setIdErrorMessageLaunchTemplateId('Please provide a Launch Template ID in the following format: lt-xxxxxxxxxxxxxxxxx.'); // Set error message for invalid format
    } else {
      setIdErrorMessageLaunchTemplateId(''); // Reset error message
    }
  };

  // Trigger initial validation when component mounts
  useEffect(() => {
    validateInitialLaunchTemplateId(launchTemplateSpecification.LaunchTemplateId);
  }, [launchTemplateSpecification.LaunchTemplateId]);
  return (
    <>
      <Typography.Title level={4}>Launch Template Specification</Typography.Title>
      <Typography.Title level={5}>Launch Template Id</Typography.Title>
      <Input 
        variant='filled' 
        value={launchTemplateSpecification.LaunchTemplateId} 
        onChange={handleLaunchTemplateIdChange} 
        placeholder='Enter a Launch Template Id' 
        style={{ borderColor: idErrorMessageLaunchTemplateId ? 'red' : undefined }}
      />
      {idErrorMessageLaunchTemplateId && <Typography.Text type="danger">{idErrorMessageLaunchTemplateId}</Typography.Text>}
      <Typography.Title level={5}>Version</Typography.Title>
      <Input 
        variant='filled' 
        value={launchTemplateSpecification.Version} 
        onChange={handleVersionChange} 
        placeholder='Enter a Version'
        style={{ borderColor: idErrorMessageVersion ? 'red' : undefined }} />
      {idErrorMessageVersion && <Typography.Text type="danger">{idErrorMessageVersion}</Typography.Text>}
      <Typography.Title level={5}>Overrides (Instance Types / Subnets)</Typography.Title>
      <Overrides prioritize={prioritise} overrides={launchTemplateConfig.Overrides} onChange={handleOverridesChange} currentSubnets={currentSubnets} />
    </>
  );
};

export default LaunchTemplateConfigs;
