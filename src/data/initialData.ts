import { 
  User, 
  AdminAccount,
  LoginHistoryItem,
  Equipment, 
  Material, 
  BorrowingTransaction, 
  ReturnTransaction, 
  MaterialUsage, 
  TransactionHistoryItem,
  AppSettings 
} from '../types';

// ONLY ONE Administrator Account for SI-PAB Workshop PTKI Medan
// Pre-configured securely with salt: "PTKI_ADMIN_SALT_99"
// Default Password: "AdminWorkshop2025!"
export const INITIAL_ADMIN: AdminAccount = {
  adminId: 'ADM-PTKI-001',
  username: 'admin',
  email: 'workshop.usbptkimedan@gmail.com',
  fullName: 'Abdillah, ST. MM.',
  passwordHash: 'PTKI_ADMIN_SALT_99:99ed3e6532b6a88135d326b56aaa21ed4a61029a1f02c85f267a2b3a113cc3b7',
  role: 'admin',
  createdAt: '2025-01-01 08:00:00'
};

// Students (Mahasiswa) list in Users Sheet
// Default Password for sample accounts: "Mahasiswa2025!" (salt: "PTKI_MHS_SALT_88")
const DEFAULT_MHS_PASSWORD_HASH = 'PTKI_MHS_SALT_88:17ebb80dff1e1c1aa19985a476cf1fba6e2b90641625e829586be436202016f8';

export const INITIAL_USERS: User[] = [
  // Admin user representation
  {
    id: 'ADM-PTKI-001',
    name: 'Abdillah, ST. MM.',
    email: 'workshop.usbptkimedan@gmail.com',
    role: 'admin',
    nim_nip: '197605062003121004',
    department: 'Kepala Workshop',
    classSemester: 'Kepala Lab / Dosen',
    phone: '0812-6543-9870',
    whatsApp: '0812-6543-9870',
    passwordHash: INITIAL_ADMIN.passwordHash,
    status: 'active',
    createdAt: '2025-01-01 08:00',
    lastLogin: '2025-02-17 07:45'
  },
];

export const INITIAL_LOGIN_HISTORY: LoginHistoryItem[] = [
  {
    loginId: 'LOG-001',
    userId: 'ADM-PTKI-001',
    userName: 'Abdillah, ST. MM.',
    role: 'Administrator',
    loginDate: '2025-02-17 07:45',
    loginStatus: 'SUCCESS',
    device: 'Desktop Chrome / Windows 11'
  },
];

