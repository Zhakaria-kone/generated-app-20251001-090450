import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import type { Seminar, Attendee } from '@shared/types';
interface ReportData {
  fullName: string;
  roomNumber: string;
  status: 'Served' | 'Pending';
}
export const exportToPDF = (reportData: ReportData[], seminar: Seminar, date: Date) => {
  const doc = new jsPDF();
  const title = `Breakfast Attendance Report`;
  const seminarName = `Seminar: ${seminar.name}`;
  const reportDate = `Date: ${format(date, 'MMMM d, yyyy')}`;
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(12);
  doc.text(seminarName, 14, 30);
  doc.text(reportDate, 14, 36);
  (doc as any).autoTable({
    startY: 42,
    head: [['Full Name', 'Room Number', 'Breakfast Status']],
    body: reportData.map(item => [item.fullName, item.roomNumber, item.status]),
    theme: 'striped',
    headStyles: { fillColor: [38, 50, 56] }, // hsl(236, 61%, 30%) approx
  });
  doc.save(`report_${seminar.name.replace(/\s/g, '_')}_${format(date, 'yyyy-MM-dd')}.pdf`);
};
export const exportToExcel = (reportData: ReportData[], seminar: Seminar, date: Date) => {
  const worksheet = XLSX.utils.json_to_sheet(reportData.map(item => ({
    'Full Name': item.fullName,
    'Room Number': item.roomNumber,
    'Breakfast Status': item.status,
  })));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
  XLSX.utils.sheet_add_aoa(worksheet, [
    [`Breakfast Attendance Report for ${seminar.name}`],
    [`Date: ${format(date, 'MMMM d, yyyy')}`],
    [], // Spacer row
  ], { origin: 'A1' });
  // Adjust column widths
  worksheet['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 20 }];
  XLSX.writeFile(workbook, `report_${seminar.name.replace(/\s/g, '_')}_${format(date, 'yyyy-MM-dd')}.xlsx`);
};