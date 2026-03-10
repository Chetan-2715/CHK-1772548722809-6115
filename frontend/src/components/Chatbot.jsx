import React, { useState, useRef, useEffect, useContext } from 'react';
import { MessageCircle, X, Send, Bot, User, ImagePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../App';
import { chatbotAPI } from '../services/api';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showDot, setShowDot] = useState(true);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const imageInputRef = useRef(null);
    const { t } = useTranslation();
    const { user, speakText } = useContext(AppContext);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
            setShowDot(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const name = user?.name?.split(' ')[0] || '';
            setMessages([{
                role: 'assistant',
                content: t('chatbot.welcome', { name }) ||
                    `Hello ${name}! 😊 I'm your health assistant. Ask me anything about your medications or just chat! 💙`
            }]);
        }
    }, [isOpen]);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (ev) => setImagePreview(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    const handleSend = async () => {
        const text = input.trim();
        if ((!text && !imageFile) || isTyping) return;

        // Build user message display
        const userMsg = {
            role: 'user',
            content: text || (imageFile ? '📷 [Image sent]' : ''),
            image: imagePreview || null
        };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setIsTyping(true);

        try {
            let reply;

            if (imageFile) {
                // Image + text chat
                const formData = new FormData();
                formData.append('file', imageFile);
                formData.append('message', text || 'What is this?');
                const historyForApi = newMessages.slice(-8).map(m => ({
                    role: m.role === 'assistant' ? 'assistant' : 'user',
                    content: m.content
                }));
                formData.append('history', JSON.stringify(historyForApi));

                const res = await chatbotAPI.chatImage(formData);
                reply = res.data.reply;
                clearImage();
            } else {
                // Text-only chat
                const history = newMessages.slice(-10).map(m => ({
                    role: m.role === 'assistant' ? 'assistant' : 'user',
                    content: m.content
                }));
                const res = await chatbotAPI.chat({ message: text, history });
                reply = res.data.reply;
            }

            reply = reply || t('chatbot.error_reply') || "I'm sorry, could you try again?";
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: t('chatbot.error_reply') || "I'm having trouble connecting. Please try again. 🙏"
            }]);
            clearImage();
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const quickActions = [
        t('chatbot.quick_medicines') || 'My medicines',
        t('chatbot.quick_reminders') || 'My reminders',
        t('chatbot.quick_feeling') || 'Feeling unwell',
        t('chatbot.quick_side_effect') || 'Side effects?',
    ];

    const sendQuickAction = (text) => {
        if (isTyping) return;
        const userMsg = { role: 'user', content: text };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setIsTyping(true);

        const history = newMessages.slice(-10).map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
        }));

        chatbotAPI.chat({ message: text, history })
            .then(res => {
                const reply = res.data.reply || "I'm sorry, could you try again?";
                setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
            })
            .catch(() => {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: "I'm having trouble connecting. Please try again. 🙏"
                }]);
            })
            .finally(() => setIsTyping(false));
    };

    return (
        <>
            <button
                className={`chatbot-fab ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title={t('chatbot.title') || 'Health Assistant'}
            >
                {isOpen ? <X size={26} /> : <MessageCircle size={26} />}
                {showDot && !isOpen && <span className="chatbot-fab-dot" />}
            </button>

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-header-avatar">
                            <Bot size={22} />
                        </div>
                        <div className="chatbot-header-info">
                            <h4>{t('chatbot.title') || 'Health Assistant'}</h4>
                            <span><span className="online-dot"></span>{t('chatbot.online') || 'Online • Ready to help'}</span>
                        </div>
                        <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`chat-msg ${msg.role === 'user' ? 'user' : 'bot'}`}>
                                <div className="chat-msg-avatar">
                                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                </div>
                                <div className="chat-bubble">
                                    {msg.image && (
                                        <img src={msg.image} alt="Shared" className="chat-image" />
                                    )}
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="chat-msg bot">
                                <div className="chat-msg-avatar"><Bot size={14} /></div>
                                <div className="typing-indicator">
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {messages.length <= 2 && !isTyping && (
                        <div className="chatbot-quick-actions">
                            {quickActions.map((action, i) => (
                                <button key={i} className="quick-action-btn" onClick={() => sendQuickAction(action)}>
                                    {action}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Image Preview */}
                    {imagePreview && (
                        <div className="chatbot-image-preview">
                            <img src={imagePreview} alt="To send" />
                            <button className="chatbot-image-remove" onClick={clearImage}>✕</button>
                        </div>
                    )}

                    <div className="chatbot-input-area">
                        <input
                            type="file"
                            ref={imageInputRef}
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleImageSelect}
                        />
                        <button
                            className="chatbot-attach-btn"
                            onClick={() => imageInputRef.current?.click()}
                            title="Attach image"
                            type="button"
                        >
                            <ImagePlus size={20} />
                        </button>
                        <input
                            ref={inputRef}
                            className="chatbot-input"
                            placeholder={t('chatbot.placeholder') || 'Ask me anything...'}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isTyping}
                        />
                        <button
                            className="chatbot-send-btn"
                            onClick={handleSend}
                            disabled={(!input.trim() && !imageFile) || isTyping}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