export const INITIAL_EQUIPMENT: Equipment[] = [
  {
    id: 'EQ-001',
    code: 'EQ-TK-001',
    name: 'Spektrofotometer UV-Vis Rayleigh UV-9200',
    category: 'Instrumentasi Kimia',
    totalQty: 3,
    availableQty: 2,
    condition: 'Baik',
    location: 'Lab Analisis Instrumen Lt. 2',
    description: 'Rentang panjang gelombang 190-1100 nm, akurasi ±0.3 nm. Untuk analisis kuantitatif sampel praktikum kimia.',
    specification: 'Single beam, Deuterium & Tungsten Lamp, bandwidth 2 nm.',
    lastMaintenance: '2025-01-15'
  },
  {
    id: 'EQ-002',
    code: 'EQ-WS-002',
    name: 'Mesin Bubut Konvensional Colchester Triumph 2000',
    category: 'Mesin Workshop',
    totalQty: 6,
    availableQty: 4,
    condition: 'Baik',
    location: 'Bengkel Pemesinan & Mekanik Dasar',
    description: 'Mesin bubut presisi tinggi untuk pembubutan silindris, ulir, facing komponen alat industri.',
    specification: 'Swing over bed 400mm, jarak antar senter 1000mm, spindle bore 54mm.',
    lastMaintenance: '2025-02-10'
  },
  {
    id: 'EQ-003',
    code: 'EQ-GL-003',
    name: 'Buret Makro Kaca Pyrex 50 ml Kelas A',
    category: 'Alat Gelas Lab',
    totalQty: 25,
    availableQty: 18,
    condition: 'Baik',
    location: 'Lemari Kaca A-02 Lab Kimia Dasar',
    description: 'Buret titrasi dengan stopcock PTFE keran teflon, ketelitian skala 0.10 ml.',
    specification: 'Boro 3.3 Pyrex Glass, DIN ISO 385.',
    lastMaintenance: '2025-01-20'
  },
  {
    id: 'EQ-004',
    code: 'EQ-UK-004',
    name: 'Digital Caliper Jangka Sorong Mitutoyo 150 mm',
    category: 'Alat Ukur & Kalibrasi',
    totalQty: 10,
    availableQty: 6,
    condition: 'Baik',
    location: 'Lemari Instrumen Presisi B-01',
    description: 'Jangka sorong digital presisi tinggi resolusi 0.01 mm untuk praktikum fabrikasi mekatronika.',
    specification: 'Accuracy ±0.02mm, IP67 coolant proof, stainless steel.',
    lastMaintenance: '2025-02-01'
  },
  {
    id: 'EQ-005',
    code: 'EQ-WS-005',
    name: 'Mesin Las TIG/MMA Inverter Miller Syncrowave 210',
    category: 'Mesin Workshop',
    totalQty: 4,
    availableQty: 2,
    condition: 'Baik',
    location: 'Area Pengelasan & Fabrikasi Pipa',
    description: 'Mesin las TIG multifungsi untuk pengelasan stainless steel dan carbon steel pipa reaktor kimia.',
    specification: 'Current 5-210 Amp, AC/DC, HF start, Duty Cycle 60%.',
    lastMaintenance: '2025-01-28'
  },
  {
    id: 'EQ-006',
    code: 'EQ-TK-006',
    name: 'Digital pH Meter Benchtop Hanna HI-2211',
    category: 'Instrumentasi Kimia',
    totalQty: 8,
    availableQty: 6,
    condition: 'Baik',
    location: 'Lab Kimia Terapan & Analisa Limbah',
    description: 'Pengukur pH akurat dengan kompensasi temperatur otomatis (ATC) dan elektroda kombinasi.',
    specification: 'Range -2.00 to 16.00 pH, Resolution 0.01 pH, temp sensor included.',
    lastMaintenance: '2025-02-05'
  },
  {
    id: 'EQ-007',
    code: 'EQ-TK-007',
    name: 'Viskometer Rotasi Brookfield DV2T',
    category: 'Instrumentasi Kimia',
    totalQty: 2,
    availableQty: 0,
    condition: 'Dalam Perawatan',
    location: 'Lab Rekayasa Polimer & Fluida',
    description: 'Alat ukur viskositas fluida reologi fluida non-newtonian dan pelumas.',
    specification: '5-inch full color touch screen, sensing range 15 to 6,000,000 cP.',
    lastMaintenance: '2025-02-12'
  },
  {
    id: 'EQ-008',
    code: 'EQ-K3-008',
    name: 'Full Body Harness Fall Arrester & Lanyard Petzl',
    category: 'APD & Safety K3',
    totalQty: 12,
    availableQty: 9,
    condition: 'Baik',
    location: 'Gudang APD & Keselamatan K3',
    description: 'Alat pelindung jatuh untuk pekerjaan perpipaan reaktor pada menara distilasi.',
    specification: 'EN 361 certified, 2-point attachment, shock absorbing lanyard.',
    lastMaintenance: '2025-01-10'
  },
  {
    id: 'EQ-009',
    code: 'EQ-GL-009',
    name: 'Gelas Kimia Beaker Glass Pyrex 1000 ml',
    category: 'Alat Gelas Lab',
    totalQty: 30,
    availableQty: 24,
    condition: 'Baik',
    location: 'Lemari Gelas A-01',
    description: 'Beaker low-form graduation scale tahan panas reaksi eksotermis.',
    specification: 'Borosilicate 3.3, Thermal shock resistance 120°C.',
    lastMaintenance: '2025-01-05'
  },
  {
    id: 'EQ-010',
    code: 'EQ-WS-010',
    name: 'Mesin Gerinda Datar Surface Grinder Chevalier',
    category: 'Mesin Workshop',
    totalQty: 2,
    availableQty: 1,
    condition: 'Rusak Ringan',
    location: 'Bengkel Pemesinan Lanjut',
    description: 'Mesin grinding presisi meja magnetik. Sedang menunggu penggantian bearing poros spindle.',
    specification: 'Table size 200 x 450 mm, magnetic chuck, hydraulic traverse.',
    lastMaintenance: '2025-01-30'
  }
];

