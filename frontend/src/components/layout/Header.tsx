import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  Moon,
  Sun
} from "lucide-react";
import { logout } from "@/services/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

function getCurrentUser() {
  // Try to get user info from localStorage (set after login)
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  // Optionally, decode JWT here if needed
  return null;
}

const Header = ({ onToggleSidebar, sidebarOpen }: HeaderProps) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get user info
  const [user, setUser] = useState<any>(getCurrentUser());
  useEffect(() => {
    const handleStorage = () => setUser(getCurrentUser());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const userName = user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "User" : "User";
  const userEmail = user?.email || "";
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
  const avatarUrl = user?.avatarUrl || ""; // If you have a real avatar URL, use it

  const goToSettings = () => {
    window.dispatchEvent(new CustomEvent("navigate-to-settings"));
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="hover:bg-gray-100 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="hover:bg-gray-100 hidden md:inline-flex"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search members, trainers, or transactions..."
              className="pl-10 w-80 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt={userName} />
                  ) : null}
                  <AvatarFallback className="bg-blue-600 text-white">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={goToSettings}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark Mode</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
