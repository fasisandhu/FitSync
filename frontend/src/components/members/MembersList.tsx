import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  User,
  Phone,
  Mail,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Users
} from "lucide-react";
import MemberForm from "./MemberForm";
import { useMembers, useDeleteMember } from "@/hooks/useApi";
import { Member } from "@/types";

const MembersList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Debounce search term to prevent excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // API hooks - only send active filter to backend
  // Search is handled client-side to avoid API calls for every keystroke
  const filters = {
    active: statusFilter === "all" ? undefined : statusFilter === "active" ? true : false
  };
  
  const { data: members, isLoading, error } = useMembers(filters);
  const deleteMemberMutation = useDeleteMember();

  // Filter members based on search term (client-side)
  const filteredMembers = useMemo(() => {
    if (!members) return [];
    
    if (!debouncedSearchTerm.trim()) return members;
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    return members.filter(member => 
      member.full_name.toLowerCase().includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower) ||
      member.phone?.toLowerCase().includes(searchLower)
    );
  }, [members, debouncedSearchTerm]);

  // Helper function to highlight search terms
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  const getStatusBadge = (active: boolean) => {
    if (active) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
    } else {
      return <Badge variant="secondary">Inactive</Badge>;
    }
  };

  const getGenderDisplay = (gender: string) => {
    switch (gender) {
      case 'M': return 'Male';
      case 'F': return 'Female';
      case 'O': return 'Other';
      default: return 'Not specified';
    }
  };

  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setShowMemberForm(true);
  };

  const handleDeleteMember = async (memberId: number) => {
    if (confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
      try {
        await deleteMemberMutation.mutateAsync(memberId);
        // Success message is handled by the mutation hook
      } catch (error: unknown) {
        // Error message is handled by the mutation hook, but we can add additional logging
        if (error instanceof Error && error.message) {
          // Additional error handling if needed
        }
      }
    }
  };

  const handleMemberFormClose = () => {
    setShowMemberForm(false);
    setSelectedMember(null);
    // Refetch members after form closes to get updated data
    // Note: The refetch function is not available in the new useMembers hook
  };

  if (showMemberForm) {
    return (
      <MemberForm 
        member={selectedMember}
        onClose={handleMemberFormClose}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading members...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Error loading members</h3>
          <p className="text-muted-foreground">
            {error.message || 'Failed to load members'}
          </p>
        </div>
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <h3 className="text-lg font-semibold">No members found</h3>
          <p className="text-muted-foreground">
            {debouncedSearchTerm || statusFilter !== "all" 
              ? "Try adjusting your search or filters" 
              : "Get started by adding your first member"
            }
          </p>
          {!debouncedSearchTerm && statusFilter === "all" && (
            <Button onClick={() => setShowMemberForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Show filtered results message
  if (filteredMembers.length === 0 && members.length > 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Members</h1>
            <p className="text-gray-600">Manage your gym members and their subscriptions</p>
          </div>
          <div className="flex gap-3">
            <Button 
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowMemberForm(true)}
            >
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                {searchTerm !== debouncedSearchTerm && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            </div>
            
            {/* Filter Summary */}
            {(debouncedSearchTerm || statusFilter !== "all") && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Showing {filteredMembers.length} of {members?.length || 0} members</span>
                    {(debouncedSearchTerm || statusFilter !== "all") && (
                      <span>•</span>
                    )}
                    {debouncedSearchTerm && (
                      <Badge variant="outline" className="text-xs">
                        Search: "{debouncedSearchTerm}"
                      </Badge>
                    )}
                    {statusFilter !== "all" && (
                      <Badge variant="outline" className="text-xs">
                        Status: {statusFilter === "active" ? "Active" : "Inactive"}
                      </Badge>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className="text-xs"
                  >
                    Clear all
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* No results message within the same screen */}
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-lg font-semibold">No members match your search</h3>
            <p className="text-muted-foreground mb-4">
              {debouncedSearchTerm && (
                <>
                  No results found for "<strong>{debouncedSearchTerm}</strong>"
                  <br />
                  Try searching for a different name, email, or phone number
                </>
              )}
              {!debouncedSearchTerm && statusFilter !== "all" && (
                "No members match the selected status filter"
              )}
            </p>
            <div className="flex gap-2 justify-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </Button>
              {debouncedSearchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-600">Manage your gym members and their subscriptions</p>
        </div>
        <div className="flex gap-3">
          <Button 
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowMemberForm(true)}
          >
            <Plus className="h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {searchTerm !== debouncedSearchTerm && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
          
          {/* Filter Summary */}
          {(debouncedSearchTerm || statusFilter !== "all") && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Showing {filteredMembers.length} of {members?.length || 0} members</span>
                  {(debouncedSearchTerm || statusFilter !== "all") && (
                    <span>•</span>
                  )}
                  {debouncedSearchTerm && (
                    <Badge variant="outline" className="text-xs">
                      Search: "{debouncedSearchTerm}"
                    </Badge>
                  )}
                  {statusFilter !== "all" && (
                    <Badge variant="outline" className="text-xs">
                      Status: {statusFilter === "active" ? "Active" : "Inactive"}
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="text-xs"
                >
                  Clear all
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table Section */}
      <div className="overflow-x-auto w-full">
        <table className="min-w-[600px] w-full text-sm text-left">
          {/* ...table head and body... */}
        </table>
      </div>

      {/* Show members or no results message */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-600 text-white text-sm">
                        {member.full_name
                          ? member.full_name
                              .split(' ')
                              .filter(Boolean)
                              .map(n => n[0].toUpperCase())
                              .join('')
                          : member.email?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle 
                        className="text-lg"
                        dangerouslySetInnerHTML={{
                          __html: highlightText(member.full_name, debouncedSearchTerm)
                        }}
                      />
                      <p 
                        className="text-sm text-gray-600"
                        dangerouslySetInnerHTML={{
                          __html: highlightText(member.email, debouncedSearchTerm)
                        }}
                      />
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditMember(member)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteMember(member.id)}
                        className="text-red-600"
                        disabled={deleteMemberMutation.isPending}
                      >
                        {deleteMemberMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        {deleteMemberMutation.isPending ? 'Deleting...' : 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  {getStatusBadge(member.active)}
                  <span className="text-sm text-gray-500">
                    Joined: {new Date(member.join_date).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span 
                      dangerouslySetInnerHTML={{
                        __html: highlightText(member.phone, debouncedSearchTerm)
                      }}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{getGenderDisplay(member.gender)}</span>
                  </div>
                  {member.trainer_name && (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>Trainer: {member.trainer_name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // No results message - but search interface remains visible above
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-lg font-semibold">No members match your search</h3>
            <p className="text-muted-foreground mb-4">
              {debouncedSearchTerm && (
                <>
                  No results found for "<strong>{debouncedSearchTerm}</strong>"
                  <br />
                  Try searching for a different name, email, or phone number
                </>
              )}
              {!debouncedSearchTerm && statusFilter !== "all" && (
                "No members match the selected status filter"
              )}
            </p>
            <div className="flex gap-2 justify-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </Button>
              {debouncedSearchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersList;
