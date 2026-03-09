import { FileText, Code2, Settings, BookOpen } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export function Sidebar({ currentTab, setCurrentTab }: SidebarProps) {
  const navItems = [
    { id: 'analyzer', label: 'Analyzer', icon: FileText },
    { id: 'python', label: 'Python Backend', icon: Code2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-zinc-950 text-zinc-300 flex flex-col h-full border-r border-zinc-800">
      <div className="p-6 flex items-center gap-3 text-white font-semibold text-lg tracking-tight">
        <BookOpen className="w-6 h-6 text-emerald-500" />
        BookQC
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                isActive 
                  ? 'bg-zinc-800 text-white' 
                  : 'hover:bg-zinc-800/50 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-500' : 'text-zinc-500'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-zinc-800 text-xs text-zinc-500">
        Local Offline Mode
      </div>
    </div>
  );
}