export const INITIAL_MATERIALS: Material[] = [
  {
    id: 'MAT-001',
    code: 'MB-RG-001',
    name: 'Asam Sulfat Pekat (H2SO4 98%) PA Merck',
    category: 'Reagen Kimia',
    stock: 12.5,
    unit: 'Liter',
    minStock: 5.0,
    location: 'Gudang Bahan Kimia B3 Lemari Asam',
    description: 'Grade Pro Analisa (PA) untuk katalis esterifikasi dan pengujian bilangan asam minyak sawit.',
    specification: 'Kadar min. 98.0%, kemurnian tinggi, botol kaca amber safety coated.'
  },
  {
    id: 'MAT-002',
    code: 'MB-RG-002',
    name: 'Natrium Hidroksida (NaOH Pellet) PA Smart-Lab',
    category: 'Reagen Kimia',
    stock: 18.0,
    unit: 'Kg',
    minStock: 6.0,
    location: 'Rak Bahan Padat B3 No. 4',
    description: 'Basa kuat untuk titrasi alkalimetri, sintesis sabun, dan pembersihan residu reaktor.',
    specification: 'Assay min 99%, sodium hydroxide pellet white.'
  },
  {
    id: 'MAT-003',
    code: 'MB-WS-003',
    name: 'Kawat Las Elektroda AWS E6013 RB-26 Kobe (Dia 2.6 mm)',
    category: 'Bahan Pengelasan & Logam',
    stock: 45.0,
    unit: 'Kg',
    minStock: 15.0,
    location: 'Gudang Bengkel Las Rak C-1',
    description: 'Elektroda las busur listrik terbungkus untuk latihan fabrikasi plat baja dan rangka pipa.',
    specification: 'Mild steel electrode, all positional welding.'
  },
  {
    id: 'MAT-004',
    code: 'MB-RG-004',
    name: 'Etanol Teknis 96% (Grade Pelarut Industri)',
    category: 'Pelumas & Solven',
    stock: 35.0,
    unit: 'Liter',
    minStock: 10.0,
    location: 'Gudang Solven Organik Drum A-2',
    description: 'Pelarut pencuci ekstraksi soxhlet dan pembersih sisa lemak praktikum industri kelapa sawit.',
    specification: 'Ethanol 96% technical grade, jerigen tebal 5L.'
  },
  {
    id: 'MAT-005',
    code: 'MB-GS-005',
    name: 'Gas Argon Industri (High Purity 99.99%) Tabung 6 m3',
    category: 'Gas Industri & Tabung',
    stock: 3,
    unit: 'Tabung',
    minStock: 2,
    location: 'Depo Gas Bertekanan Luar Workshop',
    description: 'Gas pelindung pengelasan GTAW / TIG pipa stainless steel food & chemical grade.',
    specification: 'Pressure 150 bar, purity 99.999%.'
  },
  {
    id: 'MAT-006',
    code: 'MB-WS-006',
    name: 'Oli Pendingin Pemotongan (Coolant Soluble Oil Dromus)',
    category: 'Pelumas & Solven',
    stock: 8.5,
    unit: 'Liter',
    minStock: 10.0,
    location: 'Gudang Pelumas Mesin Bubut',
    description: 'Cairan pendingin emulsi air untuk proses bubut dan frais agar pahat tidak cepat aus.',
    specification: 'Bio-stable water soluble cutting fluid, rasio 1:20.'
  },
  {
    id: 'MAT-007',
    code: 'MB-PL-007',
    name: 'Granul Polimer Polypropylene (PP) Homopolymer',
    category: 'Polimer & Aditif',
    stock: 22.0,
    unit: 'Kg',
    minStock: 10.0,
    location: 'Rak Bahan Polimer Workshop Lt. 1',
    description: 'Biji plastik untuk praktikum mesin cetak injeksi (injection molding) dan ekstrusi rekayasa.',
    specification: 'Melt Flow Index 12 g/10min, density 0.905 g/cm3.'
  },
  {
    id: 'MAT-008',
    code: 'MB-WS-008',
    name: 'Mata Pahat Bubut HSS Bohler 1/2" x 1/2" x 4"',
    category: 'Bahan Pengelasan & Logam',
    stock: 14,
    unit: 'Batang',
    minStock: 5,
    location: 'Lemari Tooling Mesin Bubut',
    description: 'Batang baja potong kecepatan tinggi untuk diasah menjadi pahat rata, muka, dan alur.',
    specification: 'High Speed Steel Mo-V Cobalt alloy.'
  }
];

