import { 
  Member, 
  CreateMemberRequest, 
  UpdateMemberRequest,
  Trainer,
  CreateTrainerRequest,
  UpdateTrainerRequest,
  Attendance,
  CreateAttendanceRequest,
  UpdateAttendanceRequest,
  Subscription,
  CreateSubscriptionRequest,
  Payment,
  CreatePaymentRequest,
  DashboardStats,
  AttendanceStats,
  RevenueStats,
  PaginatedResponse,
  ApiResponse,
  MemberFilters,
  PaymentFilters,
  AttendanceFilters,
  Plan,
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
  CreateUserRequest,
} from '@/types';
import { config } from '@/config';
import { getAccessToken, isTokenExpired, refreshAccessToken, logout } from '@/services/auth';

// API Configuration
const API_BASE_URL = config.api.baseUrl;

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API client
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getValidAccessToken(): Promise<string | null> {
    let token = getAccessToken();
    
    if (token && isTokenExpired(token)) {
      try {
        token = await refreshAccessToken();
      } catch (err) {
        logout();
        throw new ApiError('Session expired. Please log in again.', 401);
      }
    }
    return token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    auth: boolean = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    if (auth) {
      const token = await this.getValidAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    const config: RequestInit = {
      ...options,
      headers,
    };
    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData
        );
      }
      
      // Handle empty responses (like 204 No Content for DELETE operations)
      const contentType = response.headers.get('content-type');
      if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
        return {} as T;
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, any>, auth = true): Promise<T> {
    let url = endpoint;
    if (params) {
      // Filter out undefined, null, and empty string values
      const filteredParams: Record<string, any> = {};
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          filteredParams[key] = value;
        }
      });
      if (Object.keys(filteredParams).length > 0) {
        url = `${endpoint}?${new URLSearchParams(filteredParams)}`;
      }
    }
    return this.request<T>(url, { method: 'GET' }, auth);
  }

  // POST request
  async post<T>(endpoint: string, data?: any, auth = true): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, auth);
  }

  // PUT request
  async put<T>(endpoint: string, data?: any, auth = true): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, auth);
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any, auth = true): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }, auth);
  }

  // DELETE request
  async delete<T>(endpoint: string, auth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, auth);
  }
}

// Create API client instance
const apiClient = new ApiClient(API_BASE_URL);

