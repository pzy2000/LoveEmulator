import React from 'react';
import { ACTIONS, actionSystem } from '../engine/ActionSystem';
import { useGameStore } from '../store/useGameStore';
import { eventEngine, type GameEvent } from '../engine/EventEngine';
import { TEXTS } from '../data/locales';

interface Props {
    onEventTrigger: (event: GameEvent) => void;
}

export const ActionGrid: React.FC<Props> = ({ onEventTrigger }) => {
    const performAction = useGameStore(state => state.performAction);
    const gameState = useGameStore();

    const handleAction = async (actionId: string) => {
        performAction(actionId);

        // Trigger event check
        const evt = await eventEngine.triggerEvent(gameState);
        if (evt) {
            onEventTrigger(evt);
        }
    };

    return (
        <div className="action-grid">
            {ACTIONS.map(action => {
                const canDo = actionSystem.canExecute(gameState, action.id);
                // We should find out WHY it failed to give a hint, but for now simple visual disabled state
                // Or better: let it be clickable but show failure reason.
                // Current usage: performAction(id) checks again, but returns void.

                // Let's check requirements manually here to customize UI
                const reqs = action.requirements || {};
                const locMatch = !reqs.locations || reqs.locations.includes(gameState.world.location);

                // Localization
                // @ts-ignore
                const localizedAction = TEXTS[gameState.language].actions[action.id];
                const label = localizedAction ? localizedAction.label : action.label;
                const desc = localizedAction ? localizedAction.desc : action.description;

                return (
                    <button
                        key={action.id}
                        className={`action-card ${!canDo ? 'disabled' : ''}`}
                        onClick={() => handleAction(action.id)}
                        disabled={!canDo}
                        title={!locMatch ? `${TEXTS[gameState.language].ui.requires_location}: ${reqs.locations?.join(', ')}` : ''}
                    >
                        <h3>{label}</h3>
                        <p>{desc}</p>
                        <div className="cost-tag">
                            {action.cost.energy && <span>⚡ {action.cost.energy}</span>}
                            {action.cost.money && <span>💰 {action.cost.money}</span>}
                        </div>
                        {!locMatch && <div className="req-tag">📍 {reqs.locations?.join('/')}</div>}
                    </button>
                );
            })}
        </div>
    );
};
