
import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import ScrollToTop from './components/ScrollToTop';
import TitleScreen from './components/TitleScreen';
import InteractiveDrawingCanvas from './components/InteractiveDrawingCanvas';
import { HistoryProvider } from './context/HistoryContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';

// Inner App to access Settings Context for MotionConfig
const InnerApp = () => {
    const { settings } = useSettings();
    
    return (
        <MotionConfig transition={{ duration: settings.accessibility.reducedMotion ? 0 : 0.5 * (1/settings.visual.animationSpeed) }}>
            <Router>
                <ScrollToTop />
                <AnimatePresence mode="wait">
                    <Routes>
                        <Route path="/" element={<TitleScreen />} />
                        <Route path="/draw" element={<InteractiveDrawingCanvas />} />
                    </Routes>
                </AnimatePresence>
            </Router>
        </MotionConfig>
    );
}

function App() {
    return (
        <SettingsProvider>
            <HistoryProvider>
                <InnerApp />
            </HistoryProvider>
        </SettingsProvider>
    );
}

export default App;
