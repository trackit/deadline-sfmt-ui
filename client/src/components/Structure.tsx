import React, { useState, useRef, useEffect } from 'react';
import { Typography, Row, Col, Button, Space, notification } from 'antd';
import IntroductionTour from './IntroductionTour';
import JsonPreviewCard from './JsonPreviewCard';
import logo from '../assets/trackit_logo.png';
import FleetsForm from './FleetsForm';
import ChangeLogModal from './ChangeLogModal';

const { Title } = Typography;

interface StructureProps {
    data: Record<string, any>;
}

const Structure: React.FC<StructureProps> = ({ data }) => {
    const [isValidData, setIsValidData] = useState(false);
    const [jsonData, setData] = useState(data);
    const editRef = useRef(null);
    const exportButtonRef = useRef(null);
    const addRef = useRef(null);
    const uploadRef = useRef(null);
    const refs = [uploadRef, editRef, addRef, exportButtonRef];
    const [isChangeLogVisible, setChangeLogVisible] = useState(false);

    const updateData = (updatedData: Record<string, any>) => {
        setData(updatedData);
    };

    const handleFileSelection = (file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (!event.target?.result)
                return;
            try {
                const uploadedData = JSON.parse(event.target.result as string);
                const isValid = validateUploadedData(uploadedData);

                if (!isValid)
                    notification.open({
                        message: 'Validation Error',
                        description: 'Uploaded data does not match the required format.',
                    });
                setData(uploadedData);
            } catch (error) {
                notification.open({
                    message: 'Invalid JSON format',
                    description: 'Please make sure the JSON is correctly formatted.',
                });
            }
        };
        reader.readAsText(file);
    };

    const validateUploadedData = (data: any): boolean => {
        if (typeof data !== 'object' || Array.isArray(data))
            return false;
        for (const fleetKey in data) {
            const fleet = data[fleetKey];
            if (typeof fleet !== 'object')
                return false;
        }
        return true;
    };

    const uploadJson = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file)
                handleFileSelection(file);
        };
        input.click();
    };

    const downloadJson = () => {
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fleets_config.json';
        a.click();
        URL.revokeObjectURL(url);
    };
    


    const updates = [
        { date: '2024-05-06', description: 'Added Weighted Capacity.' },
        { date: '2024-05-07', description: 'Added Key-Value Tag Mandatory, Update Instance Type List.' },
        { date: '2024-05-20', description: 'Added a Sample Spotfleet Config File.' },
    ];
    const toggleChangeLogModal = () => {
        setChangeLogVisible(!isChangeLogVisible);
    };
    useEffect(() => {
        setData(data);
    }, [data]);
    useEffect(() => {
        setIsValidData(validateUploadedData(jsonData));
    }, [jsonData]);

    return (
        <div style={{ padding: '16px', height: '96vh' }}>
            <Row style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px' }}>
                <Space>
                    <a href="https://trackit.io/" target="_blank" rel="noreferrer">
                        <img
                            className="logo"
                            src={logo}
                            alt='logo' />
                    </a>
                    <Title level={3} style={{ margin: 0 }}>Deadline Spotfleet Management Tool</Title>
                </Space>
                <Space>
                    <IntroductionTour refs={refs} />
                    <Button type="default" onClick={uploadJson} ref={uploadRef}>Upload</Button>
                    <Button type="primary" onClick={downloadJson} ref={exportButtonRef}>Download</Button>
                </Space>
            </Row>
            <Row gutter={16}>
                <Col lg={10} sm={24} style={{ height: '92vh', justifyContent: 'space-between' }}>
                    {isValidData ? (
                        <FleetsForm formData={jsonData} onDataUpdate={updateData} addRef={addRef} />
                    ) : null}
                </Col>
                <Col lg={14} sm={24}>
                    <JsonPreviewCard data={jsonData} onDataUpdate={updateData} editButtonRef={editRef} />
                    <div style={{ width: '100%', textAlign: 'right' }}>
                        <Space>
                            <Typography.Link onClick={toggleChangeLogModal}>Change Logs</Typography.Link>
                            <Typography.Link type="secondary" href="https://github.com/trackit/deadline-sfmt-ui/issues" target="_blank">Report issues</Typography.Link>
                            <Typography.Link href="https://trackit.io/" target="_blank">Copyright by Trackit</Typography.Link>
                        </Space>
                    </div>
                </Col>
            </Row>
            <ChangeLogModal updates={updates} visible={isChangeLogVisible} onClose={toggleChangeLogModal} />
        </div>
    );
};

export default Structure;