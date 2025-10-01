import { IndexedEntity } from "./core-utils";
import type { Seminar, Attendee } from "@shared/types";
import { MOCK_SEMINARS, MOCK_ATTENDEES } from "@shared/mock-data";
export class SeminarEntity extends IndexedEntity<Seminar> {
  static readonly entityName = "seminar";
  static readonly indexName = "seminars";
  static readonly initialState: Seminar = { id: "", name: "", organizer: "", startDate: "", endDate: "", room: "" };
  static seedData = MOCK_SEMINARS;
}
export class AttendeeEntity extends IndexedEntity<Attendee> {
  static readonly entityName = "attendee";
  static readonly indexName = "attendees";
  static readonly initialState: Attendee = { id: "", seminarId: "", fullName: "", roomNumber: "", breakfastStatus: {} };
  static seedData = MOCK_ATTENDEES;
  async markBreakfastTaken(date: string): Promise<Attendee> {
    return this.mutate(attendee => {
      const newStatus = { ...attendee.breakfastStatus, [date]: true };
      return { ...attendee, breakfastStatus: newStatus };
    });
  }
}