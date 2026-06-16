import { useAuth } from '@/hooks/useAuth';
import { Bell, Search, User as UserIcon, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

export function TopNav() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[#B8D0B9] bg-[#F7FAF7] px-6 shadow-sm">
      <div className="flex flex-1 items-center gap-4">
        <form className="hidden md:flex flex-1 max-w-sm relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#2E5D3F]" strokeWidth={1.5} />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full bg-[#EEF3EC] pl-9 border-none focus-visible:ring-1 text-[#1F3F2C]"
          />
        </form>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notification Center */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-[#2E5D3F]" strokeWidth={1.5} />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-[#E0902C] text-white text-[10px] rounded-full">3</Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              <DropdownMenuItem className="p-3 cursor-pointer">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Blood report uploaded</span>
                  <span className="text-xs text-muted-foreground">City General Hospital added a new report.</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-3 cursor-pointer">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Follow-up appointment scheduled</span>
                  <span className="text-xs text-muted-foreground">Dr. Sarah Smith • Tomorrow, 10:00 AM</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-3 cursor-pointer">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Prescription updated</span>
                  <span className="text-xs text-muted-foreground">Metformin dosage has been updated.</span>
                </div>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <Button variant="ghost" className="w-full text-xs" size="sm">View all notifications</Button>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.name?.charAt(0) || <UserIcon className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 bg-[#F7FAF7] border border-[#DCE8DC] rounded-[14px] shadow-soft">
            <DropdownMenuLabel className="font-normal p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold text-[#1F3F2C] leading-none font-sans">{user?.name}</p>
                <p className="text-xs leading-none text-[#5E726E] font-sans truncate">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#DCE8DC]" />
            <DropdownMenuItem className="cursor-pointer p-2 rounded-[8px] hover:bg-[#EEF3EC] text-[#1F3F2C] font-sans text-sm transition-colors">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer p-2 rounded-[8px] hover:bg-[#EEF3EC] text-[#1F3F2C] font-sans text-sm transition-colors">
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#DCE8DC]" />
            <DropdownMenuItem onClick={handleLogout} className="text-[#C2453D] cursor-pointer p-2 rounded-[8px] hover:bg-destructive/10 font-sans text-sm transition-colors">
              <LogOut className="mr-2 h-4 w-4 text-[#C2453D]" strokeWidth={1.5} />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
