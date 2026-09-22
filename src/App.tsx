import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { ThemeProvider, useTheme } from './context/ThemeContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { Home } from './pages/Home.tsx';
import { CharitiesDirectory } from './pages/CharitiesDirectory.tsx';
import { UserDashboard } from './pages/UserDashboard.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import { AuthPage } from './pages/AuthPage.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { SubscribeModal } from './components/SubscribeModal.tsx';
import { DonateModal } from './components/DonateModal.tsx';
import { Charity } from './types.ts';

function MainLayout() {
  const { theme } = useTheme();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [subscribeModalOpen, setSubscribeModalOpen] = useState<boolean>(false);
  const [selectedCharityForDonate, setSelectedCharityForDonate] = useState<Charity | null>(null);

  const handleOpenDonate = (charity: Charity) => {
    setSelectedCharityForDonate(charity);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 selection:bg-amber-500 selection:text-black ${
      theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-[#070A0F] text-slate-100'
    }`}>
      
      {/* Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openAuthModal={() => setAuthModalOpen(true)}
        openSubscribeModal={() => setSubscribeModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {currentTab === 'home' && (
          <Home
            setCurrentTab={setCurrentTab}
            openSubscribeModal={() => setSubscribeModalOpen(true)}
            openDonateModal={handleOpenDonate}
            openAuthModal={() => setAuthModalOpen(true)}
          />
        )}

        {currentTab === 'charities' && (
          <CharitiesDirectory
            openDonateModal={handleOpenDonate}
            openAuthModal={() => setAuthModalOpen(true)}
            openSubscribeModal={() => setSubscribeModalOpen(true)}
          />
        )}

        {currentTab === 'dashboard' && (
          <ProtectedRoute
            allowedRoles={['subscriber', 'admin']}
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenSubscribe={() => setSubscribeModalOpen(true)}
          >
            <UserDashboard
              openSubscribeModal={() => setSubscribeModalOpen(true)}
              setCurrentTab={setCurrentTab}
            />
          </ProtectedRoute>
        )}

        {currentTab === 'admin' && (
          <ProtectedRoute
            allowedRoles={['admin']}
            onOpenAuth={() => setAuthModalOpen(true)}
          >
            <AdminDashboard />
          </ProtectedRoute>
        )}

        {(currentTab === 'login' || currentTab === 'auth') && (
          <AuthPage
            initialMode="login"
            setCurrentTab={setCurrentTab}
            openDonateModal={handleOpenDonate}
          />
        )}

        {currentTab === 'register' && (
          <AuthPage
            initialMode="register"
            setCurrentTab={setCurrentTab}
            openDonateModal={handleOpenDonate}
          />
        )}
      </main>

      {/* Footer */}
      <Footer setCurrentTab={setCurrentTab} />

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <SubscribeModal
        isOpen={subscribeModalOpen}
        onClose={() => setSubscribeModalOpen(false)}
      />

      <DonateModal
        isOpen={!!selectedCharityForDonate}
        onClose={() => setSelectedCharityForDonate(null)}
        charity={selectedCharityForDonate}
        onDonationSuccess={() => {}}
      />

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}
