import React from 'react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { 
  Users, 
  UserPlus, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  LogOut,
  Activity,
  FileText,
  Shield,
  Home,
  FileBarChart
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import clinitrackLogo from '../../assets/clinitrackLogo.png';
import clinitrackText from '../../assets/clinitrackLogo.png';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { user, logout } = useAuth();

  const secretaryItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'new-patient', label: 'New Patient', icon: UserPlus },
    { id: 'existing-patient', label: 'Existing Patients', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileBarChart },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle }
  ];

  const doctorItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'patients', label: 'Patient Profiles', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'risk-assessment', label: 'AI Risk Assessment', icon: Activity },
    { id: 'reports', label: 'Reports', icon: FileBarChart },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle }
  ];

  const menuItems = user?.role === 'secretary' ? secretaryItems : doctorItems;

  return (
    <div className="flex h-full w-64 flex-col sidebar-gradient border-r border-sidebar-border">
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <div className="flex items-center space-x-3">
          <ImageWithFallback 
            src={clinitrackLogo} 
            alt="CliniTrack Logo" 
            className="h-7 w-auto logo-no-bg"
          />
          <div>
            <div className="flex items-center">
              <ImageWithFallback 
                src={clinitrackText} 
                alt="CliniTrack" 
                className="h-5 w-auto logo-no-bg"
              />
            </div>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => onViewChange(item.id)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      <div className="border-t border-sidebar-border p-4">
        <div className="mb-4">
          <p className="font-medium text-sm">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        
        <Separator className="mb-4" />
        
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}