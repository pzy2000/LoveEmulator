import type { GameState } from './types';
import { llmService } from '../services/LLMService';
import { EVENT_GENERATOR_SYSTEM_PROMPT, generateEventPrompt, CHAIN_EVENT_PROMPT, CAFE_CONTACT_EVENT_PROMPT } from '../services/PromptTemplates';
import { generateRandomContact } from '../data/contactGenerator';

export interface GameEvent {
    id: string;
    title: string;
    narration: string;
    choices: EventChoice[];
    characterId?: string;
    // @ts-ignore
    newContact?: any; // Allow passing new character data
}

export interface EventChoice {
    id: string;
    text: string;
    intent: string;
    effects?: {
        resources?: Record<string, number>;
        stats?: Record<string, number>;
    };
}

const SITUATIONS = [
    { id: 'coffee_spill', type: 'accident', intensity: 1, description: 'Spilled coffee on a stranger.' },
    { id: 'late_work', type: 'work', intensity: 2, description: 'Boss demands overtime on date night.' },
    { id: 'old_friend', type: 'social', intensity: 1, description: 'Bump into an old friend who is now successful.' },
    { id: 'gym_crush', type: 'romance', intensity: 2, description: 'Catching eyes with someone cute at the gym.' },
    { id: 'family_call', type: 'social', intensity: 1, description: 'Mom calls asking when you are getting married.' },
    { id: 'cat_rescue', type: 'accident', intensity: 1, description: 'Found a stray kitten in the rain.' },
    { id: 'code_bug', type: 'work', intensity: 3, description: 'Critical production bug on Friday evening.' },
    { id: 'meet_stranger', type: 'encounter', intensity: 2, description: 'Met someone interesting in public. Chance to add contact.' }
];

export class EventEngine {
    async triggerEvent(state: GameState, probability: number = 0.3): Promise<GameEvent | null> {
        // Cafe Check
        if (state.world.location === 'cafe') {
            // 50% chance for specific cafe event (contact) vs generic random event
            if (Math.random() < 0.5) {
                return this.generateCafeEvent(state);
            }
        }

        // Simple random trigger
        if (Math.random() > probability) {
            return null;
        }

        const situation = SITUATIONS[Math.floor(Math.random() * SITUATIONS.length)];
        return this.generateFromSituation(state, situation);
    }

    async handleEventChoice(event: GameEvent, choice: EventChoice, state: GameState): Promise<GameEvent | null> {
        // 1. Check if this choice should trigger a chain event.
        // For now, let's say "social" or "work" intensity > 1 events have 50% chance of chain reaction.
        // OR simply if the LLM generated event has some flag.
        // As per requirement: "Event A ends, trigger Event B based on choice".
        // Let's implement a probabilistic trigger for now, or logic based on event type.

        // Exclude specific scripted events or cafe contacts from chains for simplicity unless desired
        if (event.id.startsWith('cafe_contact')) return null;

        // 40% Chance of chain reaction for random events
        if (Math.random() < 0.4) {
            return this.generateFollowUpEvent(event, choice, state);
        }

        return null;
    }

    private async generateFollowUpEvent(prevEvent: GameEvent, choice: EventChoice, state: GameState): Promise<GameEvent | null> {
        const messages = [
            { role: 'system', content: CHAIN_EVENT_PROMPT(state.language) },
            {
                role: 'user', content: JSON.stringify({
                    prevTitle: prevEvent.title,
                    prevDesc: prevEvent.narration,
                    choiceText: choice.text,
                    choiceIntent: choice.intent
                })
            }
        ];

        // @ts-ignore
        const data = await llmService.generateJSON<GameEvent>(messages);

        if (data) {
            return {
                ...data,
                id: `chain_${Date.now()}`,
            };
        }
        return null;
    }

