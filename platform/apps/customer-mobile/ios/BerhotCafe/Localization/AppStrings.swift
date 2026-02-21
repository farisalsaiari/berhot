import Foundation

// MARK: - Localized Strings
/// Usage: Text(L.viewCart) or L.goodMorning
/// All strings return EN or AR based on LanguageManager.shared.currentLanguage
enum L {
    private static var lang: LanguageManager.Language { LanguageManager.shared.currentLanguage }
    private static var isAr: Bool { lang == .arabic }

    // ──────────────────────────────────────────────
    // MARK: - Common / Shared
    // ──────────────────────────────────────────────
    static var continueBtn: String       { isAr ? "متابعة" : "Continue" }
    static var cancel: String            { isAr ? "إلغاء" : "Cancel" }
    static var ok: String                { isAr ? "موافق" : "OK" }
    static var save: String              { isAr ? "حفظ" : "Save" }
    static var delete: String            { isAr ? "حذف" : "Delete" }
    static var confirm: String           { isAr ? "تأكيد" : "Confirm" }
    static var tryAgain: String          { isAr ? "حاول مرة أخرى" : "Try Again" }
    static var loading: String           { isAr ? "جاري التحميل..." : "Loading..." }
    static var somethingWentWrong: String { isAr ? "حدث خطأ ما" : "Something went wrong" }
    static var back: String              { isAr ? "رجوع" : "Back" }
    static var or: String                { isAr ? "أو" : "or" }
    static var all: String               { isAr ? "الكل" : "All" }
    static var dismiss: String           { isAr ? "إغلاق" : "Dismiss" }
    static var reset: String             { isAr ? "إعادة تعيين" : "Reset" }
    static var clear: String             { isAr ? "مسح" : "Clear" }
    static var items: String             { isAr ? "عناصر" : "items" }
    static var change: String            { isAr ? "تغيير" : "Change" }
    static var apply: String             { isAr ? "تطبيق" : "Apply" }
    static var berhot: String            { "berhot" }

    // ──────────────────────────────────────────────
    // MARK: - Auth / Phone Input
    // ──────────────────────────────────────────────
    static var berhotCafe: String        { isAr ? "برهوت كافيه" : "Berhot Cafe" }
    static var signInSubtitle: String    { isAr ? "سجل الدخول لطلب الطعام وتتبعه" : "Sign in to order and track your food" }
    static var phonePlaceholder: String  { "5XX XXX XXX" }

    // ──────────────────────────────────────────────
    // MARK: - Auth / OTP
    // ──────────────────────────────────────────────
    static var verifyYourNumber: String  { isAr ? "تحقق من رقمك" : "Verify your number" }
    static func enterOTPCode(length: Int, countryCode: String, phone: String) -> String {
        isAr
            ? "أدخل الرمز المكون من \(length) أرقام المرسل إلى\n\(countryCode) \(phone)"
            : "Enter the \(length)-digit code sent to\n\(countryCode) \(phone)"
    }
    static var verify: String            { isAr ? "تحقق" : "Verify" }
    static var changePhoneNumber: String { isAr ? "تغيير رقم الهاتف" : "Change phone number" }

    // ──────────────────────────────────────────────
    // MARK: - Auth / Register
    // ──────────────────────────────────────────────
    static var createYourAccount: String { isAr ? "أنشئ حسابك" : "Create your account" }
    static var enterNameToComplete: String { isAr ? "أدخل اسمك لإتمام التسجيل" : "Enter your name to complete registration" }
    static var firstName: String         { isAr ? "الاسم الأول" : "First name" }
    static var lastName: String          { isAr ? "اسم العائلة" : "Last name" }
    static var createAccount: String     { isAr ? "إنشاء حساب" : "Create Account" }

    // ──────────────────────────────────────────────
    // MARK: - Auth / Sign-In Sheet
    // ──────────────────────────────────────────────
    static var welcomeToBerhot: String   { isAr ? "مرحباً في برهوت" : "Welcome to Berhot" }
    static var signInToComplete: String  { isAr ? "سجل الدخول لإتمام طلبك" : "Sign in to complete your order" }
    static var phoneNumber: String       { isAr ? "رقم الهاتف" : "Phone number" }
    static var continueWithApple: String { isAr ? "المتابعة مع آبل" : "Continue with Apple" }
    static var continueWithGoogle: String { isAr ? "المتابعة مع جوجل" : "Continue with Google" }
    static var continueWithEmail: String { isAr ? "المتابعة بالبريد الإلكتروني" : "Continue with Email" }
    static var continueAsGuest: String   { isAr ? "المتابعة كضيف" : "Continue as guest" }

