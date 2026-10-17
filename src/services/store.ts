import {
  User,
  Store,
  Product,
  Category,
  Order,
  OrderStatus,
  OrderStatusHistoryItem,
  Delivery,
  CourierProfile,
  DeliveryZone,
  PlatformSettings,
  UserRole,
  DeliveryLocation,
  CustomerAddress,
  FavoriteItem,
  OrderReview,
  CustomerNotification,
  PaymentSettings,
  CommissionSettings,
  Branch,
  FinancialVerificationStatus,
  UserPaymentProfile,
  WithdrawalStatus,
  WithdrawalMethod,
  WithdrawalRequest,
  TransactionType,
  FinancialTransaction,
  FinancialAuditLog,
} from '../types';
import { calculateHaversineDistance, formatDistanceArabic, formatDurationArabic } from './routing';

const STORAGE_KEY = 'lbab_dar_state_v3';

export interface AppState {
  users: User[];
  stores: Store[];
  products: Product[];
  categories: Category[];
  orders: Order[];
  couriers: CourierProfile[];
  deliveryZones: DeliveryZone[];
  settings: PlatformSettings;
  addresses: CustomerAddress[];
  favorites: FavoriteItem[];
  reviews: OrderReview[];
  notifications: CustomerNotification[];
  branches: Branch[];
  paymentSettings: PaymentSettings;
  commissionSettings: CommissionSettings;
  paymentProfiles: UserPaymentProfile[];
  withdrawalRequests: WithdrawalRequest[];
  transactions: FinancialTransaction[];
  auditLogs: FinancialAuditLog[];
}

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat_restaurants', name: 'مطاعم', iconName: 'UtensilsCrossed', displayOrder: 1 },
  { id: 'cat_groceries', name: 'بقالة', iconName: 'ShoppingBag', displayOrder: 2 },
  { id: 'cat_bakery', name: 'مخابز', iconName: 'CakeSlice', displayOrder: 3 },
  { id: 'cat_sweets', name: 'حلويات', iconName: 'Sparkles', displayOrder: 4 },
  { id: 'cat_beverages', name: 'مشروبات', iconName: 'Coffee', displayOrder: 5 },
  { id: 'cat_fruits', name: 'خضر وفواكه', iconName: 'Apple', displayOrder: 6 },
  { id: 'cat_meat', name: 'لحوم', iconName: 'Beef', displayOrder: 7 },
  { id: 'cat_pharmacy', name: 'صيدليات', iconName: 'HeartPulse', displayOrder: 8 },
  { id: 'cat_electronics', name: 'إلكترونيات', iconName: 'Laptop', displayOrder: 9 },
  { id: 'cat_home', name: 'مستلزمات منزلية', iconName: 'Package', displayOrder: 10 },
];

const INITIAL_ZONES: DeliveryZone[] = [
  { id: 'zone_algiers_center', name: 'الجزائر الوسطى وسيدي امحمد', wilayaCode: '16', deliveryFee: 250, estimatedMinutes: 30, isActive: true },
  { id: 'zone_algiers_west', name: 'الجزائر غرب (حيدرة، بن عكنون، دالي براهيم)', wilayaCode: '16', deliveryFee: 300, estimatedMinutes: 35, isActive: true },
  { id: 'zone_algiers_east', name: 'الجزائر شرق (باب الزوار، الحراش، برج الكيفان)', wilayaCode: '16', deliveryFee: 350, estimatedMinutes: 40, isActive: true },
  { id: 'zone_oran', name: 'وهران (المدينة، الباهية، إيسطو)', wilayaCode: '31', deliveryFee: 300, estimatedMinutes: 35, isActive: true },
  { id: 'zone_constantine', name: 'قسنطينة (سيدي مبروك، علي منجلي)', wilayaCode: '25', deliveryFee: 300, estimatedMinutes: 35, isActive: true },
  { id: 'zone_blida', name: 'البليدة (وسط المدينة، أولاد يعيش)', wilayaCode: '09', deliveryFee: 250, estimatedMinutes: 30, isActive: true },
];

const INITIAL_USERS: User[] = [
  {
    id: 'user_admin',
    email: 'lehrauataha@gmail.com',
    fullName: 'طه لحراوة (مدير المنصة)',
    phone: '0550123456',
    role: 'ADMIN',
    isActive: true,
    isVerified: true,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'user_admin_2',
    email: 'admin@lbabdar.dz',
    fullName: 'إدارة لباب الدار',
    phone: '0550999888',
    role: 'ADMIN',
    isActive: true,
    isVerified: true,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'user_merchant_1',
    email: 'merchant@lbabdar.dz',
    fullName: 'الحاج رشيد بلقاسم',
    phone: '0661234567',
    role: 'MERCHANT',
    storeId: 'store_kasbah',
    isActive: true,
    isVerified: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'user_courier_1',
    email: 'courier@lbabdar.dz',
    fullName: 'ياسين بوزيد',
    phone: '0770987654',
    role: 'COURIER',
    courierId: 'courier_yassine',
    isActive: true,
    isVerified: true,
    createdAt: '2026-01-15T11:00:00Z',
    updatedAt: '2026-01-15T11:00:00Z',
  },
  {
    id: 'user_customer_1',
    email: 'client@lbabdar.dz',
    fullName: 'أمين بن علي',
    phone: '0560112233',
    role: 'CUSTOMER',
    isActive: true,
    isVerified: true,
    createdAt: '2026-02-01T14:00:00Z',
    updatedAt: '2026-02-01T14:00:00Z',
  },
];

const INITIAL_STORES: Store[] = [
  {
    id: 'store_kasbah',
    merchantId: 'user_merchant_1',
    name: 'مطعم القصبة العتيقة',
    description: 'أشهى المأكولات التقليدية الجزائرية العريقة، رشتة عاصمية وشخشوخة وطواجن بلحم بلدي',
    category: 'cat_restaurants',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&auto=format&fit=crop&q=80',
    phone: '0661234567',
    wilaya: 'الجزائر العاصمة',
    commune: 'سيدي امحمد',
    address: 'شارع ديدوش مراد، الجزائر',
    latitude: 36.7695,
    longitude: 3.0558,
    rating: 4.9,
    reviewCount: 142,
    deliveryTimeMin: 25,
    deliveryTimeMax: 40,
    deliveryFee: 250,
    minimumOrder: 800,
    isOpen: true,
    isVerified: true,
    isFeatured: true,
    isPopular: true,
    openingHours: '11:30 - 23:00',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'store_bahja_pizza',
    merchantId: 'user_merchant_2',
    name: 'بيتزا وتاكوس البهجة',
    description: 'أفضل بيتزا إيطالية بلمسة جزائرية، تاكوس محشو بالجبن والصلصات الحارة الخاصة',
    category: 'cat_restaurants',
    logoUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?w=1000&auto=format&fit=crop&q=80',
    phone: '0555332211',
    wilaya: 'الجزائر العاصمة',
    commune: 'باب الزوار',
    address: 'حي المصالحة، قرب الجامعة، باب الزوار',
    latitude: 36.7165,
    longitude: 3.1852,
    rating: 4.8,
    reviewCount: 98,
    deliveryTimeMin: 20,
    deliveryTimeMax: 35,
    deliveryFee: 200,
    minimumOrder: 700,
    isOpen: true,
    isVerified: true,
    isFeatured: true,
    isPopular: true,
    openingHours: '12:00 - 00:00',
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-01-12T10:00:00Z',
  },
  {
    id: 'store_snouber_sweets',
    merchantId: 'user_merchant_3',
    name: 'حلويات الصنوبر العصرية',
    description: 'حلويات تقليدية وعصرية جزائرية، قلب اللوز بالعسل الحر، بقلاوة مورقة ومقروط عسل',
    category: 'cat_sweets',
    logoUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=300&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1000&auto=format&fit=crop&q=80',
    phone: '0770112233',
    wilaya: 'الجزائر العاصمة',
    commune: 'حيدرة',
    address: 'ساحة القدس، حيدرة',
    latitude: 36.7452,
    longitude: 3.0371,
    rating: 4.9,
    reviewCount: 86,
    deliveryTimeMin: 30,
    deliveryTimeMax: 50,
    deliveryFee: 300,
    minimumOrder: 1000,
    isOpen: true,
    isVerified: true,
    isFeatured: false,
    isPopular: true,
    openingHours: '08:00 - 20:00',
    createdAt: '2026-01-14T10:00:00Z',
    updatedAt: '2026-01-14T10:00:00Z',
  },
  {
    id: 'store_baraka_bakery',
    merchantId: 'user_merchant_6',
    name: 'مخبزة وحلويات البركة العصرية',
    description: 'أجود أنواع الخبز التقليدي والفرنسي، بريوش طازج، كرواسون بالزبدة الطبيعية وفطائر ساخنة',
    category: 'cat_bakery',
    logoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1000&auto=format&fit=crop&q=80',
    phone: '0551224466',
    wilaya: 'الجزائر العاصمة',
    commune: 'القبة',
    address: 'شارع فلسطين، القبة القديمة',
    latitude: 36.7265,
    longitude: 3.0721,
    rating: 4.8,
    reviewCount: 72,
    deliveryTimeMin: 20,
    deliveryTimeMax: 35,
    deliveryFee: 200,
    minimumOrder: 500,
    isOpen: true,
    isVerified: true,
    isFeatured: true,
    isPopular: true,
    openingHours: '06:00 - 20:00',
    createdAt: '2026-01-19T10:00:00Z',
    updatedAt: '2026-01-19T10:00:00Z',
  },
  {
    id: 'store_oasis_beverages',
    merchantId: 'user_merchant_7',
    name: 'مشروبات وعصائر الواحة الطبيعية',
    description: 'عصائر فواكه طازجة معصورة في الحين، شاي صحراوي ملقم بالنعناع، قهوة مختصة وكوكتيلات منعشة',
    category: 'cat_beverages',
    logoUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1000&auto=format&fit=crop&q=80',
    phone: '0561998877',
    wilaya: 'الجزائر العاصمة',
    commune: 'المرادية',
    address: 'شارع الشهداء، المرادية',
    latitude: 36.7412,
    longitude: 3.0519,
    rating: 4.7,
    reviewCount: 54,
    deliveryTimeMin: 15,
    deliveryTimeMax: 30,
    deliveryFee: 200,
    minimumOrder: 600,
    isOpen: true,
    isVerified: true,
    isFeatured: false,
    isPopular: true,
    openingHours: '09:00 - 23:00',
    createdAt: '2026-01-21T10:00:00Z',
    updatedAt: '2026-01-21T10:00:00Z',
  },
  {
    id: 'store_amana_butchery',
    merchantId: 'user_merchant_8',
    name: 'قصابة الأمانة للحوم الطازجة',
    description: 'لحوم حمراء طازجة محليا (غنم وبقر)، دجاج بلدي مذبوح وفق الشريعة الإسلامية، مرقاز عاصمي متبل',
    category: 'cat_meat',
    logoUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=1000&auto=format&fit=crop&q=80',
    phone: '0772334455',
    wilaya: 'الجزائر العاصمة',
    commune: 'بئر مراد رايس',
    address: 'طريق عين النعجة، بئر خادم',
    latitude: 36.7210,
    longitude: 3.0540,
    rating: 4.9,
    reviewCount: 91,
    deliveryTimeMin: 25,
    deliveryTimeMax: 45,
    deliveryFee: 250,
    minimumOrder: 1500,
    isOpen: true,
    isVerified: true,
    isFeatured: true,
    isPopular: true,
    openingHours: '08:00 - 19:30',
    createdAt: '2026-01-22T10:00:00Z',
    updatedAt: '2026-01-22T10:00:00Z',
  },
  {
    id: 'store_nour_pharmacy',
    merchantId: 'user_merchant_9',
    name: 'صيدلية النور والشفاء',
    description: 'مستحضرات العناية بالبشرة والطفل، مكملات غذائية، فيتامينات، حليب الأطفال، وأجهزة قياس الضغط والسكري',
    category: 'cat_pharmacy',
    logoUrl: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=300&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1000&auto=format&fit=crop&q=80',
    phone: '0550887766',
    wilaya: 'الجزائر العاصمة',
    commune: 'الأبيار',
    address: 'ساحة كارنو، الأبيار',
    latitude: 36.7620,
    longitude: 3.0310,
    rating: 4.9,
    reviewCount: 110,
    deliveryTimeMin: 20,
    deliveryTimeMax: 35,
    deliveryFee: 250,
    minimumOrder: 800,
    isOpen: true,
    isVerified: true,
    isFeatured: true,
    isPopular: true,
    openingHours: '08:00 - 22:00',
    createdAt: '2026-01-23T10:00:00Z',
    updatedAt: '2026-01-23T10:00:00Z',
  },
  {
    id: 'store_digital_zone',
    merchantId: 'user_merchant_10',
    name: 'ديجيتال زون للإلكترونيات الذكية',
    description: 'شواحن سريعة معتمدة، كوابل أصلية، بنوك طاقة، سماعات رأس لاسلكية، ومستلزمات الهواتف المحمولة',
    category: 'cat_electronics',
    logoUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1000&auto=format&fit=crop&q=80',
    phone: '0661223344',
    wilaya: 'الجزائر العاصمة',
    commune: 'سيدي امحمد',
    address: 'شارع حسيبة بن بوعلي، الجزائر',
    latitude: 36.7650,
    longitude: 3.0590,
    rating: 4.8,
    reviewCount: 63,
    deliveryTimeMin: 30,
    deliveryTimeMax: 50,
    deliveryFee: 300,
    minimumOrder: 1000,
    isOpen: true,
    isVerified: true,
    isFeatured: false,
    isPopular: false,
    openingHours: '09:00 - 20:00',
    createdAt: '2026-01-24T10:00:00Z',
    updatedAt: '2026-01-24T10:00:00Z',
  },
  {
    id: 'store_dar_elkhir',
    merchantId: 'user_merchant_11',
    name: 'دار الخير للأواني والمستلزمات',
    description: 'أطقم تقديم شاي وقهوة جزائرية أصيلة، مواد تنظيف عالية الجودة، أواني طهي ومنظمات منزلية عملية',
    category: 'cat_home',
    logoUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=300&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&auto=format&fit=crop&q=80',
    phone: '0770554433',
    wilaya: 'الجزائر العاصمة',
    commune: 'الحراش',
    address: 'شارع بومعزة، الحراش',
    latitude: 36.7200,
    longitude: 3.1300,
    rating: 4.6,
    reviewCount: 38,
    deliveryTimeMin: 35,
    deliveryTimeMax: 60,
    deliveryFee: 300,
    minimumOrder: 1200,
    isOpen: true,
    isVerified: true,
    isFeatured: false,
    isPopular: false,
    openingHours: '08:30 - 19:30',
    createdAt: '2026-01-25T10:00:00Z',
    updatedAt: '2026-01-25T10:00:00Z',
  },
  {
    id: 'store_superette_waha',
    merchantId: 'user_merchant_4',
    name: 'سوبرماركت الواحة للمواد الغذائية',
    description: 'جميع المواد الاستهلاكية والغذائية، منتجات الألبان، المشروبات، ومنتجات التنظيف بأفضل الأسعار',
    category: 'cat_groceries',
    logoUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=300&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000&auto=format&fit=crop&q=80',
    phone: '0560445566',
    wilaya: 'الجزائر العاصمة',
    commune: 'دالي براهيم',
    address: 'شارع الإخوة بوعدو، دالي براهيم',
    latitude: 36.7512,
    longitude: 2.9854,
    rating: 4.7,
    reviewCount: 65,
    deliveryTimeMin: 25,
    deliveryTimeMax: 45,
    deliveryFee: 250,
    minimumOrder: 1200,
    isOpen: true,
    isVerified: true,
    isFeatured: true,
    isPopular: false,
    openingHours: '07:30 - 22:30',
    createdAt: '2026-01-18T10:00:00Z',
    updatedAt: '2026-01-18T10:00:00Z',
  },
  {
    id: 'store_fresh_fruits',
    merchantId: 'user_merchant_5',
    name: 'فواكه وخضار بلادي الطازجة',
    description: 'خضر وفواكه طازجة يومياً من مزارع المتيجة والصحراء، تمر دقلة نور الأصلي',
    category: 'cat_fruits',
    logoUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1000&auto=format&fit=crop&q=80',
    phone: '0671889900',
    wilaya: 'البليدة',
    commune: 'أولاد يعيش',
    address: 'طريق الشفة، أولاد يعيش',
    latitude: 36.5020,
    longitude: 2.8530,
    rating: 4.8,
    reviewCount: 43,
    deliveryTimeMin: 30,
    deliveryTimeMax: 50,
    deliveryFee: 200,
    minimumOrder: 1000,
    isOpen: true,
    isVerified: true,
    isFeatured: false,
    isPopular: true,
    openingHours: '07:00 - 19:00',
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-01-20T10:00:00Z',
  },
];

