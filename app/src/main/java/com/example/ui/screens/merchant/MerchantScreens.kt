package com.example.ui.screens.merchant

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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.data.model.*
import com.example.ui.components.StatusBadge
import com.example.ui.theme.*

@Composable
fun MerchantDashboardScreen(
    store: Store?,
    orders: List<Order>,
    products: List<Product>,
    merchantBalance: Double,
    withdrawals: List<WithdrawalRequest>,
    onToggleStoreOpen: () -> Unit,
    onUpdateOrderStatus: (orderId: String, newStatus: OrderStatus) -> Unit,
    onToggleProductAvailability: (productId: String) -> Unit,
    onRequestWithdrawal: (amount: Double, method: String, accountInfo: String) -> Unit
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    var showWithdrawalDialog by remember { mutableStateOf(false) }

    Column(modifier = Modifier.fillMaxSize()) {
        // Merchant Header Card
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
                            text = store?.name ?: "متجر التاجر",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "الحاج رشيد بلقاسم • تاجر معتمد",
                            fontSize = 12.sp,
                            color = TextSecondary
                        )
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = if (store?.isOpen == true) "المتجر مفتوح" else "المتجر مغلق",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (store?.isOpen == true) EmeraldSuccess else RoseError
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Switch(
                            checked = store?.isOpen ?: true,
                            onCheckedChange = { onToggleStoreOpen() },
                            colors = SwitchDefaults.colors(checkedThumbColor = OrangePrimary)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))
                // Quick stats
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
                            Text("الرصيد المتاح", fontSize = 11.sp, color = TextSecondary)
                            Text("${merchantBalance.toInt()} د.ج", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = OrangePrimaryDark)
                        }
                    }
                    Surface(
                        modifier = Modifier.weight(1f).padding(horizontal = 4.dp),
                        shape = RoundedCornerShape(10.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant
                    ) {
                        Column(modifier = Modifier.padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("طلبات المتجر", fontSize = 11.sp, color = TextSecondary)
                            Text("${orders.size}", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                    Surface(
                        modifier = Modifier.weight(1f).padding(start = 4.dp),
                        shape = RoundedCornerShape(10.dp),
                        color = EmeraldSuccessLight
                    ) {
                        Column(modifier = Modifier.padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("التقييم", fontSize = 11.sp, color = TextSecondary)
                            Text("4.9 ★", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = EmeraldSuccess)
                        }
                    }
                }
            }
        }

        // Tab Navigation
        TabRow(selectedTabIndex = selectedTab) {
            Tab(selected = selectedTab == 0, onClick = { selectedTab = 0 }, text = { Text("الطلبات الواردة") })
            Tab(selected = selectedTab == 1, onClick = { selectedTab = 1 }, text = { Text("قائمة المنتجات") })
            Tab(selected = selectedTab == 2, onClick = { selectedTab = 2 }, text = { Text("المحفظة والسحب") })
        }

        when (selectedTab) {
            0 -> MerchantOrdersTab(orders = orders, onUpdateOrderStatus = onUpdateOrderStatus)
            1 -> MerchantProductsTab(products = products, onToggleAvailability = onToggleProductAvailability)
            2 -> MerchantWalletTab(
                balance = merchantBalance,
                withdrawals = withdrawals,
                onOpenWithdrawalDialog = { showWithdrawalDialog = true }
            )
        }
    }

    if (showWithdrawalDialog) {
        MerchantWithdrawalDialog(
            balance = merchantBalance,
            onSubmit = { amount, method, info ->
                onRequestWithdrawal(amount, method, info)
                showWithdrawalDialog = false
            },
            onDismiss = { showWithdrawalDialog = false }
        )
    }
}

