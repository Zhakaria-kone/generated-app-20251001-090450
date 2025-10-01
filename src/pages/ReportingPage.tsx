import { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { format, formatISO } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { exportToPDF, exportToExcel } from '@/lib/reporting';
import { Toaster, toast } from 'sonner';
interface ReportRow {
  fullName: string;
  roomNumber: string;
  status: 'Served' | 'Pending';
}
export function ReportingPage() {
  const { seminars, attendeesBySeminar, fetchSeminars, fetchAttendees } = useAppStore();
  const [selectedSeminarId, setSelectedSeminarId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  useEffect(() => {
    if (seminars.length === 0) {
      fetchSeminars();
    }
  }, [seminars.length, fetchSeminars]);
  useEffect(() => {
    if (selectedSeminarId) {
      fetchAttendees(selectedSeminarId);
    }
  }, [selectedSeminarId, fetchAttendees]);
  const handleGenerateReport = () => {
    if (!selectedSeminarId) {
      toast.warning('Please select a seminar.');
      return;
    }
    const attendees = attendeesBySeminar[selectedSeminarId] || [];
    const dateStr = formatISO(selectedDate, { representation: 'date' });
    const data = attendees.map(attendee => ({
      fullName: attendee.fullName,
      roomNumber: attendee.roomNumber,
      status: attendee.breakfastStatus[dateStr] ? 'Served' : 'Pending' as 'Served' | 'Pending',
    }));
    setReportData(data);
    toast.success('Report generated successfully.');
  };
  const selectedSeminar = useMemo(() => seminars.find(s => s.id === selectedSeminarId), [seminars, selectedSeminarId]);
  const handleExport = (format: 'pdf' | 'excel') => {
    if (reportData.length === 0 || !selectedSeminar) {
      toast.error('Please generate a report first.');
      return;
    }
    if (format === 'pdf') {
      exportToPDF(reportData, selectedSeminar, selectedDate);
    } else {
      exportToExcel(reportData, selectedSeminar, selectedDate);
    }
  };
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold">Reporting</h1>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>Select a seminar and date to generate an attendance report.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <label className="font-medium">Seminar</label>
              <Select onValueChange={setSelectedSeminarId} value={selectedSeminarId ?? undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a seminar" />
                </SelectTrigger>
                <SelectContent>
                  {seminars.map(seminar => (
                    <SelectItem key={seminar.id} value={seminar.id}>
                      {seminar.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="font-medium">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal', !selectedDate && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button onClick={handleGenerateReport} className="bg-[hsl(236,61%,30%)] hover:bg-[hsl(236,61%,35%)] text-white">
              <FileText className="mr-2 h-4 w-4" /> Generate Report
            </Button>
            <Button onClick={() => handleExport('pdf')} variant="outline" disabled={reportData.length === 0}>
              <Download className="mr-2 h-4 w-4" /> Export to PDF
            </Button>
            <Button onClick={() => handleExport('excel')} variant="outline" disabled={reportData.length === 0}>
              <Download className="mr-2 h-4 w-4" /> Export to Excel
            </Button>
            <Button variant="outline" onClick={() => window.print()} disabled={reportData.length === 0}>
              <Printer className="mr-2 h-4 w-4" /> Print List
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Report Preview</CardTitle>
          <CardDescription>
            {reportData.length > 0 ? `Showing ${reportData.length} records for ${selectedSeminar?.name} on ${format(selectedDate, 'PPP')}.` : 'Generate a report to see a preview.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reportData.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              Select options above to generate a report.
            </div>
          ) : (
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Room Number</TableHead>
                    <TableHead>Breakfast Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.fullName}</TableCell>
                      <TableCell>{row.roomNumber}</TableCell>
                      <TableCell className={cn(row.status === 'Served' ? 'text-green-600' : 'text-red-600')}>
                        {row.status}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <Toaster richColors />
    </div>
  );
}