    // ──────────────────────────────────────────────
    // MARK: - Home / Greetings
    // ──────────────────────────────────────────────
    static var goodMorning: String       { isAr ? "صباح الخير" : "Good morning" }
    static var goodAfternoon: String     { isAr ? "مساء الخير" : "Good afternoon" }
    static var goodEvening: String       { isAr ? "مساء الخير" : "Good evening" }

    // ──────────────────────────────────────────────
    // MARK: - Home / Delivery
    // ──────────────────────────────────────────────
    static var deliverNow: String        { isAr ? "التوصيل الآن" : "Deliver now" }
    static var gettingLocation: String   { isAr ? "جاري تحديد الموقع..." : "Getting location..." }
    static var setDeliveryAddress: String { isAr ? "حدد عنوان التوصيل" : "Set delivery address" }
    static var delivery: String          { isAr ? "توصيل" : "Delivery" }
    static var pickUp: String            { isAr ? "استلام" : "Pick up" }

    // ──────────────────────────────────────────────
    // MARK: - Home / Search
    // ──────────────────────────────────────────────
    static var searchBerhotCafe: String  { isAr ? "ابحث في برهوت كافيه" : "Search Berhot Cafe" }
    static func searchStore(_ name: String) -> String {
        isAr ? "ابحث في \(name)" : "Search \(name)"
    }

    // ──────────────────────────────────────────────
    // MARK: - Home / Cart Button
    // ──────────────────────────────────────────────
    static var viewCart: String          { isAr ? "عرض السلة" : "View Cart" }
    static var freeDeliveryUnlocked: String { isAr ? "لقد حصلت على توصيل مجاني!" : "You've unlocked free delivery!" }
    static var addPrefix: String         { isAr ? "أضف " : "Add " }
    static var moreForFreeDelivery: String { isAr ? " للحصول على توصيل مجاني" : " more for free delivery" }

    // ──────────────────────────────────────────────
    // MARK: - Home / Products
    // ──────────────────────────────────────────────
    static var unavailable: String       { isAr ? "غير متوفر" : "Unavailable" }

    // ──────────────────────────────────────────────
    // MARK: - Home / Menu Sheet
    // ──────────────────────────────────────────────
    static var menu: String              { isAr ? "القائمة" : "Menu" }

    // ──────────────────────────────────────────────
    // MARK: - Home / Delivery Address Sheet
    // ──────────────────────────────────────────────
    static var deliveryAddress: String   { isAr ? "عنوان التوصيل" : "Delivery Address" }
    static var useMyCurrentLocation: String { isAr ? "استخدام موقعي الحالي" : "Use my current location" }
    static var gettingAddress: String    { isAr ? "جاري تحديد العنوان..." : "Getting address..." }
    static var searchForAddress: String  { isAr ? "ابحث عن عنوان التوصيل" : "Search for your delivery address" }
    static var searchForAnAddress: String { isAr ? "ابحث عن عنوان" : "Search for an address" }

    // ──────────────────────────────────────────────
    // MARK: - Cart
    // ──────────────────────────────────────────────
    static var cart: String              { isAr ? "السلة" : "Cart" }
    static var yourCartEmpty: String     { isAr ? "سلتك فارغة" : "Your cart is empty" }
    static var browseMenuAddItems: String { isAr ? "تصفح القائمة وأضف منتجات للبدء" : "Browse the menu and add items to get started" }
    static var subtotal: String          { isAr ? "المجموع الفرعي" : "Subtotal" }
    static var deliveryFee: String       { isAr ? "رسوم التوصيل" : "Delivery Fee" }
    static var tax15: String             { isAr ? "الضريبة (15%)" : "Tax (15%)" }
    static var total: String             { isAr ? "الإجمالي" : "Total" }
    static var proceedToPayment: String  { isAr ? "المتابعة للدفع" : "Proceed to Payment" }

