package com.example.ui.screens.customer

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.data.model.*
import com.example.ui.theme.*

@Composable
fun FavoritesScreen(
    stores: List<Store>,
    favoriteStoreIds: Set<String>,
    onStoreClick: (Store) -> Unit,
    onToggleFavorite: (String) -> Unit
) {
    val favStores = stores.filter { favoriteStoreIds.contains(it.id) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
    ) {
        Spacer(modifier = Modifier.height(12.dp))
        Text(
            text = "المفضلة (${favStores.size})",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(12.dp))

        if (favStores.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize().padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.FavoriteBorder,
                        contentDescription = null,
                        tint = TextMuted,
                        modifier = Modifier.size(56.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "لا توجد متاجر في المفضلة حالياً",
                        color = TextSecondary,
                        fontSize = 14.sp
                    )
                }
            }
        } else {
            LazyColumn(
                contentPadding = PaddingValues(bottom = 90.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(favStores) { store ->
                    Card(
                        onClick = { onStoreClick(store) },
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            AsyncImage(
                                model = store.logoUrl,
                                contentDescription = store.name,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier
                                    .size(64.dp)
                                    .clip(RoundedCornerShape(12.dp))
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(text = store.name, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Text(text = "${store.wilaya} • ${store.commune}", fontSize = 12.sp, color = TextSecondary)
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier.padding(top = 2.dp)
                                ) {
                                    Icon(Icons.Default.Star, contentDescription = null, tint = AmberSecondary, modifier = Modifier.size(13.dp))
                                    Text("${store.rating}", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                            IconButton(onClick = { onToggleFavorite(store.id) }) {
                                Icon(Icons.Default.Favorite, contentDescription = "إزالة", tint = RoseError)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ProfileScreen(
    user: User,
    activeSubscription: UserSubscription,
    onNavigateToPlans: () -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 90.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // User Card
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(60.dp)
                            .clip(CircleShape)
                            .background(OrangeLight),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = null,
                            tint = OrangePrimary,
                            modifier = Modifier.size(36.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(16.dp))
                    Column {
                        Text(
                            text = user.fullName,
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = user.phone,
                            fontSize = 13.sp,
                            color = TextSecondary
                        )
                        Text(
                            text = user.email,
                            fontSize = 12.sp,
                            color = TextMuted
                        )
                    }
                }
            }
        }

        // Active Subscription Card
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = OrangeLight)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.WorkspacePremium, contentDescription = null, tint = OrangePrimaryDark)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = activeSubscription.planName,
                                fontWeight = FontWeight.Bold,
                                color = OrangePrimaryDark,
                                fontSize = 15.sp
                            )
                        }
                        Text(
                            text = "صالح حتى: ${activeSubscription.validUntil}",
                            fontSize = 12.sp,
                            color = TextSecondary,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                    Button(
                        onClick = onNavigateToPlans,
                        colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary)
                    ) {
                        Text("الخطط والترقية", fontSize = 12.sp)
                    }
                }
            }
        }

        // Saved Addresses
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "عناويني المحفوظة",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Home, contentDescription = null, tint = OrangePrimary)
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text("المنزل (افتراضي)", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                            Text("نهج ديدوش مراد، الجزائر الوسطى", fontSize = 12.sp, color = TextSecondary)
                        }
                    }
                    Divider(color = BorderSubtle, modifier = Modifier.padding(vertical = 8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Work, contentDescription = null, tint = BlueInfo)
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text("العمل", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                            Text("حي الأعمال، باب الزوار، الجزائر", fontSize = 12.sp, color = TextSecondary)
                        }
                    }
                }
            }
        }

        // App Info
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("عن تطبيق لباب الدار", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "المنصة الجزائرية المتكاملة لربط الزبائن والتجار وعمال التوصيل في 58 ولاية. دعم الدفع عند الاستلام وبطاقات CIB / Edahabia عبر Slick-Pay و SATIM.",
                        fontSize = 12.sp,
                        color = TextSecondary,
                        lineHeight = 18.sp
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Text("الإصدار: 1.0.0 (Android Jetpack Compose)", fontSize = 11.sp, color = TextMuted)
                }
            }
        }
    }
}

@Composable
fun SubscriptionPlansScreen(
    plans: List<SubscriptionPlan>,
    activePlanTier: String,
    onBack: () -> Unit
) {
    var upgradedMessage by remember { mutableStateOf<String?>(null) }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 90.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                IconButton(onClick = onBack) {
                    Icon(Icons.Default.ArrowForward, contentDescription = "رجوع")
                }
                Text("خطط الاشتراك المميزة", fontSize = 18.sp, fontWeight = FontWeight.Bold)
            }
        }

        if (upgradedMessage != null) {
            item {
                Surface(
                    color = EmeraldSuccessLight,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = upgradedMessage!!,
                        color = EmeraldSuccess,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(16.dp)
                    )
                }
            }
        }

        items(plans) { plan ->
            val isCurrent = plan.tier == activePlanTier
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (isCurrent) OrangeLight else MaterialTheme.colorScheme.surface
                ),
                border = if (isCurrent) androidx.compose.foundation.BorderStroke(2.dp, OrangePrimary) else null,
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(plan.name, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        if (plan.badge != null) {
                            Surface(color = OrangePrimary, shape = RoundedCornerShape(10.dp)) {
                                Text(
                                    text = plan.badge,
                                    color = Color.White,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }
                    Text(
                        text = if (plan.price == 0.0) "مجاناً" else "${plan.price.toInt()} د.ج / ${plan.billingPeriod}",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = OrangePrimary,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                    Divider(color = BorderSubtle, modifier = Modifier.padding(bottom = 8.dp))
                    plan.features.forEach { feat ->
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(vertical = 3.dp)
                        ) {
                            Icon(Icons.Default.Check, contentDescription = null, tint = EmeraldSuccess, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(text = feat, fontSize = 12.sp)
                        }
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(
                        onClick = {
                            upgradedMessage = "تم تفعيل ${plan.name} بنجاح عبر SATIM / Slick-Pay!"
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isCurrent) EmeraldSuccess else OrangePrimary
                        ),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text(if (isCurrent) "الخطة الحالية المفعّلة" else "الاشتراك بالبطاقة الذهبية / CIB")
                    }
                }
            }
        }
    }
}
