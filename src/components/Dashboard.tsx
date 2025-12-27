import React from 'react';
import { useGameStore } from '../store/useGameStore';

import { TEXTS } from '../data/locales';

export const Dashboard: React.FC = () => {
    const { player, world, language } = useGameStore();
    const { resources, stats } = player;
    const t = TEXTS[language];

    // Localize formatted time manually or update TimeManager
    // Updating TimeManager is cleaner but let's do it here for quick access to language state
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    // @ts-ignore
    const dayName = t.time[days[world.day]];
    // @ts-ignore
    const slotName = t.time[world.timeSlot];
    const formattedTime = `${t.ui.week} ${world.week} | ${dayName} - ${slotName}`; // Simplified format for i18n

    return (
        <div className="dashboard glass-panel">
            <div className="status-group">
                <div className="date-display">
                    {formattedTime}
                </div>
                <h2>{player.name === 'Player' && language === 'zh' ? t.player.default_name : player.name}</h2>
                <p className="title">{player.title === 'Lecturer' ? t.player.title_lecturer : player.title}</p>
            </div>

            <div className="stats-grid">
                <StatBar label={t.stats.money} value={resources.money} max={10000} color="#ffd700" />
                <StatBar label={t.stats.energy} value={resources.energy} max={100} color="#00ff00" />
                <StatBar label={t.stats.charm} value={stats.charm} max={100} color="#ff69b4" />
                <StatBar label={t.stats.reputation} value={stats.reputation} max={100} color="#87ceeb" />
            </div>

            <div className="time-display">
                <p>{t.ui.week} {world.week}</p>
                <p>{slotName}</p>
            </div>
        </div>
    );
};

const StatBar: React.FC<{ label: string; value: number; max: number; color: string }> = ({ label, value, max, color }) => (
    <div className="stat-item">
        <label>{label}</label>
        <div className="progress-bg">
            <div
                className="progress-fill"
                style={{ width: `${Math.min((value / max) * 100, 100)}% `, backgroundColor: color }}
            />
        </div>
        <span>{value}</span>
    </div>
);
