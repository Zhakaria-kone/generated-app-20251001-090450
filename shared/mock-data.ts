import { formatISO, subDays, addDays } from 'date-fns';
import type { Seminar, Attendee } from './types';
const today = new Date();
const todayStr = formatISO(today, { representation: 'date' });
const yesterdayStr = formatISO(subDays(today, 1), { representation: 'date' });
export const MOCK_SEMINARS: Seminar[] = [
  {
    id: 'seminar-1',
    name: 'Cloudflare Connect 2024',
    organizer: 'Cloudflare Inc.',
    startDate: formatISO(subDays(today, 1)),
    endDate: formatISO(addDays(today, 2)),
    room: 'Grand Ballroom',
  },
  {
    id: 'seminar-2',
    name: 'Future of AI Summit',
    organizer: 'Tech Innovators',
    startDate: formatISO(today),
    endDate: formatISO(addDays(today, 1)),
    room: 'Neptune',
  },
  {
    id: 'seminar-3',
    name: 'Digital Marketing World',
    organizer: 'Marketing Pro',
    startDate: formatISO(addDays(today, 5)),
    endDate: formatISO(addDays(today, 7)),
    room: 'Orion',
  },
];
export const MOCK_ATTENDEES: Attendee[] = [
  // Attendees for Seminar 1
  {
    id: 'attendee-101',
    seminarId: 'seminar-1',
    fullName: 'John Doe',
    roomNumber: '101',
    breakfastStatus: { [yesterdayStr]: true, [todayStr]: true },
  },
  {
    id: 'attendee-102',
    seminarId: 'seminar-1',
    fullName: 'Jane Smith',
    roomNumber: '102',
    breakfastStatus: { [yesterdayStr]: true, [todayStr]: false },
  },
  {
    id: 'attendee-103',
    seminarId: 'seminar-1',
    fullName: 'Peter Jones',
    roomNumber: '103',
    breakfastStatus: { [yesterdayStr]: true, [todayStr]: true },
  },
  {
    id: 'attendee-104',
    seminarId: 'seminar-1',
    fullName: 'Mary Williams',
    roomNumber: '104',
    breakfastStatus: { [yesterdayStr]: true, [todayStr]: false },
  },
  // Attendees for Seminar 2
  {
    id: 'attendee-201',
    seminarId: 'seminar-2',
    fullName: 'KOFFI Jean',
    roomNumber: '305',
    breakfastStatus: { [todayStr]: true },
  },
  {
    id: 'attendee-202',
    seminarId: 'seminar-2',
    fullName: 'David Brown',
    roomNumber: '306',
    breakfastStatus: { [todayStr]: false },
  },
  {
    id: 'attendee-203',
    seminarId: 'seminar-2',
    fullName: 'Susan Garcia',
    roomNumber: '307',
    breakfastStatus: { [todayStr]: false },
  },
  {
    id: 'attendee-204',
    seminarId: 'seminar-2',
    fullName: 'Michael Miller',
    roomNumber: '308',
    breakfastStatus: { [todayStr]: true },
  },
];