    private async generateCafeEvent(state: GameState): Promise<GameEvent | null> {
        // 80% chance of contact event
        if (Math.random() < 0.8) {
            // Generate Cafe Contact Event

            // Get existing character names and occupations to avoid duplicates
            const existingContacts = Object.values(state.characters).map(char => ({
                name: char.name,
                occupation: char.attributes.occupation
            }));

            const contextInfo = existingContacts.length > 0
                ? `\n\nIMPORTANT: You have already met the following people, DO NOT generate similar names or same occupations:\n${existingContacts.map(c => `- ${c.name} (${c.occupation})`).join('\n')}\n`
                : '';

            const messages = [
                { role: 'system', content: CAFE_CONTACT_EVENT_PROMPT(state.language, state.player.gender) + contextInfo },
                { role: 'user', content: generateEventPrompt(state, { location: 'cafe', type: 'social' }) }
            ];

            // @ts-ignore
            const data = await llmService.generateJSON<any>(messages); // Use any to parse newContact

            if (data) {
                // Ensure newContact data is robust; fallback if missing
                let contactData = data.newContact;
                if (!contactData || !contactData.name) {
                    // Fallback generation - use opposite gender
                    const oppositeGender = state.player.gender === 'male' ? 'female' : 'male';
                    contactData = generateRandomContact(`npc_${Date.now()}`, oppositeGender);
                } else {
                    // Start with base random contact to get things like Avatar etc, then override with LLM data
                    const gender = contactData.gender?.toLowerCase() === 'female' ? 'female' : 'male';
                    const baseContact = generateRandomContact(`npc_${Date.now()}`, gender, {
                        ...contactData,
                        // Ensure we map LLM fields to our internal structure if needed
                    });

                    // Merge just in case
                    contactData = { ...baseContact, ...contactData, attributes: { ...baseContact.attributes, ...contactData } };

                    // Re-construct the full contact object properly
                    // Since generateRandomContact returns a full object, we should use that but with overrides from LLM.
                    // The `overrides` argument in generateRandomContact was added for this specific purpose.
                    // Let's call it cleanly:
                    contactData = generateRandomContact(`npc_${Date.now()}`, gender, {
                        name: contactData.name,
                        age: contactData.age,
                        occupation: contactData.occupation,
                        personality: contactData.personality,
                        wealthDesc: contactData.wealthDesc,
                        appearanceDesc: contactData.appearanceDesc,
                        status: contactData.status,
                        // If LLM returned number values for wealth/appearance, use them, otherwise they are generated by helper
                    });
                }

                return {
                    id: `cafe_contact_${Date.now()}`,
                    title: data.title,
                    narration: data.narration,
                    choices: data.choices,
                    newContact: contactData
                };
            }
        } else {
            // 20% Standard event (coffee spill etc)
            return this.generateFromSituation(state, { id: 'cafe_accident', type: 'accident', description: 'A quiet day at the cafe.' });
        }
        return null;
    }

    async generateSpecificEvent(state: GameState, eventId: string): Promise<GameEvent | null> {
        // Map ID to a situation object or specialized prompt
        // For elena_date_1:
        if (eventId === 'elena_date_1') {
            const situation = {
                id: eventId,
                type: 'romance',
                intensity: 3,
                description: 'A romantic dinner date with Elena at a fancy restaurant. Discussing the future.'
            };
            return this.generateFromSituation(state, situation);
        }
        return null;
    }

    private async generateFromSituation(state: GameState, situation: any): Promise<GameEvent | null> {
        let situationContext = situation;

        // Dynamic Encounter Generation - use opposite gender
        if (situation.id === 'meet_stranger') {
            const oppositeGender = state.player.gender === 'male' ? 'female' : 'male';
            const newContact = generateRandomContact(`npc_${Date.now()}`, oppositeGender);
            situationContext = {
                ...situation,
                description: `Met ${newContact.name}, a ${newContact.attributes.age} year old ${newContact.attributes.occupation}. ${newContact.attributes.personality}. Do you want to exchange contacts?`,
                newContact: newContact // Pass to event result
            };
        }

        const messages = [
            { role: 'system', content: EVENT_GENERATOR_SYSTEM_PROMPT(state.language) },
            { role: 'user', content: generateEventPrompt(state, situationContext) }
        ];

        // @ts-ignore
        const data = await llmService.generateJSON<GameEvent>(messages);

        if (data) {
            return {
                ...data,
                id: situation.id + '_' + Date.now(),
                characterId: situation.id.includes('elena') ? 'elena' : undefined,
                newContact: situationContext.newContact
            };
        }
        return null;
    }
}

export const eventEngine = new EventEngine();
