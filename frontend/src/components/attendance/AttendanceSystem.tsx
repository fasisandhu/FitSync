import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  UserCheck, 
  Clock, 
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useAttendance, useMembers } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";
import { Attendance, Member, CreateAttendanceRequest } from "@/types";
import { ApiService } from "@/services/api";

const AttendanceSystem = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'present' | 'absent' | 'late'>('present');
  const [remarks, setRemarks] = useState("");
  const [historicalAttendance, setHistoricalAttendance] = useState<Attendance[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [checkInLoading, setCheckInLoading] = useState(false);

  const { toast } = useToast();
  const { 
    attendance, 
    loading: attendanceLoading, 
    error: attendanceError,
    fetchTodayAttendance, 
    fetchAttendance,
    createAttendance,
    updateAttendance,
    deleteAttendance 
  } = useAttendance();

  const { 
    data: members = [], 
    isLoading: membersLoading, 
    error: membersError,
    refetch: refetchMembers 
  } = useMembers();

  // Filter members based on search term
  const filteredMembers = (members || []).filter(member =>
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm)
  );

  // Function to get member name by ID
  const getMemberName = (memberId: number) => {
    const member = members.find(m => m.id === memberId);
    return member ? member.full_name : `Member ${memberId}`;
  };

  // Function to get member initials by ID
  const getMemberInitials = (memberId: number) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      return member.full_name.split(' ').map(n => n[0]).join('');
    }
    return 'M';
  };

  // Compute stats from attendance data
  const todayCheckins = attendance.filter(a => a.status === 'present').length;
  const lateCheckins = attendance.filter(a => a.status === 'late').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;
  const totalToday = attendance.length;

  // Load initial data
  useEffect(() => {
    fetchTodayAttendance();
  }, [fetchTodayAttendance]);

  // Function to fetch historical attendance
  const fetchHistoricalAttendance = async (date: string, statusFilter?: string) => {
    setHistoryLoading(true);
    try {
      const filters: any = { date };
      if (statusFilter && statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      
      const data = await ApiService.getAttendance(filters);
      setHistoricalAttendance(data);
    } catch (error) {
      // Error handling can be added here if needed
    } finally {
      setHistoryLoading(false);
    }
  };

  // Filter historical attendance based on selected status
  const filteredHistoricalAttendance = useMemo(() => {
    if (!historicalAttendance) return [];
    
    if (selectedStatusFilter === 'all') return historicalAttendance;
    
    return historicalAttendance.filter(record => record.status === selectedStatusFilter);
  }, [historicalAttendance, selectedStatusFilter]);

  const handleCheckIn = async () => {
    if (!selectedMember) return;
    setCheckInLoading(true);
    try {
      const attendanceData: CreateAttendanceRequest = {
        member: selectedMember.id,
        status: selectedStatus,
        remarks: remarks.trim() || undefined,
      };
      await ApiService.createAttendance(attendanceData);
      setSelectedMember(null);
      setSelectedStatus('present');
      setRemarks('');
      setSearchTerm('');
      // Refetch attendance data instead of reloading
      await fetchTodayAttendance();
    } catch (error) {
      // Error handling can be added here if needed
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleUpdateStatus = async (attendanceId: number, newStatus: 'present' | 'absent' | 'late') => {
    try {
      await ApiService.updateAttendance(attendanceId, { status: newStatus });
      // Refetch attendance data instead of reloading
      await fetchTodayAttendance();
    } catch (error) {
      // Error handling can be added here if needed
    }
  };

  const handleDeleteAttendance = async (attendanceId: number) => {
    if (confirm('Are you sure you want to delete this attendance record?')) {
      try {
        await ApiService.deleteAttendance(attendanceId);
        // Refetch attendance data instead of reloading
        await fetchTodayAttendance();
      } catch (error) {
        // Error handling can be added here if needed
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Present</Badge>;
      case "late":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Late</Badge>;
      case "absent":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Absent</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return timeString;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (attendanceError || membersError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600">
            {attendanceError || membersError}
          </p>
          <Button 
            onClick={() => {
              fetchTodayAttendance();
              refetchMembers();
            }}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance System</h1>
          <p className="text-gray-600">Track member check-ins and gym usage patterns</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {attendanceLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Loading...
                </CardTitle>
                <Loader2 className="h-4 w-4 animate-spin" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
              </CardContent>
            </Card>
          ))
        ) : (
          [
            { title: "Today's Present", value: todayCheckins.toString(), icon: UserCheck, color: "text-green-600" },
            { title: "Late Arrivals", value: lateCheckins.toString(), icon: Clock, color: "text-yellow-600" },
            { title: "Absent", value: absentCount.toString(), icon: XCircle, color: "text-red-600" },
          ].map((stat, index) => (
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
          ))
        )}
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList className="grid w-full max-w-xl grid-cols-2 sm:grid-cols-4 overflow-x-auto flex-nowrap">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6">
          {/* Check-in Form */}
          <Card>
            <CardHeader>
              <CardTitle>Mark Attendance</CardTitle>
              <CardDescription>Search and mark attendance for members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Member Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search member by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Member Selection */}
              {searchTerm && filteredMembers.length > 0 && (
                <div className="border rounded-lg max-h-48 overflow-y-auto">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                        selectedMember?.id === member.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedMember(member)}
                    >
                      <div className="font-medium">{member.full_name}</div>
                      <div className="text-sm text-gray-600">{member.email}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Member Display */}
              {selectedMember && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-green-600 text-white">
                        {selectedMember.full_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{selectedMember.full_name}</div>
                      <div className="text-sm text-gray-600">{selectedMember.email}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedMember(null)}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              )}

              {/* Status and Remarks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={selectedStatus} onValueChange={(value: 'present' | 'absent' | 'late') => setSelectedStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Remarks (Optional)</label>
                  <Input
                    placeholder="Add any remarks..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={handleCheckIn}
                disabled={!selectedMember || checkInLoading}
                className="w-full gap-2"
              >
                {checkInLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserCheck className="h-4 w-4" />
                )}
                Mark Attendance
              </Button>
            </CardContent>
          </Card>

          {/* Today's Attendance */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
              <CardDescription>Current attendance for {formatDate(new Date().toISOString())}</CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading attendance...
                </div>
              ) : attendance.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No attendance records for today</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {attendance.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-600 text-white">
                            {getMemberInitials(record.member)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{getMemberName(record.member)}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Time: {formatTime(record.time)}</span>
                            {record.remarks && <span>Remarks: {record.remarks}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 mt-3 sm:mt-0 bg-gray-50 sm:bg-transparent rounded-lg p-2 sm:p-0 w-full sm:w-auto">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(record.status)}
                          <Select 
                            value={record.status} 
                            onValueChange={(value: 'present' | 'absent' | 'late') => handleUpdateStatus(record.id, value)}
                          >
                            <SelectTrigger className="w-full max-w-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-50 max-w-xs">
                              <SelectItem value="present">Present</SelectItem>
                              <SelectItem value="late">Late</SelectItem>
                              <SelectItem value="absent">Absent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleDeleteAttendance(record.id)}
                          className="text-red-600 hover:text-red-700 rounded-full p-2 border border-red-200 shadow-sm"
                          aria-label="Delete attendance record"
                        >
                          <XCircle className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>View historical attendance data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setSelectedDate(newDate);
                    fetchHistoricalAttendance(newDate, selectedStatusFilter);
                  }}
                  className="w-40"
                />
                <Select 
                  value={selectedStatusFilter} 
                  onValueChange={(value) => {
                    setSelectedStatusFilter(value);
                    fetchHistoricalAttendance(selectedDate, value);
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={() => {
                    fetchHistoricalAttendance(selectedDate, selectedStatusFilter);
                  }}
                  variant="outline"
                >
                  Refresh
                </Button>
              </div>
              
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading historical attendance...
                </div>
              ) : filteredHistoricalAttendance.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No attendance records found for {formatDate(selectedDate)}</p>
                  {selectedStatusFilter !== 'all' && (
                    <p className="text-sm mt-2">Try changing the status filter or select a different date</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Attendance for {formatDate(selectedDate)}
                    </h3>
                    <Badge variant="outline">
                      {filteredHistoricalAttendance.length} records
                    </Badge>
                  </div>
                  
                  {filteredHistoricalAttendance.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-600 text-white">
                            {getMemberInitials(record.member)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{getMemberName(record.member)}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Time: {formatTime(record.time)}</span>
                            {record.remarks && <span>Remarks: {record.remarks}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 mt-3 sm:mt-0 bg-gray-50 sm:bg-transparent rounded-lg p-2 sm:p-0 w-full sm:w-auto">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(record.status)}
                          <Select 
                            value={record.status} 
                            onValueChange={(value: 'present' | 'absent' | 'late') => handleUpdateStatus(record.id, value)}
                          >
                            <SelectTrigger className="w-full max-w-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-50 max-w-xs">
                              <SelectItem value="present">Present</SelectItem>
                              <SelectItem value="late">Late</SelectItem>
                              <SelectItem value="absent">Absent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleDeleteAttendance(record.id)}
                          className="text-red-600 hover:text-red-700 rounded-full p-2 border border-red-200 shadow-sm"
                          aria-label="Delete attendance record"
                        >
                          <XCircle className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Attendance Table Section */}
      <div className="overflow-x-auto w-full">
        <table className="min-w-[600px] w-full text-sm text-left">
          {/* ...table head and body... */}
        </table>
      </div>
    </div>
  );
};

export default AttendanceSystem;
