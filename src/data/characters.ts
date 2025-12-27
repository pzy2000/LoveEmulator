import type { CharacterState } from '../engine/types';

export const MALE_ROUTE_CHARACTERS: Record<string, CharacterState> = {
    'char_1': {
        id: 'char_1',
        name: 'Elena',
        avatar: '/elena_v2.png',
        bio: 'A sophisticated art curator who values intellect and honesty.',
        age: 26,
        attributes: {
            wealth: 70, appearance: 90, personality: 'Sophisticated', status: 'High', age: 26, occupation: 'Art Curator'
        },
        persona: 'Intellectual, slightly distant, appreciates wit but hates superficiality.',
        preferences: {
            likes: ['art', 'coffee', 'honesty'],
            dislikes: ['loud noises', 'arrogance'],
            turnOns: ['deep conversation'],
            turnOffs: ['rude behavior']
        },
        schedule: {}
    }
};

export const FEMALE_ROUTE_CHARACTERS: Record<string, CharacterState> = {
    'char_4': {
        id: 'char_4',
        name: 'Lucas',
        avatar: '/lucas_v2.png',
        bio: 'A mysterious musician who plays at the local bar. introverted.',
        age: 24,
        attributes: {
            wealth: 40, appearance: 85, personality: 'Melancholic', status: 'Artist', age: 24, occupation: 'Musician'
        },
        persona: 'Quiet, poetic, deep thinker. Hard to get to know.',
        preferences: {
            likes: ['music', 'night', 'rain'],
            dislikes: ['crowds', 'daylight'],
            turnOns: ['passion'],
            turnOffs: ['superficiality']
        },
        schedule: {}
    }
};

export const INITIAL_CHARACTERS = MALE_ROUTE_CHARACTERS; // Default callback
