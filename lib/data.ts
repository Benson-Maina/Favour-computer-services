import type { AdminActivity, BlogPost, Category, InventoryAlert, Order, Payment, PaymentLog, Product, Booking, Service } from "@/lib/types";

export const business = {
  name: "Favour Computer Services",
  location: "F&F Building, Next to Odeon Cinema, Shop U13, Nairobi, Kenya",
  phone: "0726548592",
  whatsapp: "254726548592",
  email: "bensonmurage254@gmail.com",
  paybill: "247247",
  account: "FAVOUR-U13",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://favourcomputerservices.co.ke"
};

export const categories: Category[] = [
  {
    name: "Laptops",
    slug: "laptops",
    description: "Business, student, creative, and gaming laptops from trusted brands.",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80",
    subcategories: ["HP", "Dell", "Lenovo", "Acer", "Asus", "Apple"]
  },
  {
    name: "Desktops",
    slug: "desktops",
    description: "Office PCs, gaming rigs, and workstations configured for performance.",
    image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=1200&q=80",
    subcategories: ["Gaming PCs", "Office PCs", "Workstations"]
  },
  {
    name: "Phones",
    slug: "phones",
    description: "Original smartphones with warranty and reliable after-sales support.",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
    subcategories: ["Samsung", "Apple", "Xiaomi", "Oppo", "Tecno", "Infinix"]
  },
  {
    name: "Storage",
    slug: "storage",
    description: "Fast SSDs, hard drives, flash drives, and memory cards.",
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=1200&q=80",
    subcategories: ["SSD", "HDD", "Flash Drives", "Memory Cards"]
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Keyboards, mouse, monitors, chargers, routers, and headsets.",
    image: "https://images.unsplash.com/photo-1629429407756-9d5b5c143c3d?auto=format&fit=crop&w=1200&q=80",
    subcategories: ["Keyboards", "Mouse", "Monitors", "Chargers", "Routers", "Headsets"]
  },
  {
    name: "CCTV",
    slug: "cctv",
    description: "Cameras, DVRs, NVRs, and complete security kits with installation.",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80",
    subcategories: ["Cameras", "DVR", "NVR", "Complete Kits"]
  }
];

