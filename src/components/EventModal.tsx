import React from 'react';
import type { GameEvent, EventChoice } from '../engine/EventEngine';

interface Props {
    event: GameEvent;
    onChoice: (choice: EventChoice) => void;
}

export const EventModal: React.FC<Props> = ({ event, onChoice }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel">
                <h2 className="event-title">{event.title}</h2>
                <div className="event-narration">
                    <p>{event.narration}</p>
                </div>

                <div className="choices-list">
                    {event.choices.map(choice => (
                        <button
                            key={choice.id}
                            className="choice-btn"
                            onClick={() => onChoice(choice)}
                        >
                            {choice.text}
                            <span className="intent-tag">{choice.intent}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
