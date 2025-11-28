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
      id: 'fallback-1',
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
