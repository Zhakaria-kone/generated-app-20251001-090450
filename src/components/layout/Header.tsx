import { Menu, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, BarChart2, Hotel } from 'lucide-react';
import { cn } from '@/lib/utils';
const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/seminars', icon: Calendar, label: 'Seminars' },
  { to: '/reporting', icon: BarChart2, label: 'Reporting' },
];
interface HeaderProps {
  title: string;
}
export function Header({ title }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <nav className="grid gap-4 text-lg font-medium">
              <div className="flex items-center space-x-3 px-2 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[hsl(236,61%,30%)] flex items-center justify-center">
                  <Hotel className="w-6 h-6 text-[hsl(45,74%,56%)]" />
                </div>
                <h1 className="text-xl font-bold font-display text-gray-800 dark:text-gray-100">
                  Alsam Concierge
                </h1>
              </div>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                      isActive
                        ? 'bg-muted text-primary'
                        : 'text-muted-foreground hover:text-primary'
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100">{title}</h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}