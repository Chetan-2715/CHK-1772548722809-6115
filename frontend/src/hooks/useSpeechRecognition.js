/**
 * Custom hook that mimics react-speech-recognition but uses the raw Web Speech API.
 * This avoids the "Invalid hook call" issue caused by react-speech-recognition v4
 * bundling its own React copy.
 */
import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechRecognition() {
    const [transcript, setTranscript] = useState('');
    const [listening, setListening] = useState(false);
    const recognitionRef = useRef(null);
    const supported = useRef(false);

    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SR) {
            supported.current = true;
            const rec = new SR();
            rec.continuous = true;
            rec.interimResults = true;
            rec.lang = 'en-US';

            rec.onstart = () => setListening(true);
            rec.onend = () => setListening(false);

            rec.onresult = (e) => {
                let full = '';
                for (let i = 0; i < e.results.length; i++) {
                    full += e.results[i][0].transcript;
                }
                setTranscript(full);
            };

            rec.onerror = (e) => {
                console.warn("Speech error:", e.error);
                if (e.error === 'not-allowed') {
                    setListening(false);
                }
            };

            recognitionRef.current = rec;
        }

        return () => {
            try { recognitionRef.current?.stop(); } catch (_) {}
        };
    }, []);

    const startListening = useCallback(() => {
        if (!recognitionRef.current) return;
        setTranscript('');
        try { recognitionRef.current.abort(); } catch (_) {}
        setTimeout(() => {
            try { recognitionRef.current.start(); } catch (_) {}
        }, 100);
    }, []);

    const stopListening = useCallback(() => {
        try { recognitionRef.current?.stop(); } catch (_) {}
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        transcript,
        listening,
        startListening,
        stopListening,
        resetTranscript,
        browserSupportsSpeechRecognition: supported.current || !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    };
}
