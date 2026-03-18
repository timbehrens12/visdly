import { ThemeProvider } from './contexts/ThemeContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GamePage from './pages/GamePage';
import { Layout } from './components/Layout';
import { SidebarProvider } from './contexts/SidebarContext';
import { DecksProvider } from './contexts/DecksContext';
import { StudyProgressProvider } from './contexts/StudyProgressContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { DebugProvider } from './contexts/DebugContext';

import EditDeckPage from './pages/EditDeckPage';
import MyDecksPage from './pages/MyDecksPage';
import TranscriptPage from './pages/TranscriptPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import SummarizersPage from './pages/SummarizersPage';
import CanvasPage from './pages/CanvasPage';
import NotificationsPage from './pages/NotificationsPage';
import GeneratePage from './pages/GeneratePage';


import { ClerkAuthProvider } from './lib/clerk';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <ClerkAuthProvider>
      <ThemeProvider defaultTheme="system">
        <SettingsProvider>
          <StudyProgressProvider>
            <DebugProvider>
              <DecksProvider>
                <SidebarProvider>
                  <Router>
                    <ProtectedRoute>
                      <Layout>
                        <Routes>
                          <Route path="/" element={<DashboardPage />} />
                          <Route path="/flashcards" element={<GamePage initialModeName="Flashcards" />} />
                          <Route path="/learn" element={<GamePage initialModeName="Learn" />} />
                          <Route path="/quiz" element={<GamePage initialModeName="Rapid Fire" />} />
                          <Route path="/match" element={<GamePage initialModeName="Matching" />} />
                          <Route path="/written" element={<GamePage initialModeName="Written" />} />
                          <Route path="/speaking" element={<GamePage initialModeName="Speaking Drill" />} />
                          <Route path="/test" element={<GamePage initialModeName="Practice Test" />} />
                          <Route path="/canvas" element={<CanvasPage />} />
                          <Route path="/transcripts" element={<TranscriptPage />} />
                          <Route path="/decks" element={<MyDecksPage />} />
                          <Route path="/edit-deck" element={<EditDeckPage />} />
                          <Route path="/edit-deck/:deckId" element={<EditDeckPage />} />
                          <Route path="/chat" element={<ChatPage />} />
                          <Route path="/summarizers" element={<SummarizersPage />} />
                          <Route path="/notifications" element={<NotificationsPage />} />
                          <Route path="/generate" element={<GeneratePage />} />
                        </Routes>
                      </Layout>
                    </ProtectedRoute>
                  </Router>
                </SidebarProvider>
              </DecksProvider>
            </DebugProvider>
          </StudyProgressProvider>
        </SettingsProvider>
      </ThemeProvider>
    </ClerkAuthProvider>
  );
}

export default App;
