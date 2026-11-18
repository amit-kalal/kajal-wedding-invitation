/**
 * ==============================================================================
 * ZERO-BACKEND WHATSAPP RSVP SYSTEM
 * ==============================================================================
 * Formats the guest's RSVP response and opens WhatsApp directly with a
 * pre-filled celebratory confirmation message.
 * ==============================================================================
 */

const WhatsAppRSVP = (function () {
  let attendanceStatus = 'Attending with Joy';
  let guestCount = 2;

  function init() {
    const attendanceOptions = document.querySelectorAll('.attendance-option');
    const btnDecrement = document.getElementById('btnGuestMinus');
    const btnIncrement = document.getElementById('btnGuestPlus');
    const guestCountDisplay = document.getElementById('guestCountDisplay');
    const form = document.getElementById('rsvpForm');

    // 1. Attendance Toggle
    attendanceOptions.forEach((opt) => {
      opt.addEventListener('click', () => {
        attendanceOptions.forEach((o) => o.classList.remove('active'));
        opt.classList.add('active');
        attendanceStatus = opt.getAttribute('data-status') || 'Attending';
      });
    });

    // 2. Stepper Buttons
    if (btnDecrement && btnIncrement && guestCountDisplay) {
      btnDecrement.addEventListener('click', () => {
        if (guestCount > 1) {
          guestCount--;
          guestCountDisplay.textContent = guestCount;
        }
      });

      btnIncrement.addEventListener('click', () => {
        if (guestCount < 12) {
          guestCount++;
          guestCountDisplay.textContent = guestCount;
        }
      });
    }

    // 3. Form Submit -> WhatsApp Deep Link
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        sendRSVP();
      });
    }
  }

  function sendRSVP() {
    const nameInput = document.getElementById('rsvpGuestName');
    const wishesInput = document.getElementById('rsvpWishes');
    const eventCheckboxes = document.querySelectorAll('.rsvp-event-checkbox:checked');

    const guestName = nameInput ? nameInput.value.trim() : '';
    if (!guestName) {
      alert('Please enter your name so the family knows who is sending this RSVP! 🙏');
      if (nameInput) nameInput.focus();
      return;
    }

    const wishes = wishesInput ? wishesInput.value.trim() : '';
    const selectedEvents = Array.from(eventCheckboxes).map((cb) => cb.value);

    // Format WhatsApp Message
    let message = `Namaste! 🙏\n`;
    message += `*RSVP: Wedding of Kajal & Anmol* ✨\n\n`;
    message += `👤 *Guest Name:* ${guestName}\n`;
    message += `💌 *Attendance:* ${attendanceStatus}\n`;

    if (attendanceStatus !== 'Cannot Attend') {
      message += `👥 *Total Guests:* ${guestCount}\n\n`;
      message += `🎊 *Events Attending:*\n`;
      if (selectedEvents.length > 0) {
        selectedEvents.forEach((ev) => {
          message += `   • ${ev}\n`;
        });
      } else {
        message += `   • All Auspicious Celebrations\n`;
      }
    }

    if (wishes) {
      message += `\n💬 *Warm Blessing/Message:* "${wishes}"\n`;
    }

    message += `\n#KajalWedsAnmol | 18 December 2026 | Alnavar`;

    // Retrieve recipient phone from config
    const rawPhone = WEDDING_CONFIG.whatsapp?.recipientPhone || '919876543210';
    const cleanPhone = rawPhone.replace(/\D/g, '');

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
  }

  return { init };
})();

window.addEventListener('DOMContentLoaded', WhatsAppRSVP.init);
