package com.example.data.model

import kotlinx.serialization.Serializable

@Serializable
enum class UserRole {
    CUSTOMER,
    MERCHANT,
    COURIER,
    ADMIN
}

@Serializable
enum class OrderStatus(val arabicLabel: String) {
    PENDING("قيد الانتظار"),
    ACCEPTED("تم القبول"),
    PREPARING("قيد التحضير"),
    READY_FOR_PICKUP("جاهز للاستلام"),
    COURIER_ASSIGNED("تم تعيين عامل التوصيل"),
    PICKED_UP("تم الاستلام"),
    ON_THE_WAY("في الطريق إليك"),
    ARRIVED("وصل عامل التوصيل"),
    DELIVERED("تم التوصيل بنجاح"),
    CANCELLED("ملغي")
}

@Serializable
data class DeliveryLocation(
    val address: String,
    val latitude: Double = 36.7538,
    val longitude: Double = 3.0588,
    val wilaya: String = "الجزائر العاصمة",
    val commune: String = "سيدي امحمد"
)

@Serializable
data class User(
    val id: String,
    val email: String,
    val fullName: String,
    val phone: String,
    val role: UserRole,
    val avatarUrl: String? = null,
    val storeId: String? = null,
    val courierId: String? = null,
    val deliveryLocation: DeliveryLocation? = null
)

@Serializable
data class Category(
    val id: String,
    val name: String,
    val iconName: String,
    val displayOrder: Int
)

@Serializable
data class Product(
    val id: String,
    val storeId: String,
    val name: String,
    val description: String,
    val price: Double,
    val originalPrice: Double? = null,
    val category: String,
    val imageUrl: String,
    val isAvailable: Boolean = true,
    val stockQuantity: Int = 50,
    val tags: List<String> = emptyList()
)

@Serializable
data class Store(
    val id: String,
    val merchantId: String,
    val name: String,
    val description: String,
    val category: String,
    val logoUrl: String,
    val coverUrl: String,
    val phone: String,
    val wilaya: String,
    val commune: String,
    val address: String,
    val rating: Double = 4.8,
    val reviewCount: Int = 120,
    val deliveryTimeMin: Int = 25,
    val deliveryTimeMax: Int = 40,
    val deliveryFee: Double = 250.0,
    val minimumOrder: Double = 500.0,
    val isOpen: Boolean = true
)

@Serializable
data class OrderItem(
    val productId: String,
    val productName: String,
    val price: Double,
    val quantity: Int,
    val imageUrl: String
)

@Serializable
data class Order(
    val id: String,
    val orderNumber: String,
    val customerId: String,
    val customerName: String,
    val customerPhone: String,
    val storeId: String,
    val storeName: String,
    val storePhone: String,
    val storeAddress: String,
    val courierId: String? = null,
    val courierName: String? = null,
    val courierPhone: String? = null,
    val items: List<OrderItem>,
    val subtotal: Double,
    val deliveryFee: Double,
    val discount: Double = 0.0,
    val total: Double,
    val status: OrderStatus,
    val deliveryAddress: String,
    val deliveryOtp: String = "4819",
    val paymentMethod: String = "CASH_ON_DELIVERY", // CASH_ON_DELIVERY, CIB_EDAHABIA
    val paymentStatus: String = "PENDING",
    val createdAt: String = "اليوم، 12:30 م"
)

@Serializable
data class CustomerAddress(
    val id: String,
    val label: String,
    val address: String,
    val wilaya: String,
    val isDefault: Boolean = false
)

@Serializable
data class OrderReview(
    val id: String,
    val orderId: String,
    val customerName: String,
    val storeRating: Int,
    val comment: String,
    val createdAt: String = "مؤخراً"
)

@Serializable
data class WithdrawalRequest(
    val id: String,
    val userId: String,
    val userName: String,
    val userRole: UserRole,
    val amount: Double,
    val method: String, // CIB, EDAHABIA, BRANCH
    val accountInfo: String,
    val status: String, // PENDING, APPROVED, REJECTED
    val createdAt: String
)

@Serializable
data class Branch(
    val id: String,
    val name: String,
    val wilaya: String,
    val address: String,
    val phone: String,
    val hours: String = "08:00 - 17:00"
)

@Serializable
data class SubscriptionPlan(
    val id: String,
    val name: String,
    val tier: String,
    val price: Double,
    val billingPeriod: String,
    val features: List<String>,
    val badge: String? = null
)

@Serializable
data class UserSubscription(
    val planId: String,
    val planName: String,
    val tier: String,
    val status: String = "active",
    val validUntil: String = "2026-12-31"
)
