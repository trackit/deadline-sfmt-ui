import React, { useState } from 'react';
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

  const handleLaunchTemplateIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLaunchTemplateSpecification = { ...launchTemplateSpecification, LaunchTemplateId: e.target.value };
    setLaunchTemplateSpecification(newLaunchTemplateSpecification);
    handleChanges({ ...launchTemplateConfig, LaunchTemplateSpecification: newLaunchTemplateSpecification, Overrides: overrides });
  };

  const handleVersionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLaunchTemplateSpecification = { ...launchTemplateSpecification, Version: e.target.value };
    setLaunchTemplateSpecification(newLaunchTemplateSpecification);
    handleChanges({ ...launchTemplateConfig, LaunchTemplateSpecification: newLaunchTemplateSpecification, Overrides: overrides });
  };

  const handleOverridesChange = (overrides: any) => {
    const newLaunchTemplateConfig: LaunchTemplateConfig = { ...launchTemplateConfig, LaunchTemplateSpecification: launchTemplateSpecification, Overrides: overrides };
    setOverrides(overrides);
    handleChanges(newLaunchTemplateConfig);
  };

  return (
    <>
      <Typography.Title level={4}>Launch Template Specification</Typography.Title>
      <Typography.Title level={5}>Launch Template Id</Typography.Title>
      <Input variant='filled' value={launchTemplateSpecification.LaunchTemplateId} onChange={handleLaunchTemplateIdChange} placeholder='Enter a Launch Template Id' />
      <Typography.Title level={5}>Version</Typography.Title>
      <Input variant='filled' value={launchTemplateSpecification.Version} onChange={handleVersionChange} placeholder='Enter a Version' />
      <Typography.Title level={5}>Overrides</Typography.Title>
      <Overrides prioritize={prioritise} overrides={launchTemplateConfig.Overrides} onChange={handleOverridesChange} currentSubnets={currentSubnets} />
    </>
  );
};

export default LaunchTemplateConfigs;
