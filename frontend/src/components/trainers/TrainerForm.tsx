import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Save, UserPlus } from "lucide-react";
import { Trainer, CreateTrainerRequest, UpdateTrainerRequest } from "@/types";
import { useCreateTrainer, useUpdateTrainer } from "@/hooks/useApi";

interface TrainerFormProps {
  trainer?: Trainer | null;
  onClose: () => void;
  onSuccess: () => void;
}

const TrainerForm = ({ trainer, onClose, onSuccess }: TrainerFormProps) => {
  const [formData, setFormData] = useState<CreateTrainerRequest>({
    full_name: "",
    email: "",
    phone: "",
    gender: "M",
    expertise: "",
    is_active: true,
  });

  // Use React Query hooks for mutations
  const createTrainerMutation = useCreateTrainer();
  const updateTrainerMutation = useUpdateTrainer();

  useEffect(() => {
    if (trainer) {
      setFormData({
        full_name: trainer.full_name || "",
        email: trainer.email || "",
        phone: trainer.phone || "",
        gender: trainer.gender || "M",
        expertise: trainer.expertise || "",
        is_active: trainer.is_active,
      });
    }
  }, [trainer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (!formData.full_name.trim()) {
        throw new Error("Full name is required");
      }

      if (!formData.email.trim()) {
        throw new Error("Email is required");
      }

      if (!formData.phone.trim()) {
        throw new Error("Phone number is required");
      }

      if (!formData.expertise.trim()) {
        throw new Error("Expertise is required");
      }

      // Call the API using React Query mutations
      if (trainer) {
        await updateTrainerMutation.mutateAsync({ id: trainer.id, ...formData });
      } else {
        await createTrainerMutation.mutateAsync(formData);
      }
      onClose();
    } catch (error: unknown) {
      // Error handling is managed by the mutation hooks
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const isLoading = createTrainerMutation.isPending || updateTrainerMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl">
              {trainer ? "Edit Trainer" : "Add New Trainer"}
            </CardTitle>
            <CardDescription>
              {trainer ? "Update trainer information" : "Add a new trainer to your gym"}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange("full_name", e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange("gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expertise">Expertise *</Label>
                <Textarea
                  id="expertise"
                  value={formData.expertise}
                  onChange={(e) => handleInputChange("expertise", e.target.value)}
                  placeholder="Describe trainer's expertise, specializations, and experience"
                  rows={3}
                  required
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Status</h3>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                />
                <Label htmlFor="is_active">Active Trainer</Label>
              </div>
              
              <p className="text-sm text-gray-600">
                Active trainers can be assigned to members and appear in the trainer list.
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="gap-2">
                {isLoading ? (
                  "Saving..."
                ) : (
                  <>
                    {trainer ? <Save className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                    {trainer ? "Update Trainer" : "Add Trainer"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainerForm; 