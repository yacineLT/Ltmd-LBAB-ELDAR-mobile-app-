package com.example.ui.screens.customer

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.data.model.*
import com.example.ui.components.StatusBadge
import com.example.ui.theme.*

@Composable
fun HomeScreen(
    stores: List<Store>,
    categories: List<Category>,
    products: List<Product>,
    favoriteStoreIds: Set<String>,
    onStoreClick: (Store) -> Unit,
    onAddToCart: (Product) -> Unit,
    onToggleFavorite: (String) -> Unit,
    onViewAllStores: () -> Unit
) {
    var selectedCategoryId by remember { mutableStateOf("cat_all") }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = 90.dp)
    ) {
        // Hero Promotion Banner
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = Color.Transparent)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(150.dp)
                        .background(
                            Brush.horizontalGradient(
                                listOf(OrangePrimary, Color(0xFFFF8C38))
                            )
                        )
                        .padding(20.dp)
                ) {
                    Column(
                        modifier = Modifier.fillMaxHeight(),
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        Surface(
                            color = Color.White.copy(alpha = 0.25f),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text(
                                text = "عرض خاص لباب الدار",
                                color = Color.White,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                        Column {
                            Text(
                                text = "توصيل فوري من أشهى مطابخ الجزائر!",
                                color = Color.White,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.ExtraBold
                            )
                            Text(
                                text = "خصم 20% على طلبك الأول باستخدام الرمز: LBAB20",
                                color = Color.White.copy(alpha = 0.9f),
                                fontSize = 12.sp
                            )
                        }
                    }
                }
            }
        }

        // Categories Horizontal Row
        item {
            Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)) {
                Text(
                    text = "التصنيفات الرئيسية",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Spacer(modifier = Modifier.height(10.dp))
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    contentPadding = PaddingValues(horizontal = 2.dp)
                ) {
                    items(categories) { cat ->
                        val isSelected = cat.id == selectedCategoryId
                        Surface(
                            onClick = { selectedCategoryId = cat.id },
                            shape = RoundedCornerShape(20.dp),
                            color = if (isSelected) OrangePrimary else MaterialTheme.colorScheme.surfaceVariant,
                            shadowElevation = if (isSelected) 2.dp else 0.dp
                        ) {
                            Text(
                                text = cat.name,
                                color = if (isSelected) Color.White else TextPrimary,
                                fontSize = 13.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                            )
                        }
                    }
                }
            }
        }

        // Featured Stores Header
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 16.dp, end = 16.dp, top = 20.dp, bottom = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "أبرز المتاجر والمطاعم",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
                TextButton(onClick = onViewAllStores) {
                    Text("عرض الكل", color = OrangePrimary, fontWeight = FontWeight.Bold)
                }
            }
        }

        // Stores Carousel
        item {
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                val filtered = if (selectedCategoryId == "cat_all") stores else stores.filter { it.category == selectedCategoryId }
                items(filtered) { store ->
                    Card(
                        onClick = { onStoreClick(store) },
                        modifier = Modifier
                            .width(260.dp)
                            .height(230.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Column {
                            Box(modifier = Modifier.height(130.dp).fillMaxWidth()) {
                                AsyncImage(
                                    model = store.coverUrl,
                                    contentDescription = store.name,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier.fillMaxSize()
                                )
                                // Favorite button
                                IconButton(
                                    onClick = { onToggleFavorite(store.id) },
                                    modifier = Modifier
                                        .align(Alignment.TopEnd)
                                        .padding(8.dp)
                                        .size(32.dp)
                                        .background(Color.White.copy(alpha = 0.85f), CircleShape)
                                ) {
                                    val isFav = favoriteStoreIds.contains(store.id)
                                    Icon(
                                        imageVector = if (isFav) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                                        contentDescription = "المفضلة",
                                        tint = if (isFav) RoseError else TextSecondary,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            }
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = store.name,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis,
                                        modifier = Modifier.weight(1f)
                                    )
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(
                                            imageVector = Icons.Default.Star,
                                            contentDescription = null,
                                            tint = AmberSecondary,
                                            modifier = Modifier.size(14.dp)
                                        )
                                        Text(
                                            text = "${store.rating}",
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = "${store.deliveryTimeMin}-${store.deliveryTimeMax} دقيقة",
                                        fontSize = 11.sp,
                                        color = TextSecondary
                                    )
                                    Text(
                                        text = "توصيل: ${store.deliveryFee.toInt()} د.ج",
                                        fontSize = 11.sp,
                                        color = OrangePrimaryDark,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // Popular Dishes Section
        item {
            Text(
                text = "الأطباق والمنتجات الأكثر طلباً",
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground,
                modifier = Modifier.padding(start = 16.dp, end = 16.dp, top = 24.dp, bottom = 12.dp)
            )
        }

        items(products) { product ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 6.dp),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
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
                        modifier = Modifier
                            .size(76.dp)
                            .clip(RoundedCornerShape(12.dp))
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = product.name,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = product.description,
                            fontSize = 11.sp,
                            color = TextSecondary,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "${product.price.toInt()} د.ج",
                            color = OrangePrimary,
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 14.sp
                        )
                    }
                    Button(
                        onClick = { onAddToCart(product) },
                        colors = ButtonDefaults.buttonColors(containerColor = OrangeLight),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = "إضافة",
                            tint = OrangePrimaryDark,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("أضف", color = OrangePrimaryDark, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
fun StoresScreen(
    stores: List<Store>,
    onStoreClick: (Store) -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }

    val filtered = stores.filter {
        it.name.contains(searchQuery, ignoreCase = true) ||
        it.description.contains(searchQuery, ignoreCase = true) ||
        it.wilaya.contains(searchQuery, ignoreCase = true)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
    ) {
        Spacer(modifier = Modifier.height(12.dp))
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("ابحث عن مطعم، متجر، أو ولاية...") },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = TextSecondary) },
            trailingIcon = {
                if (searchQuery.isNotEmpty()) {
                    IconButton(onClick = { searchQuery = "" }) {
                        Icon(Icons.Default.Clear, contentDescription = "مسح")
                    }
                }
            },
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(12.dp))

        LazyColumn(
            contentPadding = PaddingValues(bottom = 90.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(filtered) { store ->
                Card(
                    onClick = { onStoreClick(store) },
                    modifier = Modifier.fillMaxWidth(),
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
                                .size(70.dp)
                                .clip(RoundedCornerShape(12.dp))
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = store.name,
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp
                            )
                            Text(
                                text = "${store.wilaya} • ${store.commune}",
                                fontSize = 12.sp,
                                color = TextSecondary
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.Star, contentDescription = null, tint = AmberSecondary, modifier = Modifier.size(13.dp))
                                    Text("${store.rating}", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                                Text("•", color = TextMuted)
                                Text("توصيل: ${store.deliveryFee.toInt()} د.ج", fontSize = 12.sp, color = OrangePrimaryDark)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun StoreDetailScreen(
    store: Store,
    products: List<Product>,
    onAddToCart: (Product) -> Unit,
    onBack: () -> Unit
) {
    val storeProducts = products.filter { it.storeId == store.id }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = 90.dp)
    ) {
        // Cover and Back Header
        item {
            Box(modifier = Modifier.height(200.dp).fillMaxWidth()) {
                AsyncImage(
                    model = store.coverUrl,
                    contentDescription = store.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
                IconButton(
                    onClick = onBack,
                    modifier = Modifier
                        .padding(16.dp)
                        .statusBarsPadding()
                        .size(36.dp)
                        .background(Color.White.copy(alpha = 0.9f), CircleShape)
                ) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "رجوع", tint = DarkNavy)
                }
            }
        }

        // Store Details Card
        item {
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
                        text = store.name,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = store.description,
                        fontSize = 13.sp,
                        color = TextSecondary,
                        modifier = Modifier.padding(vertical = 6.dp)
                    )
                    Divider(color = BorderSubtle, modifier = Modifier.padding(vertical = 8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("التقييم", fontSize = 11.sp, color = TextMuted)
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Star, contentDescription = null, tint = AmberSecondary, modifier = Modifier.size(14.dp))
                                Text("${store.rating} (${store.reviewCount})", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("مدة التوصيل", fontSize = 11.sp, color = TextMuted)
                            Text("${store.deliveryTimeMin}-${store.deliveryTimeMax} دقيقة", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("سعر التوصيل", fontSize = 11.sp, color = TextMuted)
                            Text("${store.deliveryFee.toInt()} د.ج", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = OrangePrimary)
                        }
                    }
                }
            }
        }

        item {
            Text(
                text = "قائمة الأطباق والمنتجات",
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
            )
        }

        items(storeProducts) { product ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 6.dp),
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
                        modifier = Modifier
                            .size(72.dp)
                            .clip(RoundedCornerShape(10.dp))
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(text = product.name, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text(text = product.description, fontSize = 11.sp, color = TextSecondary, maxLines = 2)
                        Text(
                            text = "${product.price.toInt()} د.ج",
                            color = OrangePrimary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                    Button(
                        onClick = { onAddToCart(product) },
                        colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text("أضف", fontSize = 12.sp)
                    }
                }
            }
        }
    }
}

@Composable
fun CartScreen(
    cartItems: Map<Product, Int>,
    onAddToCart: (Product) -> Unit,
    onRemoveFromCart: (Product) -> Unit,
    onPlaceOrder: (address: String, paymentMethod: String) -> Unit,
    onBrowseStores: () -> Unit
) {
    var deliveryAddress by remember { mutableStateOf("نهج ديدوش مراد، الجزائر الوسطى") }
    var paymentMethod by remember { mutableStateOf("CASH_ON_DELIVERY") }
    var orderPlacedMessage by remember { mutableStateOf<String?>(null) }

    if (cartItems.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize().padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(
                    imageVector = Icons.Default.RemoveShoppingCart,
                    contentDescription = null,
                    tint = TextMuted,
                    modifier = Modifier.size(64.dp)
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = if (orderPlacedMessage != null) orderPlacedMessage!! else "سلة التسوق فارغة",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Spacer(modifier = Modifier.height(8.dp))
                Button(
                    onClick = onBrowseStores,
                    colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary)
                ) {
                    Text("تصفح المتاجر والمطاعم")
                }
            }
        }
        return
    }

    val subtotal = cartItems.entries.sumOf { it.key.price * it.value }
    val deliveryFee = 250.0
    val total = subtotal + deliveryFee

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 100.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text(
                text = "سلة المشتريات (${cartItems.values.sum()} عناصر)",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
        }

        // Cart items
        items(cartItems.entries.toList()) { (product, count) ->
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
                        Text(text = product.name, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Text(text = "${product.price.toInt()} د.ج", color = OrangePrimary, fontSize = 12.sp)
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(
                            onClick = { onRemoveFromCart(product) },
                            modifier = Modifier.size(28.dp)
                        ) {
                            Icon(Icons.Default.RemoveCircleOutline, contentDescription = "إنقاص", tint = OrangePrimary)
                        }
                        Text("$count", fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 6.dp))
                        IconButton(
                            onClick = { onAddToCart(product) },
                            modifier = Modifier.size(28.dp)
                        ) {
                            Icon(Icons.Default.AddCircle, contentDescription = "زيادة", tint = OrangePrimary)
                        }
                    }
                }
            }
        }

        // Delivery Address
        item {
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "عنوان التوصيل لباب الدار", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = deliveryAddress,
                        onValueChange = { deliveryAddress = it },
                        modifier = Modifier.fillMaxWidth(),
                        leadingIcon = { Icon(Icons.Default.LocationOn, contentDescription = null, tint = OrangePrimary) }
                    )
                }
            }
        }

        // Payment Method
        item {
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "طريقة الدفع", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { paymentMethod = "CASH_ON_DELIVERY" }
                            .padding(vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = paymentMethod == "CASH_ON_DELIVERY",
                            onClick = { paymentMethod = "CASH_ON_DELIVERY" }
                        )
                        Text("الدفع عند الاستلام نقداً (Cash on Delivery)", fontSize = 13.sp)
                    }
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { paymentMethod = "CIB_EDAHABIA" }
                            .padding(vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = paymentMethod == "CIB_EDAHABIA",
                            onClick = { paymentMethod = "CIB_EDAHABIA" }
                        )
                        Text("بطاقة الدفع الذهبية / البنكية CIB (Slick-Pay & SATIM)", fontSize = 13.sp)
                    }
                }
            }
        }

        // Bill Summary & Checkout Button
        item {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("المجموع الفرعي", color = TextSecondary, fontSize = 13.sp)
                        Text("${subtotal.toInt()} د.ج", fontWeight = FontWeight.Bold)
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("رسوم التوصيل (الجزائر)", color = TextSecondary, fontSize = 13.sp)
                        Text("${deliveryFee.toInt()} د.ج", fontWeight = FontWeight.Bold)
                    }
                    Divider(color = BorderSubtle, modifier = Modifier.padding(vertical = 10.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("المجموع الإجمالي", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text("${total.toInt()} د.ج", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, color = OrangePrimary)
                    }
                    Spacer(modifier = Modifier.height(14.dp))
                    Button(
                        onClick = {
                            onPlaceOrder(deliveryAddress, paymentMethod)
                            orderPlacedMessage = "تم تأكيد طلبك بنجاح! يمكنك تتبعه في صفحة طلباتي."
                        },
                        modifier = Modifier.fillMaxWidth().height(48.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("تأكيد وإرسال الطلب", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    }
                }
            }
        }
    }
}

