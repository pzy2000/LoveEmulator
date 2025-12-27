import { create } from 'zustand';
import type { GameState, CharacterState } from '../engine/types';
import { actionSystem, ACTIONS } from '../engine/ActionSystem';
import { relationshipManager } from '../engine/RelationshipManager';
import { persistenceManager } from '../engine/PersistenceManager';
import { eventEngine } from '../engine/EventEngine';
import { dialogueManager } from '../engine/DialogueManager';
import { MALE_ROUTE_CHARACTERS, FEMALE_ROUTE_CHARACTERS } from '../data/characters';

const INITIAL_STATE: GameState = {
    isSetupComplete: false,
    player: {
        name: 'Player',
        gender: 'male', // Default, changed in setup
        avatar: '/default-avatar.png',
        resources: { money: 1000, energy: 100, health: 100, mood: 100 },
        stats: {
            charm: 10,
            intelligence: 10,
            strength: 10,
            fitness: 10,
            communication: 10,
            reputation: 50
        },
        relationships: {},
        title: 'Love Novice', // Default title changed from Lecturer to Love Novice as requested
        dailyChatUsed: false
    },
    // @ts-ignore
    characters: {}, // Empty initially, filled in setup
    world: {
        week: 1,
        day: 0,
        timeSlot: 'morning',
        location: 'home',
        globalFlags: {}
    },
    log: [],
    language: 'zh' // Default Chinese
};

interface GameStore extends GameState {
    initializeGame: (name: string, gender: 'male' | 'female') => void;
    setPlayerName: (name: string) => void;
    performAction: (actionId: string) => void;
    addLog: (text: string) => void;
    updateRelationship: (characterId: string, choice: any) => void;
    startDialogue: (characterId: string) => void;
    updateActiveDialogue: (dialogue: any) => void;
    closeDialogue: () => void;
    setLocation: (locId: string) => void;
    saveGame: () => void;
    loadGame: () => void;
    resetGame: () => void;
    setEvent: (event: any) => void;
    addCharacter: (character: CharacterState) => void;
    setLanguage: (lang: 'en' | 'zh') => void;
    handleEventOutcome: (outcome: any) => void;
    showNotification: (text: string, duration?: number, type?: 'info' | 'success' | 'error') => void;
    hideNotification: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
    ...INITIAL_STATE,
    showNotification: (text, duration = 3000, type = 'info') => {
        set({ notification: { text, duration, type } });
        setTimeout(() => {
            // Only clear if it's the same notification? Simple timeout is mostly fine for now.
            set({ notification: undefined });
        }, duration);
    },
    hideNotification: () => set({ notification: undefined }),
    initializeGame: (name, gender) => set((state) => {
        const characters = gender === 'male' ? MALE_ROUTE_CHARACTERS : FEMALE_ROUTE_CHARACTERS;
        return {
            isSetupComplete: true,
            characters: characters,
            player: { ...state.player, name, gender },
            // Reset world if needed, or keep default
        };
    }),
    setPlayerName: (name) => set((state) => ({ player: { ...state.player, name } })),
    performAction: (actionId) => {
        const state = get();
        if (actionSystem.canExecute(state, actionId)) {
            const newState = actionSystem.applyCost(state, actionId);
            set({
                player: newState.player,
                world: newState.world, // Update world (time/location)
                log: [...state.log, {
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                    text: `Performed action: ${actionId}`,
                    type: 'action'
                }]
            });

            // Check for Event Trigger
            const action = ACTIONS.find(a => a.id === actionId);
            if (action?.eventTrigger) {
                // Async event generation
                (async () => {
                    // Show loading modal
                    set({ isGeneratingEvent: true });

                    let event = null;
                    if (action.eventTrigger?.type === 'specific' && action.eventTrigger.id) {
                        event = await eventEngine.generateSpecificEvent(get(), action.eventTrigger.id);
                    } else {
                        // Random trigger forced?
                        // @ts-ignore
                        const chance = action.eventTrigger.guaranteed ? 1.0 : 0.3;
                        event = await eventEngine.triggerEvent(get(), chance);
                    }

                    // Hide loading modal
                    set({ isGeneratingEvent: false });

                    if (event) {
                        // Use the new action
                        get().setEvent(event);
                    }
                })();
            }

        } else {
            // Handle failure (not enough resources)
            console.log("Cannot execute action", actionId);
        }
    },
    addLog: (text) => set((state) => ({
        log: [...state.log, {
            id: Date.now().toString(),
            timestamp: Date.now(),
            text,
            type: 'event'
        }]
    })),
    updateRelationship: (characterId, choice) => set((state) => {
        return relationshipManager.updateRelationship(state, characterId, choice);
    }),
    startDialogue: (characterId) => {
        const state = get();
        if (state.player.dailyChatUsed) return;

        // Initial Greeting Choices
        const greetings = [
            { id: 'g_hi', text: 'Hi!', intent: 'friendly' },
            { id: 'g_how', text: 'How are you?', intent: 'friendly' },
            { id: 'g_flirt', text: 'You look great today.', intent: 'flirt' }
        ];

        set({
            player: { ...state.player, dailyChatUsed: true },
            activeDialogue: {
                characterId,
                messages: [],
                replyOptions: greetings,
                isOpen: true
            }
        });
    },
    updateActiveDialogue: (dialogue) => set({ activeDialogue: dialogue }),

