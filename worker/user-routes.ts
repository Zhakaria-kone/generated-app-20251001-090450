import { Hono } from "hono";
import { formatISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import type { Env } from './core-utils';
import { SeminarEntity, AttendeeEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import { Seminar, Attendee, BulkAttendee } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Ensure seed data is present on first load
  app.use('/api/*', async (c, next) => {
    await SeminarEntity.ensureSeed(c.env);
    await AttendeeEntity.ensureSeed(c.env);
    await next();
  });
  // --- SEMINAR ROUTES ---
  app.get('/api/seminars', async (c) => {
    const { items } = await SeminarEntity.list(c.env);
    return ok(c, items);
  });
  app.post('/api/seminars', async (c) => {
    const body = await c.req.json();
    const newSeminar: Seminar = {
      id: uuidv4(),
      name: body.name,
      organizer: body.organizer,
      startDate: body.startDate,
      endDate: body.endDate,
      room: body.room,
    };
    if (!isStr(newSeminar.name) || !isStr(newSeminar.organizer) || !isStr(newSeminar.room)) {
      return bad(c, 'Missing required seminar fields');
    }
    const created = await SeminarEntity.create(c.env, newSeminar);
    return ok(c, created);
  });
  app.put('/api/seminars/:id', async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'Invalid ID');
    const entity = new SeminarEntity(c.env, id);
    if (!(await entity.exists())) {
      return notFound(c, 'Seminar not found');
    }
    const body = await c.req.json();
    const updatedData: Partial<Seminar> = {
      name: body.name,
      organizer: body.organizer,
      startDate: body.startDate,
      endDate: body.endDate,
      room: body.room,
    };
    await entity.patch(updatedData);
    const updatedSeminar = await entity.getState();
    return ok(c, updatedSeminar);
  });
  app.delete('/api/seminars/:id', async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'Invalid ID');
    const deleted = await SeminarEntity.delete(c.env, id);
    if (!deleted) {
      return notFound(c, 'Seminar not found');
    }
    const { items: allAttendees } = await AttendeeEntity.list(c.env);
    const attendeesToDelete = allAttendees.filter(a => a.seminarId === id).map(a => a.id);
    if (attendeesToDelete.length > 0) {
      await AttendeeEntity.deleteMany(c.env, attendeesToDelete);
    }
    return ok(c, { id });
  });
  // --- ATTENDEE ROUTES ---
  app.get('/api/seminars/:id/attendees', async (c) => {
    const seminarId = c.req.param('id');
    if (!isStr(seminarId)) return bad(c, 'Invalid seminar ID');
    const { items: allAttendees } = await AttendeeEntity.list(c.env);
    const seminarAttendees = allAttendees.filter(a => a.seminarId === seminarId);
    return ok(c, seminarAttendees);
  });
  app.post('/api/attendees/:id/checkin', async (c) => {
    const attendeeId = c.req.param('id');
    if (!isStr(attendeeId)) return bad(c, 'Invalid attendee ID');
    const attendee = new AttendeeEntity(c.env, attendeeId);
    if (!(await attendee.exists())) {
      return notFound(c, 'Attendee not found');
    }
    const todayStr = formatISO(new Date(), { representation: 'date' });
    const updatedAttendee = await attendee.markBreakfastTaken(todayStr);
    return ok(c, updatedAttendee);
  });
  app.post('/api/attendees', async (c) => {
    const body = await c.req.json();
    const newAttendee: Attendee = {
      id: uuidv4(),
      seminarId: body.seminarId,
      fullName: body.fullName,
      roomNumber: body.roomNumber,
      breakfastStatus: {},
    };
    if (!isStr(newAttendee.seminarId) || !isStr(newAttendee.fullName) || !isStr(newAttendee.roomNumber)) {
      return bad(c, 'Missing required attendee fields');
    }
    const created = await AttendeeEntity.create(c.env, newAttendee);
    return ok(c, created);
  });
  app.post('/api/attendees/bulk', async (c) => {
    const body = await c.req.json<{ seminarId: string; attendees: BulkAttendee[] }>();
    const { seminarId, attendees } = body;
    if (!isStr(seminarId) || !Array.isArray(attendees)) {
      return bad(c, 'Invalid request body for bulk attendee creation');
    }
    const createdAttendees: Attendee[] = [];
    for (const attendeeData of attendees) {
      if (!isStr(attendeeData.fullName) || !isStr(String(attendeeData.roomNumber))) {
        // Skip invalid entries
        continue;
      }
      const newAttendee: Attendee = {
        id: uuidv4(),
        seminarId: seminarId,
        fullName: attendeeData.fullName,
        roomNumber: String(attendeeData.roomNumber),
        breakfastStatus: {},
      };
      const created = await AttendeeEntity.create(c.env, newAttendee);
      createdAttendees.push(created);
    }
    return ok(c, createdAttendees);
  });
  app.put('/api/attendees/:id', async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'Invalid ID');
    const entity = new AttendeeEntity(c.env, id);
    if (!(await entity.exists())) {
      return notFound(c, 'Attendee not found');
    }
    const body = await c.req.json();
    const updatedData: Partial<Attendee> = {
      fullName: body.fullName,
      roomNumber: body.roomNumber,
    };
    await entity.patch(updatedData);
    const updatedAttendee = await entity.getState();
    return ok(c, updatedAttendee);
  });
  app.delete('/api/attendees/:id', async (c) => {
    const id = c.req.param('id');
    if (!isStr(id)) return bad(c, 'Invalid ID');
    const deleted = await AttendeeEntity.delete(c.env, id);
    if (!deleted) {
      return notFound(c, 'Attendee not found');
    }
    return ok(c, { id });
  });
}