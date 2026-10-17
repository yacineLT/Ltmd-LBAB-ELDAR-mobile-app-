package com.example.data.repository

import com.example.data.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

class LbabDarRepository {

    // Initial Users
    private val customerUser = User(
        id = "user_customer_1",
        email = "client@lbabdar.dz",
        fullName = "أمين بن علي",
        phone = "0560112233",
        role = UserRole.CUSTOMER,
        avatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        deliveryLocation = DeliveryLocation(
            address = "نهج ديدوش مراد، الجزائر الوسطى",
            wilaya = "الجزائر العاصمة",
            commune = "سيدي امحمد"
        )
    )

    private val merchantUser = User(
        id = "user_merchant_1",
        email = "merchant@lbabdar.dz",
        fullName = "الحاج رشيد بلقاسم",
        phone = "0661234567",
        role = UserRole.MERCHANT,
        storeId = "store_kasbah",
        avatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    )

    private val courierUser = User(
        id = "user_courier_1",
        email = "courier@lbabdar.dz",
        fullName = "ياسين بوزيد",
        phone = "0770987654",
        role = UserRole.COURIER,
        courierId = "courier_1",
        avatarUrl = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
    )

    private val adminUser = User(
        id = "user_admin_1",
        email = "lehrauataha@gmail.com",
        fullName = "طه لحراوة (مدير المنصة)",
        phone = "0550123456",
        role = UserRole.ADMIN,
        avatarUrl = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
    )

    private val _currentUser = MutableStateFlow(customerUser)
    val currentUser: StateFlow<User> = _currentUser.asStateFlow()

    // Categories
    private val _categories = MutableStateFlow(
        listOf(
            Category("cat_all", "الكل", "Grid", 0),
            Category("cat_restaurants", "مطاعم", "UtensilsCrossed", 1),
            Category("cat_groceries", "بقالة", "ShoppingBag", 2),
            Category("cat_bakery", "مخابز", "CakeSlice", 3),
            Category("cat_sweets", "حلويات", "Sparkles", 4),
            Category("cat_fruits", "خضر وفواكه", "Apple", 5),
            Category("cat_meat", "قصابة", "Beef", 6),
            Category("cat_pharmacy", "صيدليات", "HeartPulse", 7)
        )
    )
    val categories: StateFlow<List<Category>> = _categories.asStateFlow()

    // Stores
    private val _stores = MutableStateFlow(
        listOf(
            Store(
                id = "store_kasbah",
                merchantId = "user_merchant_1",
                name = "مطعم القصبة العتيقة",
                description = "أشهى المأكولات التقليدية الجزائرية، رشتة عاصمية وشخشوخة وطواجن بلحم بلدي",
                category = "cat_restaurants",
                logoUrl = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300",
                coverUrl = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
                phone = "0661234567",
                wilaya = "الجزائر العاصمة",
                commune = "القصبة",
                address = "شارع سيدي رمضان، القصبة العليا",
                rating = 4.9,
                reviewCount = 184,
                deliveryTimeMin = 25,
                deliveryTimeMax = 40,
                deliveryFee = 250.0,
                minimumOrder = 600.0,
                isOpen = true
            ),
            Store(
                id = "store_boulangerie",
                merchantId = "user_merchant_2",
                name = "مخبزة وحلويات النخيل",
                description = "خبز تقليدي ومخبوزات فرنسية، كرواسون طازج وقلب اللوز والمقروط العاصمي",
                category = "cat_bakery",
                logoUrl = "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300",
                coverUrl = "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800",
                phone = "0551234567",
                wilaya = "الجزائر العاصمة",
                commune = "حيدرة",
                address = "شارع أحمد قارة، حيدرة",
                rating = 4.7,
                reviewCount = 96,
                deliveryTimeMin = 20,
                deliveryTimeMax = 30,
                deliveryFee = 200.0,
                minimumOrder = 400.0,
                isOpen = true
            ),
            Store(
                id = "store_market",
                merchantId = "user_merchant_3",
                name = "سوبر ماركت السلام",
                description = "جميع المواد الغذائية والمستلزمات المنزلية بأسعار الجملة وتوصيل فوري",
                category = "cat_groceries",
                logoUrl = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300",
                coverUrl = "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800",
                phone = "0771234567",
                wilaya = "الجزائر العاصمة",
                commune = "باب الزوار",
                address = "حي 8 ماي 1945، باب الزوار",
                rating = 4.6,
                reviewCount = 142,
                deliveryTimeMin = 30,
                deliveryTimeMax = 50,
                deliveryFee = 300.0,
                minimumOrder = 1000.0,
                isOpen = true
            ),
            Store(
                id = "store_bahia",
                merchantId = "user_merchant_4",
                name = "طواجن الباهية وهران",
                description = "كرنتيكا وهرانية بالكمون الساخن، وحريرة سيدي الهواري مع المحاجب الحارة",
                category = "cat_restaurants",
                logoUrl = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300",
                coverUrl = "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800",
                phone = "0770554433",
                wilaya = "وهران",
                commune = "وهران وسط",
                address = "نهج الأمير عبد القادر، وهران",
                rating = 4.8,
                reviewCount = 110,
                deliveryTimeMin = 25,
                deliveryTimeMax = 40,
                deliveryFee = 250.0,
                minimumOrder = 500.0,
                isOpen = true
            )
        )
    )
    val stores: StateFlow<List<Store>> = _stores.asStateFlow()

