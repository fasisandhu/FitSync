import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ArrowLeft, Save, User, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Member, CreateMemberRequest, UpdateMemberRequest } from "@/types";
import { useCreateMember, useUpdateMember, useTrainers } from "@/hooks/useApi";

interface MemberFormProps {
  member?: Member | null;
  onClose: () => void;
}

const MemberForm = ({ member, onClose }: MemberFormProps) => {
  const [formData, setFormData] = useState({
    full_name: member?.full_name || "",
    email: member?.email || "",
    phone: member?.phone || "",
    gender: member?.gender || "",
    dob: member?.dob ? new Date(member.dob) : undefined,
    address: member?.address || "",
    emergency_contact: member?.emergency_contact || "",
    active: member?.active ?? true,
    trainer: member?.trainer || "",
  });

  const [errors, setErrors] = useState<{
    email?: string;
    phone?: string;
    general?: string;
  }>({});

  const { data: trainers } = useTrainers();
  const createMemberMutation = useCreateMember();
  const updateMemberMutation = useUpdateMember();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors: Record<string, string> = {};
    if (!formData.full_name.trim()) newErrors.full_name = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const finalSubmitData = {
      ...formData,
      full_name: formData.full_name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      emergency_contact: formData.emergency_contact.trim(),
    };

    try {
      if (member) {
        await updateMemberMutation.mutateAsync({ id: member.id, ...finalSubmitData });
      } else {
        await createMemberMutation.mutateAsync(finalSubmitData);
      }
      onClose();
    } catch (error) {
      // Error handling is managed by the mutation hooks
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const isLoading = createMemberMutation.isPending || updateMemberMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {member ? "Edit Member" : "Add New Member"}
            </h1>
            <p className="text-gray-600">
              {member ? "Update member information" : "Add a new member to your gym"}
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Personal Information */}
          <Card className="lg:col-span-2 w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Basic member details and contact information</CardDescription>
              {member && (
                <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                  💡 <strong>Note:</strong> If you haven't changed the email or phone number, you can keep the same values. 
                  The system will only show an error if you try to use an email or phone that belongs to another member.
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange("full_name", e.target.value)}
                    placeholder="Enter full name"
                    required
                    className="w-full"
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
                    className={errors.email ? "border-red-500" : "w-full"}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
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
                    className={errors.phone ? "border-red-500" : "w-full"}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)} className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                      <SelectItem value="O">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.dob && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dob ? format(formData.dob, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.dob}
                        onSelect={(date) => handleInputChange("dob", date)}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact">Emergency Contact *</Label>
                  <Input
                    id="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={(e) => handleInputChange("emergency_contact", e.target.value)}
                    placeholder="Enter emergency contact number"
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter address"
                  rows={3}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Member status and trainer assignment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="trainer">Assigned Trainer</Label>
                <Select value={formData.trainer || undefined} onValueChange={(value) => handleInputChange("trainer", value)} className="w-full">
                  <SelectTrigger>
                    <SelectValue placeholder="Select trainer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No trainer assigned</SelectItem>
                    {trainers?.filter(trainer => {
                      // Handle different possible field names from Django
                      const isActive = trainer.is_active !== undefined ? trainer.is_active : 
                                     (trainer as any).isActive !== undefined ? (trainer as any).isActive :
                                     (trainer as any).active !== undefined ? (trainer as any).active : true;
                      return isActive === true;
                    }).map((trainer) => (
                      <SelectItem key={trainer.id} value={trainer.id.toString()}>
                        {trainer.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {trainers && trainers.length === 0 && (
                  <p className="text-sm text-amber-600">No trainers available. Please add trainers first.</p>
                )}
                {trainers && trainers.length > 0 && trainers.filter(t => t.is_active).length === 0 && (
                  <p className="text-sm text-amber-600">No active trainers available.</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="active">Active Member</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable member access
                  </p>
                </div>
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => handleInputChange("active", checked)}
                />
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {member ? "Update Member" : "Create Member"}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default MemberForm;
