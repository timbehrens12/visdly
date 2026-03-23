import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import { useClerkSession } from '../lib/clerk';

export interface ChatMessage {
    id: string;
    profile_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    course_context?: any;
    deck_context?: any;
    created_at: string;
}

interface ChatContextType {
    messages: ChatMessage[];
    isLoading: boolean;
    sendMessage: (content: string, context?: any) => Promise<void>;
    clearHistory: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { userId, isSignedIn, getToken } = useClerkSession();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadChatHistory = useCallback(async () => {
        if (!userId) return;
        
        setIsLoading(true);
        try {
            const token = await getToken({ template: 'supabase' });
            const client = getSupabaseClient(token || undefined);

            const { data, error } = await client
                .from('chat_messages')
                .select('*')
                .eq('profile_id', userId)
                .order('created_at', { ascending: true })
                .limit(50); // Get last 50 messages

            if (error) throw error;
            setMessages(data || []);
        } catch (err) {
            console.error('Error loading chat history:', err);
        } finally {
            setIsLoading(false);
        }
    }, [userId, getToken]);

    useEffect(() => {
        if (isSignedIn && userId) {
            loadChatHistory();
        } else {
            setMessages([]);
            setIsLoading(false);
        }
    }, [isSignedIn, userId, loadChatHistory]);

    const sendMessage = async (content: string) => {
        if (!userId || !content.trim()) return;

        // Optimistic UI update
        const tempId = `temp-${Date.now()}`;
        const newMessage: ChatMessage = {
            id: tempId,
            profile_id: userId,
            role: 'user',
            content,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, newMessage]);

        try {
            const token = await getToken({ template: 'supabase' });
            const client = getSupabaseClient(token || undefined);

            // 1. Save user message to DB
            const userMessageToSave = {
                profile_id: userId,
                role: 'user',
                content
                // Add context if needed later
            };

            const { data: savedUserMessage, error: userError } = await client
                .from('chat_messages')
                .insert([userMessageToSave])
                .select()
                .single();

            if (userError) throw userError;

            // Update temp message with real ID
            setMessages(prev => prev.map(m => m.id === tempId ? savedUserMessage : m));

            // 2. Call AI logic here (placeholder)
            // In reality, you'd send 'content' to an AI endpoint, get response, then save it
            
            // Placeholder: Mock AI response
            const assistantMessage = {
                profile_id: userId,
                role: 'assistant', // Use assistant for AI
                content: `Response to: ${content}`
            };

            const { data: savedAssistantMessage, error: assistantError } = await client
                .from('chat_messages')
                .insert([assistantMessage])
                .select()
                .single();

            if (assistantError) throw assistantError;
            setMessages(prev => [...prev, savedAssistantMessage]);

        } catch (err) {
            console.error('Error sending message:', err);
            // Revert optimistic update on error
            setMessages(prev => prev.filter(m => m.id !== tempId));
        }
    };

    const clearHistory = async () => {
        if (!userId) return;
        try {
            const token = await getToken({ template: 'supabase' });
            const client = getSupabaseClient(token || undefined);

            const { error } = await client
                .from('chat_messages')
                .delete()
                .eq('profile_id', userId);

            if (error) throw error;
            setMessages([]);
        } catch (err) {
            console.error('Error clearing chat history:', err);
        }
    };

    return (
        <ChatContext.Provider value={{ messages, isLoading, sendMessage, clearHistory }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
