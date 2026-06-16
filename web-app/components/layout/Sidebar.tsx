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
    <aside className="hidden lg:flex w-64 flex-col border-r bg-card h-screen sticky top-0 shrink-0 shadow-sm z-40">
      <div className="flex h-16 items-center px-6 border-b border-border/50">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary tracking-tight">
          <ActivitySquare className="h-6 w-6 text-accent" />
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
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:text-primary relative",
                isActive 
                  ? "bg-primary/10 text-primary hover:bg-primary/15" 
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
              {item.name}
              {((item as any).badge as number) > 0 && (
                <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {(item as any).badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 mt-auto border-t">
        <div className="rounded-xl bg-accent/10 p-4 relative overflow-hidden border border-accent/20">
          <div className="absolute top-0 right-0 w-16 h-16 bg-accent/20 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
          <h4 className="text-sm font-semibold text-primary mb-1 relative z-10">Upgrade to Pro</h4>
          <p className="text-xs text-muted-foreground mb-3 relative z-10">Get unlimited AI summaries and premium features.</p>
          <button className="text-xs font-medium text-white bg-primary hover:bg-primary/90 px-3 py-1.5 rounded-lg w-full transition-colors relative z-10">
            View Plans
          </button>
        </div>
      </div>
    </aside>
  );
}
