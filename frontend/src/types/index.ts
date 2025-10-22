// Member Types
export interface Member {
  id: number;
  subscriptions: Subscription[];
  attendance: Attendance[];
  trainer_detail: Trainer | null;
  full_name: string;
  email: string;
  phone: string;
  gender: 'M' | 'F' | 'O';
  dob?: string;
  address: string;
  emergency_contact: string;
  join_date: string;
  active: boolean;
  trainer?: number;
  trainer_name?: string; // For display purposes
  created_at?: string;
  updated_at?: string;
}

export interface CreateMemberRequest {
  full_name: string;
  email: string;
  phone: string;
  gender: string;
  dob?: string;
  address: string;
  emergency_contact: string;
  active: boolean;
  trainer?: number;
}

export interface UpdateMemberRequest extends Partial<CreateMemberRequest> {
  id: number;
}

// Trainer Types
export interface Trainer {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  gender: 'M' | 'F';
  expertise: string;
  join_date: string;
  is_active: boolean;
}

export interface CreateTrainerRequest {
  full_name: string;
  email: string;
  phone: string;
  gender: 'M' | 'F';
  expertise: string;
  is_active?: boolean;
}

export interface UpdateTrainerRequest extends Partial<CreateTrainerRequest> {
  id: number;
}

// Attendance Types
export interface Attendance {
  id: number;
  member: number;
  date: string;
  time: string;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
  member_name?: string; // For display purposes
  member_email?: string; // For display purposes
}

export interface CreateAttendanceRequest {
  member: number;
  status?: 'present' | 'absent' | 'late';
  remarks?: string;
}

export interface UpdateAttendanceRequest {
  status?: 'present' | 'absent' | 'late';
  remarks?: string;
}

// Subscription Types
export interface Plan {
  id: number;
  name: string;
  duration_days: number;
  price: number;
}

export interface Subscription {
  id: number;
  member: number;
  plan: number | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

export interface CreateSubscriptionRequest {
  member: number;
  plan: number;
  start_date: string;
  end_date?: string;
  is_active?: boolean;
}

// Payment Types
export interface Payment {
  id: number;
  subscription: number | null;
  amount: number;
  payment_date: string;
  status: 'paid' | 'pending' | 'failed';
  method: 'cash' | 'bank';
  member_name: string;
  member_email: string;
  subscription_plan_name: string;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
}

export interface CreatePaymentRequest {
  subscription: number;
  amount: number;
  status?: 'paid' | 'pending' | 'failed';
  method?: 'cash' | 'bank';
}

// Analytics Types
export interface DashboardStats {
  totalMembers: number;
  activeToday: number;
  monthlyRevenue: number;
  totalTrainers: number;
  activeSubscriptions: number;
  expiringSoon: number;
  pendingPayments: number;
  overduePayments: number;
}

export interface AttendanceStats {
  todayCheckins: number;
  currentlyActive: number;
  averageDuration: string;
  peakHour: string;
}

export interface RevenueStats {
  monthlyRevenue: number;
  pendingPayments: number;
  overdue: number;
  collectionRate: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter and Search Types
export interface MemberFilters {
  search?: string;
  active?: boolean;
  trainerId?: number;
  subscriptionStatus?: string;
}

export interface PaymentFilters {
  search?: string;
  status?: string;
  method?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AttendanceFilters {
  date?: string;
  memberId?: number;
  status?: string;
}

// Analytics Types
export interface DailyAttendanceTrend {
  date: string;
  present: number;
  late: number;
  absent: number;
  total: number;
}

export interface PeakHourData {
  hour: string;
  count: number;
  percentage: number;
}

export interface MemberActivityData {
  member_id: number;
  member_name: string;
  total_attendance: number;
  present_count: number;
  late_count: number;
  absent_count: number;
  attendance_rate: number;
}

export interface MemberActivityResponse {
  data: MemberActivityData[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export interface MonthlyRevenueData {
  month: string;
  revenue: number;
  payment_count: number;
  avg_payment: number;
}

export interface PaymentMethodData {
  method: string;
  count: number;
  total_amount: number;
  percentage: number;
}

export interface RenewalRateData {
  total_subscriptions: number;
  active_subscriptions: number;
  expired_subscriptions: number;
  renewal_rate: number;
  expiring_this_month: number;
  expiring_next_month: number;
}

export interface DashboardAnalyticsData {
  attendance: {
    today_present: number;
    today_late: number;
    today_absent: number;
    weekly_average: number;
    monthly_average: number;
  };
  members: {
    total_members: number;
    active_members: number;
    new_this_month: number;
    expiring_subscriptions: number;
  };
  revenue: {
    this_month: number;
    last_month: number;
    growth_percentage: number;
    pending_payments: number;
  };
  trainers: {
    total_trainers: number;
    active_trainers: number;
    total_clients: number;
  };
}

// Expense Types
export interface Expense {
  id: number;
  expense_name: string;
  person_name: string;
  amount: string;
  date: string;
  details?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateExpenseRequest {
  expense_name: string;
  person_name: string;
  amount: string;
  date: string;
  details?: string;
}

export interface UpdateExpenseRequest extends Partial<CreateExpenseRequest> {
  id: number;
}

export interface ExpenseFilters {
  person_name?: string;
  date?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  search?: string;
  ordering?: string;
  page?: number;
}

export interface ExpenseByPerson {
  person_name: string;
  total_amount: string;
  expense_count: number;
}

export interface MonthlyExpenseSummary {
  month: string;
  total_amount: string;
  expense_count: number;
  average_amount: string;
}

export interface ExpenseDashboardData {
  total_expenses: number;
  total_amount: string;
  average_amount: string;
  monthly_total: string;
  monthly_count: number;
  recent_expenses: Expense[];
  top_spenders: {
    person_name: string;
    total_spent: string;
    expense_count: number;
  }[];
  monthly_trend: {
    month: string;
    total: string;
    count: number;
  }[];
}

export interface ExpenseStatistics {
  summary: {
    total_expenses: number;
    total_amount: string;
    average_amount: string;
    min_amount: string;
    max_amount: string;
  };
  daily_breakdown: {
    day: string;
    daily_total: string;
    daily_count: number;
  }[];
  person_breakdown: {
    person_name: string;
    person_total: string;
    person_count: number;
    person_average: string;
  }[];
  date_range: {
    from: string;
    to: string;
  };
}

export interface PaginatedExpenseResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Expense[];
}

// Profits Types
export interface MonthlyProfitData {
  month: string;
  income: string;
  expenses: string;
  profit: string;
}

export interface ProfitsSummary {
  total_income: string;
  total_expenses: string;
  total_profit: string;
  months_count: number;
}

export interface DateRange {
  from: string;
  to: string;
}

export interface MonthlyProfitsResponse {
  profits_data: MonthlyProfitData[];
  date_range: DateRange;
  summary: ProfitsSummary;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  is_staff: boolean;
  is_active: boolean;
} 