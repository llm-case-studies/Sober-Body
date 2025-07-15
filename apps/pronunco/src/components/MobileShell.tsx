
import React from 'react';
import TabBar from './TabBar';

const MobileShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 overflow-auto pb-16">
        {children}
      </div>
      <TabBar />
    </div>
  );
};

export default MobileShell;