    // Products
    private val _products = MutableStateFlow(
        listOf(
            Product(
                id = "prod_rechta",
                storeId = "store_kasbah",
                name = "رشتة عاصمية تقليدية بلحم الدجاج",
                description = "رشتة فاخرة بمرقة بيضاء معطرة بالقرفة واللفت وحبات الحمص ولحم الدجاج الطري",
                price = 950.0,
                originalPrice = 1100.0,
                category = "cat_restaurants",
                imageUrl = "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400",
                isAvailable = true,
                stockQuantity = 20,
                tags = listOf("تقليدي", "الأكثر طلباً", "طبق رئيسي")
            ),
            Product(
                id = "prod_chakhchoukha",
                storeId = "store_kasbah",
                name = "شخشوخة بسكرية حارة بلحم الخروف",
                description = "شخشوخة الظفر بالمرق الأحمر الحار مع لحم الخروف البلدي والخضار",
                price = 1450.0,
                category = "cat_restaurants",
                imageUrl = "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=400",
                isAvailable = true,
                stockQuantity = 15,
                tags = listOf("حار", "لحم بلدي")
            ),
            Product(
                id = "prod_couscous",
                storeId = "store_kasbah",
                name = "كسكسي جزائري سبع خضار",
                description = "كسكسي ناعم بالمرق اللذيذ والخضروات الطازجة ولحم العجل",
                price = 1200.0,
                category = "cat_restaurants",
                imageUrl = "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400",
                isAvailable = true,
                stockQuantity = 25
            ),
            Product(
                id = "prod_croissant",
                storeId = "store_boulangerie",
                name = "كرواسون فرنسي بالزبدة الطبيعية",
                description = "كرواسون مقرمش وهش ومورق محضر يومياً في الفرن الحجري",
                price = 100.0,
                category = "cat_bakery",
                imageUrl = "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400",
                isAvailable = true,
                stockQuantity = 50
            ),
            Product(
                id = "prod_kalb_ellouz",
                storeId = "store_boulangerie",
                name = "قلب اللوز العاصمي بالسمن واللوز",
                description = "قلب لوز أصيل معسل ومعطر بماء الزهر وحبات اللوز المقرمشة",
                price = 120.0,
                category = "cat_bakery",
                imageUrl = "https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=400",
                isAvailable = true,
                stockQuantity = 40
            ),
            Product(
                id = "prod_oil",
                storeId = "store_market",
                name = "زيت مائدة صافي 5 لتر",
                description = "زيت نباتي مكرر ممتاز للطبخ والقلي العائلي",
                price = 650.0,
                category = "cat_groceries",
                imageUrl = "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400",
                isAvailable = true,
                stockQuantity = 30
            ),
            Product(
                id = "prod_karantika",
                storeId = "store_bahia",
                name = "كرنتيكا وهرانية ساخنة بالكمون والبيض",
                description = "طبق الكرنتيكا الوهراني الشهير ساخن ومغطى بالهريسة والكمون في خبز الباغيت",
                price = 150.0,
                category = "cat_restaurants",
                imageUrl = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
                isAvailable = true,
                stockQuantity = 45,
                tags = listOf("وهران", "وجبة سريعة")
            )
        )
    )
    val products: StateFlow<List<Product>> = _products.asStateFlow()

