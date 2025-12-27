import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { dialogueManager } from '../engine/DialogueManager';

const TypewriterMessage: React.FC<{ content: string }> = ({ content }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < content.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + content[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, 30); // 30ms per character
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, content]);

    return <div className="bubble">{displayedText}</div>;
};



export const DialogueView: React.FC = () => {
    const { activeDialogue, characters } = useGameStore();
    const updateActiveDialogue = useGameStore(state => state.updateActiveDialogue);
    const closeDialogue = useGameStore(state => state.closeDialogue);

    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const character = activeDialogue ? characters[activeDialogue.characterId] : null;

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [activeDialogue?.messages, isTyping]); // Auto-scroll on type

    if (!activeDialogue || !character) return null;

    const handleOptionClick = (opt: { id: string, text: string, intent: string }) => {
        handleSend(opt.text, opt.intent);
    };

    const handleSend = async (overrideText?: string, intent?: string) => {
        const text = overrideText || inputText;
        if (!text.trim()) return;

        if (intent && character) {
            useGameStore.getState().updateRelationship(character.id, { id: 'dialogue', text, intent });
        }

        const newMessages = [
            ...activeDialogue.messages,
            { role: 'user' as const, content: text }
        ];

        updateActiveDialogue({ ...activeDialogue, messages: newMessages, replyOptions: undefined });
        setInputText('');
        setIsTyping(true);

        const currentState = useGameStore.getState();
        const response = await dialogueManager.generateReply(currentState, text);

        setIsTyping(false);

        if (response) {
            const assistantMsg = { role: 'assistant' as const, content: response.text };
            updateActiveDialogue({
                ...activeDialogue,
                messages: [...newMessages, assistantMsg],
                replyOptions: response.choices
            });
            if (response.internal_reaction) {
                console.log("Internal Reaction:", response.internal_reaction);
            }
        }
    };

    return (
        <div className="modal-overlay">
            <div className="dialogue-panel glass-panel">
                <div className="dialogue-header">
                    <img src={character.avatar} className="avatar-small" />
                    <h3>{character.name}</h3>
                    <button onClick={closeDialogue} className="close-btn">X</button>
                </div>

                <div className="messages-area" ref={scrollRef}>
                    {activeDialogue.messages.map((msg, idx) => (
                        <div key={idx} className={`message ${msg.role}`}>
                            {msg.role === 'assistant' && idx === activeDialogue.messages.length - 1 ? (
                                <TypewriterMessage content={msg.content} />
                            ) : (
                                <div className="bubble">{msg.content}</div>
                            )}
                        </div>
                    ))}
                    {isTyping && <div className="typing-indicator">...</div>}
                </div>

                <div className="input-area-container">
                    {activeDialogue.replyOptions && activeDialogue.replyOptions.length > 0 && !isTyping && (
                        <div className="reply-options">
                            {activeDialogue.replyOptions.map(opt => (
                                <button key={opt.id} onClick={() => handleOptionClick(opt)}>
                                    {opt.text}
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="input-area">
                        <input
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                        />
                        <button onClick={() => handleSend()}>Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
