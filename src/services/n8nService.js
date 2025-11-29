/*
 * n8n API Service untuk ElectroQuest
 *
 * Service ini berkomunikasi dengan n8n workflow untuk generate eksperimen
 *
 * SETUP INSTRUKSI:
 * ================
 *
 * 1. Buat webhook trigger di n8n workflow Anda
 * 2. Set webhook URL di bawah ini (ganti N8N_WEBHOOK_URL)
 * 3. Workflow harus menerima parameter: topic, difficulty, experiment_type
 *
 * REQUEST FORMAT:
 * {
 *   "topic": "components" | "circuits" | "practical",
 *   "difficulty": "apprentice" | "journeyman" | "master",
 *   "experiment_type": "circuit_assembly" | "component_identification" | "troubleshooting" | "prediction"
 * }
 *
 * EXPECTED RESPONSE FORMAT:
 * {
 *   "experiment": {
 *     "id": "unique-experiment-id",
 *     "title": "Judul Eksperimen",
 *     "scenario": "Deskripsi cerita eksperimen dalam bahasa Indonesia",
 *     "objective": "Apa yang harus diselesaikan siswa",
 *     "type": "circuit_assembly",
 *     "components": [
 *       {
 *         "id": "resistor-1",
 *         "type": "resistor",
 *         "value": "220Ω",
 *         "label": "Resistor 220Ω"
 *       },
 *       {
 *         "id": "led-1",
 *         "type": "led",
 *         "color": "red",
 *         "label": "LED Merah"
 *       },
 *       {
 *         "id": "battery-1",
 *         "type": "battery",
 *         "voltage": "9V",
 *         "label": "Baterai 9V"
 *       }
 *     ],
 *     "solution": {
 *       "connections": [
 *         { "from": "battery-1-positive", "to": "resistor-1-pin1" },
 *         { "from": "resistor-1-pin2", "to": "led-1-anode" },
 *         { "from": "led-1-cathode", "to": "battery-1-negative" }
 *       ],
 *       "explanation": "Penjelasan mengapa ini adalah solusi yang benar"
 *     },
 *     "hints": [
 *       "Hint pertama - petunjuk ringan",
 *       "Hint kedua - lebih spesifik",
 *       "Hint ketiga - hampir memberikan jawaban"
 *     ],
 *     "learning_points": [
 *       "Poin pembelajaran 1",
 *       "Poin pembelajaran 2"
 *     ],
 *     "max_hints": 3,
 *     "base_xp": 50
 *   }
 * }
 *
 * PROMPT TEMPLATE UNTUK AI (OpenAI/Claude):
 * ==========================================
 *
 * "Buatkan eksperimen elektronika interaktif dengan detail berikut:
 *
 * Topik: {topic}
 * Tingkat Kesulitan: {difficulty}
 * Tipe Eksperimen: {experiment_type}
 *
 * Buat skenario dalam bahasa Indonesia yang menarik dengan tema medieval/fantasy.
 * Contoh: 'Lentera di menara penjaga telah padam. Bantu penjaga menyalakan kembali lentera dengan merakit rangkaian LED yang benar.'
 *
 * Berikan:
 * 1. Judul eksperimen yang menarik
 * 2. Skenario cerita (2-3 kalimat)
 * 3. Objektif yang jelas
 * 4. Daftar komponen yang dibutuhkan (3-5 komponen)
 * 5. Solusi yang benar (koneksi antar komponen)
 * 6. 3 hint progresif
 * 7. Poin pembelajaran
 *
 * Format output dalam JSON sesuai struktur yang diminta."
 */

// TODO: Ganti dengan URL webhook n8n Anda
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'YOUR_N8N_WEBHOOK_URL_HERE'

