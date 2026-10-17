package com.example.ui.screens.admin

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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.*
import com.example.ui.components.StatusBadge
import com.example.ui.theme.*

@Composable
fun AdminDashboardScreen(
    orders: List<Order>,
    stores: List<Store>,
    withdrawals: List<WithdrawalRequest>,
    branches: List<Branch>,
    onApproveWithdrawal: (requestId: String) -> Unit,
    onRejectWithdrawal: (requestId: String) -> Unit,
    onUpdateOrderStatus: (orderId: String, newStatus: OrderStatus) -> Unit
) {
    var selectedTab by remember { mutableIntStateOf(0) }

    Column(modifier = Modifier.fillMaxSize()) {
        // Admin Metrics Banner
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "لوحة تحكم إدارة منصة لباب الدار",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "الإشراف الكامل على العمليات، الفروع، والرقابة المالية",
                    fontSize = 12.sp,
                    color = TextSecondary
                )
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    MetricBox(title = "إجمالي الطلبات", value = "${orders.size}", color = OrangeLight, textColor = OrangePrimaryDark)
                    MetricBox(title = "المتاجر المعتمدة", value = "${stores.size}", color = BlueInfoLight, textColor = BlueInfo)
                    MetricBox(title = "فروع السحب", value = "${branches.size}", color = EmeraldSuccessLight, textColor = EmeraldSuccess)
                }
            }
        }

        TabRow(selectedTabIndex = selectedTab) {
            Tab(selected = selectedTab == 0, onClick = { selectedTab = 0 }, text = { Text("مراقبة الطلبات") })
            Tab(selected = selectedTab == 1, onClick = { selectedTab = 1 }, text = { Text("طلبات السحب") })
            Tab(selected = selectedTab == 2, onClick = { selectedTab = 2 }, text = { Text("فروع الولايات") })
        }

        when (selectedTab) {
            0 -> AdminOrdersTab(orders = orders, onUpdateOrderStatus = onUpdateOrderStatus)
            1 -> AdminWithdrawalsTab(
                withdrawals = withdrawals,
                onApprove = onApproveWithdrawal,
                onReject = onRejectWithdrawal
            )
            2 -> AdminBranchesTab(branches = branches)
        }
    }
}

@Composable
private fun RowScope.MetricBox(title: String, value: String, color: Color, textColor: Color) {
    Surface(
        modifier = Modifier.weight(1f).padding(horizontal = 3.dp),
        shape = RoundedCornerShape(10.dp),
        color = color
    ) {
        Column(modifier = Modifier.padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text(title, fontSize = 11.sp, color = TextSecondary)
            Text(value, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = textColor)
        }
    }
}

@Composable
private fun AdminOrdersTab(
    orders: List<Order>,
    onUpdateOrderStatus: (orderId: String, newStatus: OrderStatus) -> Unit
) {
    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(orders) { order ->
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(order.orderNumber, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        StatusBadge(status = order.status)
                    }
                    Text(
                        text = "المتجر: ${order.storeName} | الزبون: ${order.customerName}",
                        fontSize = 12.sp,
                        color = TextSecondary,
                        modifier = Modifier.padding(vertical = 4.dp)
                    )
                    Text(
                        text = "الإجمالي: ${order.total.toInt()} د.ج • OTP: ${order.deliveryOtp}",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = OrangePrimaryDark
                    )
                }
            }
        }
    }
}

@Composable
private fun AdminWithdrawalsTab(
    withdrawals: List<WithdrawalRequest>,
    onApprove: (String) -> Unit,
    onReject: (String) -> Unit
) {
    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(withdrawals) { req ->
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "${req.userName} (${if (req.userRole == UserRole.MERCHANT) "تاجر" else "توصيل"})",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                        Text(
                            text = "${req.amount.toInt()} د.ج",
                            fontWeight = FontWeight.ExtraBold,
                            color = OrangePrimary
                        )
                    }
                    Text(
                        text = "طريقة السحب: ${req.accountInfo}",
                        fontSize = 12.sp,
                        color = TextSecondary,
                        modifier = Modifier.padding(vertical = 4.dp)
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "الحالة: ${if (req.status == "APPROVED") "معتمد" else "بانتظار المراجعة"}",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = if (req.status == "APPROVED") EmeraldSuccess else AmberSecondary
                        )
                        if (req.status != "APPROVED") {
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Button(
                                    onClick = { onApprove(req.id) },
                                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldSuccess),
                                    shape = RoundedCornerShape(8.dp),
                                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
                                ) {
                                    Text("موافقة واعتماد", fontSize = 11.sp)
                                }
                                OutlinedButton(
                                    onClick = { onReject(req.id) },
                                    shape = RoundedCornerShape(8.dp),
                                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
                                ) {
                                    Text("رفض", fontSize = 11.sp, color = RoseError)
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
private fun AdminBranchesTab(branches: List<Branch>) {
    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        items(branches) { br ->
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.AccountBalance,
                        contentDescription = null,
                        tint = OrangePrimary,
                        modifier = Modifier.size(36.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(br.name, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text("${br.wilaya} • ${br.address}", fontSize = 12.sp, color = TextSecondary)
                        Text("الهاتف: ${br.phone} • أوقات العمل: ${br.hours}", fontSize = 11.sp, color = TextMuted)
                    }
                }
            }
        }
    }
}
