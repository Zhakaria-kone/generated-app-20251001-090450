import { NavLink } from 'react-router-dom';
import { Home, Calendar, BarChart2, Hotel } from 'lucide-react';
import { cn } from '@/lib/utils';
const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/seminars', icon: Calendar, label: 'Seminars' },
  { to: '/reporting', icon: BarChart2, label: 'Reporting' },
];
export function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-gray-50 dark:bg-gray-900/50 border-r border-gray-200 dark:border-gray-800 p-4 space-y-8">
      <div className="flex items-center space-x-3 px-2">
        <div className="w-10 h-10 rounded-lg bg-[hsl(236,61%,30%)] flex items-center justify-center">
          <Hotel className="w-6 h-6 text-[hsl(45,74%,56%)]" />
        </div>
        <h1 className="text-xl font-bold font-display text-gray-800 dark:text-gray-100">
          Alsam Concierge
        </h1>
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              cn(
                'flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ease-in-out',
                isActive
                  ? 'bg-[hsl(236,61%,30%)] text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-50'
              )
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="text-center text-xs text-gray-400">
        <p>Built with ❤️ at Cloudflare</p>
      </div>
    </aside>
  );
}