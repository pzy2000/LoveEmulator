import { useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { ActionGrid } from './components/ActionGrid';
import { EventModal } from './components/EventModal';
import { llmService } from './services/LLMService';
import { CharacterList } from './components/CharacterList';
import { DialogueView } from './components/DialogueView';
import { LocationSelector } from './components/LocationSelector';
import { DebugPanel } from './components/DebugPanel';
import { eventEngine, type EventChoice } from './engine/EventEngine';
import { persistenceManager } from './engine/PersistenceManager';
import { useGameStore } from './store/useGameStore';
import { TEXTS } from './data/locales';
import { SetupModal } from './components/SetupModal';
import { EventLoadingModal } from './components/EventLoadingModal';
import './index.css';

function App() {
  // Use global event state
  const currentEvent = useGameStore(state => state.currentEvent);
  const isSetupComplete = useGameStore(state => state.isSetupComplete);
  const setEvent = useGameStore(state => state.setEvent);
  const language = useGameStore(state => state.language);
  const notification = useGameStore(state => state.notification);

  useEffect(() => {
    // Initialize AI Service
    llmService.initialize();
    // Try load game
    try {
      const saved = persistenceManager.loadGame();
      if (saved) {
        useGameStore.setState(saved);
        console.log("Game loaded.");
      }
    } catch (e) {
      console.error("Failed to load save file. Corrupted?", e);
      persistenceManager.clearSave();
    }
  }, []);



  // Actually, let's just add a dedicated action to the store for updating relationships or replacing state.
  // For now, I'll access the store's set state via a new method in useGameStore or just direct manipulation if I export the setter.
  // Ideally, useGameStore should have `updateRelationship(charId, choice)`.

  const updateRelationship = useGameStore(state => state.updateRelationship);

  const handleChoiceValues = (choice: EventChoice) => {
    console.log("Player chose:", choice);

    // 1. Handle Recruitment
    // @ts-ignore
    if (currentEvent?.newContact) {
      if (choice.intent === 'flirt' || choice.intent === 'friendly' || choice.intent === 'honest') {
        // @ts-ignore
        useGameStore.getState().addCharacter(currentEvent.newContact);
        useGameStore.getState().addLog(`You exchanged contacts with ${currentEvent.newContact.name}!`);
      }
    }

    // 2. Handle Relationship Updates for existing chars
    if (currentEvent && currentEvent.characterId) {
      updateRelationship(currentEvent.characterId, choice);
    }

    // 3. Apply Dynamic Effects (Resources & Stats)
    if (choice.effects) {
      const { resources, stats } = choice.effects;
      const state = useGameStore.getState();
      // @ts-ignore
      if (resources) {
        // @ts-ignore
        const newResources = { ...state.player.resources };
        // @ts-ignore
        Object.entries(resources).forEach(([k, v]) => {
          // @ts-ignore
          newResources[k] = (newResources[k] || 0) + v;
        });
        // @ts-ignore
        useGameStore.setState({ player: { ...state.player, resources: newResources } });
      }
      // @ts-ignore
      if (stats) {
        // @ts-ignore
        const newStats = { ...state.player.stats };
        // @ts-ignore
        Object.entries(stats).forEach(([k, v]) => {
          // @ts-ignore
          newStats[k] = (newStats[k] || 0) + v;
        });
        // @ts-ignore
        useGameStore.setState({ player: { ...state.player, stats: newStats } });
      }

      // Log effects
      // @ts-ignore
      const effectText = [];
      // @ts-ignore
      if (resources) effectText.push(JSON.stringify(resources));
      // @ts-ignore
      if (stats) effectText.push(JSON.stringify(stats));
      if (effectText.length > 0) useGameStore.getState().addLog(`Effects: ${effectText.join(', ')}`);
    }

    setEvent(null);

    // 4. Check for Chain Event (Async)
    const checkChainEvent = async () => {
      useGameStore.setState({ isGeneratingEvent: true });
      // Small delay to make it feel natural or let UI update
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        const followUp = await eventEngine.handleEventChoice(currentEvent, choice, useGameStore.getState());
        if (followUp) {
          setEvent(followUp);
          useGameStore.getState().addLog("Something else is happening...");
        }
      } catch (error) {
        console.error("Chain event generation failed:", error);
      } finally {
        useGameStore.setState({ isGeneratingEvent: false });
      }
    };

    // Trigger chain check without awaiting it to block the UI immediately, 
    // but we setEvent(null) above so modal closes.
    // Actually, if we want to seamless transition, we shouldn't close modal if chain is coming?
    // But we don't know if chain is coming. 
    // UX decision: Close current event. Show loading. Open next event.
    checkChainEvent();
  };

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="header-left">
          <h1>Love Emulator <span className="version">v0.4</span></h1>
        </div>
        <div className="header-controls">
          <button onClick={() => useGameStore.getState().setLanguage(language === 'en' ? 'zh' : 'en')}>
            {language === 'en' ? '🇨🇳 中文' : '🇺🇸 English'}
          </button>
          <button onClick={() => useGameStore.getState().saveGame()}>{TEXTS[language].ui.save}</button>
          <button onClick={() => useGameStore.getState().resetGame()}>{TEXTS[language].ui.reset}</button>
        </div>
      </header>

      <main className="game-stage">
        <Dashboard />

        <div className="main-content-grid">
          <div className="interaction-area">
            <LocationSelector />
            <ActionGrid />
          </div>

          <aside className="sidebar">
            <CharacterList />
          </aside>
        </div>

        {/* Log View could go here */}
      </main>

      {currentEvent && (
        <EventModal
          event={currentEvent}
          onChoice={handleChoiceValues}
        />
      )}

      <DialogueView />

      {!isSetupComplete && <SetupModal />}

      <DebugPanel />

      {/* Event Loading Modal */}
      <EventLoadingModal />

      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast ${notification.type === 'error' ? 'error' : ''}`}>
          {notification.text}
        </div>
      )}
    </div>
  );
}

export default App;
