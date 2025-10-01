import { Outlet } from 'react-router-dom';
import { useTheme } from './hooks/use-theme';
import { Toaster } from '@/components/ui/sonner';
export function App() {
  // Initialize theme
  useTheme();
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}