@Composable
private fun MerchantOrdersTab(
    orders: List<Order>,
    onUpdateOrderStatus: (orderId: String, newStatus: OrderStatus) -> Unit
) {
    if (orders.isEmpty()) {
        Box(modifier = Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
            Text("لا توجد طلبات واردة حالياً للمتجر", color = TextSecondary)
        }
    } else {
        LazyColumn(
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(orders) { order ->
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(order.orderNumber, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            StatusBadge(status = order.status)
                        }
                        Text(
                            text = "الزبون: ${order.customerName} (${order.customerPhone})",
                            fontSize = 12.sp,
                            color = TextSecondary,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                        Text(
                            text = "العنوان: ${order.deliveryAddress}",
                            fontSize = 12.sp,
                            color = TextSecondary
                        )
                        Divider(color = BorderSubtle, modifier = Modifier.padding(vertical = 8.dp))
                        order.items.forEach { item ->
                            Text(
                                text = "• ${item.quantity}x ${item.productName}",
                                fontSize = 12.sp
                            )
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "المبلغ: ${order.total.toInt()} د.ج",
                                fontWeight = FontWeight.Bold,
                                color = OrangePrimary
                            )
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                if (order.status == OrderStatus.PENDING) {
                                    Button(
                                        onClick = { onUpdateOrderStatus(order.id, OrderStatus.ACCEPTED) },
                                        colors = ButtonDefaults.buttonColors(containerColor = BlueInfo)
                                    ) {
                                        Text("قبول الطلب", fontSize = 12.sp)
                                    }
                                } else if (order.status == OrderStatus.ACCEPTED) {
                                    Button(
                                        onClick = { onUpdateOrderStatus(order.id, OrderStatus.PREPARING) },
                                        colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary)
                                    ) {
                                        Text("بدء التحضير", fontSize = 12.sp)
                                    }
                                } else if (order.status == OrderStatus.PREPARING) {
                                    Button(
                                        onClick = { onUpdateOrderStatus(order.id, OrderStatus.READY_FOR_PICKUP) },
                                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldSuccess)
                                    ) {
                                        Text("جاهز للاستلام", fontSize = 12.sp)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun MerchantProductsTab(
    products: List<Product>,
    onToggleAvailability: (productId: String) -> Unit
) {
    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        items(products) { product ->
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    AsyncImage(
                        model = product.imageUrl,
                        contentDescription = product.name,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.size(56.dp).clip(RoundedCornerShape(8.dp))
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(product.name, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Text("${product.price.toInt()} د.ج • متوفر: ${product.stockQuantity}", fontSize = 12.sp, color = TextSecondary)
                    }
                    Switch(
                        checked = product.isAvailable,
                        onCheckedChange = { onToggleAvailability(product.id) },
                        colors = SwitchDefaults.colors(checkedThumbColor = OrangePrimary)
                    )
                }
            }
        }
    }
}

@Composable
private fun MerchantWalletTab(
    balance: Double,
    withdrawals: List<WithdrawalRequest>,
    onOpenWithdrawalDialog: () -> Unit
) {
    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Balance Card
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = DarkNavy)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text("الرصيد المالي القابل للسحب", color = Color.White.copy(alpha = 0.7f), fontSize = 12.sp)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "${balance.toInt()} د.ج",
                        color = Color.White,
                        fontSize = 28.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                    Spacer(modifier = Modifier.height(14.dp))
                    Button(
                        onClick = onOpenWithdrawalDialog,
                        colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.AccountBalanceWallet, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("طلب سحب الأرباح")
                    }
                }
            }
        }

        item {
            Text("سجل طلبات السحب الأخيرة", fontWeight = FontWeight.Bold, fontSize = 15.sp)
        }

        items(withdrawals) { req ->
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
                        Text("${req.amount.toInt()} د.ج", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                        Text(req.accountInfo, fontSize = 12.sp, color = TextSecondary)
                        Text(req.createdAt, fontSize = 11.sp, color = TextMuted)
                    }
                    Surface(
                        color = if (req.status == "APPROVED") EmeraldSuccessLight else Color(0xFFFEF3C7),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = if (req.status == "APPROVED") "تمت الموافقة" else "قيد المعالجة",
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

@Composable
fun MerchantWithdrawalDialog(
    balance: Double,
    onSubmit: (amount: Double, method: String, accountInfo: String) -> Unit,
    onDismiss: () -> Unit
) {
    var amountText by remember { mutableStateOf("") }
    var method by remember { mutableStateOf("EDAHABIA") }
    var accountInfo by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("طلب سحب الأرباح", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("الرصيد المتاح: ${balance.toInt()} د.ج", fontSize = 13.sp, color = OrangePrimaryDark, fontWeight = FontWeight.Bold)
                OutlinedTextField(
                    value = amountText,
                    onValueChange = { amountText = it },
                    label = { Text("المبلغ المطلوب (د.ج)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                Text("طريقة الاستلام:", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    RadioButton(selected = method == "EDAHABIA", onClick = { method = "EDAHABIA" })
                    Text("بريدي موب / CCP", fontSize = 12.sp)
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    RadioButton(selected = method == "BRANCH", onClick = { method = "BRANCH" })
                    Text("نقداً عبر فروع المنصة", fontSize = 12.sp)
                }
                OutlinedTextField(
                    value = accountInfo,
                    onValueChange = { accountInfo = it },
                    label = { Text(if (method == "EDAHABIA") "رقم الحساب CCP والمفتاح" else "الفرع المفضل للاستلام") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val amount = amountText.toDoubleOrNull() ?: 0.0
                    if (amount > 0 && amount <= balance && accountInfo.isNotBlank()) {
                        onSubmit(amount, method, accountInfo)
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary)
            ) {
                Text("إرسال طلب السحب")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("إلغاء")
            }
        }
    )
}
