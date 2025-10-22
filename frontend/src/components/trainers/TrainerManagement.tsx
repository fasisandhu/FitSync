import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Search, 
  Plus, 
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  Users,
  Star,
  Dumbbell,
  Mail,
  Phone,
  User
} from "lucide-react";
import { Trainer } from "@/types";
import { useTrainers, useDeleteTrainer } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";
import TrainerForm from "./TrainerForm";

const TrainerManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [deletingTrainer, setDeletingTrainer] = useState<Trainer | null>(null);

  // Use React Query hooks for data fetching
  const { data: trainers = [], isLoading: loading, error } = useTrainers();
  const deleteTrainerMutation = useDeleteTrainer();

  const filteredTrainers = trainers.filter(trainer => 
    trainer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.expertise.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTrainer = () => {
    setEditingTrainer(null);
    setShowForm(true);
  };

  const handleEditTrainer = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setShowForm(true);
  };

  const handleDeleteTrainer = async (trainerId: number) => {
    if (confirm('Are you sure you want to delete this trainer? This action cannot be undone.')) {
      try {
        await deleteTrainerMutation.mutateAsync(trainerId);
        // Success message is handled by the mutation hook
      } catch (error: unknown) {
        // Error message is handled by the mutation hook
      }
    }
  };

  const handleFormSuccess = () => {
    // The cache will be automatically invalidated by the mutation hooks
    setShowForm(false);
    setEditingTrainer(null);
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
    } else {
      return <Badge variant="secondary">Inactive</Badge>;
    }
  };

  const getGenderDisplay = (gender: string) => {
    return gender === 'M' ? 'Male' : 'Female';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const activeTrainers = trainers.filter(t => t.is_active).length;
  const totalTrainers = trainers.length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trainer Management</h1>
            <p className="text-gray-600">Manage gym trainers and their schedules</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trainer Management</h1>
          <p className="text-gray-600">Manage gym trainers and their schedules</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={handleAddTrainer}>
          <Plus className="h-4 w-4" />
          Add Trainer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Trainers</CardTitle>
            <Dumbbell className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrainers}</div>
            <p className="text-xs text-muted-foreground">All trainers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Trainers</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTrainers}</div>
            <p className="text-xs text-muted-foreground">Currently available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inactive Trainers</CardTitle>
            <User className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrainers - activeTrainers}</div>
            <p className="text-xs text-muted-foreground">Not available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Availability</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTrainers > 0 ? Math.round((activeTrainers / totalTrainers) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Active rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search trainers by name, expertise, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Trainers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainers.map((trainer) => (
          <Card key={trainer.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-purple-600 text-white text-sm">
                      {getInitials(trainer.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{trainer.full_name}</CardTitle>
                    <p className="text-sm text-gray-600">{trainer.expertise}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditTrainer(trainer)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => setDeletingTrainer(trainer)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove Trainer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                {getStatusBadge(trainer.is_active)}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Gender:</span>
                  <span className="font-medium">{getGenderDisplay(trainer.gender)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Join Date:</span>
                  <span className="font-medium">{formatDate(trainer.join_date)}</span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500 mb-1">Contact</p>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3 w-3 text-gray-400" />
                  <span>{trainer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-3 w-3 text-gray-400" />
                  <span>{trainer.phone}</span>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-1">Expertise</p>
                <p className="text-sm text-gray-700 line-clamp-2">{trainer.expertise}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTrainers.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No trainers found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first trainer"}
            </p>
            <Button className="gap-2" onClick={handleAddTrainer}>
              <Plus className="h-4 w-4" />
              Add Trainer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Trainer Form Modal */}
      {showForm && (
        <TrainerForm
          trainer={editingTrainer}
          onClose={() => {
            setShowForm(false);
            setEditingTrainer(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingTrainer} onOpenChange={() => setDeletingTrainer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trainer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingTrainer?.full_name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingTrainer && handleDeleteTrainer(deletingTrainer.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TrainerManagement;
