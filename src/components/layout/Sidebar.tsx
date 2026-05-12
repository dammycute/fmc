import React from 'react';
import { LayoutDashboard, Users, UserCog, TrendingUp, Building2, Search, GraduationCap, Settings, Newspaper, ArrowRightLeft, Briefcase, Trophy, Calendar, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingRequestsCount: number;
  pendingBidsCount: number;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, pendingRequestsCount, pendingBidsCount, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'squad', icon: Users, label: 'Squad' },
    { id: 'manager', icon: UserCog, label: 'Manager', badge: pendingRequestsCount },
    { id: 'transfer', icon: ArrowRightLeft, label: 'Transfer Center', badge: pendingBidsCount },
    { id: 'schedule', icon: Calendar, label: 'Schedule' },
    { id: 'boardroom', icon: Building2, label: 'Boardroom' },
    { id: 'staff', icon: Briefcase, label: 'Backroom Staff' },
    { id: 'finances', icon: TrendingUp, label: 'Finances' },
    { id: 'facilities', icon: GraduationCap, label: 'Facilities' },
    { id: 'leagues', icon: Trophy, label: 'League Table' },
    { id: 'scouting', icon: Search, label: 'Scouting' },
    { id: 'clubmarket', icon: Briefcase, label: 'Club Market' },
    { id: 'news', icon: Newspaper, label: 'News' },
  ];

  const handleNav = (id: string) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <div className={cn(
        "w-64 bg-[#121212] border-r border-white/5 flex flex-col h-screen fixed left-0 top-0 z-50 transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tighter text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-xs">FC</div>
            CHAIRMAN
          </h1>
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded-lg text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                activeTab === item.id
                  ? "bg-indigo-600/10 text-indigo-400"
                  : "text-zinc-500 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn(
                  "w-5 h-5",
                  activeTab === item.id ? "text-indigo-400" : "text-zinc-600 group-hover:text-white"
                )} />
                {item.label}
              </div>
              {item.badge ? (
                <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-[10px] text-white font-bold animate-pulse">
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-white/5">
          <button onClick={() => alert('Settings coming soon')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-500 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;