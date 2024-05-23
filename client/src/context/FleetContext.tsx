import React, { createContext, useState, useContext, ReactNode } from 'react';

interface FleetContextType {
  fleetData: any;
  setFleetData: (data: any) => void;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export const useFleetContext = () => {
  const context = useContext(FleetContext);
  if (context === undefined) {
    throw new Error('useFleetContext must be used within a FleetProvider');
  }
  return context;
};

export const FleetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fleetData, setFleetData] = useState<any>({});

  return (
    <FleetContext.Provider value={{ fleetData, setFleetData }}>
      {children}
    </FleetContext.Provider>
  );
};