    // Cart
    private val _cart = MutableStateFlow<Map<Product, Int>>(emptyMap())
    val cart: StateFlow<Map<Product, Int>> = _cart.asStateFlow()

    // Orders
    private val _orders = MutableStateFlow(
        listOf(
            Order(
                id = "ord_101",
                orderNumber = "LB-2026-00101",
                customerId = "user_customer_1",
                customerName = "أمين بن علي",
                customerPhone = "0560112233",
                storeId = "store_kasbah",
                storeName = "مطعم القصبة العتيقة",
                storePhone = "0661234567",
                storeAddress = "القصبة، الجزائر العاصمة",
                courierId = "user_courier_1",
                courierName = "ياسين بوزيد",
                courierPhone = "0770987654",
                items = listOf(
                    OrderItem("prod_rechta", "رشتة عاصمية تقليدية بلحم الدجاج", 950.0, 2, "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400"),
                    OrderItem("prod_kalb_ellouz", "قلب اللوز العاصمي بالسمن واللوز", 120.0, 3, "https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=400")
                ),
                subtotal = 2260.0,
                deliveryFee = 250.0,
                total = 2510.0,
                status = OrderStatus.ON_THE_WAY,
                deliveryAddress = "نهج ديدوش مراد، الجزائر الوسطى",
                deliveryOtp = "4819",
                paymentMethod = "CASH_ON_DELIVERY",
                createdAt = "اليوم، 12:45 م"
            ),
            Order(
                id = "ord_102",
                orderNumber = "LB-2026-00102",
                customerId = "user_customer_1",
                customerName = "أمين بن علي",
                customerPhone = "0560112233",
                storeId = "store_boulangerie",
                storeName = "مخبزة وحلويات النخيل",
                storePhone = "0551234567",
                storeAddress = "حيدرة، الجزائر العاصمة",
                items = listOf(
                    OrderItem("prod_croissant", "كرواسون فرنسي بالزبدة الطبيعية", 100.0, 4, "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400")
                ),
                subtotal = 400.0,
                deliveryFee = 200.0,
                total = 600.0,
                status = OrderStatus.DELIVERED,
                deliveryAddress = "حي بن عكنون، الجزائر",
                deliveryOtp = "7291",
                paymentMethod = "CIB_EDAHABIA",
                paymentStatus = "PAID",
                createdAt = "أمس، 09:15 ص"
            )
        )
    )
    val orders: StateFlow<List<Order>> = _orders.asStateFlow()

    // Reviews
    private val _reviews = MutableStateFlow(
        listOf(
            OrderReview("rev_1", "ord_102", "أمين بن علي", 5, "الأكل وصل ساخن ولذيذ جداً، وتوصيل سريع ومحترم!")
        )
    )
    val reviews: StateFlow<List<OrderReview>> = _reviews.asStateFlow()

    // Favorites
    private val _favoriteStoreIds = MutableStateFlow(setOf("store_kasbah"))
    val favoriteStoreIds: StateFlow<Set<String>> = _favoriteStoreIds.asStateFlow()

    // Courier status
    private val _isCourierOnline = MutableStateFlow(true)
    val isCourierOnline: StateFlow<Boolean> = _isCourierOnline.asStateFlow()

    // Financial Wallet & Withdrawals
    private val _merchantBalance = MutableStateFlow(42500.0)
    val merchantBalance: StateFlow<Double> = _merchantBalance.asStateFlow()

