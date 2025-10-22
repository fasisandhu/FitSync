import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  UserCheck, 
  Calendar, 
  CreditCard, 
  Receipt, 
  Settings, 
  Home,
  Dumbbell,
  ClipboardList,
  Package,
  Flame
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
}

const Sidebar = ({ activeTab, setActiveTab, isOpen }: SidebarProps) => {
  const navigation = [
    { id: "dashboard", name: "Dashboard", icon: Home },
    { id: "members", name: "Members", icon: Users },
    { id: "trainers", name: "Trainers", icon: Dumbbell },
    { id: "attendance", name: "Attendance", icon: UserCheck },
    { id: "subscriptions", name: "Subscriptions", icon: ClipboardList },
    { id: "plans", name: "Plans", icon: Package },
    { id: "payments", name: "Payments", icon: CreditCard },
    { id: "expenses", name: "Expenses", icon: Receipt },
    { id: "settings", name: "Settings", icon: Settings },
  ];

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col",
      isOpen ? "w-64" : "w-16"
    )}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Flame className="h-4 w-4 text-white" />
          </div>
          {isOpen && (
            <div>
              <h1 className="text-xl font-bold text-gray-900">FitSync</h1>
              <p className="text-xs text-gray-500">Management Portal</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "default" : "ghost"}
            className={cn(
              "w-full justify-start h-11 transition-all duration-200",
              !isOpen && "px-3",
              activeTab === item.id && "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            )}
            onClick={() => setActiveTab(item.id)}
          >
            <item.icon className={cn("h-5 w-5", isOpen && "mr-3")} />
            {isOpen && <span className="font-medium">{item.name}</span>}
          </Button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
