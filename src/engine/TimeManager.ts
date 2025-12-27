import type { WorldState } from './types';

export const TIME_SLOTS = ['morning', 'afternoon', 'evening', 'night'] as const;
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export class TimeManager {
    advanceTime(world: WorldState, slots: number = 1): WorldState {
        let { timeSlot, day, week } = world;
        let currentSlotIndex = TIME_SLOTS.indexOf(timeSlot);

        for (let i = 0; i < slots; i++) {
            currentSlotIndex++;
            if (currentSlotIndex >= TIME_SLOTS.length) {
                currentSlotIndex = 0;
                day++;
                if (day >= 7) {
                    day = 0;
                    week++;
                }
            }
        }

        return {
            ...world,
            timeSlot: TIME_SLOTS[currentSlotIndex],
            day,
            week
        };
    }

    getFormattedTime(world: WorldState): string {
        return `Week ${world.week} | ${DAYS[world.day]} - ${world.timeSlot.toUpperCase()}`;
    }
}

export const timeManager = new TimeManager();
