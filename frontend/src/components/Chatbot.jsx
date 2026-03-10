import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../App';
import { Send, MessageCircle, X } from 'lucide-react';
import './Chatbot.css';

const Chatbot = () => {
    const { speakText, user } = useContext(AppContext);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            text: 'Hello! I\'m your medication assistant. I can help you with information about your prescriptions, medications, and health records. How can I help you today?'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        // Add user message
        setMessages(prev => [...prev, {
            type: 'user',
            text: inputValue
        }]);
        setInputValue('');
        setLoading(true);

        try {
            // Simulate API call to backend chatbot
            // In production, this would call: POST /api/chatbot/query
            const response = await fetch('http://localhost:8000/api/chatbot/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    message: inputValue,
                    user_id: user?.id
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();
            setMessages(prev => [...prev, {
                type: 'bot',
                text: data.response || 'I couldn\'t process that request. Please try again.'
            }]);

            speakText(data.response || 'I couldn\'t process that request.');
        } catch (error) {
            console.log('Chatbot API not yet available - using placeholder response');
            const placeholderResponses = [
                'Based on your prescription history, I recommend taking your medication as directed by your doctor.',
                'Your last prescription included common medications for managing your health condition.',
                'Remember to take your medications at the scheduled times for best results.',
                'I can help you understand your medical history and prescriptions. What specific medication do you want to know about?'
            ];
            const response = placeholderResponses[Math.floor(Math.random() * placeholderResponses.length)];
            setMessages(prev => [...prev, {
                type: 'bot',
                text: response
            }]);
            speakText(response);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                className="chatbot-float-btn"
                onClick={() => setIsOpen(true)}
                onMouseEnter={() => speakText('Open medication assistant chatbot')}
                title="Medication Assistant"
            >
                <MessageCircle size={24} />
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-header-content">
                            <MessageCircle size={24} />
                            <h3>Medication Assistant</h3>
                        </div>
                        <button
                            className="chatbot-close-btn"
                            onClick={() => setIsOpen(false)}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message message-${msg.type}`}>
                                <div className="message-bubble">
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="message message-bot">
                                <div className="message-bubble loading">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-input">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Ask about your medications..."
                            disabled={loading}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={loading || !inputValue.trim()}
                            className="send-btn"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
