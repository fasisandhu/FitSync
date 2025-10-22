import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useExpenseDashboard, useExpenseStatistics, useRecentExpenses, useExpensesByPerson } from '@/hooks/useApi';
import { TrendingUp, TrendingDown, DollarSign, Receipt, Users, Calendar } from 'lucide-react';

const ExpenseDashboard: React.FC = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: dashboardData, isLoading: dashboardLoading } = useExpenseDashboard(dateFrom, dateTo);
  const { data: statistics, isLoading: statsLoading } = useExpenseStatistics();
  const { data: recentExpenses, isLoading: recentLoading } = useRecentExpenses();
  const { data: expensesByPerson, isLoading: personLoading } = useExpensesByPerson();

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatMonth = (monthString: string) => {
    return new Date(monthString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (dashboardLoading || statsLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading expense dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Expense Dashboard</h1>
        <div className="flex space-x-2">
          <div>
            <Label htmlFor="dateFrom" className="text-sm">From</Label>
            <Input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-32"
            />
          </div>
          <div>
            <Label htmlFor="dateTo" className="text-sm">To</Label>
            <Input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-32"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.total_expenses || 0}
            </div>
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
              {dashboardData ? formatCurrency(dashboardData.total_amount) : '$0.00'}
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
              {dashboardData ? formatCurrency(dashboardData.average_amount) : '$0.00'}
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
              {dashboardData ? formatCurrency(dashboardData.monthly_total) : '$0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.monthly_count || 0} expenses this month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {recentLoading ? (
              <div className="text-center py-4">Loading recent expenses...</div>
            ) : recentExpenses && recentExpenses.length > 0 ? (
              <div className="space-y-3">
                {recentExpenses.slice(0, 5).map((expense) => (
                  <div key={expense.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{expense.expense_name}</p>
                      <p className="text-sm text-gray-600">{expense.person_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(expense.amount)}</p>
                      <p className="text-sm text-gray-600">{formatDate(expense.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">No recent expenses</div>
            )}
          </CardContent>
        </Card>

        {/* Top Spenders */}
        <Card>
          <CardHeader>
            <CardTitle>Top Spenders</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.top_spenders && dashboardData.top_spenders.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.top_spenders.map((spender, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{spender.person_name}</p>
                        <p className="text-sm text-gray-600">{spender.expense_count} expenses</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(spender.total_spent)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">No spending data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData?.monthly_trend && dashboardData.monthly_trend.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.monthly_trend.map((trend, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{formatMonth(trend.month)}</p>
                    <p className="text-sm text-gray-600">{trend.count} expenses</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(trend.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">No trend data available</div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Table */}
      {statistics && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Expenses:</span>
                    <span className="font-medium">{statistics.summary.total_expenses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="font-medium">{formatCurrency(statistics.summary.total_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Amount:</span>
                    <span className="font-medium">{formatCurrency(statistics.summary.average_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Min Amount:</span>
                    <span className="font-medium">{formatCurrency(statistics.summary.min_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Amount:</span>
                    <span className="font-medium">{formatCurrency(statistics.summary.max_amount)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Person Breakdown</h3>
                {statistics.person_breakdown && statistics.person_breakdown.length > 0 ? (
                  <div className="space-y-2">
                    {statistics.person_breakdown.slice(0, 5).map((person, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{person.person_name}</span>
                        <span className="font-medium">{formatCurrency(person.person_total)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No person breakdown data</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExpenseDashboard; 