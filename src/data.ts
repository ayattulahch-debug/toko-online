import type { Category, Product, StoreSettings } from './types'

export const WHATSAPP_NUMBER = '6281234567890'

export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Plakat Akrilik Custom / Piala Penghargaan / Vandel Wisuda',
    price: 75000,
    originalPrice: 120000,
    sold: 4500,
    location: 'Jakarta Barat',
    rating: 4.9,
    images: [
      'https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?w=500&q=80',
      'https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?w=500&q=80',
      'https://images.unsplash.com/photo-1612502694086-45efc1c5a9ab?w=500&q=80',
    ],
    description:
      'Plakat akrilik premium ketebalan 5mm. Cocok untuk hadiah wisuda, penghargaan, perlombaan, atau kenang-kenangan magang/KKN.\n\nDetail:\n- Bebas custom tulisan, bentuk, dan logo\n- Potongan rapi menggunakan mesin Laser Cutting\n- Cetak UV Print (Bukan stiker, warna tajam dan awet)\n- Free box bludru eksklusif\n- Proses pengerjaan cepat 1-2 hari kerja.',
  },
  {
    id: 2,
    name: 'Name Tag Akrilik Peniti / Magnet Custom Nama & Logo',
    price: 15000,
    sold: 12340,
    location: 'Bandung',
    rating: 4.8,
    images: [
      'https://images.unsplash.com/photo-1589384267710-7a170981ca78?w=500&q=80',
      'https://images.unsplash.com/photo-1634305886915-d41c4709d291?w=500&q=80',
      'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=500&q=80',
    ],
    description:
      'Name tag atau papan nama dada bahan akrilik tebal 2mm. Tampilan elegan, profesional, dan mengkilap (dilapisi resin).\n\n- Pilihan Pengait: Peniti atau Magnet super kuat\n- Hasil grafir/cetak sangat rapi dan anti luntur\n- Cocok untuk pegawai bank, ASN, guru, tenaga medis, dan panitia event.\n- Tidak ada minimal order (Bisa pesan 1 pcs).',
  },
  {
    id: 3,
    name: 'Lampu Tidur Hias Akrilik 3D Custom Foto & Nama LED',
    price: 125000,
    originalPrice: 150000,
    sold: 2100,
    location: 'Surabaya',
    rating: 4.9,
    images: [
      'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=500&q=80',
      'https://images.unsplash.com/photo-1563604044-672152865be1?w=500&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&q=80',
    ],
    description:
      'Lampu hias unik dari lembaran akrilik bening yang diukir (grafir laser) sehingga menghasilkan efek 3D saat dinyalakan.\n\n- Dudukan (base) kayu pinus estetik natural\n- Lampu LED warm white (nyaman di mata, tidak panas)\n- Bisa custom foto siluet wajah, nama, atau ucapan\n- Sangat cocok untuk kado ulang tahun, kado pernikahan (wedding), atau anniversary.\n- Power menggunakan kabel USB.',
  },
  {
    id: 4,
    name: 'Gantungan Kunci Akrilik Custom UV Print Bolak Balik (2 Sisi)',
    price: 8500,
    sold: 35000,
    location: 'Sleman',
    rating: 4.7,
    images: [
      'https://images.unsplash.com/photo-1605370425712-401d46b7a2d6?w=500&q=80',
      'https://images.unsplash.com/photo-1584985223011-50e58f000490?w=500&q=80',
      'https://images.unsplash.com/photo-1590283083693-018f2fce4d43?w=500&q=80',
    ],
    description:
      'Gantungan kunci akrilik custom desain bebas suka-suka!\n\n- Material: Akrilik tebal 3mm (atau 2 lapis 1.5mm di-press)\n- Dicetak menggunakan mesin UV Print Jepang (bukan stiker)\n- Gambar bisa bolak-balik (2 sisi) dengan desain yang sama atau berbeda\n- Ring gantungan tebal dan tidak mudah berkarat\n- Minimal order: 10 pcs (cocok untuk souvenir pernikahan, promosi perusahaan, atau merchandise komunitas).',
  },
]

export const INITIAL_CATEGORIES: Category[] = [
  { id: 1, icon: '🏆', name: 'Plakat' },
  { id: 2, icon: '🪪', name: 'Name Tag' },
  { id: 3, icon: '💡', name: 'Lampu Hias' },
  { id: 4, icon: '🔑', name: 'Gantungan' },
  { id: 5, icon: '🖼️', name: 'Standee' },
  { id: 6, icon: '🎁', name: 'Souvenir' },
  { id: 7, icon: '🎟️', name: 'Promo' },
  { id: 8, icon: '⭐', name: 'Terlaris' },
]

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  name: 'Toko Akrilik Kreatif',
  location: 'Jakarta Barat',
  promoText: 'PROMO KILAT! DISKON 50%',
  banner: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=500&q=80',
}