    closeDialogue: () => {
        const state = get();
        // Capture context before closing
        const activeDialogue = state.activeDialogue;

        // Close UI Immediately
        set({ activeDialogue: undefined });

        // Run Background Summarization
        if (activeDialogue) {
            const charId = activeDialogue.characterId;
            const messages = activeDialogue.messages;

            if (messages.length >= 4) {
                (async () => {
                    // @ts-ignore
                    const summary = await dialogueManager.summarizeSession(state, messages);
                    if (summary) {
                        set(currentState => {
                            const rel = currentState.player.relationships[charId];
                            // @ts-ignore
                            const newMemories = [...(rel.memories || []), summary];
                            if (newMemories.length > 5) newMemories.shift();

                            return {
                                player: {
                                    ...currentState.player,
                                    relationships: {
                                        ...currentState.player.relationships,
                                        [charId]: { ...rel, memories: newMemories }
                                    }
                                }
                            };
                        });
                        // @ts-ignore
                        get().addLog(`Memory saved for ${state.characters[charId].name}`);
                        // get().showNotification(`Memory Saved: ${summary}`, 15000);
                        // Trigger auto-save to ensure persistence
                        get().saveGame();
                    } else {
                        // Failure Handling
                        get().showNotification('Memory Update Failed: AI Timeout or Error', 3000, 'error');
                        get().addLog('Memory summarization failed.');
                    }
                })();
            }
        }
    },
    setLocation: (locId) => set((state) => ({ world: { ...state.world, location: locId } })),

    // Persistence
    saveGame: () => {
        const state = get();
        persistenceManager.saveGame(state);
    },
    loadGame: () => {
        const savedLines = persistenceManager.loadGame();
        if (savedLines) {
            set(savedLines);
            // Re-initialize any services if needed
        }
    },
    resetGame: () => {
        persistenceManager.clearSave();
    },
    setEvent: (event) => set({ currentEvent: event }), // Just sets UI state

    // New action to handle event choices/outcomes
    handleEventOutcome: (_outcome: any) => set((_state) => {
        // Placeholder for generalized outcome handling
        // Real logic likely in App.tsx calling store actions, or here
        return {};
    }),

    addCharacter: (character: CharacterState) => set((state) => {
        // Initialize Relationship if not exists
        const newRel = {
            trust: 0,
            attraction: 0,
            comfort: 0,
            respect: 0,
            investment: 0,
            conflict: 0,
            status: 'acquaintance',
            history: [],
            memories: []
        };

        return {
            characters: { ...state.characters, [character.id]: character },
            player: {
                ...state.player,
                relationships: {
                    ...state.player.relationships,
                    // @ts-ignore
                    [character.id]: state.player.relationships[character.id] || newRel
                }
            }
        };
    }),

    setLanguage: (lang) => set({ language: lang })
}));
