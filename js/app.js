/**
 * ==============================================================================
 * MASTER APP COORDINATOR
 * ==============================================================================
 * Injects wedding details from config.js, runs the live countdown timer,
 * and handles calendar event links.
 * ==============================================================================
 */

const WeddingApp = (function () {
  function initDynamicContent() {
    if (typeof WEDDING_CONFIG === 'undefined') return;

    // 1. Couple Names & Crest
    const bride = WEDDING_CONFIG.couple?.bride || 'Kajal';
    const groom = WEDDING_CONFIG.couple?.groom || 'Anmol';
    const hashtag = WEDDING_CONFIG.couple?.hashtag || '#KajalWedsAnmol';

    document.querySelectorAll('.val-bride').forEach(el => el.textContent = bride);
    document.querySelectorAll('.val-groom').forEach(el => el.textContent = groom);
    document.querySelectorAll('.val-hashtag').forEach(el => el.textContent = hashtag);

    // 2. Parents Details
    const brideParents = WEDDING_CONFIG.family?.brideSide;
    const groomParents = WEDDING_CONFIG.family?.groomSide;

    if (brideParents) {
      const elMother = document.getElementById('valBrideMother');
      const elFather = document.getElementById('valBrideFather');
      if (elMother) elMother.textContent = brideParents.mother;
      if (elFather) elFather.textContent = brideParents.father;
    }

    if (groomParents) {
      const elMother = document.getElementById('valGroomMother');
      const elFather = document.getElementById('valGroomFather');
      if (elMother) elMother.textContent = groomParents.mother;
      if (elFather) elFather.textContent = groomParents.father;
    }

    // 3. Venue & Maps
    const venue = WEDDING_CONFIG.venue;
    if (venue) {
      document.querySelectorAll('.val-venue-name').forEach(el => el.textContent = venue.name);
      document.querySelectorAll('.val-venue-city').forEach(el => el.textContent = venue.city);
      document.querySelectorAll('.val-venue-address').forEach(el => el.textContent = venue.fullAddress);
      
      const btnMaps = document.getElementById('btnOpenMaps');
      if (btnMaps && venue.googleMapsUrl) {
        btnMaps.href = venue.googleMapsUrl;
      }
    }

    // 4. Populate Events Timeline
    renderEvents();
  }

  function renderEvents() {
    const eventsList = WEDDING_CONFIG.events || [];
    const container = document.getElementById('itineraryCardsContainer');
    if (!container) return;

    container.innerHTML = '';

    eventsList.forEach(event => {
      const card = document.createElement('article');
      card.className = 'event-card';

      // Google Calendar Link generator
      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title + ' - Kajal & Anmol Wedding')}&dates=${event.calendarStartDate}/${event.calendarEndDate}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.venue)}`;

      card.innerHTML = `
        <div class="event-card-header">
          <h3 class="event-card-title">${event.title}</h3>
          <span class="event-card-hindi">${event.hindiTitle}</span>
        </div>
        <div class="event-detail-row">
          <span class="event-detail-icon">📅</span>
          <span><strong>${event.date}</strong></span>
        </div>
        <div class="event-detail-row">
          <span class="event-detail-icon">⏰</span>
          <span>${event.time}</span>
        </div>
        <div class="event-detail-row">
          <span class="event-detail-icon">📍</span>
          <span>${event.venue}</span>
        </div>
        <p class="event-description">"${event.description}"</p>
        <div>
          <span class="event-dress-code">👗 Dress Code: ${event.dressCode}</span>
        </div>
        <a href="${gcalUrl}" target="_blank" rel="noopener noreferrer" class="btn-add-calendar">
          <span>🗓️ Add to Google Calendar</span>
        </a>
      `;

      container.appendChild(card);
    });
  }

  // --- Live Countdown Timer to 18 December 2026 ---
  function startCountdown() {
    const elDays = document.getElementById('countDays');
    const elHours = document.getElementById('countHours');
    const elMins = document.getElementById('countMins');
    const elSecs = document.getElementById('countSecs');

    if (!elDays || !elHours || !elMins || !elSecs) return;

    // Target: 18 Dec 2026, 10:30 AM IST (UTC+5:30)
    const targetDate = new Date('2026-12-18T10:30:00+05:30').getTime();

    function updateTimer() {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        elDays.textContent = "00";
        elHours.textContent = "00";
        elMins.textContent = "00";
        elSecs.textContent = "00";
        const label = document.getElementById('countdownLabel');
        if (label) label.textContent = "The Sacred Celebrations Have Begun! ✨";
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      elDays.textContent = String(days).padStart(2, '0');
      elHours.textContent = String(hours).padStart(2, '0');
      elMins.textContent = String(minutes).padStart(2, '0');
      elSecs.textContent = String(seconds).padStart(2, '0');
    }

    updateTimer();
    setInterval(updateTimer, 1000);
  }

  function init() {
    initDynamicContent();
    startCountdown();
  }

  return { init };
})();

window.addEventListener('DOMContentLoaded', WeddingApp.init);
