import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Search, 
  ActivitySquare, 
  FileText, 
  Settings, 
  Users, 
  HelpCircle,
  Hospital
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

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
          { name: 'Timeline', href: `${basePath}/timeline`, icon: ActivitySquare },
          { name: 'Reports', href: `${basePath}/reports`, icon: FileText },
          ...commonNavItems,
        ];
      case 'DOCTOR':
        return [
          { name: 'Dashboard', href: basePath, icon: LayoutDashboard },
          { name: 'Patient Search', href: `${basePath}/search`, icon: Search },
          { name: 'My Institutions', href: `${basePath}/institutions`, icon: Hospital },
          ...commonNavItems,
        ];
      case 'INSTITUTION':
        return [
          { name: 'Dashboard', href: basePath, icon: LayoutDashboard },
          { name: 'Patient Management', href: `${basePath}/patients`, icon: Users },
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
        <Link href="/" className="font-serif font-bold text-[22px] text-sage-800 tracking-tight">
          MediSaar
        </Link>
      </div>
      
      <div className="flex-1 overflow-auto py-6 flex flex-col gap-1 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== basePath);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:text-primary",
                isActive 
                  ? "bg-primary/10 text-primary hover:bg-primary/15" 
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
              {item.name}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
