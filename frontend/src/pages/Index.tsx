import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MembersList from "@/components/members/MembersList";
import AttendanceSystem from "@/components/attendance/AttendanceSystem";
import TrainerManagement from "@/components/trainers/TrainerManagement";
import SubscriptionManagement from "@/components/subscriptions/SubscriptionManagement";
import PaymentModule from "@/components/payments/PaymentModule";
import Analytics from "@/components/analytics/Analytics";
import ExpenseManagement from "@/components/expenses/ExpenseManagement";
import Settings from "@/components/settings/Settings";
import PlanManagement from "@/components/subscriptions/PlanManagement";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent } from "@/components/ui/drawer";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleNavigateToSettings = () => setActiveTab("settings");
    window.addEventListener("navigate-to-settings", handleNavigateToSettings);
    return () => window.removeEventListener("navigate-to-settings", handleNavigateToSettings);
  }, []);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "members":
        return <MembersList />;
      case "trainers":
        return <TrainerManagement />;
      case "attendance":
        return <AttendanceSystem />;
      case "subscriptions":
        return <SubscriptionManagement />;
      case "payments":
        return <PaymentModule />;
      case "expenses":
        return <ExpenseManagement />;
      case "plans":
        return <PlanManagement />;
      case "settings":
        return <Settings />;
      case "dashboard":
      default:
        return <Analytics />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar for desktop, Drawer for mobile */}
        {isMobile ? (
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerContent className="p-0 max-w-full w-64">
              <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setDrawerOpen(false);
                }}
                isOpen={true}
              />
            </DrawerContent>
          </Drawer>
        ) : (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isOpen={sidebarOpen}
          />
        )}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            onToggleSidebar={() => {
              if (isMobile) setDrawerOpen(true);
              else setSidebarOpen(!sidebarOpen);
            }}
            sidebarOpen={isMobile ? drawerOpen : sidebarOpen}
          />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              {renderActiveTab()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
