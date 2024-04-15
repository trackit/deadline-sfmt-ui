import React, { useState } from 'react';
import { Tour, type TourProps } from 'antd';
import { QuestionCircleTwoTone } from '@ant-design/icons';
import LandingPage from './LandingPage';

interface IntroductionTourProps {
    refs: React.MutableRefObject<null>[]
}

const IntroductionTour: React.FC<IntroductionTourProps> = ({ refs }) => {
    const [openTour, setOpenTour] = useState<boolean>(false);
    const [openLandingPage, setOpenLandingPage] = useState(() => {
        const storedShowModal = localStorage.getItem('doesShowModal');
        return storedShowModal !== 'false' ? true : false;
    });

    const steps: TourProps['steps'] = [
        {
            title: 'Upload File',
            description: 'You can upload a json configuration file',
            target: () => refs[0].current,
        },
        {
            title: 'Edit File',
            description: 'Edit the configuration file using our code editor',
            target: () => refs[1].current,
        },
        {
            title: 'Add Fleet',
            description: 'Or simply add a fleet via our graphical interface',
            target: () => refs[2].current,
        }, {
            title: 'Export File',
            description: 'And export your configuration file',
            target: () => refs[3].current,
        },
    ];

    const handleModalCancel = (isChecked: boolean) => {
        localStorage.setItem('doesShowModal', (!isChecked).toString());
        setOpenLandingPage(false);
        setOpenTour(true);
    };

    const informationRequested = () => {
        const storedShowModal = localStorage.getItem('doesShowModal');
        if (storedShowModal === 'true') {
            setOpenLandingPage(true);
            return;
        }
        setOpenTour(true);
    };

    return (
        <>
            <QuestionCircleTwoTone onClick={informationRequested} style={{ fontSize: '24px', marginRight: '8px' }} />
            <LandingPage showModal={openLandingPage} handleModalCancel={handleModalCancel} />
            <Tour open={openTour} onClose={() => setOpenTour(false)} steps={steps} />
        </>
    );
};

export default IntroductionTour;
