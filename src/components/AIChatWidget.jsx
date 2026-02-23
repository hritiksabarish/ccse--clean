import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, User, LoaderCircle } from 'lucide-react';
import GlassCard from './UI/GlassCard';
import { API_BASE } from '../services/api';
import { useLocation } from 'react-router-dom';

const AIChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hello! I am your Climate Intel Assistant. How can I help you understand climate risks today?' }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    const location = useLocation();

    // Get current analysis context from location state if available
    const analysisContext = location.state || {};

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/api/ai-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: input,
                    analysis_data: analysisContext,
                    history: messages
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setMessages(prev => [...prev, { role: 'assistant', text: data.response }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', text: data.error || "Sorry, I encountered an error. Please try again later." }]);
            }
        } catch (err) {
            console.error("Chat error:", err);
            setMessages(prev => [...prev, { role: 'assistant', text: "Network error. I can't reach my climate intelligence core." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-chat-widget" style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 10000 }}>
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="btn btn-cta"
                    style={{
                        width: '60px', height: '60px', borderRadius: '50%', padding: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 32px rgba(255, 159, 67, 0.4)'
                    }}
                >
                    <MessageSquare size={28} />
                </button>
            ) : (
                <GlassCard style={{
                    width: '350px', height: '500px', display: 'flex', flexDirection: 'column',
                    padding: 0, overflow: 'hidden', border: '1px solid rgba(255, 159, 67, 0.2)'
                }}>
                    <div style={{
                        padding: '1rem', background: 'rgba(255, 159, 67, 0.1)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        borderBottom: '1px solid rgba(255, 159, 67, 0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Bot size={20} className="text-accent" />
                            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Climate Risk Intel</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{
                                display: 'flex', gap: '0.75rem',
                                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%'
                            }}>
                                {m.role === 'assistant' && <div style={{ minWidth: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255, 159, 67, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bot size={14} className="text-accent" /></div>}
                                <div style={{
                                    padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.85rem', lineHeight: '1.4',
                                    background: m.role === 'user' ? 'var(--accent-orange)' : 'rgba(255,255,255,0.05)',
                                    color: m.role === 'user' ? '#7dd3fc' : '#eee'
                                }}>
                                    {m.text}
                                </div>
                                {m.role === 'user' && <div style={{ minWidth: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={14} /></div>}
                            </div>
                        ))}
                        {loading && (
                            <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.75rem' }}>
                                <div style={{ minWidth: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255, 159, 67, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bot size={14} className="text-accent" /></div>
                                <div style={{ padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)' }}>
                                    <LoaderCircle size={16} className="animate-spin text-accent" />
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.5rem' }}>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about your risk..."
                            style={{
                                flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px', padding: '0.5rem 0.75rem', color: '#fff', fontSize: '0.85rem', outline: 'none'
                            }}
                        />
                        <button type="submit" className="btn btn-cta" style={{ padding: '0.5rem' }} disabled={loading}>
                            <Send size={18} />
                        </button>
                    </form>
                </GlassCard>
            )}
        </div>
    );
};

export default AIChatWidget;