const INITIAL_PRODUCTS: Product[] = [
  // Store 1: مطعم القصبة العتيقة
  {
    id: 'prod_rechta',
    storeId: 'store_kasbah',
    name: 'رشتة عاصمية عريقة بالدجاج البلدي',
    description: 'رشتة مقطوعة باليد مصلوقة ومسقية بمرقة بيضاء معطرة بالقرفة واللفت وحبات الحمص ودجاج طازج محمر',
    price: 850,
    originalPrice: 950,
    category: 'أطباق تقليدية',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    stockQuantity: 25,
    calories: 680,
    tags: ['تقليدي', 'الأكثر مبيعاً'],
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'prod_chakhchoukha',
    storeId: 'store_kasbah',
    name: 'شخشوخة بسكرية حارة باللحم',
    description: 'شخشوخة حارة بالرقاق المفتت ومرقة حمراء بالبهارات البسكرية الأصيلة مع قطع لحم الغنم الطري',
    price: 1100,
    category: 'أطباق تقليدية',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    stockQuantity: 18,
    calories: 780,
    tags: ['حار', 'لحم'],
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'prod_tajine_zitoun',
    storeId: 'store_kasbah',
    name: 'طاجين الزيتون بالدجاج والفطر',
    description: 'طاجين زيتون منزوع الملوحة مطهو على نار هادئة بمرقة مجمرة مع الجزر والفطر وقطعة دجاج طرية',
    price: 750,
    category: 'طواجن',
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    stockQuantity: 30,
    calories: 540,
    tags: ['دجاج'],
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'prod_chorba_frik',
    storeId: 'store_kasbah',
    name: 'شربة فريك جزائرية بالنعناع الجاف',
    description: 'شربة فريك القمح الأخضر مع كرات اللحم المفروم والحمص والكزبرة والنعناع العطري مع بريك مقرمش',
    price: 450,
    category: 'مقبلات وحساء',
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    stockQuantity: 40,
    calories: 320,
    tags: ['حساء'],
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },

  // Store 2: بيتزا وتاكوس البهجة
  {
    id: 'prod_pizza_bahja',
    storeId: 'store_bahja_pizza',
    name: 'بيتزا البهجة الملكية (كبيرة)',
    description: 'عجينة مخمرة 48 ساعة، صلصة طماطم إيطالية، جبن موزاريلا بلدي، لحم مفروم، فطر طازج، فلفل وزيتون أسود',
    price: 900,
    originalPrice: 1000,
    category: 'بيتزا',
    imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    stockQuantity: 50,
    calories: 890,
    tags: ['بيتزا', 'مميز'],
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-01-12T10:00:00Z',
  },
  {
    id: 'prod_tacos_xl',
    storeId: 'store_bahja_pizza',
    name: 'تاكوس جزائري حجم عائلي XL',
    description: 'خبز التورتيلا المدهون بصلصة الجبن الساخنة مع شاورما الدجاج، بطاطا مقلية وصلصة الجريار المقرمشة',
    price: 650,
    category: 'تاكوس وسندويشات',
    imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    stockQuantity: 45,
    calories: 850,
    tags: ['سريع'],
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-01-12T10:00:00Z',
  },

  // Store 3: حلويات الصنوبر
  {
    id: 'prod_qalb_ellouz',
    storeId: 'store_snouber_sweets',
    name: 'صينية قلب اللوز العاصمي بالعسل (1 كغ)',
    description: 'قلب اللوز محشو بلوز مرحي ومسقي بالشاربات وماء زهر القلعة، بنكهة تقليدية لا تقاوم',
    price: 1200,
    originalPrice: 1400,
    category: 'حلويات معسلة',
    imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    stockQuantity: 15,
    calories: 1200,
    tags: ['تقليدي', 'عسل'],
    createdAt: '2026-01-14T10:00:00Z',
    updatedAt: '2026-01-14T10:00:00Z',
  },
  {
    id: 'prod_baklawa',
    storeId: 'store_snouber_sweets',
    name: 'بقلاوة جزائرية مورقة بالجوز واللوز (1 كغ)',
    description: 'طبقات رقيقة جداً مورقة بالسمن البلدي محشوة بمزيج اللوز والجوز ومعسلة عسلاً صافياً',
    price: 2400,
    category: 'حلويات الأعراس',
    imageUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    stockQuantity: 10,
    calories: 1400,
    tags: ['فاخر'],
    createdAt: '2026-01-14T10:00:00Z',
    updatedAt: '2026-01-14T10:00:00Z',
  },

  // Store 4: سوبرماركت الواحة
  {
    id: 'prod_candia_milk',
    storeId: 'store_superette_waha',
    name: 'حليب كانديا فيفا معزز بالفيتامينات (1 لتر)',
    description: 'حليب معقم كامل الدسم معزز بالفيتامين د والحديد، حزمة أصلية',
    price: 160,
    category: 'ألبان وأجبان',
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    stockQuantity: 120,
    calories: 140,
    tags: ['يومي'],
    createdAt: '2026-01-18T10:00:00Z',
    updatedAt: '2026-01-18T10:00:00Z',
  },
  {
    id: 'prod_cevital_oil',
    storeId: 'store_superette_waha',
    name: 'زيت المائدة إيليو سيفيتال (5 لتر)',
    description: 'زيت مائدة نباتي نقي 100% مناسب لجميع أنواع الطبخ والقلي الصحي',
    price: 650,
    category: 'زيوت ومواد أساسية',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    stockQuantity: 60,
    calories: 820,
    tags: ['أساسي'],
    createdAt: '2026-01-18T10:00:00Z',
    updatedAt: '2026-01-18T10:00:00Z',
  },

  // Store 5: فواكه وخضار بلادي
  {
    id: 'prod_deglet_nour',
    storeId: 'store_fresh_fruits',
    name: 'تمر دقلة نور أصلي طولقة (علبة 1 كغ)',
    description: 'تمور جزائرية منتقاة حبة بحبة، شفافة وعسلية من واحات طولقة بسكرة',
    price: 800,
    originalPrice: 900,
    category: 'تمور وفواكه',
    imageUrl: 'https://images.unsplash.com/photo-1596797882870-8c33deeac224?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    stockQuantity: 50,
    calories: 280,
    tags: ['طبيعي', 'صحراوي'],
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'prod_mitidja_oranges',
    storeId: 'store_fresh_fruits',
    name: 'برتقال طومسون المتيجة للعصير (3 كغ)',
    description: 'برتقال حلو غني بالعصارة والفيتامين سي، طازج قطاف اليوم من بساتين بوفاريك',
    price: 450,
    category: 'حمضيات',
    imageUrl: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    stockQuantity: 70,
    calories: 180,
    tags: ['طازج'],
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-01-20T10:00:00Z',
  },

  // Store 6: مخبزة وحلويات البركة العصرية
  {
    id: 'prod_croissant_butter',
    storeId: 'store_baraka_bakery',
    name: 'كرواسون بالزبدة الطبيعية (4 قطع)',
    description: 'كرواسون مورق ومقرمش مخبوز على الطريقة الفرنسية بزبدة حيوانية نقية',
    price: 320,
    category: 'مخبوزات الصباح',
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    stockQuantity: 40,
    calories: 260,
    tags: ['طازج', 'فطور'],
    createdAt: '2026-01-19T10:00:00Z',
    updatedAt: '2026-01-19T10:00:00Z',
  },
  {
    id: 'prod_brioche_choc',
    storeId: 'store_baraka_bakery',
    name: 'بريوش محشو بشوكولاتة البندق',
    description: 'بريوش طري وهش محشو بشوكولاتة جزائرية غنية بالبندق المحمص',
    price: 180,
    category: 'بريوش وفطائر',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    stockQuantity: 35,
    calories: 310,
    tags: ['حلو'],
    createdAt: '2026-01-19T10:00:00Z',
    updatedAt: '2026-01-19T10:00:00Z',
  },

  // Store 7: مشروبات وعصائر الواحة
  {
    id: 'prod_cocktail_oasis',
    storeId: 'store_oasis_beverages',
    name: 'كوكتيل الواحة الملكي (فراولة، موز، مانجو) 1 لتر',
    description: 'عصير طبيعي 100% بدون سكر مضاف، معصور طازج مع قطع الفواكه الطبيعية',
    price: 450,
    originalPrice: 500,
    category: 'عصائر طازجة',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    stockQuantity: 60,
    calories: 190,
    tags: ['طبيعي', 'بارد'],
    createdAt: '2026-01-21T10:00:00Z',
    updatedAt: '2026-01-21T10:00:00Z',
  },
  {
    id: 'prod_sahara_tea',
    storeId: 'store_oasis_beverages',
    name: 'إبريق شاي صحراوي ملقم بالنعناع الطازج',
    description: 'شاي أخضر صحراوي تقليدي برغوة عريقة ونعناع بستاني طري مع حبات الصنوبر',
    price: 300,
    category: 'مشروبات ساخنة',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    stockQuantity: 50,
    calories: 70,
    tags: ['تقليدي', 'ساخن'],
    createdAt: '2026-01-21T10:00:00Z',
    updatedAt: '2026-01-21T10:00:00Z',
  },

  // Store 8: قصابة الأمانة للحوم
  {
    id: 'prod_merguez_alger',
    storeId: 'store_amana_butchery',
    name: 'مرقاز عاصمي بلدي متبل (1 كغ)',
    description: 'مرقاز محضر من لحم الخروف والبقر الطازج ومتبل ببهارات عاصمية أصيلة وثوم بلدي',
    price: 1650,
    category: 'لحوم متبلة',
    imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    stockQuantity: 25,
    calories: 420,
    tags: ['طازج', 'الأكثر طلباً'],
    createdAt: '2026-01-22T10:00:00Z',
    updatedAt: '2026-01-22T10:00:00Z',
  },
  {
    id: 'prod_chicken_breast',
    storeId: 'store_amana_butchery',
    name: 'شرائح صدر دجاج بلدي طازج (1 كغ)',
    description: 'صدور دجاج منقى ومغسول وجاهز للطهي والتحمير أو الشواء، ذبح يومي حلال',
    price: 1100,
    category: 'دواجن',
    imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    stockQuantity: 30,
    calories: 165,
    tags: ['صحي', 'بروتين'],
    createdAt: '2026-01-22T10:00:00Z',
    updatedAt: '2026-01-22T10:00:00Z',
  },

  // Store 9: صيدلية النور والشفاء
  {
    id: 'prod_vitamin_c_zinc',
    storeId: 'store_nour_pharmacy',
    name: 'فيتامين C + زنك أقراص فوارة (20 قرص)',
    description: 'مكمل غذائي لتعزيز المناعة ومقاومة التعب بنكهة البرتقال الطبيعية',
    price: 680,
    category: 'فيتامينات ومكملات',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    stockQuantity: 45,
    calories: 10,
    tags: ['صحة', 'مناعة'],
    createdAt: '2026-01-23T10:00:00Z',
    updatedAt: '2026-01-23T10:00:00Z',
  },
  {
    id: 'prod_baby_care_cream',
    storeId: 'store_nour_pharmacy',
    name: 'كريم مرطب ومهدئ لبشرة الأطفال (200 مل)',
    description: 'تركيبة لطيفة بخلاصة البابونج وزيت اللوز الحلو لحماية بشرة الرضع الحساسة',
    price: 950,
    category: 'عناية بالطفل',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    stockQuantity: 30,
    calories: 0,
    tags: ['أطفال', 'عناية'],
    createdAt: '2026-01-23T10:00:00Z',
    updatedAt: '2026-01-23T10:00:00Z',
  },

  // Store 10: ديجيتال زون للإلكترونيات
  {
    id: 'prod_fast_charger_65w',
    storeId: 'store_digital_zone',
    name: 'شاحن GaN سريع 65 واط بمخرجين Type-C و USB',
    description: 'يدعم الشحن فائق السرعة للهواتف الذكية والأجهزة اللوحية والحواسيب المحمولة بحماية ضد الحرارة',
    price: 2400,
    originalPrice: 2800,
    category: 'شواحن وكوابل',
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    stockQuantity: 20,
    calories: 0,
    tags: ['إلكترونيات', 'سريع'],
    createdAt: '2026-01-24T10:00:00Z',
    updatedAt: '2026-01-24T10:00:00Z',
  },
  {
    id: 'prod_earbuds_pro',
    storeId: 'store_digital_zone',
    name: 'سماعات بلوتوث لاسلكية مع ميزة إلغاء الضوضاء',
    description: 'صوت ستيريو نقي، ميكروفون مزدوج للمكالمات الواضحة، وبطارية تدوم حتى 28 ساعة مع علبة الشحن',
    price: 3200,
    category: 'صوتيات وسماعات',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    stockQuantity: 15,
    calories: 0,
    tags: ['بلوتوث'],
    createdAt: '2026-01-24T10:00:00Z',
    updatedAt: '2026-01-24T10:00:00Z',
  },

  // Store 11: دار الخير للأواني والمستلزمات
  {
    id: 'prod_tea_set_alger',
    storeId: 'store_dar_elkhir',
    name: 'طقم شاي وقهوة جزائري مذهب 12 قطعة',
    description: 'طقم فاخر من الزجاج والبورسلين المذهب لتقديم الشاي والقهوة في المناسبات والضيافة',
    price: 2900,
    category: 'أواني وتقديم',
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    stockQuantity: 18,
    calories: 0,
    tags: ['ضيافة', 'فاخر'],
    createdAt: '2026-01-25T10:00:00Z',
    updatedAt: '2026-01-25T10:00:00Z',
  },
  {
    id: 'prod_cleaner_pack',
    storeId: 'store_dar_elkhir',
    name: 'مجموعة منظفات منزلية شاملة (معطر، ملمع، صابون سائل)',
    description: 'حقيبة اقتصادية تحتوي على 4 عبوات تنظيف ذات فعالية عالية ورائحة لافندر منعشة تدوم طويلاً',
    price: 1350,
    originalPrice: 1500,
    category: 'منظفات وعناية بالمنزل',
    imageUrl: 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    stockQuantity: 40,
    calories: 0,
    tags: ['نظافة', 'عرض'],
    createdAt: '2026-01-25T10:00:00Z',
    updatedAt: '2026-01-25T10:00:00Z',
  },
];

