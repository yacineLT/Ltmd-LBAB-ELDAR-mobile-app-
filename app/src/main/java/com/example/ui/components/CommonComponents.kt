package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.OrderStatus
import com.example.data.model.UserRole
import com.example.ui.theme.*

@Composable
fun StatusBadge(status: OrderStatus) {
    val (bgColor, textColor) = when (status) {
        OrderStatus.PENDING -> Color(0xFFFEF3C7) to Color(0xFFB45309)
        OrderStatus.ACCEPTED -> Color(0xFFE0E7FF) to Color(0xFF4338CA)
        OrderStatus.PREPARING -> Color(0xFFEDE9FE) to Color(0xFF6D28D9)
        OrderStatus.READY_FOR_PICKUP -> Color(0xFFCFFAFE) to Color(0xFF0E7490)
        OrderStatus.COURIER_ASSIGNED -> Color(0xFFDBEAFE) to Color(0xFF1D4ED8)
        OrderStatus.PICKED_UP -> Color(0xFFFCE7F3) to Color(0xFFBE185D)
        OrderStatus.ON_THE_WAY -> Color(0xFFFFFBEB) to Color(0xFFD97706)
        OrderStatus.ARRIVED -> Color(0xFFCCFBF1) to Color(0xFF0F766E)
        OrderStatus.DELIVERED -> EmeraldSuccessLight to EmeraldSuccess
        OrderStatus.CANCELLED -> RoseErrorLight to RoseError
    }

    Surface(
        color = bgColor,
        shape = RoundedCornerShape(20.dp)
    ) {
        Text(
            text = status.arabicLabel,
            color = textColor,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LbabTopAppBar(
    currentWilaya: String,
    currentRole: UserRole,
    cartItemCount: Int,
    onCartClick: () -> Unit,
    onWilayaClick: () -> Unit
) {
    Surface(
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 2.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            // App Branding & Location
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(OrangePrimary),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.DeliveryDining,
                        contentDescription = "Logo",
                        tint = Color.White,
                        modifier = Modifier.size(24.dp)
                    )
                }

                Column {
                    Text(
                        text = "لباب الدار",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Row(
                        modifier = Modifier.clickable { onWilayaClick() },
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = "Wilaya",
                            tint = TextSecondary,
                            modifier = Modifier.size(13.dp)
                        )
                        Spacer(modifier = Modifier.width(2.dp))
                        Text(
                            text = currentWilaya,
                            fontSize = 12.sp,
                            color = TextSecondary,
                            fontWeight = FontWeight.Medium
                        )
                        Icon(
                            imageVector = Icons.Default.KeyboardArrowDown,
                            contentDescription = null,
                            tint = TextSecondary,
                            modifier = Modifier.size(14.dp)
                        )
                    }
                }
            }

            // Right Actions: Role Badge and Cart
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Role Badge (Informative indicator)
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = when (currentRole) {
                        UserRole.CUSTOMER -> OrangeLight
                        UserRole.MERCHANT -> BlueInfoLight
                        UserRole.COURIER -> EmeraldSuccessLight
                        UserRole.ADMIN -> PurpleBadgeLight
                    }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            imageVector = when (currentRole) {
                                UserRole.CUSTOMER -> Icons.Default.Person
                                UserRole.MERCHANT -> Icons.Default.Storefront
                                UserRole.COURIER -> Icons.Default.TwoWheeler
                                UserRole.ADMIN -> Icons.Default.AdminPanelSettings
                            },
                            contentDescription = "Role",
                            modifier = Modifier.size(16.dp),
                            tint = when (currentRole) {
                                UserRole.CUSTOMER -> OrangePrimaryDark
                                UserRole.MERCHANT -> BlueInfo
                                UserRole.COURIER -> EmeraldSuccess
                                UserRole.ADMIN -> PurpleBadge
                            }
                        )
                        Text(
                            text = when (currentRole) {
                                UserRole.CUSTOMER -> "زبون"
                                UserRole.MERCHANT -> "تاجر"
                                UserRole.COURIER -> "توصيل"
                                UserRole.ADMIN -> "إدارة"
                            },
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = when (currentRole) {
                                UserRole.CUSTOMER -> OrangePrimaryDark
                                UserRole.MERCHANT -> BlueInfo
                                UserRole.COURIER -> EmeraldSuccess
                                UserRole.ADMIN -> PurpleBadge
                            }
                        )
                    }
                }

                // Cart Icon (Customer view)
                if (currentRole == UserRole.CUSTOMER) {
                    IconButton(onClick = onCartClick) {
                        BadgedBox(
                            badge = {
                                if (cartItemCount > 0) {
                                    Badge(
                                        containerColor = OrangePrimary,
                                        contentColor = Color.White
                                    ) {
                                        Text("$cartItemCount")
                                    }
                                }
                            }
                        ) {
                            Icon(
                                imageVector = Icons.Default.ShoppingCart,
                                contentDescription = "السلة",
                                tint = DarkNavy
                            )
                        }
                    }
                }
            }
        }
    }
}



@Composable
fun DeliveryOtpDialog(
    correctOtp: String,
    onSuccess: () -> Unit,
    onDismiss: () -> Unit
) {
    var enteredCode by remember { mutableStateOf("") }
    var isError by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "تأكيد استلام الطلب برمز OTP",
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )
        },
        text = {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "يرجى إدخال رمز التحقق السري (4 أرقام) المقدم من الزبون لإتمام عملية التوصيل واستلام المستحقات:",
                    fontSize = 13.sp,
                    color = TextSecondary,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(16.dp))
                OutlinedTextField(
                    value = enteredCode,
                    onValueChange = {
                        if (it.length <= 4) enteredCode = it
                        isError = false
                    },
                    label = { Text("رمز OTP (4 أرقام)") },
                    isError = isError,
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                if (isError) {
                    Text(
                        text = "رمز التحقق غير صحيح، يرجى مراجعة العميل والمحاولة مجددًا",
                        color = RoseError,
                        fontSize = 12.sp,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (enteredCode == correctOtp) {
                        onSuccess()
                    } else {
                        isError = true
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary)
            ) {
                Text("تأكيد التسليم بنجاح")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("إلغاء")
            }
        }
    )
}

@Composable
fun OrderReviewDialog(
    orderId: String,
    onSubmit: (rating: Int, comment: String) -> Unit,
    onDismiss: () -> Unit
) {
    var rating by remember { mutableIntStateOf(5) }
    var comment by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "تقييم الطلب وتجربة التوصيل",
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "كيف كانت تجربتك مع جودة الأكل وسرعة التوصيل لباب الدار؟",
                    fontSize = 13.sp,
                    color = TextSecondary,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    (1..5).forEach { star ->
                        IconButton(onClick = { rating = star }) {
                            Icon(
                                imageVector = if (star <= rating) Icons.Default.Star else Icons.Default.StarBorder,
                                contentDescription = "$star نجوم",
                                tint = if (star <= rating) AmberSecondary else TextMuted,
                                modifier = Modifier.size(32.dp)
                            )
                        }
                    }
                }
                Spacer(modifier = Modifier.height(12.dp))
                OutlinedTextField(
                    value = comment,
                    onValueChange = { comment = it },
                    label = { Text("أضف تعليقك (اختياري)") },
                    modifier = Modifier.fillMaxWidth(),
                    maxLines = 3
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onSubmit(rating, comment) },
                colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary)
            ) {
                Text("إرسال التقييم")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("إلغاء")
            }
        }
    )
}