@Composable
fun OrdersScreen(
    orders: List<Order>,
    onOrderClick: (Order) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
    ) {
        Spacer(modifier = Modifier.height(12.dp))
        Text(
            text = "طلباتي (${orders.size})",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(12.dp))

        LazyColumn(
            contentPadding = PaddingValues(bottom = 90.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(orders) { order ->
                Card(
                    onClick = { onOrderClick(order) },
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
                            Text(
                                text = order.orderNumber,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                            StatusBadge(status = order.status)
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = order.storeName,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 15.sp,
                            color = OrangePrimaryDark
                        )
                        Text(
                            text = "${order.items.size} منتجات • ${order.createdAt}",
                            fontSize = 12.sp,
                            color = TextSecondary
                        )
                        Divider(color = BorderSubtle, modifier = Modifier.padding(vertical = 10.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "المبلغ: ${order.total.toInt()} د.ج",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("تتبع الطلب", color = OrangePrimary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                Icon(Icons.Default.ChevronLeft, contentDescription = null, tint = OrangePrimary)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun OrderDetailScreen(
    order: Order,
    onBack: () -> Unit,
    onOpenReview: () -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 90.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Back Header
        item {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                IconButton(onClick = onBack) {
                    Icon(Icons.Default.ArrowForward, contentDescription = "رجوع")
                }
                Column {
                    Text(text = "تفاصيل الطلب", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    Text(text = order.orderNumber, fontSize = 13.sp, color = TextSecondary)
                }
            }
        }

        // Live Status Banner
        item {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "حالة الطلب الحالية:", fontWeight = FontWeight.Bold)
                        StatusBadge(status = order.status)
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = when (order.status) {
                            OrderStatus.PENDING -> "طلبك وصل للمتجر وبانتظار الموافقة والتحضير"
                            OrderStatus.PREPARING -> "يقوم المطعم الآن بتحضير الوجبات بكل حب وإتقان"
                            OrderStatus.ON_THE_WAY -> "عامل التوصيل استلم طلبك وهو في الطريق لباب دارك!"
                            OrderStatus.DELIVERED -> "تم تسليم الطلب بنجاح. بالصحة والهناء!"
                            else -> "طلبك قيد المتابعة من فريق لباب الدار"
                        },
                        fontSize = 13.sp,
                        color = TextSecondary
                    )
                }
            }
        }

        // Secret OTP for Handover
        item {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = OrangeLight)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "رمز التحقق السري للتسليم (OTP)",
                        fontWeight = FontWeight.Bold,
                        color = OrangePrimaryDark,
                        fontSize = 13.sp
                    )
                    Text(
                        text = "يرجى إعطاء هذا الرمز لعامل التوصيل عند الاستلام فقط:",
                        fontSize = 11.sp,
                        color = TextSecondary,
                        modifier = Modifier.padding(vertical = 4.dp)
                    )
                    Surface(
                        color = Color.White,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.padding(top = 8.dp)
                    ) {
                        Text(
                            text = order.deliveryOtp,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = OrangePrimary,
                            letterSpacing = 4.sp,
                            modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp)
                        )
                    }
                }
            }
        }

        // Order Items Breakdown
        item {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "المنتجات المطلوبة", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    order.items.forEach { item ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 6.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = "${item.quantity}x ${item.productName}", fontSize = 13.sp)
                            Text(text = "${(item.price * item.quantity).toInt()} د.ج", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                    }
                    Divider(color = BorderSubtle, modifier = Modifier.padding(vertical = 8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("رسوم التوصيل", fontSize = 12.sp, color = TextSecondary)
                        Text("${order.deliveryFee.toInt()} د.ج", fontSize = 12.sp)
                    }
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(top = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("المجموع الإجمالي", fontWeight = FontWeight.Bold)
                        Text("${order.total.toInt()} د.ج", fontWeight = FontWeight.Bold, color = OrangePrimary)
                    }
                }
            }
        }

        // Review Button
        if (order.status == OrderStatus.DELIVERED) {
            item {
                Button(
                    onClick = onOpenReview,
                    colors = ButtonDefaults.buttonColors(containerColor = OrangePrimary),
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.Star, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("تقييم هذا الطلب والتوصيل")
                }
            }
        }
    }
}
