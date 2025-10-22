import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import {
  Member,
  CreateMemberRequest,
  UpdateMemberRequest,
  MemberFilters,
  Trainer,
  CreateTrainerRequest,
  UpdateTrainerRequest,
  Attendance,
  CreateAttendanceRequest,
  UpdateAttendanceRequest,
  AttendanceFilters,
  Plan,
  Subscription,
  CreateSubscriptionRequest,
  Payment,
  CreatePaymentRequest,
  PaymentFilters,
  DashboardStats,
  AttendanceStats,
  RevenueStats,
  PaginatedResponse,
  ApiResponse,
  DailyAttendanceTrend,
  PeakHourData,
  MemberActivityResponse,
  MonthlyRevenueData,
  PaymentMethodData,
  RenewalRateData,
  DashboardAnalyticsData,
  Expense,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpenseFilters,
  ExpenseByPerson,
  MonthlyExpenseSummary,
  ExpenseDashboardData,
  ExpenseStatistics,
  PaginatedExpenseResponse,
  MonthlyProfitsResponse,
  User,
  CreateUserRequest
} from '@/types';
import { useState, useCallback } from 'react';

// Query Keys
const queryKeys = {
  dashboard: ['dashboard'] as const,
  members: ['members'] as const,
  member: (id: number) => ['members', id] as const,
  trainers: ['trainers'] as const,
  trainer: (id: number) => ['trainers', id] as const,
  attendance: ['attendance'] as const,
  todayAttendance: ['attendance', 'today'] as const,
  attendanceStats: ['attendance', 'stats'] as const,
  subscriptions: ['subscriptions'] as const,
  subscription: (id: number) => ['subscriptions', id] as const,
  plans: ['plans'] as const,
  plan: (id: number) => ['plans', id] as const,
  payments: ['payments'] as const,
  payment: (id: number) => ['payments', id] as const,
  overduePayments: ['payments', 'overdue'] as const,
  revenueStats: ['payments', 'stats'] as const,
  profits: (dateFrom?: string, dateTo?: string) => ['profits', dateFrom, dateTo] as const,
  expenseStats: ['expense-statistics'] as const,
};

// Dashboard Hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: ApiService.getDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Member Hooks
export const useMembers = (filters?: MemberFilters) => {
  return useQuery({
    queryKey: [...queryKeys.members, filters],
    queryFn: () => ApiService.getMembers(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useMember = (id: number) => {
  return useQuery({
    queryKey: queryKeys.member(id),
    queryFn: () => ApiService.getMember(id),
    enabled: !!id,
  });
};

export const useCreateMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateMemberRequest) => ApiService.createMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members });
      toast({
        title: "Success",
        description: "Member created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create member",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMemberRequest }) =>
      ApiService.updateMember(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members });
      queryClient.invalidateQueries({ queryKey: queryKeys.member(id) });
      toast({
        title: "Success",
        description: "Member updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update member",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => ApiService.deleteMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members });
      toast({
        title: "Success",
        description: "Member deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete member",
        variant: "destructive",
      });
    },
  });
};

// Trainer Hooks
export const useTrainers = () => {
  return useQuery({
    queryKey: queryKeys.trainers,
    queryFn: ApiService.getTrainers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTrainer = (id: number) => {
  return useQuery({
    queryKey: queryKeys.trainer(id),
    queryFn: () => ApiService.getTrainer(id),
    enabled: !!id,
  });
};

export const useCreateTrainer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTrainerRequest) => ApiService.createTrainer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trainers });
      toast({
        title: "Success",
        description: "Trainer created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create trainer",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateTrainer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTrainerRequest }) =>
      ApiService.updateTrainer(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trainers });
      queryClient.invalidateQueries({ queryKey: queryKeys.trainer(id) });
      toast({
        title: "Success",
        description: "Trainer updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update trainer",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteTrainer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => ApiService.deleteTrainer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trainers });
      toast({
        title: "Success",
        description: "Trainer deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete trainer",
        variant: "destructive",
      });
    },
  });
};

// Attendance Hooks
export const useAttendance = () => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = useCallback(async (filters?: AttendanceFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.getAttendance(filters);
      setAttendance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance');
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTodayAttendance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.getTodayAttendance();
      setAttendance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch today\'s attendance');
      console.error('Error fetching today\'s attendance:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAttendance = useCallback(async (data: CreateAttendanceRequest) => {
    setLoading(true);
    setError(null);
    try {
      const newAttendance = await ApiService.createAttendance(data);
      setAttendance(prev => [...prev, newAttendance]);
      return newAttendance;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create attendance record');
      console.error('Error creating attendance:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAttendance = useCallback(async (id: number, data: UpdateAttendanceRequest) => {
    setLoading(true);
    setError(null);
    try {
      const updatedAttendance = await ApiService.updateAttendance(id, data);
      setAttendance(prev => prev.map(item => item.id === id ? updatedAttendance : item));
      return updatedAttendance;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update attendance record');
      console.error('Error updating attendance:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAttendance = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await ApiService.deleteAttendance(id);
      setAttendance(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete attendance record');
      console.error('Error deleting attendance:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    attendance,
    loading,
    error,
    fetchAttendance,
    fetchTodayAttendance,
    createAttendance,
    updateAttendance,
    deleteAttendance,
  };
};

// Subscription Hooks
export const useSubscriptions = () => {
  return useQuery({
    queryKey: queryKeys.subscriptions,
    queryFn: ApiService.getSubscriptions,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useSubscription = (id: number) => {
  return useQuery({
    queryKey: queryKeys.subscription(id),
    queryFn: () => ApiService.getSubscription(id),
    enabled: !!id,
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSubscriptionRequest) => ApiService.createSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
      toast({
        title: "Success",
        description: "Subscription created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Subscription> }) =>
      ApiService.updateSubscription(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription(id) });
      toast({
        title: "Success",
        description: "Subscription updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => ApiService.deleteSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
      toast({
        title: "Success",
        description: "Subscription deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subscription",
        variant: "destructive",
      });
    },
  });
};

// Plan Hooks
export const usePlans = () => {
  return useQuery({
    queryKey: queryKeys.plans,
    queryFn: ApiService.getPlans,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const usePlan = (id: number) => {
  return useQuery({
    queryKey: queryKeys.plan(id),
    queryFn: () => ApiService.getPlan(id),
    enabled: !!id,
  });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Plan>) => ApiService.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plans });
      toast({
        title: "Success",
        description: "Plan created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create plan",
        variant: "destructive",
      });
    },
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Plan> }) =>
      ApiService.updatePlan(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plans });
      queryClient.invalidateQueries({ queryKey: queryKeys.plan(id) });
      toast({
        title: "Success",
        description: "Plan updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update plan",
        variant: "destructive",
      });
    },
  });
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => ApiService.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plans });
      toast({
        title: "Success",
        description: "Plan deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete plan",
        variant: "destructive",
      });
    },
  });
};

