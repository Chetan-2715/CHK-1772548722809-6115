import React, { useState, useEffect, useCallback } from 'react';
import { Mic, Volume2, RotateCcw } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const BlindAssistant = () => {
    const [statusText, setStatusText] = useState("Tap the microphone to start");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const {
        transcript,
        listening,
        startListening,
        stopListening,
        resetTranscript,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition();

    // ── TTS helper ──
    const speak = useCallback((text, rate = 0.85) => {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = rate;
        window.speechSynthesis.speak(u);
    }, []);

    // ── When transcript updates while listening, show it live ──
    useEffect(() => {
        if (listening && transcript) {
            setStatusText(`Hearing: "${transcript}"…`);
            console.log("🟡 LIVE TRANSCRIPT:", transcript);
        }
    }, [transcript, listening]);

    // ── Process the captured transcript ──
    const processTranscript = useCallback(async (textToProcess) => {
        const text = (textToProcess || '').trim();
        if (!text || text.length < 2) {
            setStatusText("Didn't catch that. Tap the mic to try again.");
            speak("I didn't catch that. Please tap the microphone and say the medicine name.");
            return;
        }

        console.log("🟢 FINAL CAPTURED TEXT:", text);
        setStatusText(`You said: "${text}". Processing with AI…`);
        setLoading(true);
        setResult(null);

        try {
            console.log("📡 Sending to Gemini:", text);
            const res = await axios.post(`${API_URL}/voice/process`, { text });
            const data = res.data;
            console.log("✅ Gemini response:", data);

            if (data.success && data.medicine_found) {
                setResult({
                    name: data.medicine_name,
                    explanation: data.explanation,
                });
                setStatusText(`Medicine found: ${data.medicine_name}`);
                speak(`${data.medicine_name}. ${data.explanation}. Tap the microphone again to search another medicine.`);
            } else if (data.success && !data.medicine_found) {
                setStatusText(data.explanation || "Could not identify a medicine.");
                speak(data.explanation || "I could not identify a medicine. Please try again.");
            } else {
                setStatusText(data.error || "Something went wrong.");
                speak(data.error || "Something went wrong. Please try again.");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setStatusText("Error connecting to server. Try again.");
            speak("Error connecting to the server. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [speak]);

    // ── Start listening ──
    const handleMicClick = useCallback((e) => {
        e.stopPropagation();

        if (listening) {
            // Stop, grab transcript, and process
            const captured = transcript;
            stopListening();
            setTimeout(() => processTranscript(captured), 300);
            return;
        }

        // Fresh start
        window.speechSynthesis.cancel();
        resetTranscript();
        setResult(null);
        setStatusText("🎤 Listening… Say the name of the medicine.");
        startListening();
    }, [listening, transcript, startListening, stopListening, resetTranscript, processTranscript]);

    // ── Done button ──
    const handleDone = useCallback((e) => {
        e.stopPropagation();
        const captured = transcript;
        stopListening();
        setTimeout(() => processTranscript(captured), 300);
    }, [transcript, stopListening, processTranscript]);

    // ── Browser support check ──
    if (!browserSupportsSpeechRecognition) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: '100vh', padding: '2rem', textAlign: 'center',
            }}>
                <h1 style={{ fontSize: '2rem', color: '#ef4444' }}>
                    Your browser does not support speech recognition.<br />
                    Please use Google Chrome.
                </h1>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '100vh', padding: '2rem',
            background: listening ? '#fef2f2' : (result ? '#f0fdf4' : 'var(--background-color)'),
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
            textAlign: 'center', transition: 'background 0.3s', overflowY: 'auto',
        }}>

            {/* Mic button */}
            <div
                onClick={handleMicClick}
                style={{
                    width: 140, height: 140, borderRadius: '50%', cursor: 'pointer',
                    background: listening ? '#ef4444' : '#3b82f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: listening
                        ? '0 0 60px rgba(239,68,68,.5)'
                        : '0 0 40px rgba(59,130,246,.4)',
                    animation: listening ? 'pulse 1.5s infinite' : 'none',
                    transition: 'background 0.3s, box-shadow 0.3s',
                    marginBottom: '1.5rem',
                }}
            >
                {listening ? <Mic size={70} color="white" /> : <Volume2 size={70} color="white" />}
            </div>

            {/* Status */}
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', maxWidth: 700, margin: '0 auto 1rem auto' }}>
                {statusText}
            </h1>

            {/* Live transcript preview */}
            {listening && transcript && (
                <p style={{
                    fontSize: '1.4rem', color: '#6366f1', fontWeight: 600,
                    marginBottom: '1rem', background: 'white', padding: '0.8rem 1.5rem',
                    borderRadius: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,.06)',
                }}>
                    🗣️ "{transcript}"
                </p>
            )}

            {/* Submit button while listening and has text */}
            {listening && transcript && (
                <button
                    onClick={handleDone}
                    style={{
                        padding: '1rem 2.5rem', borderRadius: '1rem', border: 'none',
                        background: '#22c55e', color: 'white', fontSize: '1.2rem',
                        fontWeight: 700, cursor: 'pointer', marginBottom: '1.5rem',
                        boxShadow: '0 4px 15px rgba(34,197,94,.3)',
                    }}
                >
                    ✅ Done — Search this medicine
                </button>
            )}

            {/* Loading spinner */}
            {loading && (
                <div style={{ margin: '2rem 0' }}>
                    <RotateCcw size={48} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ fontSize: '1.2rem', color: '#64748b', marginTop: '1rem' }}>Processing with AI…</p>
                </div>
            )}

            {/* Result card */}
            {result && !listening && !loading && (
                <div style={{
                    background: 'white', padding: '2rem', borderRadius: '1.5rem',
                    maxWidth: 700, width: '100%',
                    boxShadow: '0 10px 30px rgba(0,0,0,.08)',
                    textAlign: 'left', marginTop: '1rem', marginBottom: '2rem',
                }}>
                    <h2 style={{
                        fontSize: '2rem', color: '#047857',
                        borderBottom: '3px solid #34d399', paddingBottom: '1rem',
                        marginBottom: '1.5rem', fontWeight: 900,
                    }}>
                        💊 {result.name}
                    </h2>
                    <p style={{
                        fontSize: '1.25rem', color: '#334155',
                        lineHeight: 1.8, whiteSpace: 'pre-wrap',
                    }}>
                        {result.explanation}
                    </p>
                </div>
            )}

            {/* Tap again hint after results */}
            {result && !listening && !loading && (
                <p style={{ fontSize: '1.1rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                    Tap the microphone again to search another medicine
                </p>
            )}

            <style>{`
                @keyframes pulse {
                    0%   { transform: scale(.95); box-shadow: 0 0 0 0    rgba(239,68,68,.7); }
                    70%  { transform: scale(1);   box-shadow: 0 0 0 30px rgba(239,68,68,0);  }
                    100% { transform: scale(.95); box-shadow: 0 0 0 0    rgba(239,68,68,0);  }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default BlindAssistant;
