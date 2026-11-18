export const pressCardsCatalog = [
  // KATEGORI 1: POWER-UP (Untuk Tim Sendiri / Bantuan Belajar)
  {
    id: "card_lens",
    name: "Lensa Eliminator",
    category: "powerup",
    price: 75,
    iconKey: "search",
    summary: "Hilangkan 1 Pilihan Jawaban Salah",
    description: "Membantu tim saat bingung: langsung mencoret dan mengeliminasi 1 opsi yang salah pada soal tahap yang sedang dikerjakan.",
    targetType: "self"
  },
  {
    id: "card_editor_hint",
    name: "Bocoran Kunci Editor",
    category: "powerup",
    price: 130,
    iconKey: "lightbulb",
    summary: "Buka Petunjuk Emas Kasus",
    description: "Konsultasi ke Redaktur Senior: membuka petunjuk analisis mendalam yang membeberkan kisi-kisi jawaban yang benar.",
    targetType: "self"
  },
  {
    id: "card_shield",
    name: "Perisai Penjernih Fakta",
    category: "defense",
    price: 100,
    iconKey: "shield",
    summary: "Kebal Debuff & Hapus Gangguan",
    description: "Memasang filter perlindungan: menghapus semua debuff yang dikirim kelompok lain dan kebal dari serangan lawan pada stage ini.",
    targetType: "self"
  },

  // KATEGORI 2: DEBUFF (Untuk Kelompok Lawan - Menambah Tantangan Tanpa Mengurangi Uang)
  {
    id: "card_fake_distractor",
    name: "Injeksi Opsi Mengecoh",
    category: "debuff",
    price: 100,
    iconKey: "zap",
    summary: "Munculkan Opsi Jawaban Baru Palsu di Layar Lawan",
    description: "Menyusupkan 1-2 pilihan jawaban baru yang mirip dan sangat mengecoh ke layar kelompok rival! Lawan harus berpikir dua kali lebih kritis.",
    targetType: "rival"
  },
  {
    id: "card_scramble_clues",
    name: "Kabut Tinta Redaksi",
    category: "debuff",
    price: 110,
    iconKey: "shuffle",
    summary: "Acak Tatanan Potongan Berita Lawan",
    description: "Mengacak urutan potongan teks dan petunjuk di meja kelompok rival sehingga mereka harus menyortir ulang dari awal.",
    targetType: "rival"
  },
  {
    id: "card_deadline_panic",
    name: "Tekanan Deadline Redaksi",
    category: "debuff",
    price: 90,
    iconKey: "clock",
    summary: "Pasang Jam Detak Berisik di Layar Lawan",
    description: "Memasang efek detak jarum jam deadline di layar kelompok lawan untuk menciptakan suasana redaksi yang menegangkan!",
    targetType: "rival"
  }
];
