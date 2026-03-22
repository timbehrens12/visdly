import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useClerkSession } from '../../lib/clerk';

interface ChatMessage {
    id: string;
    profile_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    created_at: string;
}

interface ChatContextType {
    messages: ChatMessage[];
    isLoading: boolean;
    sendMessage: (content: string) => Promise<void>;
    clearHistory: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { userId, isSignedIn } = useClerkSession();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMessages = useCallback(async () => {
        if (!userId) return;
        
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('profile_id', userId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);
        } catch (err) {
            console.error('Error fetching chat messages:', err);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (isSignedIn && userId) {
            fetchMessages();
        } else {
            setMessages([]);
            setIsLoading(false);
        }
    }, [isSignedIn, userId, fetchMessages]);

    const sendMessage = async (content: string) => {
        if (!userId || !content.trim()) return;

        const userMessage: Partial<ChatMessage> = {
            profile_id: userId,
            role: 'user',
            content
        };

        // Optimistic update
        const tempId = Date.now().toString();
        const optimisticUserMessage: ChatMessage = {
            ...userMessage,
            id: tempId,
            created_at: new Date().toISOString()
        } as ChatMessage;

        setMessages(prev => [...prev, optimisticUserMessage]);

        try {
            const { data: savedUserMessage, error: userError } = await supabase
                .from('chat_messages')
                .insert([userMessage])
                .select()
                .single();

            if (userError) throw userError;

            // Replace optimistic with real
            setMessages(prev => prev.map(m => m.id === tempId ? savedUserMessage : m));

            // Simulate assistant response for now (real logic would involve an edge function or worker)
            const assistantMessage: Partial<ChatMessage> = {
                profile_id: userId,
                role: 'assistant', // Use assistant for AI
                content: `Response to: ${content}`
            };

            const { data: savedAssistantMessage, error: assistantError } = await supabase
                .from('chat_messages')
                .insert([assistantMessage])
                .select()
                .single();

            if (assistantError) throw assistantError;
            setMessages(prev => [...prev, savedAssistantMessage]);

        } catch (err) {
            console.error('Error sending message:', err);
            // Revert optimistic update on error?
            setMessages(prev => prev.filter(m => m.id !== tempId));
        }
    };

    const clearHistory = async () => {
        if (!userId) return;
        try {
            const { error } = await supabase
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
