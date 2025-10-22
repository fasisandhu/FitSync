import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Plus, 
  CreditCard,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Loader2
} from "lucide-react";
import { Payment, Subscription, Member, Plan } from "@/types";
import { usePayments, useSubscriptions, useMembers, usePlans } from "@/hooks/useApi";
import PaymentForm from "./PaymentForm";

const PaymentModule = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Fetch real data from backend
  const { data: payments, isLoading: paymentsLoading, error: paymentsError } = usePayments();
  const { data: subscriptions } = useSubscriptions();
  const { data: members } = useMembers();
  const { data: plans } = usePlans();

  // Calculate payment stats
  const stats = useMemo(() => {
    if (!payments) return [];

    const completedPayments = payments.filter(p => p.status === 'paid');
    const pendingPayments = payments.filter(p => p.status === 'pending');
    const failedPayments = payments.filter(p => p.status === 'failed');

    const totalRevenue = completedPayments.reduce((sum, payment) => {
      return sum + Number(payment.amount);
    }, 0);

    const collectionRate = payments.length > 0 
      ? Math.round((completedPayments.length / payments.length) * 100)
      : 0;

    return [
      { title: "Total Revenue", value: `PKR ${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-green-600" },
      { title: "Pending Payments", value: pendingPayments.length.toString(), icon: Clock, color: "text-yellow-600" },
      { title: "Failed Payments", value: failedPayments.length.toString(), icon: AlertCircle, color: "text-red-600" },
      { title: "Collection Rate", value: `${collectionRate}%`, icon: TrendingUp, color: "text-blue-600" },
    ];
  }, [payments]);

  // Filter payments
  const filteredPayments = useMemo(() => {
    if (!payments || !subscriptions || !members || !plans) return [];

    return payments.filter(payment => {
      const subscription = payment.subscription ? subscriptions.find(s => s.id === payment.subscription) : null;
      const member = subscription && subscription.member ? members.find(m => m.id === subscription.member) : null;
      const plan = subscription && subscription.plan ? plans.find(p => p.id === subscription.plan) : null;
      
      // Use preserved data if subscription is deleted
      const memberName = member ? member.full_name : payment.member_name;
      const memberEmail = member ? member.email : payment.member_email;
      const planName = plan ? plan.name : payment.subscription_plan_name;
      const startDate = subscription ? subscription.start_date : payment.subscription_start_date;
      const endDate = subscription ? subscription.end_date : payment.subscription_end_date;
      
      if (!memberName || !planName) return false;

      const matchesSearch = memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.id.toString().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || payment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payments, subscriptions, members, plans, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <DollarSign className="h-4 w-4" />;
      case "bank":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  if (paymentsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading payments...</span>
        </div>
      </div>
    );
  }

  if (paymentsError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Error loading payments</h3>
          <p className="text-muted-foreground">
            {paymentsError.message || 'Failed to load payments'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600">Track payments, invoices, and financial analytics</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setShowPaymentForm(true)}>
          <Plus className="h-4 w-4" />
          Record Payment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 sm:grid-cols-3 overflow-x-auto flex-nowrap">
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Payments List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>Latest payment transactions and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto w-full">
                <table className="min-w-[600px] w-full text-sm text-left">
                  <tbody>
                    {filteredPayments.map((payment) => {
                      const subscription = payment.subscription ? subscriptions?.find(s => s.id === payment.subscription) : null;
                      const member = subscription && subscription.member ? members?.find(m => m.id === subscription.member) : null;
                      const plan = subscription && subscription.plan ? plans?.find(p => p.id === subscription.plan) : null;
                      
                      // Use preserved data if subscription is deleted
                      const memberName = member ? member.full_name : payment.member_name;
                      const memberEmail = member ? member.email : payment.member_email;
                      const planName = plan ? plan.name : payment.subscription_plan_name;
                      const startDate = subscription ? subscription.start_date : payment.subscription_start_date;
                      const endDate = subscription ? subscription.end_date : payment.subscription_end_date;
                      
                      if (!memberName || !planName) return null;

                      return (
                        <tr key={payment.id} className="border-b">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-4">
                              <div>
                                <h4 className="font-semibold">{memberName}</h4>
                                <p className="text-sm text-gray-600">{planName}</p>
                                {memberEmail && (
                                  <p className="text-xs text-gray-500">{memberEmail}</p>
                                )}
                                {!subscription && (
                                  <p className="text-xs text-orange-600">Subscription deleted</p>
                                )}
                              </div>
                              <div className="hidden sm:flex items-center gap-2">
                                {getPaymentMethodIcon(payment.method)}
                                <span className="text-sm text-gray-600 capitalize">{payment.method}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-6">
                              <span>Payment ID: #{payment.id}</span>
                              <span>Date: {new Date(payment.payment_date).toLocaleDateString()}</span>
                              {startDate && (
                                <span>Sub Start: {new Date(startDate).toLocaleDateString()}</span>
                              )}
                              {endDate && (
                                <span>Sub End: {new Date(endDate).toLocaleDateString()}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {getStatusBadge(payment.status)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-gray-900">PKR {Number(payment.amount).toFixed(2)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {filteredPayments.length === 0 && (
                <div className="text-center py-8">
                  <DollarSign className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <h3 className="text-lg font-semibold">No payments found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all" 
                      ? "No payments match your current filters"
                      : "No payments have been recorded yet"
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Overdue Payments
              </CardTitle>
              <CardDescription>Members with outstanding payment obligations</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Overdue payments content */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] bg-gradient-to-r from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Revenue chart would go here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Distribution of payment methods</CardDescription>
              </CardHeader>
              <CardContent>
                {payments && payments.length > 0 ? (
                  <div className="space-y-4">
                    {(() => {
                      const methodStats = payments.reduce((acc, payment) => {
                        acc[payment.method] = (acc[payment.method] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>);

                      const totalPayments = payments.length;
                      const methodData = Object.entries(methodStats).map(([method, count]) => {
                        const percentage = Math.round((count / totalPayments) * 100);
                        const totalAmount = payments
                          .filter(p => p.method === method && p.status === 'paid')
                          .reduce((sum, p) => sum + Number(p.amount), 0);
                        
                        return {
                          method: method === 'cash' ? 'Cash' : 'Bank Transfer',
                          percentage,
                          amount: `PKR ${totalAmount.toFixed(2)}`,
                          count
                        };
                      });

                      return methodData.map((method, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2">
                              {getPaymentMethodIcon(method.method.toLowerCase())}
                              {method.method}
                            </span>
                            <span className="font-semibold">{method.amount}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${method.percentage}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 text-right">
                            {method.percentage}% ({method.count} payments)
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No payment data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {showPaymentForm && (
        <PaymentForm
          onClose={() => setShowPaymentForm(false)}
        />
      )}
    </div>
  );
};

export default PaymentModule;
