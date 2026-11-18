/**
 * ==============================================================================
 * WEDDING DETAILS & CLIENT CONFIGURATION (ENGLISH & KANNADA)
 * ==============================================================================
 * Update this file for each wedding / client.
 * All details here automatically update every section of the website:
 * - Opening doors & landing hero
 * - Scratch cards (Date, Month, Year)
 * - Countdown timer
 * - Ceremony cards & Google Calendar links
 * - Google Maps venue directions
 * - WhatsApp RSVP receiver
 * ==============================================================================
 */

window.SAATH = {
  root: "./",
  data: {
    theme: "jharokha-film",
    lang: "en", // Default language: "en" (English) or "hi" (ಕನ್ನಡ - Kannada)
    community: "north-hindu",

    // --------------------------------------------------------------------------
    // TRADITIONAL SACRED INVOCATION (Switches cleanly between EN and KN)
    // --------------------------------------------------------------------------
    invocation: "॥ Sri Ganeshaya Namaha ॥",     // Displayed on English page
    invocationHi: "॥ ಶ್ರೀ ಗಣೇಶಾಯ ನಮಃ ॥",   // Displayed on Kannada page

    // --------------------------------------------------------------------------
    // 1. BRIDE & GROOM DETAILS
    // --------------------------------------------------------------------------
    her: {
      en: "Kajal",
      hi: "ಕಾಜಲ್",
      full: {
        en: "Kajal Kalal",
        hi: "ಕಾಜಲ್ ಕಲಾಲ್"
      },
      vibe: {
        en: "Grace and smile",
        hi: "ಮಧುರ ನಗು ಹಾಗೂ ಸೌಮ್ಯ ಸ್ವಭಾವ"
      },
      loves: ["music", "books", "flowers", "camera"]
    },

    him: {
      en: "Anmol",
      hi: "ಅನ್ಮೋಲ್",
      full: {
        en: "Anmol Parishwad",
        hi: "ಅನ್ಮೋಲ್ ಪಾರಿಶ್ವಾಡ್"
      },
      vibe: {
        en: "Calm and clever",
        hi: "ಶಾಂತ ಹಾಗೂ ಪ್ರಬುದ್ಧ ವ್ಯಕ್ತಿತ್ವ"
      },
      loves: ["cricket", "travel", "coffee-mug", "mountains"]
    },

    // --------------------------------------------------------------------------
    // 2. PARENTS' DETAILS
    // --------------------------------------------------------------------------
    parents: {
      her: {
        en: "Smt. Vandana & Shri Nagaraj Kalal",
        hi: "ಶ್ರೀಮತಿ ವಂದನಾ ಮತ್ತು ಶ್ರೀ ನಾಗರಾಜ್ ಕಲಾಲ್"
      },
      him: {
        en: "Smt. Padma & Shri Vilas Parishwad",
        hi: "ಶ್ರೀಮತಿ ಪದ್ಮಾ ಮತ್ತು ಶ್ರೀ ವಿಲಾಸ್ ಪಾರಿಶ್ವಾಡ್"
      }
    },

    // --------------------------------------------------------------------------
    // 3. WEDDING DATE, TIME & LOCATION
    // --------------------------------------------------------------------------
    wedding: "2026-12-18T12:01:00+05:30", // ISO format YYYY-MM-DDTHH:mm:ss+05:30
    city: {
      en: "Alnavar",
      hi: "ಅಳ್ನಾವರ"
    },
    journey: {
      from: {
        en: "Karnataka",
        hi: "ಕರ್ನಾಟಕ"
      }
    },

    // --------------------------------------------------------------------------
    // 4. VENUE DETAILS & GOOGLE MAPS
    // --------------------------------------------------------------------------
    venue: {
      name: {
        en: "Veerashaiva Kalyana Mantap",
        hi: "ವೀರಶೈವ ಕಲ್ಯಾಣ ಮಂಟಪ"
      },
      address: {
        en: "Alnavar, Dharwad District, Karnataka 581103",
        hi: "ಅಳ್ನಾವರ, ಧಾರವಾಡ ಜಿಲ್ಲೆ, ಕರ್ನಾಟಕ 581103"
      },
      map: "https://www.google.com/maps/search/?api=1&query=Veerashaiva+Kalyana+Mantap+Alnavar"
    },

    travel: [
      {
        en: "Alnavar Junction (LWR) railway station is just 5 minutes away.",
        hi: "ಅಳ್ನಾವರ ಜಂಕ್ಷನ್ (LWR) ರೈಲ್ವೆ ನಿಲ್ದಾಣ ಕೇವಲ 5 ನಿಮಿಷಗಳ ದೂರದಲ್ಲಿದೆ."
      }
    ],

    stay: [
      {
        name: {
          en: "Veerashaiva Kalyana Mantap Guest Rooms",
          hi: "ವೀರಶೈವ ಕಲ್ಯಾಣ ಮಂಟಪ ಅತಿಥಿ ಗೃಹ"
        },
        note: {
          en: "Accommodations and hospitality arranged for family and guests.",
          hi: "ಬಂಧು-ಮಿತ್ರರಿಗೆ ಹಾಗೂ ಅತಿಥಿಗಳಿಗೆ ವಸತಿ ಸೌಕರ್ಯ ಕಲ್ಪಿಸಲಾಗಿದೆ."
        }
      }
    ],

    // --------------------------------------------------------------------------
    // 5. WEDDING EVENTS & ITINERARY
    // --------------------------------------------------------------------------
    events: [
      {
        id: "mehendi",
        name: {
          en: "Haldi",
          hi: "ಅರಿಶಿನ"
        },
        start: "2026-12-16T19:00:00+05:30",
        end: "2026-12-16T22:00:00+05:30",
        place: {
          en: "Nagaraj Kalal Residence",
          hi: "ನಾಗರಾಜ್ ಕಲಾಲ್ ನಿವಾಸ"
        },
        dress: {
          en: "Sunny Yellows and Vibrant Greens",
          hi: "ಹಳದಿ ಮತ್ತು ಹಸಿರು ಸಾಂಪ್ರದಾಯಿಕ ಉಡುಪು"
        },
        palette: ["#e9a61c", "#4f7a3a", "#f4e3c3"]
      },
      {
        id: "wedding",
        name: {
          en: "Shubh Vivah (Wedding Ceremony)",
          hi: "ಶುಭ ವಿವಾಹ ಮಹೋತ್ಸವ"
        },
        start: "2026-12-18T12:01:00+05:30",
        end: "2026-12-18T18:00:00+05:30",
        place: {
          en: "Veerashaiva Kalyana Mantap, Alnavar",
          hi: "ವೀರಶೈವ ಕಲ್ಯಾಣ ಮಂಟಪ, ಅಳ್ನಾವರ"
        },
        dress: {
          en: "Traditional Karnataka Silk & Festive Attire",
          hi: "ಸಾಂಪ್ರದಾಯಿಕ ರೇಷ್ಮೆ ಸೀರೆ ಮತ್ತು ಸಾಂಪ್ರದಾಯಿಕ ಉಡುಪು"
        },
        palette: ["#a3122f", "#e88b1e", "#f6ecd6"]
      }
    ],

    // --------------------------------------------------------------------------
    // 6. OUR STORY & MILESTONES (OPTIONAL)
    // --------------------------------------------------------------------------
    story: {
      en: "Two hearts brought together by tradition, destiny, and the blessings of our families. We look forward to beginning our lifetime journey together with you.",
      hi: "ಸಂಪ್ರದಾಯ, ಅದೃಷ್ಟ ಮತ್ತು ಕುಟುಂಬದ ಹಿರಿಯರ ಆಶೀರ್ವಾದದಿಂದ ಒಂದಾದ ಎರಡು ಮನಸ್ಸುಗಳು. ನಮ್ಮ ಜೀವನದ ಈ ಹೊಸ ಅಧ್ಯಾಯಕ್ಕೆ ತಮ್ಮೆಲ್ಲರ ಶುಭ ಹಾರೈಕೆಗಳನ್ನು ಕೋರುತ್ತೇವೆ."
    },
    timeline: [
      {
        when: {
          en: "First Meeting",
          hi: "ಮೊದಲ ಭೇಟಿ"
        },
        what: {
          en: "When two families met and smiles matched",
          hi: "ಕುಟುಂಬದವರು ಭೇಟಿಯಾಗಿ ಹರಸಿದ ಸವಿ ಮುಹೂರ್ತ"
        }
      },
      {
        when: {
          en: "Engagement",
          hi: "ನಿಶ್ಚಿತಾರ್ಥ"
        },
        what: {
          en: "Rings exchanged with heartfelt blessings",
          hi: "ಉಂಗುರ ಬದಲಾಯಿಸಿ ಹಿರಿಯರ ಆಶೀರ್ವಾದ ಪಡೆದ ಕ್ಷಣ"
        }
      },
      {
        when: {
          en: "18 December 2026",
          hi: "18 ಡಿಸೆಂಬರ್ 2026"
        },
        what: {
          en: "The sacred seven pheras around the holy fire",
          hi: "ವೇದ ಮಂತ್ರಗಳ ಘೋಷದ ನಡುವೆ ಸಪ್ತಪದಿ ಹಾಗೂ ಮಾಂಗಲ್ಯ ಧಾರಣೆ"
        }
      }
    ],

    // --------------------------------------------------------------------------
    // 7. PHOTO GALLERY CAROUSEL
    // --------------------------------------------------------------------------
    photos: [
      {
        src: "assets/images/couple/slide1-stage-wreath.jpg",
        caption: {
          en: "Together in Love",
          hi: "ಪ್ರೀತಿಯ ಸುಂದರ ಕ್ಷಣ"
        }
      },
      {
        src: "assets/images/couple/slide2-sunset-beach.jpg",
        caption: {
          en: "Sunset Whispers",
          hi: "ಸೂರ್ಯಾಸ್ತದ ಮಧುರ ನೆನಪು"
        }
      },
      {
        src: "assets/images/couple/slide3-nature-couple.jpg",
        caption: {
          en: "Walking Hand in Hand",
          hi: "ಜೊತೆಯಾಗಿ ಸಾಗುವ ಹೆಜ್ಜೆ"
        }
      },
      {
        src: "assets/images/couple/slide4-romantic-portrait.jpg",
        caption: {
          en: "A Lifetime Together",
          hi: "ಸದಾ ಜೊತೆಯಾಗಿ, ಸದಾ ಒಂದಾಗಿ"
        }
      }
    ],

    // --------------------------------------------------------------------------
    // 8. FAMILY BLESSINGS & WELCOME
    // --------------------------------------------------------------------------
    family: {
      blessings: [
        {
          en: "With the loving blessings of our ancestors and elders",
          hi: "ಕುಲದೇವರ ಹಾಗೂ ಗುರು-ಹಿರಿಯರ ದಿವ್ಯ ಆಶೀರ್ವಾದಗಳೊಂದಿಗೆ"
        }
      ],
      darshanabhilashi: [
        {
          en: "The Kalal Family & The Parishwad Family",
          hi: "ಕಲಾಲ್ ಪರಿವಾರ ಮತ್ತು ಪಾರಿಶ್ವಾಡ್ ಪರಿವಾರ"
        }
      ],
      swagatotsuk: [
        {
          en: "All Relatives & Friends",
          hi: "ಸಮಸ್ತ ಬಂಧು-ಮಿತ್ರರು ಹಾಗೂ ಆಪ್ತರು"
        }
      ],
      kids: []
    },

    // --------------------------------------------------------------------------
    // 9. WHATSAPP RSVP SETTINGS
    // --------------------------------------------------------------------------
    rsvp: true,
    rsvpBy: "2026-12-10",
    rsvpPhone: "919743933689", // Host's WhatsApp number with country code (e.g., 91 for India)

    // --------------------------------------------------------------------------
    // 10. BACKGROUND SONG & FOOTER SIGNOFF
    // --------------------------------------------------------------------------
    music: "assets/audio/shehnai-theme.mp3",
    song: {
      url: "https://open.spotify.com/search/Judi%20Jodi%20Ramayana",
      cover: "assets/images/couple/song-cover.jpg",
      title: {
        en: "Jodi Jodi (Ramayan)",
        hi: "ಜೋಡಿ ಜೋಡಿ (ರಾಮಾಯಣ)"
      },
      artist: "A.R. Rahman · Shreya Ghoshal"
    },
    signoff: {
      en: "With love, the Kalal and Parishwad families",
      hi: "ಪ್ರೀತಿಪೂರ್ವಕ, ಕಲಾಲ್ ಮತ್ತು ಪಾರಿಶ್ವಾಡ್ ಕುಟುಂಬ"
    }
  },
  draft: false,
  family: null,
  slug: null,
  api: null,
  familyKey: null
};
