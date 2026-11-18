export const journalismStages = [
  // =========================================================================
  // TAHAP 1: EKSTRAKSI UNSUR POKOK BERITA (5W + 1H) - 3 KASUS INVESTIGASI
  // Estimasi Waktu: ~10 - 12 Menit
  // =========================================================================
  {
    id: "stage-1-5w1h",
    number: 1,
    title: "Tahap 1: Ekstraksi Unsur Pokok Berita (5W + 1H)",
    subtitle: "Investigasi 3 Berkas Kasus Nyata di Lingkungan Sekolah",
    badge: "Master 5W+1H",
    color: "var(--color-accent-yellow)",
    colorName: "yellow",
    estimatedTime: "10-12 Menit",
    summary: "Berita straight news pantang kehilangan salah satu dari 6 unsur pokok: What, Who, Where, When, Why, dan How. Pada level menantang ini, berkas investigasi disusupi opini subjektif, spekulasi rumor, dan detail tidak relevan (red herrings) yang harus disaring cermat oleh tim!",
    cases: [
      {
        id: "case-1a",
        caseNumber: 1,
        topic: "Kasus 1: Investigasi Kebocoran Kunci Jawaban Asesmen Sekolah di Media Sosial",
        reportText: "Senin pagi (14/11) pukul 07.15 WIB, panitia Asesmen Sumatif Akhir Semester SMP Negeri 1 mendapati peredaran lembar kunci jawaban mata pelajaran Matematika di sebuah kanal Telegram beranggotakan 320 siswa. Berdasarkan investigasi cepat Tim Disiplin Sekolah bersama Kepolisian Sektor, naskah bocor karena kelalaian seorang staf tata usaha bimbingan belajar mitra yang mengunggah foto draf master soal ke grup terbuka demi mempromosikan program berbayar lembaganya. Petugas keamanan siber mengonfirmasi keaslian dokumen dari tanda air (watermark) kode cetak di lembar berkas. Pihak sekolah segera membatalkan sesi ujian jam pertama, mencetak paket soal cadangan B, dan menjadwalkan ulang tes pada Rabu mendatang tanpa memungut biaya apa pun.",
        clues: [
          { id: "c1-what", text: "Pembatalan dan penjadwalan ulang ujian akibat peredaran bocoran kunci jawaban Matematika di Telegram", element: "what", label: "WHAT (Peristiwa pokok apa yang terjadi?)" },
          { id: "c1-who", text: "Panitia Asesmen Sekolah, oknum staf bimbingan belajar, dan 320 siswa di grup Telegram", element: "who", label: "WHO (Siapa pihak-pihak yang terlibat?)" },
          { id: "c1-where", text: "Lingkungan SMP Negeri 1 dan ruang kanal digital Telegram", element: "where", label: "WHERE (Di mana peristiwa dan penyebaran terjadi?)" },
          { id: "c1-when", text: "Senin pagi (14/11) pukul 07.15 WIB menjelang pelaksanaan ujian jam pertama", element: "when", label: "WHEN (Kapan waktu peristiwa berlangsung?)" },
          { id: "c1-why", text: "Staf bimbingan belajar lalai menyebarkan draf master soal demi promosi komersial program berbayar", element: "why", label: "WHY (Mengapa naskah ujian bisa bocor?)" },
          { id: "c1-how", text: "Kebocoran terdeteksi via watermark kode cetak, sesi dibatalkan, dan paket soal cadangan B dicetak untuk Rabu", element: "how", label: "HOW (Bagaimana kronologi penanganan dan solusinya?)" }
        ],
        distractors: [
          {
            id: "d1-opini",
            text: "Banyak siswa menuduh panitia sengaja membocorkan soal karena nilai rata-rata sekolah sedang anjlok",
            element: "distractor_opinion",
            isDistractor: true,
            distractorType: "Opini Subjektif / Tuduhan Tanpa Bukti",
            distractorReason: "Tuduhan emosional siswa adalah opini asumsi, bukan fakta penyebab resmi (Why) yang diverifikasi kepolisian!"
          },
          {
            id: "d1-redherring",
            text: "Penjaga fotokopi sekolah sempat kehabisan kertas HVS putih pada pukul 06.00 WIB",
            element: "distractor_secondary",
            isDistractor: true,
            distractorType: "Fakta Sekunder Tidak Relevan (Red Herring)",
            distractorReason: "Meskipun benar terjadi, kehabisan kertas fotokopi tidak berkaitan secara kausal dengan kebocoran digital di Telegram!"
          },
          {
            id: "d1-rumor",
            text: "Beredar pesan suara anonim bahwa ujian susulan akan dibuat sepuluh kali lipat lebih sulit sebagai hukuman",
            element: "distractor_hoax",
            isDistractor: true,
            distractorType: "Rumor / Hoaks Media Sosial",
            distractorReason: "Kabar burung dari pesan suara anonim belum pernah dikonfirmasi resmi oleh kepala sekolah!"
          }
        ],
        debuffDistractors: [
          { id: "db1-fake1", text: "Kepala Sekolah sengaja menjual komputer untuk membeli mobil dinas", element: "fake_hoax", label: "HOAKS JEBAKAN", isDistractor: true }
        ]
      },
      {
        id: "case-1b",
        caseNumber: 2,
        topic: "Kasus 2: Keracunan Massal Jajanan Kantin Sekolah & Penelusuran Sampel Laboratorium BPOM",
        reportText: "Sebanyak 18 siswa dilarikan ke Unit Gawat Darurat Puskesmas pada Kamis (24/11) pukul 13.00 WIB setelah mengalami gejala mual akut, demam, dan muntah usai menyantap mie ayam berlumur saus pedas di kantin belakang sekolah. Uji mikrobiologi cepat oleh tim Balai Pengawas Obat dan Makanan (BPOM) dan Dinas Kesehatan pada pukul 16.30 WIB menemukan kontaminasi bakteri patogen Staphylococcus aureus yang berkembang biak akibat penggunaan air cucian ember berulang dan suhu penyimpanan daging ayam yang tidak higienis. Pihak sekolah bersama dinas terkait langsung memasang garis pembatas, membekukan izin dagang stan kantin bersangkutan selama penyelidikan, serta menanggung seluruh biaya rawat inap siswa hingga pulih total.",
        clues: [
          { id: "c2-what", text: "Keracunan massal 18 siswa dan pembekuan izin operasional stan kantin sekolah", element: "what", label: "WHAT (Peristiwa kesehatan darurat apa yang terjadi?)" },
          { id: "c2-who", text: "18 siswa terdampak, pengelola stan mie ayam kantin, dan tim uji laboratorium BPOM/Puskesmas", element: "who", label: "WHO (Siapa korban dan pihak yang berwenang?)" },
          { id: "c2-where", text: "Area kantin belakang sekolah dan ruang Instalasi Gawat Darurat (UGD) Puskesmas", element: "where", label: "WHERE (Di mana lokasi keracunan dan penanganannya?)" },
          { id: "c2-when", text: "Kamis (24/11) siang pukul 13.00 WIB usai jam istirahat kedua", element: "when", label: "WHEN (Kapan waktu peristiwa darurat bermula?)" },
          { id: "c2-why", text: "Kontaminasi bakteri patogen Staphylococcus aureus akibat air cucian ember dan penyimpanan tak higienis", element: "why", label: "WHY (Mengapa keracunan makanan bisa terjadi?)" },
          { id: "c2-how", text: "Siswa dievakuasi ke UGD, sampel diuji mikrobiologi BPOM, stan disegel, dan biaya ditanggung sekolah", element: "how", label: "HOW (Bagaimana alur evakuasi dan tindakan tegasnya?)" }
        ],
        distractors: [
          {
            id: "d2-opini",
            text: "Penjual mie ayam mengklaim olahannya selalu suci bersih dan menuduh daya tahan tubuh siswa yang terlalu lemah",
            element: "distractor_opinion",
            isDistractor: true,
            distractorType: "Opini Subjektif & Alibi Pembelaan Diri",
            distractorReason: "Klaim sepihak penjual terbantahkan secara telak oleh bukti ilmiah hasil uji laboratorium mikrobiologi BPOM!"
          },
          {
            id: "d2-redherring",
            text: "Seorang siswa kelas 9 membawa bekal nasi goreng dari rumah dan makan di tribun lapangan",
            element: "distractor_secondary",
            isDistractor: true,
            distractorType: "Fakta Sekunder Tidak Relevan",
            distractorReason: "Informasi siswa membawa bekal sendiri tidak memiliki kaitan kausalitas dengan peristiwa keracunan kantin!"
          },
          {
            id: "d2-arsip",
            text: "Surat perpanjangan izin sewa stan kantin sekolah telah ditandatangani pada bulan Juli 2021 silam",
            element: "distractor_time",
            isDistractor: true,
            distractorType: "Keterangan Waktu Riwayat Administratif",
            distractorReason: "Ini adalah arsip administratif lama, bukan waktu terjadinya peristiwa genting (When) yang diberitakan!"
          }
        ],
        debuffDistractors: [
          { id: "db2-fake1", text: "Air hujan di sekolah mengandung racun kimia berbahaya", element: "fake_hoax", label: "HOAKS JEBAKAN", isDistractor: true }
        ]
      },
      {
        id: "case-1c",
        caseNumber: 3,
        topic: "Kasus 3: Penyelamatan Satwa Langka Kucing Hutan (Prionailurus bengalensis) di Perpustakaan",
        reportText: "Selasa pagi (06/12) pukul 08.15 WIB, aktivitas membaca di ruang perpustakaan lantai dua mendadak gempar setelah petugas menemukan seekor kucing hutan langka (Prionailurus bengalensis) bersembunyi di balik rak buku ensiklopedia. Satwa liar dilindungi tersebut masuk ke kawasan sekolah karena habitat alaminya di lereng bukit belakang terganggu oleh proyek pembukaan lahan perkebunan. Dua petugas Balai Konservasi Sumber Daya Alam (BKSDA) yang tiba dengan peralatan jaring evakuasi berhasil mengamankan hewan dalam keadaan sehat dan tenang tanpa melukai pengunjung dalam waktu 45 menit, sebelum dipindahkan ke pusat rehabilitasi satwa.",
        clues: [
          { id: "c3-what", text: "Masuknya satwa liar dilindungi kucing hutan dan evakuasi aman oleh petugas konservasi", element: "what", label: "WHAT (Peristiwa konservasi apa yang terjadi?)" },
          { id: "c3-who", text: "Petugas perpustakaan sekolah, pengunjung ruang baca, dan 2 petugas evakuasi BKSDA", element: "who", label: "WHO (Siapa saksi penemu dan tim penyelamat?)" },
          { id: "c3-where", text: "Ruang perpustakaan lantai dua gedung utama sekolah", element: "where", label: "WHERE (Di mana satwa liar ditemukan?)" },
          { id: "c3-when", text: "Selasa pagi (06/12) pukul 08.15 WIB saat jam kunjungan literasi", element: "when", label: "WHEN (Kapan peristiwa penemuan berlangsung?)" },
          { id: "c3-why", text: "Satwa kehilangan habitat alami di lereng bukit akibat proyek pembukaan lahan perkebunan", element: "why", label: "WHY (Mengapa satwa liar masuk permukiman sekolah?)" },
          { id: "c3-how", text: "Petugas menyekat area ruangan, memakai jaring evakuasi khusus BKSDA, lalu memindahkan satwa ke rehabilitasi", element: "how", label: "HOW (Bagaimana mekanisme penyelamatannya?)" }
        ],
        distractors: [
          {
            id: "d3-mitos",
            text: "Beredar anggapan di kalangan siswa bahwa kucing tersebut jelmaan penunggu mistis pembawa sial ujian",
            element: "distractor_opinion",
            isDistractor: true,
            distractorType: "Mitos Takhayul Non-Faktual",
            distractorReason: "Jurnalisme sains berpijak pada fakta biologi dan konfirmasi BKSDA, bukan takhayul supranatural!"
          },
          {
            id: "d3-rutin",
            text: "Pengelola perpustakaan baru saja selesai merapikan 50 buku sejarah kemerdekaan di meja sirkulasi",
            element: "distractor_secondary",
            isDistractor: true,
            distractorType: "Aktivitas Rutin Tidak Relevan",
            distractorReason: "Kegiatan rutin menata buku tidak memiliki bobot berita dalam peristiwa evakuasi satwa liar!"
          },
          {
            id: "d3-lokasi",
            text: "Kandang penangkaran hewan peliharaan warga terletak 5 kilometer di luar kompleks sekolah",
            element: "distractor_location",
            isDistractor: true,
            distractorType: "Pengecoh Lokasi Luar TKP",
            distractorReason: "TKP utama adalah perpustakaan sekolah, bukan kandang warga yang letaknya jauh!"
          }
        ],
        debuffDistractors: [
          { id: "db3-fake1", text: "Petir menyambar siswa yang sedang bermain hujan-hujanan", element: "fake_hoax", label: "HOAKS JEBAKAN", isDistractor: true }
        ]
      },
      {
        id: "case-1d",
        caseNumber: 4,
        topic: "Kasus 4: Insiden Korsleting Listrik Panel Surya Rooftop Lab Biologi & Tanggap Darurat",
        reportText: "Rabu siang (19/10) pukul 11.45 WIB saat cuaca terik ekstrem, instalasi panel surya berkapasitas 5 kWp di atap Laboratorium Biologi SMA Cendekia mengalami korsleting akibat gigitan tupai liar pada kabel inverter sekunder. Asap pekat yang mulai mengepul memicu sirene alarm kebakaran gedung, sehingga sebanyak 48 siswa praktikum biologi bersama guru pembimbing langsung dievakuasi ke titik kumpul lapangan dalam tempo 3 menit oleh Tim K3 Sekolah. Dua armada mobil pemadam kebakaran sektor wilayah selatan tiba pada pukul 12.05 WIB dan berhasil melokalisasi percikan api memakai busa kimia sebelum merembet ke rangka plafon gedung, tanpa menimbulkan korban jiwa.",
        clues: [
          { id: "c4-what", text: "Korsleting instalasi panel surya 5 kWp di atap laboratorium dan evakuasi darurat tanpa korban jiwa", element: "what", label: "WHAT (Peristiwa darurat apa yang terjadi?)" },
          { id: "c4-who", text: "48 siswa praktikum biologi, guru pembimbing, Tim K3 Sekolah, dan 2 armada pemadam kebakaran", element: "who", label: "WHO (Siapa pihak yang dievakuasi dan tim pemadam?)" },
          { id: "c4-where", text: "Atap rooftop dan area Laboratorium Biologi SMA Cendekia", element: "where", label: "WHERE (Di mana lokasi kebakaran berlangsung?)" },
          { id: "c4-when", text: "Rabu siang (19/10) pukul 11.45 WIB saat jam praktikum berlangsung", element: "when", label: "WHEN (Kapan korsleting dan alarm berbunyi?)" },
          { id: "c4-why", text: "Kabel inverter sekunder terkelupas akibat gigitan tupai liar di atap saat cuaca terik ekstrem", element: "why", label: "WHY (Mengapa korsleting instalasi panel surya bisa terjadi?)" },
          { id: "c4-how", text: "Alarm berbunyi, siswa dievakuasi 3 menit ke lapangan, dan petugas pemadam mematikan api dengan busa kimia", element: "how", label: "HOW (Bagaimana alur evakuasi tanggap daruratnya?)" }
        ],
        distractors: [
          {
            id: "d4-opini",
            text: "Sejumlah warga sekitar berspekulasi bahwa ada siswa iseng yang merokok di pojok balkon laboratorium",
            element: "distractor_opinion",
            isDistractor: true,
            distractorType: "Opini Subjektif & Tuduhan Liar",
            distractorReason: "Spekulasi warga tanpa bukti terbantahkan oleh temuan fisik gigitan tupai liar pada kabel inverter!"
          },
          {
            id: "d4-redherring",
            text: "Tagihan rekening listrik PLN sekolah bulan lalu mengalami penurunan pengeluaran sebesar 15 persen",
            element: "distractor_secondary",
            isDistractor: true,
            distractorType: "Fakta Sekunder Tidak Relevan",
            distractorReason: "Penghematan tagihan listrik adalah fakta keuangan umum yang tidak menjelaskan sebab korsleting fisik panel surya!"
          },
          {
            id: "d4-hoax",
            text: "Beredar pesan rantai bahwa baterai panel surya sekolah meledak akibat gelombang panas senjata satelit",
            element: "distractor_hoax",
            isDistractor: true,
            distractorType: "Teori Konspirasi & Hoaks",
            distractorReason: "Teori konspirasi fiktif yang tidak memiliki dasar sains maupun konfirmasi petugas pemadam!"
          }
        ],
        debuffDistractors: [
          { id: "db4-fake1", text: "Panel surya dipasang untuk memanggil pesawat piring terbang alien", element: "fake_hoax", label: "HOAKS JEBAKAN", isDistractor: true }
        ]
      },
      {
        id: "case-1e",
        caseNumber: 5,
        topic: "Kasus 5: Skandal Peretasan Akun Media Sosial Resmi OSIS Menjelang Pemilihan Ketua OSIS",
        reportText: "Jumat malam (28/10) pukul 21.00 WIB, akun Instagram resmi OSIS yang memiliki 8.500 pengikut diretas oleh pihak anonim dan mengunggah poster kampanye hitam (black campaign) yang menyerang integritas Pasangan Calon (Paslon) Nomor Urut 2. Tim Siber Ekstrakurikuler Komputer bersama Pembina Kesiswaan bergerak cepat memulihkan kendali akun dalam tempo 2 jam melalui mekanisme reset darurat surat elektronik dan verifikasi dua langkah (2FA). Investigasi jejak digital log IP membuktikan peretasan terjadi akibat kelalaian staf humas OSIS yang mengklik tautan phishing survei palsu di perangkat ponsel pribadinya, bukan karena kebocoran peladen (server) sekolah.",
        clues: [
          { id: "c5-what", text: "Peretasan akun Instagram resmi OSIS dan penyebaran poster kampanye hitam menjelang pemilihan", element: "what", label: "WHAT (Peristiwa siber apa yang mencoreng pemilihan?)" },
          { id: "c5-who", text: "Tim Siber Komputer Sekolah, Pembina Kesiswaan, staf humas OSIS, dan peretas luar anonim", element: "who", label: "WHO (Siapa pihak korban, penindak, dan peretas?)" },
          { id: "c5-where", text: "Kanal digital media sosial Instagram resmi OSIS dan ruang sekretariat kesiswaan", element: "where", label: "WHERE (Di mana peretasan dan pemulihan akun berlangsung?)" },
          { id: "c5-when", text: "Jumat malam (28/10) pukul 21.00 WIB sepekan sebelum pemungutan suara", element: "when", label: "WHEN (Kapan aksi peretasan akun terdeteksi?)" },
          { id: "c5-why", text: "Staf humas terkecoh mengklik tautan phishing survei palsu di ponsel pribadi tanpa keamanan 2FA", element: "why", label: "WHY (Mengapa akun resmi OSIS bisa dibajak peretas?)" },
          { id: "c5-how", text: "Akun dipulihkan dalam 2 jam via email darurat, unggahan fitnah dihapus, dan log IP diserahkan ke kepala sekolah", element: "how", label: "HOW (Bagaimana langkah taktis pemulihannya?)" }
        ],
        distractors: [
          {
            id: "d5-opini",
            text: "Tim sukses Paslon 2 menuduh Paslon 1 sengaja menyewa tim hacker bayaran gelap untuk menjatuhkan elektabilitas",
            element: "distractor_opinion",
            isDistractor: true,
            distractorType: "Tuduhan Politik Subjektif",
            distractorReason: "Tuduhan rivalitas politik bukan fakta penyebab teknis hasil audit digital forensik pembina kesiswaan!"
          },
          {
            id: "d5-redherring",
            text: "Pita printer laser di ruang tata usaha sempat macet saat mencetak lembar tata tertib pemilihan",
            element: "distractor_secondary",
            isDistractor: true,
            distractorType: "Kendala Teknis Tidak Berhubungan",
            distractorReason: "Printer tata usaha macet tidak ada kaitannya dengan serangan rekayasa sosial phishing di media sosial!"
          },
          {
            id: "d5-hoax",
            text: "Beredar rumor liar bahwa server database nilai siswa di sekolah ikut disandera virus ransomware asing",
            element: "distractor_hoax",
            isDistractor: true,
            distractorType: "Kabar Burung Melebih-lebihkan",
            distractorReason: "Humas sekolah menegaskan server akademik sekolah terisolasi aman dan tidak tersentuh peretasan Instagram!"
          }
        ],
        debuffDistractors: [
          { id: "db5-fake1", text: "Peretas meminta uang tebusan berupa 100 kantong siomay kantin", element: "fake_hoax", label: "HOAKS JEBAKAN", isDistractor: true }
        ]
      }
    ]
  },

  // =========================================================================
  // TAHAP 2: ANATOMI STRUKTUR PIRAMIDA TERBALIK - 3 KASUS PENATAAN BERITA
  // Estimasi Waktu: ~10 - 12 Menit
  // =========================================================================
  {
    id: "stage-2-structure",
    number: 2,
    title: "Tahap 2: Struktur Berita (Piramida Terbalik)",
    subtitle: "Menata Hierarki 5 Tingkat Berita: Headline, Lead, Body, & Tail",
    badge: "Arsitek Struktur",
    color: "var(--color-accent-orange)",
    colorName: "orange",
    estimatedTime: "10-12 Menit",
    summary: "Pembaca berita menyerap informasi dari yang paling genting di puncak hingga informasi tambahan di dasar. Susun 5 balok paragraf berita tanpa label bantuan semata-mata mengandalkan kejelian analisis struktur naskah jurnalistik kalian!",
    cases: [
      {
        id: "struct-2a",
        caseNumber: 1,
        topic: "Kasus A: Sidak Pangan Berbahaya: Uji Sampel Saus Jajanan di Luar Pagar Positif Pewarna Tekstil",
        blocks: [
          {
            id: "s1-t1",
            level: 1,
            name: "Headline (Judul Utama)",
            text: "Uji Cepat Puskesmas Temukan Zat Pewarna Tekstil Berbahaya di Jajanan Luar Gerbang Sekolah",
            hint: "Paling ringkas, bernilai berita tinggi, langsung menyebut fakta paling mengejutkan."
          },
          {
            id: "s1-t2",
            level: 2,
            name: "Lead / Teras Berita (Poin Utama 5W+1H)",
            text: "Pemeriksaan mendadak oleh tim gabungan Puskesmas Kecamatan dan satgas sekolah pada Rabu (18/10) pagi membuktikan sampel saus pedagang keliling positif mengandung Rhodamin B, memicu pemberlakuan larangan keluar gerbang saat jam istirahat.",
            hint: "Paragraf pertama menjawab apa, siapa, di mana, kapan, dan akibat langsungnya secara padat."
          },
          {
            id: "s1-t3",
            level: 3,
            name: "Tubuh Berita Bagian 1 (Kronologi & Temuan Laboratorium)",
            text: "Dari 15 sampel makanan yang diuji menggunakan reagen kimia cepat di mobil laboratorium keliling, petugas menemukan konsentrasi pewarna kain sintetis pada saus cilok dan kerupuk pasir, yang langsung disita sebanyak 3 jeriken untuk dimusnahkan.",
            hint: "Rincian kronologi teknis dan data kuantitatif pendukung temuan lapangan."
          },
          {
            id: "s1-t4",
            level: 4,
            name: "Tubuh Berita Bagian 2 (Kutipan Resmi Otoritas Kesehatan)",
            text: "Kepala Puskesmas, dr. Hendrawan Sp.GK, menegaskan konsumsi zat pewarna tekstil secara kumulatif berisiko memicu kerusakan hati dan ginjal anak, sementara pihak sekolah berjanji memperketat pembinaan higienitas kantin internal.",
            hint: "Kutipan resmi otoritas yang memuat penjelasan medis, solusi, dan kebijakan lanjutan."
          },
          {
            id: "s1-t5",
            level: 5,
            name: "Ekor Berita (Informasi Tambahan / Riwayat Kasus)",
            text: "Catatan Unit Kesehatan Sekolah (UKS) mendata sebanyak empat siswa sempat mengeluhkan kram perut ringan usai jajan di lokasi yang sama pada Jumat pekan lalu.",
            hint: "Informasi pelengkap penutup yang jika dipotong redaksi tetap tidak merusak inti berita."
          }
        ]
      },
      {
        id: "struct-2b",
        caseNumber: 2,
        topic: "Kasus B: Inovasi Riset Siswa: Bioplastik Ramah Lingkungan Berbahan Pati Singkong Raih Medali Emas & Paten BRIN",
        blocks: [
          {
            id: "s2-t1",
            level: 1,
            name: "Headline (Judul Utama)",
            text: "Kembangkan Bioplastik Singkong Cepat Urai, Tiga Siswa Raih Emas dan Hak Paten Riset Inovasi",
            hint: "Puncak prestasi paling membanggakan dan ringkas."
          },
          {
            id: "s2-t2",
            level: 2,
            name: "Lead / Teras Berita (Poin Utama 5W+1H)",
            text: "Tiga siswa kelas 11 berhasil menyabet Medali Emas Olimpiade Penelitian Sains Nasional di Gedung BRIN Jakarta pada Minggu (23/10) berkat inovasi kantong bioplastik dari pati singkong yang mampu terurai tanah dalam 14 hari.",
            hint: "Menjawab siapa, meraih apa, di mana, kapan, dan nilai temuan utamanya."
          },
          {
            id: "s2-t3",
            level: 3,
            name: "Tubuh Berita Bagian 1 (Data Metodologi & Uji Teknis)",
            text: "Melalui uji laboratorium selama 6 bulan dengan mencampurkan pati singkong lokal, gliserol, dan kitosan kulit udang, formula polimer organik ini terbukti memiliki kekuatan tarik 28 MPa dan aman bagi mikroorganisme tanah saat terdegradasi.",
            hint: "Uraian jalannya pengujian ilmiah dan perolehan angka teknis."
          },
          {
            id: "s2-t4",
            level: 4,
            name: "Tubuh Berita Bagian 2 (Kutipan Langsung Peneliti Muda)",
            text: "Ketua tim peneliti, Nabila Putri (16), menuturkan bahwa gagasan riset berawal dari keprihatinan melihat timbulan sampah plastik kantin sekolah yang tidak pernah terurai selama puluhan tahun.",
            hint: "Kutipan langsung narasumber kunci mengenai inspirasi dan dedikasi."
          },
          {
            id: "s2-t5",
            level: 5,
            name: "Ekor Berita (Rencana Aplikasi & Standardisasi Lanjutan)",
            text: "Prototipe kantong bioplastik ini kini sedang diproses sertifikasi Standar Nasional Indonesia (SNI) sebelum diproduksi terbatas untuk kantin sekolah mitra pada semester genap mendatang.",
            hint: "Informasi jadwal agenda penutup dan tindak lanjut di masa depan."
          }
        ]
      },
      {
        id: "struct-2c",
        caseNumber: 3,
        topic: "Kasus C: Audit Akuntabilitas: Pemeriksaan Kas Pentas Seni Sekolah Temukan Selisih Pembukuan",
        blocks: [
          {
            id: "s3-t1",
            level: 1,
            name: "Headline (Judul Utama)",
            text: "Audit Independen Temukan Selisih Pembukuan Kas Pentas Seni Sekolah Senilai Belasan Juta Rupiah",
            hint: "Judul lugas, memuat temuan audit tanpa menghakimi secara berlebihan."
          },
          {
            id: "s3-t2",
            level: 2,
            name: "Lead / Teras Berita (Poin Utama 5W+1H)",
            text: "Hasil audit forensik tim auditor komite sekolah pada Senin (07/11) mengonfirmasi adanya selisih pembukuan dana tiket konser pentas seni sebesar Rp 14,5 juta antara sistem e-ticketing dan rekening penampung panitia.",
            hint: "Temuan audit apa, siapa yang memeriksa, kapan, dan berapa nominal selisihnya."
          },
          {
            id: "s3-t3",
            level: 3,
            name: "Tubuh Berita Bagian 1 (Rincian Mutasi Rekening & Bukti)",
            text: "Pemeriksaan mutasi rekening koran dan 450 lembar karcis masuk menunjukkan 29 transaksi transfer pembayaran tiket tidak tercatat dalam buku kas besar yang dikelola bendahara pelaksana kegiatan.",
            hint: "Rincian fakta temuan dokumen audit perbankan."
          },
          {
            id: "s3-t4",
            level: 4,
            name: "Tubuh Berita Bagian 2 (Kutipan Sikap Resmi Pihak Pembina)",
            text: "Pembina Kesiswaan, Drs. Mulyono M.Pd, menegaskan seluruh panitia inti telah menandatangani pakta pertanggungjawaban dan dana yang tertunda wajib disetorkan kembali ke rekening giro sekolah dalam tempo 3x24 jam.",
            hint: "Kutipan sikap pimpinan dan batas waktu penyelesaian secara institusional."
          },
          {
            id: "s3-t5",
            level: 5,
            name: "Ekor Berita (Rekomendasi Sistem Transparansi Nontunai)",
            text: "Komite sekolah merekomendasikan transisi penuh ke sistem gerbang pembayaran nontunai terverifikasi (cashless QRIS) untuk seluruh kegiatan kesiswaan di masa mendatang guna menjamin transparansi mutlak.",
            hint: "Rekomendasi teknis jangka panjang penutup berita."
          }
        ]
      },
      {
        id: "struct-2d",
        caseNumber: 4,
        topic: "Kasus D: Prestasi Robotik Maritim: Tim Siswa Ciptakan Robot Apung Pembersih Sampah Danau Berdaya Surya",
        blocks: [
          {
            id: "s4-t1",
            level: 1,
            name: "Headline (Judul Utama)",
            text: "Ciptakan Robot Apung Pembersih Sampah Berdaya Surya, Tiga Siswa SMK Raih Juara Inovasi Maritim",
            hint: "Paling ringkas, bernilai berita tinggi, memuat pencapaian inovasi dan subjek juara."
          },
          {
            id: "s4-t2",
            level: 2,
            name: "Lead / Teras Berita (Poin Utama 5W+1H)",
            text: "Tiga siswa SMKN 2 berhasil meraih Juara 1 Kontes Robot Maritim Nasional di Surabaya pada Selasa (15/11) berkat inovasi perahu nirawak bertenaga surya yang mampu membersihkan sampah plastik dan eceng gondok danau secara otomatis.",
            hint: "Paragraf pembuka menjawab siapa, meraih apa, di mana, kapan, dan nilai temuan utamanya."
          },
          {
            id: "s4-t3",
            level: 3,
            name: "Tubuh Berita Bagian 1 (Spesifikasi Teknis & Kapasitas)",
            text: "Dilengkapi sensor ultrasonik navigasi, konveyor jaring kawat, dan panel fotovoltaik 100 watt, robot bernama 'AquaCleaner V-1' ini sanggup menyaring hingga 25 kilogram sampah mengapung per jam tanpa menghasilkan emisi karbon.",
            hint: "Rincian spesifikasi teknis mesin, komponen, dan angka kapasitas operasional."
          },
          {
            id: "s4-t4",
            level: 4,
            name: "Tubuh Berita Bagian 2 (Kutipan Langsung Ketua Tim Inovator)",
            text: "Ketua tim inovator, Arya Prasetya (17), menjelaskan bahwa rancang bangun robot memakan waktu 4 bulan menggunakan 70 persen material aluminium daur ulang dengan sistem kemudi jarak jauh berbasis gawai pintar.",
            hint: "Kutipan langsung pengembang tentang durasi perakitan, bahan ramah lingkungan, dan sistem kontrol."
          },
          {
            id: "s4-t5",
            level: 5,
            name: "Ekor Berita (Rencana Uji Coba Lanjutan di Waduk Kota)",
            text: "Dinas Lingkungan Hidup Kota berencana menjalin kerja sama uji coba percontohan armada robot ini di waduk resapan kota pada awal semester genap mendatang.",
            hint: "Informasi prospek masa depan dan agenda kemitraan penutup berita."
          }
        ]
      },
      {
        id: "struct-2e",
        caseNumber: 5,
        topic: "Kasus E: Kebijakan Baru Zero Waste: Larangan Total Kemasan Plastik Sekali Pakai di Lingkungan Sekolah",
        blocks: [
          {
            id: "s5-t1",
            level: 1,
            name: "Headline (Judul Utama)",
            text: "Wujudkan Sekolah Bebas Sampah, Larangan Kemasan Plastik Sekali Pakai Resmi Diberlakukan Penuh",
            hint: "Judul padat, memuat ketegasan kebijakan lingkungan dan tujuan institusi."
          },
          {
            id: "s5-t2",
            level: 2,
            name: "Lead / Teras Berita (Poin Utama 5W+1H)",
            text: "Mulai Senin (05/12), SMP Negeri 3 resmi memberlakukan larangan total pemakaian kantong kresek, sedotan plastik, dan styrofoam di seluruh area kantin serta kelas guna menekan timbulan sampah harian sekolah.",
            hint: "Menjelaskan tanggal berlaku, nama sekolah, larangan apa saja yang ditegakkan, dan tujuannya."
          },
          {
            id: "s5-t3",
            level: 3,
            name: "Tubuh Berita Bagian 1 (Data Volume Sampah & Kewajiban Bawa Tumbler)",
            text: "Sebelum aturan diberlakukan, sekolah menghasilkan rata-rata 110 kilogram sampah plastik per hari, sehingga pihak sekolah kini mewajibkan 650 murid membawa kotak bekal dan botol minum tumbler mandiri dari rumah.",
            hint: "Data kuantitatif volume sampah sebelum aturan dan kewajiban baru siswa."
          },
          {
            id: "s5-t4",
            level: 4,
            name: "Tubuh Berita Bagian 2 (Kutipan Komitmen Kepala Sekolah & Sanksi Edukatif)",
            text: "Kepala Sekolah, Dra. Hj. Nurul Hidayati M.Pd, menegaskan bahwa pedagang kantin yang masih menggunakan plastik sekali pakai akan diberi peringatan tertulis, sedangkan siswa pelanggar diarahkan menyetor kompos tanaman organik.",
            hint: "Pernyataan resmi pimpinan tentang sanksi edukatif bagi pedagang maupun siswa."
          },
          {
            id: "s5-t5",
            level: 5,
            name: "Ekor Berita (Fasilitas Dispenser Air Minum Terfiltrasi Gratis)",
            text: "Guna mendukung transisi ini, pihak sekolah telah memasang 8 unit dispenser stasiun air minum terfiltrasi gratis bersertifikasi laboratorium di setiap selasar koridor gedung.",
            hint: "Rincian fasilitas pendukung penutup berita yang melengkapi kebijakan utama."
          }
        ]
      }
    ]
  },

  // =========================================================================
  // TAHAP 3: MENULIS BERITA UTUH DI MEJA REDAKSI - 5 TAHAP PENULISAN MENDALAM
  // Estimasi Waktu: ~12 - 15 Menit
  // =========================================================================
  {
    id: "stage-3-writing",
    number: 3,
    title: "Tahap 3: Menulis Berita Utuh Siap Terbit",
    subtitle: "Merakit Naskah Berita dari Lapangan hingga Cetak di Koran Sekolah",
    badge: "Pemimpin Redaksi",
    color: "var(--color-accent-green)",
    colorName: "green",
    estimatedTime: "12-15 Menit",
    summary: "Saatnya kelompok membuktikan diri sebagai jurnalis profesional! Hadapi 5 gerbang penyuntingan kritis: merakit lead tanpa buried lead, menyeleksi kutipan berimbang bebas false balance, pembersihan kata mubazir & EYD baku, headline berbobot non-clickbait, serta penegakan etika perlindungan privasi anak!",
    variations: [
      {
        variationIndex: 0,
        topic: "Variasi 1: Presensi Pintar Pemindai Wajah (Face Recognition) AI di Gerbang Sekolah",
        challenges: [
          {
            id: "w1",
            stepNumber: 1,
            stepTitle: "Langkah 1: Merakit Teras Berita (Lead) - Menghindari Buried Lead & Editorializing",
            context: "Kasus: Peluncuran Sistem Presensi Pintar Pemindai Wajah (Face Recognition) di Gerbang Sekolah.",
            rawFacts: "Fakta: Tanggal 12 November pagi, 720 siswa, kamera kecerdasan buatan di gerbang utama, notifikasi instan ke ponsel orang tua guna memangkas keterlambatan dan menjaga keamanan.",
            prompt: "Pilih draf Teras Berita (Lead) yang paling mematuhi kaidah jurnalistik (padat 5W+1H, objektif, dan tidak menenggelamkan fakta utama):",
            options: [
              {
                text: "Guna meningkatkan kedisiplinan dan keamanan siswa, SMP Negeri 2 resmi mengoperasikan sistem presensi pemindai wajah otomatis berbasis kecerdasan buatan bagi 720 siswa di gerbang utama sekolah mulai Senin (12/11) pagi.",
                isCorrect: true,
                explanation: "Sempurna! Menjawab Who (SMPN 2 & 720 siswa), What (presensi pemindai wajah AI), Where (gerbang utama), When (Senin 12/11 pagi), Why (disiplin dan keamanan) secara padat tanpa kata mubazir."
              },
              {
                text: "Di tengah langit pagi yang cerah dan dipayungi pepohonan rindang di jalan protokol kota, Kepala Sekolah menyampaikan pidato sambutan panjang sebelum akhirnya 720 siswa mencoba kamera pemindai wajah di gerbang.",
                isCorrect: false,
                explanation: "Salah (Buried Lead): Menenggelamkan peristiwa teknologi penting dengan deskripsi cuaca puitis dan seremoni pidato yang tidak relevan bagi pembaca."
              },
              {
                text: "Menerapkan kebijakan yang sangat merepotkan dan membuat siswa cemas, pihak sekolah nekat memasang kamera pemindai wajah di gerbang utama pada Senin (12/11).",
                isCorrect: false,
                explanation: "Salah (Editorializing): Menyisipkan opini prasangka dan penghakiman emosional pribadi wartawan ('sangat merepotkan dan membuat cemas') sebelum ada evaluasi objektif."
              },
              {
                text: "Ada sistem kamera baru buatan lokal yang baru saja dipasang di gerbang sekolah kemarin untuk siswa.",
                isCorrect: false,
                explanation: "Salah (Miskin Fakta 5W+1H): Terlalu datar, tidak menyebutkan identitas sekolah, jumlah siswa, waktu spesifik, maupun tujuan fungsional teknologi tersebut."
              }
            ],
            debuffOptions: [
              {
                text: "Kabar burung beredar bahwa sistem kamera gerbang sekolah diam-diam memindai isi dompet setiap murid yang lewat.",
                isCorrect: false,
                explanation: "Salah: Hoaks konyol hasil debuff rival yang wajib dibuang dari naskah!"
              }
            ]
          },
          {
            id: "w2",
            stepNumber: 2,
            stepTitle: "Langkah 2: Menyeleksi Kutipan Berimbang (Cover Both Sides) - Menghindari False Balance & Manipulasi Konteks",
            context: "Situasi: Timbul kekhawatiran dari sebagian wali murid terkait privasi data biometrik wajah siswa, sementara tim IT sekolah memastikan keamanan data terenkripsi luring.",
            rawFacts: "Narasumber: Koordinator Tim IT Sekolah (Rahmat M.Kom) dan Ketua Komite Perwakilan Wali Murid (Ibu Ratna).",
            prompt: "Bagaimana cara tim redaksi menyusun kutipan narasumber agar adil, profesional, berimbang, dan tidak menimbulkan kegaduhan tanpa dasar?",
            options: [
              {
                text: "Menyandingkan jaminan Koordinator IT bahwa data biometrik dienkripsi di server lokal luring tanpa akses internet publik dengan aspirasi komite wali murid yang meminta audit berkala perlindungan data anak.",
                isCorrect: true,
                explanation: "Luar biasa! Inilah mahkota jurnalisme berimbang (Cover Both Sides): menyajikan konfirmasi teknis resmi bersanding dengan aspirasi publik secara konstruktif dan proporsional."
              },
              {
                text: "Memberikan porsi yang sama besar antara penjelasan ahli siber bersertifikasi resmi dengan klaim rumor anonim di grup WhatsApp bahwa data wajah siswa dijual ke sindikat pinjaman online.",
                isCorrect: false,
                explanation: "Salah (False Balance): Jurnalisme dilarang menyejajarkan fakta terverifikasi dengan hoaks atau teori konspirasi tanpa bukti demi dalih keseimbangan semu."
              },
              {
                text: "Hanya mengutip penggalan kalimat wali murid yang terdengar marah saat wawancara awal, dan sengaja membuang bagian saat wali murid tersebut mengapresiasi tujuan keamanan presensi.",
                isCorrect: false,
                explanation: "Salah (Cherry-Picking): Memotong kutipan di luar konteks demi memantik sensasi permusuhan melanggar kode etik kejujuran naskah."
              },
              {
                text: "Menghapus seluruh kutipan kedua narasumber dan menggantinya dengan ceramah panjang dari wartawan tentang kecanggihan era digital.",
                isCorrect: false,
                explanation: "Salah: Wartawan bertugas memotret fakta dan suara para pemangku kepentingan, bukan menggurui pembaca."
              }
            ],
            debuffOptions: [
              {
                text: "Membuat kutipan fiktif bahwa Kepala Sekolah mengancam mengeluarkan siswa yang enggan dipindai wajahnya.",
                isCorrect: false,
                explanation: "Salah: Fitnah keji hasil debuff kelompok lawan!"
              }
            ]
          },
          {
            id: "w3",
            stepNumber: 3,
            stepTitle: "Langkah 3: Meja Bahasa (Copy Editing) - EYD Edisi V, Pleonasme & Istilah Baku Jurnalistik",
            context: "Draf mentah reporter: 'Pada saat ketika rapat koordinasi yang sungguh amat sangat alot sekali kemarin, kepala sekolah merubah aturan demi untuk meminimalisir resiko keterlambatan siswa.'",
            rawFacts: "Tugas Korektor: Singkirkan pleonasme kata mubazir, perbaiki bentuk kata tidak baku, dan tegakkan kalimat efektif hemat kata.",
            prompt: "Pilih hasil penyuntingan (copy editing) yang 100% mematuhi kaidah tata bahasa Indonesia jurnalistik baku (EYD V):",
            options: [
              {
                text: "Dalam rapat koordinasi yang berlangsung alot kemarin, kepala sekolah mengubah aturan guna meminimalkan risiko keterlambatan siswa.",
                isCorrect: true,
                explanation: "Sempurna! Padat, lugas, mengeliminasi pleonasme ('pada saat ketika', 'sungguh amat sangat... sekali'), serta membetulkan kata tidak baku: 'merubah' -> 'mengubah', 'meminimalisir' -> 'meminimalkan', 'demi untuk' -> 'guna', dan 'resiko' -> 'risiko'."
              },
              {
                text: "Dalam rapat koordinasi yang alot kemarin, kepala sekolah merubah aturan demi meminimalisir resiko keterlambatan siswa.",
                isCorrect: false,
                explanation: "Salah: Masih mempertahankan tiga bentuk kata tidak baku: 'merubah' (seharusnya 'mengubah'), 'meminimalisir' (seharusnya 'meminimalkan'), dan 'resiko' (seharusnya 'risiko')."
              },
              {
                text: "Pada saat rapat koordinasi kemarin, kepala sekolah mengubah aturan demi untuk meminimalkan risiko keterlambatan siswa.",
                isCorrect: false,
                explanation: "Salah: Masih memuat pleonasme ganda 'demi untuk' yang merupakan pemborosan kata dalam kalimat efektif."
              },
              {
                text: "Kemarin rapat koordinasi alot diadakan di mana kepala sekolah merubah aturan untuk risiko keterlambatan diminimalisir.",
                isCorrect: false,
                explanation: "Salah: Menggunakan pola serapan rancu 'di mana' sebagai penghubung dan struktur kalimat pasif yang tidak efektif."
              }
            ],
            debuffOptions: [
              {
                text: "Kemarin kepala sekolah bersemedi di ruang guru agar supaya arwah leluhur merestui presensi.",
                isCorrect: false,
                explanation: "Salah: Debuff takhayul hasil gangguan rival!"
              }
            ]
          },
          {
            id: "w4",
            stepNumber: 4,
            stepTitle: "Langkah 4: Meracik Judul Berita Utama (Headline) - Uji Anti-Clickbait & Akurasi Fakta",
            context: "Judul akan dicetak di halaman muka koran mading sekolah dan dibaca seluruh siswa, dewan guru, serta pengawas pendidikan.",
            rawFacts: "Inti: Presensi pemindai wajah resmi berjalan untuk 720 siswa, data dienkripsi offline di server lokal, komite sepakat dengan pengawasan berkala.",
            prompt: "Tentukan judul berita utama yang memiliki nilai berita tinggi, berbobot, akurat, bermartabat, dan bebas unsur clickbait:",
            options: [
              {
                text: "Terapkan Presensi Pemindai Wajah Berenkripsi Offline, SMPN 2 Pastikan Data 720 Siswa Terlindungi",
                isCorrect: true,
                explanation: "Judul standar emas: subjek-predikat aktif, mencerminkan akurasi 100%, berbobot berita tinggi, dan menjawab substansi kekhawatiran publik tanpa sensasionalisme."
              },
              {
                text: "Bikin Tercengang! Benda Canggih di Gerbang SMPN 2 Ini Bikin Siswa Gak Bisa Berkutik, Orang Tua Langsung Syok!",
                isCorrect: false,
                explanation: "Salah (Clickbait Murahan): Menyembunyikan nama teknologi pokok dan mengeksploitasi kata emosi lebay ('tercengang', 'syok', 'gak bisa berkutik') yang merendahkan integritas pers sekolah."
              },
              {
                text: "Sistem Presensi Siswa di SMPN 2 Kini Telah Mengalami Perkembangan Baru",
                isCorrect: false,
                explanation: "Salah (Terlalu Datar & Pasif): Tidak memuat unsur teknologi pemindai wajah dan kehilangan daya tarik berita."
              },
              {
                text: "Diduga Melanggar Privasi Anak, Penggunaan Sensor Wajah di SMPN 2 Menuai Polemik Panas",
                isCorrect: false,
                explanation: "Salah (Trial by the Press): Menghakimi sepihak dan memutarbalikkan fakta bahwa sistem telah disetujui komite sekolah dengan enkripsi lokal teruji."
              }
            ],
            debuffOptions: [
              {
                text: "VIRALKAN! Skandal Terbesar di Gerbang Sekolah Ini Bakal Bikin Kamu Merinding Disko!",
                isCorrect: false,
                explanation: "Salah: Judul sampah hasil debuff kelompok lawan!"
              }
            ]
          },
          {
            id: "w5",
            stepNumber: 5,
            stepTitle: "Langkah 5: Penegakan Kode Etik Jurnalistik (KEJ) & Perlindungan Identitas Anak",
            context: "Kasus Etika: Dalam peliputan berita penegakan ketertiban di sekolah, seorang siswa berusia 14 tahun kedapatan membawa petasan ke area lorong dan sedang menjalani bimbingan konseling oleh guru BP.",
            rawFacts: "Landasan Hukum: Pasal 5 Kode Etik Jurnalistik (KEJ) menetapkan bahwa wartawan tidak menyebutkan identitas anak yang menjadi pelaku atau korban pelanggaran hukum/disiplin.",
            prompt: "Bagaimana tim redaksi wajib memperlakukan identitas dan dokumentasi visual siswa tersebut dalam naskah berita demi mematuhi Kode Etik Jurnalistik?",
            options: [
              {
                text: "Wajib menyamarkan nama lengkap siswa menjadi inisial (misal: AN, 14 tahun), memburamkan (blur) wajah siswa pada foto dokumentasi, dan tidak menyebutkan nomor ruang kelas spesifik.",
                isCorrect: true,
                explanation: "Sempurna! Mematuhi Pasal 5 KEJ dan Undang-Undang Perlindungan Anak: identitas anak di bawah umur yang berhadapan dengan masalah disiplin/hukum wajib dilindungi demi masa depan psikologisnya."
              },
              {
                text: "Mencantumkan nama lengkap siswa, nomor induk siswa (NISN), dan akun media sosialnya agar menjadi efek jera bagi siswa lain di sekolah.",
                isCorrect: false,
                explanation: "Salah Fatal: Melanggar Pasal 5 KEJ dan UU Perlindungan Anak! Media massa dan pers sekolah bukan panggung untuk mempermalukan atau merundung anak di bawah umur."
              },
              {
                text: "Menyebutkan nama lengkap siswa di tubuh berita tetapi hanya menyamarkan wajah dengan memberi garis hitam tipis pada bagian mata di foto.",
                isCorrect: false,
                explanation: "Salah: Garis mata tipis adalah ilusi sensor yang tidak sah jika nama lengkap dan atribut seragam tetap dibeberkan secara vulgar."
              },
              {
                text: "Menyamarkan nama siswa tetapi mencantumkan nama lengkap kedua orang tuanya dan alamat rumah tempat tinggal siswa secara rinci.",
                isCorrect: false,
                explanation: "Salah: Membeberkan nama orang tua dan alamat rumah sama saja dengan membuka identitas anak ke lingkungan sosial sekitarnya."
              }
            ],
            debuffOptions: [
              {
                text: "Menyiarkan rekaman suara tangisan siswa saat diinterogasi ke pengeras suara sekolah.",
                isCorrect: false,
                explanation: "Salah: Pelanggaran etika berat hasil debuff rival!"
              }
            ]
          }
        ]
      },
      {
        variationIndex: 1,
        topic: "Variasi 2: Ekskavasi Arkeologi: Penemuan Benda Cagar Budaya Guci Kuno di Lapangan Upacara Sekolah",
        challenges: [
          {
            id: "v2_w1",
            stepNumber: 1,
            stepTitle: "Langkah 1: Merakit Teras Berita (Lead) - Menghindari Buried Lead & Editorializing",
            context: "Kasus: Penemuan Guci Keramik Kuno Abad ke-14 Saat Penggalian Saluran Air di Lapangan SMPN 4.",
            rawFacts: "Fakta: Kamis (17/11) pukul 09.30 WIB, pekerja proyek galian menemukan guci utuh pada kedalaman 1,5 meter, Balai Pelestarian Kebudayaan (BPK) turun tangan mengamankan lokasi dan proyek dialihkan.",
            prompt: "Pilih draf Teras Berita (Lead) yang paling mematuhi kaidah jurnalistik padat 5W+1H dan objektif:",
            options: [
              {
                text: "Pekerja proyek drainase lapangan SMP Negeri 4 menemukan sebuah guci keramik kuno abad ke-14 pada kedalaman 1,5 meter pada Kamis (17/11) pagi, memicu penghentian sementara pekerjaan galian oleh Balai Pelestarian Kebudayaan demi ekskavasi penyelamatan cagar budaya.",
                isCorrect: true,
                explanation: "Sempurna! Menjawab Who (pekerja & SMPN 4), What (penemuan guci keramik cagar budaya), Where (lapangan SMPN 4), When (Kamis 17/11 pagi), Why/How (penghentian sementara oleh BPK demi penyelamatan cagar budaya) secara lugas dan terverifikasi."
              },
              {
                text: "Di bawah terik matahari pagi yang menyengat diiringi deru suara mesin bor yang bising memekakkan telinga, para kuli bangunan terus mencangkul tanah berlumpur hingga ujung cangkul mengenai benda keras misterius.",
                isCorrect: false,
                explanation: "Salah (Buried Lead): Terlalu mendramatisasi cuaca dan suasana lapangan (flowery prose) yang menenggelamkan fakta sejarah ditemukannya artefak penting."
              },
              {
                text: "Akibat kelalaian pihak sekolah yang nekat menggali lapangan bersejarah tanpa izin para tetua adat, benda pusaka keramat akhirnya terbongkar paksa pada Kamis (17/11).",
                isCorrect: false,
                explanation: "Salah (Editorializing & Mitos): Menyudutkan pihak sekolah secara sepihak dan menyisipkan bumbu mistis yang bertentangan dengan jurnalisme sains."
              },
              {
                text: "Ada benda gerabah lama peninggalan orang zaman dulu yang berhasil diangkat dari dalam tanah sekolah kemarin.",
                isCorrect: false,
                explanation: "Salah (Miskin Fakta 5W+1H): Sangat hambar, tidak memuat nama instansi sekolah, estimasi abad artefak, waktu spesifik, dan keterlibatan instansi purbakala."
              }
            ],
            debuffOptions: [
              {
                text: "Guci tersebut dikabarkan mengeluarkan cahaya biru di malam hari dan berisi emas lantakan jin.",
                isCorrect: false,
                explanation: "Salah: Hoaks mistis hasil debuff tim lawan!"
              }
            ]
          },
          {
            id: "v2_w2",
            stepNumber: 2,
            stepTitle: "Langkah 2: Menyeleksi Kutipan Berimbang (Cover Both Sides) - Menghindari False Balance & Manipulasi Konteks",
            context: "Situasi: Kontraktor cemas penyelesaian revitalisasi lapangan terlambat menjelang Hari Guru, sedangkan Arkeolog BPK menegaskan perlindungan cagar budaya dilindungi UU No. 11 Tahun 2010.",
            rawFacts: "Narasumber: Arkeolog Madya BPK (Drs. Bambang Sulistyo) dan Mandor Proyek Sekolah (Pak Joko Prayitno).",
            prompt: "Pilih perakitan kutipan narasumber yang paling profesional, proporsional, dan adil (Cover Both Sides):",
            options: [
              {
                text: "Menyajikan penegasan Arkeolog BPK mengenai kewajiban undang-undang mengamankan area ekskavasi bersanding dengan komitmen pihak kontraktor yang merevisi zonasi kerja agar renovasi lapangan tetap rampung tepat waktu.",
                isCorrect: true,
                explanation: "Standar emas Cover Both Sides! Menyajikan mandat hukum perlindungan cagar budaya secara harmonis dengan solusi kompromi teknis kontraktor tanpa memantik prasangka."
              },
              {
                text: "Menyejajarkan hasil uji laboratorium penanggalan karbon arkeolog dengan ramalan seorang paranormal desa yang mengeklaim guci tersebut berisi kutukan kuno.",
                isCorrect: false,
                explanation: "Salah (False Balance): Mengimbangi penelitian ilmiah arkeologi dengan takhayul mistis adalah bentuk keseimbangan palsu yang merusak nalar publik."
              },
              {
                text: "Hanya merekam kekesalan mandor yang mengeluh upah tukang membengkak, dan membuang pernyataan pihak sekolah yang menyambut gembira temuan edukatif tersebut.",
                isCorrect: false,
                explanation: "Salah (Cherry-Picking): Memilah kutipan konfrontatif demi sensasi memecah belah komunitas sekolah."
              },
              {
                text: "Menghapus seluruh pernyataan arkeolog dan menggantinya dengan teori wartawan tentang harta karun kerajaan majapahit.",
                isCorrect: false,
                explanation: "Salah: Wartawan bertugas merekam suara otoritas yang kompeten, bukan berhalusinasi sejarah."
              }
            ],
            debuffOptions: [
              {
                text: "Menulis kutipan palsu bahwa mandor proyek mengancam akan menghancurkan guci dengan palu godam.",
                isCorrect: false,
                explanation: "Salah: Fitnah hasutan hasil debuff lawan!"
              }
            ]
          },
          {
            id: "v2_w3",
            stepNumber: 3,
            stepTitle: "Langkah 3: Meja Bahasa (Copy Editing) - EYD Edisi V, Pleonasme & Istilah Baku Jurnalistik",
            context: "Draf mentah reporter: 'Pada saat ketika proses ekskavasi yang mana sungguh amat sangat sakral sekali kemarin, tim arkeolog merubah metode demi untuk meminimalisir kerusakan terhadap obyek cagar budaya.'",
            rawFacts: "Tugas Korektor: Lenyapkan pleonasme mubazir, ubah kata tidak baku ('merubah', 'meminimalisir', 'obyek', 'di mana'), dan tegakkan EYD V baku.",
            prompt: "Pilih hasil penyuntingan (copy editing) yang 100% tepat sesuai EYD V:",
            options: [
              {
                text: "Dalam proses ekskavasi yang berlangsung cermat kemarin, tim arkeolog mengubah metode guna meminimalkan kerusakan terhadap objek cagar budaya.",
                isCorrect: true,
                explanation: "Sempurna! Mengoreksi kata tidak baku: 'merubah' -> 'mengubah', 'meminimalisir' -> 'meminimalkan', 'obyek' -> 'objek', serta melenyapkan pleonasme 'pada saat ketika' dan 'sungguh amat sangat... sekali'."
              },
              {
                text: "Dalam proses ekskavasi yang sakral kemarin, tim arkeolog merubah metode demi meminimalisir kerusakan terhadap obyek cagar budaya.",
                isCorrect: false,
                explanation: "Salah: Masih memuat tiga kata tidak baku: 'merubah' (seharusnya 'mengubah'), 'meminimalisir' (seharusnya 'meminimalkan'), dan 'obyek' (seharusnya 'objek')."
              },
              {
                text: "Pada saat proses ekskavasi kemarin, tim arkeolog mengubah metode demi untuk meminimalkan kerusakan objek cagar budaya.",
                isCorrect: false,
                explanation: "Salah: Masih mengandung pleonasme pemborosan frasa ganda 'demi untuk'."
              },
              {
                text: "Proses ekskavasi diadakan kemarin di mana tim arkeolog merubah metode untuk kerusakan objek cagar budaya diminimalisir.",
                isCorrect: false,
                explanation: "Salah: Struktur kalimat pasif rancu yang menyalahgunakan kata sambung serapan 'di mana'."
              }
            ],
            debuffOptions: [
              {
                text: "Pekerja menaburkan garam dan membakar dupa kemenyan agar arwah keramik tidak gelisah.",
                isCorrect: false,
                explanation: "Salah: Debuff takhayul hasil gangguan rival!"
              }
            ]
          },
          {
            id: "v2_w4",
            stepNumber: 4,
            stepTitle: "Langkah 4: Meracik Judul Berita Utama (Headline) - Uji Anti-Clickbait & Akurasi Fakta",
            context: "Judul akan menghiasi koran edisi khusus mading sekolah dan portal berita komunitas pendidikan daerah.",
            rawFacts: "Inti: Guci keramik abad ke-14 ditemukan sedalam 1,5 meter di lapangan SMPN 4, Balai Kebudayaan lakukan pengamanan cagar budaya, renovasi lapangan dialihkan tanpa pembatalan upacara.",
            prompt: "Pilih judul utama yang berwibawa, akurat, informatif, dan bebas dari teknik murahan clickbait:",
            options: [
              {
                text: "Temukan Guci Keramik Abad ke-14 di Lapangan Upacara, SMPN 4 Gandeng Balai Kebudayaan Amankan Cagar Budaya",
                isCorrect: true,
                explanation: "Judul standar pers kredibel: memuat subjek, objek arkeologi, waktu abad sejarah, dan kemitraan resmi perlindungan tanpa bumbu sensasional."
              },
              {
                text: "BUMI BERGOYANG! Lapangan Sekolah SMPN 4 Dibelah Dua, Benda Purbakala Muncul Bikin Seluruh Warga Merinding!",
                isCorrect: false,
                explanation: "Salah (Clickbait Murahan): Memakai huruf kapital lebay dan metafora histeris ('bumi bergoyang', 'merinding') yang mencoreng keseriusan pers sekolah."
              },
              {
                text: "Ada Barang Antik Ditemukan di Lapangan SMPN 4 Saat Pekerja Menggali Parit",
                isCorrect: false,
                explanation: "Salah (Terlalu Datar & Pasif): Menggunakan istilah remeh 'barang antik' alih-alih nilai penting 'cagar budaya abad ke-14'."
              },
              {
                text: "Akibat Proyek Drainase Ceroboh, Lapangan Sekolah Kini Terancam Disita Oleh Pemerintah Pusat",
                isCorrect: false,
                explanation: "Salah (Trial by the Press / Sensasional): Menghakimi sekolah dan membuat klaim palsu penyitaan yang tidak pernah dikatakan BPK."
              }
            ],
            debuffOptions: [
              {
                text: "HARTA KARUN EMAS MILYARAN RUPIAH DITEMUKAN DI SEKOLAH, CEK FOTONYA SEKARANG!",
                isCorrect: false,
                explanation: "Salah: Judul sampah pembohong hasil sabotase lawan!"
              }
            ]
          },
          {
            id: "v2_w5",
            stepNumber: 5,
            stepTitle: "Langkah 5: Penegakan Kode Etik Jurnalistik (KEJ) & Perlindungan Identitas Anak",
            context: "Kasus Etika: Seorang siswa kelas 7 (13 tahun) sempat mengambil serpihan kecil pecahan gerabah dari bibir lubang galian karena ingin mengoleksinya, namun langsung menyerahkannya kembali setelah dinasihati guru BP.",
            rawFacts: "Landasan Hukum: Pasal 5 KEJ mewajibkan wartawan tidak membuka identitas anak di bawah umur yang tersangkut tindakan indisipliner atau pelanggaran hukum.",
            prompt: "Bagaimana sikap redaksi berita sekolah yang mematuhi Pasal 5 KEJ dan Undang-Undang Perlindungan Anak?",
            options: [
              {
                text: "Wajib menyamarkan nama siswa menjadi inisial (misal: RA, 13 tahun), memburamkan wajah siswa pada foto, dan memfokuskan ulasan pada pesan edukasi literasi cagar budaya bagi generasi muda.",
                isCorrect: true,
                explanation: "Sempurna! Mematuhi Pasal 5 KEJ: melindungi masa depan mental siswa di bawah umur dan mentransformasi insiden menjadi sarana edukasi positif."
              },
              {
                text: "Mempublikasikan nama lengkap siswa beserta nomor induk siswa dan foto close-up wajahnya di mading sekolah agar siswa lain tidak meniru mengambil barang galian.",
                isCorrect: false,
                explanation: "Salah Fatal: Melanggar Pasal 5 KEJ dan UU Perlindungan Anak! Mading pers sekolah dilarang menjadi sarana perundungan institusional terhadap anak."
              },
              {
                text: "Menyamarkan wajah siswa dengan garis sensor tipis di mata, namun mencantumkan nama lengkap kedua orang tuanya dan nomor telepon wali murid.",
                isCorrect: false,
                explanation: "Salah: Membeberkan data orang tua sama saja membuka identitas keluarga anak ke publik (doxing tidak etis)."
              },
              {
                text: "Membuat judul berita bombastis yang menyebut siswa tersebut sebagai gembong sindikat penyelundup benda purbakala.",
                isCorrect: false,
                explanation: "Salah: Fitnah pencemaran nama baik yang keji dan melanggar kode etik dasar jurnalistik."
              }
            ],
            debuffOptions: [
              {
                text: "Menyiarkan video interogasi siswa yang sedang menangis tersedu-sedu ke akun TikTok sekolah.",
                isCorrect: false,
                explanation: "Salah: Eksploitasi kekerasan psikologis anak hasil debuff lawan!"
              }
            ]
          }
        ]
      },
      {
        variationIndex: 2,
        topic: "Variasi 3: Evaluasi Kebugaran & Akademik: Polemik Uji Coba Jam Masuk Sekolah Pukul 06.00 Pagi",
        challenges: [
          {
            id: "v3_w1",
            stepNumber: 1,
            stepTitle: "Langkah 1: Merakit Teras Berita (Lead) - Menghindari Buried Lead & Editorializing",
            context: "Kasus: Pelaksanaan Pekan Pertama Uji Coba Kebijakan Jam Masuk Sekolah Pukul 06.00 Pagi di SMA Negeri 1.",
            rawFacts: "Fakta: Pekan pertama uji coba mencatat tingkat kehadiran 89 persen pada 640 siswa, dinas pendidikan mengklaim peningkatan kedisiplinan, namun dokter spesialis anak mengingatkan risiko defisit tidur remaja.",
            prompt: "Pilih draf Teras Berita (Lead) yang paling objektif, padat 5W+1H, dan tidak menenggelamkan fakta:",
            options: [
              {
                text: "Evaluasi pekan pertama uji coba jam masuk sekolah pukul 06.00 WIB di SMA Negeri 1 mencatat tingkat kehadiran 89 persen dari 640 siswa, meski pakar kesehatan anak mengingatkan potensi defisit tidur yang memengaruhi daya konsentrasi belajar.",
                isCorrect: true,
                explanation: "Sempurna! Menjawab 5W+1H secara proporsional: evaluasi kehadiran 89% dari 640 siswa di SMAN 1 pada jam 06.00 WIB, dengan menyertakan peringatan pakar kesehatan secara berimbang."
              },
              {
                text: "Angin fajar berhembus sangat dingin menyelimuti dedaunan basah dan lampu jalan masih temaram berkedip saat pintu gerbang besi sekolah berderit dibuka perlahan oleh satpam yang sedang menguap.",
                isCorrect: false,
                explanation: "Salah (Buried Lead): Tenggelam dalam deskripsi puitis suasana pagi buta tanpa menyentuh esensi berita evaluasi kebijakan pendidikan."
              },
              {
                text: "Memaksa siswa bangun di saat ayam belum berkokok, kebijakan jam masuk sekolah subuh yang sangat menyengsarakan dan tanpa akal sehat ini menuai amarah besar publik.",
                isCorrect: false,
                explanation: "Salah (Editorializing): Menyusupkan prasangka kemarahan pribadi wartawan ('sangat menyengsarakan', 'tanpa akal sehat') yang mencemari independensi berita."
              },
              {
                text: "Kebijakan baru tentang jam masuk pagi telah dicoba di sekolah pada hari Senin kemarin.",
                isCorrect: false,
                explanation: "Salah (Miskin Fakta 5W+1H): Terlalu kabur, tidak menyebutkan pukul berapa, nama sekolah, persentase kehadiran, dan sudut pandang evaluasinya."
              }
            ],
            debuffOptions: [
              {
                text: "Seluruh siswa dikabarkan pingsan massal di lorong sekolah karena harus lari maraton menghindari serigala subuh.",
                isCorrect: false,
                explanation: "Salah: Hoaks konyol hasil debuff lawan!"
              }
            ]
          },
          {
            id: "v3_w2",
            stepNumber: 2,
            stepTitle: "Langkah 2: Menyeleksi Kutipan Berimbang (Cover Both Sides) - Menghindari False Balance & Manipulasi Konteks",
            context: "Situasi: Kepala Dinas Pendidikan membela kebijakan untuk menanamkan etos kerja tangguh, sementara Ikatan Dokter Anak Indonesia (IDAI) merilis data biologis ritme sirkadian tidur remaja.",
            rawFacts: "Narasumber: Kepala Dinas Pendidikan (Dr. H. Sulaiman M.Pd) dan Dokter Spesialis Anak (dr. Ratna Sp.A).",
            prompt: "Pilih cara menyusun kutipan narasumber yang paling kredibel dan Cover Both Sides:",
            options: [
              {
                text: "Menyajikan argumen Kepala Dinas mengenai pembentukan karakter disiplin pagi hari bersanding dengan telaah medis dokter spesialis anak tentang perlunya kecukupan tidur 8-10 jam demi kesehatan mental remaja.",
                isCorrect: true,
                explanation: "Teladan jurnalisme berimbang! Menghadirkan argumentasi kebijakan institusi pendidikan bersanding sepadan dengan telaah ilmiah medis kedokteran anak."
              },
              {
                text: "Menyejajarkan telaah ilmiah ritme sirkadian dokter anak dengan unggahan status keluhan anonim di akun gosip medsos yang mengajak siswa mogok sekolah serentak.",
                isCorrect: false,
                explanation: "Salah (False Balance): Mengimbangi otoritas medis resmi dengan hasutan anonim provokatif adalah pelanggaran prinsip verifikasi berimbang."
              },
              {
                text: "Hanya merekam testimoni satu siswa juara kelas yang terbiasa bangun jam 4 pagi, dan menghapus seluruh keluhan siswa yang menempuh jarak rumah 15 kilometer.",
                isCorrect: false,
                explanation: "Salah (Cherry-Picking): Menutup mata dari realitas tantangan geografis mayoritas siswa demi menyenangkan pembuat kebijakan."
              },
              {
                text: "Menghapus wawancara kedua narasumber dan menggantinya dengan puisi kemarahan wartawan tentang hak tidur nyenyak.",
                isCorrect: false,
                explanation: "Salah: Wartawan wajib menyampaikan fakta narasumber berwenang, bukan meluapkan emosi sastra."
              }
            ],
            debuffOptions: [
              {
                text: "Membuat kutipan palsu bahwa dokter anak menganjurkan siswa meminum sepuluh cangkir espresso setiap subuh.",
                isCorrect: false,
                explanation: "Salah: Misinformasi medis sesat hasil debuff!"
              }
            ]
          },
          {
            id: "v3_w3",
            stepNumber: 3,
            stepTitle: "Langkah 3: Meja Bahasa (Copy Editing) - EYD Edisi V, Pleonasme & Istilah Baku Jurnalistik",
            context: "Draf mentah reporter: 'Pada saat ketika uji coba jam masuk yang sangat amat pagi sekali kemarin, pihak sekolah merubah jadwal kbm demi untuk merespon daripada masukan orang tua.'",
            rawFacts: "Tugas Korektor: Perbaiki bentukan tidak baku ('merubah', 'merespon', 'daripada'), buang pleonasme kata mubazir, dan tegakkan kalimat efektif EYD V.",
            prompt: "Pilih kalimat hasil suntingan yang 100% mematuhi kaidah tata bahasa Indonesia baku (EYD V):",
            options: [
              {
                text: "Dalam uji coba jam masuk pagi kemarin, pihak sekolah mengubah jadwal KBM guna merespons masukan orang tua.",
                isCorrect: true,
                explanation: "Sempurna! Membetulkan kata tidak baku: 'merubah' -> 'mengubah', 'merespon' -> 'merespons', melenyapkan 'daripada' yang salah tempat, dan memangkas pleonasme 'pada saat ketika' dan 'sangat amat... sekali'."
              },
              {
                text: "Dalam uji coba jam masuk pagi kemarin, pihak sekolah merubah jadwal KBM demi merespon masukan orang tua.",
                isCorrect: false,
                explanation: "Salah: Masih menggunakan bentuk kata tidak baku 'merubah' dan 'merespon' (seharusnya 'mengubah' dan 'merespons')."
              },
              {
                text: "Pada saat uji coba jam masuk kemarin, pihak sekolah mengubah jadwal KBM demi untuk merespons daripada masukan orang tua.",
                isCorrect: false,
                explanation: "Salah: Mempertahankan pleonasme 'demi untuk' dan penggunaan kata 'daripada' yang tidak tepat untuk objek kalimat."
              },
              {
                text: "Uji coba jam masuk pagi diadakan kemarin di mana pihak sekolah merubah jadwal untuk respon masukan diberikan.",
                isCorrect: false,
                explanation: "Salah: Menggunakan pola serapan rancu 'di mana' dan struktur kalimat yang tidak efektif."
              }
            ],
            debuffOptions: [
              {
                text: "Siswa disuruh meminum jamu pahit bercampur kunyit asam agar kelopak mata tidak berkedip saat pelajaran.",
                isCorrect: false,
                explanation: "Salah: Debuff takhayul hasil gangguan rival!"
              }
            ]
          },
          {
            id: "v3_w4",
            stepNumber: 4,
            stepTitle: "Langkah 4: Meracik Judul Berita Utama (Headline) - Uji Anti-Clickbait & Akurasi Fakta",
            context: "Judul akan diterbitkan di surat kabar siswa dan dibaca dewan guru, wali murid, serta pengawas kementerian pendidikan.",
            rawFacts: "Inti: Pekan pertama jam masuk 06.00 raih 89% kehadiran, sekolah sesuaikan beban PR, IDAI tekankan pentingnya istirahat malam cukup bagi tumbuh kembang remaja.",
            prompt: "Tentukan judul berita utama yang memiliki nilai berita tinggi, berbobot, akurat, dan bebas clickbait:",
            options: [
              {
                text: "Uji Coba Masuk Sekolah Pukul 06.00 Catat Kehadiran 89%, IDAI Ingatkan Pentingnya Durasi Tidur Remaja",
                isCorrect: true,
                explanation: "Judul standar emas: informatif, memuat angka capaian konkret (89%), subjek kebijakan (06.00), dan perspektif kesehatan resmi IDAI secara berimbang."
              },
              {
                text: "BIKIN GIGIT JARI! Masuk Sekolah Pas Matahari Masih Tidur, Siswa Terkapar Massal di Kolong Meja!",
                isCorrect: false,
                explanation: "Salah (Clickbait Murahan): Bombastis, dramatisasi palsu ('terkapar massal'), dan merendahkan martabat jurnalisme sekolah."
              },
              {
                text: "Evaluasi Pelaksanaan Jam Masuk Pagi di SMA Negeri 1 Pada Minggu Ini",
                isCorrect: false,
                explanation: "Salah (Terlalu Pasif & Datar): Kehilangan daya tarik berita karena tidak memuat angka temuan dan isu kesehatan yang krusial."
              },
              {
                text: "Terbukti Langgar Hak Asasi Anak, Kebijakan Jam Masuk Subuh Menuai Kecaman Keras Seluruh Indonesia",
                isCorrect: false,
                explanation: "Salah (Penghakiman Sepihak / Trial by the Press): Memutarbalikkan fakta evaluasi kehadiran 89% dengan tuduhan sepihak tanpa putusan hukum."
              }
            ],
            debuffOptions: [
              {
                text: "VIRALKAN! Kepala Sekolah Paksa Siswa Bawa Bantal Guling ke Ruang Kelas Biar Viral!",
                isCorrect: false,
                explanation: "Salah: Judul hoaks sampah hasil debuff lawan!"
              }
            ]
          },
          {
            id: "v3_w5",
            stepNumber: 5,
            stepTitle: "Langkah 5: Penegakan Kode Etik Jurnalistik (KEJ) & Perlindungan Identitas Anak",
            context: "Kasus Etika: Seorang siswi kelas 10 (15 tahun) sempat tertidur di halte bus umum jam 05.30 pagi karena kelelahan, dan fotonya diunggah oleh warga pengguna jalan ke media sosial.",
            rawFacts: "Landasan Hukum: Pasal 5 KEJ menetapkan bahwa jurnalis dilarang membeberkan identitas anak di bawah umur yang dapat mempermalukan atau merugikan masa depannya.",
            prompt: "Bagaimana redaksi pers sekolah menyikapi foto siswi tersebut dalam laporan mendalam?",
            options: [
              {
                text: "Menolak mempublikasikan foto siswi yang tertidur di halte, menyamarkan identitas siswi, dan mengalihkan fokus peliputan pada ketersediaan transportasi umum yang aman bagi pelajar di waktu subuh.",
                isCorrect: true,
                explanation: "Sempurna! Mematuhi Pasal 5 KEJ: menjaga kehormatan martabat siswi anak di bawah umur dan mengangkat masalah sistemik transportasi umum."
              },
              {
                text: "Memasang foto wajah siswi tertidur di halte tanpa sensor di halaman depan koran dengan tulisan 'Contoh Siswi yang Malas Bangun Subuh'.",
                isCorrect: false,
                explanation: "Salah Fatal: Pelanggaran berat Pasal 5 KEJ dan perundungan visual terhadap anak di bawah umur."
              },
              {
                text: "Menyamarkan mata siswi dengan garis tipis, tetapi membeberkan nama lengkap, kelas, serta alamat rumah siswi secara terang-terangan.",
                isCorrect: false,
                explanation: "Salah: Doxing terselubung yang membahayakan privasi dan keselamatan siswi."
              },
              {
                text: "Mewawancarai teman-teman sekelasnya untuk membongkar aib keluarga siswi mengapa ia bisa kelelahan di halte.",
                isCorrect: false,
                explanation: "Salah: Menggali gosip pribadi di luar batas ruang berita profesional melanggar etika jurnalistik."
              }
            ],
            debuffOptions: [
              {
                text: "Menayangkan siaran langsung panggilan telepon saat guru memarahi siswi tersebut.",
                isCorrect: false,
                explanation: "Salah: Pelanggaran privasi berat hasil serangan debuff lawan!"
              }
            ]
          }
        ]
      },
      {
        variationIndex: 3,
        topic: "Variasi 4: Inovasi Reaktor Biogas Pengolah Limbah Kantin Menjadi Pasokan Gas Memasak Sekolah",
        challenges: [
          {
            id: "v4_w1",
            stepNumber: 1,
            stepTitle: "Langkah 1: Merakit Teras Berita (Lead) - Menghindari Buried Lead & Editorializing",
            context: "Kasus: Peluncuran Reaktor Biodigester Pengolah Sampah Organik Kantin Menjadi Pasokan Gas Masak di SMPN 3.",
            rawFacts: "Fakta: Senin (07/11) pagi, tim riset lingkungan SMPN 3 sukses mengoperasikan reaktor biogas yang mengolah 80 kg limbah sisa makanan per hari untuk mencukupi kebutuhan bahan bakar 4 stan kantin secara gratis.",
            prompt: "Pilih draf Teras Berita (Lead) yang paling mematuhi prinsip straight news (padat 5W+1H, objektif, anti-buried lead):",
            options: [
              {
                text: "Mengolah 80 kilogram limbah sisa makanan kantin setiap hari, tim riset lingkungan SMP Negeri 3 sukses mengoperasikan reaktor biogas mandiri yang mampu menyuplai kebutuhan gas memasak bagi 4 stan kuliner sekolah mulai Senin (07/11) pagi.",
                isCorrect: true,
                explanation: "Sempurna! Padat 5W+1H: Who (tim riset lingkungan SMPN 3), What (reaktor biogas mandiri olah 80 kg limbah), Where (kantin sekolah), When (Senin 07/11 pagi), Why/How (menyuplai gas memasak bagi 4 stan kantin)."
              },
              {
                text: "Bau sisa kuah bakso dan tumpukan kulit pisang tampak menggunung membusuk di sudut pagar kantin saat mentari merekah sebelum para siswa berkumpul memperhatikan alat besi tabung biru.",
                isCorrect: false,
                explanation: "Salah (Buried Lead): Memulai berita dengan deskripsi bau busuk puitis yang menenggelamkan keberhasilan teknologi energi terbarukan."
              },
              {
                text: "Akibat mahalnya harga tabung gas elpiji melon yang membuat kantin merugi, pihak sekolah terpaksa membuat reaktor biogas darurat pada Senin (07/11).",
                isCorrect: false,
                explanation: "Salah (Editorializing): Menyisipkan narasi spekulatif keluh kesah harga ('terpaksa membuat alat darurat') mendiskreditkan inovasi ilmiah siswa."
              },
              {
                text: "Ada instalasi alat baru pengolah sampah sisa makanan yang mulai dinyalakan di kantin sekolah kemarin.",
                isCorrect: false,
                explanation: "Salah (Miskin Fakta 5W+1H): Terlalu datar, tidak menyebutkan kapasitas 80 kg, manfaat gas untuk 4 stan, nama sekolah, dan nama teknologinya."
              }
            ],
            debuffOptions: [
              {
                text: "Tabung reaktor biogas dikabarkan menyemburkan cairan lava panas yang menenggelamkan kelas 7.",
                isCorrect: false,
                explanation: "Salah: Hoaks konyol hasil debuff lawan!"
              }
            ]
          },
          {
            id: "v4_w2",
            stepNumber: 2,
            stepTitle: "Langkah 2: Menyeleksi Kutipan Berimbang (Cover Both Sides) - Menghindari False Balance & Manipulasi Konteks",
            context: "Situasi: Guru pembina kimia memaparkan efisiensi produksi gas metana aman, sementara pengelola kantin memberikan masukan teknis mengenai kedisiplinan pemilahan sampah organik.",
            rawFacts: "Narasumber: Pembina Kelompok Ilmiah Remaja (Dra. Siti Aminah) dan Perwakilan Pengelola Kantin (Ibu Sumiati).",
            prompt: "Pilih perakitan kutipan narasumber yang proporsional, adil, dan membangun (Cover Both Sides):",
            options: [
              {
                text: "Menyandingkan pemaparan ilmiah guru pembina mengenai sistem konversi bakteri anaerob yang aman tanpa bau dengan komitmen pedagang kantin yang bersedia memilah sampah sisa makanan demi pasokan gas berkelanjutan.",
                isCorrect: true,
                explanation: "Kombinasi ideal Cover Both Sides! Memadukan penjelasan ilmiah keamanan teknologi dengan kesiapan pemangku kepentingan kantin dalam tata kelola pemilahan sampah."
              },
              {
                text: "Menyamakan penjelasan ahli kimia bersertifikasi dengan kabar bohong seorang warga luar pagar yang mengeklaim reaktor biogas dapat memicu ledakan nuklir.",
                isCorrect: false,
                explanation: "Salah (False Balance): Mengimbangi sains terapan dengan histeria kabar bohong tanpa dasar adalah bentuk keseimbangan semu."
              },
              {
                text: "Hanya mengutip satu pedagang yang mengeluh enggan memilah sampah, dan membuang testimoni pedagang lain yang merasa sangat terbantu penghematan biaya bahan bakar.",
                isCorrect: false,
                explanation: "Salah (Cherry-Picking): Menyeleksi kutipan keluhan secara sepihak demi membangun narasi konflik buatan."
              },
              {
                text: "Menghapus kutipan pembina kimia dan menggantinya dengan opini reporter tentang teori pemanasan global dunia.",
                isCorrect: false,
                explanation: "Salah: Wartawan dilarang mendominasi berita dengan kuliah teori pribadi."
              }
            ],
            debuffOptions: [
              {
                text: "Membuat kutipan palsu bahwa api kompor biogas berwarna ungu karena memakai minyak santet.",
                isCorrect: false,
                explanation: "Salah: Takhayul fitnah hasil sabotase rival!"
              }
            ]
          },
          {
            id: "v4_w3",
            stepNumber: 3,
            stepTitle: "Langkah 3: Meja Bahasa (Copy Editing) - EYD Edisi V, Pleonasme & Istilah Baku Jurnalistik",
            context: "Draf mentah reporter: 'Pada saat ketika peresmian reaktor biogas yang sungguh amat sangat ramai sekali, kepala sekolah merubah kebijakan demi untuk meminimalisir daripada biaya operasional kantin.'",
            rawFacts: "Tugas Korektor: Perbaiki bentukan tidak baku ('merubah', 'meminimalisir', 'daripada'), lenyapkan pleonasme kata mubazir, dan tegakkan kalimat efektif EYD V.",
            prompt: "Pilih kalimat hasil penyuntingan (copy editing) yang 100% mematuhi tata bahasa Indonesia baku (EYD V):",
            options: [
              {
                text: "Dalam peresmian reaktor biogas yang berlangsung sangat ramai kemarin, kepala sekolah mengubah kebijakan guna meminimalkan biaya operasional kantin.",
                isCorrect: true,
                explanation: "Sempurna! Padat, lugas, mengoreksi kata tidak baku: 'merubah' -> 'mengubah', 'meminimalisir' -> 'meminimalkan', membuang 'daripada', dan menghapus pleonasme ganda 'pada saat ketika'."
              },
              {
                text: "Dalam peresmian reaktor biogas yang ramai kemarin, kepala sekolah merubah kebijakan demi meminimalisir biaya operasional kantin.",
                isCorrect: false,
                explanation: "Salah: Masih mempertahankan dua kata tidak baku 'merubah' dan 'meminimalisir'."
              },
              {
                text: "Pada saat peresmian reaktor biogas kemarin, kepala sekolah mengubah kebijakan demi untuk meminimalkan daripada biaya operasional kantin.",
                isCorrect: false,
                explanation: "Salah: Mempertahankan pemborosan kata 'demi untuk' dan penyisipan kata 'daripada' yang rancu."
              },
              {
                text: "Peresmian reaktor diadakan di mana kepala sekolah merubah kebijakan agar biaya operasional diminimalisir.",
                isCorrect: false,
                explanation: "Salah: Struktur kalimat pasif yang tidak baku dengan serapan penghubung 'di mana'."
              }
            ],
            debuffOptions: [
              {
                text: "Murid diwajibkan menyetor bangkai tikus ke dalam reaktor biogas agar api kompor bertambah panas.",
                isCorrect: false,
                explanation: "Salah: Debuff konyol hasil gangguan lawan!"
              }
            ]
          },
          {
            id: "v4_w4",
            stepNumber: 4,
            stepTitle: "Langkah 4: Meracik Judul Berita Utama (Headline) - Uji Anti-Clickbait & Akurasi Fakta",
            context: "Judul akan dicetak di terbitan mading pers sekolah dan diajukan ke festival majalah sekolah tingkat provinsi.",
            rawFacts: "Inti: Reaktor biogas olah 80 kg limbah sisa makanan per hari, suplai gas memasak untuk 4 stan kantin secara mandiri, didukung standar keamanan laboratorium.",
            prompt: "Pilih judul berita utama yang paling akurat, bernilai berita tinggi, berbobot, dan bebas clickbait:",
            options: [
              {
                text: "Olah 80 Kg Limbah Organik Kantin per Hari, SMPN 3 Rintis Kemandirian Energi Lewat Reaktor Biogas",
                isCorrect: true,
                explanation: "Judul standar emas jurnalisme: padat data (80 kg limbah), memuat aksi solutif (kemandirian energi), subjek sekolah jelas, dan bernilai berita inspiratif."
              },
              {
                text: "GELENG-GELENG KEPALA! Dari Tumpukan Sampah Busuk, Sekolah Ini Bikin Penjual Gas Elpiji Ketar-Ketir!",
                isCorrect: false,
                explanation: "Salah (Clickbait Murahan): Sensasionalis, provokatif terhadap pelaku usaha ('ketar-ketir'), dan merusak marwah jurnalisme sains."
              },
              {
                text: "Reaktor Pengolahan Sampah Kantin Sekolah di SMPN 3 Telah Selesai Dibuat",
                isCorrect: false,
                explanation: "Salah (Terlalu Datar & Pasif): Tidak memuat angka kuantitas 80 kg, manfaat suplai gas, dan daya inovasi siswa."
              },
              {
                text: "Tak Sanggup Beli Gas Elpiji, Kantin SMPN 3 Nekat Masak Pakai Gas Buangan Sampah Busuk",
                isCorrect: false,
                explanation: "Salah (Penghakiman Negatif): Menyudutkan kantin dan mendiskreditkan teknologi biogas yang higienis dan teruji aman."
              }
            ],
            debuffOptions: [
              {
                text: "AWAS MELEDAK! Bom Biogas Buatan Siswa SMP Siap Hancurkan Bangunan Sekolah!",
                isCorrect: false,
                explanation: "Salah: Judul hoaks fitnah hasil sabotase lawan!"
              }
            ]
          },
          {
            id: "v4_w5",
            stepNumber: 5,
            stepTitle: "Langkah 5: Penegakan Kode Etik Jurnalistik (KEJ) & Perlindungan Identitas Anak",
            context: "Kasus Etika: Seorang siswa kelas 8 (14 tahun) sempat mengalami luka lecet di jari tangan akibat menyentuh bilah pencacah sampah saat tidak memakai sarung tangan pelindung, dan telah diobati perawat UKS.",
            rawFacts: "Landasan Hukum: Pasal 5 KEJ menetapkan bahwa jurnalis tidak mengekspos identitas maupun dokumentasi grafis anak korban kecelakaan/kelalaian di lingkungan sekolah.",
            prompt: "Bagaimana tim redaksi pers sekolah wajib menyajikan insiden tersebut dalam naskah berita?",
            options: [
              {
                text: "Wajib menyamarkan nama siswa menjadi inisial (misal: BK, 14 tahun), tidak menampilkan foto luka fisik berdarah, dan mengarahkan fokus tulisan pada pentingnya kepatuhan SOP alat pelindung diri (APD).",
                isCorrect: true,
                explanation: "Sempurna! Mematuhi Pasal 5 KEJ dan Kode Perilaku Perlindungan Anak: menjaga privasi trauma anak dan mengedepankan edukasi keselamatan kerja."
              },
              {
                text: "Mempublikasikan foto jarak dekat jari siswa yang berdarah di halaman utama koran sekolah untuk membuktikan bahwa mesin pencacah benar-benar tajam.",
                isCorrect: false,
                explanation: "Salah Fatal: Melanggar etika kesopanan visual dan perlindungan privasi medis anak di bawah umur."
              },
              {
                text: "Menuliskan nama lengkap siswa dan menyudutkannya sebagai anak ceroboh yang merusak kelancaran peresmian alat reaktor biogas.",
                isCorrect: false,
                explanation: "Salah: Melakukan penghakiman emosional pribadi (victim blaming) yang melanggar kode etik dasar jurnalistik."
              },
              {
                text: "Menyamarkan wajah siswa namun mencantumkan nama lengkap kedua orang tuanya dan nomor telepon pribadi keluarga.",
                isCorrect: false,
                explanation: "Salah: Doxing identitas keluarga anak yang dilarang keras dalam hukum pers."
              }
            ],
            debuffOptions: [
              {
                text: "Mengunggah rekaman video saat siswa meringis kesakitan di ruang UKS ke Instagram Reels sekolah.",
                isCorrect: false,
                explanation: "Salah: Eksploitasi rasa sakit anak hasil serangan debuff lawan!"
              }
            ]
          }
        ]
      },
      {
        variationIndex: 4,
        topic: "Variasi 5: Turnamen E-Sports Antarpelajar: Edukasi Manajemen Waktu Belajar vs Candu Game",
        challenges: [
          {
            id: "v5_w1",
            stepNumber: 1,
            stepTitle: "Langkah 1: Merakit Teras Berita (Lead) - Menghindari Buried Lead & Editorializing",
            context: "Kasus: Penyelenggaraan Turnamen E-Sports Game Strategi Antarkelas Bertajuk 'Piala Pelajar Cerdas' di SMPN 5.",
            rawFacts: "Fakta: Sabtu (10/12) pagi, OSIS SMPN 5 menggelar turnamen e-sports strategi yang diikuti 32 tim perwakilan kelas, dipadukan lokakarya manajemen waktu belajar dan pembatasan durasi layar digital.",
            prompt: "Pilih draf Teras Berita (Lead) yang paling mematuhi prinsip straight news (padat 5W+1H, objektif, tidak menenggelamkan fakta):",
            options: [
              {
                text: "Guna menyalurkan minat bakat digital sekaligus mengedukasi batas waktu layar sehat, OSIS SMP Negeri 5 menggelar turnamen e-sports strategi antarkelas yang diikuti 32 tim perwakilan pada Sabtu (10/12) pagi.",
                isCorrect: true,
                explanation: "Sempurna! Lengkap 5W+1H: Who (OSIS SMPN 5 & 32 tim perwakilan), What (turnamen e-sports strategi antarkelas), Where (SMP Negeri 5), When (Sabtu 10/12 pagi), Why (menyalurkan bakat dan edukasi durasi layar sehat)."
              },
              {
                text: "Di era abad 21 yang serba digital dengan pancaran sinar biru gawai menyilaukan mata dan jari-jemari lincah para remaja menari di atas layar sentuh, koridor sekolah mendadak dipenuhi sorak-sorai riuh penonton.",
                isCorrect: false,
                explanation: "Salah (Buried Lead): Menenggelamkan peristiwa kompetisi dengan prosa puitis klise tentang era digital tanpa menyebutkan data nama sekolah, waktu, dan jumlah peserta."
              },
              {
                text: "Karena sudah angkat tangan menghadapi kecanduan game online siswa yang parah, pihak sekolah akhirnya nekat menggelar kompetisi game pada Sabtu (10/12).",
                isCorrect: false,
                explanation: "Salah (Editorializing): Menyusupkan asumsi negatif keputusasaan guru ('sudah angkat tangan', 'nekat menggelar') yang mencoreng tujuan edukasi sekolah."
              },
              {
                text: "Turnamen lomba game online telah diadakan oleh OSIS sekolah pada hari kemarin untuk murid.",
                isCorrect: false,
                explanation: "Salah (Miskin Fakta 5W+1H): Sangat hambar, tidak memuat nama turnamen, jumlah tim, nama sekolah, tujuan edukatif pembatasan layar, dan waktu spesifik."
              }
            ],
            debuffOptions: [
              {
                text: "Turnamen e-sports sekolah dikabarkan disponsori oleh bandar judi kasino luar angkasa secara gelap.",
                isCorrect: false,
                explanation: "Salah: Hoaks fitnah hasil debuff kelompok lawan!"
              }
            ]
          },
          {
            id: "v5_w2",
            stepNumber: 2,
            stepTitle: "Langkah 2: Menyeleksi Kutipan Berimbang (Cover Both Sides) - Menghindari False Balance & Manipulasi Konteks",
            context: "Situasi: Pembina ekstrakurikuler menekankan pembentukan keterampilan koordinasi tim dan strategi analitis, sedangkan Guru BK mengingatkan pentingnya disiplin jam tidur dan prioritas tugas sekolah.",
            rawFacts: "Narasumber: Pembina Ekstrakurikuler Komputer (Rian Hidayat S.Pd) dan Koordinator Guru BK (Dra. Endang Purwati).",
            prompt: "Pilih cara menyusun kutipan narasumber yang paling kredibel, objektif, dan berimbang (Cover Both Sides):",
            options: [
              {
                text: "Menyeimbangkan apresiasi pembina ekstrakurikuler mengenai manfaat asah daya taktis dan sportivitas digital siswa dengan arahan tegas guru BK mengenai kewajiban menjaga jam tidur 8 jam serta ketuntasan tugas akademik.",
                isCorrect: true,
                explanation: "Teladan jurnalisme berimbang! Mengharmonisasikan sudut pandang potensi talenta digital dengan peringatan disiplin bimbingan konseling secara proporsional."
              },
              {
                text: "Menyejajarkan telaah pedagogi guru BK dengan celoteh komentar anonim di forum game online yang mengeklaim bahwa belajar buku di sekolah sudah ketinggalan zaman.",
                isCorrect: false,
                explanation: "Salah (False Balance): Mengimbangi otoritas pendidikan resmi dengan provokasi anonim tidak bertanggung jawab adalah kesalahan jurnalistik fatal."
              },
              {
                text: "Hanya merekam kekesalan guru BK saat memergoki satu siswa mengantuk, dan membuang penjelasan tentang fakta bahwa juara turnamen adalah peraih peringkat 1 paralel sekolah.",
                isCorrect: false,
                explanation: "Salah (Cherry-Picking): Memotong konteks demi membenarkan stereotipe negatif bahwa semua pemain game online pasti bodoh."
              },
              {
                text: "Menghapus pernyataan guru BK dan menggantinya dengan tips trik bermain game dari reporter naskah.",
                isCorrect: false,
                explanation: "Salah: Wartawan bertugas menyajikan perspektif para pemangku kepentingan, bukan mempromosikan hobi pribadi."
              }
            ],
            debuffOptions: [
              {
                text: "Membuat kutipan palsu bahwa kepala sekolah berjanji meluluskan semua gamer tanpa perlu mengikuti ujian nasional.",
                isCorrect: false,
                explanation: "Salah: Fitnah menyesatkan hasil debuff rival!"
              }
            ]
          },
          {
            id: "v5_w3",
            stepNumber: 3,
            stepTitle: "Langkah 3: Meja Bahasa (Copy Editing) - EYD Edisi V, Pleonasme & Istilah Baku Jurnalistik",
            context: "Draf mentah reporter: 'Pada saat ketika babak final turnamen esport yang sungguh amat sangat sengit sekali kemarin, panitia merubah tata tertib demi untuk meminimalisir cidera fisik para atlit pelajar.'",
            rawFacts: "Tugas Korektor: Perbaiki kata tidak baku ('merubah', 'meminimalisir', 'cidera', 'atlit'), hapus pleonasme mubazir, dan tegakkan kalimat efektif EYD V.",
            prompt: "Pilih kalimat hasil penyuntingan (copy editing) yang 100% mematuhi kaidah tata bahasa Indonesia baku (EYD V):",
            options: [
              {
                text: "Dalam babak final turnamen e-sports yang berlangsung sengit kemarin, panitia mengubah tata tertib guna meminimalkan cedera fisik para atlet pelajar.",
                isCorrect: true,
                explanation: "Sempurna! Membetulkan kata tidak baku: 'merubah' -> 'mengubah', 'meminimalisir' -> 'meminimalkan', 'cidera' -> 'cedera', 'atlit' -> 'atlet', serta memangkas pleonasme 'pada saat ketika' dan 'sungguh amat sangat... sekali'."
              },
              {
                text: "Dalam babak final turnamen esport yang sengit kemarin, panitia merubah tata tertib demi meminimalisir cidera fisik para atlit pelajar.",
                isCorrect: false,
                explanation: "Salah: Masih mempertahankan empat bentuk kata tidak baku ('merubah', 'meminimalisir', 'cidera', 'atlit')."
              },
              {
                text: "Pada saat babak final kemarin, panitia mengubah tata tertib demi untuk meminimalkan daripada cedera fisik para atlet.",
                isCorrect: false,
                explanation: "Salah: Mempertahankan pemborosan kata 'demi untuk' dan penempatan kata 'daripada' yang salah."
              },
              {
                text: "Babak final diadakan di mana panitia merubah tata tertib agar cidera fisik atlit diminimalisir.",
                isCorrect: false,
                explanation: "Salah: Menggunakan pola serapan rancu 'di mana' dan kata-kata tidak baku dalam kalimat pasif."
              }
            ],
            debuffOptions: [
              {
                text: "Panitia memasang jimat penangkal petir di antena router Wi-Fi agar sinyal tidak disihir tim lawan.",
                isCorrect: false,
                explanation: "Salah: Debuff takhayul konyol hasil gangguan rival!"
              }
            ]
          },
          {
            id: "v5_w4",
            stepNumber: 4,
            stepTitle: "Langkah 4: Meracik Judul Berita Utama (Headline) - Uji Anti-Clickbait & Akurasi Fakta",
            context: "Judul akan diterbitkan di portal berita sekolah dan mading utama untuk dibaca seluruh siswa, dewan guru, dan pengawas pendidikan.",
            rawFacts: "Inti: Turnamen e-sports antarkelas diikuti 32 tim di SMPN 5, terintegrasi lokakarya pembatasan waktu layar dan manajemen belajar sehat, juara diraih siswa berprestasi kelas 9B.",
            prompt: "Tentukan judul berita utama yang memiliki nilai berita tinggi, berbobot, akurat, bermartabat, dan bebas unsur clickbait:",
            options: [
              {
                text: "Padukan Sportivitas Digital dan Disiplin Belajar, Turnamen E-Sports SMPN 5 Terapkan Aturan Batas Layar",
                isCorrect: true,
                explanation: "Judul standar emas jurnalisme pers: padat makna, berbobot, mengedepankan nilai sportivitas digital bersanding dengan kedisiplinan belajar tanpa clickbait."
              },
              {
                text: "GEMPAR! Sekolah Ini Malah Suruh Murid Main Game Sampai Mata Merah, Guru BK Malah Tersenyum Lebar!",
                isCorrect: false,
                explanation: "Salah (Clickbait Murahan): Memakai kata hiperbolis ('gempar'), memutarbalikkan fakta ('suruh murid main game sampai mata merah'), dan mencemarkan guru BK."
              },
              {
                text: "Turnamen E-Sports Antarkelas Telah Berhasil Diselenggarakan di SMPN 5",
                isCorrect: false,
                explanation: "Salah (Terlalu Datar & Pasif): Kehilangan sudut pandang nilai berita utama tentang edukasi pembatasan waktu layar dan disiplin belajar."
              },
              {
                text: "Legalkan Bahaya Candu Game, Kebijakan Turnamen SMPN 5 Terancam Ditegur Keras Oleh Dinas",
                isCorrect: false,
                explanation: "Salah (Trial by the Press): Memutarbalikkan fakta niat edukasi sekolah menjadi tuduhan ancaman tanpa konfirmasi dari dinas terkait."
              }
            ],
            debuffOptions: [
              {
                text: "VIRALKAN! Gamer Kelas 9 Ini Kalahkan Komputer NASA Pakai Ponsel Jadul!",
                isCorrect: false,
                explanation: "Salah: Judul hoaks bualan hasil sabotase lawan!"
              }
            ]
          },
          {
            id: "v5_w5",
            stepNumber: 5,
            stepTitle: "Langkah 5: Penegakan Kode Etik Jurnalistik (KEJ) & Perlindungan Identitas Anak",
            context: "Kasus Etika: Seorang siswa peserta berusia 13 tahun kedapatan melontarkan umpatan kasar saat timnya kalah di babak semifinal, dan sedang menjalani sesi bimbingan etika bertutur kata bersama guru pendamping.",
            rawFacts: "Landasan Hukum: Pasal 5 KEJ menetapkan bahwa jurnalis tidak mengekspos identitas anak yang melakukan pelanggaran disiplin/etika agar tidak menjadi sasaran perundungan publik.",
            prompt: "Bagaimana tim redaksi wajib memperlakukan insiden emosi siswa tersebut dalam naskah laporan liputan?",
            options: [
              {
                text: "Wajib menyamarkan nama siswa menjadi inisial (misal: DN, 13 tahun), tidak mengutip kata umpatan secara vulgar, dan memfokuskan ulasan pada pentingnya pembinaan kematangan mental serta sportivitas bertutur kata.",
                isCorrect: true,
                explanation: "Sempurna! Mematuhi Pasal 5 KEJ dan Undang-Undang Perlindungan Anak: membina etika generasi muda tanpa membuka identitas yang berisiko memicu perundungan siber."
              },
              {
                text: "Menuliskan kata-kata umpatan kasar siswa secara utuh dan memampangkan foto wajah siswa yang sedang berteriak emosi di halaman utama koran sekolah.",
                isCorrect: false,
                explanation: "Salah Fatal: Melanggar asas kepatutan naskah jurnalistik dan mengeksploitasi emosi anak di bawah umur."
              },
              {
                text: "Menyamarkan wajah siswa dengan sensor blur, tetapi mencantumkan nama lengkap, kelas, dan tautan akun media sosial pribadi siswa di tubuh berita.",
                isCorrect: false,
                explanation: "Salah: Doxing terselubung yang mengundang warganet merundung akun pribadi siswa."
              },
              {
                text: "Mewawancarai orang tua siswa secara diam-diam dan menuduh keluarga gagal mendidik etika anak di rumah.",
                isCorrect: false,
                explanation: "Salah: Melanggar batas privasi keluarga dan menghakimi tanpa dasar etika pers."
              }
            ],
            debuffOptions: [
              {
                text: "Mengunggah rekaman video saat siswa dimarahi guru pembina ke media sosial publik sekolah.",
                isCorrect: false,
                explanation: "Salah: Pelanggaran privasi berat hasil serangan debuff lawan!"
              }
            ]
          }
        ]
      }
    ],
    // Default fallback challenges points to Variation 1
    get challenges() {
      return this.variations[0].challenges;
    }
  }
];

export const ranks = [
  { level: 1, title: "Wartawan Magang", minScore: 0, badgeText: "INTERN", desc: "Menguasai ekstraksi unsur pokok 5W+1H pada 3 berkas kasus investigasi kompleks." },
  { level: 2, title: "Arsitek Berita", minScore: 1, badgeText: "EDITOR", desc: "Menguasai struktur hierarki piramida terbalik 5 tingkat pada 3 studi kasus mendalam." },
  { level: 3, title: "Pemimpin Redaksi", minScore: 2, badgeText: "CHIEF EDITOR", desc: "Pakar merakit berita utuh: teras berita, kutipan berimbang, copy editing EYD, headline etis, dan Kode Etik Jurnalistik!" }
];