const INITIAL_COURIERS: CourierProfile[] = [
  {
    id: 'courier_yassine',
    userId: 'user_courier_1',
    fullName: 'ياسين بوزيد',
    phone: '0770987654',
    vehicleType: 'MOTORCYCLE',
    vehiclePlate: '16-12345-120',
    wilaya: 'الجزائر العاصمة',
    isOnline: true,
    totalDeliveries: 128,
    rating: 4.9,
    earningsBalance: 18500,
    isApproved: true,
    createdAt: '2026-01-15T11:00:00Z',
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'order_1001',
    customerId: 'user_customer_1',
    customerName: 'أمين بن علي',
    customerPhone: '0560112233',
    storeId: 'store_kasbah',
    storeName: 'مطعم القصبة العتيقة',
    storePhone: '0661234567',
    storeAddress: 'شارع ديدوش مراد، سيدي امحمد',
    pickupLatitude: 36.7695,
    pickupLongitude: 3.0558,
    courierId: 'user_courier_1',
    courierName: 'ياسين بوزيد',
    courierPhone: '0770987654',
    courierLatitude: 36.7640,
    courierLongitude: 3.0535,
    customerLatitude: 36.7580,
    customerLongitude: 3.0510,
    routeDistance: 1600,
    routeDistanceFormatted: '1.6 كم',
    estimatedDuration: 360,
    estimatedDurationFormatted: '6 دقائق',
    deliveryOtp: '4821',
    items: [
      {
        productId: 'prod_rechta',
        productName: 'رشتة عاصمية عريقة بالدجاج البلدي',
        price: 850,
        quantity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
        notes: 'المرقة مجمرة قليلاً وزيادة حمص من فضلك',
      },
      {
        productId: 'prod_chorba_frik',
        productName: 'شربة فريك جزائرية بالنعناع الجاف',
        price: 450,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=80',
      },
    ],
    subtotal: 2150,
    deliveryFee: 250,
    discount: 0,
    total: 2400,
    status: 'ON_THE_WAY',
    statusHistory: [
      {
        status: 'PENDING',
        timestamp: '2026-03-01T12:00:00Z',
        actorId: 'user_customer_1',
        actorRole: 'CUSTOMER',
        note: 'تم إرسال الطلب من الزبون',
      },
      {
        status: 'ACCEPTED',
        timestamp: '2026-03-01T12:03:00Z',
        actorId: 'user_merchant_1',
        actorRole: 'MERCHANT',
        note: 'قبل المتجر الطلب وجاري التجهيز',
      },
      {
        status: 'PREPARING',
        timestamp: '2026-03-01T12:05:00Z',
        actorId: 'user_merchant_1',
        actorRole: 'MERCHANT',
        note: 'بدأ تحضير وجبة الرشتة والشربة',
      },
      {
        status: 'READY_FOR_PICKUP',
        timestamp: '2026-03-01T12:20:00Z',
        actorId: 'user_merchant_1',
        actorRole: 'MERCHANT',
        note: 'الطلب مغلف وجاهز في انتظار الموصّل',
      },
      {
        status: 'COURIER_ASSIGNED',
        timestamp: '2026-03-01T12:22:00Z',
        actorId: 'user_courier_1',
        actorRole: 'COURIER',
        note: 'قبل الكابتن ياسين التوصيل وتوجه للمتجر',
      },
      {
        status: 'PICKED_UP',
        timestamp: '2026-03-01T12:28:00Z',
        actorId: 'user_courier_1',
        actorRole: 'COURIER',
        note: 'استلم الموصّل الطلب من المطعم وتأكد من المحتويات',
      },
      {
        status: 'ON_THE_WAY',
        timestamp: '2026-03-01T12:30:00Z',
        actorId: 'user_courier_1',
        actorRole: 'COURIER',
        note: 'الموصّل في الطريق نحو عنوان الزبون',
      },
    ],
    deliveryAddress: {
      wilaya: 'الجزائر العاصمة',
      commune: 'سيدي امحمد',
      street: 'شارع محمد الخامس، عمارة 14، الطابق الثالث',
      instructions: 'يرجى الاتصال عند الوصول أمام المدخل',
      latitude: 36.7580,
      longitude: 3.0510,
    },
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PENDING',
    orderNumber: 'LB-20260301-0001',
    createdAt: '2026-03-01T12:00:00Z',
    updatedAt: '2026-03-01T12:30:00Z',
  },
  {
    id: 'order_1002',
    orderNumber: 'LB-20260228-0042',
    customerId: 'user_customer_1',
    customerName: 'أمين بن علي',
    customerPhone: '0560112233',
    storeId: 'store_bahja_pizza',
    storeName: 'بيتزا وتاكوس البهجة',
    storePhone: '0555332211',
    storeAddress: 'حي المصالحة، قرب الجامعة، باب الزوار',
    pickupLatitude: 36.7165,
    pickupLongitude: 3.1852,
    courierId: 'user_courier_1',
    courierName: 'ياسين بوزيد',
    courierPhone: '0770987654',
    customerLatitude: 36.7198,
    customerLongitude: 3.1872,
    items: [
      {
        productId: 'prod_pizza_bahja',
        productName: 'بيتزا البهجة الملكية (كبيرة)',
        price: 900,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&auto=format&fit=crop&q=80',
        notes: 'بدون بصل',
      },
      {
        productId: 'prod_tacos_xl',
        productName: 'تاكوس جزائري حجم عائلي XL',
        price: 650,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500&auto=format&fit=crop&q=80',
      },
    ],
    subtotal: 1550,
    deliveryFee: 200,
    discount: 0,
    total: 1750,
    status: 'DELIVERED',
    statusHistory: [
      { status: 'PENDING', timestamp: '2026-02-28T19:00:00Z', actorId: 'user_customer_1', actorRole: 'CUSTOMER', note: 'تم إنشاء الطلب' },
      { status: 'ACCEPTED', timestamp: '2026-02-28T19:02:00Z', actorId: 'user_merchant_2', actorRole: 'MERCHANT', note: 'وافق المتجر على الطلب' },
      { status: 'PREPARING', timestamp: '2026-02-28T19:05:00Z', actorId: 'user_merchant_2', actorRole: 'MERCHANT', note: 'بدأ تحضير البيتزا والتاكوس' },
      { status: 'READY_FOR_PICKUP', timestamp: '2026-02-28T19:22:00Z', actorId: 'user_merchant_2', actorRole: 'MERCHANT', note: 'الطلب جاهز' },
      { status: 'COURIER_ASSIGNED', timestamp: '2026-02-28T19:23:00Z', actorId: 'user_courier_1', actorRole: 'COURIER', note: 'تم تعيين مندوب' },
      { status: 'PICKED_UP', timestamp: '2026-02-28T19:27:00Z', actorId: 'user_courier_1', actorRole: 'COURIER', note: 'استلم المندوب الطلب' },
      { status: 'ON_THE_WAY', timestamp: '2026-02-28T19:30:00Z', actorId: 'user_courier_1', actorRole: 'COURIER', note: 'المندوب في الطريق' },
      { status: 'ARRIVED', timestamp: '2026-02-28T19:42:00Z', actorId: 'user_courier_1', actorRole: 'COURIER', note: 'وصل المندوب أمام العمارة' },
      { status: 'DELIVERED', timestamp: '2026-02-28T19:45:00Z', actorId: 'user_courier_1', actorRole: 'COURIER', note: 'تم تسليم الطلب واستلام المبلغ نقداً' },
    ],
    deliveryAddress: {
      wilaya: 'الجزائر العاصمة',
      commune: 'باب الزوار',
      street: 'حي الموز، عمارة ب4، شقة 12',
      instructions: 'الطابق الثاني على اليمين',
      latitude: 36.7198,
      longitude: 3.1872,
    },
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    createdAt: '2026-02-28T19:00:00Z',
    updatedAt: '2026-02-28T19:45:00Z',
  },
];

const INITIAL_ADDRESSES: CustomerAddress[] = [
  {
    id: 'addr_home_1',
    customerId: 'user_customer_1',
    label: 'المنزل',
    address: 'حي الموز، عمارة ب4، شقة 12',
    city: 'الجزائر العاصمة',
    district: 'باب الزوار',
    latitude: 36.7198,
    longitude: 3.1872,
    phone: '0560112233',
    isDefault: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'addr_work_1',
    customerId: 'user_customer_1',
    label: 'العمل',
    address: 'برج الحامة للأعمال، الطابق 5',
    city: 'الجزائر العاصمة',
    district: 'بلوزداد',
    latitude: 36.7510,
    longitude: 3.0685,
    phone: '0560112233',
    isDefault: false,
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-01-12T10:00:00Z',
  },
];

const INITIAL_FAVORITES: FavoriteItem[] = [
  {
    id: 'fav_store_1',
    customerId: 'user_customer_1',
    type: 'STORE',
    targetId: 'store_kasbah',
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'fav_store_2',
    customerId: 'user_customer_1',
    type: 'STORE',
    targetId: 'store_bahja_pizza',
    createdAt: '2026-02-02T10:00:00Z',
  },
  {
    id: 'fav_prod_1',
    customerId: 'user_customer_1',
    type: 'PRODUCT',
    targetId: 'prod_rechta',
    createdAt: '2026-02-03T10:00:00Z',
  },
  {
    id: 'fav_prod_2',
    customerId: 'user_customer_1',
    type: 'PRODUCT',
    targetId: 'prod_pizza_bahja',
    createdAt: '2026-02-04T10:00:00Z',
  },
];

const INITIAL_REVIEWS: OrderReview[] = [
  {
    id: 'rev_1',
    orderId: 'order_1002',
    customerId: 'user_customer_1',
    customerName: 'أمين بن علي',
    storeId: 'store_bahja_pizza',
    storeRating: 5,
    deliveryRating: 5,
    comment: 'بيتزا ممتازة وساخنة والتوصيل كان سريعاً جداً قبل الموعد المحدد! بارك الله فيكم.',
    createdAt: '2026-02-28T20:00:00Z',
  },
];

const INITIAL_NOTIFICATIONS: CustomerNotification[] = [
  {
    id: 'notif_1',
    customerId: 'user_customer_1',
    title: 'طلبك في الطريق إليك!',
    message: 'المندوب ياسين في طريقه لتوصيل طلبك من مطعم القصبة العتيقة. تتبع موقعه لحظة بلحظة.',
    orderId: 'order_1001',
    type: 'ORDER_UPDATE',
    isRead: false,
    createdAt: '2026-03-01T12:30:00Z',
  },
  {
    id: 'notif_2',
    customerId: 'user_customer_1',
    title: 'تم تسليم طلبك بنجاح',
    message: 'تم تسليم طلبك السابق من بيتزا البهجة. نتمنى لك وجبة شهية!',
    orderId: 'order_1002',
    type: 'ORDER_UPDATE',
    isRead: true,
    createdAt: '2026-02-28T19:46:00Z',
  },
  {
    id: 'notif_3',
    customerId: 'user_customer_1',
    title: 'مرحباً بك في منصة لباب الدار',
    message: 'استمتع بأسرع خدمة توصيل حتى باب منزلك أو مكتبك في الجزائر العاصمة، البليدة، وهران وقسنطينة.',
    type: 'SYSTEM',
    isRead: true,
    createdAt: '2026-02-20T08:00:00Z',
  },
];

const INITIAL_SETTINGS: PlatformSettings = {
  appName: 'لباب الدار',
  currency: 'دج',
  defaultCommissionRate: 10,
  supportPhone: '021 99 88 77',
  supportEmail: 'contact@lbabdar.dz',
  autoAssignCouriers: true,
  systemAlert: 'مرحباً بكم في منصة لباب الدار - التوصيل متوفر في العاصمة والبليدة ووهران وقسنطينة!',
};

