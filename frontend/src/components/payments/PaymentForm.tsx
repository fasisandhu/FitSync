import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Loader2, 
  AlertCircle,
  DollarSign,
  CreditCard,
  Check,
  ChevronsUpDown,
  User,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Payment, Subscription, Member, Plan, CreatePaymentRequest } from "@/types";
import { useCreatePayment, useUpdatePayment, useSubscriptions, useMembers, usePlans } from "@/hooks/useApi";

interface PaymentFormProps {
  payment?: Payment | null;
  onClose: () => void;
}

const PaymentForm = ({ payment, onClose }: PaymentFormProps) => {
  const [formData, setFormData] = useState({
    subscription: "",
    amount: "",
    status: "paid" as 'paid' | 'pending' | 'failed',
    method: "cash" as 'cash' | 'bank',
  });

  const [errors, setErrors] = useState<{
    subscription?: string;
    amount?: string;
    status?: string;
    method?: string;
    general?: string;
  }>({});

  // State for searchable dropdown
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const createPaymentMutation = useCreatePayment();
  const updatePaymentMutation = useUpdatePayment();
  const { data: subscriptions, isLoading: subscriptionsLoading } = useSubscriptions();
  const { data: members, isLoading: membersLoading } = useMembers();
  const { data: plans, isLoading: plansLoading } = usePlans();

  useEffect(() => {
    if (payment) {
      setFormData({
        subscription: payment.subscription.toString(),
        amount: payment.amount.toString(),
        status: payment.status,
        method: payment.method,
      });
    } else {
      setFormData({
        subscription: "",
        amount: "",
        status: "paid",
        method: "cash",
      });
    }
  }, [payment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!formData.subscription) {
      setErrors({ subscription: "Subscription is required" });
      return;
    }
    const amount = parseFloat(formData.amount);
    if (!formData.amount || amount <= 0) {
      setErrors({ amount: "Amount must be greater than 0" });
      return;
    }

    const submitData: CreatePaymentRequest = {
      subscription: parseInt(formData.subscription),
      amount: amount,
      status: formData.status,
      method: formData.method,
    };

    try {
      if (payment) {
        await updatePaymentMutation.mutateAsync({ id: payment.id, ...formData });
      } else {
        await createPaymentMutation.mutateAsync(formData);
      }
      onClose();
    } catch (error: unknown) {
      // Error handling is managed by the mutation hooks
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const isLoading = createPaymentMutation.isPending || updatePaymentMutation.isPending;

  // Get subscription details for display
  const getSubscriptionDetails = (subscriptionId: number) => {
    const subscription = subscriptions?.find(s => s.id === subscriptionId);
    if (!subscription) return `Subscription #${subscriptionId}`;
    
    const member = subscription.member ? members?.find(m => m.id === subscription.member) : null;
    const plan = subscription.plan ? plans?.find(p => p.id === subscription.plan) : null;
    
    const memberName = member ? member.full_name : "Unknown Member";
    const planName = plan ? plan.name : "No Plan";
    
    return `${memberName} - ${planName}`;
  };

  const subscriptionOptions = useMemo(() => {
    if (!subscriptions || !members || !plans) return [];

    return subscriptions
      .map(subscription => {
        const member = members.find(m => m.id === subscription.member);
        const plan = plans.find(p => p.id === subscription.plan);
        
        if (!member || !plan) {
          return null;
        }

        return {
          value: subscription.id.toString(),
          label: `${member.full_name} - ${plan.name}`,
          memberName: member.full_name,
          memberEmail: member.email,
          planName: plan.name,
          planPrice: plan.price,
          startDate: subscription.start_date,
          endDate: subscription.end_date,
          subscription
        };
      })
      .filter(Boolean) as SubscriptionOption[];
  }, [subscriptions, members, plans]);

  const filteredSubscriptionOptions = useMemo(() => {
    if (!searchValue.trim()) return subscriptionOptions;

    const searchLower = searchValue.toLowerCase();
    return subscriptionOptions.filter(option => 
      option.memberName.toLowerCase().includes(searchLower) ||
      option.memberEmail.toLowerCase().includes(searchLower) ||
      option.planName.toLowerCase().includes(searchLower) ||
      option.value.includes(searchLower)
    );
  }, [subscriptionOptions, searchValue]);

  // Find selected subscription from all options (not filtered)
  const selectedSubscription = subscriptionOptions.find(option => option.value === formData.subscription);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{payment ? "Edit Payment" : "Record New Payment"}</DialogTitle>
          <DialogDescription>
            {payment ? "Update payment details" : "Record a new payment for a subscription"}
          </DialogDescription>
        </DialogHeader>

        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subscription">
              Subscription * 
              {subscriptions && (
                <span className="text-sm text-muted-foreground ml-2">
                  ({subscriptions.length} available)
                </span>
              )}
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    "w-full justify-between",
                    errors.subscription ? "border-red-500" : "",
                    !selectedSubscription && "text-muted-foreground"
                  )}
                >
                  {subscriptionsLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading subscriptions...</span>
                    </div>
                  ) : selectedSubscription ? (
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="truncate">{selectedSubscription.label}</span>
                    </div>
                  ) : (
                    "Select a subscription..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder={
                      subscriptionsLoading || membersLoading || plansLoading 
                        ? "Loading subscriptions..." 
                        : "Search by member name, plan name, email, or subscription ID..."
                    }
                    value={searchValue}
                    onValueChange={setSearchValue}
                    disabled={subscriptionsLoading || membersLoading || plansLoading}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {searchValue ? (
                        <div className="text-center py-6">
                          <p className="text-sm text-muted-foreground">
                            No subscriptions found for "{searchValue}"
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Try searching by member name, plan name, email, or subscription ID
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-sm text-muted-foreground">
                            No subscriptions available
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Create subscriptions for members first
                          </p>
                        </div>
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      {filteredSubscriptionOptions.length > 0 && searchValue && (
                        <div className="px-2 py-1.5 text-xs text-muted-foreground">
                          {filteredSubscriptionOptions.length} of {subscriptionOptions.length} result{filteredSubscriptionOptions.length !== 1 ? 's' : ''} found
                        </div>
                      )}
                      {filteredSubscriptionOptions.length > 0 && !searchValue && (
                        <div className="px-2 py-1.5 text-xs text-muted-foreground">
                          {subscriptionOptions.length} subscription{subscriptionOptions.length !== 1 ? 's' : ''} available
                        </div>
                      )}
                      {filteredSubscriptionOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={`${option.memberName} ${option.planName} ${option.memberEmail} ${option.value}`}
                          onSelect={() => {
                            handleInputChange("subscription", option.value);
                            setOpen(false);
                            setSearchValue("");
                          }}
                        >
                          <div className="flex items-center space-x-2 w-full">
                            <CreditCard className="h-4 w-4" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{option.memberName}</div>
                              <div className="text-sm text-muted-foreground truncate">
                                {option.planName} • {option.memberEmail}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <span>#{option.value}</span>
                              {option.subscription.is_active && (
                                <span className="px-1 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                                  Active
                                </span>
                              )}
                            </div>
                          </div>
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              formData.subscription === option.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.subscription && (
              <p className="text-sm text-red-600">{errors.subscription}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              placeholder="0.00"
              className={errors.amount ? "border-red-500" : ""}
            />
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: 'paid' | 'pending' | 'failed') => handleInputChange("status", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-600">{errors.status}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payment Method</Label>
            <Select value={formData.method} onValueChange={(value: 'cash' | 'bank') => handleInputChange("method", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
            {errors.method && (
              <p className="text-sm text-red-600">{errors.method}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  {payment ? "Update Payment" : "Record Payment"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentForm; 