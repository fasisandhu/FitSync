import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Loader2, 
  AlertCircle,
  Package,
  Calendar,
  DollarSign
} from "lucide-react";
import { Plan } from "@/types";
import { usePlans, useCreatePlan, useUpdatePlan, useDeletePlan } from "@/hooks/useApi";

interface PlanFormProps {
  plan?: Plan | null;
  onClose: () => void;
}

const PlanForm = ({ plan, onClose }: PlanFormProps) => {
  const [formData, setFormData] = useState({
    name: plan?.name || "",
    duration_days: plan?.duration_days || 30,
    price: plan?.price || 0,
  });

  const [errors, setErrors] = useState<{
    name?: string;
    duration_days?: string;
    price?: string;
    general?: string;
  }>({});

  const createPlanMutation = useCreatePlan();
  const updatePlanMutation = useUpdatePlan();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!formData.name.trim()) {
      setErrors({ name: "Plan name is required" });
      return;
    }
    if (formData.duration_days <= 0) {
      setErrors({ duration_days: "Duration must be greater than 0" });
      return;
    }
    if (formData.price <= 0) {
      setErrors({ price: "Price must be greater than 0" });
      return;
    }

    const submitData = {
      name: formData.name.trim(),
      duration_days: formData.duration_days,
      price: formData.price,
    };

    try {
      if (plan) {
        await updatePlanMutation.mutateAsync({ id: plan.id, data: submitData });
      } else {
        await createPlanMutation.mutateAsync(submitData);
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

  const isLoading = createPlanMutation.isPending || updatePlanMutation.isPending;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{plan ? "Edit Plan" : "Create New Plan"}</DialogTitle>
          <DialogDescription>
            {plan ? "Update plan details" : "Add a new subscription plan"}
          </DialogDescription>
        </DialogHeader>

        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Plan Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Monthly Plan"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration_days">Duration (Days) *</Label>
            <Input
              id="duration_days"
              type="number"
              min="1"
              value={formData.duration_days}
              onChange={(e) => handleInputChange("duration_days", parseInt(e.target.value))}
              placeholder="30"
              className={errors.duration_days ? "border-red-500" : ""}
            />
            {errors.duration_days && (
              <p className="text-sm text-red-600">{errors.duration_days}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleInputChange("price", parseFloat(e.target.value))}
              placeholder="99.99"
              className={errors.price ? "border-red-500" : ""}
            />
            {errors.price && (
              <p className="text-sm text-red-600">{errors.price}</p>
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
                  <Package className="mr-2 h-4 w-4" />
                  {plan ? "Update Plan" : "Create Plan"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const PlanManagement = () => {
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const { data: plans, isLoading, error } = usePlans();
  const deletePlanMutation = useDeletePlan();

  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowPlanForm(true);
  };

  const handleDeletePlan = async (planId: number) => {
    if (confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      try {
        await deletePlanMutation.mutateAsync(planId);
      } catch (error: unknown) {
        // Error message is handled by the mutation hook
      }
    }
  };

  const handlePlanFormClose = () => {
    setShowPlanForm(false);
    setSelectedPlan(null);
  };

  if (showPlanForm) {
    return (
      <PlanForm 
        plan={selectedPlan}
        onClose={handlePlanFormClose}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading plans...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Error loading plans</h3>
          <p className="text-muted-foreground">
            {error.message || 'Failed to load plans'}
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
          <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-600">Manage your gym subscription plans and pricing</p>
        </div>
        <Button 
          className="gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowPlanForm(true)}
        >
          <Plus className="h-4 w-4" />
          Add Plan
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans?.map((plan) => (
          <Card key={plan.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <p className="text-sm text-gray-600">Subscription Plan</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditPlan(plan)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeletePlan(plan.id)}
                      className="text-red-600"
                      disabled={deletePlanMutation.isPending}
                    >
                      {deletePlanMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      {deletePlanMutation.isPending ? 'Deleting...' : 'Delete'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    PKR {Number(plan.price).toFixed(2)}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {plan.duration_days} days
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Duration: {plan.duration_days} days</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span>Price: PKR {Number(plan.price).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {(!plans || plans.length === 0) && (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-lg font-semibold">No plans found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first subscription plan
            </p>
            <Button onClick={() => setShowPlanForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Plan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanManagement; 