import React from 'react';
import { BrowserView, MobileView } from 'react-device-detect';
import Structure from './components/Structure';
import fleetData from './data/config';
import { Typography } from 'antd';
import './App.css';
import { useFleetContext } from './context/FleetContext';

function App() {
  const { fleetData } = useFleetContext();
  return (
    <div style={{ height: '100vh' }}>
      <BrowserView style={{ height: '100vh' }}>
        <Structure data={fleetData} />
      </BrowserView>
      <MobileView>
        <div style={{ padding: '16px', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <Typography.Title level={3}>The tool is not available on mobile devices</Typography.Title>
        </div>
      </MobileView>
    </div>
  );
}
export default App;
