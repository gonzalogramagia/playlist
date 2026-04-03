import Home from './pages/Home'
import Footer from './components/footer'
import { FloatingLinks } from './components/floating-links'

import { Routes, Route } from 'react-router-dom'
import ExportPage from './pages/Export'
import ImportPage from './pages/Import'

function HomeWithLayout() {
    return (
        <main className="flex-auto min-w-0 mt-6 flex flex-col px-8 lg:px-0">
            <Home />
            <Footer />
            <FloatingLinks />
        </main>
    )
}

function AppContent() {
    return (
        <div className="max-w-4xl mx-4 mt-8 lg:mx-auto">
            <div
                className="fixed inset-0 z-[-1] bg-cover bg-center bg-fixed bg-no-repeat opacity-5"
                style={{ backgroundImage: `url('${import.meta.env.BASE_URL}wallpaper.png')` }}
            />
            <Routes>
                <Route path="/" element={<HomeWithLayout />} />
                <Route path="/export" element={<ExportPage />} />
                <Route path="/import" element={<ImportPage />} />
                <Route path="/exportar" element={<ExportPage />} />
                <Route path="/importar" element={<ImportPage />} />
                <Route path="/en" element={<HomeWithLayout />} />
            </Routes>
        </div>
    );
}

import { VideoProvider } from './contexts/video-context'
import { LanguageProvider } from './contexts/language-context'
import { ToastProvider } from './contexts/toast-context'

function App() {
    return (
        <LanguageProvider>
            <VideoProvider>
                <ToastProvider>
                    <AppContent />
                </ToastProvider>
            </VideoProvider>
        </LanguageProvider>
    )
}

export default App
