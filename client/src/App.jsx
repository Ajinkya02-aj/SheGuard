import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EmergencyProvider, useEmergency } from './context/EmergencyContext';
import Navbar from './components/common/Navbar';
import BottomNav from './components/common/BottomNav';
import Sidebar from './components/common/Sidebar';
import CountdownOverlay from './components/sos/CountdownOverlay';
import FakeCallModal from './components/fakecall/FakeCallModal';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import SafetyMapPage from './pages/SafetyMapPage';
import LiveTracking from './pages/LiveTracking';
import SafetyTimer from './pages/SafetyTimer';
import EmergencyServices from './pages/EmergencyServices';
import FakeCallPage from './pages/FakeCallPage';
import SafetyResources from './pages/SafetyResources';
import ProfileSettings from './pages/ProfileSettings';
import PublicTrack from './pages/PublicTrack';

function MainLayout() {
  const { isAuthenticated, loading } = useAuth();
  const { fakeCallConfig, dismissFakeCall } = useEmergency();
  const [currentTab, setCurrentTab] = useState('landing');

  // Check URL pathname for public tracking links: /track/:token
  const pathname = window.location.pathname;
  if (pathname.startsWith('/track/')) {
    const token = pathname.replace('/track/', '').split('/')[0];
    return <PublicTrack token={token} />;
  }

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        if (currentTab === 'landing' || currentTab === 'login' || currentTab === 'register') {
          setCurrentTab('dashboard');
        }
      } else {
        if (currentTab !== 'login' && currentTab !== 'register') {
          setCurrentTab('landing');
        }
      }
    }
  }, [isAuthenticated, loading]);

  const handleNavigate = (tab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center text-coral-400 font-bold text-sm">
        Initializing SHEGUARD Safety Suite...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar onNavigate={handleNavigate} currentTab={currentTab} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar (only when authenticated) */}
        {isAuthenticated && currentTab !== 'landing' && (
          <Sidebar currentTab={currentTab} onNavigate={handleNavigate} />
        )}

        {/* Main Page Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentTab === 'landing' && <Landing onNavigate={handleNavigate} />}
          {currentTab === 'login' && <Login onNavigate={handleNavigate} />}
          {currentTab === 'register' && <Register onNavigate={handleNavigate} />}
          {currentTab === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
          {currentTab === 'sos-active' && <Dashboard onNavigate={handleNavigate} />}
          {currentTab === 'contacts' && <Contacts onNavigate={handleNavigate} />}
          {currentTab === 'map' && <SafetyMapPage onNavigate={handleNavigate} />}
          {currentTab === 'tracking' && <LiveTracking onNavigate={handleNavigate} />}
          {currentTab === 'timer' && <SafetyTimer onNavigate={handleNavigate} />}
          {currentTab === 'fakecall' && <FakeCallPage onNavigate={handleNavigate} />}
          {currentTab === 'emergency-services' && <EmergencyServices onNavigate={handleNavigate} />}
          {currentTab === 'resources' && <SafetyResources onNavigate={handleNavigate} />}
          {currentTab === 'profile' && <ProfileSettings onNavigate={handleNavigate} />}
        </main>
      </div>

      {/* Mobile Bottom Navigation (only when authenticated) */}
      {isAuthenticated && currentTab !== 'landing' && (
        <BottomNav currentTab={currentTab} onNavigate={handleNavigate} />
      )}

      {/* Global Overlays */}
      <CountdownOverlay />
      {fakeCallConfig && (
        <FakeCallModal
          callerName={fakeCallConfig.callerName}
          onClose={dismissFakeCall}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <EmergencyProvider>
        <MainLayout />
      </EmergencyProvider>
    </AuthProvider>
  );
}