export const INITIAL_BORROWINGS: BorrowingTransaction[] = [
  {
    id: 'TX-BORROW-001',
    transactionCode: 'PB-2025-0101',
    borrowerName: 'Siti Rahmawati',
    borrowerId: '2101042',
    department: 'D3 Teknik Kimia',
    classSemester: 'TK-3A / Semester 6',
    equipmentId: 'EQ-001',
    equipmentName: 'Spektrofotometer UV-Vis Rayleigh UV-9200',
    equipmentCode: 'EQ-TK-001',
    quantity: 1,
    borrowDate: '2025-02-14',
    expectedReturnDate: '2025-02-16',
    purpose: 'Analisis Spektrofotometri Kadar Karotenoid Minyak Sawit Kasar (CPO) pada Tugas Akhir',
    notes: 'Kuvet kuarsa disertakan 2 pcs, kabel daya, panduan SOP kalibrasi.',
    status: 'SEDANG_DIPINJAM',
    approvedBy: 'Ir. Bambang Suhartono, M.T.',
    approvedAt: '2025-02-14 09:30',
    handedOverBy: 'Ir. Bambang Suhartono, M.T.',
    handedOverAt: '2025-02-14 10:00',
    createdAt: '2025-02-14 08:45'
  },
  {
    id: 'TX-BORROW-002',
    transactionCode: 'PB-2025-0102',
    borrowerName: 'Ahmad Rizky Pratama',
    borrowerId: '2202018',
    department: 'D3 Teknik Otomasi Mesin & Mekatronika',
    classSemester: 'TOM-2B / Semester 4',
    equipmentId: 'EQ-004',
    equipmentName: 'Digital Caliper Jangka Sorong Mitutoyo 150 mm',
    equipmentCode: 'EQ-UK-004',
    quantity: 2,
    borrowDate: '2025-02-13',
    expectedReturnDate: '2025-02-15',
    purpose: 'Pengukuran dimensi toleransi poros dan bushing prototype konveyor industri',
    notes: 'Dipinjam bersama kotak pelindung dan sertifikat kalibrasi.',
    status: 'TERLAMBAT',
    approvedBy: 'Ir. Bambang Suhartono, M.T.',
    approvedAt: '2025-02-13 10:15',
    handedOverBy: 'Ir. Bambang Suhartono, M.T.',
    handedOverAt: '2025-02-13 10:30',
    createdAt: '2025-02-13 09:50'
  },
  {
    id: 'TX-BORROW-003',
    transactionCode: 'PB-2025-0103',
    borrowerName: 'Dinda Ayu Lestari',
    borrowerId: '2203009',
    department: 'D3 Manajemen Logistik Industri',
    classSemester: 'MLI-2A / Semester 4',
    equipmentId: 'EQ-008',
    equipmentName: 'Full Body Harness Fall Arrester & Lanyard Petzl',
    equipmentCode: 'EQ-K3-008',
    quantity: 2,
    borrowDate: '2025-02-15',
    expectedReturnDate: '2025-02-18',
    purpose: 'Simulasi audit K3 inspeksi rak racking pergudangan bertingkat (Warehouse Safety)',
    notes: 'Pemeriksaan buckle dan tali webbing telah dilakukan.',
    status: 'DISETUJUI',
    approvedBy: 'Ir. Bambang Suhartono, M.T.',
    approvedAt: '2025-02-15 11:20',
    createdAt: '2025-02-15 10:00'
  },
  {
    id: 'TX-BORROW-004',
    transactionCode: 'PB-2025-0104',
    borrowerName: 'Siti Rahmawati',
    borrowerId: '2101042',
    department: 'D3 Teknik Kimia',
    classSemester: 'TK-3A / Semester 6',
    equipmentId: 'EQ-003',
    equipmentName: 'Buret Makro Kaca Pyrex 50 ml Kelas A',
    equipmentCode: 'EQ-GL-003',
    quantity: 4,
    borrowDate: '2025-02-17',
    expectedReturnDate: '2025-02-19',
    purpose: 'Praktikum Kimia Analitik Kuantitatif Golongan II Titrasi Kompleksometri EDTA',
    notes: 'Kondisi keran teflon kencang dan tidak ada keretakan.',
    status: 'MENUNGGU_PERSETUJUAN',
    createdAt: '2025-02-17 08:15'
  },
  {
    id: 'TX-BORROW-005',
    transactionCode: 'PB-2025-0098',
    borrowerName: 'Ahmad Rizky Pratama',
    borrowerId: '2202018',
    department: 'D3 Teknik Otomasi Mesin & Mekatronika',
    classSemester: 'TOM-2B / Semester 4',
    equipmentId: 'EQ-005',
    equipmentName: 'Mesin Las TIG/MMA Inverter Miller Syncrowave 210',
    equipmentCode: 'EQ-WS-005',
    quantity: 1,
    borrowDate: '2025-02-08',
    expectedReturnDate: '2025-02-10',
    actualReturnDate: '2025-02-10',
    purpose: 'Fabrikasi rangka reaktor kimia skala bench batch pilot plant',
    notes: 'Termasuk kabel massa, torch TIG WP-17, regulator argon.',
    status: 'DIKEMBALIKAN',
    approvedBy: 'Ir. Bambang Suhartono, M.T.',
    approvedAt: '2025-02-08 08:30',
    handedOverBy: 'Ir. Bambang Suhartono, M.T.',
    handedOverAt: '2025-02-08 08:45',
    createdAt: '2025-02-08 08:00'
  }
];

