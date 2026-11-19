/*
 * The invite engine. One static player for every collection and every couple.
 *
 * The page that loads it sets window.SAATH = { root, data } (web/src/lib/server/invite-html.ts):
 * the couple's record, and where the themes live. It reads the collection's
 * themes/<id>/theme.json (the couple's choice, or ?t=<id> to try another), then draws the
 * opening, the hero and every section the couple has filled in. A section with nothing to
 * show is left out entirely. ?f=<family> greets one family and shows only the functions
 * that family is invited to; ?lang=hi|en picks the language. In the builder's preview
 * (SAATH.draft), the record comes from this browser and the page keeps its place on reload.
 */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const params = new URLSearchParams(location.search);
  const SAATH = window.SAATH || {};
  const ROOT = SAATH.root || "";
  const slug = (params.get("c") || "demo").replace(/[^a-z0-9-]/gi, "");
  // Photos and voice notes come from the website as absolute URLs; older records name files beside the couple.
  const media = (src) => (/^(data:|blob:|https?:|\/|assets)/.test(src) ? src : `${ROOT}couples/${slug}/${src}`);
  // The family: from the page (a family's own link, i/<slug>/<key>, resolved by the site), or ?f=.
  const familyParam = (SAATH.family || params.get("f") || "").trim().slice(0, 40);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // The opening words never start higher than this share of the painting's height.
  const TOP_ROOM = 0.075;

  // ───────── Words ─────────
  // A name in the words around it: "the Sharma family" after "For" or "From", a person's name and
  // "Rakesh Roy & family" as they are, and "family" as परिवार on a Hindi page.
  const theFam = (f) => (/\sfamily$/i.test(f) && !/(&|\band)\s+family$/i.test(f) ? `the ${f}` : f);
  const hiFam = (f) => f.replace(/\s+family$/i, " परिवार");
  const UI = {
    en: {
      dear: (f) => `Dear ${f}`, dearSub: "you are warmly invited",
      invited: "You're invited", invitedSub: (c) => `to a wedding in ${c}`,
      hint: { envelope: "Tap the seal to open", doors: "Tap the doors to open", curtains: "Tap to open the curtains", newspaper: "Tap to read the news", lotus: "Tap the lotus to open", lamp: "Tap the lamp to light it", chandelier: "Tap to light the hall", rice: "Tap to shower the rice", bandhani: "Tap to untie the bandhani", kohbar: "Tap to paint the kohbar" },
      openLabel: "Open the invitation",
      welcome: "Welcome to the wedding of", amp: "&", down: "Scroll down",
      today: (n, t, p) => `Today: ${n} at ${t}${p ? `, ${p}` : ""}`,
      dateT: "The Date", scratch: "Scratch to reveal the date", scratchMany: "Scratch to reveal the dates", revealing: "Revealing the date", day: "Day", month: "Month", year: "Year", date: "Date",
      scratchLabel: (u) => `Scratch to reveal the ${u.toLowerCase()}`, revealed: (u, v) => `${u}: ${v}`,
      whenLine: (wd, time) => `${wd}, at ${time}`, addCal: "Add to calendar",
      // A function with no set end, as cards say it: "6:00 pm onwards" (onwards, 11 November 2026).
      fromTime: (time) => `${time} onwards`, whenFrom: (wd, time) => `${wd}, ${time} onwards`,
      blessing: "With the blessings of our elders, you are invited to the wedding of",
      ownVoice: "Together with our families, we invite you to our wedding",
      daughter: "Daughter of", son: "Son of", with: "with", close: "",
      dearAll: "Dear friends and family",
      storyT: "Our story", photosT: "Us, so far", swipe: "Swipe to see more",
      eventsT: "The celebrations",
      countT: "The celebration begins", units: ["Days", "Hours", "Minutes", "Seconds"],
      countTo: (n, d) => `until the ${n}, on ${d}`,
      venueT: "Location", maps: "Open in Google Maps", mapTitle: (v) => `Map of ${v}`, showMap: "Show the map", directions: "Directions",
      travelT: "Getting there", stayT: "Where to stay",
      dressT: "Dress code", dressLede: "A colour for each function, if you'd like a hint.",
      familyT: "Our families", blessT: "With the blessings of", darshan: "Eager to see you", swagat: "Waiting to welcome you", kids: "Don't you dare miss it",
      kidsLine: (k) => `${k} say: you must come to the wedding!`,
      songT: "Our song", songPlay: "Play our song", songFrom: (s) => `Plays on ${s}`,
      voiceT: "A word from our parents", voicePlay: "Listen",
      rsvpT: "Will you join us?", rsvpLede: (d) => `Please let us know how many of you are coming to each function, by ${d}.`,
      familyLabel: "Your name", familyPh: "e.g. Shreya Sharma",
      fewer: (n) => `One fewer for ${n}`, more: (n) => `One more for ${n}`,
      send: "Send your reply",
      rsvpNote: "Your reply reaches them as soon as you send it, and WhatsApp opens with it written out too.",
      needFamily: "Add your name, so they know who's coming.",
      confirmT: "Your reply", confirmFrom: (f) => `From ${theFam(f)}`, notComing: "Not coming",
      confirmNote: (c) => `It goes to ${c} as soon as you send it. WhatsApp opens with it written out too.`,
      confirmSend: "Send", confirmBack: "Change",
      doneT: "Thank you", doneLine: (c) => `Your reply has reached ${c}.`, doneChange: "Change your reply",
      saveFailed: "Your reply didn't reach them from here. Press send in WhatsApp so they still get it.",
      // Without the RSVP manager, the reply goes on WhatsApp only.
      waSend: "Send on WhatsApp", waNote: "This opens WhatsApp with your reply written out. Nothing is sent until you press send.",
      waConfirmNote: (c) => `WhatsApp opens with it written out. Press send there and it reaches ${c}.`, waConfirmSend: "Open WhatsApp",
      contactsT: "If you need anything", call: "Call", callTo: (n) => `Call ${n}`,
      shagunT: "Shagun", shagunLede: "If you'd like to send your blessings from afar.", pay: "Send by UPI",
      upiK: "UPI ID", upiTap: "Tap to copy", upiCopied: "Copied", upiCopy: "Copy the UPI ID",
      thanksT: "Thank you", thanksLede: "For coming, for every blessing, and for making it ours.",
      made: "Invite made with", langSwitch: "ಕನ್ನಡ",
      waIntro: (f, c) => `Namaste! RSVP${f ? ` from ${theFam(f)}` : ""} for ${c}'s wedding:`,
      fests: "celebrations", andJoin: "&", pairJoin: "&",
      locale: "en-IN",
    },
    hi: {
      dear: (f) => `ಆತ್ಮೀಯ ${f} ಕುಟುಂಬದವರಿಗೆ`, dearSub: "ಹಾರ್ದಿಕ ಆಮಂತ್ರಣ",
      invited: "ಹಾರ್ದಿಕ ಆಮಂತ್ರಣ", invitedSub: (c) => `${c}ದಲ್ಲಿ ನಡೆಯುವ ಶುಭ ವಿವಾಹ ಮಹೋತ್ಸವಕ್ಕೆ`,
      hint: { envelope: "ತೆರೆಯಲು ಮುದ್ರೆಯನ್ನು ಸ್ಪರ್ಶಿಸಿ", doors: "ತೆರೆಯಲು ಬಾಗಿಲನ್ನು ಸ್ಪರ್ಶಿಸಿ", curtains: "ಪರದೆ ಸರಿಸಲು ಸ್ಪರ್ಶಿಸಿ", newspaper: "ಸುದ್ದಿ ಓದಲು ಸ್ಪರ್ಶಿಸಿ", lotus: "ತೆರೆಯಲು ಕಮಲವನ್ನು ಸ್ಪರ್ಶಿಸಿ", lamp: "ದೀಪ ಬೆಳಗಿಸಲು ಸ್ಪರ್ಶಿಸಿ", chandelier: "ದೀಪ ಬೆಳಗಿಸಲು ಸ್ಪರ್ಶಿಸಿ", rice: "ಅಕ್ಷತೆ ಹಾಕಲು ಸ್ಪರ್ಶಿಸಿ", bandhani: "ತೆರೆಯಲು ಸ್ಪರ್ಶಿಸಿ", kohbar: "ಚಿತ್ರಿಸಲು ಸ್ಪರ್ಶಿಸಿ" },
      openLabel: "ಆಹ್ವಾನ ಪತ್ರಿಕೆ ತೆರೆಯಿರಿ",
      welcome: "ಶುಭ ವಿವಾಹ", amp: "ಮತ್ತು", down: "ಕೆಳಗೆ ಸ್ಕ್ರಾಲ್ ಮಾಡಿ",
      today: (n, t, p) => `ಇಂದು: ${n}, ${t} ಗಂಟೆಗೆ${p ? `, ${p}` : ""}`,
      dateT: "ಶುಭ ದಿನಾಂಕ", scratch: "ದಿನಾಂಕ ತಿಳಿಯಲು ಸ್ಕ್ರ್ಯಾಚ್ ಮಾಡಿ", scratchMany: "ದಿನಾಂಕಗಳನ್ನು ತಿಳಿಯಲು ಸ್ಕ್ರ್ಯಾಚ್ ಮಾಡಿ", revealing: "ದಿನಾಂಕ ತೆರೆದುಕೊಳ್ಳುತ್ತಿದೆ", day: "ದಿನ", month: "ತಿಂಗಳು", year: "ವರ್ಷ", date: "ದಿನಾಂಕ",
      scratchLabel: (u) => `${u} ತಿಳಿಯಲು ಸ್ಕ್ರ್ಯಾಚ್ ಮಾಡಿ`, revealed: (u, v) => `${u}: ${v}`,
      whenLine: (wd, time) => `${wd}, ${time} ಗಂಟೆಗೆ`, addCal: "ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸೇರಿಸಿ",
      fromTime: (time) => `${time} ಗಂಟೆಯಿಂದ`, whenFrom: (wd, time) => `${wd}, ${time} ಗಂಟೆಯಿಂದ`,
      blessing: "ಗುರು-ಹಿರಿಯರ ದಿವ್ಯ ಆಶೀರ್ವಾದದೊಂದಿಗೆ", ownVoice: "ನಮ್ಮ ಕುಟುಂಬದವರೊಂದಿಗೆ, ನಮ್ಮ ವಿವಾಹ ಮಹೋತ್ಸವಕ್ಕೆ ನಿಮ್ಮನ್ನು ಪ್ರೀತಿಯಿಂದ ಆಹ್ವಾನಿಸುತ್ತಿದ್ದೇವೆ",
      daughter: "ಸುಪುತ್ರಿ", son: "ಸುಪುತ್ರ", with: "ಮತ್ತು", close: "ನಮ್ಮ ಈ ಶುಭ ವಿವಾಹ ಮಹೋತ್ಸವಕ್ಕೆ ತಾವು ಸಕುಟುಂಬ ಸಮೇತರಾಗಿ ಆಗಮಿಸಿ, ವಧು-ವರರನ್ನು ಆಶೀರ್ವದಿಸಬೇಕಾಗಿ ವಿನಂತಿ.",
      dearAll: "ಆತ್ಮೀಯ ಬಂಧು-ಮಿತ್ರರೇ",
      storyT: "ನಮ್ಮ ಪರಿಚಯ", photosT: "ನಮ್ಮ ಸವಿ ನೆನಪುಗಳು", swipe: "ಇನ್ನಷ್ಟು ನೋಡಲು ಸರಿಸಿ",
      eventsT: "ಶುಭ ಸಮಾರಂಭಗಳು",
      countT: "ಮದುವೆಗೆ ಇನ್ನು", units: ["ದಿನ", "ಗಂಟೆ", "ನಿಮಿಷ", "ಸೆಕೆಂಡ್"],
      countTo: (n, d) => `${d} ರಂದು ${n}ಗೆ`,
      venueT: "ವಿವಾಹ ಸ್ಥಳ", maps: "ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್‌ನಲ್ಲಿ ನೋಡಿ", mapTitle: (v) => `${v} ನಕ್ಷೆ`, showMap: "ನಕ್ಷೆ ತೋರಿಸಿ", directions: "ದಾರಿಯ ಮಾಹಿತಿ",
      travelT: "ತಲುಪುವುದು ಹೇಗೆ", stayT: "ವಸತಿ ವ್ಯವಸ್ಥೆ",
      dressT: "ಉಡುಪಿನ ಶೈಲಿ", dressLede: "ಪ್ರತಿಯೊಂದು ಸಮಾರಂಭಕ್ಕೂ ಸಾಂಪ್ರದಾಯಿಕ ಬಣ್ಣಗಳ ಸೂಚನೆ.",
      familyT: "ನಮ್ಮ ಕುಟುಂಬ", blessT: "ಆಶೀರ್ವಾದಗಳೊಂದಿಗೆ", darshan: "ದರ್ಶನಾಭಿಲಾಷಿಗಳು", swagat: "ಸ್ವಾಗತ ಕೋರುವವರು", kids: "ಮಕ್ಕಳ ಆಹ್ವಾನ",
      kidsLine: (k) => `${k}: ಮದುವೆಗೆ ತಪ್ಪದೇ ಬನ್ನಿ!`,
      songT: "ಮಂಗಳ ವಾದ್ಯ ಸಂಗೀತ", songPlay: "ಸಂಗೀತ ಆಲಿಸಿ", songFrom: (s) => `${s} ನಲ್ಲಿ ಕೇಳಿ`,
      voiceT: "ತಂದೆ-ತಾಯಿಯವರ ಆಶೀರ್ವಚನ", voicePlay: "ಕೇಳಿ",
      rsvpT: "ತಮ್ಮ ಉಪಸ್ಥಿತಿ ದೃಢೀಕರಿಸಿ (RSVP)", rsvpLede: (d) => `ಆತಿಥ್ಯದ ಸಿದ್ಧತೆಗಾಗಿ ದಯವಿಟ್ಟು ${d} ರೊಳಗೆ ತಿಳಿಸಿ.`,
      familyLabel: "ತಮ್ಮ ಹೆಸರು", familyPh: "ಉದಾ: ರಮೇಶ್ ಕುಮಾರ್",
      fewer: (n) => `${n}ಗೆ ಒಬ್ಬರು ಕಡಿಮೆ`, more: (n) => `${n}ಗೆ ಇನ್ನೊಬ್ಬರು`,
      send: "ಉತ್ತರ ಕಳುಹಿಸಿ",
      rsvpNote: "ಕಳುಹಿಸಿದ ತಕ್ಷಣ ನಿಮ್ಮ ಉತ್ತರ ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಸಿದ್ಧವಾಗುತ್ತದೆ.",
      needFamily: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರು ನಮೂದಿಸಿ.",
      confirmT: "ನಿಮ್ಮ ಉತ್ತರ", confirmFrom: (f) => `${f} ಕುಟುಂಬದ ಕಡೆಯಿಂದ`, notComing: "ಬರಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ",
      confirmNote: (c) => `ಇದು ${c} ಅವರಿಗೆ ತಲುಪುತ್ತದೆ. ವಾಟ್ಸಾಪ್‌ನಲ್ಲೂ ತೆರೆಯುತ್ತದೆ.`,
      confirmSend: "ಕಳುಹಿಸಿ", confirmBack: "ಬದಲಾಯಿಸಿ",
      doneT: "ಧನ್ಯವಾದಗಳು", doneLine: (c) => `ನಿಮ್ಮ ಉತ್ತರ ${c} ಅವರಿಗೆ ತಲುಪಿದೆ.`, doneChange: "ಉತ್ತರ ಬದಲಾಯಿಸಿ",
      saveFailed: "ಉತ್ತರ ಕಳುಹಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ವಾಟ್ಸಾಪ್ ಮೂಲಕ ಕಳುಹಿಸಿ.",
      waSend: "ವಾಟ್ಸಾಪ್ ಮೂಲಕ ಕಳುಹಿಸಿ", waNote: "ಇದು ನಿಮ್ಮ ಉತ್ತರದೊಂದಿಗೆ ವಾಟ್ಸಾಪ್ ತೆರೆಯುತ್ತದೆ. ನೀವು ಸೆಂಡ್ ಬಟನ್ ಒತ್ತುವವರೆಗೂ ಏನೂ ಕಳುಹಿಸಲ್ಪಡುವುದಿಲ್ಲ.",
      waConfirmNote: (c) => `ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಇದು ತೆರೆಯುತ್ತದೆ. ಅಲ್ಲಿ ಸೆಂಡ್ ಒತ್ತಿದರೆ ${c} ಅವರಿಗೆ ತಲುಪುತ್ತದೆ.`, waConfirmSend: "ವಾಟ್ಸಾಪ್ ತೆರೆಯಿರಿ",
      contactsT: "ಸಂಪರ್ಕಕ್ಕಾಗಿ", call: "ಕರೆ ಮಾಡಿ", callTo: (n) => `${n} ಗೆ ಕರೆ ಮಾಡಿ`,
      shagunT: "ಹಾರ್ದಿಕ ಕಾಣಿಕೆ", shagunLede: "ದೂರದಿಂದಲೇ ಆಶೀರ್ವಾದ ಕಳುಹಿಸಲು ಬಯಸಿದರೆ.", pay: "UPI ಮೂಲಕ ಕಳುಹಿಸಿ",
      upiK: "UPI ಐಡಿ", upiTap: "ಕಾಪಿ ಮಾಡಲು ಸ್ಪರ್ಶಿಸಿ", upiCopied: "ಕಾಪಿ ಮಾಡಲಾಗಿದೆ", upiCopy: "UPI ಐಡಿ ಕಾಪಿ ಮಾಡಿ",
      thanksT: "ಹಾರ್ದಿಕ ಧನ್ಯವಾದಗಳು", thanksLede: "ನಮ್ಮ ಈ ಶುಭ ದಿನವನ್ನು ಸ್ಮರಣೀಯವಾಗಿಸಿದ ತಮಗೆ ಹೃತ್ಪೂರ್ವಕ ಧನ್ಯವಾದಗಳು.",
      made: "ಆಹ್ವಾನ ಪತ್ರಿಕೆ", langSwitch: "EN",
      waIntro: (f, c) => `ನಮಸ್ಕಾರ! ${c} ವಿವಾಹಕ್ಕೆ${f ? ` ${f} ರವರ` : ""} ಉತ್ತರ:`,
      fests: "ಕಾರ್ಯಕ್ರಮಗಳು", andJoin: "ಮತ್ತು", pairJoin: "ಮತ್ತು",
      locale: "kn-IN",
    },
  };

  // Community packs: the invocation and how the card speaks. Each is checked against
  // published cards before a pack goes live.
  const PACKS = {
    "north-hindu": { invocation: "॥ Sri Ganeshaya Namaha ॥" },
    marwari: { invocation: "॥ Sri Ganeshaya Namaha ॥" },
    gujarati: { invocation: "॥ श्री गणेशाय नमः ॥" },
    marathi: { invocation: "॥ श्री गणेशाय नमः ॥" },
    tamil: { invocation: "உ" },
    // What Telugu wedding cards open with (13 November 2026): still to be checked against published cards.
    telugu: { invocation: "శ్రీరస్తు శుభమస్తు అవిఘ్నమస్తు" },
    bengali: { invocation: "শ্রী শ্রী প্রজাপতয়ে নমঃ" },
    // Assamese (10 November 2026), in Assamese spelling: still to be checked against published cards.
    assamese: { invocation: "শ্ৰী শ্ৰী প্ৰজাপতয়ে নমঃ" },
    muslim: { invocation: "بسم الله الرحمن الرحيم" },
    // Ik Onkar, Satgur Prasad: what Sikh wedding cards open with (10 November 2026, was none).
    // Still none for the tradition (10 November 2026): six live Sikh invites have no line of their
    // own and would have gained one unasked. Anand Karaj carries ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ as its own.
    sikh: { invocation: null },
    christian: { invocation: null },
    none: { invocation: null },
  };
  // A Gujarati invite's Ganesha line in Gujarati letters, on its English page too, as Kankotri Film's
  // walk gives it and the cards, the PDF and the video now do (cards.js, 17 November 2026).
  const ourInvocation = (s) => (L2 === "gu" && s === "॥ ಶ್ರೀ ಗಣೇಶಾಯ ನಮಃ ॥" ? "॥ શ્રી ગણેશાય નમઃ ॥" : s);

  // A function's slot (its painting and colour), from the name guests see, then from its id: one
  // added in the editor has an id like "event-mf2k1", so its name is all there is (a couple's
  // Sangeet showed the wedding's painting, 31 October 2026). The first pattern names the slot, the
  // second something held in its place (a cocktail night in the sangeet's). Kept the same in
  // cards.js and walk/walk.js.
  // The Bengali names too (1 November 2026): the gaye holud, the biye, the bou bhaat and the
  // aashirbad, which takes the engagement's painting.
  const SLOTS = [
    ["haldi", /haldi|हल्दी|holud|हलुद|halad|हळद|nuoni|নোৱনি|হলুদ|ਹਲਦੀ|vatna|ਵਟਣਾ|maiyan|ਮਾਈਆਂ|mayun|مایوں|ہلدی|పసుపు|હળદર|હલદી|மஞ்சள்/, /pithi|पीठी|ubtan|\btel\b|telbaan|ابٹن|pellikuthuru|pellikoothuru|pellikoduku|mangala ?snanam|పెళ్లికూతురు|పెళ్ళికూతురు|పెళ్లికొడుకు|పెళ్ళికొడుకు|మంగళ ?స్నానం|પીઠી|நலங்கு/],
    ["mehendi", /mehe?ndi|mehandi|मेहंदी|मेंहदी|मेहँदी|मेहेंदी|মেহেন্দি|মেহেন্দী|ਮਹਿੰਦੀ|مہندی|మెహందీ|మెహెందీ|મહેંદી|મેંદી|மெஹந்தி|மெஹெந்தி/, /henna|\balta\b|గోరింటాకు|மருதாணி/],
    ["sangeet", /sangeet|sangit|संगीत|jaago|ਜਾਗੋ|সঙ্গীত|ਸੰਗੀਤ|سنگیت|సంగీత్|સંગીત|சங்கீத்/, /garba|dandiya|cocktail|mehfil|giddha|ਗਿੱਧਾ|qawwali|قوالی|ગરબા|દાંડિયા/],
    ["reception", /reception|रिसेप्शन|bou ?bh?aa?t|bow ?bh?aa?t|बौभात|রিসেপশন|ৰিচেপচন|ਰਿਸੈਪਸ਼ਨ|ریسیپشن|বৌভাত|రిసెప్షన్|રિસેપ્શન|ரிசெப்ஷன்|வரவேற்பு/, /walima|valima|dinner|banquet|feast|भोज|ولیمہ|ولیمے|విందు|ભોજન|விருந்து/],
  ];
  // Some themes paint the roka, the engagement and a pool party too (Parda's, 31 October 2026), and
  // the baraat's ghodi and the sehra bandi (Zardozi's, 3 November 2026, for a North Indian groom's family),
  // and the dinner's feast (Zardozi's, 4 November 2026): a theme without one holds a dinner in the reception's place.
  const OWN = [
    ["roka", /roka|रोका|ਰੋਕਾ/],
    ["engagement", /engag|sagai|सगाई|mangni|मंगनी|kurmai|ਕੁੜਮਾਈ|juroon|joron|জোৰণ|sakharpuda|साखरपुडा|বাগদান|منگنی|నిశ్చితార్థ|સગાઈ|நிச்சயதார்த்த/, /\bring\b|sakhar|nichay|aa?shirbaa?d|आशीर्वाद|আশীর্বাদ|আঙঠি/],
    ["pool", /pool|swim|पूल|स्विम/],
    ["baraat", /ba+ra+t|बारात|ghu[dr]+ ?cha[dr]+h?i|gho[dr]i|घुड़चढ़ी|घोड़ी/],
    ["sehra", /sehe?ra|सेहरा/],
    ["dinner", /dinner|banquet|feast|भोज/],
    // A Gujarati family's Ganesh Sthapana (Kankotri's, 13 November 2026), never a function named Ganesh alone.
    ["ganesh", /ganesh ?(sthapana?|pujan|poojan|puja|pooja)|गणेश ?(स्थापना|पूजन|पूजा)|ગણેશ ?(સ્થાપના|પૂજન|પૂજા)|వినాయక ?(పూజ|చవితి)|விநாயகர் ?பூஜை/],
  ];
  // With the second languages' names (10 November 2026): the Assamese biya, the Marathi lagna, the
  // Sikh laavan and Anand Karaj, the nikah in Urdu.
  const WEDDING = /wedding|shaadi|shadi|vivah|nikah|phera|lagan|anand|mandap|biye|bibaha?o?|शादी|विवाह|निकाह|फेरे|मंडप|बिये|\bbiya\b|lagna|laavan|লগ্ন|বিয়া|বিবাহ|लग्न|ਵਿਆਹ|ਅਨੰਦ|ਲਾਵਾਂ|نکاح|شادی|పెళ్లి(?!కూ|కొ)|పెళ్ళి(?!కూ|కొ)|వివాహ|కళ్యాణ|కల్యాణ|ముహూర్త|લગ્ન|વિવાહ|હસ્તમેળાપ|திருமண|கல்யாண|விவாக|முகூர்த்த/;
  const nameOf = (e) => `${e.name?.en || ""} ${e.name?.hi || ""}`.toLowerCase();
  const findIn = (list, s) => { for (const [k, a, b] of list) { if (a.test(s)) return [k, 0]; if (b?.test(s)) return [k, 1]; } return null; };
  // A function's Hindi name is kept only while it names the same function as its English one. The
  // usual functions start with their Hindi, the editor hides it while Hindi is off, and couples who
  // renamed the Wedding to their Gaaye Holud in English got विवाह under it (3 November 2026). Kept
  // the same in cards.js and walk/walk.js.
  const FN_WORDS = [...SLOTS, ...OWN, ["wedding", WEDDING], ["haldi", /halad|हळद/], ["reception", /स्वागत|वलीमा/], ["wedding", /phere|muhurt|मुहूर्त|आनंद कारज/], ["engagement", /निश्चय|sagaa+i|sagaee/]];
  const fnOf = (s) => findIn(FN_WORDS, (s || "").toLowerCase())?.[0] || "";
  // A Hindi name for several functions is kept when the English names any of them: Surabhi's "Baraat
  // Swagat, Varmala and Pheras" lost its "बरात स्वागत, वरमाला और फेरे", since the English named the
  // baraat first and the Hindi the pheras (5 November 2026). One for a single function still has to
  // name the English one's first, so "Wedding Reception" keeps hiding a विवाह left from "Wedding".
  // "Phere" is the wedding here only: as a slot it would move four invites' wedding time.
  const fnsOf = (s) => { const t = (s || "").toLowerCase(); return new Set(FN_WORDS.filter(([, a, b]) => a.test(t) || b?.test(t)).map(([k]) => k)); };
  const ownHi = (e) => { const hi = fnsOf(e?.name?.hi); if (hi.size < 2) return !hi.size || hi.has(fnOf(e.name.en)); const en = fnsOf(e.name.en); return [...hi].some((k) => en.has(k)); };
  // [slot, how sure]: 0 named for it, 1 held in its place, 2 only its id says so, 3 nothing does
  // (the wedding's slot). A name always beats an id: a couple who renamed the template's Sangeet to
  // their pool party mean the pool party (31 October 2026).
  const slotOf = (e) => {
    const n = nameOf(e), id = (e.id || "").toLowerCase();
    const byId = findIn(SLOTS, id) || (WEDDING.test(id) ? ["wedding"] : null);
    return findIn(SLOTS, n) || (WEDDING.test(n) ? ["wedding", 0] : null) || (byId ? [byId[0], 2] : ["wedding", 3]);
  };
  // Takes the function (or, as layouts may still pass, its id).
  const SLOT_FOR = (e) => slotOf(typeof e === "string" ? { id: e } : e || {})[0];

  // Which painting each function shows, never one twice on an invite (Gautam, 31 October 2026). A
  // painting the couple chose in the editor (event.art: "pool", "motif" …) is theirs, even twice.
  // Every other function asks for its own (the roka's, the engagement's or the pool party's where
  // the theme paints one, else its slot's), and one named for it is served before one held in its
  // place or with no slot of its own, and the template's own function (its id is the slot) before one
  // the couple added. Whoever finds theirs taken gets the theme's second painting for it if there is
  // one (Parda's "haldi2", for a couple's second haldi, 31 October 2026), else its nearest if that's
  // free (the reception's for a cocktail night), else the theme's motif, which the guest page shows
  // nowhere else, else any painting not yet shown. Past that, the ornament. cards.js gives each
  // function's card the same painting, so pass it every function, as here.
  const NEAR = { haldi: "mehendi", mehendi: "haldi", sangeet: "reception", reception: "sangeet", roka: "engagement", engagement: "roka", dinner: "reception", ganesh: "wedding" };
  const fnArt = (evs) => {
    const fn = { ...theme.art?.fn, ...(theme.art?.motif ? { motif: theme.art.motif } : {}) };
    const asks = evs.filter((e) => nameOf(e).trim() && e.start).map((e) => {
      const [slot, sure] = slotOf(e);
      const own = findIn(OWN, nameOf(e)) || findIn(OWN, (e.id || "").toLowerCase());
      return own && fn[own[0]] ? { e, slot, key: own[0], sure: own[1] } : { e, slot, key: slot, sure };
    }).sort((a, b) => a.sure - b.sure || (b.e.id === b.key) - (a.e.id === a.key) || new Date(a.e.start) - new Date(b.e.start));
    const out = new Map(), used = new Set();
    const give = (a, k) => { out.set(a.e, fn[k]); used.add(k); };
    // A painting from another design for one function, set by us for a couple who asks
    // (custom.fnArt, { eventId: "anand-karaj/wedding" }): Prashant & Mallika's Anand Karaj in Pichwai
    // took Anand Karaj's kirtan under marble arches over Pichwai's havan mandap (11 November 2026).
    for (const a of asks) { const m = String(custom().fnArt?.[a.e.id] || "").match(/^([a-z0-9-]{2,40})\/([a-z0-9]{2,20})$/); if (m) out.set(a.e, `../${m[1]}/fn-${m[2]}.webp`); }
    for (const a of asks) if (!out.has(a.e) && typeof a.e.art === "string" && Object.hasOwn(fn, a.e.art)) give(a, a.e.art);
    for (const a of asks) if (!out.has(a.e) && fn[a.key] && !used.has(a.key)) give(a, a.key);
    for (const a of asks) {
      if (out.has(a.e)) continue;
      // The pool party's, the dinner's and the Ganesh Sthapana's paintings only ever go to their own function, or where the couple put them.
      const k = [`${a.key}2`, NEAR[a.key], "motif", ...Object.keys(fn).filter((x) => x !== "pool" && x !== "dinner" && x !== "ganesh")].find((x) => fn[x] && !used.has(x));
      if (k) give(a, k);
    }
    return out;
  };

  const ORN = `<svg class="orn" viewBox="0 0 150 14" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width=".8"><path d="M6 7h50M94 7h50"/><path d="M75 1.6 80.4 7 75 12.4 69.6 7Z"/><path d="M56 7c3-3.4 6-3.4 8 0-2 3.4-5 3.4-8 0ZM94 7c-3-3.4-6-3.4-8 0 2 3.4 5 3.4 8 0Z"/></g><circle cx="75" cy="7" r="1.5" fill="currentColor"/><circle cx="3" cy="7" r="1" fill="currentColor"/><circle cx="147" cy="7" r="1" fill="currentColor"/></svg>`;
  const WA = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.2a9.7 9.7 0 0 0-8.4 14.6L2.3 21.7l5-1.3A9.7 9.7 0 1 0 12 2.2Zm0 17.7c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 19.9Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3 1 2.5c.1.1 1.6 2.5 4 3.5 1.5.6 2 .7 2.8.6.4-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.4-.3Z"/></svg>`;
  const CHEVRON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>`;
  const PLAY = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>`;

  let data, theme, base, lang, family, group, opened = false, countTimer = 0;
  // The invite's second language (data.lang2, Gautam, 10 November 2026): Hindi, or Marathi, Bengali,
  // Assamese, Punjabi or Urdu, whose words come from langs.js. `lang` stays "en" or "hi" (the second
  // language, whichever it is), since every field's second copy keeps the key `hi`. TAG is the page's
  // real language tag, for fonts and line breaks, and DIR gives an Urdu line dir="auto", so it runs
  // right to left while the page, its opening and its scratch cards keep their places.
  const LANGS = ["hi", "mr", "bn", "as", "pa", "ur", "te", "gu", "ta"];
  let L2 = "hi", TAG = "en", DIR = "";
  const tagOf = (l) => (l === "en" ? "en" : L2);
  const LA = () => `lang="${TAG}"${DIR}`;
  // The pack for a second language beyond Hindi (none for Hindi).
  const PK = () => (L2 === "hi" ? null : window.SaathLangs?.[L2] || null);
  const setTag = () => { TAG = tagOf(lang); DIR = TAG === "ur" ? ' dir="auto"' : ""; document.documentElement.lang = TAG; };
  // An element drawn outside a template: its language, and right to left for Urdu.
  const tagEl = (el, t = TAG) => { el.lang = t; if (t === "ur") el.dir = "auto"; else el.removeAttribute("dir"); };
  // A line in the second language on the English page (a function's name under its English one): its
  // tag alone, so an Urdu name keeps the English line's alignment (its letters still run right to left).
  const L2A = () => `lang="${L2}"`;
  // The language button: the second language's short name on the English page ("हिं", "मरा"), EN on the other.
  const switchLabel = (u) => (lang === "en" && PK() ? PK().meta.short : u.langSwitch);
  // A script's own tag, for an invocation in a script other than the page's: Gurmukhi (ੴ ਸਤਿਗੁਰ
  // ਪ੍ਰਸਾਦਿ) and Bengali script, which is Assamese on an Assamese invite. Arabic (Bismillah) stays as it was.
  // An invocation's script, for its face. Arabic (the Bismillah) is set in Amiri, loaded on its own.
  // Telugu, Gujarati and Tamil script too (13 November 2026: శ్రీరస్తు శుభమస్తు అవిఘ్నమస్తు, a Tamil உ).
  const scriptTag = (s) => (/[਀-੿]/.test(s) ? "pa" : /[ঀ-৿]/.test(s) ? (L2 === "as" || data?.community === "assamese" ? "as" : "bn") : /[ఀ-౿]/.test(s) ? "te" : /[઀-૿]/.test(s) ? "gu" : /[஀-௿]/.test(s) ? "ta" : /[؀-ۿﭐ-﷿]/.test(s) ? "ar" : /[ಀ-೿]/.test(s) ? "kn" : "");
  // langs.js, fetched only for an invite in a language beyond Hindi.
  const loadLangs = () => (window.SaathLangs ? Promise.resolve(true) : new Promise((ok) => {
    const s = document.createElement("script");
    s.src = `${ROOT}langs.js`;
    s.onload = () => ok(Boolean(window.SaathLangs));
    s.onerror = () => ok(false);
    document.head.appendChild(s);
  }));
  // Two things about the couple in the order they chose: the bride's first, or the groom's when
  // their family writes it that way (data.groomFirst, Gautam, 30 October 2026).
  const two = (hers, his) => (data?.groomFirst ? [his, hers] : [hers, his]);
  // A theme with its own page shape (a newspaper, a scrapbook, a journey) brings a layout from
  // invite/layouts/: its first screen, and sections it adds or dresses. null for painted themes.
  let LAY = null;
  const revealed = new Set();

  // What the invite is for (data.occasion): the wedding (absent), an engagement or roka, a
  // save-the-date, or one or two functions on their own. It changes only the words that name the
  // occasion, and a save-the-date leaves out what waits for the invitation.
  const occasion = () => (["engagement", "save-the-date", "function"].includes(data?.occasion) ? data.occasion : "wedding");
  // A function invite names its functions: "Haldi & Mehendi", "हल्दी एवं मेहंदी". More than two are "the celebrations".
  const fnNames = () => {
    const n = [...events()].sort((a, b) => new Date(a.start) - new Date(b.start)).map((e) => pick(e.name)).filter(Boolean);
    const w = UI[TAG] || UI.en;
    if (n.length > 2) return w.fests;
    return n.length > 1 ? `${n[0]} ${w.andJoin} ${n[1]}` : n[0] || w.fests;
  };
  const OCC = {
    en: {
      engagement: () => ({
        invitedSub: (c) => `to an engagement in ${c}`, welcome: "Welcome to the engagement of",
        blessing: "With the blessings of our elders, you are invited to the engagement of", ownVoice: "Together with our families, we invite you to our engagement",
        kidsLine: (k) => `${k} say: you must come to the engagement!`, thanksLede: "For coming, for every blessing, and for making the day ours.",
        waIntro: (f, c) => `Namaste! RSVP${f ? ` from ${theFam(f)}` : ""} for ${c}'s engagement:`,
      }),
      function: (n) => ({
        invitedSub: (c) => `to the ${n} in ${c}`, welcome: `Welcome to the ${n} of`,
        blessing: `With the blessings of our elders, you are invited to the ${n} of`, ownVoice: `Together with our families, we invite you to our ${n}`,
        kidsLine: (k) => `${k} say: you must come to the ${n}!`,
        waIntro: (f, c) => `Namaste! RSVP${f ? ` from ${theFam(f)}` : ""} for ${c}'s ${n}:`,
      }),
      "save-the-date": () => ({
        invited: "Save the date", invitedSub: (c) => `for a wedding in ${c}`, welcome: "Save the date for the wedding of",
        blessing: "With the blessings of our elders, please save the date for the wedding of", ownVoice: "Please save the date for our wedding",
        follow: "Invitation to follow", countT: "Counting the days", countTo: (n, d) => `until the wedding, on ${d}`,
      }),
    },
    hi: {
      engagement: () => ({
        invitedSub: (c) => `${c} में एक सगाई समारोह में`, welcome: "शुभ सगाई",
        ownVoice: "अपने परिवारों के साथ, हम आपको अपनी सगाई में आमंत्रित करते हैं", close: "के सगाई समारोह में आप सपरिवार सादर आमंत्रित हैं।",
        kidsLine: (k) => `${k} की मनुहार: सगाई में ज़रूर आना!`,
        waIntro: (f, c) => `नमस्ते! ${c} की सगाई के लिए${f ? ` ${hiFam(f)} का` : ""} उत्तर:`,
      }),
      function: (n) => ({
        invitedSub: (c) => `${c} में ${n} समारोह में`, welcome: n,
        ownVoice: `अपने परिवारों के साथ, हम आपको अपने ${n} समारोह में आमंत्रित करते हैं`, close: `के ${n} समारोह में आप सपरिवार सादर आमंत्रित हैं।`,
        kidsLine: (k) => `${k} की मनुहार: ${n} में ज़रूर आना!`,
        waIntro: (f, c) => `नमस्ते! ${c} के ${n} समारोह के लिए${f ? ` ${hiFam(f)} का` : ""} उत्तर:`,
      }),
      "save-the-date": () => ({
        invited: "शुभ तिथि", invitedSub: (c) => `${c} में शुभ विवाह के लिए`, welcome: "शुभ विवाह की तिथि",
        ownVoice: "कृपया हमारे विवाह की तिथि याद रखें", close: "के शुभ विवाह की तिथि कृपया याद रखें।",
        follow: "निमंत्रण जल्द ही", countT: "दिन गिन रहे हैं", countTo: (n, d) => `${d} को शुभ विवाह तक`,
      }),
    },
  };
  // The words for this language and occasion, made once per language (the record never changes on a page).
  let ui = null;
  const t = () => {
    if (!data || group === undefined) return UI[TAG] || UI.en;
    if (ui?.lang !== TAG) {
      const words = { ...UI[TAG], ...(OCC[TAG]?.[occasion()]?.(fnNames()) || {}) };
      // A design's own headings (theme.words: Coming Soon's "Book your seats" for the replies), over ours
      // and under the couple's. Only plain strings, by language, falling back to the English.
      for (const [k, v] of Object.entries(theme?.words || {})) if (typeof (v?.[TAG] ?? v?.en) === "string") words[k] = v[TAG] ?? (TAG === "en" ? v.en : words[k] ?? v.en);
      // The couple's own, over ours (WORDS in lib/wedding.ts). The invitation's first line is one
      // line whether or not their parents are named, and the children's line is theirs whole.
      for (const k of OWN_WORDS) if (own(k)) words[k] = own(k);
      if (own("inviteLine")) words.blessing = words.ownVoice = own("inviteLine");
      if (own("kidsLine")) words.kidsLine = () => own("kidsLine");
      // Lines we set for one family (data.custom.words): the opening's greeting and its small line,
      // a line under the functions' heading, one after the names on the invitation, one closing the
      // story, and the dress code's words, a line break kept where they put one.
      for (const k of ["invited", "eventsLede", "inviteFrom", "inviteAfter", "storyLines", "storyEnd", "dressLede"]) if (ownLine(k)) words[k] = ownLine(k);
      // One family's words for the map links (custom.words.mapLink: "Click Here for Venue Directions").
      if (ownLine("mapLink")) words.maps = words.directions = ownLine("mapLink");
      if (ownLine("invitedSub")) words.invitedSub = () => ownLine("invitedSub");
      ui = { lang: TAG, words };
    }
    return ui.words;
  };
  const OWN_WORDS = ["welcome", "with", "son", "daughter", "dearAll", "dateT", "storyT", "photosT", "eventsT", "countT", "venueT", "travelT", "stayT", "dressT", "dressLede", "songT", "rsvpT", "contactsT", "shagunT", "shagunLede", "thanksT", "thanksLede", "familyT", "blessT", "darshan", "swagat", "kids"];
  const pick =(v) => (v && typeof v === "object" && !Array.isArray(v) ? v[lang] ?? v.en ?? "" : v ?? "");
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  // Assamese and Punjabi dates come from langs.js: Chrome has no Assamese, and no Punjabi months.
  const fmt = (iso, o) => (lang === "hi" && PK()?.meta.months ? window.SaathLangs.format(L2, iso, o) : new Intl.DateTimeFormat(t().locale, { timeZone: "Asia/Kolkata", ...o }).format(new Date(iso)));
  // Hindi invitations name the part of the day rather than writing am/pm: सुबह 10:30, शाम 7:00. The
  // other languages too, each in its own words (langs.js).
  const clock = (iso) => {
    if (lang !== "hi") return fmt(iso, { hour: "numeric", minute: "2-digit" });
    if (PK()) return window.SaathLangs.clock(L2, iso);
    const [h, m] = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso)).split(":").map(Number);
    const part = h < 4 ? "ರಾತ್ರಿ" : h < 12 ? "ಬೆಳಿಗ್ಗೆ" : h < 16 ? "ಮಧ್ಯಾಹ್ನ" : h < 20 ? "ಸಂಜೆ" : "ರಾತ್ರಿ";
    return `${part} ${h % 12 || 12}:${String(m).padStart(2, "0")}`;
  };
  const dayKey = (d) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);
  const art = (k) => (theme.art?.[k] ? base + theme.art[k] : null);
  // In date order, whatever order the couple added them in: a haldi added last for the 16th came after
  // the wedding on the 20th (31 October 2026). The walk-throughs and the newspaper sort the same way.
  // A function for one family's guests ("side:bride") shows in that family's version, the editor's
  // preview included. A guest's page has no `for`: the server sent only their functions (forGuest).
  const events = () => (data.events || []).filter((e) => e.name && e.start && (!e.for || e.for.includes(group) || e.for.includes(`side:${data.groomFirst ? "groom" : "bride"}`))).sort((a, b) => new Date(a.start) - new Date(b.start));
  const firstEvent = () => [...events()].sort((a, b) => new Date(a.start) - new Date(b.start))[0];
  const lastEvent = () => [...(data.events || [])].sort((a, b) => new Date(b.end || b.start) - new Date(a.end || a.start))[0];
  const afterWedding = () => { const l = lastEvent(); return !!l && Date.now() > new Date(l.end || l.start).getTime() + 6 * 36e5; };
  // The wedding itself: by name first, since a roka, an engagement or a tilak also falls in the wedding slot.
  // An engagement invite's is the engagement (else the roka), a function invite's its first function.
  const mainEvent = () => {
    const evs = data.events || [];
    if (occasion() === "engagement") return evs.find((e) => /engag|sagai|ring|mangni|sakhar|nichay/i.test(e.id || "")) || evs.find((e) => /roka|tilak/i.test(e.id || "")) || lastEvent();
    if (occasion() === "function") return firstEvent() || lastEvent();
    // The function at the wedding date and time the couple gave, else the one that day named for the
    // wedding, else the one that day nearest that time. Only with nothing that day, the wedding by name.
    // Couples who renamed the usual Wedding to their 10 am Gaaye Holud saw 10 am under the scratched
    // date, whatever wedding time they gave (3 November 2026). The usual Wedding counts by its id only
    // while its name says the wedding, or says nothing we know.
    const named = (e) => slotOf(e)[0] === "wedding" && slotOf(e)[1] === 0 && !/roka|engag|sagai|tilak|\bring\b/i.test(nameOf(e));
    const byName = (l) => l.find((e) => /^(wedding|nikah|vivah|shaadi|pheras|lagan|anand)/i.test(e.id || "") && (named(e) || slotOf(e)[1] >= 2)) || [...l].reverse().find(named);
    const at = new Date(data.wedding).getTime(), day = istDay(data.wedding);
    const onDay = day ? evs.filter((e) => istDay(e.start) === day) : [];
    const near = [...onDay].sort((a, b) => Math.abs(new Date(a.start) - at) - Math.abs(new Date(b.start) - at))[0];
    return onDay.find((e) => new Date(e.start).getTime() === at) || byName(onDay) || near || byName(evs) || [...evs].reverse().find((e) => SLOT_FOR(e) === "wedding" && !/roka|engage|sagai|tilak|ring/i.test(e.id || "")) || lastEvent();
  };
  // The day in India a moment falls on, "" for none.
  const istDay = (iso) => { const t = new Date(iso).getTime(); return Number.isFinite(t) ? new Date(t + 19800000).toISOString().slice(0, 10) : ""; };
  // The time beside the wedding date: the one the couple gave under the date, once they've changed it
  // from the start's 7 pm, else that of the function that day (mainEvent). Surabhi gave 10:30 for her
  // pheras and saw the 8:30 of the Baraat Swagat they're part of; nine couples who left the 7 pm had
  // moved only their wedding function's time (5 November 2026). cards.js and walk.js do the same.
  const gaveTime = () => { const t = new Date(data.wedding).getTime(); return Number.isFinite(t) && new Date(t + 19800000).toISOString().slice(11, 16) !== "19:00"; };
  const weddingAt = (m) => (m && istDay(m.start) === istDay(data.wedding) && gaveTime() ? data.wedding : m?.start);
  // The day the invite is for, as the couple gave it: the wedding's, or the engagement's or the
  // function's (the editor names the date for the occasion).
  const mainDate = () => data.wedding;
  // The date the opening shows under the names: none while the guest is about to scratch it off its
  // foil right after, so the opening gives only the town (the video first, on Dipanwita's, 3 November
  // 2026; then every invite, when a couple who bought Ivory said the date under their names and then
  // a card asking to scratch it made no sense, Gautam, 4 November 2026). After the wedding, with
  // nothing to scratch, the date shows.
  // With no scratching (data.scratch "off", 17 November 2026) the first screen gives the date at once.
  const heroDate = () => (afterWedding() || data.scratch === "off" ? mainDate() : "");
  // What a save-the-date leaves for the invitation: the functions, the venue, travel, replies.
  const full = () => occasion() !== "save-the-date";
  // The countdown runs to the first function, or on a save-the-date to the wedding itself.
  const countTarget = () => (full() ? firstEvent() : data.wedding ? { name: { en: "" }, start: data.wedding } : null);
  const has =(v) => (Array.isArray(v) ? v.length > 0 : !!pick(v));
  // A function at a venue of its own (a reception across town): its address or map, 2 November 2026.
  const mapOf = (e) => (typeof e?.map === "string" && /^https:\/\//.test(e.map.trim()) ? e.map.trim() : "");
  const ownVenue = (e) => has(e?.address) || !!mapOf(e);
  // The town under a function at the main venue, when others are elsewhere (a Bangalore puja and an
  // Udaipur sangeet), so guests can tell where each is (a bride asked, 4 November 2026).
  const townLine = (e) => (!ownVenue(e) && has(data.city) && (data.events || []).some(ownVenue) ? pick(data.city) : "");
  // A function given its own address or map is at the main venue all the same when it repeats the
  // venue's map link or address, or names the venue (up to its first comma) in its place or address
  // (atMainVenue in lib/wedding.ts, 10 November 2026). cards.js and walk.js have the same.
  const atMainVenue = (e) => {
    const v = data.venue;
    if (!v || !e) return false;
    const words = (s) => ` ${String(s).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim()} `;
    const lines = (b) => [b?.en, b?.hi].filter((s) => typeof s === "string" && s.trim()).map(words);
    const map = typeof v.map === "string" ? v.map.trim() : "";
    if (map && typeof e.map === "string" && e.map.trim() === map) return true;
    const address = lines(v.address);
    if (lines(e.address).some((a) => address.includes(a))) return true;
    const names = [v.name?.en, v.name?.hi].map((s) => words(String(s || "").split(",")[0])).filter((n) => n.trim().length >= 5);
    return [...lines(e.place), ...lines(e.address)].some((x) => names.some((n) => x.includes(n)));
  };
  // The place under the formal invitation's date: the main venue's, unless the function that date
  // points at (mainEvent, as under the scratched date) is at a venue of its own. Then it's that
  // function's place, else its address, with the town when it doesn't already name it. Dushyant &
  // Parul's wedding was in the bride's village, their main venue the groom's (11 November 2026).
  // cards.js and walk.js do the same.
  // The day's wedding itself comes first when a function that day is named for it: a groom's family's
  // baraat leaves from home that day and the wedding is at the venue (a Saharanpur invite would have
  // read "At our residence", 11 November 2026). cards.js and walk.js match.
  const WEDDING_FN = /\b(wedding|vivah|vivaah|shaadi|shadi|nikah|nikaah|anand karaj|pheras?|muhurtham?|lagna|kalyanam|biye|marriage)\b|विवाह|शादी|निकाह|फेरे|लग्न|বিয়ে|ਅਨੰਦ|పెళ్లి(?!కూ|కొ)|పెళ్ళి(?!కూ|కొ)|వివాహ|కళ్యాణ|కల్యాణ|ముహూర్త|લગ્ન|હસ્તમેળાપ|திருமண|கல்யாண|முகூர்த்த/i;
  const invPlace = () => {
    const city = String(pick(data.city) || "").trim();
    // One invite that always names its main venue (custom.mainVenue): Prashant's Anand Karaj is at a
    // gurudwara, and he wanted the invitation to name the resort (17 November 2026).
    if (custom().mainVenue === true) return has(data.venue?.name) ? `${pick(data.venue.name)}${city ? `, ${city}` : ""}` : "";
    const town = city.split(/[,/]/)[0].trim().toLowerCase();
    const m = events().find((e) => istDay(e.start) === istDay(mainDate()) && WEDDING_FN.test(`${e.name?.en || ""} ${e.name?.hi || ""}`)) || mainEvent();
    if (m && istDay(m.start) === istDay(mainDate()) && ownVenue(m) && !atMainVenue(m)) {
      const own = String(pick(m.place) || pick(m.address) || "").trim();
      if (own) return town && !own.toLowerCase().includes(town) ? `${own}, ${city}` : own;
    }
    return has(data.venue?.name) ? `${pick(data.venue.name)}${city ? `, ${city}` : ""}` : "";
  };
  // The functions shown with the wedding date (keyDate, a switch on each function in the editor): a
  // lagan or a tilak on another day, scratched in a box of its own beside the wedding's, and on the formal
  // invitation, as a printed card gives them (Dushyant & Parul, 11 November 2026). Only the guest's
  // own functions, never one on the main date itself, and not on a save-the-date. cards.js and
  // walk.js match.
  // A key date for one family's version only ("side:groom": the groom's family's main function is the
  // lagan, the bride's is the wedding alone; Dushyant & Parul, 11 November 2026).
  const isKeyFor = (e) => e.keyDate === true || e.keyDate === `side:${data.groomFirst ? "groom" : "bride"}`;
  const keyDates = () => (full() && mainDate() ? events().filter((e) => isKeyFor(e) && istDay(e.start) !== istDay(mainDate())) : []);
  // Its date in full, with the year only when it isn't the wedding's.
  const keyDay = (e, o) => fmt(e.start, { weekday: "long", day: "numeric", month: "long", ...(o?.year || istDay(e.start).slice(0, 4) !== istDay(mainDate()).slice(0, 4) ? { year: "numeric" } : {}) });
  // A contact's number as guests read it, which is also the tap-to-call link (Dushyant & Parul
  // wanted the number, not "Call", 11 November 2026): an Indian mobile as "98765 43210", with "+91 "
  // when the couple typed it, anything else as typed. walk.js and phoneText in lib/wedding.ts match.
  const phoneText = (raw) => {
    const s = String(raw || "").trim();
    const m = /^(?:91|0)?([6-9]\d{9})$/.exec(s.replace(/\D/g, ""));
    return m ? `${/^\+\s*91/.test(s) ? "+91 " : ""}${m[1].slice(0, 5)} ${m[1].slice(5)}` : s;
  };
  // A line the couple typed as a heading inside a family list ("Special Invitation:", "Nanihal
  // Paksh:", "R.S.V.P. :-"), drawn as one (Dushyant & Parul, 11 November 2026). The PDF's families
  // page (lib/server/exports.ts) and walk.js read it the same way.
  const subHead = (s) => /[:：]\s*[-–—]?\s*$/.test(String(s || ""));
  const STATES = /^(andhra pradesh|arunachal pradesh|assam|bihar|chhattisgarh|goa|gujarat|haryana|himachal pradesh|jharkhand|karnataka|kerala|madhya pradesh|maharashtra|manipur|meghalaya|mizoram|nagaland|odisha|orissa|punjab|rajasthan|sikkim|tamil ?nadu|telangana|tripura|uttar pradesh|uttarakhand|west bengal|jammu (and|&) kashmir|ladakh|india|राजस्थान|कर्नाटक|महाराष्ट्र|उत्तर प्रदेश|मध्य प्रदेश|गुजरात|हरियाणा|पंजाब|बिहार|पश्चिम बंगाल|तमिलनाडु|तेलंगाना|केरल|भारत)$/i;
  // A function at a venue of its own: its town, the last part of its address less the PIN and the
  // state ("…, Bengaluru - 560 114", "…, Gurugram, Haryana 122001"), shown under its place where the
  // address itself is left to the venue section. Nothing for an address without parts or a PIN
  // ("Near the old temple"), or when the last part isn't a short name. walk.js has the same.
  const awayTown = (e) => {
    const a = String(pick(e.address) || "");
    if (!/,|\d{3}\s?\d{3}/.test(a)) return "";
    const parts = a.split(",").map((s) => s.replace(/[\s\-–]*\d[\d\s]*$/, "").trim()).filter(Boolean);
    while (parts.length > 1 && STATES.test(parts[parts.length - 1])) parts.pop();
    const t = (parts[parts.length - 1] || "").replace(/^[\s(]+|[\s.)\]]+$/g, "");
    // A road isn't a town ("…, Chandapura-Anekal Rd").
    if (/\b(rd|road|marg|street|st|lane|highway|nh)\.?$/i.test(t)) return "";
    return t.length <= 24 && !/\d/.test(t) && t.toLowerCase() !== String(pick(e.place) || "").trim().toLowerCase() ? t : "";
  };
  // "Haldi & Wedding", "Haldi, Mehendi & Wedding", "हल्दी एवं विवाह".
  const andList = (l) => { const n = l.filter(Boolean); return n.length > 1 ? `${n.slice(0, -1).join(", ")} ${(UI[TAG] || UI.en).andJoin} ${n.at(-1)}` : n[0] || ""; };
  // The record without the lines the couple left blank: a box typed in and cleared, an "Add a moment"
  // never filled in, a contact with no phone. They drew headings over nothing (2 November 2026), so
  // they're dropped once, here, for every section and layout. tidyWedding in lib/wedding.ts matches.
  function tidy(d) {
    if (!d || typeof d !== "object") return d;
    const filled = (b) => !!b && typeof b === "object" && Object.values(b).some((s) => typeof s === "string" && s.trim());
    const keep = (l, ok) => (Array.isArray(l) ? l.filter((x) => x && ok(x)) : l);
    const fam = d.family && typeof d.family === "object" ? Object.fromEntries(Object.entries(d.family).map(([k, l]) => [k, keep(l, filled)])) : d.family;
    // A function's Hindi name that names another function goes too (ownHi).
    const events = Array.isArray(d.events) ? d.events.map((e) => (e?.name?.hi && !ownHi(e) ? { ...e, name: { en: e.name.en } } : e)) : d.events;
    return { ...d, family: fam, events, timeline: keep(d.timeline, (m) => filled(m.when) || filled(m.what)), travel: keep(d.travel, filled), stay: keep(d.stay, (s) => filled(s.name) || filled(s.note)), contacts: keep(d.contacts, (c) => typeof c.phone === "string" && c.phone.trim()) };
  }
  // The couple's own words for a heading or a line (data.words, 2 November 2026), in this language, or "".
  const own = (k) => { const s = data?.words?.[k]?.[lang]; return typeof s === "string" ? s.trim() : ""; };
  // One invite's own touches, set by us for a family who asks and never typed in the editor
  // (data.custom, kept through their saves; Aimen's children's invite, 11 November 2026): lines of
  // words (custom.words), what's left out (custom.hide: "ornaments", "heroTown", "storyTitle",
  // "countdownTitle", "dressRows", a function card's "eventName" and "eventPlace", and "dateWhen", the day and time under the scratched date, and "madeWith", the "Invite made with saath.studio" line at the foot: Tulika's, 16 November 2026), a crescent line for the divider (custom.divider), the invitation's arch (custom.arch: "modern") and their own
  // picture for the dress code (custom.dressArt, from our media route), and a painting from another
  // design for one function (custom.fnArt, in fnArt).
  const custom = () => (data?.custom && typeof data.custom === "object" && !Array.isArray(data.custom) ? data.custom : {});
  const hidden = (k) => Array.isArray(custom().hide) && custom().hide.includes(k);
  const ownLine = (k) => { const v = custom().words?.[k]; const s = v && typeof v === "object" ? v[lang] ?? (lang === "en" ? "" : v.en) : ""; return typeof s === "string" ? s.trim() : ""; };
  // Words that may hold a line break of theirs: each line escaped, the breaks kept.
  const lines = (s) => String(s ?? "").split("\n").map((l) => esc(l.trim())).filter(Boolean).join("<br>");
  // A function's time, with "onwards" when it has no set end (onwards: true). Languages without the
  // words (langs.js) show the time alone.
  const timeOf = (e, iso) => { const c = clock(iso || e.start), u = t(); return e?.onwards === true && u.fromTime ? u.fromTime(c) : c; };
  // The same in a function's card, where the time is large: the words round it set small.
  const timeParts = (e) => {
    const c = clock(e.start), all = timeOf(e), i = all.indexOf(c);
    if (all === c || i < 0) return esc(all);
    const before = all.slice(0, i).trim(), after = all.slice(i + c.length).trim();
    return `${before ? `<small>${esc(before)}</small> ` : ""}${esc(c)}${after ? ` <small>${esc(after)}</small>` : ""}`;
  };
  // "Friday, at 6:00 pm", or "Friday, 6:00 pm onwards" for a function with no set end.
  const whenOf = (e, wd, iso) => { const u = t(); return e?.onwards === true && u.whenFrom ? u.whenFrom(wd, clock(iso)) : u.whenLine(wd, clock(iso)); };
  // How a family is greeted (3 November 2026): by the name exactly as the couple wrote it ("Sharma
  // family", "Shreya"), in the page's language. A family added before then (no asTyped) was named by
  // its surname, so "family" follows it, unless the name is a person's ("Shri Ramesh ji"). The site
  // greets the same way (familyGreeting in lib/wedding.ts). The RSVP form starts with the English one,
  // which the couple's Replies tab matches to the family.
  const greetName = (l = lang) => {
    const n = ((l === "hi" && family?.hi) || family?.name || "").trim();
    if (!n || family.asTyped || /^(shri|shree|sri|smt\.?|shrimati|dr\.?|mr\.?|mrs\.?|ms\.?|श्री|श्रीमती|डॉ\.?|শ্রী|শ্রীমতী|শ্ৰী|শ্ৰীমতী|ਸ੍ਰੀ|ਸ਼੍ਰੀ|ਸ੍ਰੀਮਤੀ|ਸ਼੍ਰੀਮਤੀ|جناب|محترم|محترمہ|ڈاکٹر|శ్రీ|శ్రీమతి|શ્રી|શ્રીમતી|திரு|திருமதி)\s|\s(ji|जी|ਜੀ|గారు|જી|அவர்கள்)$/i.test(n)) return n;
    return `${n.replace(/\s+(family|parivar|pariwar|परिवार|कुटुंब|कुटुंबीय|পরিবার|পৰিয়াল|ਪਰਿਵਾਰ|خاندان|కుటుంబం|પરિવાર|குடும்பம்)$/i, "")} ${l === "hi" ? PK()?.meta.family || "परिवार" : "family"}`;
  };
  // Keep "Shri" with the name after it and "&" with the name before it, so lines never break between
  // them, in every script (a Marathi card's सौ. and व only on a Marathi invite, since Hindi writes them too).
  const nbMr = (s) => (L2 === "mr" ? s.replace(/(^|\s)(सौ\.|श्री\.|कै\.|चि\.|कु\.)\s+/g, "$1$2\xa0").replace(/\s+(व|आणि)\s+/g, "\xa0$1 ") : s);
  const nb0 = (v) => String(v ?? "").replace(/(^|\s)(Late|Smt\.|Shrimati|Shri|Sri|Shree|Dr\.|Mr\.|Mrs\.|Ms\.|Col\.|Capt\.|Prof\.|श्रीमती|श्री|स्व\.|डॉ\.|শ্রীমতী|শ্রী|শ্ৰীমতী|শ্ৰী|স্বৰ্গীয়|স্বর্গীয়|ਸ਼੍ਰੀਮਤੀ|ਸ੍ਰੀਮਤੀ|ਸ਼੍ਰੀ|ਸ੍ਰੀ|ਸਵ\.|ਡਾ\.|جناب|محترمہ|محترم|مرحوم|ڈاکٹر|శ్రీమతి|శ్రీ|కీ\.శే\.|స్వర్గీయ|డా\.|શ્રીમતી|શ્રી|સ્વ\.|ડૉ\.|திருமதி|திரு|அமரர்|டாக்டர்)\s+/g, "$1$2\u00a0").replace(/\s+(&|एवं|और)\s+/g, "\u00a0$1 ");
  const nb = (v) => nbMr(nb0(v).replace(/\s+(ও|আৰু|ਅਤੇ|اور|మరియు|અને|மற்றும்)\s+/g, "\xa0$1 "));
  // The parents' names, each line the couple typed its own line: a second gives the grandparents
  // ("(Dohita/o Late Smt. Kamla Devi & Late Sh. Nand Lal)", Dushyant, 11 November 2026).
  const parentLines = (b) => String(pick(b) || "").split("\n").map((l) => l.trim()).filter(Boolean).map((l) => esc(nb(l))).join("<br>");
  // The parents' block as a printed card sets it: the parents in the block's own size, then any line
  // that names another relation (G/D/O, N/O, grandparents, a line in brackets, नाती/पोती …) and every
  // line after it smaller and lighter, so the couple's names stay the largest words on the page
  // (Nayanaa's six lines of capitals, 18 November 2026). A line that only carries on the parents'
  // names ("Mrs. Sunita & Mr." / "Balakrishnan Salian", or a mother and father a line each, as most
  // couples type them) keeps the parents' size.
  const RELATION = /^(?:\(|[GN]\s*\/\s*[DSO]|[DSN]\s*\/\s*O\b|N\.?\s*O\.?\s|Grand|Gr\.?\s*[DS]|Dohit|Doht|Naati|Nat[ai]n\b|Pautra|Nephew|Niece|With best compliments|Swagat|स्वागत)|पोत[ाीे]|पौत्र|नात[ीि]|नातिन|दोहित|दौहित्र|भतीज|भांज|नात[ूु]/i;
  const parentBlock = (b) => {
    const lines = String(pick(b) || "").split("\n").map((l) => l.trim()).filter(Boolean);
    const at = lines.findIndex((l, i) => i > 0 && RELATION.test(l));
    if (at < 0) return lines.map((l) => esc(nb(l))).join("<br>");
    return lines.slice(0, at).map((l) => esc(nb(l))).join("<br>") + `<span class="par-more">${lines.slice(at).map((l) => `<span>${esc(nb(l))}</span>`).join("")}</span>`;
  };

  // ───────── Boot ─────────
  async function boot() {
    // The builder previews a draft it keeps in this browser.
    let draft = null;
    if (SAATH.draft || params.has("draft")) { try { draft = JSON.parse(localStorage.getItem("saath-draft") || "null"); } catch {} }
    data = tidy(draft || SAATH.data || (await (await fetch(`${ROOT}couples/${slug}/invite.json`)).json()));
    let themeId = (params.get("t") || data.theme || "jharokha").replace(/[^a-z0-9-]/gi, "");
    let themeObj = window.SAATH_THEME || SAATH.themeData;
    if (!themeObj) {
      try {
        let res = await fetch(`${ROOT}themes/${themeId}/theme.json`);
        if (!res.ok) {
          try { themeId = (await (await fetch(`${ROOT}themes/index.json`)).json())[0].id; } catch { themeId = "jharokha"; }
          res = await fetch(`${ROOT}themes/${themeId}/theme.json`);
        }
        themeObj = await res.json();
      } catch (e) {
        console.warn("Theme fetch bypassed:", e);
      }
    }
    base = `${ROOT}themes/${themeId}/`;
    theme = themeObj || {};
    // The couple's own lettering (data.fonts, LETTERING in lib/wedding.ts, 14 November 2026): a script
    // for the names and headings in place of the design's, and capitals for the small lines (--caps).
    // Set into the theme's fonts, so the seal (openings.js) and the layouts follow it too.
    const letters = data.fonts || {}, isFace = (n) => typeof n === "string" && /^[A-Za-z ]{2,40}$/.test(n);
    if (isFace(letters.script) && isFace(letters.caps)) theme.fonts = { ...theme.fonts, script: letters.script, caps: letters.caps };
    if (theme.layout) LAY = await loadLayout(theme.layout);
    // The second language, and its words when it isn't Hindi. Should langs.js fail to load, the page
    // still draws, with the English words round the couple's own.
    L2 = LANGS.includes(data.lang2) ? data.lang2 : "hi";
    if (L2 !== "hi") {
      const pack = (await loadLangs()) && window.SaathLangs[L2];
      UI[L2] = pack ? { ...pack.ui, fests: pack.meta.fests, andJoin: pack.meta.andJoin, pairJoin: pack.meta.pairJoin } : { ...UI.en, langSwitch: "EN" };
      OCC[L2] = pack ? pack.occ : OCC.en;
    }
    // ?lang= is "en", "hi" or the second language's own code ("mr"): the last two are the same page.
    const asked = params.get("lang");
    lang = asked === "en" || asked === "hi" ? asked : asked && asked === L2 ? "hi" : data.lang || "en";
    setTag();
    document.body.dataset.theme = theme.id;
    // The builder's preview, loaded again after every edit: no entrance animations (engine.css).
    if (params.has("quiet")) document.documentElement.classList.add("quiet");

    family = data.families?.find((f) => f.name.toLowerCase() === familyParam.toLowerCase()) || (familyParam ? { name: familyParam, group: params.get("g") || "all" } : null);
    group = family?.group || params.get("g") || "all";

    applyTheme();
    renderGate();
    renderHero();
    renderPaper();
    renderToday();
    if (params.has("open")) open(true);
    // ?play=<ms>: the opening plays by itself after that long (the site's hero shows it this way),
    // without music, since nobody has tapped yet.
    else if (params.has("play")) {
      const go = () => setTimeout(() => open(), Math.max(300, Number(params.get("play")) || 1200));
      document.readyState === "complete" ? go() : addEventListener("load", go, { once: true });
    }
    // A guest's link waits for their tap, and the music starts with it: fetch it while they look.
    else warmMusic();
    // A link to a section (#rsvp, #celebrations) lands on it once the page is drawn, and again as
    // the pictures above it load and push it down.
    // It scrolls this window only: scrollIntoView would also scroll a site page showing the invite
    // in a frame, pulling the visitor away from wherever they had scrolled to.
    // It keeps the section's scroll-margin, which clears the island inside the site's phone mockup.
    if (params.has("open") && /^#[a-z]+$/.test(location.hash)) {
      const land = () => {
        const el = document.querySelector(location.hash);
        if (el) scrollTo(0, el.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0));
      };
      requestAnimationFrame(land);
      addEventListener("load", land, { once: true });
      setTimeout(land, 1200);
    }
    // The builder reloads its preview on every change, so the preview keeps the couple's place.
    if (SAATH.draft) {
      const y = Number(sessionStorage.getItem("saath-preview-y") || 0);
      if (y && params.has("open")) requestAnimationFrame(() => requestAnimationFrame(() => scrollTo(0, y)));
      addEventListener("scroll", () => sessionStorage.setItem("saath-preview-y", String(Math.round(scrollY))), { passive: true });
    }
    // Recording the video invite: no buttons, and no scroll cue, since the video scrolls itself.
    if (params.has("video")) document.body.classList.add("video");

    $("#skip").addEventListener("click", (e) => {
      e.preventDefault();
      open(true);
      requestAnimationFrame(() => {
        const el = $("#invitation");
        if (el) scrollTo(0, el.getBoundingClientRect().top + scrollY);
      });
    });
    $("#langBtn").addEventListener("click", () => setLang(lang === "en" ? "hi" : "en"));
    $("#soundBtn").addEventListener("click", toggleSound);
    // The music and language buttons step aside while the guest reads down the page and return on the way back up.
    let ly = scrollY;
    addEventListener("scroll", () => {
      const y = scrollY, end = document.documentElement.scrollHeight - innerHeight - 160;
      if (y > ly + 6 && y > 320 && y < end) $("#controls").classList.add("tucked");
      else if (y < ly - 6 || y >= end || y <= 320) $("#controls").classList.remove("tucked");
      ly = y;
    }, { passive: true });
    let rw = innerWidth;
    addEventListener("resize", () => {
      if (Math.abs(innerWidth - rw) < 2) return;
      rw = innerWidth;
      drawArch();
      fitWords();
      fitHero();
    });
  }

  // A script whose capital S is taken from another face (below).
  const CAP_S = { "Pinyon Script": "Allura" };
  // Each second language's face (engine.css has the same as --l2-*). Tiro Bangla draws Assamese ৰ ৱ,
  // Tiro Gurmukhi draws ੴ (checked 10 November 2026).
  // Telugu, Gujarati and Tamil (13 November 2026): Tiro Telugu and Tiro Tamil, of the same family as the
  // others, and Noto Serif Gujarati, which reads clearly at the page's small sizes (a design may name
  // its own, fonts.gu: Rasa is the more calligraphic, a fifth smaller at the same size).
  const L2_FACE = { mr: "Tiro Devanagari Marathi", bn: "Tiro Bangla", as: "Tiro Bangla", pa: "Tiro Gurmukhi", ur: "Gulzar", te: "Tiro Telugu", gu: "Noto Serif Gujarati", ta: "Tiro Tamil" };
  // An invocation in one of these scripts takes its face whatever the second language.
  const SCRIPT_FACE = [[/[ఀ-౿]/, "te"], [/[઀-૿]/, "gu"], [/[஀-௿]/, "ta"]];
  function applyTheme() {
    const r = document.documentElement.style;
    const p = theme.palette || {};
    for (const [k, v] of Object.entries(p)) r.setProperty(`--${k}`, v);
    const f = theme.fonts || {};
    // Pinyon Script's capital S reads as a T or an L: relatives read "Saini" wrong on Jatin's invite
    // (31 October 2026). Its S comes from Allura, a script in the same hand, fetched as that one letter
    // (text=S), so every other letter stays Pinyon's. openings.js (the seal) and cards.js do the same.
    const capS = CAP_S[f.script];
    if (f.script) r.setProperty("--script", `${capS ? `"${capS}", ` : ""}"${f.script}", "Tiro Devanagari Hindi", cursive`);
    if (capS && !document.querySelector("link[data-cap-s]")) {
      const l = document.createElement("link");
      l.rel = "stylesheet"; l.dataset.capS = "";
      l.href = `https://fonts.googleapis.com/css2?family=${capS.replace(/ /g, "+")}&text=S&display=swap`;
      document.head.appendChild(l);
    }
    if (f.serif) r.setProperty("--serif", `"${f.serif}", "Tiro Devanagari Hindi", Georgia, serif`);
    if (f.deva) r.setProperty("--deva", `"${f.deva}", "Tiro Devanagari Hindi", serif`);
    if (f.display) r.setProperty("--display", `"${f.display}", "${f.serif || "Cormorant Garamond"}", serif`);
    // The small capitals (engine.css --caps, the serif unless the couple chose lettering of their own).
    if (f.caps) r.setProperty("--caps", `"${f.caps}", var(--serif)`);
    // A second language beyond Hindi sets its lines in its script's face (L2_FACE, or the theme's own,
    // fonts.mr …), which also stands behind the Latin faces for a name typed in that script.
    const l2Face = L2 === "hi" ? null : f[L2] || L2_FACE[L2];
    if (l2Face) {
      // The design's Hindi face behind it, for any Devanagari line on the page (a chosen ॥ जय सियाराम ॥).
      r.setProperty(`--l2-${L2}`, `"${l2Face}", ${L2 === "ur" ? '"Noto Nastaliq Urdu", ' : ""}${L2 === "mr" ? "" : `"${f.deva || "Tiro Devanagari Hindi"}", `}serif`);
      r.setProperty("--script", `${capS ? `"${capS}", ` : ""}"${f.script || "Pinyon Script"}", "${l2Face}", "Tiro Devanagari Hindi", cursive`);
      r.setProperty("--serif", `"${f.serif || "Cormorant Garamond"}", "${l2Face}", "Tiro Devanagari Hindi", Georgia, serif`);
    }
    // An invocation in Gurmukhi or Bengali script (the Sikh and Assamese packs, Anand Karaj's lines)
    // needs that script's face whatever the second language.
    const inv = `${data.invocation || ""} ${data.invocationHi || ""} ${theme.invocation || ""} ${PACKS[data.community]?.invocation || ""}`;
    const families = [...new Set([f.script, f.serif, f.deva, f.display, f.caps, "Tiro Devanagari Hindi", data.community === "tamil" ? "Noto Serif Tamil" : null, data.community === "bengali" || (data.invocation !== false && /[ঀ-৿]/.test(inv)) ? "Tiro Bangla" : null, data.invocation !== false && /[਀-੿]/.test(inv) ? "Tiro Gurmukhi" : null, ...SCRIPT_FACE.filter(([re]) => data.invocation !== false && re.test(inv)).map(([, l]) => f[l] || L2_FACE[l]), l2Face, L2 === "ur" ? "Noto Nastaliq Urdu" : null].filter(Boolean))];
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?${families.map((n) => `family=${encodeURIComponent(n).replace(/%20/g, "+")}:ital,wght@0,400;0,500;0,600;1,400`).join("&")}&display=swap`;
    link.onerror = () => {};
    document.head.appendChild(link);
    // Some families lack italics or weights; a second, plain request covers them.
    const plain = document.createElement("link");
    plain.rel = "stylesheet";
    plain.href = `https://fonts.googleapis.com/css2?${families.map((n) => `family=${encodeURIComponent(n).replace(/%20/g, "+")}`).join("&")}&display=swap`;
    document.head.appendChild(plain);
    // The Bismillah in Arabic letters, in Amiri, asked for on its own (it has none of the weights the
    // first request names, which would fail that request for every face), as cards.js does. The page
    // had set it in whatever Arabic face the phone had (11 November 2026).
    if (data.invocation !== false && /[؀-ۿﭐ-﷿]/.test(inv)) {
      const ar = document.createElement("link");
      ar.rel = "stylesheet";
      ar.href = "https://fonts.googleapis.com/css2?family=Amiri&display=swap";
      document.head.appendChild(ar);
    }

    if (luminance(p.paper || "#fbf8f2") < 0.35) document.body.classList.add("dark");
    // An invite whose ornaments we left out (custom.hide "ornaments"): its headings keep their room (engine.css).
    if (hidden("ornaments")) document.body.classList.add("no-orn");
    setFoils(p.gold || "#b08d4c", p.paper || "#fbf8f2", p.accent || "#a3122f");
    if (art("paper")) r.setProperty("--paper-tex", `url("${art("paper")}")`);
    // The couple's own song (kept with their photos), a track from the music library, or the design's
    // own, on a loop. "off": no music and no button.
    if (data.music === "off") $("#soundBtn").style.display = "none";
    else $("#music").src = (data.music && (/^(assets\/|\/|https?:)/.test(data.music) || /^\/api\/wedding\/media\/[0-9a-f-]{36}$/.test(data.music) || /^music\/[a-z0-9-]+\.mp3$/.test(data.music))) ? data.music : (theme.music ? base + theme.music : `${ROOT}themes/theme.mp3`);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = p.night || p.paper || "#ebe3d5";
  }

  // Gold text must still read on the paper at its lightest stop, and white on gold buttons.
  function setFoils(gold, paper, accent) {
    const rgb = (h) => { const n = parseInt(h.replace("#", "").slice(0, 6), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
    const hex = (c) => `#${c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("")}`;
    const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
    const g = rgb(gold), pL = luminance(paper), darkPaper = pL < 0.35;
    const toward = darkPaper ? [255, 248, 230] : [24, 14, 4];
    // The first shade of gold, moving away from the paper, that reaches the contrast asked for.
    const shade = (target, lighten = 0, from = g) => {
      const base = mix(from, [255, 255, 255], lighten);
      for (let t = 0; t <= 1; t += 0.02) { const c = mix(base, toward, t); if (contrast(luminance(hex(c)), pL) >= target) return hex(c); }
      return hex(toward);
    };
    // Any theme colour used for text is moved just far enough from the paper to read (4.6:1).
    ink = (h, target = 4.6) => shade(target, 0, rgb(h));
    const deep = shade(6), mid = shade(4.2), hi = shade(3.4, 0.35);
    const r = document.documentElement.style, b = document.body.style;
    r.setProperty("--foil", `linear-gradient(100deg, ${deep} 0%, ${mid} 22%, ${hi} 38%, ${deep} 55%, ${hi} 72%, ${deep} 100%)`);
    // Set on the body so they win over the stylesheet's dark-mode defaults.
    b.setProperty("--gold-deep", ink(gold));
    b.setProperty("--gold-text", ink(gold));
    b.setProperty("--accent-text", ink(accent));
    // The soft ink (captions, small capitals) is the ink mixed towards the paper: as soft as the
    // paper allows while still reading at 4.6:1 (on a warm yellow paper, 68% isn't enough).
    {
      const ic = rgb(theme.palette?.ink || "#2b1b17"), pc = rgb(paper);
      let soft = hex(ic);
      for (let t = 0.32; t >= 0; t -= 0.02) { const c = hex(mix(ic, pc, t)); if (contrast(luminance(c), pL) >= 4.6) { soft = c; break; } }
      b.setProperty("--ink-soft", soft);
    }
    // A filled band with white text (the "today" banner) needs the accent dark enough for white.
    b.setProperty("--accent-fill", (() => { const a = rgb(accent); for (let t = 0; t <= 1; t += 0.02) { const c = mix(a, [20, 10, 6], t); if (luminance(hex(c)) <= 0.175) return hex(c); } return "#2a1a08"; })());
    // Until the opening's painting loads, the screen shows its top edge's colour above and its bottom edge's below.
    const edge = theme.opening?.edge;
    if (edge) {
      b.setProperty("--gate-top", edge.top || edge);
      b.setProperty("--gate-bottom", edge.bottom || edge);
    }
    // The greeting and the hint sit on the painting in one of two tones: light gold and cream on
    // dark ground, deep gold and ink on light ground (readGate picks one for each).
    const until = (from, to, ok) => { for (let t = 0; t <= 1; t += 0.02) { const c = hex(mix(from, to, t)); if (ok(luminance(c))) return c; } return hex(to); };
    const { ink: inkC = "#574d43", night = "#2a1f18" } = theme.palette || {};
    const lightPaper = luminance(paper) > 0.5 ? paper : "#fbf3e4", darkInk = luminance(inkC) <= 0.1 ? inkC : until(rgb(night), [8, 4, 2], (L) => L <= 0.02);
    const tones = { hi: until(g, [255, 248, 232], (L) => L >= 0.45), cream: hex(mix(rgb(lightPaper), [255, 255, 255], 0.55)), lo: until(g, [24, 14, 4], (L) => L <= 0.1), ink: darkInk };
    for (const [k, v] of Object.entries(tones)) b.setProperty(`--gate-${k}`, v);
    gateTones = { dark: [luminance(tones.hi), luminance(tones.cream)], light: [luminance(tones.lo), luminance(tones.ink)] };
    // Buttons carry white text: every stop stays dark enough for 4.5:1.
    const btn = (maxL, lighten) => { const base = mix(g, [255, 255, 255], lighten); for (let t = 0; t <= 1; t += 0.02) { const c = mix(base, [30, 18, 6], t); if (luminance(hex(c)) <= maxL) return hex(c); } return "#2a1a08"; };
    r.setProperty("--foil-deep", `linear-gradient(100deg, ${btn(0.07, 0)} 0%, ${btn(0.12, 0)} 30%, ${btn(0.175, 0.3)} 48%, ${btn(0.13, 0)} 66%, ${btn(0.07, 0)} 100%)`);
  }

  let ink = (h) => h;
  // The luminance of the opening words in each tone: [greeting, its small line and the hint].
  let gateTones = { dark: [0.5, 0.9], light: [0.08, 0.03] };

  function luminance(hex) {
    const n = parseInt(hex.replace("#", "").slice(0, 6), 16);
    const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  // ───────── The opening ─────────
  function renderGate() {
    const u = t();
    if (theme.opening?.edge) $("#gate").dataset.edge = "";
    $("#greet").innerHTML = family
      ? `${esc(u.dear(greetName()))}<small>${esc(u.dearSub)}</small>`
      : `${esc(u.invited)}${has(data.city) && !hidden("heroTown") ? `<small>${esc(u.invitedSub(pick(data.city)))}</small>` : ""}`; // the quick start leaves the city for later; a family may keep the town off the first screens (custom.hide "heroTown", Jatin, 17 November 2026)
    tagEl($("#greet"));
    const type = theme.opening?.type || "envelope";
    // A theme may word its own hint (Genda's marigold strings use the curtains opening). In a language
    // beyond Hindi the theme rarely has one, so the gesture's own words stand in (langs.js).
    $("#hint").textContent = theme.opening?.hint?.[TAG] || (PK() && lang === "hi" && u.hint[theme.opening?.gesture]) || u.hint[type] || u.openLabel;
    tagEl($("#hint"));
    // A page that opens at once (?open: the site's previews, the builder) never shows the opening,
    // so it never builds it or fetches its paintings.
    if (!renderGate.mounted && !params.has("open")) {
      renderGate.mounted = true;
      const make = window.SaathOpenings?.[type] || window.SaathOpenings?.reveal;
      const [p1, p2] = two(data.her, data.him);
      const initials = `${[...p1.en][0]}${[...p2.en][0]}`;
      renderGate.ctrl = make({
        stage: $("#stage"), theme, base, initials, reduced, label: u.openLabel,
        // The envelope's seal: the couple's choice (absent: their initials as a pair) and their names,
        // the first-named as "her" for the seal's left letter.
        seal: data.seal || null, couple: { her: p1, him: p2 },
        // What the card that slides out of an envelope says.
        card: { kicker: u.invited, names: lang === "hi" ? [p1.hi || p1.en, p2.hi || p2.en] : [p1.en, p2.en], amp: u.amp, lang: TAG },
        // A layout's own first screen, for an opening that hands over to it (the newspaper).
        page: LAY?.hero ? LAY.hero(api()) : "",
        // The record and the engine's helpers, for an opening drawn from the couple's own words and
        // photos (the trailer), read when it plays so a language switched on the gate is honoured.
        api,
        onOpen: () => open(),
      });
      mountGate();
    }
    fitGate();
  }

  // The painting fills the screen, and the greeting and the hint sit on it.
  function mountGate() {
    const gate = $("#gate"), ctrl = renderGate.ctrl;
    if (!ctrl?.box) return;
    // The dim room round the painting on a screen wider than it.
    const fill = document.createElement("div");
    fill.className = "gate-fill";
    fill.setAttribute("aria-hidden", "true");
    gate.prepend(fill);
    // On a phone, the small bands above and below a painting that can't be cropped (Hum Dono's wide
    // envelope) carry on its own edge, mirrored, so the paper or the wood runs on to the screen's edge.
    for (const side of ["top", "bottom"]) {
      const m = document.createElement("div");
      m.className = `gate-mirror ${side}`;
      m.setAttribute("aria-hidden", "true");
      const still = theme.opening?.type === "film" && theme.opening.first ? base + theme.opening.first : art("closed");
      if (still) m.style.backgroundImage = `url("${still}")`;
      fill.after(m);
    }
    // Until the painting is read, each line takes the tone of the edge it sits nearest, lightly frosted.
    const edge = theme.opening?.edge;
    for (const [el, at] of [[$("#greet"), edge?.top || edge], [$("#hint"), edge?.bottom || edge]]) {
      const dark = typeof at === "string" ? luminance(at) < 0.3 : document.body.classList.contains("dark");
      el.classList.toggle("tone-dark", dark);
      el.classList.toggle("tone-light", !dark);
      el.style.setProperty("--frost-rgb", dark ? "0 0 0" : "255 252 244");
      el.style.setProperty("--frost-a", "0.22");
    }
    ctrl.closed?.then((img) => { readGate.img = img; readGate(); }).catch(() => {});
    // The phone turning, a window resized, the browser's bars coming and going.
    if (window.ResizeObserver) new ResizeObserver(() => fitGate()).observe(gate);
    document.fonts?.ready.then(() => fitGate());
  }

  // The painting covers the screen (object-fit: cover). A phone crops its sides, never what the
  // guest touches. A screen wider than the painting may crop up to 12% of its height (a tablet
  // held upright); any wider (a laptop) and the painting shows its whole height in a dim room, so
  // the greeting and the hint keep the bands of sky, wall or water the painting leaves for them
  // (cropping the top pushes the greeting down onto the arch or the tower). A phone that must show
  // a wide focus whole fills the bands above and below with the painting's edge, mirrored.
  // Every layer of the opening is placed in fractions of this box, so the doors, the seal, the
  // pulse, the canvases and the light all move and crop with the painting.
  function fitGate() {
    const gate = $("#gate"), ctrl = renderGate.ctrl, box = ctrl?.box;
    if (!box || gate.hidden) return;
    const W = gate.clientWidth, H = gate.clientHeight;
    if (!W || !H) return;
    const [aw, ah] = String(theme.opening?.aspect || "1024 / 1536").split("/").map(Number);
    const [fx0, fy0, fx1, fy1] = ctrl.focus || [0.25, 0.25, 0.75, 0.75];
    const cover = Math.max(W / aw, H / ah), whole = Math.min(W / aw, H / ah);
    const s = Math.max(whole, Math.min(H / (ah * cover) >= 0.88 ? cover : whole, W / ((fx1 - fx0) * aw)));
    const w = Math.round(aw * s), h = Math.round(ah * s);
    // Along each side: centred, then moved as little as it takes to keep the focus in view.
    const place = (len, view, f0, f1) => {
      if (len <= view + 1) return Math.round((view - len) / 2);
      const at = Math.max(-f0 * len, Math.min((view - len) / 2, view - f1 * len));
      return Math.round(Math.min(0, Math.max(view - len, at)));
    };
    const x = place(w, W, fx0, fx1), y = place(h, H, fy0, fy1);
    Object.assign(box.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
    const framed = w < W - 1 || h < H - 1;
    const mirrored = framed && w >= W - 1 && H - h <= 0.5 * h;
    gate.classList.toggle("framed", framed && !mirrored);
    gate.classList.toggle("mirrored", mirrored);
    if (mirrored) {
      const flip = { width: `${w}px`, left: `${x}px`, backgroundSize: `${w}px ${h}px` };
      Object.assign($(".gate-mirror.top", gate)?.style || {}, flip, { top: "0px", height: `${y + 1}px`, backgroundPosition: "0 0" });
      Object.assign($(".gate-mirror.bottom", gate)?.style || {}, flip, { top: `${y + h - 1}px`, height: `${H - y - h + 1}px`, backgroundPosition: "0 100%" });
    }
    fitGate.at = { x, y, w, h, mirrored };
    readGate();
  }

  // The greeting and the hint are judged on the painting under them, as the hero's words are: light
  // words on dark ground, dark on light, and a frost when the ground is busy. They keep their places
  // (the top of a painting is usually its sky or wall; lower down it gets busier, not calmer).
  function readGate() {
    const gate = $("#gate"), img = readGate.img, at = fitGate.at;
    if (!img?.naturalWidth || !at || opened) return;
    try {
      const W = gate.clientWidth, H = gate.clientHeight, SW = 160, k = SW / W, SH = Math.round(H * k);
      const c = document.createElement("canvas");
      c.width = SW; c.height = SH;
      const g = c.getContext("2d", { willReadFrequently: true });
      if (gate.classList.contains("framed")) {
        g.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--night").trim() || "#2a1f18";
        g.fillRect(0, 0, SW, SH);
      }
      g.drawImage(img, at.x * k, at.y * k, at.w * k, at.h * k);
      if (at.mirrored) {
        // The mirrored bands, as fitGate lays them out.
        const nw = img.naturalWidth, nh = img.naturalHeight, top = at.y, bottom = H - at.y - at.h;
        g.save(); g.translate(0, top * k); g.scale(1, -1);
        if (top > 0) g.drawImage(img, 0, 0, nw, (nh * top) / at.h, at.x * k, 0, at.w * k, top * k);
        g.restore();
        g.save(); g.translate(0, (at.y + at.h) * k); g.scale(1, -1);
        if (bottom > 0) g.drawImage(img, 0, nh - (nh * bottom) / at.h, nw, (nh * bottom) / at.h, at.x * k, -bottom * k, at.w * k, bottom * k);
        g.restore();
      }
      const P = pixelsOf(g, SW, SH, k);
      const rect = (el, host) => ({ x: (host?.offsetLeft || 0) + el.offsetLeft, y: (host?.offsetTop || 0) + el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
      // Each line against its own ground: the script greeting needs 3:1, the small lines 4.5:1 (WCAG).
      const judge = (el, lines) => {
        const b = rect(el);
        const whole = zoneStats(P, b.x - 8, b.y - 8, b.w + 16, b.h + 16);
        if (!whole) return null;
        const per = lines.map(([r, need, i]) => [zoneStats(P, r.x, r.y, r.w, r.h), need, i]).filter(([z]) => z);
        const short = (dark) => per.reduce((n, [z, need, i]) => n + Math.max(0, need - (dark ? contrast(gateTones.dark[i], z.p90) : contrast(gateTones.light[i], z.p10))), 0);
        const sl = short(true), sd = short(false), dark = sl <= sd;
        // A thin line of capitals across a busy band is lost even when the box round it is calm.
        return { whole, dark, short: dark ? sl : sd, busy: Math.max(busyOf(whole), ...per.map(([z]) => busyOf(z))) };
      };
      const greet = $("#greet"), small = greet.querySelector("small"), hint = $("#hint");
      const gj = judge(greet, [[rect(greet), 3, 0], ...(small ? [[rect(small, greet), 4.5, 1]] : [])]);
      if (gj) setTone(greet, greet, gj);
      const hj = judge(hint, [[rect(hint), 4.5, 1]]);
      if (hj) setTone(hint, hint, hj);
    } catch (e) { console.warn("gate read", e); }
  }

  function open(instant = false) {
    if (opened) return;
    opened = true;
    if (!instant && !params.has("play")) startMusic();
    const gate = $("#gate");
    gate.classList.add("opening");
    const finish = () => {
      document.body.classList.remove("sealed");
      document.body.classList.add("body-open");
      gate.classList.add("gone");
      $("#controls").hidden = false;
      setTimeout(() => (gate.hidden = true), 1000);
    };
    if (instant || reduced) return finish();
    const p = renderGate.ctrl?.play?.();
    (p instanceof Promise ? p : new Promise((r) => setTimeout(r, 1300))).then(finish);
  }

  // ───────── Layouts ─────────
  async function loadLayout(name) {
    const id = String(name).replace(/[^a-z0-9-]/gi, "");
    const css = document.createElement("link");
    css.rel = "stylesheet"; css.href = `${ROOT}layouts/${id}.css`;
    document.head.appendChild(css);
    await new Promise((ok) => { const s = document.createElement("script"); s.src = `${ROOT}layouts/${id}.js`; s.onload = s.onerror = ok; document.head.appendChild(s); });
    document.body.classList.add(`layout-${id}`);
    return window.SaathLayouts?.[id] || null;
  }
  // What a layout may use: the record, the page's language and the engine's own helpers.
  const api = () => ({
    data, theme, base, ROOT, lang, family, group, u: t(), pick, esc, fmt, clock, art, has, nb, events, firstEvent, mainEvent, mainDate, heroDate, occasion, fnNames, media,
    // The page's real language tag ("mr" where lang is "hi") and its attribute, with dir for Urdu.
    tag: TAG, la: LA(),
    famName: greetName, divider, sec, SLOT_FOR, two, initials: () => two(data.her?.en?.[0] || "", data.him?.en?.[0] || ""),
  });

  // ───────── The hero ─────────
  function renderHero() {
    const u = t();
    if (LAY?.hero) {
      // The layout draws the first screen itself (a front page, a scrapbook page).
      $("#hero").classList.add("custom");
      let host = $("#layHero");
      if (!host) { host = document.createElement("div"); host.className = "lay-hero"; host.id = "layHero"; $("#hero").appendChild(host); }
      host.innerHTML = LAY.hero(api());
      LAY.mountHero?.(host, api());
      $("#down").innerHTML = `<span>${esc(u.down)}</span>${CHEVRON}`;
      tagEl($("#down"));
      $("#langBtn").textContent = switchLabel(u);
      tagEl($("#langBtn"), tagOf(lang === "en" ? "hi" : "en"));
      return;
    }
    const h = theme.art?.heroZone;
    const words = $("#heroWords");
    if (art("hero")) {
      $("#heroArt").src = art("hero");
      $("#heroArt").addEventListener("error", () => $("#hero").classList.add("plain"), { once: true });
    } else $("#hero").classList.add("plain");
    // The words keep their place in the painting, but never sit higher than just under the top
    // inset (the island, inside the site's phone mockup; 0 in a browser), so only paintings that
    // set their names near the very top move down.
    if (h) Object.assign(words.style, { top: `max(${Math.max(h.top, TOP_ROOM) * 100}%, calc(var(--safe-t) + 24px))`, left: `${(h.left ?? 0.15) * 100}%`, right: `${(1 - (h.right ?? 0.85)) * 100}%` });
    $("#hero").classList.toggle("tone-dark", (h?.tone || theme.art?.heroTone) === "dark");
    const names = lang === "hi" ? two(data.her.hi, data.him.hi) : two(data.her.en, data.him.en);
    // A line we set over the welcome for one family (custom.words.heroTop: "Lord of Love Radhe Krishna").
    words.innerHTML = `
      ${ownLine("heroTop") ? `<p class="hw-top" ${LA()}>${lines(ownLine("heroTop"))}</p>` : ""}
      <p class="hw-pre" ${LA()}>${esc(u.welcome)}</p>
      <div class="hw-names"><p class="hw-name" ${LA()}>${esc(names[0])}</p><p class="hw-amp" ${LA()}>${esc(u.amp)}</p><p class="hw-name" ${LA()}>${esc(names[1])}</p></div>
      <span class="hw-rule">${divider()}</span>
      ${mainDate() && (heroDate() || (has(data.city) && !hidden("heroTown"))) ? `<p class="hw-date" ${LA()}>${[heroDate() && esc(fmt(heroDate(), { day: "numeric", month: "long", year: "numeric" })), !hidden("heroTown") && esc(pick(data.city))].filter(Boolean).join("<br>")}</p>` : ""}`;
    $("#heroArt").alt = "";
    fitHero();
    $("#down").innerHTML = `<span>${esc(u.down)}</span>${CHEVRON}`;
    tagEl($("#down"));
    $("#langBtn").textContent = switchLabel(u);
    tagEl($("#langBtn"), tagOf(lang === "en" ? "hi" : "en"));
  }

  // Place the words where the painting is calm, pick the text tone from what is under them,
  // and frost the painting behind them when it is still too busy to read.
  function fitHero() {
    if (LAY?.hero) return;
    const img = $("#heroArt");
    const go = () => requestAnimationFrame(() => { try { readHero(); } catch (e) { console.warn("hero read", e); } });
    img.complete && img.naturalWidth ? go() : img.addEventListener("load", go, { once: true });
    document.fonts?.ready.then(go);
  }

  function heroPixels() {
    const img = $("#heroArt"), r = { width: img.offsetWidth, height: img.offsetHeight };
    if (!img.naturalWidth || !r.width) return null;
    const W = 120, H = Math.round((W * r.height) / r.width);
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d", { willReadFrequently: true });
    // object-fit: cover
    const k = Math.max(r.width / img.naturalWidth, r.height / img.naturalHeight) * (W / r.width);
    const dw = img.naturalWidth * k, dh = img.naturalHeight * k;
    g.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    return pixelsOf(g, W, H, W / r.width);
  }

  // A small canvas's pixels and their luminance; scale turns CSS pixels into the canvas's.
  function pixelsOf(g, W, H, scale) {
    const px = g.getImageData(0, 0, W, H).data;
    const lum = new Float32Array(W * H);
    const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    for (let i = 0; i < W * H; i++) lum[i] = 0.2126 * lin(px[i * 4]) + 0.7152 * lin(px[i * 4 + 1]) + 0.0722 * lin(px[i * 4 + 2]);
    return { W, H, lum, px, scale };
  }

  // Mean luminance, its spread and edge density inside a box given in CSS pixels of the hero.
  function zoneStats(P, x, y, w, h) {
    const x0 = Math.max(0, Math.floor(x * P.scale)), y0 = Math.max(0, Math.floor(y * P.scale));
    const x1 = Math.min(P.W - 1, Math.ceil((x + w) * P.scale)), y1 = Math.min(P.H - 1, Math.ceil((y + h) * P.scale));
    let n = 0, sum = 0, sq = 0, edge = 0, rr = 0, gg = 0, bb = 0;
    const all = [];
    for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) {
      const i = yy * P.W + xx, L = P.lum[i];
      n++; sum += L; sq += L * L; all.push(L);
      edge += Math.abs(L - P.lum[i + 1]) + Math.abs(L - P.lum[i + P.W]);
      rr += P.px[i * 4]; gg += P.px[i * 4 + 1]; bb += P.px[i * 4 + 2];
    }
    if (!n) return null;
    const mean = sum / n;
    all.sort((a, b) => a - b);
    return { mean, sd: Math.sqrt(Math.max(0, sq / n - mean * mean)), edge: edge / n, p10: all[Math.floor(n * 0.1)], p90: all[Math.floor(n * 0.9)], rgb: [rr / n, gg / n, bb / n].map(Math.round) };
  }
  const busyOf = (z) => 10 * z.edge;
  if (params.has("debug")) window.__saath = { heroPixels, zoneStats: (...a) => zoneStats(...a) };
  const contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

  function readHero() {
    const hero = $("#hero"), words = $("#heroWords");
    if (hero.classList.contains("plain")) return;
    const P = heroPixels();
    if (!P) return;
    const H = hero.clientHeight, Wd = hero.clientWidth;
    const zone = theme.art?.heroZone;
    words.style.setProperty("--hw-k", "1");
    const box = () => { const r = words.getBoundingClientRect(), h = hero.getBoundingClientRect(); return { x: r.left - h.left, w: r.width, h: r.height }; };
    // The two text tones the theme can show, measured once.
    const toneL = (dark) => {
      hero.classList.toggle("tone-dark", dark);
      hero.classList.toggle("tone-light", !dark);
      const [r, g, b] = getComputedStyle(words.querySelector(".hw-pre") || words).color.match(/[\d.]+/g).map(Number);
      return luminance(`#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`);
    };
    const lightL = toneL(true), darkL = toneL(false);
    // Each line is judged on its own ground: small lines need 4.5:1, the large names 3:1 (WCAG).
    const lines = [[".hw-pre", 4.5], [".hw-names", 3], [".hw-date", 4.5]].map(([q, need]) => [words.querySelector(q), need]).filter(([el]) => el);
    const judge = (b, y) => {
      const whole = zoneStats(P, b.x - 8, y - 8, b.w + 16, b.h + 16);
      if (!whole) return null;
      const per = lines.map(([el, need]) => [zoneStats(P, b.x + el.offsetLeft, y + el.offsetTop, el.offsetWidth, el.offsetHeight), need]).filter(([z]) => z);
      const short = (dark) => per.reduce((n, [z, need]) => n + Math.max(0, need - (dark ? contrast(lightL, z.p90) : contrast(darkL, z.p10))), 0);
      const sl = short(true), sd = short(false), dark = sl <= sd;
      return { whole, dark, short: dark ? sl : sd, busy: busyOf(whole) };
    };
    let best = null;
    // Never under the island inside the site's phone mockup: it ends about 48px down, so the words
    // start at 52px there (the 59px inset also clears the status bar, which the painting may run under).
    // Elsewhere the device's own top inset, which is 0 in a browser tab.
    const inset = document.documentElement.classList.contains("in-phone") ? 52 : parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--safe-t")) || 0;
    // And always some room above them: at least 7.5% of the painting from its top edge, and under an
    // island or notch a further 4% (founders, 21 October 2026: the names sat too close to the top).
    const room = Math.max(TOP_ROOM * H, inset ? inset + 0.04 * H : 0);
    // A long name in a script face is one word that can't wrap (Siddharthvardhan): cap the scale so
    // the longest name fits its line, else it runs off the screen.
    words.classList.remove("hw-inline");
    let kMax = 1;
    const wide = () => [...words.querySelectorAll(".hw-name")].some((n) => n.scrollWidth > words.clientWidth + 1);
    while (wide() && kMax > 0.45) { kMax -= 0.04; words.style.setProperty("--hw-k", kMax.toFixed(2)); }
    const tries = [[false, 1], [false, 0.88], [true, 1], [false, 0.76], [true, 0.88], [true, 0.76], [false, 0.66], [true, 0.66]]
      .map(([inline, k]) => [inline, Math.min(k, kMax)]);
    // A theme's calm zone, when given, holds the words; otherwise (or if nothing fits it) search the upper two thirds.
    const search = (inZone, floor = room, slack = 0) => { for (const [inline, k] of tries) {
      words.classList.toggle("hw-inline", inline);
      words.style.setProperty("--hw-k", String(k));
      if (inline) { const row = words.querySelector(".hw-names"); if (row.scrollWidth > words.clientWidth + 1) continue; }
      const b = box();
      const lo = Math.max(inZone ? zone.top * H : 0.04 * H, floor), hi = inZone ? (zone.bottom + slack) * H - b.h : Math.min(0.66 * H, H - b.h - 0.1 * H);
      if (hi < lo) continue;
      for (let y = lo; y <= hi + 0.5; y += Math.max(2, H * 0.01)) {
        const j = judge(b, y);
        if (!j) continue;
        // Calm ground first, then enough contrast on every line, then larger words placed higher.
        // A small shortfall is cured by a light frost; a large one means the words are in the wrong place.
        const score = j.busy + (j.short <= 0.8 ? 0.04 : 0.12) * j.short + 0.06 * (y / H) + 0.25 * (1 - k) + (inline ? 0.02 : 0);
        if (!best || score < best.score) best = { y, k, inline, j, score };
      }
      if (best && best.j.busy < 0.2 && best.j.short <= 0.8) break;
    } };
    if (zone?.bottom) search(true);
    // Words that don't fit the calm zone with that room (long names, or the phone's island) may run
    // a little past its bottom, then sit just under the inset, before they leave the zone to cover
    // the painting.
    if (!best && zone?.bottom) search(true, room, 0.035);
    if (!best && zone?.bottom && room > inset) search(true, inset);
    if (!best) search(false);
    if (!best) return;
    words.classList.toggle("hw-inline", !!best.inline);
    words.style.setProperty("--hw-k", String(best.k));
    words.style.top = `${(best.y / H) * 100}%`;
    setTone(hero, words, best.j);
  }

  // Light text on dark ground, dark text on light ground; frost the ground when contrast or calm is short.
  function setTone(host, el, j) {
    const { whole: z, dark, short, busy } = j;
    host.classList.toggle("tone-dark", dark);
    host.classList.toggle("tone-light", !dark);
    const need = Math.max(0, Math.min(1, Math.max((busy - 0.2) / 0.3, short / 2.5)));
    const [r, g, b] = z.rgb;
    // The frost takes the painting's own colour, pushed towards paper or night.
    const mix = dark ? [r * 0.45, g * 0.45, b * 0.5] : [r + (255 - r) * 0.6, g + (255 - g) * 0.6, b + (255 - b) * 0.55];
    el.style.setProperty("--frost-rgb", mix.map(Math.round).join(" "));
    el.style.setProperty("--frost-a", need ? (0.15 + 0.45 * need).toFixed(2) : "0");
    el.style.setProperty("--frost-blur", need ? `${Math.round(6 + 10 * need)}px` : "0px");
    el.dataset.read = JSON.stringify({ L: +z.mean.toFixed(3), busy: +busy.toFixed(3), short: +short.toFixed(2), need: +need.toFixed(2) });
  }

  function renderToday() {
    const today = dayKey(new Date());
    const now = events().find((e) => dayKey(new Date(e.start)) === today);
    const bar = $("#today");
    if (!now) return (bar.hidden = true);
    bar.hidden = false;
    tagEl(bar);
    bar.textContent = t().today(pick(now.name), clock(now.start), pick(now.place));
  }

  // A line of a crescent moon and two stars in place of the design's divider, for a family who asked
  // (custom.divider "crescent", Aimen, 11 November 2026: "remove this motif from everywhere ... add a line
  // of crescent moon or stars"). cards.js draws the same.
  const CRESCENT = `<svg class="orn cres" viewBox="0 0 150 14" aria-hidden="true"><defs><linearGradient id="saathCresL" gradientUnits="userSpaceOnUse" x1="10" x2="59" y1="0" y2="0"><stop offset="0" stop-color="currentColor" stop-opacity="0"/><stop offset="1" stop-color="currentColor" stop-opacity=".85"/></linearGradient><linearGradient id="saathCresR" gradientUnits="userSpaceOnUse" x1="140" x2="91" y1="0" y2="0"><stop offset="0" stop-color="currentColor" stop-opacity="0"/><stop offset="1" stop-color="currentColor" stop-opacity=".85"/></linearGradient></defs><path d="M10 7H59" stroke="url(#saathCresL)" stroke-width=".7"/><path d="M91 7H140" stroke="url(#saathCresR)" stroke-width=".7"/><g fill="currentColor"><path d="M64.5 4.4c.25 1.9.7 2.35 2.6 2.6-1.9.25-2.35.7-2.6 2.6-.25-1.9-.7-2.35-2.6-2.6 1.9-.25 2.35-.7 2.6-2.6Z"/><path d="M85.5 4.4c.25 1.9.7 2.35 2.6 2.6-1.9.25-2.35.7-2.6 2.6-.25-1.9-.7-2.35-2.6-2.6 1.9-.25 2.35-.7 2.6-2.6Z"/><path d="M74.57 2.42A4.6 4.6 0 1 0 79.16 8.97A4.0 4.0 0 0 1 74.57 2.42Z"/></g></svg>`;
  function divider() {
    if (custom().divider === "crescent") return CRESCENT;
    if (hidden("ornaments")) return "";
    return art("divider") ?`<img class="divider-art" src="${art("divider")}" alt="" aria-hidden="true">` : ORN;
  }

  // ───────── Sections ─────────
  const SECTIONS = [
    { id: "note", when: () => has(family?.note), html: secNote },
    { id: "date", when: () => !!mainDate() && !afterWedding() && !theme.opening?.showsDate, html: secDate },
    { id: "invitation", when: () => true, html: secInvitation },
    { id: "story", when: () => has(data.story) || has(data.timeline), html: secStory },
    { id: "photos", when: () => has(data.photos), html: secPhotos },
    { id: "celebrations", when: () => full() && events().length > 0, html: secEvents },
    { id: "countdown", when: () => !!countTarget() && new Date(countTarget().start) > Date.now(), html: secCountdown },
    { id: "venue", when: () => full() && (has(data.venue?.name) || has(data.venue?.address) || events().some(ownVenue)), html: secVenue },
    { id: "travel", when: () => full() && (has(data.travel) || has(data.stay)), html: secTravel },
    { id: "dress", when: () => full() && events().some((e) => has(e.dress) || has(e.palette)), html: secDress },
    { id: "family", when: () => full() && (["blessings", "darshanabhilashi", "swagatotsuk", "kids"].some((k) => famList(k).length) || !!own("kidsLine")), html: secFamily },
    { id: "song", when: () => !!data.song?.url, html: secSong },
    { id: "voice", when: () => !!data.voice, html: secVoice },
    { id: "rsvp", when: () => full() && data.rsvp !== false && events().length > 0 && !afterWedding(), html: secRsvp },
    { id: "contacts", when: () => full() && (data.contacts || []).some((c) => c.phone), html: secContacts },
    { id: "shagun", when: () => full() && !!data.upi, html: secShagun },
    { id: "thanks", when: () => afterWedding(), html: secThanks },
  ];

  function sec(id, title, inner, lede = "") {
    // A heading left out for one family (custom.hide, "storyTitle") takes its ornament with it.
    const head = !hidden(`${id}Title`), orn = head ? divider() : "";
    return `<section class="sec${head ? "" : " untitled"}" id="${id}">
      ${head ? `<h2 class="h reveal${String(title).length > 34 ? " long" : ""}" ${LA()}>${esc(title)}</h2>` : ""}
      ${orn ? `<div class="sec-orn">${orn}</div>` : ""}
      ${lede ? `<p class="lede reveal" ${LA()}>${lines(lede)}</p>` : ""}
      ${inner}
    </section>`;
  }

  // The couple's own note to this family, in their words alone: the invite already greets them by name
  // (a couple asked to drop the "For the … family" above it, 3 November 2026).
  function secNote() {
    return `<section class="sec note" id="note">
      <p class="note-text reveal" ${LA()}>${esc(pick(family.note))}</p>
    </section>`;
  }

  function secDate() {
    const u = t();
    const day = mainDate();
    // A save-the-date gives the day and the city: the time and the place come with the invitation.
    // The line names the day scratched: with no function that day, the wedding time the couple gave.
    const m = mainEvent();
    const w = full() ? (m && istDay(m.start) === istDay(day) ? m : { start: day, place: data.venue?.name }) : { ...(m || {}), start: day, place: data.city };
    // The day, the month and the year each under its own foil, or the whole date under one, as the
    // couple chooses in the editor (scratch: "one", Gautam, 4 November 2026), or no foil at all
    // (scratch: "off", 17 November 2026): the date as it is, its day and place under it.
    const one = data.scratch === "one";
    const plain = data.scratch === "off";
    const partsOf = (iso) => (one
      ? [[u.date, fmt(iso, { day: "numeric", month: "long", year: "numeric" }), true]]
      : [[u.day, fmt(iso, { day: "numeric" }), false], [u.month, fmt(iso, { month: "long" }), true], [u.year, fmt(iso, { year: "numeric" }), false]]);
    // A function shown with the wedding date (keyDate) is scratched too, in its own box with its name
    // over it, in date order: a family's main function can be the lagan (Dushyant & Parul, 11 November
    // 2026: "isme add kro lagan ceremony ... or venue", "dono chahiye").
    const keys = keyDates();
    const placeOf = (e) => pick(e.place) || (atMainVenue(e) || !ownVenue(e) ? pick(data.venue?.name) : pick(e.address));
    const groups = [
      { iso: day, e: w, main: true, label: keys.length ? String(pick(m?.name) || "").trim() : "" },
      ...keys.map((e) => ({ iso: e.start, e, main: false, label: String(pick(e.name)).trim() })),
    ].sort((a, b) => new Date(a.iso) - new Date(b.iso));
    let n = 0;
    const html = groups.map((g, gi) => {
      const parts = partsOf(g.iso).map((p) => [...p, n++]);
      const shown = parts.every(([, , , i]) => revealed.has(i));
      // The day and time under the date can be left out for one invite (custom.hide "dateWhen"): one time
      // for a day of several functions read as the pheras' (Surabhi, 16 November 2026).
      const line = g.main
        ? `${hidden("dateWhen") ? "" : `${esc(full() ? whenOf(w === m ? m : null, fmt(w.start, { weekday: "long" }), w === m ? weddingAt(m) : w.start) : fmt(w.start, { weekday: "long" }))}<br>`}
        ${custom().mainVenue === true && has(data.venue?.name) ? `<span class="soft">${esc(pick(data.venue.name))}</span><br>` : has(w.place) ? `<span class="soft">${esc(pick(w.place))}</span><br>` : ""}
        ${data.events?.includes(w) ? `<button class="textbtn" type="button" data-cal="${data.events.indexOf(w)}" ${LA()}>${esc(u.addCal)}</button>` : ""}`
        : `${esc(whenOf(g.e, fmt(g.e.start, { weekday: "long" }), g.e.start))}<br>
        ${placeOf(g.e) ? `<span class="soft">${esc(placeOf(g.e))}</span><br>` : ""}
        <button class="textbtn" type="button" data-cal="${data.events.indexOf(g.e)}" ${LA()}>${esc(u.addCal)}</button>`;
      if (plain) return `<div class="date-group${groups.length > 1 ? " many" : ""}">
        ${g.label ? `<p class="caps date-k" ${LA()}>${esc(g.label)}</p>` : ""}
        <p class="date-plain reveal" ${LA()}>${esc(fmt(g.iso, { day: "numeric", month: "long", year: "numeric" }))}</p>
        <div class="when-wrap"${g.main ? ` id="whenLine"` : ""} data-g="${gi}"><p class="when-line" ${LA()}>
        ${line}
        </p></div>
      </div>`;
      return `<div class="date-group${groups.length > 1 ? " many" : ""}">
        ${g.label ? `<p class="caps date-k" ${LA()}>${esc(g.label)}</p>` : ""}
        <div class="cards${one ? " one" : ""}">
          ${parts.map(([unit, v, word, i]) => `
            <div class="card">
              <button class="foil${revealed.has(i) ? " done" : ""}" type="button" data-i="${i}" data-g="${gi}" data-unit="${esc(unit)}" data-v="${esc(v)}"
                aria-label="${esc(revealed.has(i) ? u.revealed(unit, v) : u.scratchLabel(unit))}">
                <span class="val${word ? " word" : ""}" ${LA()} aria-hidden="true">${esc(v)}</span>
                <canvas aria-hidden="true"></canvas>
              </button>
              ${one ? "" : `<span class="caps" ${LA()}>${esc(unit)}</span>`}
            </div>`).join("")}
        </div>
        <div class="when-wrap${shown ? "" : " hide"}"${g.main ? ` id="whenLine"` : ""} data-g="${gi}"><p class="when-line" ${LA()}>
        ${line}
        </p></div>
      </div>`;
    }).join("");
    // Nobody watching the video invite can scratch: there the line says what the film shows (the
    // collab bride Dipanwita, 3 November 2026).
    return sec("date", u.dateT, `
      ${plain ? "" : `<p class="sparkle-line reveal" ${LA()}><b aria-hidden="true">✦</b>${esc(params.has("video") ? u.revealing : groups.length > 1 && u.scratchMany ? u.scratchMany : u.scratch)}<b aria-hidden="true">✦</b></p>`}
      ${html}`);
  }

  // A blessing of several lines, one under another: a Jain couple's four (Shankheshwar Parshwanath,
  // Nakoda Bheru, Ganesh, Sati Mata, 4 November 2026). In English letters it's set in small capitals'
  // spacing, so its longest line fits a phone.
  const omLines = (s) => String(s).split("\n").map((l) => l.trim()).filter(Boolean).map((l) => `<span>${esc(l)}</span>`).join("");
  // The Bismillah as its one calligraphic sign, ﷽, is set larger (Aimen's card, 11 November 2026).
  const omClass = (s) => (/[a-z]/i.test(s) && !/[ऀ-ॿ]/.test(s) ? "om latin" : String(s).trim() === "﷽" ? "om sign" : "om");

  function secInvitation() {
    const u = t();
    // The formal invitation names them in full when the couple gave their full names ("as on the
    // formal card"), and in Hindi falls back to the English, as everything else does.
    const nm0 = (p) => (lang === "hi" ? p.full?.hi || p.hi || p.full?.en || p.en : p.full?.en || p.en);
    // A Marathi card names the bride चि. सौ. कां. and the groom चि. (langs.js), unless the couple
    // wrote it themselves, and not for a function of its own (a child's naming day).
    const nm = (p) => {
      const s = nm0(p), m = lang === "hi" && occasion() !== "function" ? PK()?.meta : null;
      const k = p === data.her ? "herPre" : "himPre";
      return m?.[k] && (p.full?.hi || p.hi) && !m.pre.test(s) ? `${m[k]}${s}` : s;
    };
    const pack = PACKS[data.community] || PACKS.none;
    // The couple's chosen line (in Hindi on the Hindi page, when we stored it so), else the design's
    // own (Ayodhya's जय सियाराम), else their tradition's.
    const invocation = data.invocation === false ? null : (lang === "hi" ? (data.invocationHi || "॥ ಶ್ರೀ ಗಣೇಶಾಯ ನಮಃ ॥") : (data.invocation || "॥ Sri Ganeshaya Namaha ॥"));
    const parents = has(data.parents?.her) || has(data.parents?.him);
    // A design's blessing painting (Ayodhya's Ram Darbar, 2 November 2026) opens the invitation, as
    // the deity heads a printed card: still, whole, above every word, until the couple turns it off.
    const blessing = data.blessing === false ? null : art("blessing");
    // Else a deity's emblem above the names (data.emblem, 11 November 2026), line art painted in the
    // design's own gold through a mask, as a printed card's foil.
    const emblem = !blessing && typeof data.emblem === "string" && /^[a-z-]{2,24}$/.test(data.emblem) ? `<span class="inv-emblem" aria-hidden="true" style="--emblem:url('${ROOT}emblems/${data.emblem}.png')"></span>` : "";
    const st = scriptTag(invocation || "");
    const line = invocation ? `<p class="${omClass(invocation)}" dir="auto"${st ? ` lang="${st}"` : ""}>${omLines(invocation)}</p>${divider() ? `<div class="sec-orn small">${divider()}</div>` : ""}` : "";
    // Each name with its parents under it: "Daughter of" in small capitals, then the parents. One invite
    // of ours (custom.parentsAround, Sonali, 18 November 2026) writes each family's line as one sentence,
    // "Beloved son of Smt. Namita and Shri Samarendra Mohapatra", the first name's above it and the
    // second's below, as on their printed card.
    const around = custom().parentsAround === true;
    const person = (p, par, word, first) => {
      const name = `<p class="name" ${LA()}>${esc(nm(p))}</p>`;
      if (!has(par)) return name;
      if (!around) return `${name}<p class="caps inv-of-k" ${LA()} style="margin-top:4px;max-width:none">${esc(word)}</p><p class="parents" ${LA()}>${parentBlock(par)}</p>`;
      const of = `<p class="inv-of" ${LA()}>${esc(word)} <span>${parentLines(par)}</span></p>`;
      return first ? `${of}${name}` : `${name}${of}`;
    };
    return `<section class="sec" id="invitation">
      <div class="arch-card reveal" id="archCard">
        <svg class="arch-top" id="archTop" aria-hidden="true"></svg>
        <i class="pillar l" aria-hidden="true"></i><i class="pillar r" aria-hidden="true"></i>
        <div class="arch-in">
          ${blessing ? `<img class="inv-blessing" src="${blessing}" alt="" decoding="async">${line}${logoMark("inv-logo")}` : emblem ? `${emblem}${line}${logoMark("inv-logo")}` : `${logoMark("inv-logo")}${line}`}
          <div class="inv">
            ${u.inviteFrom ? `<p class="inv-from" ${LA()}>${u.inviteFrom.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => `<span>${esc(nb(l))}</span>`).join("")}</p>` : ""}
            <p class="inv-lede" ${LA()}>${esc(parents ? u.blessing : u.ownVoice)}</p>
            ${two(person(data.her, data.parents?.her, u.daughter, !data.groomFirst), person(data.him, data.parents?.him, u.son, Boolean(data.groomFirst))).join(`
            <p class="with" ${LA()}>${esc(u.with)}</p>
            `)}
            ${parents && u.close ? `<p class="caps" ${LA()} style="margin-top:12px">${esc(u.close)}</p>` : ""}
            ${u.inviteAfter ? `<p class="inv-after" ${LA()}>${u.inviteAfter.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => `<span>${esc(nb(l))}</span>`).join("")}</p>` : ""}
            ${hidden("invWhen") ? "" : `
            ${mainDate() ? `<p class="inv-when" ${LA()}>${esc(fmt(mainDate(), { weekday: "long", day: "numeric", month: "long", year: "numeric" }))}</p>` : ""}
            ${full() && invPlace() ? `<p class="inv-place" ${LA()}>${esc(invPlace())}</p>` : ""}
            ${!full() && has(data.city) ? `<p class="inv-place" ${LA()}>${esc(pick(data.city))}</p>` : ""}
            ${keyDates().map((e) => `<p class="caps inv-key-k" ${LA()}>${esc(String(pick(e.name)).trim())}</p><p class="inv-key" ${LA()}>${esc(keyDay(e, { year: true }))}</p>`).join("")}`}
            ${u.follow ? `<p class="caps inv-follow" ${LA()}>${esc(u.follow)}</p>` : ""}
          </div>
        </div>
      </div>
    </section>`;
  }

  function secStory() {
    const u = t();
    return sec("story", u.storyT, `
      ${has(data.story) ? `${has(data.words?.dearAll) ? `<p class="dear reveal" ${LA()}>${esc(u.dearAll)}</p>` : ""}<p class="story reveal" ${LA()}>${esc(pick(data.story))}</p>` : ""}
      ${has(data.timeline) ? `<ol class="story-line">${data.timeline.map((m) => `<li class="reveal"><span class="sl-when" ${LA()}>${esc(pick(m.when))}</span><span class="sl-what" ${LA()}>${esc(pick(m.what))}</span></li>`).join("")}</ol>` : ""}
      ${u.storyLines ? `<div class="story-lines reveal" ${LA()}>${u.storyLines.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => { const m = l.match(/^(.{1,40}?)\s+[–—-]\s+(.+)$/); return m ? `<p class="sl-pair"><span class="sl-name">${esc(m[1])}</span><span>${esc(m[2])}</span></p>` : `<p>${esc(l)}</p>`; }).join("")}</div>` : ""}
      ${u.storyEnd ? `<p class="story-end reveal" ${LA()}>${lines(u.storyEnd)}</p>` : ""}`);
  }

  function secPhotos() {
    const u = t();
    const names = lang === "hi" ? two(esc(data.her.hi), esc(data.him.hi)).join(` <span class="so-amp">${esc(UI[TAG].amp)}</span> `) : two(esc(data.her.en), esc(data.him.en)).join(` <span class="so-amp">&amp;</span> `);
    return sec("photos", u.photosT, `
      <div class="photos" role="list" data-clarity-mask="true">
        ${data.photos.map((p) => `<figure class="ph" role="listitem">
          <div class="frame"><img src="${esc(media(p.src))}" alt="${esc(names)}${has(p.caption) ? `: ${esc(pick(p.caption))}` : ""}" loading="lazy" decoding="async"></div>
          ${has(p.caption) ? `<figcaption ${LA()}>${esc(pick(p.caption))}</figcaption>` : ""}
        </figure>`).join("")}
      </div>
      ${data.photos.length > 1 ? `<p class="swipe" ${LA()}>${esc(u.swipe)}</p>` : ""}`);
  }

  function secEvents() {
    const u = t();
    // Paintings are shared out over every function, so a family sees the same one on each card.
    // A close-family function carries no "Family only" tag: only the families marked close see it
    // anyway, and couples didn't want the tag on their guests' invites (Kriti & Partha, 3 November 2026).
    const arts = fnArt(data.events || []);
    // One invite of ours (custom.boldEvents, Sonali, 18 November 2026): each function's day, name and place heavier, in ink.
    return sec("celebrations", u.eventsT, `
      <div class="timeline${custom().boldEvents === true ? " tl-bold" : ""}">
        ${events().map((e) => {
          const slot = SLOT_FOR(e);
          const mood = theme.moods?.[slot]?.accent ? ink(theme.moods[slot].accent) : null;
          const file = arts.get(e);
          const img = file ? base + file : null;
          const i = data.events.indexOf(e);
          // A function at a venue of its own gives its place, its town and Directions here, and its full
          // address in the venue section below: given twice, it crowded the list (Surabhi, 5 November
          // 2026). Only a place left unnamed keeps its address here. walk.js's sheet does the same.
          return `<article class="tl"${mood ? ` style="--mood:${esc(mood)}"` : ""}>
            ${img ? `<img class="art reveal" src="${img}" alt="" loading="lazy" decoding="async">` : `<span class="art glyph reveal" aria-hidden="true">${ORN}</span>`}
            <div class="txt reveal">
              <span class="caps" ${LA()}>${esc(fmt(e.start, { weekday: "short", day: "numeric", month: "short" }))}</span>
              <span class="time" ${LA()}>${timeParts(e)}</span>
              ${hidden("eventName") ? "" : `<span class="nm" ${LA()}>${esc(pick(e.name))}${lang === "en" && e.name.hi ? `<small ${L2A()}>${esc(e.name.hi)}</small>` : ""}</span>`}
              ${has(e.place) && !hidden("eventPlace") ? `<span class="place" ${LA()}>${esc(pick(e.place))}</span>` : ""}
              ${has(e.address) && !has(e.place) ? `<span class="addr" ${LA()}>${esc(pick(e.address))}</span>` : ""}
              ${has(e.address) && has(e.place) && awayTown(e) ? `<span class="addr" ${LA()}>${esc(awayTown(e))}</span>` : ""}
              ${townLine(e) ? `<span class="addr" ${LA()}>${esc(townLine(e))}</span>` : ""}
              <button class="textbtn" type="button" data-cal="${i}" ${LA()}>${esc(u.addCal)}</button>
              ${mapOf(e) ? `<a class="textbtn" href="${esc(mapOf(e))}" target="_blank" rel="noopener" ${LA()}>${esc(u.directions)}</a>` : ""}
            </div>
          </article>`;
        }).join("")}
      </div>`, u.eventsLede || "");
  }

  function secCountdown() {
    return sec("countdown", t().countT, `
      <div class="count reveal" id="count" role="timer" aria-live="off"></div>
      <p class="count-to reveal" id="countTo" ${LA()}></p>`);
  }

  function secVenue() {
    const u = t();
    // Functions at venues of their own follow the main venue, each under its name. The main venue is
    // then named for the functions held there, so a guest can tell which place is which. Functions at
    // the same place share one entry, named for all of them: three at home had made "At our residence"
    // three times (Tanush, 4 November 2026). A place is its name less a leading "at" or "from", and its
    // address, or its map link when it has none (venuesAway in lib/wedding.ts matches).
    // One that repeats the venue's own address or map is at the venue (atMainVenue, 11 November 2026).
    const away = events().filter((e) => ownVenue(e) && !atMainVenue(e));
    const here = away.length ? andList(events().filter((e) => !away.includes(e)).map((e) => pick(e.name))) : "";
    const norm = (s) => String(s || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
    const placeOf = (e) => [norm(e.place?.en || e.place?.hi).replace(/^(at|from|in) /, ""), norm(e.address?.en || e.address?.hi) || mapOf(e) || ""].join("|");
    const places = [];
    for (const e of away) { const p = places.find((x) => x.key === placeOf(e)); if (p) p.evs.push(e); else places.push({ key: placeOf(e), evs: [e] }); }
    const main = has(data.venue.name) || has(data.venue.address);
    return sec("venue", u.venueT, `
      ${has(data.city) ? `<p class="city reveal" ${LA()}>${esc(pick(data.city))}</p>` : ""}
      ${here && main ? `<p class="caps venue-for reveal" ${LA()}>${esc(here)}</p>` : ""}
      ${has(data.venue.name) ? `<p class="venue-name reveal" ${LA()}>${esc(pick(data.venue.name))}</p>` : ""}
      ${has(data.venue.address) ? `<p class="venue-addr reveal" ${LA()}>${esc(pick(data.venue.address))}</p>` : ""}
      ${data.venue.photo ? `<img class="venue-art venue-photo reveal" src="${esc(media(data.venue.photo))}" alt="" loading="lazy" decoding="async" data-clarity-mask="true">`
        : art("venue") ? `<img class="venue-art reveal" src="${art("venue")}" alt="" loading="lazy" decoding="async">` : ""}
      ${data.venue.map ? `<div class="map reveal" id="mapBox"><button class="map-load" type="button" ${LA()}>${esc(u.showMap)}</button></div>
      <a class="btn" href="${esc(data.venue.map)}" target="_blank" rel="noopener" ${LA()}>${esc(u.maps)}</a>` : ""}
      ${places.map(({ evs: [e, ...more] }) => { const map = [e, ...more].map(mapOf).find(Boolean); return `<div class="venue-also reveal">
        <p class="caps venue-for" ${LA()}>${esc(andList([e, ...more].map((x) => pick(x.name))))}</p>
        ${has(e.place) ? `<p class="venue-name" ${LA()}>${esc(pick(e.place))}</p>` : ""}
        ${has(e.address) ? `<p class="venue-addr" ${LA()}>${esc(pick(e.address))}</p>` : ""}
        ${map ? `<a class="btn" href="${esc(map)}" target="_blank" rel="noopener" ${LA()}>${esc(u.maps)}</a>` : ""}
      </div>`; }).join("")}`);
  }

  function secTravel() {
    const u = t();
    return sec("travel", u.travelT, `
      ${has(data.travel) ? `<ul class="travel" ${LA()}>${data.travel.map((x) => `<li class="reveal">${esc(pick(x))}</li>`).join("")}</ul>` : ""}
      ${has(data.stay) ? `<h3 class="h3 reveal" ${LA()}>${esc(u.stayT)}</h3><ul class="travel" ${LA()}>${data.stay.map((s) => `<li class="reveal"><b>${esc(pick(s.name))}</b>${has(s.note) ? `<br>${esc(pick(s.note))}` : ""}</li>`).join("")}</ul>` : ""}`);
  }

  function secDress() {
    const u = t();
    // Their own picture in place of the design's, for one family (custom.dressArt, from our media route).
    const mine = typeof custom().dressArt === "string" && /^\/api\/wedding\/media\/[0-9a-f-]{36}$/.test(custom().dressArt) ? media(custom().dressArt) : "";
    return sec("dress", u.dressT, `
      ${mine ? `<img class="dress-art own reveal" src="${esc(mine)}" alt="" loading="lazy" decoding="async" data-clarity-mask="true">` : art("dress") ? `<img class="dress-art reveal" src="${art("dress")}" alt="" loading="lazy" decoding="async">` : ""}
      <div class="dress-list">
        ${hidden("dressRows") ? "" : events().filter((e) => has(e.dress) || has(e.palette)).map((e) => `<div class="dress reveal">
          <span class="nm" ${LA()}>${esc(pick(e.name))}${lang === "en" && e.name.hi ? `<small ${L2A()}>${esc(e.name.hi)}</small>` : ""}</span>
          ${has(e.palette) ? `<span class="dots" aria-hidden="true">${e.palette.map((c) => `<i style="background:${esc(c)}"></i>`).join("")}</span>` : "<span></span>"}
          ${has(e.dress) ? `<p ${LA()}>${esc(pick(e.dress))}</p>` : ""}
        </div>`).join("")}
      </div>`, u.dressLede);
  }

  // A family list without its blank lines. A box typed in and then cleared keeps one empty line, and
  // it drew the heading with no names under it, the children's line as "say: you must come to the
  // wedding!" (Kishor & Jyotsna, 2 November 2026).
  function famList(k) {
    return (data.family?.[k] || []).filter((x) => String(pick(x)).trim());
  }

  function secFamily() {
    const u = t();
    const group = (k, title) => (famList(k).length ? `<div class="fam reveal"><p class="caps" ${LA()}>${esc(title)}</p>${famList(k).map((x) => `<p class="fam-name${subHead(pick(x)) ? " fam-sub" : ""}" ${LA()}>${esc(nb(pick(x)))}</p>`).join("")}</div>` : "");
    const kids = famList("kids");
    return sec("family", u.familyT, `
      <div class="fam-tree">
        ${group("blessings", u.blessT)}
        ${group("darshanabhilashi", u.darshan)}
        ${group("swagatotsuk", u.swagat)}
        ${kids.length || own("kidsLine") ? `<div class="fam reveal kids"><p class="caps" ${LA()}>${esc(u.kids)}</p><p class="kids-line" ${LA()}>${esc(u.kidsLine(kids.map(pick).join(", ")))}</p></div>` : ""}
      </div>`);
  }

  // The couple's song as a now-playing card: the record's cover (or a photo of the two of them),
  // the song and the singer, and a play button that loads Spotify's or YouTube's own player.
  function secSong() {
    const u = t();
    const s = data.song;
    const from = /spotify\.com/.test(s.url) ? "Spotify" : /youtu/.test(s.url) ? "YouTube" : "";
    const cover = s.cover || (data.photos?.[0] && media(data.photos[0].src)) || "";
    const title = pick(s.title) || u.songT;
    return sec("song", u.songT, `
      <div class="song-card reveal" id="songBox">
        <div class="sc-cover" id="songCover"${s.cover ? "" : ` data-clarity-mask="true"`}>${cover ? `<img src="${esc(cover)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : `<span class="sc-disc" aria-hidden="true"></span>`}</div>
        <div class="sc-row">
          <div class="sc-meta"><p class="sc-title" ${LA()}>${esc(title)}</p>${s.artist ? `<p class="sc-artist">${esc(s.artist)}</p>` : ""}</div>
          <svg class="sc-heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.3 4.6 13a4.7 4.7 0 0 1 6.6-6.7l.8.8.8-.8a4.7 4.7 0 0 1 6.6 6.7Z" fill="currentColor"/></svg>
        </div>
        <div class="sc-player" id="songPlayer">
          <div class="sc-bar" aria-hidden="true"><i></i></div>
          <div class="sc-controls">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 6v12M18 6.5v11L9.5 12Z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
            <button class="sc-play" type="button" id="songLoad" aria-label="${esc(u.songPlay)}">${PLAY}</button>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 6v12M6 6.5v11l8.5-5.5Z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
          </div>
        </div>
      </div>
      ${from ? `<p class="sc-from reveal" ${LA()}>${esc(u.songFrom(from))}</p>` : ""}`);
  }

  function secVoice() {
    const u = t();
    return sec("voice", u.voiceT, `<div class="reveal"><audio controls preload="none" src="${esc(media(data.voice))}"></audio></div>`);
  }

  function secRsvp() {
    const u = t();
    const kept = savedReply();
    return sec("rsvp", u.rsvpT, `
      <form class="rsvp" id="rsvpForm" ${LA()} novalidate>
        <div class="rsvp-done" id="rsvpDone" aria-live="polite"></div>
        <label class="field-label" for="rsvpFamily">${esc(u.familyLabel)}</label>
        <input class="field" id="rsvpFamily" name="family" autocomplete="name" placeholder="${esc(u.familyPh)}" value="${esc(kept?.family || greetName("en"))}" aria-describedby="rsvpNeed">
        <p class="rsvp-need" id="rsvpNeed" hidden>${esc(u.needFamily)}</p>
        <div class="rows">
          ${events().map((e) => { const i = data.events.indexOf(e); return `<div class="row">
            <span class="row-name"><b ${LA()}>${esc(pick(e.name))}</b><span>${esc(fmt(e.start, { weekday: "short", day: "numeric", month: "short" }))}</span></span>
            <span class="stepper">
              <button class="step" type="button" data-step="-1" data-row="${i}" aria-label="${esc(u.fewer(pick(e.name)))}"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
              <output id="cnt${i}" aria-live="polite">${kept?.counts?.[e.id] ?? 1}</output>
              <button class="step" type="button" data-step="1" data-row="${i}" aria-label="${esc(u.more(pick(e.name)))}"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10h10M10 5v10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
            </span>
          </div>`; }).join("")}
        </div>
        <button class="btn" type="submit">${WA}<span>${esc(keeps ? u.send : u.waSend)}</span></button>
        <p class="rsvp-note" id="rsvpNote">${esc(keeps ? u.rsvpNote : u.waNote)}</p>
      </form>`, data.rsvpBy ? u.rsvpLede(fmt(data.rsvpBy, { day: "numeric", month: "long" })) : "");
  }

  function secContacts() {
    const u = t();
    // The number itself is the link, named for whom it calls ("Call Karan Sharma").
    const callTo = (c) => { const n = String(pick(c.name) || pick(c.role) || "").trim(); return n && u.callTo ? u.callTo(n) : `${u.call}: ${n || phoneText(c.phone)}`; };
    return sec("contacts", u.contactsT, `<ul class="contacts">${data.contacts.filter((c) => c.phone).map((c) => `<li class="reveal"><span><b ${LA()}>${esc(pick(c.name))}</b>${has(c.role) ? `<br><span class="soft" ${LA()}>${esc(pick(c.role))}</span>` : ""}</span><a class="textbtn tel" href="tel:${esc(c.phone.replace(/[^\d+]/g, ""))}" aria-label="${esc(callTo(c))}" ${LA()}>${esc(phoneText(c.phone))}</a></li>`).join("")}</ul>`);
  }

  // The UPI ID itself, which copies on a tap: guests pay from their own UPI app.
  function secShagun() {
    const u = t();
    return sec("shagun", u.shagunT, `<button class="upi-id reveal" type="button" id="upiCopy" data-upi="${esc(data.upi)}" aria-label="${esc(u.upiCopy)}">
      <span class="upi-k" ${LA()}>${esc(u.upiK)}</span><span class="upi-v">${esc(data.upi)}</span><span class="upi-hint" ${LA()}>${esc(u.upiTap)}</span></button>`, u.shagunLede);
  }

  function secThanks() {
    const u = t();
    return sec("thanks", u.thanksT, "", u.thanksLede);
  }

  // The couple's logo (drawn by the site in their names; data.logoSrc, and data.logoDark for dark grounds).
  function logoMark(cls) {
    if (!data.logoSrc) return "";
    const dark = theme.palette?.paper && luminance(theme.palette.paper) < 0.3;
    // The Story map comes whole (its ring of pictures), and so does a logo made for the couple or
    // their own upload, so each gets room to be read. The arch too, for its elephants or peacocks
    // either side (4 November 2026).
    const whole = ["storymap", "custom", "upload", "arch"].includes(data.logo?.family) ? " whole" : "";
    return `<img class="${cls}${whole}" src="${esc(dark && data.logoDark ? data.logoDark : data.logoSrc)}" alt="" decoding="async" onerror="this.remove()">`;
  }

  function renderPaper() {
    const u = t();
    const names = lang === "hi" ? two(esc(data.her.hi || data.her.en), esc(data.him.hi || data.him.en)).join(` <span class="so-amp">${esc(UI[TAG].amp)}</span> `) : two(esc(data.her.en), esc(data.him.en)).join(` <span class="so-amp">&amp;</span> `);
    // A layout's own sections go in after the section they name (or first, with after: null).
    const all = [...SECTIONS];
    for (const s of LAY?.sections?.(api()) || []) {
      const i = s.after ? all.findIndex((x) => x.id === s.after) : -1;
      all.splice(i + 1, 0, s);
    }
    // An invite's own order (data.order), set for a couple who asks: the sections it names take the
    // places those sections had, in its order, and the rest stay put (Surabhi and Smarth wanted their
    // story and song together near the end, 4 November 2026). video-sections.ts pageOrder does the same.
    if (Array.isArray(data.order) && data.order.length) {
      const sorted = all.filter((s) => data.order.includes(s.id)).sort((a, b) => data.order.indexOf(a.id) - data.order.indexOf(b.id));
      let k = 0;
      all.forEach((s, i) => { if (data.order.includes(s.id)) all[i] = sorted[k++]; });
    }
    const due = all.filter((s) => { try { return s.when(); } catch { return false; } });
    // A site preview that shows only the first screen (?top, the home page's designs) draws just the
    // first two sections, so the photos and paintings further down aren't fetched for it.
    const shown = params.has("top") ? due.slice(0, 2) : due;
    $("#paper").innerHTML = shown.map((s) => s.html()).join("") + `
      <footer class="signoff">
        ${divider() ? `<div class="sec-orn">${divider()}</div>` : ""}
        ${has(data.signoff) ? `<p class="so-text" ${LA()}>${String(pick(data.signoff)).split("\n").map((l) => l.trim()).filter(Boolean).map((l) => `<span>${esc(nb(l))}</span>`).join("")}</p>` : ""}
        ${logoMark("so-logo")}
        <p class="so-names" ${LA()}>${names}</p>
        <div class="made" style="display:inline-flex;align-items:center;gap:6px;margin-top:30px;font-size:14px;color:var(--ink-soft);"><span ${LA()}>${lang === "hi" ? "ಆಹ್ವಾನ ಪತ್ರಿಕೆ ರಚನೆ:" : "Invite Created by"}</span> <strong style="color:var(--ink);letter-spacing:0.04em;">Nikita & Amit</strong></div>
      </footer>`;
    document.documentElement.style.setProperty("--arch", `url("${archMask()}")`);
    drawArch();
    fitWords();
    document.fonts?.ready.then(fitWords);
    // A face asked for after the page first drew (Yatra One on Coming Soon and Agla Station) isn't in
    // fonts.ready: fit again whenever one arrives, or a full name ran past the arch (11 November 2026).
    if (!fitWords.watching && document.fonts?.addEventListener) {
      fitWords.watching = true;
      document.fonts.addEventListener("loadingdone", () => fitWords());
    }
    // And whenever the invitation's width changes, as when a layout shows it after the fonts have
    // loaded (a name fitted while hidden had no room to measure and ran past the arch).
    if (window.ResizeObserver) {
      fitWords.ro?.disconnect();
      const seen = new WeakMap();
      fitWords.ro = new ResizeObserver((list) => {
        if (list.some((e) => seen.get(e.target) !== Math.round(e.contentRect.width) && seen.set(e.target, Math.round(e.contentRect.width)))) fitWords();
      });
      $$(".inv, footer").forEach((n) => fitWords.ro.observe(n));
    }
    $$(".foil").forEach(foil);
    $$("[data-cal]").forEach((b) => b.addEventListener("click", () => downloadIcs(data.events[+b.dataset.cal])));
    $$(".step").forEach((b) => b.addEventListener("click", () => {
      const o = $(`#cnt${b.dataset.row}`);
      o.value = o.textContent = String(Math.max(0, Math.min(30, (+o.textContent || 0) + +b.dataset.step)));
    }));
    $("#rsvpForm")?.addEventListener("submit", sendRsvp);
    // A family who has replied from this phone sees their reply, and can change it.
    const kept = $("#rsvpForm") && savedReply();
    if (kept) showDone(kept);
    const rows = $("#rsvpForm .rows");
    if (rows) new IntersectionObserver(([e]) => $("#controls").classList.toggle("away", e.isIntersecting), { rootMargin: "0px 0px -90px 0px" }).observe(rows);
    $(".map-load")?.addEventListener("click", loadMap);
    $("#songLoad")?.addEventListener("click", loadSong);
    $("#upiCopy")?.addEventListener("click", (ev) => copyUpi(ev.currentTarget, t()));
    LAY?.decorate?.($("#paper"), api());
    watchReveals();
    if ($("#count")) startCount();
  }

  // A long name in a script face is one word that can't wrap (Venkatalakshmi, Siddharthvardhan):
  // shrink it until it fits its line instead of letting it push the page sideways. The signoff's
  // names wrap between words, so only a single word longer than the line shrinks there.
  function fitWords() {
    for (const el of $$(".inv .name, .so-names")) {
      el.style.fontSize = "";
      el.style.whiteSpace = "";
      el.classList.remove("wrap");
      const room = el.parentElement.clientWidth;
      if (!room) continue;
      const size = parseFloat(getComputedStyle(el).fontSize);
      // Telugu, Tamil and Gujarati run wide: a full name with its चि.-like prefix shrank to 19px of
      // foil, too faint to read (13 November 2026). They stop at 24px and take two lines instead.
      // A full name of several words on the formal invitation shrinks a little at most, then takes two
      // lines at its full size, so the couple's names stay the largest words there and match each
      // other: "Dr. Nayanaa Varsaale" had shrunk to 42px beside her parents' capitals and Pratikraj's
      // 58px (18 November 2026).
      const wide = /^(te|ta|gu)$/.test(el.lang);
      const words = !wide && el.matches(".inv .name") && /\S\s+\S/.test(el.textContent.trim());
      const floor = wide ? 24 : words ? size * 0.86 : 0;
      for (let i = 0; i < 4 && el.scrollWidth > room + 1; i++) {
        el.style.fontSize = `${Math.max(size * 0.45, floor, (parseFloat(el.style.fontSize) || size) * (room / el.scrollWidth) * 0.98)}px`;
      }
      // A full name too long for one line even at the smallest size goes onto two, at its spaces,
      // rather than past the edge of the page.
      if (el.scrollWidth > room + 1) {
        if (words) el.style.fontSize = "";
        el.style.whiteSpace = "normal";
        el.classList.add("wrap");
        for (let i = 0; i < 4 && words && el.scrollWidth > room + 1; i++) {
          el.style.fontSize = `${Math.max(size * 0.45, (parseFloat(el.style.fontSize) || size) * (room / el.scrollWidth) * 0.98)}px`;
        }
        // Two lines at most: a name of three or four words comes down until it takes two
        // ("Venkatalakshmi Subramaniam Iyer").
        const lines = () => { const cs = getComputedStyle(el), fs = parseFloat(cs.fontSize); return Math.round((el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) / (parseFloat(cs.lineHeight) || fs * 1.02)); };
        for (let i = 0; i < 8 && words && lines() > 2; i++) {
          el.style.fontSize = `${Math.max(size * 0.5, (parseFloat(el.style.fontSize) || size) * 0.93)}px`;
        }
      }
      el.classList.toggle("wrap", el.style.whiteSpace === "normal");
    }
    // The two names in one size, as a printed card sets them: the larger comes down to the smaller.
    for (const inv of $$(".inv")) {
      const names = [...inv.querySelectorAll(".name")];
      if (names.length < 2) continue;
      const sizes = names.map((n) => parseFloat(getComputedStyle(n).fontSize));
      const least = Math.min(...sizes);
      names.forEach((n, i) => { if (sizes[i] > least * 1.03) n.style.fontSize = `${least}px`; });
    }
  }

  // The map is Google's and the song player is YouTube's or Spotify's: both load only on a tap.
  function loadMap() {
    let q = `${data.venue.name?.en || ""}, ${data.city?.en || ""}`;
    try { q = new URL(data.venue.map).searchParams.get("query") || q; } catch {}
    $("#mapBox").classList.add("loaded");
    $("#mapBox").innerHTML = `<iframe title="${esc(t().mapTitle(pick(data.venue.name)))}" src="https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=14&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
  }
  function loadSong() {
    const url = data.song.url;
    let src = null;
    const yt = url.match(/(?:youtu\.be\/|v=|shorts\/)([\w-]{11})/);
    const sp = url.match(/open\.spotify\.com\/(track|album|playlist)\/(\w+)/);
    const startMatch = url.match(/[?&](?:t|start)=(\d+)/);
    const startParam = startMatch ? `&start=${startMatch[1]}` : "";
    if (yt) src = `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1${startParam}`;
    else if (sp) src = `https://open.spotify.com/embed/${sp[1]}/${sp[2]}?theme=0`;
    if (!src) return window.open(url, "_blank", "noopener");
    const a = $("#music");
    if (!a.paused) { fade(a, 0, 400); setSound(false); }
    // Spotify's compact player takes the place of the controls; a video takes the cover's.
    const frame = `<iframe class="song-frame${sp ? " spotify" : ""}" src="${src}" allow="autoplay; encrypted-media; clipboard-write" allowfullscreen title="${esc(t().songT)}"></iframe>`;
    if (sp) $("#songPlayer").innerHTML = frame;
    else { $("#songCover").classList.add("video"); $("#songCover").innerHTML = frame; $("#songPlayer").remove(); }
  }

  // ───────── Arches ─────────
  function archPoints(w, h, inset, top, lobes) {
    const half = (s) => {
      const x0 = inset, y0 = h, x3 = w / 2, y3 = top;
      const p = [[x0, y0], [x0, y0 - (h - top) * 0.72], [x3 - (w / 2 - inset) * 0.22, top + (h - top) * 0.4], [x3, y3]];
      const at = (u) => { const v = 1 - u; return [0, 1].map((k) => v * v * v * p[0][k] + 3 * v * v * u * p[1][k] + 3 * v * u * u * p[2][k] + u * u * u * p[3][k]); };
      const fine = Array.from({ length: 200 }, (_, i) => at(i / 199));
      const len = [0];
      for (let i = 1; i < fine.length; i++) len.push(len[i - 1] + Math.hypot(fine[i][0] - fine[i - 1][0], fine[i][1] - fine[i - 1][1]));
      const total = len[len.length - 1];
      return Array.from({ length: lobes + 1 }, (_, j) => fine[len.findIndex((l) => l >= (total * j) / lobes)] || fine[fine.length - 1]).map(([x, y]) => [s ? w - x : x, y]);
    };
    return [half(false), half(true).reverse()];
  }
  function archD(w, h, inset, top, lobes, close) {
    const [left, right] = archPoints(w, h, inset, top, lobes);
    const pts = [...left, ...right.slice(1)];
    let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
    for (let i = 1; i < pts.length; i++) {
      const c = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      d += `A${(c * 0.85).toFixed(2)} ${(c * 0.85).toFixed(2)} 0 0 1 ${pts[i][0].toFixed(2)} ${pts[i][1].toFixed(2)}`;
    }
    return d + (close || "");
  }
  // A plain pointed arch in fine gold lines, two arcs meeting under a small star: the "modern" arch a
  // family asked for in place of the cusped one (custom.arch, Aimen, 11 November 2026). Each arc's
  // centre sits on the springing line, so the sides rise straight out of the pillars.
  function pointedD(w, h, inset, top) {
    const s = w / 2 - inset, H = h - top, e = (H * H - s * s) / (2 * s), r = s + e;
    const f = (n) => n.toFixed(2);
    return `M${f(inset)} ${f(h)}A${f(r)} ${f(r)} 0 0 1 ${f(w / 2)} ${f(top)}A${f(r)} ${f(r)} 0 0 1 ${f(w - inset)} ${f(h)}`;
  }
  function drawArch() {
    const card = $("#archCard"), svg = $("#archTop");
    if (!card || !svg) return;
    if (custom().arch === "modern") {
      const w = card.clientWidth, c = w / 2, h = Math.round(16 + 1.3 * (c - 6)), y = 6;
      card.classList.add("modern");
      card.style.setProperty("--archH", `${h}px`);
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.setAttribute("width", w);
      svg.setAttribute("height", h);
      const star = (cx, cy, r, k = 0.16) => `M${cx} ${cy - r}C${cx + r * k} ${cy - r * k} ${cx + r * k} ${cy - r * k} ${cx + r} ${cy}C${cx + r * k} ${cy + r * k} ${cx + r * k} ${cy + r * k} ${cx} ${cy + r}C${cx - r * k} ${cy + r * k} ${cx - r * k} ${cy + r * k} ${cx - r} ${cy}C${cx - r * k} ${cy - r * k} ${cx - r * k} ${cy - r * k} ${cx} ${cy - r}Z`;
      svg.innerHTML = `
        <path class="arch-line" d="${pointedD(w, h, 6, 16)}"/>
        <path class="arch-gold" d="${pointedD(w, h, 13, 27)}"/>
        <path class="arch-star" d="${star(c, y, 6)}"/>`;
      return;
    }
    const w = card.clientWidth, h = Math.round(w * 0.88), c = w / 2;
    card.style.setProperty("--archH", `${h}px`);
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);
    svg.innerHTML = `
      <path class="arch-line" d="${archD(w, h, 6, 18, 8)}"/>
      <path class="arch-gold" d="${archD(w, h, 13.5, 30, 8)}"/>
      <path class="arch-bud" d="M${c} 1c3.4 4.2 4 8 0 12.5-4-4.5-3.4-8.3 0-12.5Z"/>`;
  }
  function archMask() {
    const d = archD(100, 62, 0, 0, 4, "L100 140L0 140Z");
    return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140" preserveAspectRatio="none"><path d="${d}"/></svg>`)}`;
  }

  // ───────── Gold foil to scratch ─────────
  function foil(btn) {
    const i = +btn.dataset.i;
    if (revealed.has(i)) return;
    const cvs = $("canvas", btn), ctx = cvs.getContext("2d", { willReadFrequently: true });
    const dpr = Math.min(2, devicePixelRatio || 1);
    let w = 0, h = 0;
    const gold = getComputedStyle(document.documentElement).getPropertyValue("--gold").trim() || "#b08d4c";
    const paint = () => {
      w = btn.clientWidth; h = btn.clientHeight;
      if (!w) return;
      cvs.width = Math.round(w * dpr); cvs.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      const g = ctx.createLinearGradient(0, 0, w, h);
      [[shade(gold, -0.35), 0], [shade(gold, 0.15), 0.22], [shade(gold, 0.55), 0.4], [shade(gold, -0.05), 0.58], [shade(gold, 0.4), 0.78], [shade(gold, -0.3), 1]].forEach(([c, o]) => g.addColorStop(o, c));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 2) { ctx.fillStyle = `rgba(255,248,225,${0.03 + Math.random() * 0.05})`; ctx.fillRect(0, y, w, 1); }
      for (let k = 0; k < (w * h) / 9; k++) { const a = Math.random(); ctx.fillStyle = a > 0.5 ? `rgba(255,250,230,${a * 0.5})` : `rgba(80,55,20,${a * 0.25})`; ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1); }
      ctx.strokeStyle = "rgba(255,246,215,.6)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(5.5, 5.5, w - 11, h - 11, 8); ctx.stroke();
      ctx.fillStyle = "rgba(255,248,226,.75)"; ctx.font = `${Math.round(Math.min(w, h * 1.2) * 0.2)}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("✦", w / 2, h / 2);
    };
    paint();
    new ResizeObserver(() => !revealed.has(i) && btn.clientWidth !== w && paint()).observe(btn);
    let down = false, last = null, moves = 0;
    const pt = (e) => { const r = cvs.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const scratch = (a, b) => { ctx.globalCompositeOperation = "destination-out"; ctx.lineCap = ctx.lineJoin = "round"; ctx.lineWidth = Math.max(22, w * 0.26); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x + 0.01, b.y); ctx.stroke(); };
    const cleared = () => { const px = ctx.getImageData(0, 0, cvs.width, cvs.height).data; let c = 0, n = 0; for (let k = 3; k < px.length; k += 4 * 23) { n++; if (px[k] < 40) c++; } return c / n; };
    const check = () => cleared() > 0.45 && done();
    btn.addEventListener("pointerdown", (e) => { if (revealed.has(i)) return; down = true; last = pt(e); try { btn.setPointerCapture(e.pointerId); } catch {} scratch(last, last); });
    btn.addEventListener("pointermove", (e) => { if (!down) return; const p = pt(e); scratch(last, p); last = p; if (++moves % 8 === 0) check(); });
    const up = () => { if (down) { down = false; check(); } };
    btn.addEventListener("pointerup", up);
    btn.addEventListener("pointercancel", up);
    btn.addEventListener("click", (e) => e.detail === 0 && done());
    function done() {
      if (revealed.has(i)) return;
      revealed.add(i);
      btn.classList.add("done");
      btn.setAttribute("aria-label", t().revealed(btn.dataset.unit, btn.dataset.v));
      // Each date's day, time and place open once its own foils are scratched.
      const g = btn.dataset.g;
      if ($$(`#date .foil[data-g="${g}"]`).every((b) => b.classList.contains("done"))) $(`#date .when-wrap[data-g="${g}"]`)?.classList.remove("hide");
    }
  }
  function shade(hex, k) {
    const n = parseInt(hex.replace("#", "").slice(0, 6), 16);
    const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k)));
    return `rgb(${c.join(",")})`;
  }

  // ───────── Countdown ─────────
  function startCount() {
    clearInterval(countTimer);
    const el = $("#count"), f = countTarget(), target = new Date(f.start);
    $("#countTo").textContent = t().countTo(pick(f.name), fmt(f.start, { weekday: "long", day: "numeric", month: "long" }));
    const tick = () => {
      const ms = target - Date.now();
      if (ms <= 0) { el.innerHTML = ""; return clearInterval(countTimer); }
      const v = [Math.floor(ms / 864e5), Math.floor((ms % 864e5) / 36e5), Math.floor((ms % 36e5) / 6e4), Math.floor((ms % 6e4) / 1e3)];
      el.innerHTML = v.map((n, k) => `${k ? `<span class="colon" aria-hidden="true">:</span>` : ""}<div class="u"><b>${k ? String(n).padStart(2, "0") : n}</b><span ${LA()}>${esc(t().units[k])}</span></div>`).join("");
    };
    tick();
    new IntersectionObserver(([e]) => { clearInterval(countTimer); if (e.isIntersecting) { tick(); countTimer = setInterval(tick, 1000); } }).observe(el);
  }

  function watchReveals() {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (!e.isIntersecting) return; e.target.classList.add("in"); io.unobserve(e.target); }), { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    $$(".reveal").forEach((el) => io.observe(el));
  }

  // ───────── RSVP and calendar ─────────
  // A family's reply (Gautam, 30 October 2026): they check it in a small dialog, then a live invite
  // with the RSVP manager (Royal, or bought with its template; the page sets SAATH.api only then)
  // keeps it with the couple (SAATH.api, /api/rsvp: their Replies tab counts it) and WhatsApp opens
  // with it written out, as before. The phone remembers the reply, so the family sees it when they
  // come back and can change it: sending again replaces it. Previews and the sample keep nothing.
  // Links go to api.whatsapp.com directly: the wa.me redirect turns emoji into "�".
  const keeps = Boolean(SAATH.api && SAATH.slug);
  const replyKey = `saath-rsvp:${SAATH.slug}:${SAATH.familyKey || familyParam.toLowerCase()}`;
  function savedReply() {
    if (!keeps) return null;
    try { const r = JSON.parse(localStorage.getItem(replyKey) || "null"); return r?.counts ? r : null; } catch { return null; }
  }
  const coupleName = () => (lang === "hi" ? two(data.her.hi || data.her.en, data.him.hi || data.him.en).join(` ${UI[TAG].pairJoin} `) : two(data.her.en, data.him.en).join(" & "));
  const replyList = (counts) => `<ul class="rc-list">${counts.map(([ev, n]) => `<li><span>${esc(pick(ev.name))}</span>${n > 0 ? `<b>${n}</b>` : `<b class="no">${esc(t().notComing)}</b>`}</li>`).join("")}</ul>`;

  function sendRsvp(e) {
    e.preventDefault();
    const input = $("#rsvpFamily");
    const fam = input.value.replace(/[|\n#]/g, " ").replace(/\s+/g, " ").trim().slice(0, 40);
    // A reply nobody can put a name to can't be counted: the name comes first.
    $("#rsvpNeed").hidden = Boolean(fam);
    if (!fam) {
      input.setAttribute("aria-invalid", "true");
      input.focus();
      return;
    }
    input.removeAttribute("aria-invalid");
    confirmRsvp(fam, events().map((ev) => [ev, +$(`#cnt${data.events.indexOf(ev)}`).textContent || 0]));
  }

  let dialog = null;
  function confirmRsvp(fam, counts) {
    const u = t();
    if (!dialog) {
      dialog = document.createElement("dialog");
      dialog.className = "rsvp-confirm";
      dialog.setAttribute("aria-labelledby", "rcTitle");
      // A tap outside the card closes it.
      dialog.addEventListener("click", (ev) => { if (ev.target === dialog) dialog.close(); });
      document.body.append(dialog);
    }
    tagEl(dialog);
    dialog.innerHTML = `<div class="rc-in">
      <p class="rc-title" id="rcTitle">${esc(u.confirmT)}</p>
      <p class="rc-from">${esc(u.confirmFrom(fam))}</p>
      ${replyList(counts)}
      <p class="rc-note">${esc(keeps ? u.confirmNote(coupleName()) : u.waConfirmNote(coupleName()))}</p>
      <div class="rc-actions">
        <button class="btn" type="button" id="rcSend">${WA}<span>${esc(keeps ? u.confirmSend : u.waConfirmSend)}</span></button>
        <button class="rc-back" type="button" id="rcBack">${esc(u.confirmBack)}</button>
      </div>
    </div>`;
    $("#rcBack", dialog).addEventListener("click", () => dialog.close());
    $("#rcSend", dialog).addEventListener("click", () => { dialog.close(); deliver(fam, counts); });
    dialog.showModal();
  }

  function deliver(fam, counts) {
    const u = t();
    const reply = { guest: savedReply()?.guest || newId(), family: fam, counts: Object.fromEntries(counts.map(([ev, n]) => [ev.id, n])), at: new Date().toISOString() };
    if (keeps) {
      const note = $("#rsvpNote");
      fetch(`${SAATH.api}/api/rsvp`, { method: "POST", keepalive: true, body: JSON.stringify({ slug: SAATH.slug, guest: reply.guest, family: fam, familyKey: SAATH.familyKey || undefined, counts: reply.counts, lang }) })
        .then((r) => {
          if (!r.ok) throw new Error(String(r.status));
          try { localStorage.setItem(replyKey, JSON.stringify(reply)); } catch {}
          showDone(reply);
        })
        .catch(() => { if (note) { note.textContent = u.saveFailed; note.classList.add("warn"); } });
    }
    // WhatsApp opens in the same tap, or the browser would block it.
    const lines = counts.map(([ev, n]) => `${pick(ev.name)}: ${n}`);
    const code = `#RSVP ${fam} | ${counts.map(([ev, n]) => `${ev.id} ${n}`).join(" | ")}`;
    const text = [u.waIntro(fam, coupleName()), ...lines, "", code].join("\n");
    const phone = (data.rsvpPhone || "").replace(/\D/g, "");
    window.open(`https://api.whatsapp.com/send?${phone ? `phone=${phone}&` : ""}text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }

  const newId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`);

  // The thank-you in the form's place, with the reply as it reached the couple.
  function showDone(reply) {
    const form = $("#rsvpForm");
    if (!form) return;
    const u = t();
    $("#rsvpDone").innerHTML = `<p class="rd-title">${esc(u.doneT)}</p>
      <p class="rd-line">${esc(u.doneLine(coupleName()))}</p>
      ${replyList(events().filter((ev) => ev.id in reply.counts).map((ev) => [ev, reply.counts[ev.id]]))}
      <button class="rd-change" type="button" id="rdChange">${esc(u.doneChange)}</button>`;
    form.classList.add("done");
    const note = $("#rsvpNote");
    note.textContent = u.rsvpNote;
    note.classList.remove("warn");
    $("#rdChange").addEventListener("click", () => {
      form.classList.remove("done");
      form.querySelector(".step")?.focus({ preventScroll: true });
    });
  }

  function downloadIcs(ev) {
    const stamp = (iso) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Saath Studio//Invite//EN", "BEGIN:VEVENT",
      `UID:${slug}-${ev.id}@saath.studio`, `DTSTAMP:${stamp(new Date().toISOString())}`,
      `DTSTART:${stamp(ev.start)}`, `DTEND:${stamp(ev.end || ev.start)}`,
      `SUMMARY:${two(data.her.en, data.him.en).join(" & ")}: ${ev.name.en}`,
      `LOCATION:${(ownVenue(ev) ? [ev.place?.en, ev.address?.en] : [ev.place?.en, data.venue?.name?.en, data.city?.en]).filter(Boolean).join(", ")}`,
      ev.dress?.en ? `DESCRIPTION:${ev.dress.en}` : null, "END:VEVENT", "END:VCALENDAR",
    ].filter(Boolean).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = `${slug}-${ev.id}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  /** Copies the UPI ID, and says so for a moment where the hint was. */
  function copyUpi(btn, u) {
    const hint = btn.querySelector(".upi-hint");
    const done = () => { hint.textContent = u.upiCopied; btn.classList.add("copied"); setTimeout(() => { hint.textContent = u.upiTap; btn.classList.remove("copied"); }, 1800); };
    (navigator.clipboard?.writeText(btn.dataset.upi) || Promise.reject()).then(done).catch(() => {
      // Older browsers: select the ID so a long press copies it.
      const r = document.createRange(); r.selectNodeContents(btn.querySelector(".upi-v"));
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    });
  }

  // ───────── Music ─────────
  // The opening's tap starts the music, so the music must already be here when it comes. With
  // preload="none" it was fetched only on the tap: a library track took about 0.4 s to sound, and the
  // couple's own song about 2 s, most of it the site's redirect to the stored file (Vanshika and
  // Saurabh, Kamal, 10 November 2026). Once the opening is drawn, the browser fetches the music while
  // the guest looks at it, on a guest's own link only: not in the site's frames and previews (the
  // builder reloads its preview on every edit, the grids show eight at once), and not when the phone
  // asks to save data or is on 2G, where it waits for the tap as before.
  function warmMusic() {
    const a = $("#music"), net = navigator.connection;
    if (data.music === "off" || !a.getAttribute("src") || window.top !== window) return;
    if (["quiet", "top", "video"].some((k) => params.has(k)) || net?.saveData || /2g/.test(net?.effectiveType || "")) return;
    Promise.resolve(renderGate.ctrl?.closed).catch(() => {}).then(() => { if (!opened) a.preload = "auto"; });
  }
  function startMusic() {
    if (data.music === "off") return;
    const a = $("#music");
    a.volume = 0;
    a.play().then(() => { setSound(true); fade(a, 0.7, 2400); }).catch(() => setSound(false));
  }
  function fade(a, to, ms) {
    const from = a.volume, t0 = performance.now();
    const step = (now) => { const k = Math.min(1, (now - t0) / ms); a.volume = Math.max(0, Math.min(1, from + (to - from) * k)); if (k < 1) requestAnimationFrame(step); else if (to === 0) a.pause(); };
    requestAnimationFrame(step);
  }
  function setSound(on) {
    const b = $("#soundBtn");
    b.setAttribute("aria-pressed", String(on));
    b.setAttribute("aria-label", on ? "Pause music" : "Play music");
  }
  function toggleSound() {
    const a = $("#music");
    if (a.paused) { a.play().then(() => fade(a, 0.7, 800)).catch(() => {}); setSound(true); }
    else { fade(a, 0, 500); setSound(false); }
  }
  document.addEventListener("visibilitychange", () => {
    const a = $("#music");
    if (document.hidden && !a.paused) { a.pause(); a.dataset.resume = "1"; }
    else if (!document.hidden && a.dataset.resume) { delete a.dataset.resume; a.play().catch(() => {}); }
  });

  function setLang(next) {
    lang = next;
    setTag();
    renderGate();
    renderHero();
    renderToday();
    const y = scrollY;
    renderPaper();
    $$(".reveal").forEach((el) => el.classList.add("in"));
    scrollTo(0, y);
  }

  boot().catch((err) => {
    console.error(err);
    document.body.classList.remove("sealed");
  });
})();
