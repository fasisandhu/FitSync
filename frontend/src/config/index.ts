// Environment Configuration
export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    timeout: 30000, // 30 seconds
  },
  
  // App Configuration
  app: {
    name: 'FitFlow Member Hub',
    version: '1.0.0',
    description: 'Gym Management Portal',
  },
  
  // Feature Flags
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    notifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
    realTimeUpdates: import.meta.env.VITE_ENABLE_REALTIME === 'true',
  },
  
  // Pagination
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
  
  // Date Formats
  dateFormats: {
    display: 'MMM dd, yyyy',
    input: 'yyyy-MM-dd',
    time: 'HH:mm',
    datetime: 'MMM dd, yyyy HH:mm',
  },
  
  // File Upload
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  
  // Cache Configuration
  cache: {
    staleTime: {
      dashboard: 5 * 60 * 1000, // 5 minutes
      members: 2 * 60 * 1000, // 2 minutes
      trainers: 5 * 60 * 1000, // 5 minutes
      attendance: 1 * 60 * 1000, // 1 minute
      subscriptions: 2 * 60 * 1000, // 2 minutes
      payments: 2 * 60 * 1000, // 2 minutes
      plans: 10 * 60 * 1000, // 10 minutes
    },
  },
} as const;

// Type-safe config access
export type Config = typeof config; 