    private val _courierBalance = MutableStateFlow(8400.0)
    val courierBalance: StateFlow<Double> = _courierBalance.asStateFlow()

    private val _courierCashCollected = MutableStateFlow(2510.0)
    val courierCashCollected: StateFlow<Double> = _courierCashCollected.asStateFlow()

    private val _withdrawals = MutableStateFlow(
        listOf(
            WithdrawalRequest(
                id = "wdr_1",
                userId = "user_merchant_1",
                userName = "الحاج رشيد بلقاسم",
                userRole = UserRole.MERCHANT,
                amount = 20000.0,
                method = "EDAHABIA",
                accountInfo = "CCP: 0012345678 مفتاح 44",
                status = "PENDING",
                createdAt = "2026-10-15 14:20"
            ),
            WithdrawalRequest(
                id = "wdr_2",
                userId = "user_courier_1",
                userName = "ياسين بوزيد",
                userRole = UserRole.COURIER,
                amount = 5000.0,
                method = "BRANCH",
                accountInfo = "استلام نقدي: فرع الجزائر الوسطى",
                status = "APPROVED",
                createdAt = "2026-10-14 10:15"
            )
        )
    )
    val withdrawals: StateFlow<List<WithdrawalRequest>> = _withdrawals.asStateFlow()

    // Branches for Cash Withdrawals
    private val _branches = MutableStateFlow(
        listOf(
            Branch("br_1", "فرع الجزائر الوسطى (ديدوش)", "الجزائر العاصمة", "نهج ديدوش مراد رقم 42", "021748899"),
            Branch("br_2", "فرع باب الزوار (حي الأعمال)", "الجزائر العاصمة", "مركز الأعمال، باب الزوار", "021245566"),
            Branch("br_3", "فرع وهران الباهية", "وهران", "ساحة أول نوفمبر، وهران وسط", "041332211"),
            Branch("br_4", "فرع قسنطينة الجسور", "قسنطينة", "شارع عبان رمضان، قسنطينة", "031887766"),
            Branch("br_5", "فرع البليدة مدينة الورود", "البليدة", "نهج العربي التبسي، البليدة", "025401122")
        )
    )
    val branches: StateFlow<List<Branch>> = _branches.asStateFlow()

    // Subscriptions
    private val _subscriptionPlans = MutableStateFlow(
        listOf(
            SubscriptionPlan("plan_free", "الخطة المجانية", "FREE", 0.0, "شهرياً", listOf("توصيل عادي", "دفع عند الاستلام", "تتبع الطلبات على الخريطة")),
            SubscriptionPlan("plan_pro", "خطة برو المميزة", "PRO", 1200.0, "شهرياً", listOf("توصيل مجاني لـ 5 طلبات", "خصم 15% على المطاعم المميزة", "دعم فني مخصص على مدار الساعة", "أولوية التوصيل في أوقات الذروة"), "الأكثر شعبية"),
            SubscriptionPlan("plan_business", "خطة الأعمال للشركات", "BUSINESS", 3500.0, "شهرياً", listOf("طلبات غير محدودة بدون رسوم توصيل", "فاتورة ضريبية رسمية للشركات", "مدير حساب خاص", "دفع موحد عبر SATIM / CIB"))
        )
    )
    val subscriptionPlans: StateFlow<List<SubscriptionPlan>> = _subscriptionPlans.asStateFlow()

    private val _activeSubscription = MutableStateFlow(
        UserSubscription("plan_pro", "خطة برو المميزة", "PRO")
    )
    val activeSubscription: StateFlow<UserSubscription> = _activeSubscription.asStateFlow()

    // Actions
    fun switchUserRole(role: UserRole) {
        _currentUser.value = when (role) {
            UserRole.CUSTOMER -> customerUser
            UserRole.MERCHANT -> merchantUser
            UserRole.COURIER -> courierUser
            UserRole.ADMIN -> adminUser
        }
    }

    fun addToCart(product: Product) {
        _cart.update { current ->
            val updated = current.toMutableMap()
            updated[product] = (updated[product] ?: 0) + 1
            updated
        }
    }

