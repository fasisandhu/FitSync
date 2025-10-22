import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  MinusCircle, 
  PlusCircle,
  Calendar,
  BarChart3
} from "lucide-react";
import { useMonthlyProfits } from "@/hooks/useApi";
import { format, subMonths } from "date-fns";

const Profits = () => {
  const [dateFrom, setDateFrom] = useState(format(subMonths(new Date(), 5), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: profitsData, isLoading: loading, error, refetch } = useMonthlyProfits(dateFrom, dateTo);

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const getProfitTrend = (data: any[]) => {
    if (data.length < 2) return { trend: 'neutral', percentage: 0 };
    
    const current = parseFloat(data[data.length - 1].profit);
    const previous = parseFloat(data[data.length - 2].profit);
    const percentage = ((current - previous) / previous) * 100;
    
    return {
      trend: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral',
      percentage: Math.abs(percentage)
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <TrendingDown className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load profits data</h3>
            <p className="text-gray-600 mb-4">Please check your connection and try again.</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profitsData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No profits data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const profitTrend = getProfitTrend(profitsData.profits_data);

  return (
    <div className="space-y-6">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Income
            </CardTitle>
            <PlusCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(profitsData.summary.total_income)}
            </div>
            <p className="text-xs text-muted-foreground">
              Over {profitsData.summary.months_count} months
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
            <MinusCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(profitsData.summary.total_expenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Over {profitsData.summary.months_count} months
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Profit
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(profitsData.summary.total_profit)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {profitTrend.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : profitTrend.trend === 'down' ? (
                <TrendingDown className="h-4 w-4 text-red-600" />
              ) : null}
              <p className="text-xs text-muted-foreground">
                {profitTrend.trend !== 'neutral' && (
                  <span className={profitTrend.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                    {profitTrend.trend === 'up' ? '+' : '-'}{profitTrend.percentage.toFixed(1)}%
                  </span>
                )} from previous period
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profits Chart */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Monthly Profits Overview</CardTitle>
            <CardDescription>
              Income, expenses, and profit trends from {format(new Date(profitsData.date_range.from), 'MMM dd, yyyy')} to {format(new Date(profitsData.date_range.to), 'MMM dd, yyyy')}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <p className="text-muted-foreground">Profits chart visualization would go here</p>
              <p className="text-sm text-muted-foreground">
                Three lines: Income (green), Expenses (red), Profit (blue)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Breakdown</CardTitle>
          <CardDescription>Detailed monthly income, expenses, and profits</CardDescription>
        </CardHeader>
        <CardContent>
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
                        {format(new Date(month.month + '-01'), 'MMM yyyy')}
                      </td>
                      <td className="text-right py-3 px-4 text-green-600">
                        {formatCurrency(month.income)}
                      </td>
                      <td className="text-right py-3 px-4 text-red-600">
                        {formatCurrency(month.expenses)}
                      </td>
                      <td className="text-right py-3 px-4 font-semibold">
                        <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(month.profit)}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Profits; 