export const products: Product[] = [
  {
    id: "p-001",
    sku: "HP-EB840G8",
    slug: "hp-elitebook-840-g8-core-i7",
    name: "HP EliteBook 840 G8 Core i7",
    brand: "HP",
    category: "Laptops",
    subcategory: "HP",
    price: 78500,
    compareAtPrice: 86000,
    salePrice: 75900,
    rating: 4.8,
    reviewCount: 37,
    stock: 8,
    lowStockThreshold: 5,
    supplierName: "HP Official Distributor",
    supplierContact: "0700 123 456",
    badge: "Business Pick",
    images: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=80"],
    description: "A premium business laptop with strong security, excellent keyboard, fast SSD storage, and all-day portability.",
    specs: { Processor: "Intel Core i7 11th Gen", RAM: "16GB DDR4", Storage: "512GB NVMe SSD", Display: "14-inch FHD", Warranty: "6 months shop warranty" },
    featured: true,
    bestSelling: true,
    newArrival: true,
    inventoryHistory: [
      { id: "h-001", date: "2026-06-09", change: 5, reason: "Stock received", actor: "Admin" },
      { id: "h-002", date: "2026-06-17", change: -2, reason: "Online order shipped", actor: "Admin" }
    ],
    createdAt: "2026-05-10"
  },
  {
    id: "p-002",
    sku: "DE-5420I5",
    slug: "dell-latitude-5420-core-i5",
    name: "Dell Latitude 5420 Core i5",
    brand: "Dell",
    category: "Laptops",
    subcategory: "Dell",
    price: 62500,
    rating: 4.7,
    reviewCount: 28,
    stock: 12,
    lowStockThreshold: 6,
    supplierName: "Dell Kenya",
    supplierContact: "0711 234 567",
    images: ["https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1200&q=80"],
    description: "Reliable productivity laptop for office work, school projects, online meetings, and travel.",
    specs: { Processor: "Intel Core i5 11th Gen", RAM: "8GB DDR4", Storage: "256GB SSD", Display: "14-inch FHD", Ports: "USB-C, HDMI, RJ45" },
    featured: true,
    newArrival: true,
    inventoryHistory: [
      { id: "h-003", date: "2026-06-02", change: 10, reason: "Stock received", actor: "Admin" }
    ],
    createdAt: "2026-05-18"
  },
  {
    id: "p-003",
    sku: "LN-THC5PC",
    slug: "lenovo-thinkcentre-office-pc-i5",
    name: "Lenovo ThinkCentre Office PC",
    brand: "Lenovo",
    category: "Desktops",
    subcategory: "Office PCs",
    price: 39500,
    rating: 4.6,
    reviewCount: 19,
    stock: 10,
    lowStockThreshold: 4,
    supplierName: "Lenovo Distribution",
    supplierContact: "0722 987 654",
    badge: "Office Ready",
    images: ["https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=1200&q=80"],
    description: "Compact desktop bundle tuned for accounting, cyber services, reception desks, and office productivity.",
    specs: { Processor: "Intel Core i5", RAM: "8GB", Storage: "256GB SSD", Included: "CPU, monitor, keyboard, mouse", OS: "Windows 11 Pro" },
    bestSelling: true,
    inventoryHistory: [
      { id: "h-004", date: "2026-05-27", change: 5, reason: "Stock audit adjustment", actor: "Admin" }
    ],
    createdAt: "2026-04-26"
  },
  {
    id: "p-004",
    sku: "SM-A35-256GB",
    slug: "samsung-galaxy-a35-5g-256gb",
    name: "Samsung Galaxy A35 5G 256GB",
    brand: "Samsung",
    category: "Phones",
    subcategory: "Samsung",
    price: 43500,
    compareAtPrice: 46500,
    salePrice: 42900,
    rating: 4.7,
    reviewCount: 45,
    stock: 15,
    lowStockThreshold: 8,
    supplierName: "Samsung Nairobi",
    supplierContact: "0733 112 233",
    images: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1200&q=80"],
    description: "Fast 5G smartphone with sharp display, excellent battery life, and dependable camera performance.",
    specs: { Storage: "256GB", RAM: "8GB", Network: "5G", Battery: "5000mAh", Warranty: "1 year manufacturer warranty" },
    featured: true,
    bestSelling: true,
    inventoryHistory: [
      { id: "h-005", date: "2026-06-05", change: 8, reason: "Supplier restock", actor: "Admin" }
    ],
    createdAt: "2026-06-01"
  },
  {
    id: "p-005",
    sku: "KS-NV2-1TB",
    slug: "kingston-nv2-1tb-nvme-ssd",
    name: "Kingston NV2 1TB NVMe SSD",
    brand: "Kingston",
    category: "Storage",
    subcategory: "SSD",
    price: 9800,
    rating: 4.9,
    reviewCount: 54,
    stock: 30,
    lowStockThreshold: 10,
    supplierName: "Kingston Kenya",
    supplierContact: "0709 445 667",
    badge: "Fast Upgrade",
    images: ["https://images.unsplash.com/photo-1628557118391-56cd62c9f2cb?auto=format&fit=crop&w=1200&q=80"],
    description: "High-speed NVMe drive for laptop upgrades, gaming PCs, editing workstations, and faster boot times.",
    specs: { Capacity: "1TB", Interface: "PCIe NVMe", Form: "M.2 2280", Use: "Laptop and desktop upgrades", Installation: "Available in shop" },
    featured: true,
    bestSelling: true,
    inventoryHistory: [
      { id: "h-006", date: "2026-06-15", change: 15, reason: "Bulk stock arrival", actor: "Admin" }
    ],
    createdAt: "2026-05-30"
  },
  {
    id: "p-006",
    sku: "HK-4CCTV-KIT",
    slug: "hikvision-4-camera-cctv-kit",
    name: "Hikvision 4 Camera CCTV Kit",
    brand: "Hikvision",
    category: "CCTV",
    subcategory: "Complete Kits",
    price: 32500,
    rating: 4.8,
    reviewCount: 31,
    stock: 7,
    lowStockThreshold: 5,
    supplierName: "Hikvision Kenya",
    supplierContact: "0710 332 210",
    images: ["https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80"],
    description: "Complete CCTV kit for homes, shops, and offices with installation consultation available.",
    specs: { Cameras: "4 indoor/outdoor cameras", Recorder: "4-channel DVR", Storage: "1TB surveillance HDD optional", Remote: "Mobile viewing setup", Installation: "Quoted after site visit" },
    featured: true,
    inventoryHistory: [
      { id: "h-007", date: "2026-06-12", change: 4, reason: "Low stock replenishment", actor: "Admin" }
    ],
    createdAt: "2026-06-08"
  },
  {
    id: "p-007",
    sku: "LG-MK270",
    slug: "logitech-mk270-wireless-keyboard-mouse",
    name: "Logitech MK270 Wireless Combo",
    brand: "Logitech",
    category: "Accessories",
    subcategory: "Keyboards",
    price: 4200,
    rating: 4.6,
    reviewCount: 67,
    stock: 24,
    lowStockThreshold: 10,
    supplierName: "Logitech Kenya",
    supplierContact: "0738 556 778",
    images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80"],
    description: "Durable wireless keyboard and mouse combo for office desks and home workstations.",
    specs: { Connectivity: "2.4GHz wireless", Battery: "Long-life batteries", Layout: "Full-size keyboard", Compatibility: "Windows, Linux, ChromeOS" },
    bestSelling: true,
    inventoryHistory: [
      { id: "h-008", date: "2026-04-18", change: 20, reason: "Initial stock", actor: "Admin" }
    ],
    createdAt: "2026-04-12"
  },
  {
    id: "p-008",
    sku: "TP-ARCHER-C6",
    slug: "tp-link-archer-c6-gigabit-router",
    name: "TP-Link Archer C6 Gigabit Router",
    brand: "TP-Link",
    category: "Accessories",
    subcategory: "Routers",
    price: 6900,
    rating: 4.7,
    reviewCount: 41,
    stock: 18,
    lowStockThreshold: 8,
    supplierName: "TP-Link Kenya",
    supplierContact: "0703 221 110",
    images: ["https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80"],
    description: "Stable dual-band router for homes, shops, and small offices with setup support available.",
    specs: { WiFi: "AC1200 dual-band", Ports: "Gigabit Ethernet", Antennas: "4 external antennas", Setup: "Configuration support available" },
    createdAt: "2026-06-12"
  }
];

