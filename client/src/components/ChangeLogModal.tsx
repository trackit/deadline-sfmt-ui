import React from 'react';
import { Typography, Modal } from 'antd';

interface Update {
    date: string;
    description: string;
}

interface ChangeLogModalProps {
    updates: Update[];
    visible: boolean;
    onClose: () => void;
}

const ChangeLogModal: React.FC<ChangeLogModalProps> = ({ updates, visible, onClose }) => {
    return (
        <Modal
            title="Change Logs"
            visible={visible}
            onCancel={onClose}
            footer={null}
        >
            <ul>
                {updates.map((update, index) => (
                    <li key={index}>
                        <strong>{update.date}</strong>: {update.description}
                    </li>
                ))}
            </ul>
        </Modal>
    );
};

export default ChangeLogModal;
