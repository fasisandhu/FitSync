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
import { 
  Search, 
  Plus, 
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  Users,
  TrendingUp,
  Loader2,
  AlertCircle,
  XCircle
} from "lucide-react";
import { Subscription, Plan, Member } from "@/types";
import { useSubscriptions, usePlans, useMembers, useDeleteSubscription } from "@/hooks/useApi";
import SubscriptionForm from "./SubscriptionForm";

const SubscriptionManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  // Fetch real data from backend
  const { data: subscriptions, isLoading: subscriptionsLoading, error: subscriptionsError } = useSubscriptions();
  const { data: plans, isLoading: plansLoading } = usePlans();
  const { data: members, isLoading: membersLoading } = useMembers();
  const deleteSubscriptionMutation = useDeleteSubscription();

  // Calculate subscription stats
  const stats = useMemo(() => {
    if (!subscriptions) return [];

    const activeSubscriptions = subscriptions.filter(sub => sub.is_active);
    const expiringSoon = subscriptions.filter(sub => {
      if (!sub.is_active || !sub.end_date) return false;
      const endDate = new Date(sub.end_date);
      const today = new Date();
      const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysLeft <= 30 && daysLeft > 0;
    });
    const expired = subscriptions.filter(sub => {
      if (!sub.end_date) return false;
      const endDate = new Date(sub.end_date);
      const today = new Date();
      return endDate < today;
    });

    const totalRevenue = subscriptions.reduce((sum, sub) => {
      // Calculate revenue from subscription price
      const plan = plans?.find(p => p.id === sub.plan);
      return sum + (plan ? Number(plan.price) : 0);
    }, 0);

    return [
      { title: "Active Subscriptions", value: activeSubscriptions.length.toString(), icon: CheckCircle, color: "text-green-600" },
      { title: "Expiring Soon", value: expiringSoon.length.toString(), icon: AlertTriangle, color: "text-yellow-600" },
      { title: "Monthly Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: CreditCard, color: "text-blue-600" },
      { title: "Total Subscriptions", value: subscriptions.length.toString(), icon: Users, color: "text-purple-600" },
    ];
  }, [subscriptions, plans]);

  // Filter subscriptions
  const filteredSubscriptions = useMemo(() => {
    if (!subscriptions || !members || !plans) return [];

    return subscriptions.filter(sub => {
      const member = members.find(m => m.id === sub.member);
      const plan = plans.find(p => p.id === sub.plan);
      
      if (!member || !plan) return false;

      const matchesSearch = member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           plan.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && sub.is_active) ||
        (statusFilter === "expired" && !sub.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, members, plans, searchTerm, statusFilter]);

  const getStatusBadge = (subscription: Subscription) => {
    if (!subscription.is_active) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactive</Badge>;
    }

    if (!subscription.end_date) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
    }

    const endDate = new Date(subscription.end_date);
    const today = new Date();
    const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Expired</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
    }
  };

  const getDaysLeft = (subscription: Subscription) => {
    if (!subscription.end_date) return null;
    const endDate = new Date(subscription.end_date);
    const today = new Date();
    return Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (subscriptionsLoading || plansLoading || membersLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading subscriptions...</span>
        </div>
      </div>
    );
  }

  if (subscriptionsError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Error loading subscriptions</h3>
          <p className="text-muted-foreground">
            {subscriptionsError.message || 'Failed to load subscriptions'}
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
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600">Manage member subscriptions and pricing plans</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setShowSubscriptionForm(true)}>
          <Plus className="h-4 w-4" />
          New Subscription
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

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expiringsoon">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions List */}
      <Card>
        <CardHeader>
          <CardTitle>Member Subscriptions</CardTitle>
          <CardDescription>Current subscription status for all members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSubscriptions.map((subscription) => {
              const member = members?.find(m => m.id === subscription.member);
              const plan = plans?.find(p => p.id === subscription.plan);
              
              if (!member || !plan) return null;

              return (
                <div key={subscription.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <h4 className="font-semibold">{member.full_name}</h4>
                        <p className="text-sm text-gray-600">{plan.name}</p>
                      </div>
                      <div className="hidden sm:block">
                        {getStatusBadge(subscription)}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-6 mt-2 text-sm text-gray-600">
                      <span className="min-w-0 truncate">Price: PKR {Number(plan.price).toFixed(2)}</span>
                      <span className="min-w-0 truncate">Start: {new Date(subscription.start_date).toLocaleDateString()}</span>
                      {subscription.end_date && (
                        <span className="min-w-0 truncate">End: {new Date(subscription.end_date).toLocaleDateString()}</span>
                      )}
                      {getDaysLeft(subscription) && (
                        <span className={"min-w-0 truncate " + (getDaysLeft(subscription) <= 7 ? "text-red-600 font-medium" : "")}>{getDaysLeft(subscription)} days left</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto mt-4 sm:mt-0 bg-gray-50 sm:bg-transparent rounded-lg p-2 sm:p-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingSubscription(subscription)}
                      className="w-full sm:w-auto"
                    >
                      {getDaysLeft(subscription) && getDaysLeft(subscription) <= 0 ? "Renew" : "Manage"}
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this subscription?')) {
                          await deleteSubscriptionMutation.mutateAsync(subscription.id);
                        }
                      }}
                      disabled={deleteSubscriptionMutation.isPending}
                      className="rounded-full p-2 border border-red-200 shadow-sm"
                      aria-label="Delete subscription"
                    >
                      <XCircle className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {(showSubscriptionForm || editingSubscription) && (
        <SubscriptionForm
          subscription={editingSubscription || undefined}
          onClose={() => {
            setShowSubscriptionForm(false);
            setEditingSubscription(null);
          }}
        />
      )}
    </div>
  );
};

export default SubscriptionManagement;
