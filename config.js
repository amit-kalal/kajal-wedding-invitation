/**
 * ==============================================================================
 * KAJAL & ANMOL WEDDING INVITATION CONFIGURATION
 * ==============================================================================
 * Welcome! This is the only file you need to edit to update names, dates,
 * timings, venue addresses, or your WhatsApp phone number.
 * 
 * Simply change the text inside the quotation marks "" and save!
 * ==============================================================================
 */

const WEDDING_CONFIG = {
  // --- Couple Details ---
  couple: {
    bride: "Kajal",
    groom: "Anmol",
    hashtag: "#KajalWedsAnmol",
    monogram: "K & A"
  },

  // --- Auspicious Wedding Date (Used for the live countdown & scratch card) ---
  date: {
    year: 2026,
    month: 12,       // December (12)
    day: 18,         // 18th
    displayDate: "Friday, 18 December 2026",
    muhurthamTime: "12:01 PM onwards"
  },

  // --- Parents & Family Blessings ---
  family: {
    brideSide: {
      mother: "Smt. Vandana Kalal",
      father: "Shri Nagaraj Kalal",
      relationText: "Daughter of Smt. Vandana & Shri Nagaraj Kalal"
    },
    groomSide: {
      mother: "Smt. Padma Parishwad",
      father: "Shri Vilas Parishwad",
      relationText: "Son of Smt. Padma & Shri Vilas Parishwad"
    },
    welcomeQuote: "With the divine blessings of our beloved ancestors and family elders, we warmly welcome you and your family to celebrate the sacred union of our children."
  },

  // --- Venue & Location Details ---
  venue: {
    name: "Veerashaiva Kalyana Mantap",
    city: "Alnavar",
    state: "Karnataka",
    fullAddress: "Veerashaiva Kalyana Mantap, Station Road, Alnavar, Karnataka 581103",
    // This direct link opens Google Maps app on your guests' phones:
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Veerashaiva+Kalyana+Mantap+Alnavar",
    travelNote: "Easily accessible from Alnavar Junction Railway Station (5 mins) and Hubballi/Dharwad (approx. 40 mins drive)."
  },

  // --- Itinerary of Celebrations ---
  events: [
    {
      id: "haldi",
      title: "Haldi",
      kannadaTitle: "ಅರಿಶಿನ",
      date: "Wednesday, 16 December 2026",
      time: "07:00 PM Onwards",
      venue: "Nagaraj Kalal Residence",
      dressCode: "Sunny Yellows and Vibrant Greens",
      description: "A joyful celebration of auspicious turmeric, traditional folk songs, and blessings.",
      calendarStartDate: "20261216T190000",
      calendarEndDate: "20261216T220000"
    },
    {
      id: "wedding",
      title: "Shubh Vivah (Wedding Ceremony)",
      kannadaTitle: "ಶುಭ ವಿವಾಹ ಮಹೋತ್ಸವ",
      date: "Friday, 18 December 2026",
      time: "12:01 PM Auspicious Muhurtham",
      venue: "Veerashaiva Kalyana Mantap, Alnavar",
      dressCode: "Traditional Karnataka Silk Sarees & Festive Attire",
      description: "The sacred saat phere around the holy agni, exchanging varmala garlands and eternal vows.",
      calendarStartDate: "20261218T120100",
      calendarEndDate: "20261218T180000"
    }
  ],

  // --- Zero-Backend WhatsApp RSVP Settings ---
  // Put your 10 or 12 digit WhatsApp number below (with country code, no + or spaces).
  // Example for India: "919876543210"
  whatsapp: {
    recipientPhone: "919743933689", 
    hostContactName: "Kalal & Parishwad Family"
  },

  // --- Background Music ---
  // If you place your favorite royal wedding MP3 in assets/audio/theme.mp3,
  // set customAudioPath: "assets/audio/theme.mp3"
  audio: {
    title: "Jodi Jodi (Ramayan) - A.R. Rahman & Shreya Ghoshal",
    customAudioPath: "assets/audio/shehnai-theme.mp3",
    spotifySearchUrl: "https://open.spotify.com/search/Judi%20Jodi%20Ramayana",
    useSyntheticFallback: true
  }
};
