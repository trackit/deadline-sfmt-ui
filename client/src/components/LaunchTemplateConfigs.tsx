import React, { useEffect, useState } from 'react';
import { LaunchTemplateConfig, LaunchTemplateSpecification } from '../interface';
import { Input, Typography } from 'antd';
import Overrides from './Overrides';

interface Props {
  submit: boolean;
  prioritise: boolean;
  launchTemplateConfig: LaunchTemplateConfig;
  handleChanges: (values: LaunchTemplateConfig) => void;
  currentSubnets: string[];
}

const LaunchTemplateConfigs: React.FC<Props> = ({ submit, prioritise, launchTemplateConfig, handleChanges, currentSubnets }) => {
  const [launchTemplateSpecification, setLaunchTemplateSpecification] = useState<LaunchTemplateSpecification>(launchTemplateConfig.LaunchTemplateSpecification);
  const [overrides, setOverrides] = useState<any>(launchTemplateConfig.Overrides);
  const [idErrorMessageLaunchTemplateId, setIdErrorMessageLaunchTemplateId] = useState<string>('');
  const [idErrorMessageVersion, setIdErrorMessageVersion] = useState<string>('');
  const overridesTitle = (prioritise) ? 'Overrides (Instance Type / Subnet ID / Priority / WeightedCapacity)' : 'Overrides (Instance Type / Subnet ID / WeightedCapacity)';

  useEffect(() => {
    if (submit && launchTemplateSpecification.LaunchTemplateId === '')
      setIdErrorMessageLaunchTemplateId('Please provide a Launch Template ID.');
  }, [launchTemplateConfig]);

  const handleLaunchTemplateIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.trim();
    const pattern = /^lt-[a-zA-Z0-9]{17}$/;

    if (inputValue === '')
      setIdErrorMessageLaunchTemplateId('Please provide a Launch Template ID.');
    else if (!pattern.test(inputValue) && inputValue !== '')
      setIdErrorMessageLaunchTemplateId('Please provide a Launch Template ID in the following format: lt-xxxxxxxxxxxxxxxxx.');
    else
      setIdErrorMessageLaunchTemplateId('');

    const newLaunchTemplateSpecification = { ...launchTemplateSpecification, LaunchTemplateId: inputValue };
    setLaunchTemplateSpecification(newLaunchTemplateSpecification);
    handleChanges({ ...launchTemplateConfig, LaunchTemplateSpecification: newLaunchTemplateSpecification, Overrides: overrides });
  };

  const handleVersionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.trim();

    if (inputValue === '')
      setIdErrorMessageVersion('Please provide a Version.');
    else
      setIdErrorMessageVersion('');

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
      <Typography.Title level={5}>{overridesTitle}</Typography.Title>
      <Overrides submit={submit} prioritize={prioritise} overrides={launchTemplateConfig.Overrides} onChange={handleOverridesChange} currentSubnets={currentSubnets} />
    </>
  );
};

export default LaunchTemplateConfigs;
