export interface PlayerState {
  name: string;
  avatar: string;
  resources: {
    money: number;
    energy: number; // 0-100
    health: number; // 0-100
    mood: number; // 0-100
  };
  stats: {
    charm: number;
    intelligence: number;
    strength: number; // Renamed/Added
    fitness: number;
    communication: number;
    reputation: number; // Global reputation
  };
  relationships: Record<string, RelationshipState>; // Character ID -> Relationship
  title: string; // Dynamic title
  gender: 'male' | 'female';
  dailyChatUsed: boolean;
}

export interface RelationshipState {
  trust: number;
  attraction: number;
  comfort: number;
  respect: number;
  investment: number;
  conflict: number;
  status: 'stranger' | 'acquaintance' | 'friend' | 'dating' | 'partner' | 'blocked';
  history: string[]; // Summary of key events
  memories: string[]; // Summary of past conversations
}

export interface CharacterAttributes {
  wealth: number; // 0-100
  appearance: number; // 0-100
  personality: string; // "Outgoing", "Shy", etc.
  status: string; // "Student", "CEO", etc.
  age: number;
  occupation: string;
}

export interface CharacterState {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  age: number; // Moved to root or keep in attributes? Let's keep in attributes for grouping
  attributes: CharacterAttributes;
  persona: string; // For AI steering
  preferences: {
    likes: string[];
    dislikes: string[];
    turnOns: string[];
    turnOffs: string[];
  };
  schedule: Record<string, string>; // Day -> Location
}

export interface WorldState {
  week: number;
  day: number; // 0-6 (Mon-Sun)
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
  location: string; // Current location ID
  globalFlags: Record<string, boolean>;
}

export interface GameState {
  isSetupComplete: boolean;
  player: PlayerState;
  characters: Record<string, CharacterState>;
  world: WorldState;
  log: LogEntry[];
  activeDialogue?: {
    characterId: string;
    messages: Array<{ role: 'user' | 'assistant' | 'system', content: string }>;
    replyOptions?: Array<{ id: string, text: string, intent: string }>;
    isOpen: boolean;
  };
  currentEvent?: any; // GameEvent type implies separate import or circular dependency, using any or simplified type
  isGeneratingEvent?: boolean; // Show loading modal during event generation
  language: 'en' | 'zh'; // 'en' (English) or 'zh' (Chinese)
  notification?: { text: string; duration: number; type?: 'info' | 'success' | 'error' };
}

export interface LogEntry {
  id: string;
  timestamp: number;
  text: string;
  type: 'event' | 'action' | 'dialogue';
}

export interface ActionDef {
  id: string;
  label: string;
  description: string;
  category: 'self' | 'work' | 'social' | 'risk' | 'health';
  cost: {
    energy?: number;
    money?: number;
    time?: number; // 1 = 1 slot (morning/afternoon/etc)
  };
  requirements?: {
    money?: number;
    energy?: number;
    locations?: string[]; // Allowed locations
  };
  eventTrigger?: {
    type: 'specific' | 'random_category';
    id?: string; // For specific
    category?: string; // For random
    guaranteed?: boolean;
  };
  effects: {
    resources?: Partial<PlayerState['resources']>;
    stats?: Partial<PlayerState['stats']>;
  };
}
