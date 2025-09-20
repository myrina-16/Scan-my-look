import React from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ScanPage from './pages/ScanPage';
import ResultsPage from './pages/ResultsPage';
import LibraryPage from './pages/LibraryPage';
import GuidePage from './pages/GuidePage';
import LookDetailPage from './pages/LookDetailPage';
import { AppProvider } from './context/AppContext';
import { Icon } from './components/Icon';
import ShoppingResultsModal from './components/ShoppingResultsModal';
import MixAndMatchPage from './pages/OutfitMixerPage';
import AddWardrobeItemPage from './pages/AddWardrobeItemPage';
import PlanPage from './pages/PlanPage';
import PlanOutfitPage from './pages/PlanOutfitPage';
import StyleStudioPage from './pages/StyleStudioPage';
import TripDetailPage from './pages/TripDetailPage';
import EditWardrobeItemModal from './components/EditWardrobeItemModal';
import StyleQuizPage from './pages/StyleQuizPage';
import StyleProfilePage from './pages/StyleProfilePage';
import WardrobeReportPage from './pages/WardrobeReportPage';
import VirtualTryOnPage from './pages/VirtualTryOnPage';
import ColorAnalysisPage from './pages/ColorAnalysisPage';
import ColorProfilePage from './pages/ColorProfilePage';
import StylistChatPage from './pages/StylistChatPage';
import GeneratorPage from './pages/GeneratorPage';
import PalettePage from './pages/PalettePage';
import TrendSpotterPage from './pages/TrendSpotterPage';

const Nav: React.FC = () => {
    const navItems = [
        { path: '/', label: 'Home', icon: 'sparkles' as const },
        { path: '/library', label: 'Closet', icon: 'hanger' as const },
        { path: '/studio', label: 'Studio', icon: 'brush' as const },
        { path: '/chat', label: 'Stylist', icon: 'chat-bubble' as const },
        { path: '/plan', label: 'Plan', icon: 'calendar' as const },
    ];
    
    const navLinkClasses = "flex flex-col items-center justify-center w-full h-full transition-colors duration-200";
    const activeLinkClasses = "text-brand-accent";
    const inactiveLinkClasses = "text-slate-500 hover:text-brand-secondary";

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-50">
            <div className="flex justify-around h-full max-w-lg mx-auto">
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'} // Ensure exact match for home
                        className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                    >
                        <Icon icon={item.icon} className="w-7 h-7 mb-1" />
                        <span className="text-xs font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};


function App() {
  return (
    <AppProvider>
      <HashRouter>
        <div className="pb-20"> {/* Padding bottom to prevent content from being hidden by the nav bar */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/chat" element={<StylistChatPage />} />
            <Route path="/studio" element={<StyleStudioPage />} />
            <Route path="/studio/generator" element={<GeneratorPage />} />
            <Route path="/studio/palette" element={<PalettePage />} />
            <Route path="/studio/trends" element={<TrendSpotterPage />} />
            <Route path="/try-on" element={<VirtualTryOnPage />} />
            <Route path="/mixer" element={<MixAndMatchPage />} />
            <Route path="/add-item" element={<AddWardrobeItemPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/library/:lookId" element={<LookDetailPage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/plan" element={<PlanPage />} />
            <Route path="/plan/:eventId" element={<PlanOutfitPage />} />
            <Route path="/plan/trip/:tripId" element={<TripDetailPage />} />
            <Route path="/quiz" element={<StyleQuizPage />} />
            <Route path="/profile" element={<StyleProfilePage />} />
            <Route path="/report" element={<WardrobeReportPage />} />
            <Route path="/color-analysis" element={<ColorAnalysisPage />} />
            <Route path="/color-profile" element={<ColorProfilePage />} />
          </Routes>
        </div>
        <Nav />
        <ShoppingResultsModal />
        <EditWardrobeItemModal />
      </HashRouter>
    </AppProvider>
  );
}

export default App;