export const INITIAL_RETURNS: ReturnTransaction[] = [
  {
    id: 'RET-001',
    returnCode: 'KB-2025-0045',
    borrowingTransactionId: 'TX-BORROW-005',
    transactionCode: 'PB-2025-0098',
    borrowerName: 'Ahmad Rizky Pratama',
    borrowerId: '2202018',
    equipmentName: 'Mesin Las TIG/MMA Inverter Miller Syncrowave 210',
    quantity: 1,
    borrowDate: '2025-02-08',
    expectedReturnDate: '2025-02-10',
    actualReturnDate: '2025-02-10',
    conditionUponReturn: 'Baik',
    notes: 'Alat dikembalikan lengkap, kabel dalam keadaan tergulung rapi, tidak ada kerusakan.',
    penalty: 0,
    confirmedBy: 'Ir. Bambang Suhartono, M.T.',
    createdAt: '2025-02-10 16:30'
  }
];

export const INITIAL_MATERIAL_USAGES: MaterialUsage[] = [
  {
    id: 'MU-001',
    usageCode: 'PBH-2025-0081',
    userName: 'Siti Rahmawati',
    userId: '2101042',
    department: 'D3 Teknik Kimia',
    classSemester: 'TK-3A / Semester 6',
    materialId: 'MAT-001',
    materialName: 'Asam Sulfat Pekat (H2SO4 98%) PA Merck',
    materialCode: 'MB-RG-001',
    category: 'Reagen Kimia',
    quantityUsed: 0.5,
    unit: 'Liter',
    usageDate: '2025-02-15',
    purpose: 'Katalis asam pada reaksi transesterifikasi biodiesel limbah minyak jelantah',
    notes: 'Pengambilan menggunakan pipet ukur di dalam lemari asam dengan APD lengkap.',
    status: 'DIKELUARKAN',
    approvedBy: 'Ir. Bambang Suhartono, M.T.',
    approvedAt: '2025-02-15 10:45',
    issuedBy: 'Ir. Bambang Suhartono, M.T.',
    issuedAt: '2025-02-15 11:00',
    createdAt: '2025-02-15 09:10'
  },
  {
    id: 'MU-002',
    usageCode: 'PBH-2025-0082',
    userName: 'Ahmad Rizky Pratama',
    userId: '2202018',
    department: 'D3 Teknik Otomasi Mesin & Mekatronika',
    classSemester: 'TOM-2B / Semester 4',
    materialId: 'MAT-003',
    materialName: 'Kawat Las Elektroda AWS E6013 RB-26 Kobe (Dia 2.6 mm)',
    materialCode: 'MB-WS-003',
    category: 'Bahan Pengelasan & Logam',
    quantityUsed: 3.0,
    unit: 'Kg',
    usageDate: '2025-02-16',
    purpose: 'Pengelasan sambungan sudut rangka dudukan motor listrik mixer reaktor',
    notes: 'Bahan habis dipakai di bilik las workshop mekatronika.',
    status: 'DIKELUARKAN',
    approvedBy: 'Ir. Bambang Suhartono, M.T.',
    approvedAt: '2025-02-16 11:15',
    issuedBy: 'Ir. Bambang Suhartono, M.T.',
    issuedAt: '2025-02-16 11:30',
    createdAt: '2025-02-16 10:20'
  },
  {
    id: 'MU-003',
    usageCode: 'PBH-2025-0083',
    userName: 'Siti Rahmawati',
    userId: '2101042',
    department: 'D3 Teknik Kimia',
    classSemester: 'TK-3A / Semester 6',
    materialId: 'MAT-004',
    materialName: 'Etanol Teknis 96% (Grade Pelarut Industri)',
    materialCode: 'MB-RG-004',
    category: 'Pelumas & Solven',
    quantityUsed: 2.0,
    unit: 'Liter',
    usageDate: '2025-02-17',
    purpose: 'Pencucian labu ekstraksi lemak dan pelarut ekstraksi oleoresin jahe merah',
    notes: 'Penyimpanan residu di wadah limbah organik B3.',
    status: 'MENUNGGU_PERSETUJUAN',
    createdAt: '2025-02-17 08:50'
  }
];