const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'branch_algiers_center',
    name: 'فرع الجزائر الوسطى - ديدوش مراد',
    wilaya: 'الجزائر العاصمة',
    municipality: 'سيدي امحمد',
    address: 'شارع ديدوش مراد رقم 45، الجزائر الوسطى',
    phone: '021 73 12 34',
    openingHours: '08:00 - 17:00 (الأحد - الخميس)',
    isOpen: true,
    isActive: true,
    latitude: 36.7692,
    longitude: 3.0566,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'branch_algiers_east',
    name: 'فرع الجزائر شرق - باب الزوار',
    wilaya: 'الجزائر العاصمة',
    municipality: 'باب الزوار',
    address: 'مركز الأعمال باب الزوار، بجوار محطة الترامواي',
    phone: '021 24 55 66',
    openingHours: '08:30 - 16:30 (الأحد - الخميس)',
    isOpen: true,
    isActive: true,
    latitude: 36.7198,
    longitude: 3.1832,
    createdAt: '2026-01-05T08:00:00Z',
    updatedAt: '2026-01-05T08:00:00Z',
  },
  {
    id: 'branch_oran_center',
    name: 'فرع وهران الباهية - وسط المدينة',
    wilaya: 'وهران',
    municipality: 'وهران',
    address: 'ساحة أول نوفمبر (ساحة السلاح)، وهران',
    phone: '041 33 22 11',
    openingHours: '08:00 - 17:00 (الأحد - الخميس)',
    isOpen: true,
    isActive: true,
    latitude: 35.7012,
    longitude: -0.6432,
    createdAt: '2026-01-08T08:00:00Z',
    updatedAt: '2026-01-08T08:00:00Z',
  },
  {
    id: 'branch_constantine',
    name: 'فرع قسنطينة - علي منجلي',
    wilaya: 'قسنطينة',
    municipality: 'الخروب',
    address: 'الوحدة الجوارية رقم 5، المدينة الجديدة علي منجلي',
    phone: '031 66 44 22',
    openingHours: '08:30 - 16:30 (الأحد - الخميس)',
    isOpen: true,
    isActive: true,
    latitude: 36.2625,
    longitude: 6.5744,
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-01-12T08:00:00Z',
  },
  {
    id: 'branch_blida',
    name: 'فرع البليدة - باب الجزائر',
    wilaya: 'البليدة',
    municipality: 'البليدة',
    address: 'شارع كريتلي مختار، أمام ساحة التوت، البليدة',
    phone: '025 41 88 99',
    openingHours: '08:00 - 17:00 (الأحد - الخميس)',
    isOpen: true,
    isActive: true,
    latitude: 36.4722,
    longitude: 2.8289,
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-15T08:00:00Z',
  },
];

const INITIAL_PAYMENT_SETTINGS: PaymentSettings = {
  merchantWithdrawals: {
    cib: {
      enabled: true,
      requireAccountHolderName: true,
      requireRib: true,
      requireAccountNumber: false,
      requireBankName: true,
      requireVerification: true,
      instructions: 'يرجى إدخال رقم الحساب البنكي (RIB) المكون من 20 رقماً واسم البنك بدقة.',
    },
    edahabia: {
      enabled: true,
      requireAccountHolderName: true,
      requireCcp: true,
      requireVerification: true,
      instructions: 'يرجى إدخال رقم الحساب البريدي الجاري (CCP) ورقم المفتاح الخاص ببطاقة الذهبية بريد الجزائر.',
    },
    branch: {
      enabled: true,
      instructions: 'يمكنك التوجه مباشرة لأقرب فرع معتمد لمنصة لباب الدار لسحب أرباحك نقداً مصحوباً ببطاقة الهوية الوطنية.',
    },
  },
  courierWithdrawals: {
    cib: {
      enabled: true,
      requireAccountHolderName: true,
      requireRib: true,
      requireAccountNumber: false,
      requireBankName: true,
      requireVerification: true,
      instructions: 'يرجى تقديم بيانات الـ RIB البنكي المعتمد من البنوك الجزائرية.',
    },
    edahabia: {
      enabled: true,
      requireAccountHolderName: true,
      requireCcp: true,
      requireVerification: true,
      instructions: 'يرجى إدخال رقم CCP ومفتاح بطاقة الذهبية لتلقي مستحقات التوصيل.',
    },
    branch: {
      enabled: true,
      instructions: 'السحب النقدي الفوري من فروع المنصة المعتمدة خلال أوقات العمل الرسمية.',
    },
  },
};

const INITIAL_COMMISSION_SETTINGS: CommissionSettings = {
  merchant: {
    type: 'percentage',
    value: 10,
  },
  courier: {
    type: 'percentage',
    value: 0,
  },
  deliveryFeeAllocation: {
    courierSharePercentage: 80,
    platformSharePercentage: 20,
  },
  withdrawalLimits: {
    minAmountMerchant: 3000,
    maxAmountMerchant: 300000,
    minAmountCourier: 1000,
    maxAmountCourier: 50000,
    dailyLimitMerchant: 150000,
    dailyLimitCourier: 25000,
    weeklyLimitMerchant: 500000,
    weeklyLimitCourier: 100000,
    approvalMode: 'MANUAL',
    processingTimeHours: 24,
    instructions: 'تتم معالجة السحوبات خلال 24 إلى 48 ساعة عمل بعد التحقق من البيانات المالية.',
  },
};

const INITIAL_PAYMENT_PROFILES: UserPaymentProfile[] = [
  {
    id: 'pay_profile_merchant_1',
    userId: 'user_merchant_1',
    userName: 'الحاج رشيد بلقاسم',
    userRole: 'MERCHANT',
    storeId: 'store_kasbah',
    activeMethod: 'EDAHABIA',
    cib: {
      accountHolderName: 'الحاج رشيد بلقاسم',
      rib: '00100123456789012345',
      bankName: 'بنك الفلاحة والتنمية الريفية (BADR)',
    },
    edahabia: {
      accountHolderName: 'الحاج رشيد بلقاسم',
      ccpNumber: '0012345678',
      ripKey: '45',
    },
    branch: {
      wilaya: 'الجزائر العاصمة',
      branchId: 'branch_algiers_center',
      branchName: 'فرع الجزائر الوسطى - ديدوش مراد',
      branchAddress: 'شارع ديدوش مراد رقم 45، الجزائر الوسطى',
    },
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-02-15T10:00:00Z',
    reviewedAt: '2026-02-16T12:00:00Z',
    reviewedBy: 'user_admin',
  },
  {
    id: 'pay_profile_courier_1',
    userId: 'user_courier_1',
    userName: 'ياسين بوزيد',
    userRole: 'COURIER',
    activeMethod: 'EDAHABIA',
    edahabia: {
      accountHolderName: 'ياسين بوزيد',
      ccpNumber: '0098765432',
      ripKey: '78',
    },
    branch: {
      wilaya: 'الجزائر العاصمة',
      branchId: 'branch_algiers_center',
      branchName: 'فرع الجزائر الوسطى - ديدوش مراد',
      branchAddress: 'شارع ديدوش مراد رقم 45، الجزائر الوسطى',
    },
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-02-10T10:00:00Z',
    reviewedAt: '2026-02-11T11:00:00Z',
    reviewedBy: 'user_admin',
  },
];

const INITIAL_WITHDRAWAL_REQUESTS: WithdrawalRequest[] = [
  {
    id: 'wdr_101',
    requestId: 'WDR-20260220-0001',
    userId: 'user_merchant_1',
    userName: 'الحاج رشيد بلقاسم',
    userRole: 'MERCHANT',
    storeId: 'store_kasbah',
    storeName: 'مطعم القصبة العتيقة',
    amount: 15000,
    withdrawalMethod: 'EDAHABIA',
    paymentInformationSnapshot: {
      method: 'EDAHABIA',
      details: {
        accountHolderName: 'الحاج رشيد بلقاسم',
        ccpNumber: '0012345678',
        ripKey: '45',
      },
    },
    status: 'COMPLETED',
    createdAt: '2026-02-20T10:00:00Z',
    reviewedAt: '2026-02-20T14:00:00Z',
    processedAt: '2026-02-21T09:00:00Z',
    completedAt: '2026-02-21T11:00:00Z',
    adminId: 'user_admin',
    adminName: 'طه لحراوة (مدير المنصة)',
    notes: 'تم تحويل المبلغ بنجاح عبر بريد الجزائر',
    statusHistory: [
      { status: 'PENDING', timestamp: '2026-02-20T10:00:00Z' },
      { status: 'APPROVED', timestamp: '2026-02-20T14:00:00Z', adminId: 'user_admin', note: 'المعلومات مطابقة' },
      { status: 'PROCESSING', timestamp: '2026-02-21T09:00:00Z', adminId: 'user_admin' },
      { status: 'COMPLETED', timestamp: '2026-02-21T11:00:00Z', adminId: 'user_admin', note: 'تم تأكيد الإشعار' },
    ],
  },
  {
    id: 'wdr_102',
    requestId: 'WDR-20260225-0002',
    userId: 'user_courier_1',
    userName: 'ياسين بوزيد',
    userRole: 'COURIER',
    amount: 5000,
    withdrawalMethod: 'BRANCH',
    paymentInformationSnapshot: {
      method: 'BRANCH',
      details: {
        wilaya: 'الجزائر العاصمة',
        branchId: 'branch_algiers_center',
        branchName: 'فرع الجزائر الوسطى - ديدوش مراد',
      },
      branchDetails: {
        branchId: 'branch_algiers_center',
        branchName: 'فرع الجزائر الوسطى - ديدوش مراد',
        branchAddress: 'شارع ديدوش مراد رقم 45، الجزائر الوسطى',
        wilaya: 'الجزائر العاصمة',
      },
    },
    branchId: 'branch_algiers_center',
    status: 'COMPLETED',
    createdAt: '2026-02-25T11:00:00Z',
    reviewedAt: '2026-02-25T13:00:00Z',
    completedAt: '2026-02-25T15:00:00Z',
    adminId: 'user_admin',
    adminName: 'طه لحراوة (مدير المنصة)',
    notes: 'تم تسليم المبلغ نقداً في فرع ديدوش مراد',
  },
];

const INITIAL_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: 'tx_101',
    transactionId: 'TX-20260218-001',
    userId: 'user_merchant_1',
    userRole: 'MERCHANT',
    type: 'ORDER_EARNING',
    amount: 2160,
    referenceId: 'order_1002',
    orderId: 'order_1002',
    status: 'COMPLETED',
    createdAt: '2026-02-18T19:45:00Z',
    description: 'صافي أرباح مبيعات الطلب #LB-20260228-0002 (بعد خصم 10% عمولة)',
  },
  {
    id: 'tx_102',
    transactionId: 'TX-20260218-002',
    userId: 'user_admin',
    userRole: 'ADMIN',
    type: 'COMMISSION',
    amount: 240,
    referenceId: 'order_1002',
    orderId: 'order_1002',
    status: 'COMPLETED',
    createdAt: '2026-02-18T19:45:00Z',
    description: 'عمولة المنصة 10% من طلب متجر القصبة #LB-20260228-0002',
  },
  {
    id: 'tx_103',
    transactionId: 'TX-20260218-003',
    userId: 'user_courier_1',
    userRole: 'COURIER',
    type: 'DELIVERY_EARNING',
    amount: 200,
    referenceId: 'order_1002',
    orderId: 'order_1002',
    status: 'COMPLETED',
    createdAt: '2026-02-18T19:45:00Z',
    description: 'مستحقات كابتن التوصيل عن الطلب #LB-20260228-0002 (80% من رسم التوصيل)',
  },
  {
    id: 'tx_104',
    transactionId: 'TX-20260221-004',
    userId: 'user_merchant_1',
    userRole: 'MERCHANT',
    type: 'WITHDRAWAL',
    amount: -15000,
    referenceId: 'wdr_101',
    withdrawalId: 'wdr_101',
    status: 'COMPLETED',
    createdAt: '2026-02-21T11:00:00Z',
    description: 'سحب أرباح مكتمل عبر بطاقة الذهبية (CCP) طلب #WDR-20260220-0001',
  },
  {
    id: 'tx_105',
    transactionId: 'TX-20260225-005',
    userId: 'user_courier_1',
    userRole: 'COURIER',
    type: 'WITHDRAWAL',
    amount: -5000,
    referenceId: 'wdr_102',
    withdrawalId: 'wdr_102',
    status: 'COMPLETED',
    createdAt: '2026-02-25T15:00:00Z',
    description: 'سحب أرباح مكتمل نقداً من الفرع طلب #WDR-20260225-0002',
  },
];

const INITIAL_AUDIT_LOGS: FinancialAuditLog[] = [
  {
    id: 'audit_1',
    actorId: 'user_admin',
    actorRole: 'ADMIN',
    actorName: 'طه لحراوة',
    action: 'SETTING_UPDATE',
    targetId: 'paymentSettings',
    timestamp: '2026-02-01T09:00:00Z',
    previousValue: { branchEnabled: false },
    newValue: { branchEnabled: true },
    details: 'تفعيل خيار السحب من الفروع لجميع التجار والموصّلين',
  },
];

