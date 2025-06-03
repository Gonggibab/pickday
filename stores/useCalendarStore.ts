// stores/useCalendarStore.ts
import { create } from "zustand";

interface CalendarState {
  startDate: Date | null;
  endDate: Date | null;

  setPeriod: (start: Date | null, end: Date | null) => void;
  resetDates: () => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  startDate: null,
  endDate: null,

  setPeriod: (start, end) => set({ startDate: start, endDate: end }),
  resetDates: () => set({ startDate: null, endDate: null }),
}));