    // ──────────────────────────────────────────────
    // MARK: - Payment
    // ──────────────────────────────────────────────
    static var payment: String           { isAr ? "الدفع" : "Payment" }
    static var addDeliveryAddress: String { isAr ? "إضافة عنوان التوصيل" : "Add Delivery Address" }
    static var orderSummary: String      { isAr ? "ملخص الطلب" : "Order Summary" }
    static var promoCode: String         { isAr ? "رمز الخصم" : "Promo code" }
    static var paymentMethod: String     { isAr ? "طريقة الدفع" : "Payment Method" }
    static var orderFailed: String       { isAr ? "فشل الطلب" : "Order Failed" }
    static var somethingWentWrongTryAgain: String { isAr ? "حدث خطأ ما. يرجى المحاولة مرة أخرى." : "Something went wrong. Please try again." }
    static var processing: String        { isAr ? "جاري المعالجة..." : "Processing..." }
    static func payAmount(_ amount: String) -> String {
        isAr ? "ادفع \(amount)" : "Pay \(amount)"
    }
    static func itemsCount(_ count: Int) -> String {
        isAr ? "(\(count) عناصر)" : "(\(count) items)"
    }

    // ──────────────────────────────────────────────
    // MARK: - Search View
    // ──────────────────────────────────────────────
    static var showingResultsIn: String  { isAr ? "عرض النتائج في" : "Showing results in" }
    static var pickup: String            { isAr ? "استلام" : "Pickup" }
    static var sortBy: String            { isAr ? "ترتيب حسب" : "Sort By" }
    static var relevance: String         { isAr ? "الأكثر صلة" : "Relevance" }
    static var priceLowToHigh: String    { isAr ? "السعر: من الأقل للأعلى" : "Price: Low to High" }
    static var priceHighToLow: String    { isAr ? "السعر: من الأعلى للأقل" : "Price: High to Low" }
    static var newestFirst: String       { isAr ? "الأحدث أولاً" : "Newest First" }
    static var nameAZ: String            { isAr ? "الاسم: أ → ي" : "Name: A → Z" }
    static var nameZA: String            { isAr ? "الاسم: ي → أ" : "Name: Z → A" }
    static var searchForItems: String    { isAr ? "ابحث عن منتجات" : "Search for items" }
    static var noResultsFound: String    { isAr ? "لم يتم العثور على نتائج" : "No results found" }
    static var tryAdjustingFilters: String { isAr ? "حاول تعديل الفلاتر أو البحث" : "Try adjusting your filters or search" }
    static func itemsFound(_ count: Int) -> String {
        isAr
            ? "تم العثور على \(count) عنصر"
            : "\(count) item\(count == 1 ? "" : "s") found"
    }
    static var filters: String           { isAr ? "الفلاتر" : "Filters" }
    static var applyFilters: String      { isAr ? "تطبيق الفلاتر" : "Apply Filters" }
    static var category: String          { isAr ? "القسم" : "Category" }
    static var priceRangeSAR: String     { isAr ? "نطاق السعر (ر.س)" : "Price Range (SAR)" }
    static var drinkType: String         { isAr ? "نوع المشروب" : "Drink Type" }
    static var hot: String               { isAr ? "ساخن" : "Hot" }
    static var iced: String              { isAr ? "مثلج" : "Iced" }
    static var blended: String           { isAr ? "مخلوط" : "Blended" }
    static var specialty: String         { isAr ? "مميز" : "Specialty" }
    static var dietaryPreferences: String { isAr ? "تفضيلات غذائية" : "Dietary Preferences" }
    static var dairyFree: String         { isAr ? "خالي من الألبان" : "Dairy-Free" }
    static var sugarFree: String         { isAr ? "خالي من السكر" : "Sugar-Free" }
    static var decaf: String             { isAr ? "منزوع الكافيين" : "Decaf" }
    static var vegan: String             { isAr ? "نباتي" : "Vegan" }
    static var glutenFree: String        { isAr ? "خالي من الغلوتين" : "Gluten-Free" }
    static var nutFree: String           { isAr ? "خالي من المكسرات" : "Nut-Free" }
    static var other: String             { isAr ? "أخرى" : "Other" }
    static var availableItemsOnly: String { isAr ? "المتاح فقط" : "Available items only" }
    static var withPhotosOnly: String    { isAr ? "مع صور فقط" : "With photos only" }

