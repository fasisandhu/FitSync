import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  useDailyAttendanceTrend, 
  usePeakHours, 
  useMemberActivity, 
  useMonthlyRevenue, 
  usePaymentMethods, 
  useRenewalRate,
  useDashboardAnalytics,
  useExpenseDashboard,
  useExpenseStatistics,
  useRecentExpenses,
  useExpensesByPerson,
  useMonthlyProfits
} from '@/hooks/useApi';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  DollarSign, 
  Activity, 
  Calendar,
  Target,
  Award,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  TrendingDown
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Analytics = () => {
  const [attendanceDays, setAttendanceDays] = useState(7);
  const [revenueMonths, setRevenueMonths] = useState(6);
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 5);
    return date.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Fetch analytics data
  const { data: dailyTrend, isLoading: dailyTrendLoading } = useDailyAttendanceTrend(attendanceDays);
  const { data: peakHours, isLoading: peakHoursLoading } = usePeakHours();
  const { data: memberActivity, isLoading: memberActivityLoading } = useMemberActivity();
  const { data: monthlyRevenue, isLoading: monthlyRevenueLoading } = useMonthlyRevenue(revenueMonths);
  const { data: paymentMethods, isLoading: paymentMethodsLoading } = usePaymentMethods();
  const { data: renewalRate, isLoading: renewalRateLoading } = useRenewalRate();
  const { data: dashboardAnalytics, isLoading: dashboardAnalyticsLoading } = useDashboardAnalytics();

  // Fetch expense analytics data
  const { data: expenseDashboard, isLoading: expenseDashboardLoading } = useExpenseDashboard();
  const { data: expenseStatistics, isLoading: expenseStatisticsLoading } = useExpenseStatistics();
  const { data: recentExpenses, isLoading: recentExpensesLoading } = useRecentExpenses();
  const { data: expensesByPerson, isLoading: expensesByPersonLoading } = useExpensesByPerson();

  // Fetch profits data
  const { data: profitsData, isLoading: profitsLoading } = useMonthlyProfits(dateFrom, dateTo);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-64 w-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your gym's performance and trends
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      {!dashboardAnalyticsLoading && dashboardAnalytics && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardAnalytics.members.total_members}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardAnalytics.members.new_this_month} new this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardAnalytics.attendance.today_present + dashboardAnalytics.attendance.today_late}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardAnalytics.attendance.today_present} present, {dashboardAnalytics.attendance.today_late} late
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(dashboardAnalytics.revenue.this_month)}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardAnalytics.revenue.growth_percentage > 0 ? '+' : ''}
                {formatPercentage(dashboardAnalytics.revenue.growth_percentage)} from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Trainers</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardAnalytics.trainers.active_trainers}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardAnalytics.trainers.total_clients} total clients
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList className="grid w-full max-w-2xl grid-cols-2 sm:grid-cols-5 overflow-x-auto flex-nowrap">
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="profits" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Profits
          </TabsTrigger>
        </TabsList>

        {/* Attendance Analytics */}
        <TabsContent value="attendance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Daily Attendance Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Daily Attendance Trend
                </CardTitle>
                <CardDescription>
                  Attendance patterns over the selected period
                </CardDescription>
                <div className="flex items-center gap-2">
                  <Select value={attendanceDays.toString()} onValueChange={(value) => setAttendanceDays(parseInt(value))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {dailyTrendLoading ? (
                  renderLoadingSkeleton()
                ) : dailyTrend && dailyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={formatDate}
                        formatter={(value: number, name: string) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
                      />
                      <Bar dataKey="present" fill="#10B981" name="Present" />
                      <Bar dataKey="late" fill="#F59E0B" name="Late" />
                      <Bar dataKey="absent" fill="#EF4444" name="Absent" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-64 items-center justify-center text-muted-foreground">
                    No attendance data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Peak Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Peak Hours
                </CardTitle>
                <CardDescription>
                  Most popular check-in times
                </CardDescription>
              </CardHeader>
              <CardContent>
                {peakHoursLoading ? (
                  renderLoadingSkeleton()
                ) : peakHours && peakHours.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={peakHours}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number, name: string) => [value, name === 'count' ? 'Check-ins' : 'Percentage']}
                        labelFormatter={(label) => `${label} (${label})`}
                      />
                      <Bar dataKey="count" fill="#3B82F6" name="count" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-64 items-center justify-center text-muted-foreground">
                    No peak hours data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Member Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Most Active Members
              </CardTitle>
              <CardDescription>
                Members with highest attendance rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {memberActivityLoading ? (
                renderLoadingSkeleton()
              ) : memberActivity && memberActivity.data.length > 0 ? (
                <div className="space-y-4">
                  {memberActivity.data.slice(0, 10).map((member) => (
                    <div key={member.member_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {member.member_name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{member.member_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {member.total_attendance} total visits
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          {formatPercentage(member.attendance_rate)}
                        </div>
                        <div className="flex gap-2 text-xs">
                          <Badge variant="secondary">{member.present_count} present</Badge>
                          <Badge variant="outline">{member.late_count} late</Badge>
                          <Badge variant="destructive">{member.absent_count} absent</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  No member activity data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Analytics */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Monthly Revenue */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5" />
                  Monthly Revenue
                </CardTitle>
                <CardDescription>
                  Revenue trends over the selected period
                </CardDescription>
                <div className="flex items-center gap-2">
                  <Select value={revenueMonths.toString()} onValueChange={(value) => setRevenueMonths(parseInt(value))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 months</SelectItem>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {monthlyRevenueLoading ? (
                  renderLoadingSkeleton()
                ) : monthlyRevenue && monthlyRevenue.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tickFormatter={formatMonth}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={formatMonth}
                        formatter={(value: number, name: string) => [
                          formatCurrency(value), 
                          name === 'revenue' ? 'Revenue' : name === 'payment_count' ? 'Payments' : 'Avg Payment'
                        ]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#10B981" 
                        fill="#10B981" 
                        fillOpacity={0.3}
                        name="revenue"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-64 items-center justify-center text-muted-foreground">
                    No revenue data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
                <CardDescription>
                  Distribution of payment methods
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paymentMethodsLoading ? (
                  renderLoadingSkeleton()
                ) : paymentMethods && paymentMethods.length > 0 ? (
                  <div className="space-y-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={paymentMethods}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ method, percentage }) => `${method} (${percentage}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {paymentMethods.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number, name: string, props: any) => [
                            `${props.payload.method}: ${formatCurrency(props.payload.total_amount)}`,
                            'Amount'
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {paymentMethods.map((method, index) => (
                        <div key={method.method} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="capitalize">{method.method}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(method.total_amount)}</div>
                            <div className="text-sm text-muted-foreground">
                              {method.count} payments ({formatPercentage(method.percentage)})
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-64 items-center justify-center text-muted-foreground">
                    No payment method data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subscription Analytics */}
        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Subscription Renewal Analytics
              </CardTitle>
              <CardDescription>
                Subscription performance and renewal metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renewalRateLoading ? (
                renderLoadingSkeleton()
              ) : renewalRate ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">{renewalRate.total_subscriptions}</div>
                    <p className="text-sm text-muted-foreground">Total Subscriptions</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{renewalRate.active_subscriptions}</div>
                    <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">{renewalRate.expired_subscriptions}</div>
                    <p className="text-sm text-muted-foreground">Expired Subscriptions</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatPercentage(renewalRate.renewal_rate)}</div>
                    <p className="text-sm text-muted-foreground">Renewal Rate</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">{renewalRate.expiring_this_month}</div>
                    <p className="text-sm text-muted-foreground">Expiring This Month</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">{renewalRate.expiring_next_month}</div>
                    <p className="text-sm text-muted-foreground">Expiring Next Month</p>
                  </div>
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  No subscription data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expense Analytics */}
        <TabsContent value="expenses" className="space-y-4">
          {/* Expense Overview Cards */}
          {!expenseDashboardLoading && expenseDashboard && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{expenseDashboard.total_expenses}</div>
                  <p className="text-xs text-muted-foreground">
                    Total number of expenses
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(parseFloat(expenseDashboard.total_amount))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total amount spent
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Amount</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(parseFloat(expenseDashboard.average_amount))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average per expense
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(parseFloat(expenseDashboard.monthly_total))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {expenseDashboard.monthly_count} expenses this month
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Expenses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Expenses
                </CardTitle>
                <CardDescription>
                  Latest expense transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentExpensesLoading ? (
                  renderLoadingSkeleton()
                ) : recentExpenses && recentExpenses.length > 0 ? (
                  <div className="space-y-3">
                    {recentExpenses.slice(0, 5).map((expense) => (
                      <div key={expense.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{expense.expense_name}</p>
                          <p className="text-sm text-gray-600">{expense.person_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(parseFloat(expense.amount))}</p>
                          <p className="text-sm text-gray-600">{formatDate(expense.date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-64 items-center justify-center text-muted-foreground">
                    No recent expenses available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Spenders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Top Spenders
                </CardTitle>
                <CardDescription>
                  People with highest expense amounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {expenseDashboardLoading ? (
                  renderLoadingSkeleton()
                ) : expenseDashboard?.top_spenders && expenseDashboard.top_spenders.length > 0 ? (
                  <div className="space-y-3">
                    {expenseDashboard.top_spenders.map((spender, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant="secondary">{index + 1}</Badge>
                          <div>
                            <p className="font-medium">{spender.person_name}</p>
                            <p className="text-sm text-gray-600">{spender.expense_count} expenses</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(parseFloat(spender.total_spent))}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-64 items-center justify-center text-muted-foreground">
                    No spending data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="h-5 w-5" />
                Monthly Expense Trend
              </CardTitle>
              <CardDescription>
                Expense trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {expenseDashboardLoading ? (
                renderLoadingSkeleton()
              ) : expenseDashboard?.monthly_trend && expenseDashboard.monthly_trend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={expenseDashboard.monthly_trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={formatMonth}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={formatMonth}
                      formatter={(value: number, name: string) => [
                        name === 'total' ? formatCurrency(value) : value.toString(), 
                        name === 'total' ? 'Total Amount' : 'Count'
                      ]}
                    />
                    <Bar dataKey="total" fill="#EF4444" name="total" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  No trend data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expense Statistics */}
          {expenseStatistics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Detailed Expense Statistics
                </CardTitle>
                <CardDescription>
                  Comprehensive expense breakdown and analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {expenseStatisticsLoading ? (
                  renderLoadingSkeleton()
                ) : expenseStatistics ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="font-semibold mb-3">Summary</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Expenses:</span>
                          <span className="font-medium">{expenseStatistics.summary.total_expenses}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Amount:</span>
                          <span className="font-medium">{formatCurrency(parseFloat(expenseStatistics.summary.total_amount))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average Amount:</span>
                          <span className="font-medium">{formatCurrency(parseFloat(expenseStatistics.summary.average_amount))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Min Amount:</span>
                          <span className="font-medium">{formatCurrency(parseFloat(expenseStatistics.summary.min_amount))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Max Amount:</span>
                          <span className="font-medium">{formatCurrency(parseFloat(expenseStatistics.summary.max_amount))}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Person Breakdown</h3>
                      {expenseStatistics.person_breakdown && expenseStatistics.person_breakdown.length > 0 ? (
                        <div className="space-y-2">
                          {expenseStatistics.person_breakdown.slice(0, 5).map((person, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{person.person_name}</span>
                              <span className="font-medium">{formatCurrency(parseFloat(person.person_total))}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No person breakdown data</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-64 items-center justify-center text-muted-foreground">
                    No statistics data available
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Profits Analytics */}
        <TabsContent value="profits" className="space-y-4">
          {/* Date Range Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Date Range</CardTitle>
              <CardDescription>Select the period for profits analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateFrom">From Date</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dateTo">To Date</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          {!profitsLoading && profitsData && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(parseFloat(profitsData.summary.total_income))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Over {profitsData.summary.months_count} months
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(parseFloat(profitsData.summary.total_expenses))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Over {profitsData.summary.months_count} months
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(parseFloat(profitsData.summary.total_profit))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Income - Expenses
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {profitsData.summary.total_income && profitsData.summary.total_expenses ? 
                      `${((parseFloat(profitsData.summary.total_profit) / parseFloat(profitsData.summary.total_income)) * 100).toFixed(1)}%` : 
                      '0%'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Profit as % of income
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Monthly Profits Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="h-5 w-5" />
                Monthly Profits Overview
              </CardTitle>
              <CardDescription>
                Income, expenses, and profit trends from {formatDate(dateFrom)} to {formatDate(dateTo)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profitsLoading ? (
                renderLoadingSkeleton()
              ) : profitsData && profitsData.profits_data.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={profitsData.profits_data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={formatMonth}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={formatMonth}
                      formatter={(value: string, name: string) => [
                        formatCurrency(parseFloat(value)), 
                        name.charAt(0).toUpperCase() + name.slice(1)
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      name="Income"
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#EF4444" 
                      strokeWidth={3}
                      name="Expenses"
                      dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      name="Profit"
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  No profits data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Breakdown Table */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Breakdown</CardTitle>
              <CardDescription>Detailed monthly income, expenses, and profits</CardDescription>
            </CardHeader>
            <CardContent>
              {profitsLoading ? (
                renderLoadingSkeleton()
              ) : profitsData && profitsData.profits_data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Month</th>
                        <th className="text-right py-3 px-4 font-medium">Income</th>
                        <th className="text-right py-3 px-4 font-medium">Expenses</th>
                        <th className="text-right py-3 px-4 font-medium">Profit</th>
                        <th className="text-center py-3 px-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profitsData.profits_data.map((month, index) => {
                        const profit = parseFloat(month.profit);
                        const isPositive = profit >= 0;
                        
                        return (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">
                              {formatMonth(month.month)}
                            </td>
                            <td className="text-right py-3 px-4 text-green-600">
                              {formatCurrency(parseFloat(month.income))}
                            </td>
                            <td className="text-right py-3 px-4 text-red-600">
                              {formatCurrency(parseFloat(month.expenses))}
                            </td>
                            <td className="text-right py-3 px-4 font-semibold">
                              <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                                {formatCurrency(profit)}
                              </span>
                            </td>
                            <td className="text-center py-3 px-4">
                              <Badge className={isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {isPositive ? 'Profit' : 'Loss'}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  No profits data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics; 