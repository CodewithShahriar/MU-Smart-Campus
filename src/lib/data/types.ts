export type ClassEntry = {
  id: string;
  day: string;
  department: string;
  batch: string;
  section: string;
  time: string;
  course: string;
  room: string;
  faculty: string;
  isBooking?: boolean;
};

export type RoomInfo = {
  number: string;
  type: string;
  capacity: string;
  primaryDept: string;
};

export type Booking = {
  id: string;
  day: string;
  time: string;
  room: string;
  course: string;
  faculty: string;
  createdAt: number;
};

export const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"] as const;
export const TIME_SLOTS = [
  "09:00 AM - 10:30 AM",
  "10:30 AM - 12:00 PM",
  "12:00 PM - 1:30 PM",
  "01:30 PM - 03:00 PM",
  "03:00 PM - 04:30 PM",
  "04:30 PM - 06:00 PM",
] as const;

export const DEPARTMENTS: { code: string; name: string }[] = [
  { code: "CSE", name: "Computer Science & Engineering" },
  { code: "EEE", name: "Electrical & Electronics Engg." },
  { code: "BBA", name: "Business Administration" },
  { code: "LAW", name: "Law" },
  { code: "SWE", name: "Software Engineering" },
  { code: "ENG", name: "English" },
  { code: "ECO", name: "Economics" },
  { code: "DSC", name: "Data Science" },
];

export const DEPT_NAME: Record<string, string> = Object.fromEntries(
  DEPARTMENTS.map((d) => [d.code, d.name])
);
