import { Routes, Route } from 'react-router-dom';
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

import { PaywallProvider } from './contexts/PaywallContext';
import { ChatProvider } from './contexts/ChatContext';
import { TranscriptsProvider } from './contexts/TranscriptsContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import './dashboard.css';

export function DashboardApp() {
  return (
    <div className="dashboard-root">
        <ChatProvider>
          <TranscriptsProvider>
              <PaywallProvider>
                <SettingsProvider>
                  <StudyProgressProvider>
                    <DebugProvider>
                      <DecksProvider>
                        <SidebarProvider>
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
                                <Route path="/generate/:method" element={<GeneratePage />} />
                              </Routes>
                            </Layout>
                          </ProtectedRoute>
                        </SidebarProvider>
                      </DecksProvider>
                    </DebugProvider>
                  </StudyProgressProvider>
                </SettingsProvider>
              </PaywallProvider>
          </TranscriptsProvider>
        </ChatProvider>
    </div>
  );
}

export default DashboardApp;
