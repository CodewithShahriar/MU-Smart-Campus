import { create } from "zustand";
import { persist } from "zustand/middleware";
import Papa from "papaparse";
import type { ClassEntry, RoomInfo, Booking } from "./types";
import { parseRoutineCSV, parseRoomsCSV } from "./utils";

type EditPatch = Partial<Omit<ClassEntry, "id">>;

interface DataState {
  loaded: boolean;
  loading: boolean;
  error: string | null;
  baseRoutine: ClassEntry[];
  rooms: RoomInfo[];
  edits: Record<string, EditPatch>;
  bookings: Booking[];
  authed: boolean;
  facultyEmail: string | null;

  load: () => Promise<void>;
  editEntry: (id: string, patch: EditPatch) => void;
  addBooking: (b: Omit<Booking, "id" | "createdAt">) => Booking;
  removeBooking: (id: string) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

export const useData = create<DataState>()(
  persist(
    (set, get) => ({
      loaded: false,
      loading: false,
      error: null,
      baseRoutine: [],
      rooms: [],
      edits: {},
      bookings: [],
      authed: false,
      facultyEmail: null,

      load: async () => {
        if (get().loading || get().loaded) return;
        set({ loading: true, error: null });
        try {
          const [routineText, roomsText] = await Promise.all([
            fetch("/data/routine.csv").then((r) => r.text()),
            fetch("/data/rooms.csv").then((r) => r.text()),
          ]);
          const routineParsed = Papa.parse<Record<string, string>>(routineText, {
            header: true,
            skipEmptyLines: true,
          });
          const roomsParsed = Papa.parse<Record<string, string>>(roomsText, {
            header: true,
            skipEmptyLines: true,
          });
          set({
            baseRoutine: parseRoutineCSV(routineParsed.data),
            rooms: parseRoomsCSV(roomsParsed.data),
            loaded: true,
            loading: false,
          });
        } catch (e: any) {
          set({ error: e?.message || "Failed to load data", loading: false });
        }
      },

      editEntry: (id, patch) =>
        set((s) => ({ edits: { ...s.edits, [id]: { ...(s.edits[id] || {}), ...patch } } })),

      addBooking: (b) => {
        const booking: Booking = { ...b, id: `b-${Date.now()}`, createdAt: Date.now() };
        set((s) => ({ bookings: [...s.bookings, booking] }));
        return booking;
      },

      removeBooking: (id) => set((s) => ({ bookings: s.bookings.filter((x) => x.id !== id) })),

      login: (email, password) => {
        if (email.trim().toLowerCase() === "admin@gmail.com" && password === "123456") {
          set({ authed: true, facultyEmail: email });
          return true;
        }
        return false;
      },
      logout: () => set({ authed: false, facultyEmail: null }),
    }),
    {
      name: "musy-portal",
      partialize: (s) => ({ edits: s.edits, bookings: s.bookings, authed: s.authed, facultyEmail: s.facultyEmail }),
    }
  )
);

/** Merged routine: base + edits + bookings-as-entries */
export function useMergedRoutine(): ClassEntry[] {
  const { baseRoutine, edits, bookings } = useData();
  const merged: ClassEntry[] = baseRoutine.map((e) => {
    const p = edits[e.id];
    return p ? { ...e, ...p } : e;
  });
  bookings.forEach((b) => {
    merged.push({
      id: b.id,
      day: b.day,
      department: "Booking",
      batch: "Reserved",
      section: "-",
      time: b.time,
      course: b.course,
      room: b.room,
      faculty: b.faculty,
      isBooking: true,
    });
  });
  return merged;
}
