# Panduan Konfigurasi n8n untuk ElectroQuest

## Ringkasan
Dokumen ini menjelaskan cara mengatur workflow n8n untuk menggenerate eksperimen elektronika secara dinamis menggunakan AI.

## Prasyarat
- Akun n8n (cloud atau self-hosted)
- API key dari OpenAI, Claude (Anthropic), atau AI provider lainnya
- ElectroQuest sudah berjalan

## Langkah 1: Buat Workflow Baru di n8n

1. Login ke n8n dashboard Anda
2. Klik "New Workflow"
3. Beri nama: "ElectroQuest Experiment Generator"

## Langkah 2: Setup Webhook Trigger

### Node 1: Webhook
- **Type**: Webhook
- **HTTP Method**: POST
- **Path**: `/electroquest-experiment` (atau path custom Anda)
- **Response Mode**: Respond to Webhook

Copy URL webhook yang digenerate, Anda akan membutuhkannya nanti.

### Expected Request Body:
```json
{
  "topic": "components | circuits | practical",
  "difficulty": "apprentice | journeyman | master",
  "experiment_type": "circuit_assembly"
}
```

## Langkah 3: Setup AI Node (OpenAI/Claude)

### Node 2: OpenAI/Claude
- **Model**: gpt-4 atau claude-3-sonnet (pilih sesuai provider Anda)
- **Operation**: Message a Model
- **Prompt**: Lihat template di bawah

### Template Prompt untuk AI:

```
Anda adalah pembuat konten pendidikan elektronika yang ahli. Buatkan eksperimen interaktif dalam bahasa Indonesia dengan tema medieval/fantasy.

Input:
- Topik: {{$json["body"]["topic"]}}
- Tingkat Kesulitan: {{$json["body"]["difficulty"]}}
- Tipe Eksperimen: {{$json["body"]["experiment_type"]}}

Deskripsi topik:
- "components": Komponen dasar elektronika (resistor, LED, capacitor, battery)
- "circuits": Rangkaian seri & paralel, Hukum Ohm, analisis sirkuit
- "practical": Eksperimen breadboard dan proyek nyata

Deskripsi kesulitan:
- "apprentice": Level pemula, eksperimen sederhana dengan 3-4 komponen
- "journeyman": Level menengah, eksperimen moderat dengan 4-5 komponen
- "master": Level lanjut, eksperimen kompleks dengan 5-7 komponen

PENTING: Gunakan tema medieval/fantasy untuk skenario. Contoh:
- "Lentera di menara penjaga telah padam..."
- "Kristal cahaya di kuil kuno memerlukan energi..."
- "Alat sihir sang penyihir butuh perbaikan..."

Format output dalam JSON dengan struktur berikut:

{
  "experiment": {
    "id": "generate-unique-id",
    "title": "Judul Eksperimen Menarik",
    "scenario": "Cerita 2-3 kalimat dengan tema fantasy yang menjelaskan situasi",
    "objective": "Apa yang harus diselesaikan siswa",
    "type": "circuit_assembly",
    "components": [
      {
        "id": "battery-1",
        "type": "battery",
        "voltage": "9V",
        "label": "Baterai 9V"
      },
      {
        "id": "resistor-1",
        "type": "resistor",
        "value": "220Ω",
        "label": "Resistor 220Ω"
      },
      {
        "id": "led-1",
        "type": "led",
        "color": "red",
        "label": "LED Merah"
      }
    ],
    "solution": {
      "connections": [
        { "from": "battery-1-positive", "to": "resistor-1-pin1" },
        { "from": "resistor-1-pin2", "to": "led-1-anode" },
        { "from": "led-1-cathode", "to": "battery-1-negative" }
      ],
      "explanation": "Penjelasan detail mengapa ini solusi yang benar"
    },
    "hints": [
      "Hint 1: Petunjuk ringan yang mengarahkan",
      "Hint 2: Lebih spesifik, menunjukkan area masalah",
      "Hint 3: Hampir memberikan jawaban lengkap"
    ],
    "learning_points": [
      "Poin pembelajaran 1 tentang konsep yang diajarkan",
      "Poin pembelajaran 2 tentang aplikasi praktis"
    ],
    "max_hints": 3,
    "base_xp": 50
  }
}

CATATAN PENTING:
1. Semua teks harus dalam Bahasa Indonesia KECUALI istilah teknis (resistor, LED, capacitor, dll)
2. Skenario harus menarik dan menggunakan tema medieval/fantasy
3. Solusi harus logis dan dapat divalidasi
4. Hints harus progresif (dari umum ke spesifik)
5. Base XP: 30-50 untuk apprentice, 50-80 untuk journeyman, 80-120 untuk master
6. ID komponen harus unique dan konsisten
7. Connection format: "component-id-terminal" (contoh: "battery-1-positive")

Tipe komponen yang tersedia:
- battery: voltage (3V, 5V, 9V, 12V)
- resistor: value (100Ω, 220Ω, 330Ω, 470Ω, 1kΩ, 10kΩ)
- led: color (red, green, blue, yellow, white)
- capacitor: value (10µF, 100µF, 1000µF)
- switch: type (push_button, toggle)
- wire: untuk koneksi

Output HANYA JSON, jangan tambahkan penjelasan atau teks lain.
```

### Settings:
- **Response Format**: JSON
- **Temperature**: 0.7 (untuk kreativitas seimbang)

## Langkah 4: Format Response (Function Node)

### Node 3: Function
Tambahkan node Function untuk memastikan format response benar:

```javascript
// Pastikan response dalam format yang benar
const aiResponse = $input.item.json;

// Coba parse jika AI mengembalikan string JSON
let experiment;
if (typeof aiResponse === 'string') {
  try {
    const parsed = JSON.parse(aiResponse);
    experiment = parsed.experiment || parsed;
  } catch (e) {
    experiment = aiResponse;
  }
} else {
  experiment = aiResponse.experiment || aiResponse;
}

// Validasi struktur
if (!experiment.id) {
  experiment.id = `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

if (!experiment.max_hints) {
  experiment.max_hints = 3;
}

if (!experiment.base_xp) {
  const difficulty = $('Webhook').item.json.body.difficulty;
  experiment.base_xp = difficulty === 'apprentice' ? 40 :
                       difficulty === 'journeyman' ? 60 : 100;
}

return {
  json: {
    experiment: experiment
  }
};
```

## Langkah 5: Respond to Webhook

### Node 4: Respond to Webhook
- **Response Code**: 200
- **Response Body**: `{{ $json }}`

## Langkah 6: Connect Nodes

Koneksi alur:
```
Webhook → AI Node → Function → Respond to Webhook
```

## Langkah 7: Test Workflow

1. Klik "Execute Workflow"
2. Gunakan curl atau Postman untuk test:

```bash
curl -X POST https://your-n8n-instance.com/webhook/electroquest-experiment \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "components",
    "difficulty": "apprentice",
    "experiment_type": "circuit_assembly"
  }'
```

3. Pastikan response sesuai format yang diharapkan

## Langkah 8: Konfigurasi di ElectroQuest

1. Copy URL webhook dari n8n
2. Buka file `.env` di project ElectroQuest
3. Tambahkan variable:

```env
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/electroquest-experiment
```

4. Restart development server:
```bash
npm run dev
```

## Langkah 9: Test Integrasi

1. Login ke ElectroQuest
2. Klik "Main" dari home page
3. Pilih salah satu topik
4. Pilih tingkat kesulitan
5. Tunggu eksperimen di-generate
6. Pastikan data muncul dengan benar

## Tips Optimasi

### 1. Caching (Optional)
Tambahkan node untuk cache eksperimen yang sudah di-generate:
- Gunakan Redis atau database
- Key: `{topic}-{difficulty}-{experiment_type}`
- TTL: 24 jam

### 2. Error Handling
Tambahkan error handling node:
- Catch errors dari AI
- Return fallback experiment
- Log errors untuk debugging

### 3. Rate Limiting
Implementasi rate limiting jika menggunakan n8n cloud:
- Batasi request per user
- Gunakan queue system untuk request bersamaan

## Troubleshooting

### Problem: Webhook tidak merespons
**Solusi**:
- Cek apakah workflow sudah diaktifkan
- Pastikan URL webhook benar
- Cek network/firewall settings

### Problem: AI response format salah
**Solusi**:
- Tambahkan contoh output di prompt
- Gunakan Function node untuk reformat
- Set response format ke JSON di AI node

### Problem: Response terlalu lambat
**Solusi**:
- Gunakan model AI yang lebih cepat
- Implementasi caching
- Tampilkan loading state di frontend

### Problem: Komponen tidak konsisten
**Solusi**:
- Perketat instruksi di prompt
- Tambahkan validasi di Function node
- Buat list komponen yang allowed

## Contoh Response Sukses

```json
{
  "experiment": {
    "id": "exp-1234567890",
    "title": "Menyalakan Lentera Penjaga",
    "scenario": "Lentera di menara penjaga kerajaan telah padam saat malam tiba. Para penjaga membutuhkan cahaya untuk mengawasi wilayah kerajaan dari ancaman. Bantu mereka merakit kembali lentera dengan rangkaian LED sederhana.",
    "objective": "Rakit rangkaian LED dengan resistor dan baterai agar lentera dapat menyala kembali",
    "type": "circuit_assembly",
    "components": [
      {
        "id": "battery-1",
        "type": "battery",
        "voltage": "9V",
        "label": "Baterai 9V"
      },
      {
        "id": "resistor-1",
        "type": "resistor",
        "value": "220Ω",
        "label": "Resistor 220Ω"
      },
      {
        "id": "led-1",
        "type": "led",
        "color": "red",
        "label": "LED Merah"
      }
    ],
    "solution": {
      "connections": [
        { "from": "battery-1-positive", "to": "resistor-1-pin1" },
        { "from": "resistor-1-pin2", "to": "led-1-anode" },
        { "from": "led-1-cathode", "to": "battery-1-negative" }
      ],
      "explanation": "Rangkaian ini membentuk jalur tertutup dari terminal positif baterai melalui resistor (untuk membatasi arus) ke LED, kemudian kembali ke terminal negatif baterai. Resistor melindungi LED dari arus berlebih yang dapat merusaknya."
    },
    "hints": [
      "Perhatikan bahwa arus listrik mengalir dari terminal positif (+) baterai",
      "Resistor harus dipasang di jalur sebelum LED untuk melindunginya dari arus berlebih",
      "Kaki panjang LED adalah anoda (positif) dan kaki pendek adalah katoda (negatif). Sambungkan sesuai polaritas yang benar."
    ],
    "learning_points": [
      "LED membutuhkan resistor untuk membatasi arus dan mencegah kerusakan",
      "Rangkaian listrik harus membentuk jalur tertutup agar arus dapat mengalir",
      "Polaritas komponen seperti LED dan baterai harus diperhatikan"
    ],
    "max_hints": 3,
    "base_xp": 50
  }
}
```

## Support & Bantuan

Jika mengalami masalah:
1. Cek console browser untuk error messages
2. Cek n8n execution logs
3. Pastikan format JSON dari AI sudah benar
4. Test webhook secara terpisah dengan Postman/curl

Selamat mengonfigurasi! 🚀