    fun removeFromCart(product: Product) {
        _cart.update { current ->
            val updated = current.toMutableMap()
            val count = updated[product] ?: 0
            if (count > 1) {
                updated[product] = count - 1
            } else {
                updated.remove(product)
            }
            updated
        }
    }

    fun clearCart() {
        _cart.value = emptyMap()
    }

    fun placeOrder(address: String, paymentMethod: String): Order? {
        val cartItems = _cart.value
        if (cartItems.isEmpty()) return null

        val subtotal = cartItems.entries.sumOf { it.key.price * it.value }
        val deliveryFee = 250.0
        val total = subtotal + deliveryFee

        val itemsList = cartItems.map {
            OrderItem(
                productId = it.key.id,
                productName = it.key.name,
                price = it.key.price,
                quantity = it.value,
                imageUrl = it.key.imageUrl
            )
        }

        val firstStoreId = cartItems.keys.first().storeId
        val store = _stores.value.find { it.id == firstStoreId } ?: _stores.value.first()

        val newOrder = Order(
            id = "ord_${System.currentTimeMillis() % 100000}",
            orderNumber = "LB-2026-${(100..999).random()}",
            customerId = _currentUser.value.id,
            customerName = _currentUser.value.fullName,
            customerPhone = _currentUser.value.phone,
            storeId = store.id,
            storeName = store.name,
            storePhone = store.phone,
            storeAddress = store.address,
            items = itemsList,
            subtotal = subtotal,
            deliveryFee = deliveryFee,
            total = total,
            status = OrderStatus.PENDING,
            deliveryAddress = address,
            deliveryOtp = (1000..9999).random().toString(),
            paymentMethod = paymentMethod,
            createdAt = "الآن"
        )

        _orders.update { listOf(newOrder) + it }
        clearCart()
        return newOrder
    }

    fun updateOrderStatus(orderId: String, newStatus: OrderStatus) {
        _orders.update { list ->
            list.map {
                if (it.id == orderId) it.copy(status = newStatus) else it
            }
        }
    }

    fun toggleStoreOpen(storeId: String) {
        _stores.update { list ->
            list.map {
                if (it.id == storeId) it.copy(isOpen = !it.isOpen) else it
            }
        }
    }

    fun toggleProductAvailability(productId: String) {
        _products.update { list ->
            list.map {
                if (it.id == productId) it.copy(isAvailable = !it.isAvailable) else it
            }
        }
    }

    fun toggleCourierOnline() {
        _isCourierOnline.update { !it }
    }

    fun toggleFavorite(storeId: String) {
        _favoriteStoreIds.update { current ->
            if (current.contains(storeId)) current - storeId else current + storeId
        }
    }

    fun requestWithdrawal(amount: Double, method: String, accountInfo: String) {
        val user = _currentUser.value
        val newReq = WithdrawalRequest(
            id = "wdr_${System.currentTimeMillis() % 100000}",
            userId = user.id,
            userName = user.fullName,
            userRole = user.role,
            amount = amount,
            method = method,
            accountInfo = accountInfo,
            status = "PENDING",
            createdAt = "اليوم"
        )
        _withdrawals.update { listOf(newReq) + it }

        if (user.role == UserRole.MERCHANT) {
            _merchantBalance.update { (it - amount).coerceAtLeast(0.0) }
        } else if (user.role == UserRole.COURIER) {
            _courierBalance.update { (it - amount).coerceAtLeast(0.0) }
        }
    }

    fun updateWithdrawalStatus(requestId: String, newStatus: String) {
        _withdrawals.update { list ->
            list.map {
                if (it.id == requestId) it.copy(status = newStatus) else it
            }
        }
    }

    fun submitReview(orderId: String, rating: Int, comment: String) {
        val review = OrderReview(
            id = "rev_${System.currentTimeMillis() % 100000}",
            orderId = orderId,
            customerName = _currentUser.value.fullName,
            storeRating = rating,
            comment = comment
        )
        _reviews.update { listOf(review) + it }
    }
}
