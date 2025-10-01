import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '@/stores/app-store';
import { Attendee, AttendeeFormValues, BulkAttendeeSchema } from '@shared/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PlusCircle, Upload, ArrowLeft, AlertCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { AttendeeForm } from '@/components/attendees/AttendeeForm';
import { DeleteAttendeeDialog } from '@/components/attendees/DeleteAttendeeDialog';
import { Toaster, toast } from 'sonner';
import * as XLSX from 'xlsx';
type ModalState = {
  type: 'create' | 'edit' | 'delete' | null;
  attendee: Attendee | null;
};
export function AttendeesPage() {
  const { seminarId } = useParams<{ seminarId: string }>();
  const { seminars, attendeesBySeminar, attendeesLoading, error, fetchSeminars, fetchAttendees, createAttendee, updateAttendee, deleteAttendee, bulkCreateAttendees } = useAppStore();
  const [modal, setModal] = useState<ModalState>({ type: null, attendee: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (seminars.length === 0) {
      fetchSeminars();
    }
    if (seminarId) {
      fetchAttendees(seminarId);
    }
  }, [seminarId, fetchAttendees, fetchSeminars, seminars.length]);
  const seminar = seminars.find(s => s.id === seminarId);
  const attendees = seminarId ? attendeesBySeminar[seminarId] || [] : [];
  const isLoading = seminarId ? attendeesLoading[seminarId] : false;
  const handleCloseModal = () => setModal({ type: null, attendee: null });
  const handleFormSubmit = async (data: AttendeeFormValues) => {
    if (!seminarId) return;
    setIsSubmitting(true);
    let success = false;
    if (modal.type === 'edit' && modal.attendee) {
      const result = await updateAttendee(modal.attendee.id, data);
      if (result) {
        toast.success(`Attendee "${result.fullName}" updated successfully.`);
        success = true;
      }
    } else {
      const result = await createAttendee(data);
      if (result) {
        toast.success(`Attendee "${result.fullName}" created successfully.`);
        success = true;
      }
    }
    if (success) {
      handleCloseModal();
    } else {
      toast.error('An error occurred. Please try again.');
    }
    setIsSubmitting(false);
  };
  const handleDeleteConfirm = async () => {
    if (modal.attendee) {
      setIsSubmitting(true);
      await deleteAttendee(modal.attendee);
      toast.success(`Attendee "${modal.attendee.fullName}" has been deleted.`);
      setIsSubmitting(false);
      handleCloseModal();
    }
  };
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !seminarId) return;
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        const parsedAttendees = json.map((row: any) => {
          const result = BulkAttendeeSchema.safeParse({
            fullName: row['Full Name'] || row['fullName'],
            roomNumber: String(row['Room Number'] || row['roomNumber']),
          });
          return result.success ? result.data : null;
        }).filter(Boolean);
        if (parsedAttendees.length > 0) {
          const result = await bulkCreateAttendees(seminarId, parsedAttendees as any);
          if (result) {
            toast.success(`${result.length} attendees imported successfully.`);
          } else {
            toast.error('Failed to import attendees.');
          }
        } else {
          toast.warning('No valid attendee data found in the file. Please check the format.');
        }
      } catch (err) {
        toast.error('Error processing Excel file. Make sure it has "Full Name" and "Room Number" columns.');
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };
  return (
    <div className="space-y-8 animate-fade-in">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx, .xls, .csv" />
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link to="/seminars">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Manage Attendees</h1>
          <p className="text-muted-foreground">{seminar ? seminar.name : <Skeleton className="h-5 w-48 mt-1" />}</p>
        </div>
      </div>
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Attendee List</CardTitle>
            <CardDescription>
              {isLoading ? 'Loading attendees...' : `A total of ${attendees.length} attendees.`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleImportClick} disabled={isImporting}>
              {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {isImporting ? 'Importing...' : 'Import Excel'}
            </Button>
            <Button onClick={() => setModal({ type: 'create', attendee: null })} className="bg-[hsl(236,61%,30%)] hover:bg-[hsl(236,61%,35%)] text-white">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Attendee
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}
          {!isLoading && error && (
            <div className="text-red-500 flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
              <AlertCircle className="h-5 w-5" />
              <p>Error fetching attendees: {error}</p>
            </div>
          )}
          {!isLoading && !error && attendees.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <p>No attendees have been added to this seminar yet.</p>
            </div>
          )}
          {!isLoading && !error && attendees.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Room Number</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendees.map(attendee => (
                  <TableRow key={attendee.id}>
                    <TableCell className="font-medium">{attendee.fullName}</TableCell>
                    <TableCell>{attendee.roomNumber}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setModal({ type: 'edit', attendee })}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setModal({ type: 'delete', attendee })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog open={modal.type === 'create' || modal.type === 'edit'} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{modal.type === 'edit' ? 'Edit Attendee' : 'Add New Attendee'}</DialogTitle>
            <DialogDescription>
              {modal.type === 'edit' ? 'Make changes to the attendee details here.' : 'Fill in the details for the new attendee.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {seminarId && (
              <AttendeeForm
                attendee={modal.attendee}
                seminarId={seminarId}
                onSubmit={handleFormSubmit}
                onCancel={handleCloseModal}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      <DeleteAttendeeDialog
        attendee={modal.attendee}
        isOpen={modal.type === 'delete'}
        onClose={handleCloseModal}
        onConfirm={handleDeleteConfirm}
        isDeleting={isSubmitting}
      />
      <Toaster richColors />
    </div>
  );
}