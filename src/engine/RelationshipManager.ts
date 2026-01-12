import type { GameState, RelationshipState } from './types';
import type { EventChoice } from './EventEngine';

export class RelationshipManager {
    updateRelationship(state: GameState, characterId: string, choice: EventChoice): GameState {
        const newState = JSON.parse(JSON.stringify(state)); // Deep clone
        const rel = newState.player.relationships[characterId] || this.initializeRelationship();

        // Simple logic mapping intent to stat changes
        // "honest" -> Trust +, Comfort +
        // "humor" -> Attraction +, Comfort +
        // "aggressive" -> Trust -, Conflict +
        // "avoidant" -> Comfort -, Trust -
        // "flirty" -> Attraction ++, Trust ?

        // Multipliers based on Player Stats
        const charmBonus = state.player.stats.charm > 50 ? 1.5 : 1.0;
        const repBonus = state.player.stats.reputation > 50 ? 1.5 : 1.0;

        switch (choice.intent) {
            case 'honest':
                rel.trust = Math.min(100, rel.trust + (5 * repBonus)); // Reputation boosts trust gain
                rel.comfort = Math.min(100, rel.comfort + 3);
                break;
            case 'humor':
                rel.attraction = Math.min(100, rel.attraction + (3 * charmBonus)); // Charm boosts attraction from humor
                rel.comfort = Math.min(100, rel.comfort + 5);
                break;
            case 'aggressive':
                rel.trust = Math.max(0, rel.trust - 5);
                rel.conflict = Math.min(100, rel.conflict + 10);
                break;
            case 'avoidant':
                rel.trust = Math.max(0, rel.trust - 3);
                rel.comfort = Math.max(0, rel.comfort - 5);
                break;
            case 'flirty':
                rel.attraction = Math.min(100, rel.attraction + (5 * charmBonus)); // Charm boosts flirting power
                // Flirting might lower trust if not close enough? Keeping simple for now.
                break;
        }

        // Apply general decay or caps?

        newState.player.relationships[characterId] = rel;
        return newState;
    }

    initializeRelationship(): RelationshipState {
        return {
            trust: 20,
            attraction: 10,
            comfort: 20,
            respect: 20,
            investment: 0,
            conflict: 0,
            status: 'acquaintance',
            history: [],
            memories: []
        };
    }
    applyAttributeUpdates(state: GameState, characterId: string, updates: Partial<RelationshipState>): GameState {
        const newState = JSON.parse(JSON.stringify(state)); // Deep clone
        const rel = newState.player.relationships[characterId] || this.initializeRelationship();

        if (updates.trust !== undefined) rel.trust = Math.max(0, Math.min(100, rel.trust + updates.trust));
        if (updates.comfort !== undefined) rel.comfort = Math.max(0, Math.min(100, rel.comfort + updates.comfort));
        if (updates.attraction !== undefined) rel.attraction = Math.max(0, Math.min(100, rel.attraction + updates.attraction));
        if (updates.respect !== undefined) rel.respect = Math.max(0, Math.min(100, rel.respect + updates.respect));
        if (updates.investment !== undefined) rel.investment = Math.max(0, Math.min(100, rel.investment + updates.investment));
        if (updates.conflict !== undefined) rel.conflict = Math.max(0, Math.min(100, rel.conflict + updates.conflict));

        // Ensure atomic updates for other fields if needed, but primarily stats for now

        newState.player.relationships[characterId] = rel;
        return newState;
    }
}

export const relationshipManager = new RelationshipManager();
