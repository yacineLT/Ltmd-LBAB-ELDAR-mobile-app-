package com.example.ui.screens.courier

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.*
import com.example.ui.components.DeliveryOtpDialog
import com.example.ui.components.StatusBadge
import com.example.ui.theme.*

@Composable
fun CourierDashboardScreen(
    isOnline: Boolean,
    orders: List<Order>,
    courierBalance: Double,
    cashCollected: Double,
    withdrawals: List<WithdrawalRequest>,
    onToggleOnline: () -> Unit,
    onUpdateOrderStatus: (orderId: String, newStatus: OrderStatus) -> Unit
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    var orderForOtpDialog by remember { mutableStateOf<Order?>(null) }

    Column(modifier = Modifier.fillMaxSize()) {
        // Courier Status Header Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "ياسين بوزيد (عامل التوصيل)",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "دراجة نارية • منطقة الجزائر العاصمة",
                            fontSize = 12.sp,
                            color = TextSecondary
                        )
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = if (isOnline) "متاح للتوصيل" else "غير متاح",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isOnline) EmeraldSuccess else RoseError
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Switch(
                            checked = isOnline,
                            onCheckedChange = { onToggleOnline() },
                            colors = SwitchDefaults.colors(checkedThumbColor = OrangePrimary)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Surface(
                        modifier = Modifier.weight(1f).padding(end = 4.dp),
                        shape = RoundedCornerShape(10.dp),
                        color = OrangeLight
                    ) {
                        Column(modifier = Modifier.padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("أرباح التوصيل", fontSize = 11.sp, color = TextSecondary)
                            Text("${courierBalance.toInt()} د.ج", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = OrangePrimaryDark)
                        }
                    }
                    Surface(
                        modifier = Modifier.weight(1f).padding(start = 4.dp),
                        shape = RoundedCornerShape(10.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant
                    ) {
                        Column(modifier = Modifier.padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("مبالغ نقدية محصلة", fontSize = 11.sp, color = TextSecondary)
                            Text("${cashCollected.toInt()} د.ج", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        TabRow(selectedTabIndex = selectedTab) {
            Tab(selected = selectedTab == 0, onClick = { selectedTab = 0 }, text = { Text("الطلبات النشطة") })
            Tab(selected = selectedTab == 1, onClick = { selectedTab = 1 }, text = { Text("محفظة التوصيل") })
        }

        when (selectedTab) {
            0 -> CourierActiveDeliveriesTab(
                isOnline = isOnline,
                orders = orders,
                onUpdateOrderStatus = onUpdateOrderStatus,
                onRequestOtp = { order -> orderForOtpDialog = order }
            )
            1 -> CourierWalletTab(
                balance = courierBalance,
                cashCollected = cashCollected,
                withdrawals = withdrawals
            )
        }
    }

    if (orderForOtpDialog != null) {
        DeliveryOtpDialog(
            correctOtp = orderForOtpDialog!!.deliveryOtp,
            onSuccess = {
                onUpdateOrderStatus(orderForOtpDialog!!.id, OrderStatus.DELIVERED)
                orderForOtpDialog = null
            },
            onDismiss = { orderForOtpDialog = null }
        )
    }
}

@Composable
private fun CourierActiveDeliveriesTab(
    isOnline: Boolean,
    orders: List<Order>,
    onUpdateOrderStatus: (orderId: String, newStatus: OrderStatus) -> Unit,
    onRequestOtp: (Order) -> Unit
) {
    if (!isOnline) {
        Box(modifier = Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(Icons.Default.PowerSettingsNew, contentDescription = null, tint = RoseError, modifier = Modifier.size(48.dp))
                Spacer(modifier = Modifier.height(12.dp))
                Text("أنت الآن في وضع غير متاح. فعّل الزر أعلاه لاستقبال طلبات التوصيل.", color = TextSecondary, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
            }
        }
        return
    }

    val activeDeliveries = orders.filter { it.status != OrderStatus.DELIVERED && it.status != OrderStatus.CANCELLED }

    if (activeDeliveries.isEmpty()) {
        Box(modifier = Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(Icons.Default.TwoWheeler, contentDescription = null, tint = TextMuted, modifier = Modifier.size(56.dp))
                Spacer(modifier = Modifier.height(12.dp))
                Text("لا توجد مهام توصيل نشطة حالياً. ستصلك إشعارات فور توفر طلبات جديدة.", color = TextSecondary, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
            }
        }
    } else {
        LazyColumn(
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            items(activeDeliveries) { order ->
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(order.orderNumber, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                            StatusBadge(status = order.status)
                        }
                        Spacer(modifier = Modifier.height(8.dp))

                        // Pickup Location
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Storefront, contentDescription = null, tint = OrangePrimary, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("الاستلام: ${order.storeName} (${order.storeAddress})", fontSize = 12.sp, fontWeight = FontWeight.Medium)
                        }

                        // Delivery Location
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 4.dp)) {
                            Icon(Icons.Default.LocationOn, contentDescription = null, tint = BlueInfo, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("التسليم: ${order.customerName} - ${order.deliveryAddress}", fontSize = 12.sp, fontWeight = FontWeight.Medium)
                        }

                        Divider(color = BorderSubtle, modifier = Modifier.padding(vertical = 10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text("مستحقات التوصيل: ${order.deliveryFee.toInt()} د.ج", fontWeight = FontWeight.Bold, color = OrangePrimaryDark, fontSize = 13.sp)
                                if (order.paymentMethod == "CASH_ON_DELIVERY") {
                                    Text("تحصيل نقدي: ${order.total.toInt()} د.ج", fontSize = 11.sp, color = TextSecondary)
                                }
                            }

                            // Dynamic Action Buttons
                            when (order.status) {
                                OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.READY_FOR_PICKUP -> {
                                    Button(
                                        onClick = { onUpdateOrderStatus(order.id, OrderStatus.PICKED_UP) },
                                        colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary)
                                    ) {
                                        Text("استلام الطلب من المتجر", fontSize = 12.sp)
                                    }
                                }
                                OrderStatus.PICKED_UP -> {
                                    Button(
                                        onClick = { onUpdateOrderStatus(order.id, OrderStatus.ON_THE_WAY) },
                                        colors = ButtonDefaults.buttonColors(containerColor = BlueInfo)
                                    ) {
                                        Text("الانطلاق نحو الزبون", fontSize = 12.sp)
                                    }
                                }
                                OrderStatus.ON_THE_WAY -> {
                                    Button(
                                        onClick = { onRequestOtp(order) },
                                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldSuccess)
                                    ) {
                                        Icon(Icons.Default.Pin, contentDescription = null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("إدخال رمز OTP والتسليم", fontSize = 12.sp)
                                    }
                                }
                                else -> {}
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun CourierWalletTab(
    balance: Double,
    cashCollected: Double,
    withdrawals: List<WithdrawalRequest>
) {
    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = DarkNavy)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text("صافي أرباح التوصيل المتراكمة", color = Color.White.copy(alpha = 0.7f), fontSize = 12.sp)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "${balance.toInt()} د.ج",
                        color = Color.White,
                        fontSize = 28.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "المبالغ النقدية المحصلة بانتظار التوريد: ${cashCollected.toInt()} د.ج",
                        color = AmberSecondary,
                        fontSize = 12.sp
                    )
                }
            }
        }

        item {
            Text("طلبات سحب مستحقات التوصيل", fontWeight = FontWeight.Bold, fontSize = 15.sp)
        }

        items(withdrawals.filter { it.userRole == UserRole.COURIER }) { req ->
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("${req.amount.toInt()} د.ج", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text(req.accountInfo, fontSize = 11.sp, color = TextSecondary)
                    }
                    Surface(
                        color = if (req.status == "APPROVED") EmeraldSuccessLight else Color(0xFFFEF3C7),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = if (req.status == "APPROVED") "معتمد" else "قيد المعالجة",
                            color = if (req.status == "APPROVED") EmeraldSuccess else Color(0xFFB45309),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }
            }
        }
    }
}