    // ──────────────────────────────────────────────
    // MARK: - Orders
    // ──────────────────────────────────────────────
    static var myOrders: String          { isAr ? "طلباتي" : "My Orders" }
    static var loadingOrders: String     { isAr ? "جاري تحميل الطلبات..." : "Loading orders..." }
    static var noOrdersYet: String       { isAr ? "لا توجد طلبات بعد" : "No orders yet" }
    static var orderHistoryAppear: String { isAr ? "سيظهر سجل طلباتك هنا" : "Your order history will appear here" }
    static func orderNumber(_ num: String) -> String {
        isAr ? "الطلب رقم \(num)" : "Order #\(num)"
    }
    static var orderDetails: String      { isAr ? "تفاصيل الطلب" : "Order Details" }
    static var loadingOrder: String      { isAr ? "جاري تحميل الطلب..." : "Loading order..." }
    static var itemsLabel: String        { isAr ? "العناصر" : "Items" }
    static var each: String              { isAr ? "لكل واحد" : "each" }
    static var tax: String               { isAr ? "الضريبة" : "Tax" }
    static var discount: String          { isAr ? "الخصم" : "Discount" }
    static var notes: String             { isAr ? "ملاحظات" : "Notes" }
    static var rateYourExperience: String { isAr ? "قيّم تجربتك" : "Rate Your Experience" }

    // ──────────────────────────────────────────────
    // MARK: - Order Tracking
    // ──────────────────────────────────────────────
    static var orderCancelled: String    { isAr ? "تم إلغاء الطلب" : "Order Cancelled" }
    static var pending: String           { isAr ? "قيد الانتظار" : "Pending" }
    static var accepted: String          { isAr ? "مقبول" : "Accepted" }
    static var preparing: String         { isAr ? "جاري التحضير" : "Preparing" }
    static var ready: String             { isAr ? "جاهز" : "Ready" }
    static var done: String              { isAr ? "مكتمل" : "Done" }
    static var trackingPending: String   { isAr ? "تم استلام طلبك وفي انتظار التأكيد" : "Your order has been received and is waiting for confirmation" }
    static var trackingAccepted: String  { isAr ? "تم قبول طلبك من قبل الكافيه" : "Your order has been accepted by the cafe" }
    static var trackingPreparing: String { isAr ? "يتم تحضير طلبك الآن" : "Your order is being prepared right now" }
    static var trackingReady: String     { isAr ? "طلبك جاهز للاستلام!" : "Your order is ready for pickup!" }
    static var trackingDone: String      { isAr ? "اكتمل الطلب. بالهنا والعافية!" : "Order completed. Enjoy your meal!" }

    // ──────────────────────────────────────────────
    // MARK: - Order Confirmation
    // ──────────────────────────────────────────────
    static var orderPlaced: String       { isAr ? "تم تقديم الطلب! 🎉" : "Order Placed! 🎉" }
    static var estimatedTime: String     { isAr ? "الوقت المتوقع: 15-30 دقيقة" : "Estimated: 15-30 min" }
    static var totalPaid: String         { isAr ? "المبلغ المدفوع" : "Total Paid" }
    static var paid: String              { isAr ? "مدفوع" : "Paid" }
    static var estimatedDelivery: String { isAr ? "15-30 دقيقة" : "15-30 min" }
    static var trackOrder: String        { isAr ? "تتبع الطلب" : "Track Your Order" }
    static var backToHome: String        { isAr ? "العودة للرئيسية" : "Back to Home" }

