export type Screen = 'register' | 'login' | 'dashboard' | 'admin' | 'membershipTiers' | 'bookingHistory' | 'floorPlan' | 'coaches' | 'settings';

export interface ScreenProps {
  onNavigate: (screen: Screen) => void;
}

// Domain Types
export type Role = 'Customer' | 'Staff' | 'Admin';
export type MembershipTier = 'Free' | 'Silver' | 'Gold';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  membershipTier?: MembershipTier;
  avatarUrl?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
}

export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
}

export interface ApiMessageResponse {
  message: string;
}

export type TableType = 'Pool' | 'Snooker' | 'Carom';
export type TableStatus = 'Available' | 'Reserved' | 'InUse' | 'Maintenance';  

export interface BilliardTable {
  id: number;
  tableNumber: string;
  type: TableType;
  hourlyRate: number;
  status: TableStatus;
  positionX?: number;
  positionY?: number;
}

export type AdminTableDisplayStatus = 'Available' | 'Reserved' | 'InUse' | 'Maintenance' | 'Inactive';

export interface AdminTable {
  id: number;
  tableNumber: string;
  type: string;
  hourlyRate: number;
  manualStatus: string;
  displayStatus: AdminTableDisplayStatus;
  isActive: boolean;
  positionX?: number;
  positionY?: number;
  currentCustomerName?: string;
  currentSessionStartedAt?: string;
  nextBookingStartTime?: string;
  nextBookingId?: string;
  nextCustomerName?: string;
  currentSessionAmount: number;
}

export interface PendingCheckin {
  bookingId: string;
  userFullName?: string | null;
  userEmail?: string | null;
  guestName?: string | null;
  requestedTableType: TableType;
  startTime: string;
  endTime: string;
  depositAmount: number;
  availableTableCount: number;
}

export interface UpcomingWarning {
  bookingId: string;
  tableId?: number | null;
  tableNumber?: string | null;
  currentCustomerName?: string | null;
  endsAt: string;
  category: TableType;
  minutesRemaining: number;
}

export interface TableAvailabilitySlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  conflictingBookingId?: string | null;
}

export interface TableAvailabilityResponse {
  tableId: number;
  date: string;
  slots: TableAvailabilitySlot[];
}

export interface Coach {
  id: string;
  userId: string;
  fullName: string;
  specialty: string;
  bio: string;
  hourlyRate: number;
  avatarUrl: string;
  isActive: boolean;
}

export interface CoachAvailabilitySlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface FnBMenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  isAvailable: boolean;
}

export interface FnBOrder {
  id: string;
  bookingId: string;
  totalAmount: number;
  status: 'Pending' | 'Preparing' | 'Served' | 'Cancelled';
  createdAt: string;
  items: {
    menuItemId: number;
    quantity: number;
    priceAtTime: number;
  }[];
}

export interface MembershipPlan {
  id: number;
  tier: MembershipTier;
  name: string;
  monthlyPrice: number;
  tableDiscountPercent: number;
  priorityBooking: boolean;
  freeCoachingSessionsPerMonth: number;
  maxAdvanceBookingDays: number;
  isActive: boolean;
}

export interface UserMembership {
  id: string;
  userId: string;
  planId: number;
  tier: MembershipTier;
  planName: string;
  monthlyPrice: number;
  tableDiscountPercent: number;
  priorityBooking: boolean;
  freeCoachingSessionsPerMonth: number;
  maxAdvanceBookingDays: number;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  status: string;
  usedFreeCoachingSessions: number;
}

export interface SubscribeMembershipRequest {
  planId: number;
  autoRenew: boolean;
}

export interface AdminMembershipPlan {
  id: number;
  tier: MembershipTier;
  name: string;
  monthlyPrice: number;
  tableDiscountPercent: number;
  priorityBooking: boolean;
  freeCoachingSessionsPerMonth: number;
  maxAdvanceBookingDays: number;
  isActive: boolean;
  activeSubscribers: number;
}

export interface AdminUpsertMembershipPlanRequest {
  tier: MembershipTier;
  name: string;
  monthlyPrice: number;
  tableDiscountPercent: number;
  priorityBooking: boolean;
  freeCoachingSessionsPerMonth: number;
  maxAdvanceBookingDays: number;
  isActive: boolean;
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'InProgress' | 'Completed' | 'Cancelled' | 'NoShow';

export interface Booking {
  id: string;
  userId: string;
  tableId: number | null;
  tableName: string | null;
  requestedTableType: TableType;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  bookingType?: string;
  totalPrice: number;
  depositAmount?: number;
  depositForfeited?: boolean;
  checkedInAt?: string;
  checkedOutAt?: string;
  actualCost?: number;
  guestName?: string;
  createdAt: string;
  coachingSession?: {
    coachId: string;
    coachName: string;
    hourlyRate: number;
  };
  fnBOrders?: FnBOrder[];
}

export interface BookingListResponse {
  items: Booking[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateFnBOrderRequest {
  menuItemId: number;
  quantity: number;
}

export interface CreateBookingRequest {
  requestedTableType: TableType;
  bookingDate: string;
  startTime: string;
  endTime: string;
  fnBOrders?: CreateFnBOrderRequest[];
}

export interface CreateCoachingSessionRequest {
  coachId: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
}

export interface CoachingSession {
  id: string;
  coachId: string;
  studentUserId: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  cost: number;
}

export interface CategoryAvailabilitySlot {
  startTime: string;
  endTime: string;
  available: number;
  capacity: number;
}

export interface CategoryAvailability {
  tableType: TableType;
  date: string;
  slots: CategoryAvailabilitySlot[];
}


export interface CreateBookingResponse {
  message: string;
  bookingId: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  paymentMethod: 'Cash' | 'CreditCard' | 'BankTransfer' | 'EWallet';
  transactionId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface CreateTableRequest {
  tableNumber: string;
  type: TableType;
  hourlyRate: number;
  status: TableStatus;
}

export interface UpdateTableRequest {
  tableNumber?: string;
  type?: TableType;
  hourlyRate?: number;
  status?: TableStatus;
}