// Fallback experiments jika API gagal
const fallbackExperiments = {
  components: {
    apprentice: {
      id: 'comp-app-1',
      title: 'Menyalakan Lentera Pertama',
      scenario: 'Lentera di menara penjaga telah padam. Bantu penjaga menyalakan kembali lentera dengan merakit rangkaian LED sederhana.',
      objective: 'Rakit rangkaian LED dengan resistor dan baterai agar LED menyala',
      type: 'circuit_assembly',
      components: [
        { id: 'battery-1', type: 'battery', voltage: '9V', label: 'Baterai 9V' },
        { id: 'resistor-1', type: 'resistor', value: '220Ω', label: 'Resistor 220Ω' },
        { id: 'led-1', type: 'led', color: 'red', label: 'LED Merah' }
      ],
      solution: {
        connections: [
          { from: 'battery-1-positive', to: 'resistor-1-pin1' },
          { from: 'resistor-1-pin2', to: 'led-1-anode' },
          { from: 'led-1-cathode', to: 'battery-1-negative' }
        ],
        explanation: 'Resistor membatasi arus agar LED tidak terbakar, dan rangkaian membentuk jalur tertutup dari positif ke negatif baterai.'
      },
      hints: [
        'Arus listrik mengalir dari terminal positif (+) baterai',
        'Resistor harus dipasang sebelum LED untuk melindunginya',
        'Kaki panjang LED adalah anoda (positif), kaki pendek adalah katoda (negatif)'
      ],
      learning_points: [
        'LED membutuhkan resistor untuk membatasi arus',
        'Rangkaian harus membentuk jalur tertutup',
        'Polaritas LED harus diperhatikan'
      ],
      max_hints: 3,
      base_xp: 50
    },
    journeyman: {
      id: 'comp-jou-1',
      title: 'Teka-Teki Kapasitor Ajaib',
      scenario: 'Ahli alkimia membutuhkan bantuan untuk memahami perilaku aneh kapasitor dalam eksperimennya. Kapasitor menyimpan energi, namun berapa lama ia dapat menyimpannya?',
      objective: 'Identifikasi kapasitor yang tepat dan prediksi berapa lama LED akan menyala setelah sumber daya diputus',
      type: 'component_identification',
      components: [
        { id: 'cap-1', type: 'capacitor', value: '100μF', label: 'Kapasitor 100μF' },
        { id: 'cap-2', type: 'capacitor', value: '1000μF', label: 'Kapasitor 1000μF' },
        { id: 'resistor-1', type: 'resistor', value: '1kΩ', label: 'Resistor 1kΩ' },
        { id: 'led-1', type: 'led', color: 'blue', label: 'LED Biru' },
        { id: 'switch-1', type: 'switch', label: 'Saklar' }
      ],
      solution: {
        answer: 'cap-2',
        explanation: 'Kapasitor 1000μF memiliki kapasitansi lebih besar, sehingga dapat menyimpan lebih banyak energi dan membuat LED menyala lebih lama setelah saklar dimatikan.'
      },
      hints: [
        'Kapasitor dengan nilai lebih besar dapat menyimpan lebih banyak muatan',
        'Muatan yang tersimpan = Kapasitansi × Tegangan (Q = C × V)',
        'Kapasitor 1000μF adalah 10× lebih besar dari 100μF'
      ],
      learning_points: [
        'Kapasitor menyimpan energi listrik dalam medan elektrik',
        'Nilai kapasitansi menentukan berapa banyak muatan yang dapat disimpan',
        'Kapasitor dapat digunakan untuk menciptakan penundaan waktu'
      ],
      max_hints: 3,
      base_xp: 75
    },
    master: {
      id: 'comp-mas-1',
      title: 'Krisis Transistor Gerbang',
      scenario: 'Gerbang kastil menggunakan sistem elektronik kompleks dengan transistor sebagai pengendali. Seseorang telah merusak rangkaian dan gerbang tidak mau terbuka! Analisis rangkaian transistor dan temukan kesalahan fatal.',
      objective: 'Identifikasi komponen yang rusak dan jelaskan mengapa rangkaian tidak bekerja',
      type: 'troubleshooting',
      components: [
        { id: 'transistor-1', type: 'npn-transistor', label: 'Transistor NPN (BC547)' },
        { id: 'resistor-1', type: 'resistor', value: '10kΩ', label: 'Resistor Base 10kΩ' },
        { id: 'resistor-2', type: 'resistor', value: '470Ω', label: 'Resistor Collector 470Ω' },
        { id: 'motor-1', type: 'motor', label: 'Motor Gerbang' },
        { id: 'battery-1', type: 'battery', voltage: '12V', label: 'Baterai 12V' },
        { id: 'button-1', type: 'button', label: 'Tombol Buka Gerbang' }
      ],
      solution: {
        issue: 'resistor-1-too-high',
        explanation: 'Resistor base 10kΩ terlalu besar, menyebabkan arus base tidak cukup untuk men-saturasi transistor. Transistor harus diganti dengan resistor 1kΩ agar menghasilkan arus base yang cukup (I_base = V_in / R_base).'
      },
      hints: [
        'Transistor NPN membutuhkan arus base minimal untuk aktif (biasanya 0.6-0.7V)',
        'Rumus arus base: I_base = (V_input - V_be) / R_base',
        'Untuk men-saturasi transistor, arus base harus mencapai I_c / hFE (hFE ≈ 100-200 untuk BC547)'
      ],
      learning_points: [
        'Transistor bekerja sebagai saklar elektronik',
        'Arus base mengontrol arus collector-emitter',
        'Pemilihan nilai resistor base sangat penting untuk operasi transistor'
      ],
      max_hints: 3,
      base_xp: 150
    }
  },
  circuits: {
    apprentice: {
      id: 'circ-app-1',
      title: 'Rangkaian Seri Penerangan Kastil',
      scenario: 'Tiga lentera di koridor kastil harus menyala dengan terang yang sama. Raja memerintahkan untuk menyusun rangkaian seri yang sempurna.',
      objective: 'Susun 3 LED dalam rangkaian seri dengan sumber daya 9V',
      type: 'circuit_assembly',
      components: [
        { id: 'battery-1', type: 'battery', voltage: '9V', label: 'Baterai 9V' },
        { id: 'resistor-1', type: 'resistor', value: '470Ω', label: 'Resistor 470Ω' },
        { id: 'led-1', type: 'led', color: 'red', label: 'LED Merah 1' },
        { id: 'led-2', type: 'led', color: 'red', label: 'LED Merah 2' },
        { id: 'led-3', type: 'led', color: 'red', label: 'LED Merah 3' }
      ],
      solution: {
        connections: [
          { from: 'battery-1-positive', to: 'resistor-1-pin1' },
          { from: 'resistor-1-pin2', to: 'led-1-anode' },
          { from: 'led-1-cathode', to: 'led-2-anode' },
          { from: 'led-2-cathode', to: 'led-3-anode' },
          { from: 'led-3-cathode', to: 'battery-1-negative' }
        ],
        explanation: 'Dalam rangkaian seri, arus yang sama mengalir melalui semua komponen. Total tegangan terbagi untuk setiap LED.'
      },
      hints: [
        'Dalam rangkaian seri, komponen disambungkan berurutan',
        'Katoda LED pertama terhubung ke anoda LED kedua',
        'Satu resistor di awal rangkaian cukup untuk membatasi arus'
      ],
      learning_points: [
        'Rangkaian seri memiliki satu jalur arus',
        'Arus sama di semua titik dalam rangkaian seri',
        'Tegangan total dibagi di setiap komponen'
      ],
      max_hints: 3,
      base_xp: 50
    },
    journeyman: {
      id: 'circ-jou-1',
      title: 'Misteri Paralel Menara Cahaya',
      scenario: 'Penyihir menara membutuhkan sistem penerangan di mana satu lentera padam tidak mempengaruhi yang lain. Apakah ini mungkin? Ya, dengan rangkaian paralel!',
      objective: 'Buat rangkaian paralel dengan 3 LED di mana masing-masing dapat dikontrol independen',
      type: 'circuit_assembly',
      components: [
        { id: 'battery-1', type: 'battery', voltage: '9V', label: 'Baterai 9V' },
        { id: 'resistor-1', type: 'resistor', value: '220Ω', label: 'Resistor 220Ω #1' },
        { id: 'resistor-2', type: 'resistor', value: '220Ω', label: 'Resistor 220Ω #2' },
        { id: 'resistor-3', type: 'resistor', value: '220Ω', label: 'Resistor 220Ω #3' },
        { id: 'led-1', type: 'led', color: 'green', label: 'LED Hijau' },
        { id: 'led-2', type: 'led', color: 'yellow', label: 'LED Kuning' },
        { id: 'led-3', type: 'led', color: 'blue', label: 'LED Biru' }
      ],
      solution: {
        connections: [
          { from: 'battery-1-positive', to: 'resistor-1-pin1' },
          { from: 'battery-1-positive', to: 'resistor-2-pin1' },
          { from: 'battery-1-positive', to: 'resistor-3-pin1' },
          { from: 'resistor-1-pin2', to: 'led-1-anode' },
          { from: 'resistor-2-pin2', to: 'led-2-anode' },
          { from: 'resistor-3-pin2', to: 'led-3-anode' },
          { from: 'led-1-cathode', to: 'battery-1-negative' },
          { from: 'led-2-cathode', to: 'battery-1-negative' },
          { from: 'led-3-cathode', to: 'battery-1-negative' }
        ],
        explanation: 'Dalam rangkaian paralel, setiap cabang memiliki tegangan penuh dan bekerja independen. Jika satu LED mati, yang lain tetap menyala.'
      },
      hints: [
        'Setiap LED membutuhkan resistor sendiri dalam rangkaian paralel',
        'Semua anoda LED terhubung ke sisi positif (melalui resistor)',
        'Semua katoda LED terhubung ke sisi negatif'
      ],
      learning_points: [
        'Rangkaian paralel memiliki beberapa jalur arus',
        'Tegangan sama di setiap cabang paralel',
        'Komponen dalam paralel bekerja independen'
      ],
      max_hints: 3,
      base_xp: 75
    },
    master: {
      id: 'circ-mas-1',
      title: 'Hukum Ohm dan Kekuatan Tersembunyi',
      scenario: 'Naga listrik telah mengunci harta karun dalam kubah yang hanya bisa dibuka dengan menghitung kombinasi resistansi yang tepat. Gunakan Hukum Ohm untuk mengalahkan teka-teki naga!',
      objective: 'Hitung nilai resistor yang tepat untuk menghasilkan arus 20mA pada LED dengan tegangan supply 12V (LED forward voltage = 2V)',
      type: 'prediction',
      components: [
        { id: 'battery-1', type: 'battery', voltage: '12V', label: 'Baterai 12V' },
        { id: 'resistor-unknown', type: 'resistor', value: '?', label: 'Resistor (nilai?)' },
        { id: 'led-1', type: 'led', color: 'white', label: 'LED Putih (Vf=2V)' },
        { id: 'multimeter-1', type: 'multimeter', label: 'Multimeter' }
      ],
      solution: {
        answer: '500Ω',
        calculation: 'R = (V_supply - V_led) / I = (12V - 2V) / 0.02A = 10V / 0.02A = 500Ω',
        explanation: 'Menggunakan Hukum Ohm (V = I × R), kita hitung tegangan yang harus dijatuhkan resistor (10V), lalu bagi dengan arus yang diinginkan (20mA) untuk mendapat 500Ω.'
      },
      hints: [
        'Hukum Ohm: V = I × R, atau R = V / I',
        'Tegangan yang dijatuhkan resistor = V_supply - V_led',
        'Konversi mA ke A: 20mA = 0.02A'
      ],
      learning_points: [
        'Hukum Ohm adalah dasar dari semua analisis rangkaian',
        'Resistor "menjatuhkan" tegangan berlebih',
        'Pemilihan resistor yang tepat melindungi komponen'
      ],
      max_hints: 3,
      base_xp: 150
    }
  },
  practical: {
    apprentice: {
      id: 'prac-app-1',
      title: 'Breadboard Pertamamu',
      scenario: 'Kamu menemukan papan ajaib yang dapat menghubungkan komponen tanpa solder. Namun, ada aturan aneh: beberapa lubang terhubung secara misterius!',
      objective: 'Pahami cara kerja breadboard dan rakit rangkaian LED sederhana di breadboard',
      type: 'circuit_assembly',
      components: [
        { id: 'breadboard-1', type: 'breadboard', label: 'Breadboard' },
        { id: 'battery-1', type: 'battery', voltage: '5V', label: 'Baterai 5V' },
        { id: 'resistor-1', type: 'resistor', value: '330Ω', label: 'Resistor 330Ω' },
        { id: 'led-1', type: 'led', color: 'red', label: 'LED Merah' },
        { id: 'wire-1', type: 'wire', label: 'Kabel Jumper' }
      ],
      solution: {
        placement: [
          { component: 'led-1', row: '10', column: 'e' },
          { component: 'resistor-1', row: '10', column: 'c', to_row: '8', to_column: 'c' },
          { wire: 'positive-rail', to_row: '8', to_column: 'a' },
          { wire: 'negative-rail', to_row: '10', to_column: 'f' }
        ],
        explanation: 'Breadboard memiliki rail power di sisi (+ dan -) yang terhubung vertikal, dan baris tengah terhubung horizontal dalam grup 5 lubang.'
      },
      hints: [
        'Rail + dan - di sisi breadboard terhubung vertikal',
        'Baris tengah (a-e dan f-j) terhubung horizontal',
        'Celah tengah memisahkan dua sisi breadboard'
      ],
      learning_points: [
        'Breadboard memungkinkan prototyping tanpa solder',
        'Memahami koneksi internal breadboard sangat penting',
        'Breadboard mempercepat eksperimen elektronik'
      ],
      max_hints: 3,
      base_xp: 50
    },
    journeyman: {
      id: 'prac-jou-1',
      title: 'Alarm Pintu Kastil',
      scenario: 'Kastil membutuhkan sistem alarm sederhana. Ketika pintu dibuka (saklar dilepas), buzzer harus berbunyi untuk memperingatkan penjaga!',
      objective: 'Buat alarm sederhana menggunakan saklar, buzzer, dan transistor sebagai driver',
      type: 'circuit_assembly',
      components: [
        { id: 'battery-1', type: 'battery', voltage: '9V', label: 'Baterai 9V' },
        { id: 'switch-1', type: 'switch', label: 'Saklar Pintu (NC - Normally Closed)' },
        { id: 'resistor-1', type: 'resistor', value: '1kΩ', label: 'Resistor 1kΩ' },
        { id: 'transistor-1', type: 'npn-transistor', label: 'Transistor NPN' },
        { id: 'buzzer-1', type: 'buzzer', label: 'Buzzer' },
        { id: 'resistor-2', type: 'resistor', value: '10kΩ', label: 'Resistor Pull-down 10kΩ' }
      ],
      solution: {
        connections: [
          { from: 'battery-1-positive', to: 'switch-1-com' },
          { from: 'switch-1-nc', to: 'resistor-1-pin1' },
          { from: 'resistor-1-pin2', to: 'transistor-1-base' },
          { from: 'transistor-1-base', to: 'resistor-2-pin1' },
          { from: 'resistor-2-pin2', to: 'battery-1-negative' },
          { from: 'battery-1-positive', to: 'buzzer-1-positive' },
          { from: 'buzzer-1-negative', to: 'transistor-1-collector' },
          { from: 'transistor-1-emitter', to: 'battery-1-negative' }
        ],
        explanation: 'Saklar NC (Normally Closed) terbuka saat pintu dibuka, memutus arus base. Resistor pull-down memastikan transistor off, sehingga buzzer berbunyi.'
      },
      hints: [
        'NC (Normally Closed) berarti saklar tertutup dalam kondisi normal',
        'Transistor NPN ON ketika ada arus di base',
        'Resistor pull-down memastikan base di GND saat saklar terbuka'
      ],
      learning_points: [
        'Saklar NC vs NO memiliki perilaku berbeda',
        'Transistor dapat mengontrol beban berat (buzzer)',
        'Pull-down resistor mencegah floating voltage'
      ],
      max_hints: 3,
      base_xp: 100
    },
    master: {
      id: 'prac-mas-1',
      title: 'Generator Energi Angin Ajaib',
      scenario: 'Kerajaan ingin memanfaatkan energi angin untuk menyalakan lampu. Bangun sistem yang mengubah putaran kincir menjadi cahaya, lengkap dengan penyimpanan energi untuk malam hari!',
      objective: 'Rancang sistem lengkap: motor sebagai generator, bridge rectifier, kapasitor penyimpan, dan LED sebagai beban',
      type: 'circuit_assembly',
      components: [
        { id: 'motor-1', type: 'dc-motor', label: 'Motor DC (sebagai generator)' },
        { id: 'diode-1', type: 'diode', label: 'Dioda 1N4007 #1' },
        { id: 'diode-2', type: 'diode', label: 'Dioda 1N4007 #2' },
        { id: 'diode-3', type: 'diode', label: 'Dioda 1N4007 #3' },
        { id: 'diode-4', type: 'diode', label: 'Dioda 1N4007 #4' },
        { id: 'capacitor-1', type: 'capacitor', value: '1000μF', label: 'Kapasitor 1000μF' },
        { id: 'resistor-1', type: 'resistor', value: '100Ω', label: 'Resistor 100Ω' },
        { id: 'led-1', type: 'led', color: 'white', label: 'LED Putih High-Power' }
      ],
      solution: {
        connections: [
          { from: 'motor-1-terminal1', to: 'diode-1-anode' },
          { from: 'motor-1-terminal1', to: 'diode-2-cathode' },
          { from: 'motor-1-terminal2', to: 'diode-3-anode' },
          { from: 'motor-1-terminal2', to: 'diode-4-cathode' },
          { from: 'diode-1-cathode', to: 'diode-3-cathode', label: 'V+' },
          { from: 'diode-2-anode', to: 'diode-4-anode', label: 'GND' },
          { from: 'V+', to: 'capacitor-1-positive' },
          { from: 'capacitor-1-negative', to: 'GND' },
          { from: 'V+', to: 'resistor-1-pin1' },
          { from: 'resistor-1-pin2', to: 'led-1-anode' },
          { from: 'led-1-cathode', to: 'GND' }
        ],
        explanation: 'Bridge rectifier mengubah AC dari motor menjadi DC. Kapasitor menghaluskan tegangan dan menyimpan energi. Resistor membatasi arus LED.'
      },
      hints: [
        'Bridge rectifier dibuat dari 4 dioda dalam konfigurasi khusus',
        'Motor DC dapat bekerja sebagai generator saat diputar',
        'Kapasitor besar dapat menyimpan energi untuk penggunaan sementara'
      ],
      learning_points: [
        'Motor DC adalah generator reversibel',
        'Bridge rectifier mengubah AC menjadi DC',
        'Kapasitor berfungsi sebagai penyimpan energi sementara',
        'Sistem energi terbarukan dapat disimulasikan dengan komponen sederhana'
      ],
      max_hints: 3,
      base_xp: 200
    }
  }
}

