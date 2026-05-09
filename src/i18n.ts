import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { QrCode } from 'lucide-react';

const resources = {
  en: {
    translation: {
      welcome: "Welcome to Rasidi Tomyam",
      subtitle: "Traditional flavors, modern service.",
      categories: {
        all: "All",
        food: "Food",
        drink: "Drink"
      },
      cart: {
        viewOrder: "View Order",
        checkout: "Checkout",
        total: "Total",
        placeOrder: "Place Order",
        summary: "Order Summary",
        add: "Add"
      },
      customerInfo: {
        title: "Customer Information",
        desc: "Required for future communications and receipts.",
        name: "Full Name",
        email: "Email Address",
        phone: "Phone Number",
        error: "Please fill in your details for future communications."
      },
      success: {
        title: "Order Received!",
        desc: "Your order is being prepared. You can view your receipt below.",
        back: "Back to Menu",
        toast: "Order placed successfully!"
      },
      receipt: {
        title: "Receipt",
        print: "Print",
        save: "Save",
        thanks: "Thank you for dining with us!",
        paymentMethod: "Payment Method",
        orderId: "Order #",
        subtotal: "Subtotal",
        discount: "Discount",
        total: "TOTAL",
        pending: "Pending"
      },
      nav: {
        dashboard: "Dashboard",
        pos: "POS / Orders",
        inventory: "Inventory",
        expenses: "Expenses",
        customers: "Customers",
        reports: "Reports",
        employees: "Employees",
        selfOrderQrTable: "Self Order (QR Table)",
        logout: "Logout",
        loginSoon: "Login feature coming soon!",
        table: "Table {{number}}"
      },
      login: {
        title: "Rasidi Tomyam",
        subtitle: "Select your role to enter the system",
        orUse: "Or use credentials",
        email: "Email",
        password: "Password",
        signIn: "Sign In",
        roles: {
          super_admin: "Super Admin (Mom)",
          manager: "Manager",
          cashier: "Cashier",
          server: "Server"
        }
      },
      dashboard: {
        welcome: "Welcome Back, Mom",
        subtitle: "Here's what's happening at the shop today.",
        stats: {
          todaySales: "Today's Sales",
          activeOrders: "Active Orders",
          lowStock: "Low Stock Items",
          totalCustomers: "Total Customers"
        },
        recentOrders: "Recent Orders",
        inventoryAlerts: "Inventory Alerts",
        viewAll: "View All",
        manage: "Manage",
        noOrders: "No recent orders.",
        allHealthy: "All stock levels are healthy.",
        onlyLeft: "Only {{count}} left",
        restock: "Restock",
        table: "Table {{number}}"
      },
      pos: {
        title: "Orders & POS",
        subtitle: "Manage live orders and table service.",
        sync: "Sync Platforms",
        syncing: "Syncing...",
        externalOrder: "External Order",
        recordExternal: "Record External Platform Order",
        platform: "Platform",
        amount: "Total Amount ($)",
        notes: "Notes (Optional)",
        notesPlaceholder: "Order reference number...",
        record: "Record Order",
        search: "Search table, ID or customer...",
        noOrders: "No active orders found.",
        orderId: "Order ID",
        table: "Table",
        customer: "Customer",
        total: "Total",
        status: "Status",
        actions: "Actions",
        delivery: "Delivery",
        guest: "Guest",
        noPhone: "No phone",
        receipt: "Order Receipt",
        prepare: "Prepare",
        serve: "Serve",
        paid: "Paid",
        summary: "Live Summary",
        revenue: "Today's Revenue",
        completedOrders: "From {{count}} completed orders",
        syncSuccess: "Successfully synced {{count}} orders from external platforms.",
        orderUpdated: "Order #{{id}} updated to {{status}}",
        orderRecorded: "{{platform}} order recorded.",
        takeOrder: "Take Order",
        staffOrdering: "Staff Ordering",
        selectTable: "Select Table",
        orderForTable: "Order for Table {{number}}",
        confirmOrder: "Confirm Order",
        orderPlaced: "Order placed successfully",
        backToPos: "Back to POS"
      },
      inventory: {
        title: "Inventory",
        subtitle: "Track stock levels and manage supplies.",
        search: "Search items...",
        addItem: "Add Item",
        stats: {
          totalItems: "Total Items",
          lowStock: "Low Stock Alert",
          outOfStock: "Out of Stock"
        },
        table: {
          name: "Item Name",
          category: "Category",
          stock: "Current Stock",
          minLevel: "Min. Level",
          status: "Status"
        },
        units: "{{count}} units",
        status: {
          outOfStock: "Out of Stock",
          lowStock: "Low Stock",
          healthy: "Healthy"
        },
        restockPrompt: "Enter restock amount:",
        restockSuccess: "Inventory updated"
      },
      expenses: {
        title: "Expenses & Cash",
        subtitle: "Track money in/out and manage receipts.",
        search: "Search expenses...",
        record: "Record Expense",
        newExpense: "Record New Expense",
        expenseDesc: "Enter details for salaries, inventory, or utilities.",
        type: "Expense Type",
        selectType: "Select type",
        types: {
          salary: "Salary",
          inventory: "Inventory Purchase",
          utility: "Utility Bill",
          other: "Other"
        },
        amount: "Amount ($)",
        description: "Description",
        descPlaceholder: "e.g., Weekly vegetable restock",
        date: "Date",
        receiptUpload: "Receipt Upload",
        uploadClick: "Click to upload or drag & drop",
        cancel: "Cancel",
        save: "Save Expense",
        stats: {
          total: "Total Expenses (Month)",
          inventory: "Inventory Spend",
          salary: "Salary Payouts"
        },
        table: {
          date: "Date",
          type: "Type",
          description: "Description",
          amount: "Amount",
          recordedBy: "Recorded By",
          receipt: "Receipt"
        },
        noExpenses: "No expenses recorded yet.",
        fillRequired: "Please fill in all required fields.",
        saveSuccess: "Expense recorded successfully."
      },
      customers: {
        title: "Customer Directory",
        subtitle: "View customer history and contact details.",
        search: "Search customers...",
        table: {
          customer: "Customer",
          contact: "Contact",
          status: "Status",
          totalOrders: "Total Orders",
          joined: "Joined",
          history: "History"
        },
        noCustomers: "No customers found.",
        status: {
          registered: "Registered",
          guest: "Guest"
        },
        viewOrders: "View Orders",
        historyTitle: "Order History: {{name}}",
        noOrders: "No orders found for this customer.",
        orderNum: "Order #{{id}}"
      },
      reports: {
        title: "Financial Reports",
        subtitle: "Analyze sales, expenses, and profitability.",
        export: "Export PDF",
        stats: {
          revenue: "Total Revenue",
          expenses: "Total Expenses",
          profit: "Net Profit",
          orders: "Total Orders"
        },
        vsLastMonth: "vs last month",
        revenueByPlatform: "Revenue by Platform",
        recentExpenses: "Recent Expenses",
        noSales: "No sales data available yet.",
        platforms: {
          instore: "In-Store",
          pwa: "PWA",
          foodpanda: "FoodPanda",
          shopeefood: "ShopeeFood"
        }
      },
      qr: {
        title: "QR Codes",
        subtitle: "Generate and print QR codes for your tables.",
        tablePlaceholder: "Table #",
        addTable: "Add Table",
        save: "Save",
        print: "Print"
      }
    }
  },
  ms: {
    translation: {
      welcome: "Selamat Datang ke Rasidi Tomyam",
      subtitle: "Rasa tradisional, perkhidmatan moden.",
      categories: {
        all: "Semua",
        food: "Makanan",
        drink: "Minuman"
      },
      cart: {
        viewOrder: "Lihat Pesanan",
        checkout: "Pembayaran",
        total: "Jumlah",
        placeOrder: "Buat Pesanan",
        summary: "Ringkasan Pesanan",
        add: "Tambah"
      },
      customerInfo: {
        title: "Maklumat Pelanggan",
        desc: "Diperlukan untuk komunikasi masa depan dan resit.",
        name: "Nama Penuh",
        email: "Alamat Emel",
        phone: "Nombor Telefon",
        error: "Sila isi butiran anda untuk komunikasi masa depan."
      },
      success: {
        title: "Pesanan Diterima!",
        desc: "Pesanan anda sedang disediakan. Anda boleh lihat resit di bawah.",
        back: "Kembali ke Menu",
        toast: "Pesanan berjaya dibuat!"
      },
      receipt: {
        title: "Resit",
        print: "Cetak",
        save: "Simpan",
        thanks: "Terima kasih kerana menjamu selera dengan kami!",
        paymentMethod: "Kaedah Pembayaran",
        orderId: "Pesanan #",
        subtotal: "Jumlah Kecil",
        discount: "Diskaun",
        total: "JUMLAH",
        pending: "Menunggu"
      },
      nav: {
        dashboard: "Papan Pemuka",
        pos: "POS / Pesanan",
        inventory: "Inventori",
        expenses: "Perbelanjaan",
        customers: "Pelanggan",
        reports: "Laporan",
        employees: "Pekerja",
        logout: "Log Keluar",
        selfOrderQrTable: "Pesanan Sendiri (QR Meja)",
        loginSoon: "Ciri log masuk akan datang tidak lama lagi!",
        table: "Meja {{number}}"
      },
      login: {
        title: "Rasidi Tomyam",
        subtitle: "Pilih peranan anda untuk memasuki sistem",
        orUse: "Atau gunakan kelayakan",
        email: "Emel",
        password: "Kata Laluan",
        signIn: "Log Masuk",
        roles: {
          super_admin: "Super Admin (Mak)",
          manager: "Pengurus",
          cashier: "Juruwang",
          server: "Pelayan"
        }
      },
      dashboard: {
        welcome: "Selamat Kembali, Mak",
        subtitle: "Inilah yang berlaku di kedai hari ini.",
        stats: {
          todaySales: "Jualan Hari Ini",
          activeOrders: "Pesanan Aktif",
          lowStock: "Item Stok Rendah",
          totalCustomers: "Jumlah Pelanggan"
        },
        recentOrders: "Pesanan Terkini",
        inventoryAlerts: "Amaran Inventori",
        viewAll: "Lihat Semua",
        manage: "Urus",
        noOrders: "Tiada pesanan terkini.",
        allHealthy: "Semua tahap stok adalah sihat.",
        onlyLeft: "Hanya tinggal {{count}}",
        restock: "Tambah Stok",
        table: "Meja {{number}}"
      },
      pos: {
        title: "Pesanan & POS",
        subtitle: "Urus pesanan langsung dan perkhidmatan meja.",
        sync: "Selaraskan Platform",
        syncing: "Menyegerak...",
        externalOrder: "Pesanan Luaran",
        recordExternal: "Rekod Pesanan Platform Luaran",
        platform: "Platform",
        amount: "Jumlah Amaun ($)",
        notes: "Nota (Pilihan)",
        notesPlaceholder: "Nombor rujukan pesanan...",
        record: "Rekod Pesanan",
        search: "Cari meja, ID atau pelanggan...",
        noOrders: "Tiada pesanan aktif ditemui.",
        orderId: "ID Pesanan",
        table: "Meja",
        customer: "Pelanggan",
        total: "Jumlah",
        status: "Status",
        actions: "Tindakan",
        delivery: "Penghantaran",
        guest: "Tetamu",
        noPhone: "Tiada telefon",
        receipt: "Resit Pesanan",
        prepare: "Sediakan",
        serve: "Hidang",
        paid: "Dibayar",
        summary: "Ringkasan Langsung",
        revenue: "Hasil Hari Ini",
        completedOrders: "Daripada {{count}} pesanan selesai",
        syncSuccess: "Berjaya menyegerak {{count}} pesanan daripada platform luaran.",
        orderUpdated: "Pesanan #{{id}} dikemas kini kepada {{status}}",
        orderRecorded: "Pesanan {{platform}} direkodkan.",
        takeOrder: "Ambil Pesanan",
        staffOrdering: "Pesanan Kakitangan",
        selectTable: "Pilih Meja",
        orderForTable: "Pesanan untuk Meja {{number}}",
        confirmOrder: "Sahkan Pesanan",
        orderPlaced: "Pesanan berjaya dibuat",
        backToPos: "Kembali ke POS"
      },
      inventory: {
        title: "Inventori",
        subtitle: "Jejaki tahap stok dan urus bekalan.",
        search: "Cari item...",
        addItem: "Tambah Item",
        stats: {
          totalItems: "Jumlah Item",
          lowStock: "Amaran Stok Rendah",
          outOfStock: "Kehabisan Stok"
        },
        table: {
          name: "Nama Item",
          category: "Kategori",
          stock: "Stok Semasa",
          minLevel: "Tahap Min.",
          status: "Status"
        },
        units: "{{count}} unit",
        status: {
          outOfStock: "Kehabisan Stok",
          lowStock: "Stok Rendah",
          healthy: "Sihat"
        },
        restockPrompt: "Masukkan jumlah tambah stok:",
        restockSuccess: "Inventori dikemas kini"
      },
      expenses: {
        title: "Perbelanjaan & Tunai",
        subtitle: "Jejaki wang masuk/keluar dan urus resit.",
        search: "Cari perbelanjaan...",
        record: "Rekod Perbelanjaan",
        newExpense: "Rekod Perbelanjaan Baru",
        expenseDesc: "Masukkan butiran untuk gaji, inventori, atau utiliti.",
        type: "Jenis Perbelanjaan",
        selectType: "Pilih jenis",
        types: {
          salary: "Gaji",
          inventory: "Pembelian Inventori",
          utility: "Bil Utiliti",
          other: "Lain-lain"
        },
        amount: "Amaun ($)",
        description: "Penerangan",
        descPlaceholder: "cth., Tambah stok sayur mingguan",
        date: "Tarikh",
        receiptUpload: "Muat Naik Resit",
        uploadClick: "Klik untuk muat naik atau seret & lepas",
        cancel: "Batal",
        save: "Simpan Perbelanjaan",
        stats: {
          total: "Jumlah Perbelanjaan (Bulan)",
          inventory: "Perbelanjaan Inventori",
          salary: "Pembayaran Gaji"
        },
        table: {
          date: "Tarikh",
          type: "Jenis",
          description: "Penerangan",
          amount: "Amaun",
          recordedBy: "Direkod Oleh",
          receipt: "Resit"
        },
        noExpenses: "Tiada perbelanjaan direkodkan lagi.",
        fillRequired: "Sila isi semua medan yang diperlukan.",
        saveSuccess: "Perbelanjaan berjaya direkodkan."
      },
      customers: {
        title: "Direktori Pelanggan",
        subtitle: "Lihat sejarah pelanggan dan butiran hubungan.",
        search: "Cari pelanggan...",
        table: {
          customer: "Pelanggan",
          contact: "Hubungan",
          status: "Status",
          totalOrders: "Jumlah Pesanan",
          joined: "Sertai",
          history: "Sejarah"
        },
        noCustomers: "Tiada pelanggan ditemui.",
        status: {
          registered: "Berdaftar",
          guest: "Tetamu"
        },
        viewOrders: "Lihat Pesanan",
        historyTitle: "Sejarah Pesanan: {{name}}",
        noOrders: "Tiada pesanan ditemui untuk pelanggan ini.",
        orderNum: "Pesanan #{{id}}"
      },
      reports: {
        title: "Laporan Kewangan",
        subtitle: "Analisis jualan, perbelanjaan, dan keuntungan.",
        export: "Eksport PDF",
        stats: {
          revenue: "Jumlah Hasil",
          expenses: "Jumlah Perbelanjaan",
          profit: "Untung Bersih",
          orders: "Jumlah Pesanan"
        },
        vsLastMonth: "berbanding bulan lepas",
        revenueByPlatform: "Hasil mengikut Platform",
        recentExpenses: "Perbelanjaan Terkini",
        noSales: "Tiada data jualan tersedia lagi.",
        platforms: {
          instore: "Dalam Kedai",
          pwa: "PWA",
          foodpanda: "FoodPanda",
          shopeefood: "ShopeeFood"
        }
      },
      qr: {
        title: "Kod QR",
        subtitle: "Hasilkan dan cetak kod QR untuk meja anda.",
        tablePlaceholder: "Meja #",
        addTable: "Tambah Meja",
        save: "Simpan",
        print: "Cetak"
      }
    }
  },
  th: {
    translation: {
      welcome: "ยินดีต้อนรับสู่ Rasidi Tomyam",
      subtitle: "รสชาติดั้งเดิม บริการทันสมัย",
      categories: {
        all: "ทั้งหมด",
        food: "อาหาร",
        drink: "เครื่องดื่ม"
      },
      cart: {
        viewOrder: "ดูรายการสั่งซื้อ",
        checkout: "ชำระเงิน",
        total: "รวม",
        placeOrder: "สั่งอาหาร",
        summary: "สรุปรายการสั่งซื้อ",
        add: "เพิ่ม"
      },
      customerInfo: {
        title: "ข้อมูลลูกค้า",
        desc: "จำเป็นสำหรับการติดต่อและใบเสร็จในอนาคต",
        name: "ชื่อ-นามสกุล",
        email: "อีเมล",
        phone: "เบอร์โทรศัพท์",
        error: "กรุณากรอกข้อมูลของคุณเพื่อการติดต่อในอนาคต"
      },
      success: {
        title: "รับออเดอร์แล้ว!",
        desc: "กำลังเตรียมอาหารของคุณ คุณสามารถดูใบเสร็จได้ที่ด้านล่าง",
        back: "กลับไปที่เมนู",
        toast: "สั่งอาหารสำเร็จแล้ว!"
      },
      receipt: {
        title: "ใบเสร็จ",
        print: "พิมพ์",
        save: "บันทึก",
        thanks: "ขอบคุณที่ใช้บริการ!",
        paymentMethod: "วิธีการชำระเงิน",
        orderId: "ออเดอร์ #",
        subtotal: "ยอดรวมย่อย",
        discount: "ส่วนลด",
        total: "ยอดรวมทั้งหมด",
        pending: "รอดำเนินการ"
      },
      nav: {
        dashboard: "แดชบอร์ด",
        pos: "POS / ออเดอร์",
        inventory: "คลังสินค้า",
        expenses: "ค่าใช้จ่าย",
        customers: "ลูกค้า",
        reports: "รายงาน",
        employees: "พนักงาน",
        selfOrderQrTable: "สั่งอาหารด้วยคิวอาร์โค้ด",
        logout: "ออกจากระบบ",
        loginSoon: "ฟีเจอร์เข้าสู่ระบบกำลังจะมาเร็วๆ นี้!",
        table: "โต๊ะ {{number}}"
      },
      login: {
        title: "Rasidi Tomyam",
        subtitle: "เลือกบทบาทของคุณเพื่อเข้าสู่ระบบ",
        orUse: "หรือใช้ข้อมูลประจำตัว",
        email: "อีเมล",
        password: "รหัสผ่าน",
        signIn: "เข้าสู่ระบบ",
        roles: {
          super_admin: "ผู้ดูแลระบบสูงสุด (คุณแม่)",
          manager: "ผู้จัดการ",
          cashier: "พนักงานแคชเชียร์",
          server: "พนักงานเสิร์ฟ"
        }
      },
      dashboard: {
        welcome: "ยินดีต้อนรับกลับ คุณแม่",
        subtitle: "นี่คือสิ่งที่เกิดขึ้นที่ร้านในวันนี้",
        stats: {
          todaySales: "ยอดขายวันนี้",
          activeOrders: "ออเดอร์ที่กำลังดำเนินการ",
          lowStock: "สินค้าสต็อกต่ำ",
          totalCustomers: "ลูกค้าทั้งหมด"
        },
        recentOrders: "ออเดอร์ล่าสุด",
        inventoryAlerts: "การแจ้งเตือนคลังสินค้า",
        viewAll: "ดูทั้งหมด",
        manage: "จัดการ",
        noOrders: "ไม่มีออเดอร์ล่าสุด",
        allHealthy: "ระดับสต็อกทั้งหมดปกติ",
        onlyLeft: "เหลือเพียง {{count}} ชิ้น",
        restock: "เติมสต็อก",
        table: "โต๊ะ {{number}}"
      },
      pos: {
        title: "ออเดอร์ & POS",
        subtitle: "จัดการออเดอร์สดและบริการที่โต๊ะ",
        sync: "ซิงค์แพลตฟอร์ม",
        syncing: "กำลังซิงค์...",
        externalOrder: "ออเดอร์ภายนอก",
        recordExternal: "บันทึกออเดอร์แพลตฟอร์มภายนอก",
        platform: "แพลตฟอร์ม",
        amount: "จำนวนเงินรวม ($)",
        notes: "หมายเหตุ (ไม่บังคับ)",
        notesPlaceholder: "หมายเลขอ้างอิงออเดอร์...",
        record: "บันทึกออเดอร์",
        search: "ค้นหาโต๊ะ, ID หรือลูกค้า...",
        noOrders: "ไม่พบออเดอร์ที่กำลังดำเนินการ",
        orderId: "รหัสออเดอร์",
        table: "โต๊ะ",
        customer: "ลูกค้า",
        total: "รวม",
        status: "สถานะ",
        actions: "การดำเนินการ",
        delivery: "เดลิเวอรี่",
        guest: "ลูกค้าทั่วไป",
        noPhone: "ไม่มีเบอร์โทรศัพท์",
        receipt: "ใบเสร็จออเดอร์",
        prepare: "เตรียมอาหาร",
        serve: "เสิร์ฟ",
        paid: "ชำระเงินแล้ว",
        summary: "สรุปสด",
        revenue: "รายได้วันนี้",
        completedOrders: "จาก {{count}} ออเดอร์ที่เสร็จสมบูรณ์",
        syncSuccess: "ซิงค์ออเดอร์ {{count}} รายการจากแพลตฟอร์มภายนอกสำเร็จ",
        orderUpdated: "ออเดอร์ #{{id}} อัปเดตเป็น {{status}}",
        orderRecorded: "บันทึกออเดอร์ {{platform}} แล้ว",
        takeOrder: "รับออเดอร์",
        staffOrdering: "การสั่งซื้อโดยพนักงาน",
        selectTable: "เลือกโต๊ะ",
        orderForTable: "ออเดอร์สำหรับโต๊ะ {{number}}",
        confirmOrder: "ยืนยันออเดอร์",
        orderPlaced: "สั่งซื้อสำเร็จแล้ว",
        backToPos: "กลับไปที่ POS"
      },
      inventory: {
        title: "คลังสินค้า",
        subtitle: "ติดตามระดับสต็อกและจัดการวัสดุอุปกรณ์",
        search: "ค้นหาสินค้า...",
        addItem: "เพิ่มสินค้า",
        stats: {
          totalItems: "สินค้าทั้งหมด",
          lowStock: "แจ้งเตือนสต็อกต่ำ",
          outOfStock: "สินค้าหมด"
        },
        table: {
          name: "ชื่อสินค้า",
          category: "หมวดหมู่",
          stock: "สต็อกปัจจุบัน",
          minLevel: "ระดับขั้นต่ำ",
          status: "สถานะ"
        },
        units: "{{count}} ชิ้น",
        status: {
          outOfStock: "สินค้าหมด",
          lowStock: "สต็อกต่ำ",
          healthy: "ปกติ"
        },
        restockPrompt: "ป้อนจำนวนการเติมสต็อก:",
        restockSuccess: "อัปเดตคลังสินค้าแล้ว"
      },
      expenses: {
        title: "ค่าใช้จ่าย & เงินสด",
        subtitle: "ติดตามเงินเข้า/ออกและจัดการใบเสร็จ",
        search: "ค้นหาค่าใช้จ่าย...",
        record: "บันทึกค่าใช้จ่าย",
        newExpense: "บันทึกค่าใช้จ่ายใหม่",
        expenseDesc: "ป้อนรายละเอียดสำหรับเงินเดือน คลังสินค้า หรือสาธารณูปโภค",
        type: "ประเภทค่าใช้จ่าย",
        selectType: "เลือกประเภท",
        types: {
          salary: "เงินเดือน",
          inventory: "ซื้อสินค้าเข้าคลัง",
          utility: "ค่าน้ำค่าไฟ",
          other: "อื่นๆ"
        },
        amount: "จำนวนเงิน ($)",
        description: "คำอธิบาย",
        descPlaceholder: "เช่น เติมสต็อกผักประจำสัปดาห์",
        date: "วันที่",
        receiptUpload: "อัปโหลดใบเสร็จ",
        uploadClick: "คลิกเพื่ออัปโหลดหรือลากและวาง",
        cancel: "ยกเลิก",
        save: "บันทึกค่าใช้จ่าย",
        stats: {
          total: "ค่าใช้จ่ายทั้งหมด (เดือน)",
          inventory: "การใช้จ่ายคลังสินค้า",
          salary: "การจ่ายเงินเดือน"
        },
        table: {
          date: "วันที่",
          type: "ประเภท",
          description: "คำอธิบาย",
          amount: "จำนวนเงิน",
          recordedBy: "บันทึกโดย",
          receipt: "ใบเสร็จ"
        },
        noExpenses: "ยังไม่มีการบันทึกค่าใช้จ่าย",
        fillRequired: "กรุณากรอกข้อมูลที่จำเป็นทั้งหมด",
        saveSuccess: "บันทึกค่าใช้จ่ายสำเร็จ"
      },
      customers: {
        title: "รายชื่อลูกค้า",
        subtitle: "ดูประวัติลูกค้าและรายละเอียดการติดต่อ",
        search: "ค้นหาลูกค้า...",
        table: {
          customer: "ลูกค้า",
          contact: "การติดต่อ",
          status: "สถานะ",
          totalOrders: "ออเดอร์ทั้งหมด",
          joined: "เข้าร่วมเมื่อ",
          history: "ประวัติ"
        },
        noCustomers: "ไม่พบลูกค้า",
        status: {
          registered: "ลงทะเบียนแล้ว",
          guest: "ลูกค้าทั่วไป"
        },
        viewOrders: "ดูออเดอร์",
        historyTitle: "ประวัติออเดอร์: {{name}}",
        noOrders: "ไม่พบออเดอร์สำหรับลูกค้ารายนี้",
        orderNum: "ออเดอร์ #{{id}}"
      },
      reports: {
        title: "รายงานทางการเงิน",
        subtitle: "วิเคราะห์ยอดขาย ค่าใช้จ่าย และกำไร",
        export: "ส่งออก PDF",
        stats: {
          revenue: "รายได้ทั้งหมด",
          expenses: "ค่าใช้จ่ายทั้งหมด",
          profit: "กำไรสุทธิ",
          orders: "ออเดอร์ทั้งหมด"
        },
        vsLastMonth: "เทียบกับเดือนที่แล้ว",
        revenueByPlatform: "รายได้ตามแพลตฟอร์ม",
        recentExpenses: "ค่าใช้จ่ายล่าสุด",
        noSales: "ยังไม่มีข้อมูลการขาย",
        platforms: {
          instore: "หน้าร้าน",
          pwa: "PWA",
          foodpanda: "FoodPanda",
          shopeefood: "ShopeeFood"
        }
      },
      qr: {
        title: "รหัส QR",
        subtitle: "สร้างและพิมพ์รหัส QR สำหรับโต๊ะของคุณ",
        tablePlaceholder: "โต๊ะ #",
        addTable: "เพิ่มโต๊ะ",
        save: "บันทึก",
        print: "พิมพ์"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