class DataService {
  private state: AppState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): AppState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.stores && parsed.products && parsed.users) {
          return {
            ...parsed,
            categories: INITIAL_CATEGORIES,
            stores: parsed.stores || INITIAL_STORES,
            products: parsed.products || INITIAL_PRODUCTS,
            addresses: parsed.addresses || INITIAL_ADDRESSES,
            favorites: parsed.favorites || INITIAL_FAVORITES,
            reviews: parsed.reviews || INITIAL_REVIEWS,
            notifications: parsed.notifications || INITIAL_NOTIFICATIONS,
            branches: parsed.branches || INITIAL_BRANCHES,
            paymentSettings: parsed.paymentSettings ? { ...INITIAL_PAYMENT_SETTINGS, ...parsed.paymentSettings } : INITIAL_PAYMENT_SETTINGS,
            commissionSettings: parsed.commissionSettings
              ? {
                  ...INITIAL_COMMISSION_SETTINGS,
                  ...parsed.commissionSettings,
                  withdrawalLimits: {
                    ...INITIAL_COMMISSION_SETTINGS.withdrawalLimits,
                    ...(parsed.commissionSettings.withdrawalLimits || {}),
                  },
                }
              : INITIAL_COMMISSION_SETTINGS,
            paymentProfiles: parsed.paymentProfiles || INITIAL_PAYMENT_PROFILES,
            withdrawalRequests: parsed.withdrawalRequests || INITIAL_WITHDRAWAL_REQUESTS,
            transactions: parsed.transactions || INITIAL_TRANSACTIONS,
            auditLogs: parsed.auditLogs || INITIAL_AUDIT_LOGS,
          };
        }
      }
    } catch {
      // Fallback
    }
    const fresh: AppState = {
      users: INITIAL_USERS,
      stores: INITIAL_STORES,
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      orders: INITIAL_ORDERS,
      couriers: INITIAL_COURIERS,
      deliveryZones: INITIAL_ZONES,
      settings: INITIAL_SETTINGS,
      addresses: INITIAL_ADDRESSES,
      favorites: INITIAL_FAVORITES,
      reviews: INITIAL_REVIEWS,
      notifications: INITIAL_NOTIFICATIONS,
      branches: INITIAL_BRANCHES,
      paymentSettings: INITIAL_PAYMENT_SETTINGS,
      commissionSettings: INITIAL_COMMISSION_SETTINGS,
      paymentProfiles: INITIAL_PAYMENT_PROFILES,
      withdrawalRequests: INITIAL_WITHDRAWAL_REQUESTS,
      transactions: INITIAL_TRANSACTIONS,
      auditLogs: INITIAL_AUDIT_LOGS,
    };
    this.saveState(fresh);
    return fresh;
  }

  private saveState(state: AppState) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }

  private notify() {
    this.saveState(this.state);
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('State listener error:', err);
      }
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getState(): AppState {
    return this.state;
  }

  public resetToDefault(): void {
    this.state = {
      users: INITIAL_USERS,
      stores: INITIAL_STORES,
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      orders: INITIAL_ORDERS,
      couriers: INITIAL_COURIERS,
      deliveryZones: INITIAL_ZONES,
      settings: INITIAL_SETTINGS,
      addresses: INITIAL_ADDRESSES,
      favorites: INITIAL_FAVORITES,
      reviews: INITIAL_REVIEWS,
      notifications: INITIAL_NOTIFICATIONS,
      branches: INITIAL_BRANCHES,
      paymentSettings: INITIAL_PAYMENT_SETTINGS,
      commissionSettings: INITIAL_COMMISSION_SETTINGS,
      paymentProfiles: INITIAL_PAYMENT_PROFILES,
      withdrawalRequests: INITIAL_WITHDRAWAL_REQUESTS,
      transactions: INITIAL_TRANSACTIONS,
      auditLogs: INITIAL_AUDIT_LOGS,
    };
    this.notify();
  }

  // --- Users & Auth ---
  public getUsers(): User[] {
    return this.state.users;
  }

  public getUserById(id: string): User | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: User): User {
    this.state.users = [...this.state.users, user];
    this.notify();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.state.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    const updated = { ...this.state.users[idx], ...updates, updatedAt: new Date().toISOString() };
    this.state.users[idx] = updated;
    this.notify();
    return updated;
  }

  // --- Stores ---
  public getStores(): Store[] {
    return this.state.stores;
  }

  public getStoreById(id: string): Store | undefined {
    return this.state.stores.find((s) => s.id === id);
  }

  public getStoreByMerchantId(merchantId: string): Store | undefined {
    return this.state.stores.find((s) => s.merchantId === merchantId);
  }

  public createStore(store: Store): Store {
    this.state.stores = [store, ...this.state.stores];
    this.notify();
    return store;
  }

  public updateStore(id: string, updates: Partial<Store>): Store | undefined {
    const idx = this.state.stores.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    const updated = { ...this.state.stores[idx], ...updates, updatedAt: new Date().toISOString() };
    this.state.stores[idx] = updated;
    this.notify();
    return updated;
  }

  public deleteStore(id: string): boolean {
    this.state.stores = this.state.stores.filter((s) => s.id !== id);
    this.state.products = this.state.products.filter((p) => p.storeId !== id);
    this.notify();
    return true;
  }

  // --- Products ---
  public getProducts(storeId?: string): Product[] {
    if (storeId) {
      return this.state.products.filter((p) => p.storeId === storeId);
    }
    return this.state.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.state.products.find((p) => p.id === id);
  }

  public createProduct(product: Product): Product {
    this.state.products = [product, ...this.state.products];
    this.notify();
    return product;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    const idx = this.state.products.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    const updated = { ...this.state.products[idx], ...updates, updatedAt: new Date().toISOString() };
    this.state.products[idx] = updated;
    this.notify();
    return updated;
  }

  public deleteProduct(id: string): boolean {
    this.state.products = this.state.products.filter((p) => p.id !== id);
    this.notify();
    return true;
  }

  public addProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const newProduct: Product = {
      ...data,
      id: 'prod_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.createProduct(newProduct);
  }

  public getCourierProfile(userId: string): CourierProfile | undefined {
    return this.state.couriers.find((c) => c.userId === userId);
  }

  public updateCourierProfile(profile: CourierProfile): CourierProfile {
    const idx = this.state.couriers.findIndex((c) => c.id === profile.id || c.userId === profile.userId);
    if (idx === -1) {
      this.state.couriers.push(profile);
    } else {
      this.state.couriers[idx] = profile;
    }
    this.notify();
    return profile;
  }

  public assignCourierToOrder(
    orderId: string,
    courierId: string,
    courierName: string,
    courierPhone: string,
    courierCoords?: { latitude: number; longitude: number }
  ): Order | undefined {
    const idx = this.state.orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return undefined;
    const current = this.state.orders[idx];
    const store = this.getStoreById(current.storeId);
    
    const now = new Date().toISOString();
    const historyItem: OrderStatusHistoryItem = {
      status: 'COURIER_ASSIGNED',
      timestamp: now,
      actorId: courierId,
      actorRole: 'COURIER',
      note: 'تم إسناد الطلب للكابتن بنجاح',
    };

    const updated: Order = {
      ...current,
      courierId,
      courierName,
      courierPhone,
      status: current.status === 'READY_FOR_PICKUP' || current.status === 'ACCEPTED' || current.status === 'PREPARING' ? 'COURIER_ASSIGNED' : current.status,
      pickupLatitude: current.pickupLatitude || store?.latitude || 36.7695,
      pickupLongitude: current.pickupLongitude || store?.longitude || 3.0558,
      ...(courierCoords
        ? {
            courierLatitude: courierCoords.latitude,
            courierLongitude: courierCoords.longitude,
          }
        : current.courierLatitude
        ? {}
        : {
            courierLatitude: 36.7640,
            courierLongitude: 3.0535,
          }),
      statusHistory: [...current.statusHistory, historyItem],
      updatedAt: now,
    };
    this.state.orders[idx] = updated;

    // Update courier currentOrderId
    const courierIdx = this.state.couriers.findIndex((c) => c.userId === courierId || c.id === courierId);
    if (courierIdx !== -1) {
      this.state.couriers[courierIdx] = {
        ...this.state.couriers[courierIdx],
        currentOrderId: orderId,
      };
    }

    this.notify();
    return updated;
  }

  // --- Categories ---
  public getCategories(): Category[] {
    return this.state.categories;
  }

  // --- Orders ---
  public getOrders(filter?: { customerId?: string; storeId?: string; courierId?: string }): Order[] {
    let orders = [...this.state.orders];
    if (filter?.customerId) {
      orders = orders.filter((o) => o.customerId === filter.customerId);
    }
    if (filter?.storeId) {
      orders = orders.filter((o) => o.storeId === filter.storeId);
    }
    if (filter?.courierId) {
      orders = orders.filter((o) => o.courierId === filter.courierId);
    }
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderById(id: string): Order | undefined {
    return this.state.orders.find((o) => o.id === id);
  }

  public createOrder(order: Order): Order {
    const store = this.getStoreById(order.storeId);
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const todayCount = this.state.orders.filter((o) => o.createdAt.startsWith(new Date().toISOString().slice(0, 10))).length;
    const readableRef = `LB-${todayStr}-${String(todayCount + 1).padStart(4, '0')}`;

    const orderId = order.id || readableRef;
    const enrichedOrder: Order = {
      ...order,
      id: orderId,
      orderNumber: order.orderNumber || readableRef,
      deliveryOtp: order.deliveryOtp || Math.floor(1000 + Math.random() * 9000).toString(),
      pickupLatitude: order.pickupLatitude || store?.latitude || 36.7695,
      pickupLongitude: order.pickupLongitude || store?.longitude || 3.0558,
      customerLatitude: order.customerLatitude || order.deliveryAddress?.latitude || 36.7580,
      customerLongitude: order.customerLongitude || order.deliveryAddress?.longitude || 3.0510,
    };
    this.state.orders = [enrichedOrder, ...this.state.orders];

    // Trigger initial notification for the customer
    this.addNotification({
      customerId: enrichedOrder.customerId,
      title: 'تم إنشاء طلبك بنجاح',
      message: `تم إنشاء وتثبيت طلبك رقم ${enrichedOrder.orderNumber} من متجر ${enrichedOrder.storeName}. في انتظار قبول المتجر.`,
      orderId: enrichedOrder.id,
      type: 'ORDER_UPDATE',
      isRead: false,
    });

    this.notify();
    return enrichedOrder;
  }

  public updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    actorId: string,
    actorRole: UserRole,
    note?: string,
    additionalUpdates?: Partial<Order>
  ): Order | undefined {
    const idx = this.state.orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return undefined;
    const current = this.state.orders[idx];

    const historyItem = {
      status: newStatus,
      timestamp: new Date().toISOString(),
      actorId,
      actorRole,
      note,
    };

    const updated: Order = {
      ...current,
      ...additionalUpdates,
      status: newStatus,
      statusHistory: [...current.statusHistory, historyItem],
      updatedAt: new Date().toISOString(),
    };

    this.state.orders[idx] = updated;

    // Trigger financial settlement when order is delivered
    if (newStatus === 'DELIVERED') {
      this.processOrderFinancialCompletion(updated);
    }

    // Trigger notification to customer for status updates
    const statusNotifications: Partial<Record<OrderStatus, { title: string; message: string }>> = {
      ACCEPTED: { title: 'تم قبول طلبك', message: `وافق متجر ${current.storeName} على طلبك رقم ${current.orderNumber || current.id}، وجاري تحضيره.` },
      PREPARING: { title: 'جارٍ التحضير', message: `بدأ تجهيز طلبك في متجر ${current.storeName}.` },
      READY_FOR_PICKUP: { title: 'الطلب جاهز', message: `طلبك معبأ وفي انتظار استلام مندوب التوصيل.` },
      COURIER_ASSIGNED: { title: 'تم تعيين مندوب التوصيل', message: `قبل الكابتن مهمة التوصيل وتوجه لاستلام طلبك.` },
      PICKED_UP: { title: 'استلم المندوب طلبك', message: `استلم المندوب الطلب من ${current.storeName} وهو في طريقه إليك.` },
      ON_THE_WAY: { title: 'المندوب في الطريق إليك', message: `كابتن التوصيل في طريقه نحو عنوانك. يمكنك متابعة مساره مباشرة على الخريطة.` },
      ARRIVED: { title: 'وصل المندوب', message: `وصل المندوب إلى موقع التوصيل أمام الباب.` },
      DELIVERED: { title: 'تم التسليم بنجاح', message: `بالصحة والعافية! تم تسليم طلبك بنجاح. نرجو منك تقييم تجربتك.` },
      CANCELLED: { title: 'تم إلغاء الطلب', message: `تم إلغاء الطلب رقم ${current.orderNumber || current.id}.` },
    };

    const notifInfo = statusNotifications[newStatus];
    if (notifInfo) {
      this.addNotification({
        customerId: current.customerId,
        title: notifInfo.title,
        message: notifInfo.message,
        orderId: current.id,
        type: 'ORDER_UPDATE',
        isRead: false,
      });
    }

    this.notify();
    return updated;
  }

  // --- Delivery Tracking & Real-Time Location ---
  public updateCourierLocation(
    orderId: string,
    courierLatitude: number,
    courierLongitude: number,
    metrics?: {
      routeDistance?: number;
      estimatedDuration?: number;
      routeDistanceFormatted?: string;
      estimatedDurationFormatted?: string;
    }
  ): Order | undefined {
    const idx = this.state.orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return undefined;
    const current = this.state.orders[idx];

    // Privacy rule: Only share/update location while delivery is active
    if (current.status === 'DELIVERED' || current.status === 'CANCELLED') {
      return current;
    }

    const updated: Order = {
      ...current,
      courierLatitude,
      courierLongitude,
      ...(metrics?.routeDistance !== undefined ? { routeDistance: metrics.routeDistance } : {}),
      ...(metrics?.estimatedDuration !== undefined ? { estimatedDuration: metrics.estimatedDuration } : {}),
      ...(metrics?.routeDistanceFormatted ? { routeDistanceFormatted: metrics.routeDistanceFormatted } : {}),
      ...(metrics?.estimatedDurationFormatted ? { estimatedDurationFormatted: metrics.estimatedDurationFormatted } : {}),
      updatedAt: new Date().toISOString(),
    };

    this.state.orders[idx] = updated;
    this.notify();
    return updated;
  }

  public confirmDeliveryWithOtp(
    orderId: string,
    enteredOtp: string,
    courierId: string,
    deliveryCoords?: { latitude: number; longitude: number }
  ): { success: boolean; error?: string; order?: Order } {
    const idx = this.state.orders.findIndex((o) => o.id === orderId);
    if (idx === -1) {
      return { success: false, error: 'الطلب غير موجود في النظام' };
    }
    const current = this.state.orders[idx];

    // Validate 4-digit OTP
    const cleanEntered = (enteredOtp || '').trim();
    const cleanTarget = (current.deliveryOtp || '4821').trim();
    if (cleanEntered !== cleanTarget) {
      return {
        success: false,
        error: 'رمز تأكيد الاستلام غير صحيح. يرجى طلب الرمز السري المكون من 4 أرقام من الزبون.',
      };
    }

    const now = new Date().toISOString();
    const historyItem: OrderStatusHistoryItem = {
      status: 'DELIVERED',
      timestamp: now,
      actorId: courierId,
      actorRole: 'COURIER',
      note: 'تم تسليم الطلب بنجاح للزبون والتحقق من رمز الاستلام (OTP)',
    };

    const updated: Order = {
      ...current,
      status: 'DELIVERED',
      deliveryCompletedAt: now,
      updatedAt: now,
      statusHistory: [...current.statusHistory, historyItem],
      ...(deliveryCoords
        ? {
            customerLatitude: deliveryCoords.latitude,
            customerLongitude: deliveryCoords.longitude,
          }
        : {}),
    };

    this.state.orders[idx] = updated;

    // Trigger financial settlement for delivery completion
    this.processOrderFinancialCompletion(updated);

    // Update courier statistics
    const courierIdx = this.state.couriers.findIndex(
      (c) => c.userId === courierId || c.id === courierId
    );
    if (courierIdx !== -1) {
      this.state.couriers[courierIdx] = {
        ...this.state.couriers[courierIdx],
        totalDeliveries: (this.state.couriers[courierIdx].totalDeliveries || 0) + 1,
        earningsBalance:
          (this.state.couriers[courierIdx].earningsBalance || 0) +
          (current.deliveryFee || 250),
        currentOrderId: undefined,
      };
    }

    this.notify();
    return { success: true, order: updated };
  }

  public getDeliveryByOrderId(orderId: string): Delivery | undefined {
    const order = this.getOrderById(orderId);
    if (!order) return undefined;
    const store = this.getStoreById(order.storeId);
    return {
      id: 'del_' + order.id,
      deliveryId: 'del_' + order.id,
      orderId: order.id,
      courierId: order.courierId,
      courierName: order.courierName,
      courierPhone: order.courierPhone,
      storeId: order.storeId,
      storeName: order.storeName,
      storeAddress: order.storeAddress,
      customerId: order.customerId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      pickupAddress: order.storeAddress,
      pickupLatitude: order.pickupLatitude || store?.latitude || 36.7695,
      pickupLongitude: order.pickupLongitude || store?.longitude || 3.0558,
      deliveryAddress:
        order.deliveryAddress?.formattedAddress ||
        `${order.deliveryAddress?.street || ''}, ${order.deliveryAddress?.commune || ''}, ${order.deliveryAddress?.wilaya || ''}`,
      customerLatitude:
        order.customerLatitude || order.deliveryAddress?.latitude || 36.7580,
      customerLongitude:
        order.customerLongitude || order.deliveryAddress?.longitude || 3.0510,
      courierLatitude: order.courierLatitude,
      courierLongitude: order.courierLongitude,
      status: order.status,
      routeDistance: order.routeDistance,
      routeDistanceFormatted: order.routeDistanceFormatted,
      estimatedDuration: order.estimatedDuration,
      estimatedDurationFormatted: order.estimatedDurationFormatted,
      deliveryOtp: order.deliveryOtp || '4821',
      assignedAt: order.statusHistory.find((h) => h.status === 'COURIER_ASSIGNED')?.timestamp,
      pickedUpAt: order.statusHistory.find((h) => h.status === 'PICKED_UP')?.timestamp,
      startedAt: order.statusHistory.find((h) => h.status === 'ON_THE_WAY')?.timestamp,
      arrivedAt: order.statusHistory.find((h) => h.status === 'ARRIVED')?.timestamp,
      completedAt: order.statusHistory.find((h) => h.status === 'DELIVERED')?.timestamp,
      deliveryCompletedAt: order.deliveryCompletedAt,
      updatedAt: order.updatedAt,
    };
  }

  public getDeliveryById(deliveryId: string): Delivery | undefined {
    const orderId = deliveryId.startsWith('del_') ? deliveryId.substring(4) : deliveryId;
    return this.getDeliveryByOrderId(orderId);
  }

  // --- Couriers ---
  public getCouriers(): CourierProfile[] {
    return this.state.couriers;
  }

  public getCourierByUserId(userId: string): CourierProfile | undefined {
    return this.state.couriers.find((c) => c.userId === userId);
  }

  public updateCourier(id: string, updates: Partial<CourierProfile>): CourierProfile | undefined {
    const idx = this.state.couriers.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    const updated = { ...this.state.couriers[idx], ...updates };
    this.state.couriers[idx] = updated;
    this.notify();
    return updated;
  }

  public createCourier(courier: CourierProfile): CourierProfile {
    this.state.couriers = [...this.state.couriers, courier];
    this.notify();
    return courier;
  }

  // --- Delivery Zones ---
  public getDeliveryZones(): DeliveryZone[] {
    return this.state.deliveryZones;
  }

  public updateDeliveryZone(id: string, updates: Partial<DeliveryZone>): void {
    const idx = this.state.deliveryZones.findIndex((z) => z.id === id);
    if (idx !== -1) {
      this.state.deliveryZones[idx] = { ...this.state.deliveryZones[idx], ...updates };
      this.notify();
    }
  }

  // --- Customer Location & Address ---
  public getCustomerLocation(userId?: string): DeliveryLocation | null {
    if (userId) {
      const user = this.getUserById(userId);
      if (user?.deliveryLocation) return user.deliveryLocation;
    }
    try {
      const saved = localStorage.getItem('lbab_dar_selected_location');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  }

  public saveCustomerLocation(location: DeliveryLocation, userId?: string): void {
    const updatedLocation: DeliveryLocation = {
      ...location,
      updatedAt: new Date().toISOString(),
      createdAt: location.createdAt || new Date().toISOString(),
    };
    try {
      localStorage.setItem('lbab_dar_selected_location', JSON.stringify(updatedLocation));
    } catch {
      // ignore
    }
    if (userId) {
      this.updateUser(userId, { deliveryLocation: updatedLocation });
    }
    this.notify();
  }

  // --- Settings ---
  public getSettings(): PlatformSettings {
    return this.state.settings;
  }

  public updateSettings(settings: Partial<PlatformSettings>): void {
    this.state.settings = { ...this.state.settings, ...settings };
    this.notify();
  }

  // --- Dynamic Delivery Fee Calculation Engine ---
  public calculateDeliveryFee(
    storeId: string,
    customerLat?: number,
    customerLng?: number
  ): {
    baseFee: number;
    distanceFee: number;
    totalFee: number;
    distanceKm: number;
    distanceFormatted: string;
    estimatedMinutes: number;
  } {
    const store = this.getStoreById(storeId);
    const baseFee = store ? store.deliveryFee : 250;
    const baseMinutes = store ? store.deliveryTimeMin : 25;

    if (!store || !customerLat || !customerLng) {
      return {
        baseFee,
        distanceFee: 0,
        totalFee: baseFee,
        distanceKm: 0,
        distanceFormatted: '',
        estimatedMinutes: baseMinutes,
      };
    }

    const distanceMeters = calculateHaversineDistance(
      [store.latitude, store.longitude],
      [customerLat, customerLng]
    );
    const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;
    const distanceFormatted = formatDistanceArabic(distanceMeters);

    // Distance fee: beyond 2.5km, charge 35 DZD per extra km
    let distanceFee = 0;
    if (distanceKm > 2.5) {
      distanceFee = Math.round((distanceKm - 2.5) * 35);
      // Round to nearest 50 DZD
      distanceFee = Math.ceil(distanceFee / 50) * 50;
    }

    const totalFee = baseFee + distanceFee;
    const estimatedMinutes = Math.min(60, Math.max(15, baseMinutes + Math.round(distanceKm * 2.5)));

    return {
      baseFee,
      distanceFee,
      totalFee,
      distanceKm,
      distanceFormatted,
      estimatedMinutes,
    };
  }

  // --- Customer Addresses ---
  public getCustomerAddresses(customerId: string): CustomerAddress[] {
    return (this.state.addresses || []).filter((a) => a.customerId === customerId);
  }

  public getCustomerDefaultAddress(customerId: string): CustomerAddress | undefined {
    const addrs = this.getCustomerAddresses(customerId);
    return addrs.find((a) => a.isDefault) || addrs[0];
  }

  public addCustomerAddress(
    addressData: Omit<CustomerAddress, 'id' | 'createdAt' | 'updatedAt'>
  ): CustomerAddress {
    const newAddress: CustomerAddress = {
      ...addressData,
      id: 'addr_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let addresses = this.state.addresses || [];
    // If this address is set as default, unset others for this customer
    if (newAddress.isDefault) {
      addresses = addresses.map((a) =>
        a.customerId === newAddress.customerId ? { ...a, isDefault: false } : a
      );
    } else if (addresses.filter((a) => a.customerId === newAddress.customerId).length === 0) {
      newAddress.isDefault = true;
    }

    this.state.addresses = [newAddress, ...addresses];
    this.notify();
    return newAddress;
  }

  public updateCustomerAddress(
    id: string,
    updates: Partial<CustomerAddress>
  ): CustomerAddress | undefined {
    let addresses = this.state.addresses || [];
    const idx = addresses.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;

    const current = addresses[idx];
    if (updates.isDefault) {
      addresses = addresses.map((a) =>
        a.customerId === current.customerId ? { ...a, isDefault: false } : a
      );
    }

    const updated: CustomerAddress = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    addresses[idx] = updated;
    this.state.addresses = addresses;
    this.notify();
    return updated;
  }

  public deleteCustomerAddress(id: string): boolean {
    const addresses = this.state.addresses || [];
    const target = addresses.find((a) => a.id === id);
    if (!target) return false;

    let remaining = addresses.filter((a) => a.id !== id);
    // If deleted address was default, promote another
    if (target.isDefault) {
      const customerOther = remaining.find((a) => a.customerId === target.customerId);
      if (customerOther) {
        remaining = remaining.map((a) =>
          a.id === customerOther.id ? { ...a, isDefault: true } : a
        );
      }
    }
    this.state.addresses = remaining;
    this.notify();
    return true;
  }

  public setDefaultAddress(customerId: string, addressId: string): void {
    let addresses = this.state.addresses || [];
    addresses = addresses.map((a) => {
      if (a.customerId === customerId) {
        return { ...a, isDefault: a.id === addressId };
      }
      return a;
    });
    this.state.addresses = addresses;
    this.notify();
  }

  // --- Customer Favorites ---
  public getFavorites(customerId: string): FavoriteItem[] {
    return (this.state.favorites || []).filter((f) => f.customerId === customerId);
  }

  public isFavorite(customerId: string, type: 'STORE' | 'PRODUCT', targetId: string): boolean {
    const favs = this.getFavorites(customerId);
    return favs.some((f) => f.type === type && f.targetId === targetId);
  }

  public toggleFavorite(customerId: string, type: 'STORE' | 'PRODUCT', targetId: string): boolean {
    let favorites = this.state.favorites || [];
    const existing = favorites.find(
      (f) => f.customerId === customerId && f.type === type && f.targetId === targetId
    );

    if (existing) {
      this.state.favorites = favorites.filter((f) => f.id !== existing.id);
      this.notify();
      return false; // Removed
    } else {
      const newFav: FavoriteItem = {
        id: 'fav_' + Math.random().toString(36).substring(2, 9),
        customerId,
        type,
        targetId,
        createdAt: new Date().toISOString(),
      };
      this.state.favorites = [newFav, ...favorites];
      this.notify();
      return true; // Added
    }
  }

  public getFavoriteStores(customerId: string): Store[] {
    const favStoreIds = this.getFavorites(customerId)
      .filter((f) => f.type === 'STORE')
      .map((f) => f.targetId);
    return this.state.stores.filter((s) => favStoreIds.includes(s.id));
  }

  public getFavoriteProducts(customerId: string): Product[] {
    const favProductIds = this.getFavorites(customerId)
      .filter((f) => f.type === 'PRODUCT')
      .map((f) => f.targetId);
    return this.state.products.filter((p) => favProductIds.includes(p.id));
  }

  // --- Reviews ---
  public getOrderReview(orderId: string): OrderReview | undefined {
    return (this.state.reviews || []).find((r) => r.orderId === orderId);
  }

  public getStoreReviews(storeId: string): OrderReview[] {
    return (this.state.reviews || []).filter((r) => r.storeId === storeId);
  }

  public addOrderReview(reviewData: Omit<OrderReview, 'id' | 'createdAt'>): OrderReview {
    // Prevent duplicate reviews for the same order
    const existing = this.getOrderReview(reviewData.orderId);
    if (existing) {
      return existing;
    }

    const newReview: OrderReview = {
      ...reviewData,
      id: 'rev_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };

    this.state.reviews = [newReview, ...(this.state.reviews || [])];

    // Update store rating dynamically
    const storeReviews = this.getStoreReviews(reviewData.storeId);
    const store = this.getStoreById(reviewData.storeId);
    if (store) {
      const avg =
        storeReviews.reduce((sum, r) => sum + r.storeRating, 0) / storeReviews.length;
      this.updateStore(store.id, {
        rating: Math.round(avg * 10) / 10,
        reviewCount: storeReviews.length,
      });
    }

    this.notify();
    return newReview;
  }

  // --- Notifications ---
  public getNotifications(customerId: string): CustomerNotification[] {
    return (this.state.notifications || [])
      .filter((n) => n.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getUnreadNotificationCount(customerId: string): number {
    return (this.state.notifications || []).filter(
      (n) => n.customerId === customerId && !n.isRead
    ).length;
  }

  public markNotificationAsRead(id: string): void {
    let notifs = this.state.notifications || [];
    notifs = notifs.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    this.state.notifications = notifs;
    this.notify();
  }

  public markAllNotificationsAsRead(customerId: string): void {
    let notifs = this.state.notifications || [];
    notifs = notifs.map((n) =>
      n.customerId === customerId ? { ...n, isRead: true } : n
    );
    this.state.notifications = notifs;
    this.notify();
  }

  public addNotification(
    notifData: Omit<CustomerNotification, 'id' | 'createdAt'>
  ): CustomerNotification {
    const newNotif: CustomerNotification = {
      ...notifData,
      id: 'notif_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    this.state.notifications = [newNotif, ...(this.state.notifications || [])];
    this.notify();
    return newNotif;
  }

  // --- Search & Discovery ---
  public getRecentlyViewedStores(ids: string[]): Store[] {
    if (!ids || ids.length === 0) return [];
    return ids
      .map((id) => this.getStoreById(id))
      .filter((s): s is Store => s !== undefined);
  }

  public searchAll(query: string): {
    stores: Store[];
    products: Product[];
    categories: Category[];
  } {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { stores: [], products: [], categories: [] };
    }

    const matchedCategories = this.state.categories.filter((c) =>
      c.name.toLowerCase().includes(q)
    );

    const matchedStores = this.state.stores.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.commune.toLowerCase().includes(q) ||
        s.wilaya.toLowerCase().includes(q)
    );

    const matchedProducts = this.state.products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    );

    return {
      stores: matchedStores,
      products: matchedProducts,
      categories: matchedCategories,
    };
  }

  // ==========================================
  // --- PHASE 3: FINANCIAL ARCHITECTURE & LEDGER ---
  // ==========================================

  // --- Automatic Order Financial Settlement ---
  public processOrderFinancialCompletion(order: Order): void {
    if (!order || order.status !== 'DELIVERED') return;

    // Prevent duplicate processing
    const alreadyProcessed = (this.state.transactions || []).some(
      (t) => t.orderId === order.id && t.type === 'ORDER_EARNING'
    );
    if (alreadyProcessed) return;

    const store = this.getStoreById(order.storeId);
    const merchantId = store?.merchantId || 'user_merchant_1';
    const now = new Date().toISOString();

    // 1. Commission Calculation
    const commSettings = this.state.commissionSettings || INITIAL_COMMISSION_SETTINGS;
    const commRatePercent = commSettings.merchant?.value || 10;
    const subtotal = order.subtotal || 0;
    const platformMerchantCommission = Math.round(subtotal * (commRatePercent / 100));
    const merchantNetEarning = Math.max(0, subtotal - platformMerchantCommission);

    const newTransactions: FinancialTransaction[] = [];

    // Merchant Earning Transaction
    const txMerchant: FinancialTransaction = {
      id: 'tx_' + Math.random().toString(36).substring(2, 9),
      transactionId: `TX-${now.slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: merchantId,
      userRole: 'MERCHANT',
      type: 'ORDER_EARNING',
      amount: merchantNetEarning,
      referenceId: order.id,
      orderId: order.id,
      status: 'COMPLETED',
      createdAt: now,
      description: `صافي أرباح مبيعات الطلب #${order.orderNumber || order.id} (بعد خصم عمولة المنصة ${commRatePercent}%)`,
    };
    newTransactions.push(txMerchant);

    // Platform Commission Transaction from Merchant
    const txPlatformComm: FinancialTransaction = {
      id: 'tx_' + Math.random().toString(36).substring(2, 9),
      transactionId: `TX-${now.slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: 'user_admin',
      userRole: 'ADMIN',
      type: 'COMMISSION',
      amount: platformMerchantCommission,
      referenceId: order.id,
      orderId: order.id,
      status: 'COMPLETED',
      createdAt: now,
      description: `عمولة المنصة (${commRatePercent}%) من مبيعات الطلب #${order.orderNumber || order.id} لمتجر ${order.storeName}`,
    };
    newTransactions.push(txPlatformComm);

    // Courier Delivery Settlement
    if (order.courierId) {
      const deliveryFee = order.deliveryFee || 250;
      const courierSharePct = commSettings.deliveryFeeAllocation?.courierSharePercentage || 80;
      const courierNetEarning = Math.round(deliveryFee * (courierSharePct / 100));
      const platformDeliveryShare = Math.max(0, deliveryFee - courierNetEarning);

      const txCourier: FinancialTransaction = {
        id: 'tx_' + Math.random().toString(36).substring(2, 9),
        transactionId: `TX-${now.slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: order.courierId,
        userRole: 'COURIER',
        type: 'DELIVERY_EARNING',
        amount: courierNetEarning,
        referenceId: order.id,
        orderId: order.id,
        status: 'COMPLETED',
        createdAt: now,
        description: `مستحقات كابتن التوصيل عن الطلب #${order.orderNumber || order.id} (${courierSharePct}% من رسم التوصيل)`,
      };
      newTransactions.push(txCourier);

      if (platformDeliveryShare > 0) {
        const txPlatDeliv: FinancialTransaction = {
          id: 'tx_' + Math.random().toString(36).substring(2, 9),
          transactionId: `TX-${now.slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
          userId: 'user_admin',
          userRole: 'ADMIN',
          type: 'COMMISSION',
          amount: platformDeliveryShare,
          referenceId: order.id,
          orderId: order.id,
          status: 'COMPLETED',
          createdAt: now,
          description: `حصة المنصة من رسوم توصيل الطلب #${order.orderNumber || order.id}`,
        };
        newTransactions.push(txPlatDeliv);
      }
    }

    this.state.transactions = [...newTransactions, ...(this.state.transactions || [])];
    this.notify();
  }

  // --- Financial Balances Calculation ---
  public calculateMerchantFinances(storeId: string): {
    grossSales: number;
    platformCommission: number;
    netEarnings: number;
    withdrawnAmount: number;
    pendingBalance: number;
    availableBalance: number;
    completedOrdersCount: number;
  } {
    const deliveredOrders = (this.state.orders || []).filter(
      (o) => o.storeId === storeId && o.status === 'DELIVERED'
    );
    const grossSales = deliveredOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);

    const commSettings = this.state.commissionSettings || INITIAL_COMMISSION_SETTINGS;
    const commRatePercent = commSettings.merchant?.value || 10;
    const platformCommission = Math.round(grossSales * (commRatePercent / 100));
    const netEarnings = Math.max(0, grossSales - platformCommission);

    const store = this.getStoreById(storeId);
    const merchantUserId = store?.merchantId;

    const withdrawals = (this.state.withdrawalRequests || []).filter(
      (w) => (w.storeId === storeId || w.userId === merchantUserId) && w.userRole === 'MERCHANT'
    );

    const withdrawnAmount = withdrawals
      .filter((w) => w.status === 'COMPLETED')
      .reduce((sum, w) => sum + w.amount, 0);

    const pendingBalance = withdrawals
      .filter((w) => ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'PROCESSING'].includes(w.status))
      .reduce((sum, w) => sum + w.amount, 0);

    const availableBalance = Math.max(0, netEarnings - withdrawnAmount - pendingBalance);

    return {
      grossSales,
      platformCommission,
      netEarnings,
      withdrawnAmount,
      pendingBalance,
      availableBalance,
      completedOrdersCount: deliveredOrders.length,
    };
  }

  public calculateCourierFinances(courierUserId: string): {
    completedDeliveries: number;
    grossDeliveryEarnings: number;
    platformShare: number;
    netCourierEarnings: number;
    withdrawnAmount: number;
    pendingBalance: number;
    availableBalance: number;
  } {
    const deliveredOrders = (this.state.orders || []).filter(
      (o) => o.courierId === courierUserId && o.status === 'DELIVERED'
    );
    const grossDeliveryEarnings = deliveredOrders.reduce(
      (sum, o) => sum + (o.deliveryFee || 250),
      0
    );

    const commSettings = this.state.commissionSettings || INITIAL_COMMISSION_SETTINGS;
    const courierSharePct = commSettings.deliveryFeeAllocation?.courierSharePercentage || 80;
    const netCourierEarnings = Math.round(grossDeliveryEarnings * (courierSharePct / 100));
    const platformShare = Math.max(0, grossDeliveryEarnings - netCourierEarnings);

    const withdrawals = (this.state.withdrawalRequests || []).filter(
      (w) => w.userId === courierUserId && w.userRole === 'COURIER'
    );

    const withdrawnAmount = withdrawals
      .filter((w) => w.status === 'COMPLETED')
      .reduce((sum, w) => sum + w.amount, 0);

    const pendingBalance = withdrawals
      .filter((w) => ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'PROCESSING'].includes(w.status))
      .reduce((sum, w) => sum + w.amount, 0);

    const availableBalance = Math.max(0, netCourierEarnings - withdrawnAmount - pendingBalance);

    return {
      completedDeliveries: deliveredOrders.length,
      grossDeliveryEarnings,
      platformShare,
      netCourierEarnings,
      withdrawnAmount,
      pendingBalance,
      availableBalance,
    };
  }

  public calculateAdminFinancialStats(dateFilter: 'today' | 'week' | 'month' | 'all' = 'all') {
    const orders = this.state.orders || [];
    const now = new Date();

    const isWithinDate = (dateStr: string) => {
      if (dateFilter === 'all') return true;
      const d = new Date(dateStr);
      const diffMs = now.getTime() - d.getTime();
      if (dateFilter === 'today') return diffMs < 24 * 60 * 60 * 1000;
      if (dateFilter === 'week') return diffMs < 7 * 24 * 60 * 60 * 1000;
      if (dateFilter === 'month') return diffMs < 30 * 24 * 60 * 60 * 1000;
      return true;
    };

    const deliveredOrders = orders.filter(
      (o) => o.status === 'DELIVERED' && isWithinDate(o.updatedAt || o.createdAt)
    );

    const gmv = deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const merchantGrossSales = deliveredOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
    const deliveryFeesTotal = deliveredOrders.reduce((sum, o) => sum + (o.deliveryFee || 250), 0);

    const commSettings = this.state.commissionSettings || INITIAL_COMMISSION_SETTINGS;
    const commRate = commSettings.merchant?.value || 10;
    const courierSharePct = commSettings.deliveryFeeAllocation?.courierSharePercentage || 80;

    const totalCommissions = Math.round(merchantGrossSales * (commRate / 100));
    const totalCourierEarnings = Math.round(deliveryFeesTotal * (courierSharePct / 100));
    const platformDeliveryFees = deliveryFeesTotal - totalCourierEarnings;
    const totalPlatformRevenue = totalCommissions + platformDeliveryFees;
    const netMerchantPayouts = merchantGrossSales - totalCommissions;

    const filteredWithdrawals = (this.state.withdrawalRequests || []).filter((w) =>
      isWithinDate(w.createdAt)
    );

    const completedWithdrawals = filteredWithdrawals
      .filter((w) => w.status === 'COMPLETED')
      .reduce((sum, w) => sum + w.amount, 0);

    const pendingWithdrawalsCount = (this.state.withdrawalRequests || []).filter((w) =>
      ['PENDING', 'UNDER_REVIEW'].includes(w.status)
    ).length;

    const pendingWithdrawalsAmount = (this.state.withdrawalRequests || []).filter((w) =>
      ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'PROCESSING'].includes(w.status)
    ).reduce((sum, w) => sum + w.amount, 0);

    return {
      gmv,
      merchantGrossSales,
      deliveryFeesTotal,
      totalCommissions,
      totalCourierEarnings,
      totalPlatformRevenue,
      netMerchantPayouts,
      completedWithdrawals,
      pendingWithdrawalsCount,
      pendingWithdrawalsAmount,
      deliveredOrdersCount: deliveredOrders.length,
      totalOrdersCount: orders.filter((o) => isWithinDate(o.createdAt)).length,
    };
  }

  // --- Branches Management ---
  public getBranches(): Branch[] {
    return this.state.branches || [];
  }

  public getBranchById(id: string): Branch | undefined {
    return (this.state.branches || []).find((b) => b.id === id);
  }

  public createBranch(
    data: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>,
    adminId: string = 'user_admin'
  ): Branch {
    const newBranch: Branch = {
      ...data,
      id: 'branch_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.branches = [...(this.state.branches || []), newBranch];
    this.addAuditLog({
      actorId: adminId,
      actorRole: 'ADMIN',
      action: 'BRANCH_CREATE',
      targetId: newBranch.id,
      newValue: newBranch,
      details: `إضافة فرع جديد: ${newBranch.name} (${newBranch.wilaya})`,
    });
    this.notify();
    return newBranch;
  }

  public updateBranch(
    id: string,
    updates: Partial<Branch>,
    adminId: string = 'user_admin'
  ): Branch | undefined {
    const branches = this.state.branches || [];
    const idx = branches.findIndex((b) => b.id === id);
    if (idx === -1) return undefined;
    const old = branches[idx];
    const updated: Branch = {
      ...old,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    branches[idx] = updated;
    this.state.branches = branches;
    this.addAuditLog({
      actorId: adminId,
      actorRole: 'ADMIN',
      action: 'BRANCH_UPDATE',
      targetId: id,
      previousValue: old,
      newValue: updated,
      details: `تحديث بيانات الفرع: ${updated.name}`,
    });
    this.notify();
    return updated;
  }

  public deleteBranch(id: string, adminId: string = 'user_admin'): boolean {
    const branches = this.state.branches || [];
    const target = branches.find((b) => b.id === id);
    if (!target) return false;
    this.state.branches = branches.filter((b) => b.id !== id);
    this.addAuditLog({
      actorId: adminId,
      actorRole: 'ADMIN',
      action: 'BRANCH_DELETE',
      targetId: id,
      previousValue: target,
      details: `حذف الفرع: ${target.name}`,
    });
    this.notify();
    return true;
  }

  public toggleBranchActive(id: string, adminId: string = 'user_admin'): Branch | undefined {
    const branch = this.getBranchById(id);
    if (!branch) return undefined;
    return this.updateBranch(id, { isActive: !branch.isActive }, adminId);
  }

  public toggleBranchOpen(id: string, adminId: string = 'user_admin'): Branch | undefined {
    const branch = this.getBranchById(id);
    if (!branch) return undefined;
    return this.updateBranch(id, { isOpen: !branch.isOpen }, adminId);
  }

  // --- Payment Settings & Commission Settings ---
  public getPaymentSettings(): PaymentSettings {
    return this.state.paymentSettings || INITIAL_PAYMENT_SETTINGS;
  }

  public updatePaymentSettings(
    settings: Partial<PaymentSettings>,
    adminId: string = 'user_admin'
  ): PaymentSettings {
    const prev = this.getPaymentSettings();
    const updated: PaymentSettings = {
      ...prev,
      ...settings,
      merchantWithdrawals: {
        ...prev.merchantWithdrawals,
        ...(settings.merchantWithdrawals || {}),
      },
      courierWithdrawals: {
        ...prev.courierWithdrawals,
        ...(settings.courierWithdrawals || {}),
      },
    };
    this.state.paymentSettings = updated;
    this.addAuditLog({
      actorId: adminId,
      actorRole: 'ADMIN',
      action: 'PAYMENT_SETTINGS_UPDATE',
      targetId: 'paymentSettings',
      previousValue: prev,
      newValue: updated,
      details: 'تحديث إعدادات طرق السحب والدفع للمنصة',
    });
    this.notify();
    return updated;
  }

  public getCommissionSettings(): CommissionSettings {
    const current = this.state.commissionSettings || INITIAL_COMMISSION_SETTINGS;
    return {
      ...INITIAL_COMMISSION_SETTINGS,
      ...current,
      withdrawalLimits: {
        ...INITIAL_COMMISSION_SETTINGS.withdrawalLimits,
        ...(current.withdrawalLimits || {}),
      },
    };
  }

  public updateCommissionSettings(
    settings: Partial<CommissionSettings>,
    adminId: string = 'user_admin'
  ): CommissionSettings {
    const prev = this.getCommissionSettings();
    const updated: CommissionSettings = {
      ...prev,
      ...settings,
      merchant: { ...prev.merchant, ...(settings.merchant || {}) },
      courier: { ...prev.courier, ...(settings.courier || {}) },
      deliveryFeeAllocation: {
        ...prev.deliveryFeeAllocation,
        ...(settings.deliveryFeeAllocation || {}),
      },
      withdrawalLimits: {
        ...prev.withdrawalLimits,
        ...(settings.withdrawalLimits || {}),
      },
    };
    this.state.commissionSettings = updated;
    this.addAuditLog({
      actorId: adminId,
      actorRole: 'ADMIN',
      action: 'COMMISSION_SETTINGS_UPDATE',
      targetId: 'commissionSettings',
      previousValue: prev,
      newValue: updated,
      details: 'تحديث نسب العمولات وحدود السحب والموافقات',
    });
    this.notify();
    return updated;
  }

  // --- User Payment Profiles & Verification ---
  public getUserPaymentProfile(userId: string): UserPaymentProfile | undefined {
    return (this.state.paymentProfiles || []).find((p) => p.userId === userId);
  }

  public getAllPaymentProfiles(): UserPaymentProfile[] {
    return this.state.paymentProfiles || [];
  }

  public saveUserPaymentProfile(
    data: {
      userId: string;
      userName: string;
      userRole: 'MERCHANT' | 'COURIER';
      storeId?: string;
      activeMethod: 'CIB' | 'EDAHABIA' | 'BRANCH';
      cib?: any;
      edahabia?: any;
      branch?: any;
    }
  ): UserPaymentProfile {
    const profiles = this.state.paymentProfiles || [];
    const idx = profiles.findIndex((p) => p.userId === data.userId);
    const now = new Date().toISOString();

    let profile: UserPaymentProfile;
    if (idx !== -1) {
      profile = {
        ...profiles[idx],
        ...data,
        verificationStatus: 'PENDING_VERIFICATION',
        rejectionReason: undefined,
        lastUpdated: now,
      };
      profiles[idx] = profile;
    } else {
      profile = {
        ...data,
        id: 'pay_profile_' + Math.random().toString(36).substring(2, 9),
        verificationStatus: 'PENDING_VERIFICATION',
        lastUpdated: now,
      };
      profiles.push(profile);
    }

    this.state.paymentProfiles = profiles;
    this.notify();
    return profile;
  }

  public verifyUserPaymentProfile(
    profileId: string,
    status: FinancialVerificationStatus,
    adminId: string,
    adminName: string,
    rejectionReason?: string
  ): UserPaymentProfile | undefined {
    const profiles = this.state.paymentProfiles || [];
    const idx = profiles.findIndex((p) => p.id === profileId);
    if (idx === -1) return undefined;

    const now = new Date().toISOString();
    const updated: UserPaymentProfile = {
      ...profiles[idx],
      verificationStatus: status,
      rejectionReason: status === 'REJECTED' ? rejectionReason : undefined,
      reviewedAt: now,
      reviewedBy: adminId,
    };
    profiles[idx] = updated;
    this.state.paymentProfiles = profiles;

    this.addAuditLog({
      actorId: adminId,
      actorRole: 'ADMIN',
      actorName: adminName,
      action: 'PAYMENT_PROFILE_VERIFICATION',
      targetId: profileId,
      newValue: { status, rejectionReason },
      details: `تحديث حالة توثيق الحساب المالي للمستخدم ${updated.userName} إلى ${status}`,
    });

    this.notify();
    return updated;
  }

  // --- Withdrawal Validation & Operations ---
  public canUserWithdraw(
    userId: string,
    userRole: 'MERCHANT' | 'COURIER',
    amount: number,
    method: WithdrawalMethod,
    storeId?: string
  ): { allowed: boolean; reason?: string } {
    const paymentSettings = this.getPaymentSettings();
    const methodConfigs =
      userRole === 'MERCHANT'
        ? paymentSettings.merchantWithdrawals
        : paymentSettings.courierWithdrawals;

    if (method === 'CIB' && !methodConfigs.cib.enabled) {
      return { allowed: false, reason: 'طريقة السحب عبر الحساب البنكي (CIB) غير مفعلة حالياً من قبل الإدارة.' };
    }
    if (method === 'EDAHABIA' && !methodConfigs.edahabia.enabled) {
      return { allowed: false, reason: 'طريقة السحب عبر البطاقة الذهبية غير مفعلة حالياً من قبل الإدارة.' };
    }
    if (method === 'BRANCH' && !methodConfigs.branch.enabled) {
      return { allowed: false, reason: 'طريقة السحب النقدي من الفروع غير مفعلة حالياً من قبل الإدارة.' };
    }

    const profile = this.getUserPaymentProfile(userId);
    if (!profile || profile.verificationStatus !== 'VERIFIED') {
      return {
        allowed: false,
        reason: 'يجب توثيق وتأكيد بيانات الحساب المالي أولاً من قبل إدارة المنصة لتتمكن من تقديم طلب سحب.',
      };
    }

    let availableBalance = 0;
    if (userRole === 'MERCHANT') {
      const fin = this.calculateMerchantFinances(storeId || '');
      availableBalance = fin.availableBalance;
    } else {
      const fin = this.calculateCourierFinances(userId);
      availableBalance = fin.availableBalance;
    }

    if (amount > availableBalance) {
      return {
        allowed: false,
        reason: `المبلغ المطلوب (${amount.toLocaleString()} دج) يتجاوز الرصيد المتاح للسحب (${availableBalance.toLocaleString()} دج).`,
      };
    }

    const limits = this.getCommissionSettings().withdrawalLimits;
    const minAmount = userRole === 'MERCHANT' ? limits.minAmountMerchant : limits.minAmountCourier;
    const maxAmount = userRole === 'MERCHANT' ? limits.maxAmountMerchant : limits.maxAmountCourier;
    const dailyLimit = userRole === 'MERCHANT' ? limits.dailyLimitMerchant : limits.dailyLimitCourier;

    if (amount < minAmount) {
      return {
        allowed: false,
        reason: `الحد الأدنى لمبلغ السحب هو ${minAmount.toLocaleString()} دج.`,
      };
    }
    if (amount > maxAmount) {
      return {
        allowed: false,
        reason: `الحد الأقصى لكل طلب سحب هو ${maxAmount.toLocaleString()} دج.`,
      };
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayWithdrawals = (this.state.withdrawalRequests || [])
      .filter(
        (w) =>
          w.userId === userId &&
          w.createdAt.startsWith(todayStr) &&
          w.status !== 'REJECTED' &&
          w.status !== 'CANCELLED'
      )
      .reduce((sum, w) => sum + w.amount, 0);

    if (todayWithdrawals + amount > dailyLimit) {
      return {
        allowed: false,
        reason: `تجاوزت الحد اليومي المسموح به للسحب (${dailyLimit.toLocaleString()} دج). لقد طلبت اليوم ${todayWithdrawals.toLocaleString()} دج.`,
      };
    }

    return { allowed: true };
  }

  public createWithdrawalRequest(params: {
    userId: string;
    userName: string;
    userRole: 'MERCHANT' | 'COURIER';
    storeId?: string;
    storeName?: string;
    amount: number;
    withdrawalMethod: WithdrawalMethod;
    branchId?: string;
    notes?: string;
  }): { success: boolean; request?: WithdrawalRequest; error?: string } {
    const check = this.canUserWithdraw(
      params.userId,
      params.userRole,
      params.amount,
      params.withdrawalMethod,
      params.storeId
    );
    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    const profile = this.getUserPaymentProfile(params.userId);
    if (!profile) {
      return { success: false, error: 'لم يتم العثور على ملف الدفع المالي للمستخدم.' };
    }

    const now = new Date().toISOString();
    const todayStr = now.slice(0, 10).replace(/-/g, '');
    const countToday = (this.state.withdrawalRequests || []).filter((w) =>
      w.createdAt.startsWith(now.slice(0, 10))
    ).length;
    const readableRef = `WDR-${todayStr}-${String(countToday + 1).padStart(4, '0')}`;

    let branchDetails: any = undefined;
    if (params.withdrawalMethod === 'BRANCH' && params.branchId) {
      const b = this.getBranchById(params.branchId);
      if (b) {
        branchDetails = {
          branchId: b.id,
          branchName: b.name,
          branchAddress: b.address,
          wilaya: b.wilaya,
        };
      }
    }

    let snapshotDetails: any = {};
    if (params.withdrawalMethod === 'CIB') snapshotDetails = profile.cib || {};
    else if (params.withdrawalMethod === 'EDAHABIA') snapshotDetails = profile.edahabia || {};
    else snapshotDetails = branchDetails || profile.branch || {};

    const limits = this.getCommissionSettings().withdrawalLimits;
    const initialStatus: WithdrawalStatus =
      limits.approvalMode === 'AUTOMATIC' ? 'APPROVED' : 'PENDING';

    const newRequest: WithdrawalRequest = {
      id: 'wdr_' + Math.random().toString(36).substring(2, 9),
      requestId: readableRef,
      userId: params.userId,
      userName: params.userName,
      userRole: params.userRole,
      storeId: params.storeId,
      storeName: params.storeName,
      amount: params.amount,
      withdrawalMethod: params.withdrawalMethod,
      paymentInformationSnapshot: {
        method: params.withdrawalMethod,
        details: snapshotDetails,
        branchDetails,
      },
      branchId: params.branchId,
      status: initialStatus,
      createdAt: now,
      notes: params.notes,
      statusHistory: [
        {
          status: initialStatus,
          timestamp: now,
          note:
            initialStatus === 'APPROVED'
              ? 'تمت الموافقة التلقائية بحسب إعدادات المنصة'
              : 'تم تقديم طلب السحب وفي انتظار مراجعة الإدارة',
        },
      ],
    };

    this.state.withdrawalRequests = [newRequest, ...(this.state.withdrawalRequests || [])];

    this.addTransaction({
      userId: params.userId,
      userRole: params.userRole,
      type: 'WITHDRAWAL',
      amount: -params.amount,
      referenceId: newRequest.id,
      withdrawalId: newRequest.id,
      status: initialStatus === 'APPROVED' ? 'COMPLETED' : 'PENDING',
      description: `طلب سحب أرباح #${readableRef} بقيمة ${params.amount.toLocaleString()} دج عبر ${
        params.withdrawalMethod === 'CIB'
          ? 'حساب بنكي (CIB)'
          : params.withdrawalMethod === 'EDAHABIA'
          ? 'بطاقة الذهبية (CCP)'
          : 'الفرع المعتمد'
      }`,
    });

    this.notify();
    return { success: true, request: newRequest };
  }

  public updateWithdrawalStatus(
    requestId: string,
    newStatus: WithdrawalStatus,
    adminId: string,
    adminName: string,
    notes?: string,
    rejectionReason?: string
  ): WithdrawalRequest | undefined {
    const requests = this.state.withdrawalRequests || [];
    const idx = requests.findIndex((w) => w.id === requestId);
    if (idx === -1) return undefined;

    const current = requests[idx];
    const now = new Date().toISOString();

    const historyItem = {
      status: newStatus,
      timestamp: now,
      adminId,
      note: notes || rejectionReason || `تحديث الحالة إلى ${newStatus}`,
    };

    const updated: WithdrawalRequest = {
      ...current,
      status: newStatus,
      adminId,
      adminName,
      reviewedAt: current.reviewedAt || now,
      processedAt: newStatus === 'PROCESSING' || newStatus === 'COMPLETED' ? now : current.processedAt,
      completedAt: newStatus === 'COMPLETED' ? now : current.completedAt,
      rejectionReason: newStatus === 'REJECTED' ? rejectionReason : current.rejectionReason,
      notes: notes || current.notes,
      statusHistory: [...(current.statusHistory || []), historyItem],
    };

    requests[idx] = updated;
    this.state.withdrawalRequests = requests;

    const txIdx = (this.state.transactions || []).findIndex(
      (t) => t.withdrawalId === requestId || t.referenceId === requestId
    );
    if (txIdx !== -1) {
      const tx = this.state.transactions[txIdx];
      if (newStatus === 'COMPLETED') {
        this.state.transactions[txIdx] = { ...tx, status: 'COMPLETED' };
      } else if (newStatus === 'REJECTED' || newStatus === 'CANCELLED') {
        this.state.transactions[txIdx] = { ...tx, status: 'CANCELLED' };
      }
    }

    this.addAuditLog({
      actorId: adminId,
      actorRole: 'ADMIN',
      actorName: adminName,
      action: 'WITHDRAWAL_STATUS_UPDATE',
      targetId: requestId,
      previousValue: current.status,
      newValue: newStatus,
      details: `تحديث حالة طلب السحب #${current.requestId} إلى ${newStatus}${rejectionReason ? ` - سبب الرفض: ${rejectionReason}` : ''}`,
    });

    this.notify();
    return updated;
  }

  public getWithdrawalRequests(filter?: {
    userId?: string;
    userRole?: string;
    status?: string;
  }): WithdrawalRequest[] {
    let list = this.state.withdrawalRequests || [];
    if (filter?.userId) list = list.filter((w) => w.userId === filter.userId);
    if (filter?.userRole) list = list.filter((w) => w.userRole === filter.userRole);
    if (filter?.status) list = list.filter((w) => w.status === filter.status);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getWithdrawalRequestById(id: string): WithdrawalRequest | undefined {
    return (this.state.withdrawalRequests || []).find((w) => w.id === id);
  }

  // --- Transactions Ledger ---
  public getTransactions(filter?: {
    userId?: string;
    userRole?: UserRole;
    type?: TransactionType;
  }): FinancialTransaction[] {
    let list = this.state.transactions || [];
    if (filter?.userId) list = list.filter((t) => t.userId === filter.userId);
    if (filter?.userRole) list = list.filter((t) => t.userRole === filter.userRole);
    if (filter?.type) list = list.filter((t) => t.type === filter.type);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addTransaction(
    txData: Omit<FinancialTransaction, 'id' | 'transactionId' | 'createdAt'>
  ): FinancialTransaction {
    const now = new Date().toISOString();
    const newTx: FinancialTransaction = {
      ...txData,
      id: 'tx_' + Math.random().toString(36).substring(2, 9),
      transactionId: `TX-${now.slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: now,
    };
    this.state.transactions = [newTx, ...(this.state.transactions || [])];
    this.notify();
    return newTx;
  }

  // --- Audit Logs ---
  public getAuditLogs(): FinancialAuditLog[] {
    return (this.state.auditLogs || []).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public addAuditLog(
    logData: Omit<FinancialAuditLog, 'id' | 'timestamp'>
  ): FinancialAuditLog {
    const newLog: FinancialAuditLog = {
      ...logData,
      id: 'audit_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    };
    this.state.auditLogs = [newLog, ...(this.state.auditLogs || [])];
    this.notify();
    return newLog;
  }
}

export const dbService = new DataService();