    // ──────────────────────────────────────────────
    // MARK: - Profile
    // ──────────────────────────────────────────────
    static var profile: String           { isAr ? "الملف الشخصي" : "Profile" }
    static var editProfile: String       { isAr ? "تعديل الملف الشخصي" : "Edit Profile" }
    static var orderHistory: String      { isAr ? "سجل الطلبات" : "Order History" }
    static var notifications: String     { isAr ? "الإشعارات" : "Notifications" }
    static var helpSupport: String       { isAr ? "المساعدة والدعم" : "Help & Support" }
    static var about: String             { isAr ? "حول التطبيق" : "About" }
    static var signOut: String           { isAr ? "تسجيل الخروج" : "Sign Out" }
    static var signOutConfirm: String    { isAr ? "هل أنت متأكد من تسجيل الخروج؟" : "Are you sure you want to sign out?" }
    static var appVersion: String        { isAr ? "برهوت كافيه v1.0.0" : "Berhot Cafe v1.0.0" }
    static var user: String              { isAr ? "مستخدم" : "User" }
    static var language: String          { isAr ? "اللغة" : "Language" }
    static var selectLanguage: String    { isAr ? "اختر اللغة" : "Select Language" }

    // ──────────────────────────────────────────────
    // MARK: - Edit Profile
    // ──────────────────────────────────────────────
    static var firstNameLabel: String    { isAr ? "الاسم الأول" : "First Name" }
    static var lastNameLabel: String     { isAr ? "اسم العائلة" : "Last Name" }
    static var saveChanges: String       { isAr ? "حفظ التغييرات" : "Save Changes" }

    // ──────────────────────────────────────────────
    // MARK: - More View
    // ──────────────────────────────────────────────
    static var more: String              { isAr ? "المزيد" : "More" }
    static var favorites: String         { isAr ? "المفضلة" : "Favorites" }
    static var promotions: String        { isAr ? "العروض" : "Promotions" }
    static var termsConditions: String   { isAr ? "الشروط والأحكام" : "Terms & Conditions" }
    static var privacyPolicy: String     { isAr ? "سياسة الخصوصية" : "Privacy Policy" }

    // ──────────────────────────────────────────────
    // MARK: - Location
    // ──────────────────────────────────────────────
    static var findCafesNearYou: String  { isAr ? "ابحث عن المقاهي والمتاجر\nالقريبة منك!" : "Find cafes and shops\nnear you!" }
    static var locationExplanation: String { isAr ? "بتفعيل الموقع، يمكنك البحث عن\nالمقاهي والمتاجر القريبة منك\nوالحصول على توصيل أدق." : "By allowing location access, you can search\nfor cafes and shops near you and\nreceive more accurate delivery." }
    static var shareMyLocation: String   { isAr ? "مشاركة موقعي الحالي" : "Share my current location" }
    static var enterAddressManually: String { isAr ? "إدخال العنوان يدوياً" : "Enter address manually" }
    static var whatIsYourAddress: String  { isAr ? "ما عنوانك؟" : "What's your address?" }
    static var enterYourAddress: String  { isAr ? "أدخل عنوانك" : "Enter your address" }
    static var moveMapToSetLocation: String { isAr ? "حرك الخريطة لتحديد الموقع" : "Move the map to set location" }
    static var riderWillDeliver: String  { isAr ? "سيقوم المندوب بالتوصيل إلى الموقع المحدد. يمكنك تعديل العنوان المكتوب في الصفحة التالية." : "Your rider will deliver to the pinned location. You can edit your written address on the next page." }
    static var confirmLocation: String   { isAr ? "تأكيد الموقع" : "Confirm" }

    // ──────────────────────────────────────────────
    // MARK: - Onboarding / Intro
    // ──────────────────────────────────────────────
    static var introTitle1: String       { isAr ? "توصيل سريع\nللطعام اللذيذ" : "Fast delivery\nof delicious food" }
    static var introDesc1: String        { isAr ? "اطلب الطعام في دقائق واستمتع بوجبات طازجة تصل إلى بابك." : "Order food within minutes and enjoy fresh meals delivered to your door." }
    static var introTitle2: String       { isAr ? "تتبع مباشر\nلطلبك" : "Live tracking\nof your order" }
    static var introDesc2: String        { isAr ? "اعرف بالضبط أين طلبك في الوقت الفعلي من المطبخ إلى باب منزلك." : "Know exactly where your order is in real-time from kitchen to doorstep." }
    static var introTitle3: String       { isAr ? "أفضل المطاعم\nبالقرب منك" : "Best restaurants\nnear you" }
    static var introDesc3: String        { isAr ? "اكتشف المقاهي والمطاعم الأعلى تقييماً في حيّك." : "Discover top-rated cafes and restaurants in your neighborhood." }
    static var getStarted: String        { isAr ? "ابدأ الآن" : "Get started" }

