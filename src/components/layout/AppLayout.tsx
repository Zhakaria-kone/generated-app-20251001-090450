import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
const getTitleFromPath = (path: string): string => {
  if (path.startsWith('/seminars')) return 'Seminar Management';
  if (path.startsWith('/reporting')) return 'Reporting';
  return 'Dashboard & Check-in';
};
export function AppLayout() {
  const location = useLocation();
  const title = getTitleFromPath(location.pathname);
  return (
    <div className="flex min-h-screen w-full bg-gray-100/50 dark:bg-gray-900/50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header title={title} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-screen-2xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}