export const searchSuggestions = [
  { term: "laptops", count: 96 },
  { term: "ssd", count: 82 },
  { term: "cctv installation", count: 65 },
  { term: "samsung phone", count: 54 },
  { term: "computer repairs", count: 42 }
];

export const recentSearches = [
  "hp elitebook",
  "nvme ssd",
  "hikvision kit",
  "dell latitude",
  "router setup"
];

export const trendingProducts = [
  "Samsung Galaxy A35 5G 256GB",
  "Kingston NV2 1TB NVMe SSD",
  "Hikvision 4 Camera CCTV Kit",
  "Dell Latitude 5420 Core i5"
];

export const inventoryAlerts: InventoryAlert[] = products.filter((product) => product.stock <= product.lowStockThreshold).map((product) => ({
  id: `alert-${product.id}`,
  title: `${product.name} low stock`,
  description: `${product.stock} units remaining, reorder from ${product.supplierName}.`, 
  productId: product.id,
  severity: product.stock <= Math.max(2, Math.floor(product.lowStockThreshold / 2)) ? "critical" : "low",
  type: "inventory"
}));

export const orders: Order[] = [
  {
    id: "o-001",
    customerName: "Alice Mwangi",
    customerEmail: "alice@example.com",
    customerPhone: "0721 555 888",
    deliveryMethod: "delivery",
    shippingAddress: "Westlands, Nairobi",
    notes: "Call before delivery",
    paymentReference: "PAY12345",
    paymentScreenshotUrl: "https://images.unsplash.com/photo-1580894908361-80be060f41a6?auto=format&fit=crop&w=1200&q=80",
    itemsSnapshot: [{ productId: "p-001", name: "HP EliteBook 840 G8 Core i7", quantity: 1, unitPrice: 78500 }],
    status: "payment_submitted",
    statusNotes: ["Payment screenshot uploaded"],
    total: 78500,
    createdAt: "2026-06-18"
  },
  {
    id: "o-002",
    customerName: "Joseph Njoroge",
    customerEmail: "joseph@example.com",
    customerPhone: "0722 999 123",
    deliveryMethod: "pickup",
    shippingAddress: "Shop U13, F&F Building",
    notes: "Pickup after 2pm",
    paymentReference: "PAY67890",
    paymentScreenshotUrl: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80",
    itemsSnapshot: [{ productId: "p-005", name: "Kingston NV2 1TB NVMe SSD", quantity: 2, unitPrice: 9800 }],
    status: "payment_verified",
    statusNotes: ["Payment verified by admin"],
    total: 19600,
    createdAt: "2026-06-17"
  }
];