    // ──────────────────────────────────────────────
    // MARK: - Product Detail
    // ──────────────────────────────────────────────
    static var specialInstructions: String { isAr ? "تعليمات خاصة" : "Special Instructions" }
    static var anySpecialRequests: String { isAr ? "أي طلبات خاصة..." : "Any special requests..." }
    static var quantity: String          { isAr ? "الكمية" : "Quantity" }
    static var added: String             { isAr ? "تمت الإضافة!" : "Added!" }
    static func addToCartSAR(_ price: String) -> String {
        isAr ? "أضف للسلة — ر.س \(price)" : "Add to Cart — SAR \(price)"
    }
    static func addToCartPrice(_ price: String) -> String {
        isAr ? "أضف للسلة — ر.س \(price)" : "Add to Cart — SAR \(price)"
    }
    static var failedLoadOptions: String { isAr ? "فشل تحميل خيارات التخصيص. يرجى المحاولة مرة أخرى." : "Failed to load customization options. Please try again." }
    static var required: String          { isAr ? "مطلوب" : "Required" }
    static var popular: String           { isAr ? "شائع" : "Popular" }
    static var addToCart: String          { isAr ? "أضف للسلة" : "Add to Cart" }

    // ──────────────────────────────────────────────
    // MARK: - Menu View
    // ──────────────────────────────────────────────
    static var searchMenu: String        { isAr ? "ابحث في القائمة..." : "Search menu..." }
    static var loadingMenu: String       { isAr ? "جاري تحميل القائمة..." : "Loading menu..." }
    static var noItemsFound: String      { isAr ? "لم يتم العثور على عناصر" : "No items found" }
    static var menuItemsAppear: String   { isAr ? "ستظهر عناصر القائمة هنا" : "Menu items will appear here" }
    static var tryDifferentSearch: String { isAr ? "جرب بحثاً مختلفاً" : "Try a different search" }