export const generateExperiment = async (topic, difficulty, experimentType = 'circuit_assembly') => {
  try {
    if (N8N_WEBHOOK_URL === 'YOUR_N8N_WEBHOOK_URL_HERE') {
      console.warn('n8n webhook URL belum dikonfigurasi, menggunakan fallback experiment')
      return getFallbackExperiment(topic, difficulty)
    }

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        difficulty,
        experiment_type: experimentType
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.experiment
  } catch (error) {
    console.error('Error fetching experiment from n8n:', error)
    return getFallbackExperiment(topic, difficulty)
  }
}

const getFallbackExperiment = (topic, difficulty) => {
  if (fallbackExperiments[topic] && fallbackExperiments[topic][difficulty]) {
    return fallbackExperiments[topic][difficulty]
  }

  return fallbackExperiments.components.apprentice
}

export const validateSolution = (userSolution, correctSolution) => {
  if (!userSolution || !correctSolution) return false

  const userConnections = JSON.stringify(userSolution.connections?.sort())
  const correctConnections = JSON.stringify(correctSolution.connections?.sort())

  return userConnections === correctConnections
}

export const calculateXP = (baseXP, difficulty, hintsUsed, maxHints) => {
  const difficultyMultipliers = {
    apprentice: 1.0,
    journeyman: 1.5,
    master: 2.5
  }

  const multiplier = difficultyMultipliers[difficulty] || 1.0
  const hintPenalty = hintsUsed / maxHints
  const hintMultiplier = 1 - (hintPenalty * 0.3)

  return Math.round(baseXP * multiplier * hintMultiplier)
}