export const payments: Payment[] = [
  {
    id: "pay-001",
    orderId: "o-001",
    amount: 78500,
    paybillNumber: "247247",
    accountNumber: "FAVOUR-U13",
    transactionCode: "PAY12345",
    confirmationUrl: "https://images.unsplash.com/photo-1580894908361-80be060f41a6?auto=format&fit=crop&w=1200&q=80",
    verified: false,
    rejected: false,
    createdAt: "2026-06-18"
  },
  {
    id: "pay-002",
    orderId: "o-002",
    amount: 19600,
    paybillNumber: "247247",
    accountNumber: "FAVOUR-U13",
    transactionCode: "PAY67890",
    confirmationUrl: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80",
    verified: true,
    rejected: false,
    verifiedBy: "admin",
    verifiedAt: "2026-06-17T12:30:00Z",
    createdAt: "2026-06-17"
  }
];

export const paymentLogs: PaymentLog[] = [
  {
    id: "plog-001",
    paymentId: "pay-001",
    orderId: "o-001",
    action: "submitted",
    note: "Customer uploaded Paybill screenshot for admin review.",
    actor: "Customer",
    createdAt: "2026-06-18T09:24:00Z"
  },
  {
    id: "plog-002",
    paymentId: "pay-002",
    orderId: "o-002",
    action: "verified",
    note: "Transaction amount and reference matched order total.",
    actor: "Admin",
    createdAt: "2026-06-17T12:30:00Z"
  }
];

export const bookingsSample: Booking[] = [
  {
    id: "b-001",
    service: "CCTV Installation",
    name: "Mercy Otieno",
    email: "mercy@example.com",
    phone: "0727 111 222",
    preferredDate: "2026-06-25",
    message: "Install four cameras for my boutique in Lavington.",
    status: "scheduled",
    createdAt: "2026-06-16"
  },
  {
    id: "b-002",
    service: "Live Streaming",
    name: "Pastor Samuel",
    email: "pastor@example.com",
    phone: "0728 333 444",
    preferredDate: "2026-07-02",
    message: "Set up live stream for Sunday service.",
    status: "new",
    createdAt: "2026-06-18"
  }
];

export const adminActivities: AdminActivity[] = [
  { id: "act-001", title: "Order payment submitted", description: "Customer submitted proof for order pending verification.", type: "payment", time: "2 hours ago" },
  { id: "act-002", title: "Stock updated", description: "HP EliteBook inventory increased by 5 units.", type: "inventory", time: "1 day ago" },
  { id: "act-003", title: "New booking received", description: "CCTV installation request received for a Nairobi shop.", type: "booking", time: "3 days ago" },
  { id: "act-004", title: "Blog draft scheduled", description: "New blog draft created for CCTV installation checklist.", type: "product", time: "5 days ago" }
];

export const services: Service[] = [
  {
    slug: "cctv-installation",
    title: "CCTV Installation",
    summary: "Security camera design, installation, remote viewing, and maintenance for homes, shops, churches, and offices.",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1400&q=80",
    packages: [
      { name: "Starter Shop Kit", price: "From KES 28,500", features: ["4 camera planning", "DVR setup", "Mobile viewing", "Cable management"] },
      { name: "Business Security", price: "From KES 65,000", features: ["8 cameras", "NVR/DVR options", "Night vision", "Staff training"] },
      { name: "Custom Site", price: "Quoted after survey", features: ["Multi-floor design", "Remote monitoring", "Storage planning", "Maintenance plan"] }
    ],
    faqs: [
      { question: "Do you offer a site survey?", answer: "Yes. We inspect camera positions, cabling routes, recorder location, and internet access before final quotation." },
      { question: "Can I view cameras on my phone?", answer: "Yes. We configure secure mobile viewing after installation." }
    ]
  },
  {
    slug: "live-streaming",
    title: "Live Streaming Services",
    summary: "Professional event, church, school, and corporate streaming with multi-camera setup and clean audio.",
    image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1400&q=80",
    packages: [
      { name: "Single Camera Event", price: "From KES 18,000", features: ["HD stream", "Audio capture", "YouTube/Facebook setup"] },
      { name: "Church Streaming", price: "From KES 35,000", features: ["Multi-camera", "Sound desk integration", "Lower thirds", "Recording"] },
      { name: "Corporate Broadcast", price: "Custom quote", features: ["Hybrid event support", "Dedicated operator", "Backup internet planning"] }
    ],
    faqs: [
      { question: "Do you stream to Facebook and YouTube?", answer: "Yes. We can stream to one or multiple platforms depending on the event requirements." },
      { question: "Can you provide recording?", answer: "Yes. Event recording can be delivered after the session." }
    ]
  },
  {
    slug: "computer-repairs",
    title: "Computer Repairs",
    summary: "Laptop and desktop diagnosis, SSD upgrades, screen replacement coordination, software setup, and cleaning.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
    packages: [
      { name: "Diagnosis", price: "From KES 1,000", features: ["Hardware checks", "Software checks", "Repair estimate"] },
      { name: "SSD Upgrade", price: "From KES 4,500 + SSD", features: ["Data migration", "Windows optimization", "Boot speed testing"] },
      { name: "Business Maintenance", price: "Monthly quote", features: ["Scheduled service", "Antivirus review", "Backup checks"] }
    ],
    faqs: [
      { question: "Can you recover data?", answer: "We handle common drive migration and backup cases. Severe data recovery is assessed first." }
    ]
  },
  {
    slug: "networking-solutions",
    title: "Networking Solutions",
    summary: "Router setup, Wi-Fi coverage improvement, structured cabling, and office network troubleshooting.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80",
    packages: [
      { name: "Home Wi-Fi Setup", price: "From KES 4,000", features: ["Router setup", "Coverage test", "Password security"] },
      { name: "Office Network", price: "From KES 25,000", features: ["Cabling plan", "Switch setup", "Printer sharing", "Access control"] },
      { name: "Troubleshooting", price: "From KES 3,000", features: ["Speed testing", "Signal checks", "Device audit"] }
    ],
    faqs: [
      { question: "Do you install routers bought elsewhere?", answer: "Yes. We can configure and secure routers, access points, and switches." }
    ]
  }
];

