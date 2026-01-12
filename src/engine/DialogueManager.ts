import type { GameState } from './types';
import { llmService } from '../services/LLMService';
import { DIALOGUE_GENERATOR_SYSTEM_PROMPT, MEMORY_SUMMARIZER_PROMPT } from '../services/PromptTemplates';

export interface DialogueResponse {
    text: string;
    internal_reaction?: string;
    updates?: {
        trust?: number;
        comfort?: number;
        attraction?: number;
        respect?: number;
        investment?: number;
        conflict?: number;
    };
    choices?: Array<{ id: string, text: string, intent: string }>;
}

export class DialogueManager {
    async generateReply(state: GameState, userMessage: string): Promise<DialogueResponse | null> {
        if (!state.activeDialogue) return null;

        const charId = state.activeDialogue.characterId;
        const character = state.characters[charId];
        if (!character) return null;

        // Construct Dialogue History Context
        const conversationHistory = state.activeDialogue.messages.slice(-5).map(m =>
            `${m.role.toUpperCase()}: ${m.content}`
        ).join('\n');

        const rel = state.player.relationships[charId];

        // 1. Build Base System Prompt with Character & Relationships
        let systemPrompt = DIALOGUE_GENERATOR_SYSTEM_PROMPT(state.language)
            .replace('{characterName}', character.name)
            .replace('{characterBio}', character.bio)
            .replace('{characterPersona}', character.persona)
            .replace('{wealth}', character.attributes?.wealth?.toString() || '50')
            .replace('{appearance}', character.attributes?.appearance?.toString() || '50')
            .replace('{status}', character.attributes?.status || 'Unknown')
            .replace('{age}', character.attributes?.age?.toString() || 'Unknown')
            .replace('{occupation}', character.attributes?.occupation || 'Unknown')
            // Relationships
            .replace('{relationStatus}', rel?.status || 'stranger')
            .replace('{trust}', rel?.trust?.toString() || '0')
            .replace('{attraction}', rel?.attraction?.toString() || '0')
            .replace('{mood}', '80')
            // Injection Point: Memories
            .replace('{pastMemories}', (rel?.memories || []).join('\n- ') || 'None');

        // Debug Log
        console.log(`[DialogueManager] Injecting Memories for ${character.name}:`, rel?.memories || []);

        // 2. Complete Prompt with Player Context
        systemPrompt = systemPrompt
            .replace('{playerName}', state.player.name)
            .replace('{playerTitle}', state.player.title)
            .replace('{playerGender}', state.player.gender) + `\n
            
            Recent Conversation History:
            ${conversationHistory}
            
            The user just said: "${userMessage}"
            `;

        const messages = [
            { role: 'system' as const, content: systemPrompt },
            // Include recent messages in the array structure as well for robustness
            ...state.activeDialogue.messages,
            { role: 'user' as const, content: userMessage }
        ];

        // @ts-ignore
        const responseCallback = await llmService.generateJSON<DialogueResponse>(messages);

        return responseCallback;
    }

    async summarizeSession(state: GameState, messages: any[]): Promise<string | null> {
        if (messages.length < 4) return null; // Too short to summarize

        const system = MEMORY_SUMMARIZER_PROMPT(state.language);
        const transcript = messages.map(m => `${m.role === 'user' ? 'User' : 'Char'}: ${m.content}`).join('\n');

        const prompt = [
            { role: 'system' as const, content: system },
            { role: 'user' as const, content: transcript }
        ];

        // @ts-ignore
        const summary = await llmService.generateCompletion(prompt);
        return summary;
    }
}

export const dialogueManager = new DialogueManager();
