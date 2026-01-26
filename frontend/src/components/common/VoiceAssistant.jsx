import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { voiceAPI } from '../../services/api';
import './VoiceAssistant.css';

const VoiceAssistant = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    // Check if user is logged in
    const isLoggedIn = () => {
        return localStorage.getItem('token') !== null;
    };

    // Ref to store the send function for use in speech recognition
    const sendMessageRef = useRef(null);

    // Initialize speech recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setIsListening(false);
                // Auto-send the message when speech recognition completes
                if (transcript.trim() && sendMessageRef.current) {
                    sendMessageRef.current(transcript);
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    // Scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Text-to-speech function
    const speak = (text) => {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.volume = 1;
            window.speechSynthesis.speak(utterance);
        }
    };

    // Start listening
    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    // Stop listening
    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    // Send message with specific text (used for auto-send from voice)
    const sendMessageText = async (messageText) => {
        if (!messageText.trim() || isLoading) return;

        const userMessage = messageText.trim();
        setInputText('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await voiceAPI.chat(sessionId, userMessage);
            const aiMessage = response.response;
            const actionPerformed = response.action_performed;

            // Add action indicator if an action was performed
            const messageContent = actionPerformed
                ? `✅ ${aiMessage}`
                : aiMessage;

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: messageContent,
                action: actionPerformed,
                data: response.data
            }]);

            // Speak the response
            speak(aiMessage);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Keep the ref updated with the latest sendMessageText function
    useEffect(() => {
        sendMessageRef.current = sendMessageText;
    });

    // Send message from input field
    const sendMessage = async () => {
        await sendMessageText(inputText);
    };

    // Handle key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Reset conversation
    const resetConversation = async () => {
        try {
            await voiceAPI.resetSession(sessionId);
            setMessages([]);
        } catch (error) {
            console.error('Error resetting session:', error);
        }
    };

    // Don't render if not logged in
    if (!isLoggedIn()) {
        return null;
    }

    return (
        <div className="voice-assistant">
            {/* Floating Button */}
            <button
                className={`voice-assistant-fab ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Voice Assistant"
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
                    </svg>
                )}
            </button>

            {/* Chat Modal */}
            {isOpen && (
                <div className="voice-assistant-modal">
                    {/* Header */}
                    <div className="voice-assistant-header">
                        <h3>🎙️ Store Assistant</h3>
                        <button onClick={resetConversation} className="reset-btn" title="New Conversation">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="voice-assistant-messages">
                        {messages.length === 0 && (
                            <div className="welcome-message">
                                <p>👋 Hi! I'm your Store Assistant.</p>
                                <p>Ask me about products, stock, or prices!</p>
                            </div>
                        )}
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.role}`}>
                                <div className="message-content">
                                    {msg.content}
                                    {msg.data && msg.data.bill_id && (
                                        <button
                                            onClick={() => {
                                                setIsOpen(false);
                                                navigate(`/print-bill/${msg.data.bill_id}`);
                                            }}
                                            className="mt-2 flex items-center bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-semibold shadow-sm hover:bg-gray-50 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0v3H7V4h6zm-8 7.414l2.293 2.293a1 1 0 001.414 0L16 6.414V9a1 1 0 001 1h-1v-2H5v2H4a1 1 0 00-1-1v-2.586a1 1 0 00.293-.707zM15 15v2H5v-2h10z" clipRule="evenodd" />
                                            </svg>
                                            Print Bill
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message assistant">
                                <div className="message-content loading">
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="voice-assistant-input">
                        <button
                            className={`mic-btn ${isListening ? 'listening' : ''}`}
                            onClick={isListening ? stopListening : startListening}
                            title={isListening ? 'Stop listening' : 'Start listening'}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
                            </svg>
                        </button>
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={isListening ? 'Listening...' : 'Type or speak...'}
                            disabled={isLoading}
                        />
                        <button
                            className="send-btn"
                            onClick={sendMessage}
                            disabled={!inputText.trim() || isLoading}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceAssistant;
