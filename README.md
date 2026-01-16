# Love Emulator 💕

[English](#english) | [中文](./README_CN.md)

<div id="english"></div>

## Overview

**Love Emulator** is an AI-driven dating and social simulation game that transforms the mysterious process of dating into a computable life system. Set in Shanghai, players progress from social anxiety to becoming a "social master," ultimately achieving long-term commitment with a top-tier partner.

The game combines realistic constraints (time, money, emotions) with absurd events (misunderstandings, social drama, coincidences) to create a unique blend of realism and comedy.

## 🎮 Game Features

### Resource Management System
- **Hard Resources**: Time, money, energy/health, city transportation costs
- **Soft Resources**: Appearance, communication skills, emotional stability, reputation, boundaries

### Dynamic Character System
Each NPC has multidimensional relationship parameters:
- `attraction` - Physical and personality compatibility
- `trust` - Reliability perception (most important)
- `comfort` - Ease of interaction
- `respect` - Boundary respect
- `investment` - Willingness to contribute
- `conflict_meter` - Accumulated tension
- `availability` - Schedule and availability

### AI-Driven Events & Dialogue
- **Two-Stage Generation**: Structured event framework + AI narrative generation
- **Safety Validation**: Consent-based boundaries and content filtering
- **Intent-Based Resolution**: Actions tagged with intent, resolved by game engine
- **Deterministic Outcomes**: Reproducible gameplay with RNG seeds

### Multiple Endings
- **Pure Love**: Low drama, high trust
- **Playboy**: High social influence, high risk, high cost
- **Self-Growth**: Become a better person, relationships as byproduct
- **Disaster**: Reputation collapse, social circle blacklisting, emotional breakdown

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/LoveEmulator.git
cd LoveEmulator

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
npm run build
npm run preview
```

## 🏗️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **State Management**: Zustand
- **Animation**: Framer Motion
- **UI Components**: Lucide React
- **Build Tool**: Vite
- **AI Integration**: OpenAI API

## 📂 Project Structure

```
LoveEmulator/
├── src/
│   ├── components/         # UI components
│   │   ├── ActionGrid.tsx
│   │   ├── CharacterList.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DialogueView.tsx
│   │   └── ...
│   ├── engine/            # Game engine
│   │   ├── ActionSystem.ts
│   │   ├── EventEngine.ts
│   │   ├── DialogueManager.ts
│   │   ├── RelationshipManager.ts
│   │   └── types.ts
│   ├── data/              # Game data
│   │   ├── characters.ts
│   │   ├── locales.ts
│   │   └── fallbackData.ts
│   ├── services/          # External services
│   └── store/             # State management
├── design.md              # Design documentation
└── package.json
```

## 🎯 Game Mechanics

### Core Loop
1. **Choose Action** → Dating, self-improvement, socializing, working, resting
2. **Resource Changes** → Money, energy, appearance, communication, reputation
3. **Trigger Events** → Random + conditional + event chains
4. **Relationship Changes** → Trust, comfort, respect, investment, conflict
5. **Unlock Progression** → Social circles, resources, higher-tier partners
6. **Repeat & Accelerate**

### Action Types
- **Self-Improvement**: Fitness, fashion, communication training
- **Resource Accumulation**: Work, side hustles, networking
- **Relationship Building**: Dating, deep conversations, meeting friends/family
- **Risk Behaviors**: Multi-dating (reputation risk), public vs private relationships

### Social Circles & Locations
Shanghai-themed location system with entry requirements:
- Campus / Office / Gym / Music Festival / Gallery / High-end Restaurant / Friend Gatherings / Startup Events

Each location features:
- Entry threshold (money, appearance, social status, connections)
- Unique event pool
- Character appearance weights

## 🤖 AI Architecture

### Layered System
- **Engine Layer** (Deterministic): State progression, resource calculation, trigger conditions, probability sampling
- **AI Narrative Layer** (Generative): Event text, NPC dialogue, player options, atmosphere & humor
- **AI Validation Layer** (Constraint): Structure validation, consent boundaries, content filtering
- **Balance Layer** (Constraint): Value caps, risk penalties, event rarity control

### Event Generation Pipeline
1. Engine samples **situation skeleton** (event type, character, location, intensity, risk tags)
2. AI generates **narrative** (title, description, 2-4 player choices with intent tags)
3. **Validation** checks JSON structure, safety, logical consistency
4. Engine **resolves** outcomes based on intent tags + relationship state + world state + RNG

## 🛠️ Development

### Environment Setup

Create a `.env` file in the project root:

```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_OPENAI_BASE_URL=https://api.openai.com/v1  # Optional: custom endpoint
```

### Running Tests

```bash
npm run lint
```

### Code Style

This project uses ESLint for code quality. Run linting before committing:

```bash
npm run lint
```

## 📝 Design Philosophy

**Love as a Computable System**: Transform the mystical dating process into a multi-objective optimization problem where you're always missing one resource (time/money/energy/charisma/boundaries/reputation/social circle/career/emotional stability).

**Realistic Constraints + Absurd Events**: Realism comes from constraints (money, time, emotions); absurdity comes from events (misunderstandings, love triangles, social media drama, coincidental encounters).

**NPCs as Subjects, Not Trophies**: Characters have preferences, boundaries, lives, and reactions. They update their judgment of you based on your behavior, especially **trust/safety**.

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Areas
- New character archetypes and dialogue
- Event scenarios and storylines
- UI/UX improvements
- AI prompt optimization
- Localization (additional languages)
- Bug fixes and performance improvements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by classic dating sims and life simulation games
- Special thanks to the open-source community

## 📬 Contact

- **Issues**: [GitHub Issues](https://github.com/yourusername/LoveEmulator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/LoveEmulator/discussions)

---

**[中文版 README](./README_CN.md)** | Made with ❤️ in Shanghai
