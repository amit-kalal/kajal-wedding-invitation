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
      url: "https://open.spotify.com/track/01f30LJ0lcCbO152FJIxSU",
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


// Embedded theme configuration for 100% offline & file:// protocol compatibility
window.SAATH_THEME = {
  "layout": "keepsake",
  "id": "jharokha-film",
  "name": "Jharokha Film",
  "line": "Jharokha as a film: the carved haveli doors swing open and your guests walk into a courtyard lit with diyas.",
  "story": "In Rajasthan's old merchant towns, Marwari families built havelis around open courtyards, with carved wooden doors on the street and jharokhas, screened stone balconies, above it. A Rajasthani wedding begins at such a door: before the groom is welcomed in, he touches the toran hung over the bride's entrance. Jharokha draws on that architecture and on the miniature painting of the Mewar and Kishangarh courts, gouache and gold on layered wasli paper.",
  "palette": {
    "ink": "#2B1B17",
    "paper": "#EFDEBF",
    "accent": "#B3261E",
    "accent2": "#E8891C",
    "gold": "#C2933F",
    "night": "#1D2347"
  },
  "fonts": {
    "script": "Pinyon Script",
    "serif": "Cormorant Garamond",
    "deva": "Tiro Devanagari Hindi",
    "display": "Bodoni Moda"
  },
  "moods": {
    "haldi": {
      "accent": "#E9A61C",
      "paper": "#F7E7B5"
    },
    "mehendi": {
      "accent": "#5B7B2F",
      "paper": "#F3E3D8"
    },
    "sangeet": {
      "accent": "#D6457A",
      "paper": "#1D2347",
      "ink": "#EFDEBF"
    },
    "wedding": {
      "accent": "#B3261E",
      "paper": "#F2DFC4"
    },
    "reception": {
      "accent": "#C2933F",
      "paper": "#F5EFE4"
    }
  },
  "opening": {
    "type": "keepsake",
    "gesture": "doors",
    "film": "opening.mp4",
    "first": "opening-first.webp",
    "last": "opening-last.webp",
    "aspect": "9 / 16",
    "focus": [
      0.12,
      0.15,
      0.88,
      0.92
    ],
    "tap": [
      0.15,
      0.2,
      0.85,
      0.88
    ],
    "from": 0.3,
    "rate": 1.25,
    "writeAt": 8.2,
    "names": {
      "left": 0.17,
      "top": 0.06,
      "right": 0.83,
      "bottom": 0.235
    },
    "tone": "light",
    "hint": {
      "en": "Tap the doors to open",
      "hi": "खोलने के लिए दरवाज़े छुएँ"
    },
    "filmNote": "Jharokha as a film, a Royal design beside the Premium Jharokha (Gautam, 31 Oct 2026): photoreal carved haveli doors open and the camera walks into a courtyard lit with diyas (Flow: Nano Banana keyframes jharokha-k0/k1, a Veo 3.1 Fast clip, the film's own first and last frames). Its page art is Jharokha's own (picks.json points at ../jharokha).",
    "edge": {
      "top": "#855c45",
      "bottom": "#a15f38"
    }
  },
  "art": {
    "closed": "closed.webp",
    "hero": "hero.webp",
    "paper": "paper.webp",
    "frame": "frame.webp",
    "divider": "divider.webp",
    "corner": "corner.webp",
    "motif": "motif.webp",
    "frameZone": {
      "left": 0.17,
      "top": 0.26,
      "right": 0.83,
      "bottom": 0.83
    },
    "heroCouple": null,
    "cardHero": {
      "file": "closed.webp",
      "focus": [
        0.5,
        0.5
      ]
    },
    "fn": {
      "haldi": "fn-haldi.webp",
      "mehendi": "fn-mehendi.webp",
      "sangeet": "fn-sangeet.webp",
      "wedding": "fn-wedding.webp",
      "reception": "fn-reception.webp"
    },
    "venue": "venue.webp",
    "dress": "dress.webp",
    "scenes": {
      "invite": {
        "file": "scene-invite.webp",
        "corners": null
      },
      "welcome": {
        "file": "scene-welcome.webp",
        "corners": null
      },
      "table": {
        "file": "scene-table.webp",
        "corners": null
      },
      "favour": {
        "file": "scene-favour.webp",
        "corners": null
      }
    }
  }
};
