import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { TEXTS } from '../data/locales';

export const CharacterList: React.FC = () => {
    const { characters, player, startDialogue, language } = useGameStore();
    const t = TEXTS[language];
    const isChatLocked = player.dailyChatUsed;

    return (
        <div className="character-list-panel glass-panel">
            <h2>{t.ui.contacts}</h2>
            <div className="contacts-grid">
                {Object.values(characters).map(char => {
                    const rel = player.relationships[char.id] || {
                        status: 'stranger', trust: 0, attraction: 0
                    };

                    // @ts-ignore
                    const localizedStatus = t.relations[rel.status] || rel.status;

                    return (
                        <div key={char.id} className="character-card">
                            <div className="char-header">
                                <img src={char.avatar} className="avatar-med" />
                                <div>
                                    <h4>{char.name}</h4>
                                    <span className={`status-tag ${rel.status}`}>{localizedStatus}</span>
                                </div>
                            </div>

                            <div className="rel-stats">
                                {/* Relationship Stats (Trust, Attraction) */}
                                <div className="stat-row has-tooltip">
                                    <span>{t.ui.trust}</span>
                                    <div className="mini-bar"><div style={{ width: `${rel.trust}%` }} /></div>
                                    <div className="tooltip-popup">
                                        <span className="value">{rel.trust}</span>
                                        <span className="label">Trust</span>
                                    </div>
                                </div>
                                <div className="stat-row has-tooltip">
                                    <span>{t.ui.like}</span>
                                    <div className="mini-bar"><div style={{ width: `${rel.attraction}%` }} /></div>
                                    <div className="tooltip-popup">
                                        <span className="value">{rel.attraction}</span>
                                        <span className="label">Attraction</span>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="divider" style={{ margin: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}></div>

                                {/* Character Attributes */}
                                <div className="char-attributes-grid" style={{ fontSize: '0.8rem', color: '#ccc' }}>
                                    {/* Numeric Attributes with Bars */}
                                    <div className="attr-row">
                                        <span>{t.attributes.wealth}</span>
                                        <div className="mini-bar attr-bar">
                                            <div style={{ width: `${char.attributes?.wealth || 0}%`, background: '#ffd700' }} />
                                        </div>
                                    </div>
                                    <div className="attr-row">
                                        <span>{t.attributes.appearance}</span>
                                        <div className="mini-bar attr-bar">
                                            <div style={{ width: `${char.attributes?.appearance || 0}%`, background: '#ff69b4' }} />
                                        </div>
                                    </div>

                                    {/* Text Attributes */}
                                    <div className="attr-text-row">
                                        <span>{t.attributes.age}: {char.attributes?.age}</span>
                                        <span>{t.attributes.status}: {char.attributes?.status}</span>
                                    </div>
                                    <div className="attr-text-row">
                                        <span style={{ gridColumn: 'span 2' }}>{t.attributes.occupation}: {char.attributes?.occupation}</span>
                                    </div>
                                    <div className="attr-text-row">
                                        <span style={{ gridColumn: 'span 2' }}>{t.attributes.personality}: {char.attributes?.personality}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                className={`chat-btn ${isChatLocked ? 'disabled' : ''}`}
                                onClick={() => startDialogue(char.id)}
                                disabled={isChatLocked}
                            >
                                {isChatLocked ? (language === 'zh' ? '今日已聊' : 'No Chats Left') : t.ui.chat}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