// Payment Hooks
export const usePayments = (filters?: PaymentFilters) => {
  return useQuery({
    queryKey: [...queryKeys.payments, filters],
    queryFn: () => ApiService.getPayments(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const usePayment = (id: number) => {
  return useQuery({
    queryKey: queryKeys.payment(id),
    queryFn: () => ApiService.getPayment(id),
    enabled: !!id,
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePaymentRequest) => ApiService.createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      toast({
        title: "Success",
        description: "Payment created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create payment",
        variant: "destructive",
      });
    },
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Payment> }) =>
      ApiService.updatePayment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      queryClient.invalidateQueries({ queryKey: queryKeys.payment(id) });
      toast({
        title: "Success",
        description: "Payment updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update payment",
        variant: "destructive",
      });
    },
  });
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => ApiService.deletePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      toast({
        title: "Success",
        description: "Payment deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete payment",
        variant: "destructive",
      });
    },
  });
};

export const useOverduePayments = () => {
  return useQuery({
    queryKey: queryKeys.overduePayments,
    queryFn: ApiService.getOverduePayments,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRevenueStats = () => {
  return useQuery({
    queryKey: ['revenue-stats'],
    queryFn: () => ApiService.getRevenueStats(),
  });
};

// Analytics Hooks
export const useDailyAttendanceTrend = (days: number = 7) => {
  return useQuery({
    queryKey: ['daily-attendance-trend', days],
    queryFn: () => ApiService.getDailyAttendanceTrend(days),
  });
};

export const usePeakHours = () => {
  return useQuery({
    queryKey: ['peak-hours'],
    queryFn: () => ApiService.getPeakHours(),
  });
};

export const useMemberActivity = () => {
  return useQuery({
    queryKey: ['member-activity'],
    queryFn: () => ApiService.getMemberActivity(),
  });
};

export const useMonthlyRevenue = (months: number = 6) => {
  return useQuery({
    queryKey: ['monthly-revenue', months],
    queryFn: () => ApiService.getMonthlyRevenue(months),
  });
};

export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => ApiService.getPaymentMethods(),
  });
};

export const useRenewalRate = () => {
  return useQuery({
    queryKey: ['renewal-rate'],
    queryFn: () => ApiService.getRenewalRate(),
  });
};

export const useDashboardAnalytics = () => {
  return useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: ApiService.getDashboardAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Expense Hooks
export const useExpenses = (filters?: ExpenseFilters) => {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => ApiService.getExpenses(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useExpense = (id: number) => {
  return useQuery({
    queryKey: ['expense', id],
    queryFn: () => ApiService.getExpense(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateExpenseRequest) => ApiService.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['expense-statistics'] });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExpenseRequest }) => 
      ApiService.updateExpense(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense', id] });
      queryClient.invalidateQueries({ queryKey: ['expense-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['expense-statistics'] });
    },
  });
};

export const usePatchExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateExpenseRequest> }) => 
      ApiService.patchExpense(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense', id] });
      queryClient.invalidateQueries({ queryKey: ['expense-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['expense-statistics'] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => ApiService.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['expense-statistics'] });
    },
  });
};

export const useRecentExpenses = () => {
  return useQuery({
    queryKey: ['recent-expenses'],
    queryFn: ApiService.getRecentExpenses,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useExpensesByPerson = () => {
  return useQuery({
    queryKey: ['expenses-by-person'],
    queryFn: ApiService.getExpensesByPerson,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMonthlyExpenseSummary = () => {
  return useQuery({
    queryKey: ['monthly-expense-summary'],
    queryFn: ApiService.getMonthlyExpenseSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useExpenseDashboard = (dateFrom?: string, dateTo?: string) => {
  return useQuery({
    queryKey: ['expense-dashboard', dateFrom, dateTo],
    queryFn: () => ApiService.getExpenseDashboard(dateFrom, dateTo),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useExpenseStatistics = () => {
  return useQuery({
    queryKey: queryKeys.expenseStats,
    queryFn: ApiService.getExpenseStatistics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMonthlyProfits = (dateFrom?: string, dateTo?: string) => {
  return useQuery({
    queryKey: queryKeys.profits(dateFrom, dateTo),
    queryFn: () => ApiService.getMonthlyProfits(dateFrom, dateTo),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: ApiService.getUsers,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserRequest) => ApiService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateUserRequest> }) => ApiService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ApiService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ApiService.toggleUserStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
}; 