export const testimonials = [
  { name: "Grace Wanjiku", role: "Boutique owner, Nairobi CBD", quote: "Favour Computer Services installed CCTV in my shop and configured mobile viewing the same day. The work was neat and professional.", rating: 5 },
  { name: "Peter Mwangi", role: "Accountant", quote: "I bought a Dell laptop and upgraded to SSD. The machine is fast, genuine, and the after-sales support is reliable.", rating: 5 },
  { name: "Faith Njeri", role: "Church media team", quote: "Their live streaming setup improved our Sunday service broadcast quality immediately.", rating: 5 }
];

export const faqs = [
  { question: "Do you offer shop pickup?", answer: "Yes. You can order online and pick up from Shop U13 at F&F Building next to Odeon Cinema in Nairobi." },
  { question: "Do you accept card payments?", answer: "No. Orders use Paybill payment instructions and payment confirmation upload for verification." },
  { question: "Are products genuine?", answer: "We source from trusted suppliers and clearly state warranty details on each item." },
  { question: "Can I order through WhatsApp?", answer: "Yes. Product and service pages include WhatsApp inquiry buttons with pre-filled messages." }
];

export const blogPosts: BlogPost[] = [
  {
    slug: "best-laptops-for-business-in-nairobi",
    title: "Best Laptops for Business Buyers in Nairobi",
    excerpt: "A practical guide to choosing secure, fast, and durable laptops for office teams and entrepreneurs.",
    content: "Business buyers should prioritize build quality, SSD storage, RAM, warranty support, and ports. HP EliteBook, Dell Latitude, and Lenovo ThinkPad models remain dependable choices for teams that need durability and long service life.",
    category: "Buying Guides",
    tags: ["Laptops Nairobi", "Business laptops", "SSD"],
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1400&q=80",
    publishedAt: "2026-06-04",
    author: "Favour Computer Services"
  },
  {
    slug: "ssd-upgrade-benefits",
    title: "Why an SSD Upgrade Is the Fastest Way to Revive an Old Computer",
    excerpt: "SSD upgrades reduce boot times, improve app loading, and extend the useful life of older laptops and desktops.",
    content: "For many slow computers, replacing a mechanical drive with an SSD gives the biggest speed improvement per shilling. Pairing SSD storage with enough RAM makes Windows updates, browser tabs, and office apps feel much smoother.",
    category: "Repairs",
    tags: ["SSD Nairobi", "Computer Repairs", "Laptop upgrade"],
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=1400&q=80",
    publishedAt: "2026-05-22",
    author: "Favour Computer Services"
  },
  {
    slug: "cctv-installation-checklist-nairobi",
    title: "CCTV Installation Checklist for Nairobi Shops and Offices",
    excerpt: "What to consider before installing security cameras in a shop, office, church, or home.",
    content: "Good CCTV installation starts with camera placement, night visibility, recorder storage, power backup, internet availability, and secure mobile access. A site survey helps avoid blind spots and poor cabling decisions.",
    category: "Security",
    tags: ["CCTV Installation Nairobi", "Security cameras", "Nairobi businesses"],
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1400&q=80",
    publishedAt: "2026-05-14",
    author: "Favour Computer Services"
  }
];