// API Service class
export class ApiService {
  // Dashboard
  static async getDashboardStats(): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>('/dashboard/stats/');
  }

  // Members
  static async getMembers(filters?: MemberFilters): Promise<Member[]> {
    const response = await apiClient.get<Member[]>('/members/', filters);
    return response;
  }

  static async getMember(id: number): Promise<Member> {
    return apiClient.get<Member>(`/members/${id}/`);
  }

  static async createMember(data: CreateMemberRequest): Promise<Member> {
    return apiClient.post<Member>('/members/', data);
  }

  static async updateMember(id: number, data: UpdateMemberRequest): Promise<Member> {
    return apiClient.put<Member>(`/members/${id}/`, data);
  }

  static async deleteMember(id: number): Promise<void> {
    return apiClient.delete<void>(`/members/${id}/`);
  }

  // Trainers
  static async getTrainers(): Promise<Trainer[]> {
    return apiClient.get<Trainer[]>('/trainers/');
  }

  static async getTrainer(id: number): Promise<Trainer> {
    return apiClient.get<Trainer>(`/trainers/${id}/`);
  }

  static async createTrainer(data: CreateTrainerRequest): Promise<Trainer> {
    return apiClient.post<Trainer>('/trainers/', data);
  }

  static async updateTrainer(id: number, data: UpdateTrainerRequest): Promise<Trainer> {
    return apiClient.put<Trainer>(`/trainers/${id}/`, data);
  }

  static async deleteTrainer(id: number): Promise<void> {
    return apiClient.delete<void>(`/trainers/${id}/`);
  }

  // Attendance
  static async getAttendance(filters?: AttendanceFilters): Promise<Attendance[]> {
    return apiClient.get<Attendance[]>('/attendance/', filters);
  }

  static async getTodayAttendance(): Promise<Attendance[]> {
    const today = new Date().toISOString().split('T')[0];
    return apiClient.get<Attendance[]>('/attendance/', { date: today });
  }

  static async createAttendance(data: CreateAttendanceRequest): Promise<Attendance> {
    return apiClient.post<Attendance>('/attendance/', data);
  }

  static async updateAttendance(id: number, data: UpdateAttendanceRequest): Promise<Attendance> {
    return apiClient.patch<Attendance>(`/attendance/${id}/`, data);
  }

  static async deleteAttendance(id: number): Promise<void> {
    return apiClient.delete<void>(`/attendance/${id}/`);
  }

  // Plans
  static async getPlans(): Promise<Plan[]> {
    return apiClient.get<Plan[]>('/plans/');
  }

  static async getPlan(id: number): Promise<Plan> {
    return apiClient.get<Plan>(`/plans/${id}/`);
  }

  static async createPlan(data: { name: string; duration_days: number; price: number }): Promise<Plan> {
    return apiClient.post<Plan>('/plans/', data);
  }

  static async updatePlan(id: number, data: Partial<Plan>): Promise<Plan> {
    return apiClient.put<Plan>(`/plans/${id}/`, data);
  }

  static async deletePlan(id: number): Promise<void> {
    return apiClient.delete<void>(`/plans/${id}/`);
  }

  // Subscriptions
  static async getSubscriptions(): Promise<Subscription[]> {
    return apiClient.get<Subscription[]>('/subscriptions/');
  }

  static async getSubscription(id: number): Promise<Subscription> {
    return apiClient.get<Subscription>(`/subscriptions/${id}/`);
  }

  static async createSubscription(data: CreateSubscriptionRequest): Promise<Subscription> {
    return apiClient.post<Subscription>('/subscriptions/', data);
  }

  static async updateSubscription(id: number, data: Partial<Subscription>): Promise<Subscription> {
    return apiClient.patch<Subscription>(`/subscriptions/${id}/`, data);
  }

  static async deleteSubscription(id: number): Promise<void> {
    return apiClient.delete<void>(`/subscriptions/${id}/`);
  }

  // Payments
  static async getPayments(filters?: PaymentFilters): Promise<Payment[]> {
    return apiClient.get<Payment[]>('/payments/', filters);
  }

  static async getPayment(id: number): Promise<Payment> {
    return apiClient.get<Payment>(`/payments/${id}/`);
  }

  static async createPayment(data: CreatePaymentRequest): Promise<Payment> {
    return apiClient.post<Payment>('/payments/', data);
  }

  static async updatePayment(id: number, data: Partial<Payment>): Promise<Payment> {
    return apiClient.patch<Payment>(`/payments/${id}/`, data);
  }

  static async deletePayment(id: number): Promise<void> {
    return apiClient.delete<void>(`/payments/${id}/`);
  }

  static async getOverduePayments(): Promise<Payment[]> {
    return apiClient.get<Payment[]>('/payments/overdue/');
  }

  static async getRevenueStats(): Promise<RevenueStats> {
    return apiClient.get<RevenueStats>('/payments/stats/');
  }

  // Analytics APIs
  static async getDailyAttendanceTrend(days: number = 7): Promise<DailyAttendanceTrend[]> {
    const response = await apiClient.get<{ data: DailyAttendanceTrend[] }>(`/attendance/analytics/daily-trend/?days=${days}`);
    return response.data;
  }

  static async getPeakHours(): Promise<PeakHourData[]> {
    const response = await apiClient.get<{ data: PeakHourData[] }>('/attendance/analytics/peak-hours/');
    return response.data;
  }

  static async getMemberActivity(): Promise<MemberActivityResponse> {
    return apiClient.get<MemberActivityResponse>('/attendance/analytics/member-activity/');
  }

  static async getMonthlyRevenue(months: number = 6): Promise<MonthlyRevenueData[]> {
    const response = await apiClient.get<{ data: MonthlyRevenueData[] }>(`/payments/analytics/monthly-revenue/?months=${months}`);
    return response.data;
  }

  static async getPaymentMethods(): Promise<PaymentMethodData[]> {
    const response = await apiClient.get<{ data: PaymentMethodData[] }>('/payments/analytics/payment-methods');
    return response.data;
  }

  static async getRenewalRate(): Promise<RenewalRateData> {
    const response = await apiClient.get<{ data: RenewalRateData }>('/subscriptions/analytics/renewal-rate/');
    return response.data;
  }

  static async getDashboardAnalytics(): Promise<DashboardAnalyticsData> {
    const response = await apiClient.get<{ data: DashboardAnalyticsData }>('/dashboard/analytics/overview');
    return response.data;
  }

  // Reports and Analytics
  static async generateAttendanceReport(dateFrom: string, dateTo: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/reports/attendance/?date_from=${dateFrom}&date_to=${dateTo}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new ApiError('Failed to generate report', response.status);
    }
    
    return response.blob();
  }

  static async generatePaymentReport(dateFrom: string, dateTo: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/reports/payments/?date_from=${dateFrom}&date_to=${dateTo}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new ApiError('Failed to generate report', response.status);
    }
    
    return response.blob();
  }

  // Expenses
  static async getExpenses(filters?: ExpenseFilters): Promise<PaginatedExpenseResponse> {
    try {
      const response = await apiClient.get<Expense[] | PaginatedExpenseResponse>('/expenses/', filters);
      
      // Handle both direct array response and paginated response
      if (Array.isArray(response)) {
        // API returned direct array, wrap it in paginated format
        return {
          count: response.length,
          next: null,
          previous: null,
          results: response
        };
      } else {
        // API returned paginated response
        return response as PaginatedExpenseResponse;
      }
    } catch (error) {
      console.error('API: Error getting expenses:', error);
      throw error;
    }
  }

  static async getExpense(id: number): Promise<Expense> {
    return apiClient.get<Expense>(`/expenses/${id}/`);
  }

  static async createExpense(data: CreateExpenseRequest): Promise<Expense> {
    return apiClient.post<Expense>('/expenses/', data);
  }

  static async updateExpense(id: number, data: UpdateExpenseRequest): Promise<Expense> {
    return apiClient.put<Expense>(`/expenses/${id}/`, data);
  }

  static async patchExpense(id: number, data: Partial<CreateExpenseRequest>): Promise<Expense> {
    return apiClient.patch<Expense>(`/expenses/${id}/`, data);
  }

  static async deleteExpense(id: number): Promise<void> {
    return apiClient.delete<void>(`/expenses/${id}/`);
  }

  static async getRecentExpenses(): Promise<Expense[]> {
    return apiClient.get<Expense[]>('/expenses/recent/');
  }

  static async getExpensesByPerson(): Promise<ExpenseByPerson[]> {
    return apiClient.get<ExpenseByPerson[]>('/expenses/by_person/');
  }

  static async getMonthlyExpenseSummary(): Promise<MonthlyExpenseSummary[]> {
    return apiClient.get<MonthlyExpenseSummary[]>('/expenses/monthly_summary/');
  }

  static async getExpenseDashboard(dateFrom?: string, dateTo?: string): Promise<ExpenseDashboardData> {
    const params: Record<string, string> = {};
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    return apiClient.get<ExpenseDashboardData>('/expenses/dashboard/', params);
  }

  static async getExpenseStatistics(): Promise<ExpenseStatistics> {
    return apiClient.get<ExpenseStatistics>('/expenses/statistics/');
  }

  static async getMonthlyProfits(dateFrom?: string, dateTo?: string): Promise<MonthlyProfitsResponse> {
    const params: Record<string, string> = {};
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    return apiClient.get<MonthlyProfitsResponse>('/analytics/monthly-profits/', params);
  }

  // User Management
  static async getUsers(): Promise<User[]> {
    return apiClient.get<User[]>('/users/', undefined, true);
  }

  static async createUser(data: CreateUserRequest): Promise<User> {
    return apiClient.post<User>('/users/', data, true);
  }

  static async updateUser(id: number, data: Partial<CreateUserRequest>): Promise<User> {
    return apiClient.put<User>(`/users/${id}/`, data, true);
  }

  static async deleteUser(id: number): Promise<void> {
    return apiClient.delete<void>(`/users/${id}/`, true);
  }

  static async toggleUserStatus(id: number): Promise<{ status: string; is_active: boolean }> {
    return apiClient.post<{ status: string; is_active: boolean }>(`/users/${id}/toggle-status/`, undefined, true);
  }
}

export { ApiError }; 