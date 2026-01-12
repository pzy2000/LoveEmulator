
import { relationshipManager } from '../src/engine/RelationshipManager';
import { GameState } from '../src/engine/types';

// Mock GameState
const mockState: GameState = {
    isSetupComplete: true,
    player: {
        name: 'Tester',
        avatar: '',
        resources: { money: 100, energy: 100, health: 100, mood: 100 },
        stats: { charm: 10, intelligence: 10, strength: 10, fitness: 10, communication: 10, reputation: 50 },
        relationships: {
            'char1': {
                trust: 50,
                comfort: 50,
                attraction: 50,
                respect: 50,
                investment: 0,
                conflict: 0,
                status: 'friend',
                history: [],
                memories: []
            }
        },
        title: 'Novice',
        gender: 'male',
        dailyChatUsed: false
    },
    characters: {},
    world: { week: 1, day: 1, timeSlot: 'morning', location: 'home', globalFlags: {} },
    log: [],
    language: 'en'
};

async function testRelationshipUpdates() {
    console.log('Running Relationship Update Tests...');

    // Test 1: Positive Update
    console.log('Test 1: Positive Update (Trust +10)');
    let newState = relationshipManager.applyAttributeUpdates(mockState, 'char1', { trust: 10 });
    let newTrust = newState.player.relationships['char1'].trust;
    if (newTrust === 60) console.log('PASS');
    else console.error(`FAIL: Expected 60, got ${newTrust}`);

    // Test 2: Negative Update
    console.log('Test 2: Negative Update (Comfort -20)');
    newState = relationshipManager.applyAttributeUpdates(mockState, 'char1', { comfort: -20 });
    let newComfort = newState.player.relationships['char1'].comfort;
    if (newComfort === 30) console.log('PASS');
    else console.error(`FAIL: Expected 30, got ${newComfort}`);

    // Test 3: Cap at 100
    console.log('Test 3: Cap at 100 (Attraction +100)');
    newState = relationshipManager.applyAttributeUpdates(mockState, 'char1', { attraction: 100 });
    let newAttraction = newState.player.relationships['char1'].attraction;
    if (newAttraction === 100) console.log('PASS');
    else console.error(`FAIL: Expected 100, got ${newAttraction}`);

    // Test 4: Floor at 0
    console.log('Test 4: Floor at 0 (Respect -100)');
    newState = relationshipManager.applyAttributeUpdates(mockState, 'char1', { respect: -100 });
    let newRespect = newState.player.relationships['char1'].respect;
    if (newRespect === 0) console.log('PASS');
    else console.error(`FAIL: Expected 0, got ${newRespect}`);

    console.log('Tests Complete.');
}

testRelationshipUpdates();
