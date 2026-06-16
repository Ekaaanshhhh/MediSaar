import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Search, 
  ActivitySquare, 
  Settings, 
  Users, 
  HelpCircle,
  Hospital,
  Bell,
  Mail,
  FileText
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (user && user.role === 'INDIVIDUAL') {
      fetch('/api/individual/notifications')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setNotificationCount(data.data.length);
          }
        })
        .catch(console.error);
    } else if (user && user.role === 'DOCTOR') {
      fetch('/api/doctor/invitations/count')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setNotificationCount(data.data.count);
          }
        })
        .catch(console.error);
    }
  }, [user]);

  if (!user) return null;

  const role = user.role;
  const basePath = role === 'INDIVIDUAL' ? '/individual' : role === 'DOCTOR' ? '/doctor' : '/institution';

  const commonNavItems = [
    { name: 'Settings', href: `${basePath}/settings`, icon: Settings },
    { name: 'Help & Support', href: `${basePath}/help`, icon: HelpCircle },
  ];

  const getNavItems = () => {
    switch (role) {
      case 'INDIVIDUAL':
        return [
          { name: 'Dashboard', href: basePath, icon: LayoutDashboard },
          { name: 'Notifications', href: `${basePath}/notifications`, icon: Bell, badge: notificationCount },
          { name: 'Institutions', href: `${basePath}/institutions`, icon: Hospital },
          { name: 'Timeline', href: `${basePath}/timeline`, icon: ActivitySquare },
          { name: 'Reports', href: `${basePath}/reports`, icon: FileText },
          ...commonNavItems,
        ];
      case 'DOCTOR':
        return [
          { name: 'Dashboard', href: basePath, icon: LayoutDashboard },
          { name: 'Patient Search', href: `${basePath}/search`, icon: Search },
          { name: 'My Institutions', href: `${basePath}/institutions`, icon: Hospital },
          { name: 'Invitations', href: `${basePath}/invitations`, icon: Mail, badge: notificationCount },
          ...commonNavItems,
        ];
      case 'INSTITUTION':
        return [
          { name: 'Dashboard', href: basePath, icon: LayoutDashboard },
          { name: 'Patient Management', href: `${basePath}/patients`, icon: Users },
          { name: 'Doctors & Staff', href: `${basePath}/doctors`, icon: Users },
          { name: 'Upload Center', href: `${basePath}/upload`, icon: FileText },
          ...commonNavItems,
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-[#B8D0B9] bg-[#F7FAF7] h-screen sticky top-0 shrink-0 z-40">
      <div className="flex h-16 items-center px-6 border-b border-[#B8D0B9]">
        <Link href="/" className="font-serif font-bold text-[20px] text-[#1F3F2C] tracking-tight">
          MediSaar
        </Link>
      </div>
      
      <div className="flex-1 overflow-auto py-6 flex flex-col gap-1 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== basePath && item.href !== `${basePath}/notifications`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all relative border-l-3",
                isActive 
                  ? "bg-[#EEF3EC] text-[#1F3F2C] border-l-[#2E5D3F] rounded-r-lg rounded-l-none pl-[9px]" 
                  : "text-[#5E726E] hover:bg-[#EEF3EC] hover:text-[#1F3F2C] border-l-transparent rounded-lg"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-[#2E5D3F]" : "text-[#4F7A55]")} strokeWidth={1.5} />
              {item.name}
              {((item as any).badge as number) > 0 && (
                <span className="ml-auto bg-[#2E5D3F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {(item as any).badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
