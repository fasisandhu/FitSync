import { useState, useEffect } from "react";
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
  Loader2, 
  AlertCircle,
  Calendar,
  User,
  Package
} from "lucide-react";
import { Subscription, Plan, Member, CreateSubscriptionRequest } from "@/types";
import { useCreateSubscription, useUpdateSubscription, usePlans, useMembers } from "@/hooks/useApi";

interface SubscriptionFormProps {
  subscription?: Subscription | null;
  onClose: () => void;
}

const SubscriptionForm = ({ subscription, onClose }: SubscriptionFormProps) => {
  const [formData, setFormData] = useState({
    member: "",
    plan: "",
    start_date: "",
    end_date: "",
  });

  const [errors, setErrors] = useState<{
    member?: string;
    plan?: string;
    start_date?: string;
    end_date?: string;
    general?: string;
  }>({});

  const createSubscriptionMutation = useCreateSubscription();
  const updateSubscriptionMutation = useUpdateSubscription();
  const { data: plans, isLoading: plansLoading } = usePlans();
  const { data: members, isLoading: membersLoading } = useMembers();

  useEffect(() => {
    if (subscription) {
      setFormData({
        member: subscription.member.toString(),
        plan: subscription.plan?.toString() || "",
        start_date: subscription.start_date,
        end_date: subscription.end_date || "",
      });
    } else {
      // Set default start date to today
      setFormData({
        member: "",
        plan: "",
        start_date: new Date().toISOString().split('T')[0],
        end_date: "",
      });
    }
  }, [subscription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!formData.member) {
      setErrors({ member: "Member is required" });
      return;
    }
    if (!formData.plan) {
      setErrors({ plan: "Plan is required" });
      return;
    }
    if (!formData.start_date) {
      setErrors({ start_date: "Start date is required" });
      return;
    }

    const submitData: CreateSubscriptionRequest & { end_date?: string } = {
      member: parseInt(formData.member),
      plan: parseInt(formData.plan),
      start_date: formData.start_date,
    };

    if (formData.end_date) {
      submitData.end_date = formData.end_date;
    }

    try {
      if (subscription) {
        await updateSubscriptionMutation.mutateAsync({ id: subscription.id, ...submitData });
      } else {
        await createSubscriptionMutation.mutateAsync(submitData);
      }
      onClose();
    } catch (error: unknown) {
      // Error handling is managed by the mutation hooks
    }
  };

  const handleInputChange = (field: string, value: string) => {
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

  const isLoading = createSubscriptionMutation.isPending || updateSubscriptionMutation.isPending;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{subscription ? "Edit Subscription" : "Create New Subscription"}</DialogTitle>
          <DialogDescription>
            {subscription ? "Update subscription details" : "Add a new subscription for a member"}
          </DialogDescription>
        </DialogHeader>

        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="member">Member *</Label>
            <Select value={formData.member} onValueChange={(value) => handleInputChange("member", value)}>
              <SelectTrigger className={errors.member ? "border-red-500" : ""}>
                <SelectValue placeholder="Select a member" />
              </SelectTrigger>
              <SelectContent>
                {membersLoading ? (
                  <SelectItem value="" disabled>
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading members...</span>
                    </div>
                  </SelectItem>
                ) : (
                  members?.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{member.full_name}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.member && (
              <p className="text-sm text-red-600">{errors.member}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan">Plan *</Label>
            <Select value={formData.plan} onValueChange={(value) => handleInputChange("plan", value)}>
              <SelectTrigger className={errors.plan ? "border-red-500" : ""}>
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                {plansLoading ? (
                  <SelectItem value="" disabled>
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading plans...</span>
                    </div>
                  </SelectItem>
                ) : (
                  plans?.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4" />
                        <span>{plan.name} - PKR {Number(plan.price).toFixed(2)} ({plan.duration_days} days)</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.plan && (
              <p className="text-sm text-red-600">{errors.plan}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date *</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => handleInputChange("start_date", e.target.value)}
              className={errors.start_date ? "border-red-500" : ""}
            />
            {errors.start_date && (
              <p className="text-sm text-red-600">{errors.start_date}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => handleInputChange("end_date", e.target.value)}
              disabled={!subscription}
            />
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
                  <Calendar className="mr-2 h-4 w-4" />
                  {subscription ? "Update Subscription" : "Create Subscription"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionForm; 