    // ──────────────────────────────────────────────
    // MARK: - Reviews / Rate Order
    // ──────────────────────────────────────────────
    static var rateYourItems: String     { isAr ? "قيّم منتجاتك" : "Rate Your Items" }
    static var howDidEachItemTaste: String { isAr ? "كيف كان طعم كل منتج؟" : "How did each item taste?" }
    static var howDidItemsTaste: String  { isAr ? "كيف كان طعم كل منتج؟" : "How did each item taste?" }
    static var overallExperience: String { isAr ? "التجربة العامة" : "Overall Experience" }
    static var howWasOverallOrder: String { isAr ? "كيف كانت التجربة العامة؟" : "How was the overall order?" }
    static var howWasOverall: String     { isAr ? "كيف كانت التجربة العامة؟" : "How was the overall order?" }
    static var ratingPoor: String        { isAr ? "سيئ" : "Poor" }
    static var ratingFair: String        { isAr ? "مقبول" : "Fair" }
    static var ratingGood: String        { isAr ? "جيد" : "Good" }
    static var ratingVeryGood: String    { isAr ? "جيد جداً" : "Very Good" }
    static var ratingExcellent: String   { isAr ? "ممتاز!" : "Excellent!" }
    static var poor: String              { isAr ? "سيئ" : "Poor" }
    static var fair: String              { isAr ? "مقبول" : "Fair" }
    static var good: String              { isAr ? "جيد" : "Good" }
    static var veryGood: String          { isAr ? "جيد جداً" : "Very Good" }
    static var excellent: String         { isAr ? "ممتاز!" : "Excellent!" }
    static var itemRatings: String       { isAr ? "تقييمات المنتجات" : "Item Ratings" }
    static var whatStoodOut: String      { isAr ? "ما الذي لفت انتباهك؟" : "What stood out?" }
    static var pickTags: String          { isAr ? "اختر الوسوم التي تصف تجربتك" : "Pick tags that describe your experience" }
    static var pickTagsDescribe: String  { isAr ? "اختر الوسوم التي تصف تجربتك" : "Pick tags that describe your experience" }
    static var greatFood: String         { isAr ? "طعام رائع" : "Great food" }
    static var tagGreatFood: String      { isAr ? "طعام رائع" : "Great food" }
    static var fastDelivery: String      { isAr ? "توصيل سريع" : "Fast delivery" }
    static var tagFastDelivery: String   { isAr ? "توصيل سريع" : "Fast delivery" }
    static var friendlyStaff: String     { isAr ? "طاقم ودود" : "Friendly staff" }
    static var tagFriendlyStaff: String  { isAr ? "طاقم ودود" : "Friendly staff" }
    static var goodPackaging: String     { isAr ? "تغليف جيد" : "Good packaging" }
    static var tagGoodPackaging: String  { isAr ? "تغليف جيد" : "Good packaging" }
    static var freshAndHot: String       { isAr ? "طازج وساخن" : "Fresh & hot" }
    static var tagFreshHot: String       { isAr ? "طازج وساخن" : "Fresh & hot" }
    static var valueForMoney: String     { isAr ? "قيمة مقابل المال" : "Value for money" }
    static var tagValueForMoney: String  { isAr ? "قيمة مقابل المال" : "Value for money" }
    static var additionalComments: String { isAr ? "تعليقات إضافية" : "Additional Comments" }
    static var shareYourThoughts: String { isAr ? "شارك أفكارك (اختياري)" : "Share your thoughts (optional)" }
    static var thankYou: String          { isAr ? "شكراً لك!" : "Thank You!" }
    static var feedbackHelps: String     { isAr ? "ملاحظاتك تساعدنا على التحسين" : "Your feedback helps us improve" }
    static var feedbackHelpsImprove: String { isAr ? "ملاحظاتك تساعدنا على التحسين" : "Your feedback helps us improve" }
    static var continueToOverall: String { isAr ? "متابعة للتقييم العام" : "Continue to Overall Rating" }
    static var submitting: String        { isAr ? "جاري الإرسال..." : "Submitting..." }
    static var submitReview: String      { isAr ? "إرسال التقييم" : "Submit Review" }
    static var skipItemRatings: String   { isAr ? "تخطي تقييمات المنتجات" : "Skip Item Ratings" }
    static var skipAndSubmit: String     { isAr ? "تخطي وإرسال" : "Skip & Submit" }
    static var notGood: String           { isAr ? "ليس جيداً" : "Not good" }
    static var itemRatingNotGood: String { isAr ? "ليس جيداً" : "Not good" }
    static var couldBeBetter: String     { isAr ? "يمكن أن يكون أفضل" : "Could be better" }
    static var itemRatingCouldBeBetter: String { isAr ? "يمكن أن يكون أفضل" : "Could be better" }
    static var itWasOkay: String         { isAr ? "كان مقبولاً" : "It was okay" }
    static var itemRatingOkay: String    { isAr ? "كان مقبولاً" : "It was okay" }
    static var reallyLikedIt: String     { isAr ? "أعجبني حقاً!" : "Really liked it!" }
    static var itemRatingLikedIt: String { isAr ? "أعجبني حقاً!" : "Really liked it!" }
    static var absolutelyLovedIt: String { isAr ? "أحببته تماماً!" : "Absolutely loved it!" }
    static var itemRatingLovedIt: String { isAr ? "أحببته تماماً!" : "Absolutely loved it!" }

    // ──────────────────────────────────────────────
    // MARK: - Rewards
    // ──────────────────────────────────────────────
    static var rewards: String           { isAr ? "المكافآت" : "Rewards" }
    static var rewardsComingSoon: String  { isAr ? "اكسب نقاط مع كل طلب.\nقريباً!" : "Earn points with every order.\nComing soon!" }

    // ──────────────────────────────────────────────
    // MARK: - Tab Bar
    // ──────────────────────────────────────────────
    static var tabMenu: String           { isAr ? "القائمة" : "Menu" }
    static var tabRewards: String        { isAr ? "المكافآت" : "Rewards" }
    static var tabOrders: String         { isAr ? "الطلبات" : "Orders" }
    static var tabAccount: String        { isAr ? "الحساب" : "Account" }
    static var tabMore: String           { isAr ? "المزيد" : "More" }
}
