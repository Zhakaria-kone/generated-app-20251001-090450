import { z } from 'zod';
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface Seminar {
  id: string;
  name: string;
  organizer: string;
  startDate: string; // ISO 8601 string
  endDate: string; // ISO 8601 string
  room: string;
}
export interface Attendee {
  id: string;
  seminarId: string;
  fullName: string;
  roomNumber: string;
  // Key is date string 'YYYY-MM-DD', value is boolean
  breakfastStatus: Record<string, boolean>;
}
// Zod Schemas for validation
export const SeminarSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, { message: "Seminar name must be at least 3 characters long." }),
  organizer: z.string().min(2, { message: "Organizer name must be at least 2 characters long." }),
  startDate: z.preprocess((arg) => {
    if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
  }, z.date({
    required_error: "A start date is required.",
    invalid_type_error: "That's not a valid date!",
  })),
  endDate: z.preprocess((arg) => {
    if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
  }, z.date({
    required_error: "An end date is required.",
    invalid_type_error: "That's not a valid date!",
  })),
  room: z.string().min(1, { message: "Room assignment is required." }),
}).refine(data => data.endDate >= data.startDate, {
  message: "End date cannot be before start date.",
  path: ["endDate"],
});
export type SeminarFormValues = z.infer<typeof SeminarSchema>;
export const AttendeeSchema = z.object({
  id: z.string().optional(),
  seminarId: z.string(),
  fullName: z.string().min(2, { message: "Full name is required." }),
  roomNumber: z.string().min(1, { message: "Room number is required." }),
});
export type AttendeeFormValues = z.infer<typeof AttendeeSchema>;
export const BulkAttendeeSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required." }),
  roomNumber: z.string().min(1, { message: "Room number is required." }),
});
export type BulkAttendee = z.infer<typeof BulkAttendeeSchema>;