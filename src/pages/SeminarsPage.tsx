import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/stores/app-store';
import { Seminar, SeminarFormValues } from '@shared/types';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Users, Edit, Trash2, AlertCircle } from 'lucide-react';
import { SeminarForm } from '@/components/seminars/SeminarForm';
import { DeleteSeminarDialog } from '@/components/seminars/DeleteSeminarDialog';
import { Toaster, toast } from 'sonner';
type ModalState = {
  type: 'create' | 'edit' | 'delete' | null;
  seminar: Seminar | null;
};
export function SeminarsPage() {
  const { seminars, seminarsLoading, error, fetchSeminars, createSeminar, updateSeminar, deleteSeminar } = useAppStore();
  const [modal, setModal] = useState<ModalState>({ type: null, seminar: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    fetchSeminars();
  }, [fetchSeminars]);
  const handleFormSubmit = async (data: SeminarFormValues) => {
    setIsSubmitting(true);
    let success = false;
    if (modal.type === 'edit' && modal.seminar) {
      const result = await updateSeminar(modal.seminar.id, data);
      if (result) {
        toast.success(`Seminar "${result.name}" updated successfully.`);
        success = true;
      }
    } else {
      const result = await createSeminar(data);
      if (result) {
        toast.success(`Seminar "${result.name}" created successfully.`);
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
    if (modal.seminar) {
      setIsSubmitting(true);
      await deleteSeminar(modal.seminar.id);
      toast.success(`Seminar "${modal.seminar.name}" has been deleted.`);
      setIsSubmitting(false);
      handleCloseModal();
    }
  };
  const handleCloseModal = () => setModal({ type: null, seminar: null });
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Seminars</h1>
        <Button onClick={() => setModal({ type: 'create', seminar: null })} className="bg-[hsl(236,61%,30%)] hover:bg-[hsl(236,61%,35%)] text-white">
          <PlusCircle className="mr-2 h-4 w-4" /> Create Seminar
        </Button>
      </div>
      {seminarsLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-10 w-36" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-10" />
                  <Skeleton className="h-10 w-10" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      {!seminarsLoading && error && (
        <div className="text-red-500 flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
          <AlertCircle className="h-5 w-5" />
          <p>Error fetching seminars: {error}</p>
        </div>
      )}
      {!seminarsLoading && !error && seminars.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          <p>No seminars found. Get started by creating one!</p>
        </div>
      )}
      {!seminarsLoading && !error && seminars.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {seminars.map((seminar) => (
            <Card key={seminar.id} className="shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl text-[hsl(236,61%,30%)]">{seminar.name}</CardTitle>
                <CardDescription>{seminar.organizer}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Dates:</strong> {format(new Date(seminar.startDate), 'MMM d, yyyy')} - {format(new Date(seminar.endDate), 'MMM d, yyyy')}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Room:</strong> {seminar.room}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button asChild variant="outline" size="sm">
                  <Link to={`/seminars/${seminar.id}/attendees`}>
                    <Users className="mr-2 h-4 w-4" /> Manage Attendees
                  </Link>
                </Button>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setModal({ type: 'edit', seminar })}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setModal({ type: 'delete', seminar })}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={modal.type === 'create' || modal.type === 'edit'} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{modal.type === 'edit' ? 'Edit Seminar' : 'Create New Seminar'}</DialogTitle>
            <DialogDescription>
              {modal.type === 'edit' ? 'Make changes to your seminar here.' : 'Fill in the details for the new seminar.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <SeminarForm
              seminar={modal.seminar}
              onSubmit={handleFormSubmit}
              onCancel={handleCloseModal}
              isSubmitting={isSubmitting}
            />
          </div>
        </DialogContent>
      </Dialog>
      <DeleteSeminarDialog
        seminar={modal.seminar}
        isOpen={modal.type === 'delete'}
        onClose={handleCloseModal}
        onConfirm={handleDeleteConfirm}
        isDeleting={isSubmitting}
      />
      <Toaster richColors />
    </div>
  );
}