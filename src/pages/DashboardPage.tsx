import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Attendee, Seminar } from '@shared/types';
import { formatISO } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Search, UserCheck, UserX, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';
export function DashboardPage() {
  const { seminars, attendeesBySeminar, fetchSeminars, fetchAttendees, checkInAttendee } = useAppStore();
  const [roomNumber, setRoomNumber] = useState('');
  const [filterSeminarId, setFilterSeminarId] = useState('all');
  const [foundAttendee, setFoundAttendee] = useState<Attendee | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  useEffect(() => {
    const loadData = async () => {
      const fetchedSeminars = await fetchSeminars();
      // After fetching seminars, fetch attendees for all of them
      // In a real app with many seminars, this might be optimized
      fetchedSeminars.forEach(seminar => fetchAttendees(seminar.id));
    };
    loadData();
  }, [fetchSeminars, fetchAttendees]);
  const allAttendees = useMemo(() => {
    return Object.values(attendeesBySeminar).flat();
  }, [attendeesBySeminar]);
  const todayStr = formatISO(new Date(), { representation: 'date' });
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim()) return;
    const attendee = allAttendees.find(a => a.roomNumber === roomNumber.trim());
    if (attendee) {
      setFoundAttendee(attendee);
      setIsConfirmModalOpen(true);
    } else {
      toast.error('Room number not found.');
    }
  };
  const handleConfirmBreakfast = async () => {
    if (!foundAttendee) return;
    setIsCheckingIn(true);
    const result = await checkInAttendee(foundAttendee.id);
    if (result) {
      toast.success(`${result.fullName} checked in successfully!`);
      setIsConfirmModalOpen(false);
      setFoundAttendee(null);
      setRoomNumber('');
    } else {
      toast.error('Failed to check in attendee. Please try again.');
    }
    setIsCheckingIn(false);
  };
  const filteredAttendees = useMemo(() => {
    if (filterSeminarId === 'all') {
      return allAttendees;
    }
    return allAttendees.filter(a => a.seminarId === filterSeminarId);
  }, [allAttendees, filterSeminarId]);
  const servedAttendees = filteredAttendees.filter(a => a.breakfastStatus[todayStr]);
  const pendingAttendees = filteredAttendees.filter(a => !a.breakfastStatus[todayStr]);
  const getSeminarName = (seminarId: string) => {
    return seminars.find(s => s.id === seminarId)?.name || 'Unknown Seminar';
  };
  return (
    <div className="space-y-8 animate-fade-in">
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold text-[hsl(236,61%,30%)]">
            <Search className="w-6 h-6" />
            Breakfast Check-in
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              type="text"
              placeholder="Enter Room Number..."
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="text-lg p-6"
            />
            <Button type="submit" size="lg" className="bg-[hsl(45,74%,56%)] hover:bg-[hsl(45,74%,61%)] text-black font-bold text-lg px-8">
              Find
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Select value={filterSeminarId} onValueChange={setFilterSeminarId}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Filter by seminar..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Seminars</SelectItem>
            {seminars.map(seminar => (
              <SelectItem key={seminar.id} value={seminar.id}>
                {seminar.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-green-600">
              <UserCheck />
              Served ({servedAttendees.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Seminar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servedAttendees.map(attendee => (
                    <TableRow key={attendee.id}>
                      <TableCell className="font-medium">{attendee.fullName}</TableCell>
                      <TableCell>{attendee.roomNumber}</TableCell>
                      <TableCell>{getSeminarName(attendee.seminarId)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-red-600">
              <UserX />
              Pending ({pendingAttendees.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Seminar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingAttendees.map(attendee => (
                    <TableRow key={attendee.id}>
                      <TableCell className="font-medium">{attendee.fullName}</TableCell>
                      <TableCell>{attendee.roomNumber}</TableCell>
                      <TableCell>{getSeminarName(attendee.seminarId)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">Confirm Breakfast</DialogTitle>
            <DialogDescription>
              Please confirm the details before marking breakfast as taken.
            </DialogDescription>
          </DialogHeader>
          {foundAttendee && (
            <div className="space-y-4 py-4">
              <div className="text-lg"><strong>Name:</strong> {foundAttendee.fullName}</div>
              <div className="text-lg"><strong>Room:</strong> {foundAttendee.roomNumber}</div>
              <div className="text-lg"><strong>Seminar:</strong> {getSeminarName(foundAttendee.seminarId)}</div>
              <div className="text-lg flex items-center">
                <strong>Status:</strong>
                {foundAttendee.breakfastStatus[todayStr] ? (
                  <span className="ml-2 flex items-center text-green-600"><CheckCircle className="w-5 h-5 mr-1" /> Already Served</span>
                ) : (
                  <span className="ml-2 flex items-center text-orange-500"><XCircle className="w-5 h-5 mr-1" /> Pending</span>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)} disabled={isCheckingIn}>Cancel</Button>
            <Button
              onClick={handleConfirmBreakfast}
              disabled={!!foundAttendee?.breakfastStatus[todayStr] || isCheckingIn}
              className="bg-[hsl(236,61%,30%)] hover:bg-[hsl(236,61%,35%)] text-white"
            >
              {isCheckingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isCheckingIn ? 'Confirming...' : 'Confirm Breakfast ✅'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster richColors />
    </div>
  );
}