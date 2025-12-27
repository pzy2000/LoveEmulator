import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { TEXTS } from '../data/locales';

export const LocationSelector: React.FC = () => {
    const { world, setLocation, language } = useGameStore();
    const t = TEXTS[language].locations;

    const LOCATIONS_LIST = [
        { id: 'home', ...t.home },
        { id: 'office', ...t.office, req: { energy: 10 } },
        { id: 'gym', ...t.gym },
        { id: 'cafe', ...t.cafe },
        { id: 'restaurant', ...t.restaurant },
        { id: 'shopping_mall', ...t.shopping_mall },
        { id: 'bar', ...t.bar },
        { id: 'park', ...t.park }
    ];

    return (
        <div className="location-panel glass-panel">
            <h3>{TEXTS[language].ui.current_location}: {LOCATIONS_LIST.find(l => l.id === world.location)?.name}</h3>
            <div className="location-list">
                {LOCATIONS_LIST.map(loc => (
                    <button
                        key={loc.id}
                        className={`loc-btn ${world.location === loc.id ? 'active' : ''}`}
                        onClick={() => setLocation(loc.id)}
                        title={loc.desc}
                    >
                        {loc.name}
                    </button>
                ))}
            </div>
        </div>
    );
};
