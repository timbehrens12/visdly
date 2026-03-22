// Dashboard Entry Point
// This wraps all dashboard providers and routes under /dashboard/*

import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SidebarProvider } from '../contexts/SidebarContext';
import { DecksProvider } from '../contexts/DecksContext';
import { StudyProgressProvider } from '../contexts/StudyProgressContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { Layout } from '../components/Layout';

// Pages
import DashboardPage from '../pages/DashboardPage';
import MyDecksPage from '../pages/MyDecksPage';
import GamePage from '../pages/GamePage';
import EditDeckPage from '../pages/EditDeckPage';
import TranscriptPage from '../pages/TranscriptPage';
import SettingsPage from '../pages/SettingsPage';

export function DashboardApp() {
    return (
        <ThemeProvider defaultTheme="system">
            <SettingsProvider>
                <StudyProgressProvider>
                    <DecksProvider>
                        <SidebarProvider>
                            <Layout>
                                <Routes>
                                    <Route index element={<DashboardPage />} />
                                    <Route path="decks" element={<MyDecksPage />} />
                                    <Route path="flashcards" element={<GamePage initialModeName="Flashcards" />} />
                                    <Route path="learn" element={<GamePage initialModeName="Mini Course" />} />
                                    <Route path="quiz" element={<GamePage initialModeName="Rapid Fire" />} />
                                    <Route path="match" element={<GamePage initialModeName="Matching" />} />
                                    <Route path="written" element={<GamePage initialModeName="Written" />} />
                                    <Route path="speaking" element={<GamePage initialModeName="Speaking Drill" />} />
                                    <Route path="test" element={<GamePage initialModeName="Practice Test" />} />
                                    <Route path="transcripts" element={<TranscriptPage />} />
                                    <Route path="edit-deck" element={<EditDeckPage />} />
                                    <Route path="edit-deck/:deckId" element={<EditDeckPage />} />
                                    <Route path="settings" element={<SettingsPage />} />
                                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                                </Routes>
                            </Layout>
                        </SidebarProvider>
                    </DecksProvider>
                </StudyProgressProvider>
            </SettingsProvider>
        </ThemeProvider>
    );
}

export default DashboardApp;
