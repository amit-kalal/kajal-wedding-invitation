/**
 * ==============================================================================
 * CINEMATIC VIDEO DOOR OPENING & ROYAL AUDIO SYSTEM
 * (Direct implementation of Saath Studio's 60fps Film Engine)
 * ==============================================================================
 */

const HaveliExperience = (function () {
  let isGateOpen = false;
  let isAudioPlaying = false;
  let audioElement = null;
  let synthAudioCtx = null;
  let synthInterval = null;

  // Audio Volume Ramp (0% to 70% over 2.4 seconds)
  function fadeAudio(audio, targetVolume, durationMs) {
    if (!audio) return;
    try {
      audio.volume = 0;
      const start = performance.now();
      function step(now) {
        const elapsed = now - start;
        const progress = Math.min(Math.max(elapsed / durationMs, 0), 1);
        const safeVolume = Math.max(0, Math.min(1, progress * targetVolume));
        audio.volume = safeVolume;
        if (progress < 1 && !audio.paused) {
          requestAnimationFrame(step);
        }
      }
      requestAnimationFrame(step);
    } catch (e) {
      console.warn('Audio fade volume error handled:', e);
    }
  }

  // Web Audio Synthetic Royal Shehnai & Tanpura Drone (Fallback if no MP3)
  function startSyntheticRoyalMusic() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      synthAudioCtx = new AudioContext();

      const masterGain = synthAudioCtx.createGain();
      masterGain.gain.setValueAtTime(0.08, synthAudioCtx.currentTime);
      masterGain.connect(synthAudioCtx.destination);

      const frequencies = [130.81, 196.00, 261.63, 392.00];
      frequencies.forEach((freq, idx) => {
        const osc = synthAudioCtx.createOscillator();
        const oscGain = synthAudioCtx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq + (Math.random() * 0.4 - 0.2), synthAudioCtx.currentTime);
        oscGain.gain.setValueAtTime(0.05, synthAudioCtx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
      });

      synthInterval = setInterval(() => {
        if (!isAudioPlaying || !synthAudioCtx) return;
        const chimeFreqs = [523.25, 587.33, 659.25, 783.99];
        const note = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];
        const chime = synthAudioCtx.createOscillator();
        const chimeGain = synthAudioCtx.createGain();
        chime.type = 'sine';
        chime.frequency.setValueAtTime(note, synthAudioCtx.currentTime);
        chimeGain.gain.setValueAtTime(0.04, synthAudioCtx.currentTime);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, synthAudioCtx.currentTime + 3.0);
        chime.connect(chimeGain);
        chimeGain.connect(masterGain);
        chime.start();
        chime.stop(synthAudioCtx.currentTime + 3.1);
      }, 3500);

    } catch (e) {
      console.log('Synthetic audio note:', e);
    }
  }

  function stopSyntheticRoyalMusic() {
    if (synthInterval) clearInterval(synthInterval);
    if (synthAudioCtx) {
      synthAudioCtx.close().catch(() => {});
      synthAudioCtx = null;
    }
  }

  function initAudio() {
    audioElement = document.getElementById('music');
    if (audioElement) {
      audioElement.loop = true;
      if (!audioElement.src) {
        audioElement.src = 'assets/audio/shehnai-theme.mp3';
      }
      audioElement.load();
      audioElement.addEventListener('error', () => {
        console.info('Custom MP3 not yet provided, switching to ambient Indian melody.');
        if (isAudioPlaying && WEDDING_CONFIG.audio?.useSyntheticFallback) {
          startSyntheticRoyalMusic();
        }
      });
    }
  }

  function playMusic() {
    isAudioPlaying = true;
    const controller = document.getElementById('audioController');
    if (controller) controller.classList.add('playing');

    if (audioElement) {
      if (!audioElement.src) {
        audioElement.src = 'assets/audio/shehnai-theme.mp3';
      }
      fadeAudio(audioElement, 0.7, 2400);
      audioElement.play().catch((err) => {
        console.info('Audio autoplay prevented or waiting for interaction:', err);
        if (WEDDING_CONFIG.audio?.useSyntheticFallback) {
          startSyntheticRoyalMusic();
        }
      });
    } else if (WEDDING_CONFIG.audio?.useSyntheticFallback) {
      startSyntheticRoyalMusic();
    }
  }

  function pauseMusic() {
    isAudioPlaying = false;
    const controller = document.getElementById('audioController');
    if (controller) controller.classList.remove('playing');

    if (audioElement) {
      audioElement.pause();
    }
    stopSyntheticRoyalMusic();
  }

  function toggleMusic() {
    if (isAudioPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  }

  // --- Saath Studio Film Opening Sequence ---
  async function triggerOpening() {
    if (isGateOpen) return;
    isGateOpen = true;

    const gate = document.getElementById('gate');
    const video = document.getElementById('opVideo');
    const still = document.getElementById('opStill');
    const end = document.getElementById('opEnd');
    const paper = document.getElementById('invitationPaper');

    // 1. Immediately start audio
    playMusic();

    if (gate) gate.classList.add('opening');

    let videoPlayedSuccessfully = false;

    if (video) {
      try {
        video.currentTime = 0.3;
        video.playbackRate = 1.25;

        // Play video
        const playPromise = video.play();
        const timeoutPromise = new Promise(r => setTimeout(() => r(false), 2000));

        const didPlay = await Promise.race([
          playPromise.then(() => true).catch(() => false),
          timeoutPromise
        ]);

        if (didPlay) {
          videoPlayedSuccessfully = true;

          // Hide top still 120ms after playback starts (eliminates black flash)
          setTimeout(() => {
            if (still) still.classList.add('gone');
          }, 120);

          // Wait until doors finish opening (at 3.6s video timestamp)
          await new Promise((done) => {
            let finished = false;
            const complete = () => {
              if (finished) return;
              finished = true;
              video.pause();
              if (end) end.classList.add('on');
              done();
            };

            const checkTime = () => {
              if (finished) return;
              if (video.currentTime >= 3.6 || video.ended) {
                complete();
              } else {
                requestAnimationFrame(checkTime);
              }
            };
            requestAnimationFrame(checkTime);
            video.addEventListener('ended', complete, { once: true });
            setTimeout(complete, 3800);
          });

          // Hold 300ms on final opened frame
          await new Promise(r => setTimeout(r, 300));
        }
      } catch (err) {
        console.log('Video note:', err);
      }
    }

    // Fallback if video is not supported or failed
    if (!videoPlayedSuccessfully) {
      if (end) end.classList.add('on');
      if (still) still.classList.add('gone');
      await new Promise(r => setTimeout(r, 1200));
    }

    // Reveal the invitation paper underneath
    if (paper) {
      paper.classList.add('revealed');
      window.dispatchEvent(new CustomEvent('doorsOpened'));
    }

    // Fade out gate overlay smoothly over 600ms (Exact Saath Studio handover)
    if (gate) {
      gate.style.transition = 'opacity 600ms cubic-bezier(0.25, 1, 0.5, 1)';
      gate.style.opacity = '0';
      setTimeout(() => {
        gate.style.display = 'none';
      }, 650);
    }
  }

  function bindEvents() {
    const btnOpen = document.getElementById('btnOpenGate');
    const gate = document.getElementById('gate');
    const stage = document.getElementById('stage');
    const opFrame = document.getElementById('opFrame');
    const audioController = document.getElementById('audioController');

    const trigger = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      triggerOpening();
    };

    if (btnOpen) {
      btnOpen.addEventListener('click', trigger);
      btnOpen.addEventListener('touchend', trigger);
    }

    if (opFrame) {
      opFrame.addEventListener('click', trigger);
    }

    if (stage) {
      stage.addEventListener('click', trigger);
    }

    if (gate) {
      gate.addEventListener('click', trigger);
    }

    if (audioController) {
      audioController.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMusic();
      });
    }

    // Pause music if user leaves tab, resume when returning
    document.addEventListener('visibilitychange', () => {
      if (audioElement) {
        if (document.hidden && !audioElement.paused) {
          audioElement.pause();
          audioElement.dataset.resume = "1";
        } else if (!document.hidden && audioElement.dataset.resume) {
          delete audioElement.dataset.resume;
          audioElement.play().catch(() => {});
        }
      }
    });
  }

  function init() {
    initAudio();
    bindEvents();
  }

  return { init, triggerOpening, toggleMusic };
})();

window.addEventListener('DOMContentLoaded', HaveliExperience.init);
