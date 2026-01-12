import React from 'react';
import { useGameStore } from '../store/useGameStore';

import { LOADING_QUOTES } from '../data/loadingQuotes';
import { useState, useEffect } from 'react';

export const EventLoadingModal: React.FC = () => {
    const isGeneratingEvent = useGameStore(state => state.isGeneratingEvent);
    const language = useGameStore(state => state.language);
    const [quote, setQuote] = useState('');

    useEffect(() => {
        if (isGeneratingEvent) {
            const quotes = LOADING_QUOTES[language] || LOADING_QUOTES['en'];
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            setQuote(randomQuote);
        }
    }, [isGeneratingEvent, language]);

    if (!isGeneratingEvent) return null;

    return (
        <div className="modal-overlay event-loading-overlay">
            <div className="event-loading-modal glass-panel">
                <div className="loading-icon">✨</div>
                <h3>{language === 'zh' ? '正在等待模拟结果...' : 'Generating Event...'}</h3>
                <p className="loading-subtitle">
                    {quote || (language === 'zh'
                        ? '在繁忙的巷弄里，深思这段可能会怎么发展...'
                        : 'Thinking about what might happen next...')}
                </p>
                <div className="loading-bar">
                    <div className="loading-bar-fill"></div>
                </div>
            </div>
        </div>
    );
};