export const INITIAL_TRANSACTION_HISTORY: TransactionHistoryItem[] = [
  {
    id: 'HIST-001',
    referenceCode: 'KB-2025-0045',
    type: 'PENGEMBALIAN',
    timestamp: '2025-02-10 16:30',
    actorName: 'Ahmad Rizky Pratama',
    actorId: '2202018',
    department: 'D3 Teknik Otomasi Mesin & Mekatronika',
    itemType: 'ALAT',
    itemName: 'Mesin Las TIG/MMA Inverter Miller Syncrowave 210',
    quantity: 1,
    unit: 'Unit',
    status: 'Selesai (Kondisi Baik)',
    details: 'Pengembalian alat selesai tepat waktu. Diterima dalam kondisi prima.',
    operator: 'Ir. Bambang Suhartono, M.T.'
  },
];

export const INITIAL_SETTINGS: AppSettings = {
  workshopName: 'Workshop PTKI Medan',
  institutionName: 'Politeknik Teknologi Kimia Industri Medan (Kemenperin RI)',
  labHeadName: 'Abdillah, ST. MM.',
  labHeadNip: '197605062003121004',
  appsScriptUrl: '',
  googleSheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
  autoSync: true,
  syncIntervalMinutes: 5,
  isOnline: true,
  studentAutoApproveRegistration: false
};
