export interface Car {
  id: string;
  lotNumber: string;
  vin: string;
  make: string;
  model: string;
  trim?: string;
  year: number;
  odometer: number;
  engine?: string;
  engineSize?: string;
  horsepower?: string;
  transmission?: string;
  drive?: string;
  drivetrain?: string;
  fuelType?: string;
  exteriorColor?: string;
  interiorColor?: string;
  primaryDamage?: string;
  secondaryDamage?: string;
  titleType?: string;
  location: string;
  currentBid: number;
  reservePrice?: number;
  buyItNow?: number;
  currency: string;
  images: string[];
  videoUrl?: string;
  inspectionPdf?: string;
  status: 'live' | 'upcoming' | 'ended' | 'ultimo' | 'offer_market' | 'closed' | 'pending_approval' | 'rejected';
  auctionEndDate?: string;
  sellerId?: string;
  winnerId?: string;
  keys?: string;
  runsDrives?: string;
  notes?: string;
  mileageUnit?: string;
  acceptOffers?: boolean | number;
  offerMarketEndTime?: string;
  ultimoEndTime?: string;
  description?: string;
}

export interface FeeEstimate {
  bidAmount: number;
  buyerFee: number;
  virtualBidFee: number;
  gateFee: number;
  total: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  manager: string;
  office: string;
  companyName: string;
  country: string;
  address?: string;
  address1: string;
  address2: string;
  kycStatus?: 'approved' | 'rejected' | 'pending';
  status: 'active' | 'inactive' | 'pending_approval' | 'rejected';
  deposit: number;
  buyingPower: number;
  commission: number;
  joinDate: string;
  nationalId?: string;
  commercialRegister?: string;
  showroomLicense?: string;
  iban?: string;
}

export interface Invoice {
  id: string;
  userId: string;
  carId: string;
  amount: number;
  status: 'unpaid' | 'paid' | 'pending';
  type: 'purchase' | 'transport' | 'shipping' | 'Auction Fee' | 'Purchase';
  timestamp: string;
  dueDate: string;
  pickupAuthCode?: string;
  // Joined fields
  make?: string;
  model?: string;
  year?: number;
}

export type ShipmentStatus = 'awaiting_payment' | 'paid' | 'in_transport' | 'in_warehouse' | 'in_shipping' | 'customs' | 'delivered';

export interface Shipment {
  id: string;
  carId: string;
  userId: string;
  status: ShipmentStatus;
  currentLocation?: string;
  estimatedDelivery?: string;
  trackingNotes?: string;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  make?: string;
  model?: string;
  year?: number;
  images?: string[];
  lotNumber?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string;
  content: string;
  category?: string;
  timestamp: string;
  isRead: number;
  senderFirstName?: string;
  senderLastName?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'alert' | 'bid';
  isRead: number;
  timestamp: string;
}

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  'awaiting_payment': '⏳ بانتظار الدفع',
  'paid': '✅ تم الدفع',
  'in_transport': '🚛 قيد النقل',
  'in_warehouse': '🏭 في المستودع',
  'in_shipping': '🚢 جاري الشحن',
  'customs': '📋 التخليص الجمركي',
  'delivered': '🎉 تم التوصيل'
};

export const INVOICE_TYPE_LABELS: Record<string, string> = {
  'purchase': '💳 قيمة الشراء',
  'transport': '🚛 النقل الداخلي',
  'shipping': '🚢 الشحن الدولي',
  'Auction Fee': '🔨 رسوم المزاد',
  'Purchase': '💰 الشراء'
};
export interface BranchConfig {
  id: string;
  name: string;
  englishName: string;
  logoText: string;
  logoSubtext: string;
  currency: string;
  domain: string;
  primaryColor: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  default_buying_power_multiplier?: number;
}

