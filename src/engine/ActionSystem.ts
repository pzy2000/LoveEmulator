import type { ActionDef, GameState } from './types';

export const ACTIONS: ActionDef[] = [
    {
        id: 'work_coding',
        label: 'Write Code',
        description: 'Work on your side project. Earns money but drains energy.',
        category: 'work',
        cost: { energy: 20, time: 1 },
        requirements: { locations: ['home', 'office', 'cafe'] },
        effects: {
            resources: { money: 100 },
            stats: { intelligence: 1 }
        }
    },
    {
        id: 'gym_workout',
        label: 'Gym Workout',
        description: 'Lift weights. Gains strength.',
        category: 'health',
        cost: { energy: 30, money: 10, time: 1 },
        requirements: { locations: ['gym'] },
        effects: {
            stats: { strength: 2 }
        }
    },
    {
        id: 'spa_visit',
        label: 'Visit SPA',
        description: 'Relax and recover. Restores energy.',
        category: 'health',
        cost: { money: 50, time: 1 },
        requirements: { locations: ['gym', 'shopping_mall'] }, // Assuming gym has spa or add mall
        effects: {
            resources: { energy: 50 },
            stats: { charm: 1 }
        }
    },
    {
        id: 'date_coffee',
        label: 'Coffee Date',
        description: 'A casual meet-up. Low risk, moderate reward.',
        category: 'social',
        cost: { money: 80, energy: 10, time: 1 },
        requirements: { locations: ['restaurant', 'cafe'] },
        effects: {
            stats: { communication: 1 }
        },
        eventTrigger: { type: 'random_category', category: 'social', guaranteed: true }
    },
    // {
    //     id: 'date_elena',
    //     label: 'Date Elena',
    //     description: 'Ask Elena out for a serious talk.',
    //     category: 'social',
    //     cost: { money: 200, energy: 40, time: 2 },
    //     requirements: { locations: ['restaurant'] },
    //     effects: { stats: { charm: 2 } },
    //     eventTrigger: { type: 'specific', id: 'elena_date_1' }
    // }
];

import { timeManager } from './TimeManager';

export class ActionSystem {
    canExecute(state: GameState, actionId: string): boolean {
        const action = ACTIONS.find(a => a.id === actionId);
        if (!action) return false;

        const { resources } = state.player;
        const { cost, requirements } = action;

        if (cost.money && resources.money < cost.money) return false;
        if (cost.energy && resources.energy < cost.energy) return false;

        // Location Check
        if (requirements?.locations && !requirements.locations.includes(state.world.location)) {
            return false;
        }

        return true;
    }

    applyCost(state: GameState, actionId: string): GameState {
        const action = ACTIONS.find(a => a.id === actionId);
        if (!action) return state;

        const newState = JSON.parse(JSON.stringify(state)); // Deep clone
        const { cost, effects } = action;

        // Apply Costs
        if (cost.energy) newState.player.resources.energy -= cost.energy;
        if (cost.money) newState.player.resources.money -= cost.money;

        // Apply Time Cost & Daily Reset
        if (cost.time) {
            const oldDay = newState.world.day;
            const oldWeek = newState.world.week;

            newState.world = timeManager.advanceTime(newState.world, cost.time);

            // Check if day changed (or week changed)
            if (newState.world.day !== oldDay || newState.world.week !== oldWeek) {
                // Recover 50 Energy on new day
                newState.player.resources.energy = Math.min(100, (newState.player.resources.energy || 0) + 50);

                // Reset daily chat limit
                newState.player.dailyChatUsed = false;
            }
        }

        // Apply base stats effects
        if (effects.stats) {
            for (const [key, val] of Object.entries(effects.stats)) {
                // @ts-ignore
                if (newState.player.stats[key] !== undefined) {
                    // @ts-ignore
                    newState.player.stats[key] += val;
                }
            }
        }

        // Apply base resource effects
        if (effects.resources) {
            Object.entries(effects.resources).forEach(([key, value]) => {
                // @ts-ignore
                newState.player.resources[key] = (newState.player.resources[key] || 0) + value;
            });
        }

        // Check for Title Upgrade based on Charm
        const charm = newState.player.stats.charm;
        let newTitle = newState.player.title;
        // Titles: Love Novice -> Love Master -> Pre-Sea King -> Sea King -> Succubus
        if (charm >= 300) newTitle = 'Succubus (魅魔)';
        else if (charm >= 200) newTitle = 'Sea King (海王)';
        else if (charm >= 100) newTitle = 'Pre-Sea King (准海王)';
        else if (charm >= 50) newTitle = 'Love Master (情场高手)';

        if (newTitle !== newState.player.title) {
            newState.player.title = newTitle;
            // Could add log or notification here
        }

        return newState;
    }
}

export const actionSystem = new ActionSystem();
