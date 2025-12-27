import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { TEXTS } from '../data/locales';
import { MALE_NAMES, FEMALE_NAMES } from '../data/names';

export const SetupModal: React.FC = () => {
    const { initializeGame, language } = useGameStore();
    const [step, setStep] = useState<'gender' | 'name'>('gender');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [name, setName] = useState('');
    const t = TEXTS[language].setup;

    const handleGenderSelect = (g: 'male' | 'female') => {
        setGender(g);
        setStep('name');
        // Pre-fill valid name to encourage user
        generateRandomName(g);
    };

    const generateRandomName = (g: 'male' | 'female') => {
        const pool = g === 'male' ? MALE_NAMES : FEMALE_NAMES;
        const randomName = pool[Math.floor(Math.random() * pool.length)];
        setName(randomName);
    };

    const handleStart = () => {
        if (!name.trim()) return;
        initializeGame(name, gender);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content setup-modal">
                <h2>{t.welcome}</h2>

                {step === 'gender' && (
                    <div className="setup-step">
                        <h3>{t.choose_gender}</h3>
                        <div className="gender-options">
                            <button className="big-btn" onClick={() => handleGenderSelect('male')}>
                                👨 {t.i_am_male}
                            </button>
                            <button className="big-btn" onClick={() => handleGenderSelect('female')}>
                                👩 {t.i_am_female}
                            </button>
                        </div>
                    </div>
                )}

                {step === 'name' && (
                    <div className="setup-step">
                        <h3>{t.enter_name}</h3>
                        <div className="name-input-group">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t.placeholder_name}
                                className="name-input"
                            />
                            <button className="dice-btn" onClick={() => generateRandomName(gender)} title={t.random_name}>
                                🎲
                            </button>
                        </div>
                        <div className="setup-actions">
                            <button className="secondary-btn" onClick={() => setStep('gender')}>
                                ⬅
                            </button>
                            <button className="primary-btn" onClick={handleStart} disabled={!name}>
                                {t.start_game}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
