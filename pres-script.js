(() => {
  const slides = document.querySelectorAll('.slide');
  const total = slides.length;
  let current = 0;
  let isAnimating = false;

  // Init counter and progress
  document.getElementById('totalSlides').textContent = total;
  buildThumbNav();
  updateUI();

  // Build thumbnail dots
  function buildThumbNav() {
    const nav = document.getElementById('thumbNav');
    slides.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'thumb-dot' + (i === 0 ? ' active' : '');
      dot.title = `Slide ${i + 1}`;
      dot.textContent = i + 1;
      dot.addEventListener('click', () => goTo(i));
      nav.appendChild(dot);
    });
  }

  // Go to a specific slide
  function goTo(next) {
    if (isAnimating || next === current || next < 0 || next >= total) return;
    isAnimating = true;

    const prev = current;
    const direction = next > prev ? 1 : -1;

    // Reset revealed items when leaves a slide
    slides[prev].querySelectorAll('.reveal-item').forEach(el => el.classList.remove('disclosed'));

    // Remove active from prev, add exit
    slides[prev].classList.remove('active');
    slides[prev].classList.add(direction > 0 ? 'exit-left' : 'exit-right');

    // Set next slide coming from the right or left
    slides[next].style.transform = `translateX(${direction * 80}px)`;
    slides[next].style.opacity = '0';
    slides[next].offsetHeight; // force reflow
    slides[next].style.transform = '';
    slides[next].style.opacity = '';
    slides[next].classList.add('active');
    document.dispatchEvent(new CustomEvent('slideChanged', { detail: { slideId: slides[next].id } }));

    // If going backwards, disclose all items in the target slide
    if (direction < 0) {
      slides[next].querySelectorAll('.reveal-item').forEach(el => el.classList.add('disclosed'));
    } else {
      slides[next].querySelectorAll('.reveal-item').forEach(el => el.classList.remove('disclosed'));
    }

    current = next;
    updateUI();

    setTimeout(() => {
      slides[prev].classList.remove('exit-left', 'exit-right');
      isAnimating = false;
    }, 750);
  }

  // Exposed function for buttons
  window.changeSlide = (dir) => {
    if (isAnimating) return;
    const activeSlide = slides[current];
    if (dir > 0) {
      const nextItem = activeSlide.querySelector('.reveal-item:not(.disclosed)');
      if (nextItem) {
        nextItem.classList.add('disclosed');
        return;
      }
    } else if (dir < 0) {
      const items = activeSlide.querySelectorAll('.reveal-item.disclosed');
      if (items.length > 0) {
        items[items.length - 1].classList.remove('disclosed');
        return;
      }
    }
    goTo(current + dir);
  };

  window.goHome = () => goTo(0);

  window.toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
          });
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    } catch (e) {
      console.log("Fullscreen API error:", e);
    }
  };

  function updateUI() {
    document.getElementById('currentSlide').textContent = current + 1;

    // Progress bar
    const pct = ((current) / (total - 1)) * 100;
    document.getElementById('progressFill').style.width = pct + '%';

    // Buttons
    document.getElementById('prevBtn').disabled = current === 0;
    document.getElementById('nextBtn').disabled = current === total - 1;

    // Thumb dots
    document.querySelectorAll('.thumb-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
      e.preventDefault();
      goTo(current + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      goTo(current - 1);
    } else if (e.key === 'Home') {
      goTo(0);
    } else if (e.key === 'End') {
      goTo(total - 1);
    }
  });

  // Touch/swipe support
  let touchStartX = 0;
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
  }, { passive: true });

  // Mouse wheel navigation (debounced)
  let wheelTimeout;
  document.addEventListener('wheel', (e) => {
    e.preventDefault();
    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(() => {
      goTo(current + (e.deltaY > 0 ? 1 : -1));
    }, 50);
  }, { passive: false });

  // Start Overlay logic for TV vs Datashow modes
  window.startPresentation = (mode) => {
    const isDatashowPage = window.location.pathname.endsWith('datashow.html');
    if (mode === 'tv') {
      if (isDatashowPage) {
        window.location.href = 'index.html';
        return;
      }
    } else if (mode === 'datashow') {
      if (!isDatashowPage) {
        window.location.href = 'datashow.html';
        return;
      }
    }

    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      }
    } catch (err) {
      console.log("Fullscreen API error:", err);
    }
    
    const startOverlay = document.getElementById('startOverlay');
    if (startOverlay) {
      startOverlay.style.opacity = '0';
      startOverlay.style.pointerEvents = 'none';
      setTimeout(() => startOverlay.remove(), 500);
    }
  };

})();
