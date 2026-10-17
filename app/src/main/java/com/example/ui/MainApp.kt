package com.example.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.*
import com.example.data.repository.LbabDarRepository
import com.example.ui.components.*
import com.example.ui.screens.admin.AdminDashboardScreen
import com.example.ui.screens.courier.CourierDashboardScreen
import com.example.ui.screens.customer.*
import com.example.ui.screens.merchant.MerchantDashboardScreen
import com.example.ui.theme.OrangeLight
import com.example.ui.theme.OrangePrimary

enum class CustomerScreenTab {
    HOME,
    STORES,
    CART,
    ORDERS,
    FAVORITES,
    PROFILE,
    PLANS
}

@Composable
fun LbabDarApp(repository: LbabDarRepository = remember { LbabDarRepository() }) {
    val currentUser by repository.currentUser.collectAsState()
    val categories by repository.categories.collectAsState()
    val stores by repository.stores.collectAsState()
    val products by repository.products.collectAsState()
    val cart by repository.cart.collectAsState()
    val orders by repository.orders.collectAsState()
    val favoriteStoreIds by repository.favoriteStoreIds.collectAsState()
    val isCourierOnline by repository.isCourierOnline.collectAsState()
    val merchantBalance by repository.merchantBalance.collectAsState()
    val courierBalance by repository.courierBalance.collectAsState()
    val courierCashCollected by repository.courierCashCollected.collectAsState()
    val withdrawals by repository.withdrawals.collectAsState()
    val branches by repository.branches.collectAsState()
    val subscriptionPlans by repository.subscriptionPlans.collectAsState()
    val activeSubscription by repository.activeSubscription.collectAsState()

    var currentCustomerTab by remember { mutableStateOf(CustomerScreenTab.HOME) }
    var selectedStore by remember { mutableStateOf<Store?>(null) }
    var selectedOrder by remember { mutableStateOf<Order?>(null) }

    var currentWilaya by remember { mutableStateOf("الجزائر العاصمة") }
    var showWilayaModal by remember { mutableStateOf(false) }
    var showRoleModal by remember { mutableStateOf(false) }
    var orderToReview by remember { mutableStateOf<Order?>(null) }

    // Back handling
    BackHandler(enabled = selectedStore != null || selectedOrder != null || currentCustomerTab != CustomerScreenTab.HOME) {
        if (selectedStore != null) {
            selectedStore = null
        } else if (selectedOrder != null) {
            selectedOrder = null
        } else if (currentCustomerTab != CustomerScreenTab.HOME) {
            currentCustomerTab = CustomerScreenTab.HOME
        }
    }

    Scaffold(
        topBar = {
            LbabTopAppBar(
                currentWilaya = currentWilaya,
                currentRole = currentUser.role,
                cartItemCount = cart.values.sum(),
                onRoleSwitcherClick = { showRoleModal = true },
                onCartClick = {
                    selectedStore = null
                    selectedOrder = null
                    currentCustomerTab = CustomerScreenTab.CART
                },
                onWilayaClick = { showWilayaModal = true }
            )
        },
        bottomBar = {
            if (currentUser.role == UserRole.CUSTOMER && selectedStore == null && selectedOrder == null) {
                NavigationBar(
                    containerColor = MaterialTheme.colorScheme.surface,
                    tonalElevation = 6.dp
                ) {
                    NavigationBarItem(
                        selected = currentCustomerTab == CustomerScreenTab.HOME,
                        onClick = { currentCustomerTab = CustomerScreenTab.HOME },
                        icon = { Icon(Icons.Default.Home, contentDescription = "الرئيسية") },
                        label = { Text("الرئيسية") },
                        colors = NavigationBarItemDefaults.colors(selectedIconColor = OrangePrimary, selectedTextColor = OrangePrimary)
                    )
                    NavigationBarItem(
                        selected = currentCustomerTab == CustomerScreenTab.STORES,
                        onClick = { currentCustomerTab = CustomerScreenTab.STORES },
                        icon = { Icon(Icons.Default.Storefront, contentDescription = "المتاجر") },
                        label = { Text("المتاجر") },
                        colors = NavigationBarItemDefaults.colors(selectedIconColor = OrangePrimary, selectedTextColor = OrangePrimary)
                    )
                    NavigationBarItem(
                        selected = currentCustomerTab == CustomerScreenTab.ORDERS,
                        onClick = { currentCustomerTab = CustomerScreenTab.ORDERS },
                        icon = { Icon(Icons.Default.ReceiptLong, contentDescription = "طلباتي") },
                        label = { Text("طلباتي") },
                        colors = NavigationBarItemDefaults.colors(selectedIconColor = OrangePrimary, selectedTextColor = OrangePrimary)
                    )
                    NavigationBarItem(
                        selected = currentCustomerTab == CustomerScreenTab.FAVORITES,
                        onClick = { currentCustomerTab = CustomerScreenTab.FAVORITES },
                        icon = { Icon(Icons.Default.Favorite, contentDescription = "المفضلة") },
                        label = { Text("المفضلة") },
                        colors = NavigationBarItemDefaults.colors(selectedIconColor = OrangePrimary, selectedTextColor = OrangePrimary)
                    )
                    NavigationBarItem(
                        selected = currentCustomerTab == CustomerScreenTab.PROFILE,
                        onClick = { currentCustomerTab = CustomerScreenTab.PROFILE },
                        icon = { Icon(Icons.Default.Person, contentDescription = "حسابي") },
                        label = { Text("حسابي") },
                        colors = NavigationBarItemDefaults.colors(selectedIconColor = OrangePrimary, selectedTextColor = OrangePrimary)
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (currentUser.role) {
                UserRole.CUSTOMER -> {
                    when {
                        selectedStore != null -> {
                            StoreDetailScreen(
                                store = selectedStore!!,
                                products = products,
                                onAddToCart = { repository.addToCart(it) },
                                onBack = { selectedStore = null }
                            )
                        }
                        selectedOrder != null -> {
                            OrderDetailScreen(
                                order = selectedOrder!!,
                                onBack = { selectedOrder = null },
                                onOpenReview = { orderToReview = selectedOrder }
                            )
                        }
                        currentCustomerTab == CustomerScreenTab.HOME -> {
                            HomeScreen(
                                stores = stores,
                                categories = categories,
                                products = products,
                                favoriteStoreIds = favoriteStoreIds,
                                onStoreClick = { selectedStore = it },
                                onAddToCart = { repository.addToCart(it) },
                                onToggleFavorite = { repository.toggleFavorite(it) },
                                onViewAllStores = { currentCustomerTab = CustomerScreenTab.STORES }
                            )
                        }
                        currentCustomerTab == CustomerScreenTab.STORES -> {
                            StoresScreen(
                                stores = stores,
                                onStoreClick = { selectedStore = it }
                            )
                        }
                        currentCustomerTab == CustomerScreenTab.CART -> {
                            CartScreen(
                                cartItems = cart,
                                onAddToCart = { repository.addToCart(it) },
                                onRemoveFromCart = { repository.removeFromCart(it) },
                                onPlaceOrder = { address, paymentMethod ->
                                    val order = repository.placeOrder(address, paymentMethod)
                                    if (order != null) {
                                        selectedOrder = order
                                    }
                                },
                                onBrowseStores = { currentCustomerTab = CustomerScreenTab.STORES }
                            )
                        }
                        currentCustomerTab == CustomerScreenTab.ORDERS -> {
                            OrdersScreen(
                                orders = orders,
                                onOrderClick = { selectedOrder = it }
                            )
                        }
                        currentCustomerTab == CustomerScreenTab.FAVORITES -> {
                            FavoritesScreen(
                                stores = stores,
                                favoriteStoreIds = favoriteStoreIds,
                                onStoreClick = { selectedStore = it },
                                onToggleFavorite = { repository.toggleFavorite(it) }
                            )
                        }
                        currentCustomerTab == CustomerScreenTab.PROFILE -> {
                            ProfileScreen(
                                user = currentUser,
                                activeSubscription = activeSubscription,
                                onNavigateToPlans = { currentCustomerTab = CustomerScreenTab.PLANS }
                            )
                        }
                        currentCustomerTab == CustomerScreenTab.PLANS -> {
                            SubscriptionPlansScreen(
                                plans = subscriptionPlans,
                                activePlanTier = activeSubscription.tier,
                                onBack = { currentCustomerTab = CustomerScreenTab.PROFILE }
                            )
                        }
                    }
                }

                UserRole.MERCHANT -> {
                    val merchantStore = stores.find { it.id == currentUser.storeId } ?: stores.firstOrNull()
                    MerchantDashboardScreen(
                        store = merchantStore,
                        orders = orders.filter { it.storeId == (merchantStore?.id ?: "") },
                        products = products.filter { it.storeId == (merchantStore?.id ?: "") },
                        merchantBalance = merchantBalance,
                        withdrawals = withdrawals.filter { it.userId == currentUser.id },
                        onToggleStoreOpen = { merchantStore?.let { repository.toggleStoreOpen(it.id) } },
                        onUpdateOrderStatus = { orderId, status -> repository.updateOrderStatus(orderId, status) },
                        onToggleProductAvailability = { repository.toggleProductAvailability(it) },
                        onRequestWithdrawal = { amt, method, info -> repository.requestWithdrawal(amt, method, info) }
                    )
                }

                UserRole.COURIER -> {
                    CourierDashboardScreen(
                        isOnline = isCourierOnline,
                        orders = orders,
                        courierBalance = courierBalance,
                        cashCollected = courierCashCollected,
                        withdrawals = withdrawals,
                        onToggleOnline = { repository.toggleCourierOnline() },
                        onUpdateOrderStatus = { orderId, status -> repository.updateOrderStatus(orderId, status) }
                    )
                }

                UserRole.ADMIN -> {
                    AdminDashboardScreen(
                        orders = orders,
                        stores = stores,
                        withdrawals = withdrawals,
                        branches = branches,
                        onApproveWithdrawal = { repository.updateWithdrawalStatus(it, "APPROVED") },
                        onRejectWithdrawal = { repository.updateWithdrawalStatus(it, "REJECTED") },
                        onUpdateOrderStatus = { orderId, status -> repository.updateOrderStatus(orderId, status) }
                    )
                }
            }
        }
    }

    // Role Switcher Modal
    if (showRoleModal) {
        RoleSwitcherModal(
            currentRole = currentUser.role,
            onSelectRole = { role ->
                repository.switchUserRole(role)
                selectedStore = null
                selectedOrder = null
                currentCustomerTab = CustomerScreenTab.HOME
            },
            onDismiss = { showRoleModal = false }
        )
    }

    // Wilaya Selector Modal
    if (showWilayaModal) {
        AlertDialog(
            onDismissRequest = { showWilayaModal = false },
            title = { Text("اختر ولاية التوصيل", fontWeight = FontWeight.Bold) },
            text = {
                val wilayas = listOf(
                    "الجزائر العاصمة",
                    "وهران",
                    "قسنطينة",
                    "البليدة",
                    "عنابة",
                    "سطيف",
                    "تلمسان",
                    "باتنة"
                )
                Column {
                    wilayas.forEach { w ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    currentWilaya = w
                                    showWilayaModal = false
                                }
                                .padding(vertical = 10.dp, horizontal = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.LocationCity, contentDescription = null, tint = OrangePrimary)
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = w,
                                fontWeight = if (w == currentWilaya) FontWeight.Bold else FontWeight.Normal,
                                color = if (w == currentWilaya) OrangePrimary else MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showWilayaModal = false }) {
                    Text("إغلاق")
                }
            }
        )
    }

    // Order Review Modal
    if (orderToReview != null) {
        OrderReviewDialog(
            orderId = orderToReview!!.id,
            onSubmit = { rating, comment ->
                repository.submitReview(orderToReview!!.id, rating, comment)
                orderToReview = null
            },
            onDismiss = { orderToReview = null }
        )
    }
}
