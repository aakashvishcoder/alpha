import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import GraphingCalculator from './components/GraphingCalculator';

function App() {
  const [currentView, setCurrentView] = useState('home');

  const renderView = () => {
    switch (currentView) {
      case 'graph':
        return <GraphingCalculator />;
      default:
        return <HomePage />;
    }
  };

  return (
    <ThemeProvider>
      <Layout onNavigate={setCurrentView}>
        {renderView()}
      </Layout>
    </ThemeProvider>
  );
};

export default App;