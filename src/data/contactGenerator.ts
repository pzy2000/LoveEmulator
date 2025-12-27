import type { CharacterState } from '../engine/types';
import { MALE_NAMES, FEMALE_NAMES } from './names';
import { FALLBACK_DATA } from './fallbackData';

export const generateRandomContact = (
    id: string,
    gender: 'male' | 'female',
    overrides: Partial<CharacterState['attributes']> & { name?: string, wealthDesc?: string, appearanceDesc?: string } = {}
): CharacterState => {
    const names = gender === 'male' ? MALE_NAMES : FEMALE_NAMES;
    const randomName = overrides.name || names[Math.floor(Math.random() * names.length)];

    // Helper to get random item from array
    const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

    const age = overrides.age || getRandom(FALLBACK_DATA.ages);
    const occupation = overrides.occupation || getRandom(FALLBACK_DATA.occupations);
    const personality = overrides.personality || getRandom(FALLBACK_DATA.personalities);
    const wealthDesc = getRandom(FALLBACK_DATA.wealthLevels);
    const appearanceDesc = getRandom(FALLBACK_DATA.appearanceFeatures);
    const status = overrides.status || getRandom(FALLBACK_DATA.statuses);

    // Calculate numeric stats based on descriptions (simple heuristic or random)
    const wealthVal = overrides.wealth ?? Math.floor(Math.random() * 100);
    const appearanceVal = overrides.appearance ?? Math.floor(Math.random() * 100);

    // Avatar Pools - In a real app these would be real files
    const MALE_AVATARS = ['/lucas_v2.png', '/male_1.png', '/default-avatar.png'];
    const FEMALE_AVATARS = ['/elena_v2.png', '/female_1.png', '/default-avatar.png'];

    const avatarPool = gender === 'male' ? MALE_AVATARS : FEMALE_AVATARS;
    const avatar = avatarPool[Math.floor(Math.random() * avatarPool.length)];

    const bio = `A ${age} year old ${occupation}. ${personality}. Wealth: ${wealthDesc}, Appearance: ${appearanceDesc}. Status: ${status}.`;

    return {
        id,
        name: randomName,
        avatar,
        bio,
        age,
        attributes: {
            wealth: wealthVal,
            appearance: appearanceVal,
            personality,
            status,
            age,
            occupation,
            // @ts-ignore
            wealthDesc, // Store description primarily for display if needed
            appearanceDesc
        },
        persona: `${personality}, ${occupation}, Status: ${status}.`,
        preferences: {
            likes: ['food', 'travel'],
            dislikes: ['rudeness'],
            turnOns: ['charm', 'wealth'],
            turnOffs: ['bad hygiene']
        },
        schedule: {}
    };
};
