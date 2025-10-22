import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  UserCheck, 
  CreditCard, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus,
  BarChart3,
  DollarSign
} from "lucide-react";
import { useDashboardStats, useTodayAttendance, useOverduePayments } from "@/hooks/useApi";
import { format } from "date-fns";
import Profits from "./Profits";

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

const Dashboard = ({ onNavigate }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Data fetching
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: todayAttendance, isLoading: attendanceLoading } = useTodayAttendance();
  const { data: overduePayments, isLoading: overdueLoading } = useOverduePayments();

  // Loading state
  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (statsError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load dashboard data</h3>
            <p className="text-gray-600 mb-4">Please check your connection and try again.</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const dashboardStats = [
    { 
      title: "Total Members", 
      value: stats?.totalMembers?.toLocaleString() || "0", 
      change: "+12%", 
      icon: Users, 
      color: "text-blue-600",
      trend: "up" as const
    },
    { 
      title: "Active Today", 
      value: stats?.activeToday?.toString() || "0", 
      change: "+5%", 
      icon: UserCheck, 
      color: "text-green-600",
      trend: "up" as const
    },
    { 
      title: "Monthly Revenue", 
      value: `$${stats?.monthlyRevenue?.toLocaleString() || "0"}`, 
      change: "+18%", 
      icon: CreditCard, 
      color: "text-purple-600",
      trend: "up" as const
    },
    { 
      title: "Trainers", 
      value: stats?.totalTrainers?.toString() || "0", 
      change: "+2", 
      icon: BarChart3, 
      color: "text-orange-600",
      trend: "up" as const
    },
  ];

  const recentActivity = [
    { member: "Sarah Johnson", action: "Checked in", time: "2 min ago", type: "checkin" as const },
    { member: "Mike Chen", action: "Subscription renewed", time: "15 min ago", type: "subscription" as const },
    { member: "Emma Davis", action: "New member joined", time: "1 hour ago", type: "member" as const },
    { member: "Alex Rodriguez", action: "Payment completed", time: "2 hours ago", type: "payment" as const },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "checkin":
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case "subscription":
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case "member":
        return <Users className="h-4 w-4 text-purple-600" />;
      case "payment":
        return <CreditCard className="h-4 w-4 text-orange-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down') => {
    return trend === 'up' ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(stat.trend)}
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span> from last month
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="profits">Profits</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Charts and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Member Activity</CardTitle>
                <CardDescription>Daily check-ins over the past 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">Chart visualization would go here</p>
                    <p className="text-sm text-muted-foreground">Integration with chart library</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest member actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.member}
                      </p>
                      <p className="text-sm text-gray-500">{activity.action}</p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2 hover:bg-blue-50 hover:border-blue-200"
                  onClick={() => onNavigate("members")}
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Member</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2 hover:bg-green-50 hover:border-green-200"
                  onClick={() => onNavigate("attendance")}
                >
                  <UserCheck className="h-5 w-5" />
                  <span>Check In</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2 hover:bg-purple-50 hover:border-purple-200"
                  onClick={() => onNavigate("payments")}
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Payment</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Today's Attendance */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
              <CardDescription>Current check-ins for {format(new Date(), 'MMMM dd, yyyy')}</CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : todayAttendance && todayAttendance.length > 0 ? (
                <div className="space-y-4">
                  {todayAttendance.slice(0, 5).map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {record.memberName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-semibold">{record.memberName}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>In: {format(new Date(record.checkIn), 'HH:mm')}</span>
                            {record.checkOut && <span>Out: {format(new Date(record.checkOut), 'HH:mm')}</span>}
                            {record.duration && <span>Duration: {record.duration}</span>}
                          </div>
                        </div>
                      </div>
                      <Badge className={record.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                        {record.status === 'active' ? 'Active' : 'Completed'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No check-ins today</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          {/* Overdue Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Overdue Payments
              </CardTitle>
              <CardDescription>Members with pending payments</CardDescription>
            </CardHeader>
            <CardContent>
              {overdueLoading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : overduePayments && overduePayments.length > 0 ? (
                <div className="space-y-4">
                  {overduePayments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-red-50">
                      <div>
                        <h4 className="font-semibold">{payment.memberName}</h4>
                        <p className="text-sm text-gray-600">{payment.planName}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-red-600">${payment.amount}</div>
                        <p className="text-sm text-gray-500">{payment.daysOverdue} days overdue</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-gray-600">No overdue payments</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscription Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                Expiring Subscriptions
              </CardTitle>
              <CardDescription>Subscriptions expiring soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No subscriptions expiring soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profits" className="space-y-6">
          <Profits />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard; 