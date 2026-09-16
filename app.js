/* ==========================================================================
   SANCTUARY - Calming Layoff Support & Resilience Hub
   Application Logic JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Header Scroll Effect
  const header = document.querySelector('.main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. Initialize Hero Carousel
  initHeroCarousel();

  // 3. Initialize Resilience Steps Controller
  initProgressTracker();

  // 4. Initialize 15-Minute Journaling & Timer
  initJournalTimer();

  // 5. Initialize ATS Resume Builder & PDF Exporter
  initResumeBuilder();

  // 7. Initialize Video Gallery Modal
  initVideoGallery();

  // 8. Initialize Ambient Sound Engine (Web Audio API)
  initAmbientSound();

  // 9. Initialize 4:4:4:4 Guided Box Breathing Exercise
  initBreathingWidget();

  // 10. Initialize Contact Form
  initContactForm();

  // 11. Initialize Dark/Light Theme Controller
  initThemeManager();

  // 12. Initialize Scroll Spy for One-Line Nav
  initScrollSpy();

  // 13. Initialize Mobile Navigation Menu Toggle
  initMobileNav();

  // 14. Initialize Collapsible Feature Benefits Showcase
  initBenefitsShowcase();
});

/* ==========================================================================
   1. HERO CAROUSEL LOGIC
   ========================================================================== */
function initHeroCarousel() {
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.indicator-dot');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  let currentSlide = 0;
  let carouselTimer = null;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    currentSlide = index;
  }

  function nextSlide() {
    let next = (currentSlide + 1) % slides.length;
    showSlide(next);
  }

  function prevSlide() {
    let prev = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prev);
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoPlay();
    });
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetAutoPlay();
    });
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      showSlide(idx);
      resetAutoPlay();
    });
  });

  function startAutoPlay() {
    carouselTimer = setInterval(nextSlide, 7000);
  }

  function resetAutoPlay() {
    clearInterval(carouselTimer);
    startAutoPlay();
  }

  showSlide(0);
  startAutoPlay();
}

/* ==========================================================================
   2. PROGRESS TRACKER CONTROLLER
   ========================================================================== */
function initProgressTracker() {
  const stepItems = document.querySelectorAll('.step-item');
  const stepPanes = document.querySelectorAll('.step-content-pane');
  const progressFill = document.querySelector('.steps-progress-fill');

  function setStep(stepNum) {
    stepItems.forEach((item) => {
      const idxStep = parseInt(item.dataset.step);
      if (idxStep === stepNum) {
        item.classList.add('active');
        item.classList.remove('completed');
      } else if (idxStep < stepNum) {
        item.classList.remove('active');
        item.classList.add('completed');
      } else {
        item.classList.remove('active', 'completed');
      }
    });

    stepPanes.forEach((pane) => {
      pane.classList.toggle('active', parseInt(pane.dataset.step) === stepNum);
    });

    // Update progress fill width across all steps
    if (progressFill && stepItems.length > 1) {
      const fillPercentage = ((stepNum - 1) / (stepItems.length - 1)) * 100;
      progressFill.style.width = `${fillPercentage}%`;
    }
  }

  stepItems.forEach((item) => {
    item.addEventListener('click', () => {
      const step = parseInt(item.dataset.step);
      setStep(step);
    });
  });

  // Global helper to jump between steps via buttons
  window.goToStep = function (stepNum) {
    setStep(stepNum);
    const container = document.getElementById('resilience-hub');
    if (container) {
      container.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Initialize Step 1
  setStep(1);
}

/* ==========================================================================
   3. 15-MINUTE JOURNALING & TIMER LOGIC
   ========================================================================== */
function initJournalTimer() {
  const journalTextarea = document.getElementById('journal-input');
  const timerDisplay = document.getElementById('timer-display');
  const timerProgressPath = document.querySelector('.timer-progress-path');
  const startBtn = document.getElementById('timer-start');
  const pauseBtn = document.getElementById('timer-pause');
  const resetBtn = document.getElementById('timer-reset');
  const wordCountDisplay = document.getElementById('journal-word-count');

  const TOTAL_SECONDS = 15 * 60; // 15 minutes = 900 seconds
  const CIRCUMFERENCE = 276.46; // 2 * PI * 44
  let remainingSeconds = TOTAL_SECONDS;
  let timerInterval = null;
  let isTimerRunning = false;
  let hasAutoStarted = false;

  // Restore saved draft if available
  const savedJournal = localStorage.getItem('sanctuary_journal_draft');
  if (savedJournal && journalTextarea) {
    journalTextarea.value = savedJournal;
    updateWordCount(savedJournal);
  }

  function updateTimerDisplay() {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    if (timerDisplay) timerDisplay.textContent = formatted;

    if (timerProgressPath) {
      const offset = CIRCUMFERENCE * (1 - (remainingSeconds / TOTAL_SECONDS));
      timerProgressPath.style.strokeDashoffset = offset;
    }
  }

  const exitZenBtn = document.getElementById('exit-zen-btn');
  const zenOverlay = document.getElementById('zen-mode-overlay');
  let isZenManuallyDismissed = false;

  function enterZenMode() {
    if (isZenManuallyDismissed) return;
    document.body.classList.add('zen-mode-active');
    const journalCard = document.getElementById('grounding-journal-card');
    if (journalCard) {
      journalCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (journalTextarea) {
      setTimeout(() => {
        journalTextarea.focus();
      }, 200);
    }
  }

  function exitZenMode(notify = false) {
    document.body.classList.remove('zen-mode-active');
    if (notify && typeof showToast === 'function') {
      showToast('🌿 Exited Zen Mode. Timer is still running.');
    }
  }

  if (exitZenBtn) {
    exitZenBtn.addEventListener('click', () => {
      isZenManuallyDismissed = true;
      exitZenMode(true);
    });
  }

  if (zenOverlay) {
    zenOverlay.addEventListener('click', () => {
      isZenManuallyDismissed = true;
      exitZenMode(true);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('zen-mode-active')) {
      isZenManuallyDismissed = true;
      exitZenMode(true);
    }
  });

  function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    isZenManuallyDismissed = false;
    enterZenMode();
    if (startBtn) startBtn.style.display = 'none';
    if (pauseBtn) pauseBtn.style.display = 'inline-flex';

    timerInterval = setInterval(() => {
      if (remainingSeconds > 0) {
        remainingSeconds--;
        updateTimerDisplay();
      } else {
        completeTimer();
      }
    }, 1000);
  }

  function pauseTimer() {
    isTimerRunning = false;
    clearInterval(timerInterval);
    exitZenMode();
    if (startBtn) startBtn.style.display = 'inline-flex';
    if (pauseBtn) pauseBtn.style.display = 'none';
  }

  function resetTimer() {
    pauseTimer();
    exitZenMode();
    remainingSeconds = TOTAL_SECONDS;
    updateTimerDisplay();
    hasAutoStarted = false;
    isZenManuallyDismissed = false;
  }

  function completeTimer() {
    pauseTimer();
    exitZenMode();
    playGentleChime();
    showToast('✨ 15 Minutes Complete! Wonderful job grounding your thoughts.');
  }

  function updateWordCount(text) {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    if (wordCountDisplay) {
      wordCountDisplay.textContent = `${words} words`;
    }
  }

  if (journalTextarea) {
    journalTextarea.addEventListener('input', (e) => {
      const content = e.target.value;
      updateWordCount(content);
      localStorage.setItem('sanctuary_journal_draft', content);

      // Auto-start timer on first typing stroke
      if (!hasAutoStarted && content.length > 0) {
        hasAutoStarted = true;
        startTimer();
      }
    });
  }

  if (startBtn) startBtn.addEventListener('click', startTimer);
  if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
  if (resetBtn) resetBtn.addEventListener('click', resetTimer);

  updateTimerDisplay();
}

/* ==========================================================================
   4. ATS RESUME BUILDER & REAL-TIME PREVIEW + PDF EXPORT
   ========================================================================== */
function initResumeBuilder() {
  const inputs = {
    name: document.getElementById('resume-name-input'),
    title: document.getElementById('resume-title-input'),
    email: document.getElementById('resume-email-input'),
    phone: document.getElementById('resume-phone-input'),
    location: document.getElementById('resume-location-input'),
    linkedin: document.getElementById('resume-linkedin-input'),
    summary: document.getElementById('resume-summary-input'),
    highlights: document.getElementById('resume-highlights-input'),
    education: document.getElementById('resume-edu-input'),
    skills: document.getElementById('resume-skills-input'),
    hobbies: document.getElementById('resume-hobbies-input')
  };

  const previewElements = {
    name: document.getElementById('preview-name'),
    title: document.getElementById('preview-title'),
    contact: document.getElementById('preview-contact'),
    summary: document.getElementById('preview-summary'),
    highlightsSection: document.getElementById('ats-section-highlights'),
    highlights: document.getElementById('preview-highlights'),
    skills: document.getElementById('preview-skills'),
    experience: document.getElementById('preview-experience'),
    education: document.getElementById('preview-education'),
    hobbies: document.getElementById('preview-hobbies')
  };

  // State: Multiple Employers
  let employers = [
    {
      id: 1,
      role: 'Senior Product Manager',
      company: 'Tech Corp',
      dates: '2022 – 2024',
      location: 'San Francisco, CA',
      bullets: '• Spearheaded product strategy for enterprise platform, scaling active users by 35% YoY.\n• Directed cross-functional team of 12 engineers, designers, and data analysts across 4 time zones.\n• Reduced customer onboarding drop-off by 42% through streamlined telemetry and in-app guides.'
    },
    {
      id: 2,
      role: 'Product Manager',
      company: 'Innovate Labs',
      dates: '2019 – 2022',
      location: 'Austin, TX',
      bullets: '• Launched 3 zero-to-one web features adopted by over 250,000 monthly active users.\n• Automated quarterly sprint reporting and customer feedback loops, boosting delivery velocity by 20%.\n• Championed customer-centric discovery sprints, cutting feature validation cycles from 6 weeks to 10 days.'
    }
  ];

  const employersContainer = document.getElementById('employers-container');
  const addEmployerBtn = document.getElementById('add-employer-btn');
  const MAX_EMPLOYERS = 6;

  function updateAddEmployerBtnState() {
    if (!addEmployerBtn) return;
    if (employers.length >= MAX_EMPLOYERS) {
      addEmployerBtn.disabled = true;
      addEmployerBtn.style.opacity = '0.5';
      addEmployerBtn.style.cursor = 'not-allowed';
      addEmployerBtn.innerHTML = `<i class="fa-solid fa-ban"></i> Max Reached (${employers.length}/${MAX_EMPLOYERS})`;
    } else {
      addEmployerBtn.disabled = false;
      addEmployerBtn.style.opacity = '1';
      addEmployerBtn.style.cursor = 'pointer';
      addEmployerBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Add Employer (${employers.length}/${MAX_EMPLOYERS})`;
    }
  }

  function renderEmployersForm() {
    if (!employersContainer) return;
    employersContainer.innerHTML = '';

    employers.forEach((emp, index) => {
      const card = document.createElement('div');
      card.className = 'employer-form-card';
      card.dataset.id = emp.id;
      card.innerHTML = `
        <div class="employer-card-header">
          <span class="employer-num-badge"><i class="fa-solid fa-briefcase"></i> Employer ${index + 1}</span>
          ${employers.length > 1 ? `
            <button type="button" class="btn-remove-employer" data-id="${emp.id}">
              <i class="fa-solid fa-trash-can"></i> Remove
            </button>
          ` : ''}
        </div>
        <div class="form-row-grid">
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label">Job Title / Role</label>
            <input type="text" class="form-input emp-role-input" value="${escapeHtml(emp.role)}" placeholder="e.g. Senior Product Manager">
          </div>
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label">Company / Employer Name</label>
            <input type="text" class="form-input emp-company-input" value="${escapeHtml(emp.company)}" placeholder="e.g. Acme Corp">
          </div>
        </div>
        <div class="form-row-grid">
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label">Dates / Period</label>
            <input type="text" class="form-input emp-dates-input" value="${escapeHtml(emp.dates)}" placeholder="e.g. 2022 – 2024">
          </div>
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label">Location</label>
            <input type="text" class="form-input emp-loc-input" value="${escapeHtml(emp.location)}" placeholder="e.g. San Francisco, CA">
          </div>
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">Key Accomplishments & Bullet Points</label>
          <textarea class="form-textarea emp-bullets-input" rows="4" placeholder="• Bullet 1&#10;• Bullet 2">${escapeHtml(emp.bullets)}</textarea>
        </div>
      `;

      // Event listeners for each employer input
      const roleInput = card.querySelector('.emp-role-input');
      const companyInput = card.querySelector('.emp-company-input');
      const datesInput = card.querySelector('.emp-dates-input');
      const locInput = card.querySelector('.emp-loc-input');
      const bulletsInput = card.querySelector('.emp-bullets-input');

      roleInput.addEventListener('input', () => { emp.role = roleInput.value; });
      companyInput.addEventListener('input', () => { emp.company = companyInput.value; });
      datesInput.addEventListener('input', () => { emp.dates = datesInput.value; });
      locInput.addEventListener('input', () => { emp.location = locInput.value; });
      bulletsInput.addEventListener('input', () => { emp.bullets = bulletsInput.value; });

      const removeBtn = card.querySelector('.btn-remove-employer');
      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          employers = employers.filter(e => e.id !== emp.id);
          renderEmployersForm();
          showToast(`🗑️ Employer removed (${employers.length}/${MAX_EMPLOYERS})`);
        });
      }

      employersContainer.appendChild(card);
    });

    updateAddEmployerBtnState();
  }

  if (addEmployerBtn) {
    addEmployerBtn.addEventListener('click', () => {
      if (employers.length >= MAX_EMPLOYERS) {
        showToast(`⚠️ Maximum of ${MAX_EMPLOYERS} work experience additions allowed`);
        return;
      }
      const newEmp = {
        id: Date.now(),
        role: '',
        company: '',
        dates: '',
        location: '',
        bullets: ''
      };
      employers.push(newEmp);
      renderEmployersForm();
      showToast(`➕ New employer added (${employers.length}/${MAX_EMPLOYERS})`);
      const lastCard = employersContainer.lastElementChild;
      if (lastCard) {
        lastCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        const firstInput = lastCard.querySelector('.emp-role-input');
        if (firstInput) firstInput.focus();
      }
    });
  }

  renderEmployersForm();

  // Tab switching in resume editor
  const tabBtns = document.querySelectorAll('.resume-tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetPane = document.getElementById(btn.dataset.tab);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // Helper: extract clean LinkedIn username and generate target URL
  function parseLinkedIn(input) {
    if (!input) return null;
    let trimmed = input.trim().replace(/\/+$/, '');
    if (!trimmed) return null;

    let username = trimmed;
    const match = trimmed.match(/(?:linkedin\.com\/in\/)?([a-zA-Z0-9_\-\.]+)/i);
    if (match && match[1]) {
      username = match[1];
    }
    username = username.replace(/^@/, '').replace(/^https?:\/\//i, '').replace(/^www\./i, '');
    const url = `https://www.linkedin.com/in/${username}`;
    return { username, url };
  }

  // Past Wins & Highlights Synchronization (Step 2 & Step 3)
  const pastWinsInput = document.getElementById('past-wins-input');
  const resumeHighlightsInput = inputs.highlights;
  const includeHighlightsCheckbox = document.getElementById('include-highlights-checkbox');
  const resumeHighlightsToggle = document.getElementById('resume-highlights-toggle');

  // Restore saved past wins / highlights
  const savedWins = localStorage.getItem('sanctuary_past_wins');
  if (savedWins) {
    if (pastWinsInput) pastWinsInput.value = savedWins;
    if (resumeHighlightsInput) resumeHighlightsInput.value = savedWins;
  }

  function syncHighlights(source) {
    const val = source.value;
    if (source === pastWinsInput && resumeHighlightsInput) {
      resumeHighlightsInput.value = val;
    } else if (source === resumeHighlightsInput && pastWinsInput) {
      pastWinsInput.value = val;
    }
    localStorage.setItem('sanctuary_past_wins', val);
  }

  if (pastWinsInput) {
    pastWinsInput.addEventListener('input', () => syncHighlights(pastWinsInput));
  }
  if (resumeHighlightsInput) {
    resumeHighlightsInput.addEventListener('input', () => syncHighlights(resumeHighlightsInput));
  }

  function syncToggle(source) {
    const isChecked = source.checked;
    if (source === includeHighlightsCheckbox && resumeHighlightsToggle) {
      resumeHighlightsToggle.checked = isChecked;
    } else if (source === resumeHighlightsToggle && includeHighlightsCheckbox) {
      includeHighlightsCheckbox.checked = isChecked;
    }
  }

  if (includeHighlightsCheckbox) {
    includeHighlightsCheckbox.addEventListener('change', () => syncToggle(includeHighlightsCheckbox));
  }
  if (resumeHighlightsToggle) {
    resumeHighlightsToggle.addEventListener('change', () => syncToggle(resumeHighlightsToggle));
  }

  window.appendWinPrompt = function (promptText) {
    const target = pastWinsInput || resumeHighlightsInput;
    if (!target) return;
    const current = target.value.trim();
    const bullet = `• ${promptText}`;
    target.value = current ? `${current}\n${bullet}` : bullet;
    syncHighlights(target);
    target.focus();
    if (typeof showToast === 'function') {
      showToast('💡 Win prompt added to highlights');
    }
  };

  window.saveWinsAndProceed = function () {
    const val = pastWinsInput ? pastWinsInput.value.trim() : '';
    if (val) {
      localStorage.setItem('sanctuary_past_wins', val);
      if (typeof showToast === 'function') {
        showToast('✨ Career highlights saved');
      }
    }
    goToStep(3);
  };

  const originalDocumentTitle = document.title || 'RiseUp';

  function getResumeFirstName() {
    const nameVal = (inputs.name && inputs.name.value.trim()) || '';
    if (!nameVal) {
      const previewName = previewElements.name ? previewElements.name.textContent.trim() : '';
      if (previewName && previewName !== 'Jane Doe') {
        const parts = previewName.split(/\s+/).filter(Boolean);
        if (parts.length > 0) {
          let first = parts[0];
          if (/^(dr\.?|mr\.?|ms\.?|mrs\.?|prof\.?)$/i.test(first) && parts.length > 1) {
            first = parts[1];
          }
          first = first.replace(/^[^\w]+|[^\w]+$/g, '');
          if (first) return first.charAt(0).toUpperCase() + first.slice(1);
        }
      }
      return 'Jane';
    }

    const parts = nameVal.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'Jane';

    let first = parts[0];
    if (/^(dr\.?|mr\.?|ms\.?|mrs\.?|prof\.?)$/i.test(first) && parts.length > 1) {
      first = parts[1];
    }
    first = first.replace(/^[^\w]+|[^\w]+$/g, '');
    return first ? (first.charAt(0).toUpperCase() + first.slice(1)) : 'Jane';
  }

  function updateResumeTitles() {
    const firstName = getResumeFirstName();
    const pdfTitle = `${firstName} - Resume.pdf`;

    const modalTitle = document.getElementById('resume-modal-title');
    if (modalTitle) {
      modalTitle.textContent = pdfTitle;
    }

    if (resumeModal && resumeModal.classList.contains('active')) {
      document.title = pdfTitle;
    }
  }

  function restoreAppDocumentTitle() {
    document.title = originalDocumentTitle;
  }

  // Real-time binding logic
  function updatePreview() {
    // 1. Name
    const nameVal = inputs.name ? inputs.name.value.trim() : '';
    if (previewElements.name) {
      previewElements.name.textContent = nameVal || 'Jane Doe';
      previewElements.name.style.color = nameVal ? '#000000' : '#777777';
    }

    // 2. Title
    const titleVal = inputs.title ? inputs.title.value.trim() : '';
    if (previewElements.title) {
      previewElements.title.textContent = titleVal || 'Senior Product Manager';
      previewElements.title.style.color = titleVal ? '#374151' : '#777777';
    }

    // 3. Contact Header with Hyperlinks
    if (previewElements.contact) {
      const contactSpans = [];

      // Phone (tel: link)
      const phoneVal = inputs.phone ? inputs.phone.value.trim() : '';
      if (phoneVal) {
        const cleanDigits = phoneVal.replace(/[^\d+]/g, '');
        contactSpans.push(`<span class="ats-contact-item"><a href="tel:${cleanDigits}" class="ats-link">${escapeHtml(phoneVal)}</a></span>`);
      } else {
        contactSpans.push(`<span class="ats-contact-item"><a href="tel:5551234567" class="ats-link" style="color: #777777;">(555) 123-4567</a></span>`);
      }

      // Email (mailto: link)
      const emailVal = inputs.email ? inputs.email.value.trim() : '';
      if (emailVal) {
        contactSpans.push(`<span class="ats-contact-item"><a href="mailto:${escapeHtml(emailVal)}" class="ats-link">${escapeHtml(emailVal)}</a></span>`);
      } else {
        contactSpans.push(`<span class="ats-contact-item"><a href="mailto:janedoe@example.com" class="ats-link" style="color: #777777;">janedoe@example.com</a></span>`);
      }

      // LinkedIn (Only show username, clickable link to profile URL)
      const linkedinVal = inputs.linkedin ? inputs.linkedin.value.trim() : '';
      const parsedLinkedIn = parseLinkedIn(linkedinVal || 'janedoe');
      if (parsedLinkedIn) {
        const style = linkedinVal ? '' : 'style="color: #777777;"';
        contactSpans.push(`<span class="ats-contact-item"><a href="${escapeHtml(parsedLinkedIn.url)}" target="_blank" rel="noopener noreferrer" class="ats-link" ${style}>${escapeHtml(parsedLinkedIn.username)}</a></span>`);
      }

      // Location
      const locVal = inputs.location ? inputs.location.value.trim() : '';
      contactSpans.push(`<span class="ats-contact-item" ${locVal ? '' : 'style="color: #777777;"'}>${escapeHtml(locVal || 'San Francisco, CA')}</span>`);

      previewElements.contact.innerHTML = contactSpans.join(' <span class="ats-separator">•</span> ');
    }

    // 4. Professional Summary
    if (previewElements.summary) {
      const summaryVal = inputs.summary ? inputs.summary.value.trim() : '';
      if (summaryVal) {
        previewElements.summary.textContent = summaryVal;
        previewElements.summary.style.color = '#1f2937';
      } else {
        previewElements.summary.textContent = 'Resilient and strategic Senior Product Manager with 6+ years of experience leading cross-functional design and engineering teams. Track record of delivering scalable web platforms, driving user engagement, and mentoring high-performing teams.';
        previewElements.summary.style.color = '#777777';
      }
    }

    // 4.5. Optional Career Highlights (Step 2 Wins)
    if (previewElements.highlightsSection && previewElements.highlights) {
      const highlightsVal = (resumeHighlightsInput ? resumeHighlightsInput.value : (pastWinsInput ? pastWinsInput.value : '')).trim();
      const isHighlightsEnabled = resumeHighlightsToggle ? resumeHighlightsToggle.checked : true;

      if (highlightsVal && isHighlightsEnabled) {
        previewElements.highlightsSection.style.display = 'block';
        previewElements.highlights.innerHTML = formatBulletList(highlightsVal);
      } else {
        previewElements.highlightsSection.style.display = 'none';
        previewElements.highlights.innerHTML = '';
      }
    }

    // 5. Core Competencies & Skills
    if (previewElements.skills) {
      const skillsRaw = inputs.skills ? inputs.skills.value.trim() : '';
      if (skillsRaw) {
        const skillList = skillsRaw.split(/[,•\n]+/).map(s => s.trim()).filter(Boolean);
        previewElements.skills.innerHTML = `<div class="ats-skills-grid">${skillList.map(s => `<span class="ats-skill-badge">${escapeHtml(s)}</span>`).join('')}</div>`;
      } else {
        const defaultSkills = ['Product Strategy', 'Agile Roadmap', 'User Research', 'Cross-Functional Leadership', 'Data Analytics'];
        previewElements.skills.innerHTML = `<div class="ats-skills-grid" style="opacity: 0.7;">${defaultSkills.map(s => `<span class="ats-skill-badge">${s}</span>`).join('')}</div>`;
      }
    }

    // 6. Work Experience (Multiple Employers)
    if (previewElements.experience) {
      if (employers.length > 0) {
        previewElements.experience.innerHTML = employers.map(emp => {
          const role = emp.role.trim() || 'Job Title';
          const company = emp.company.trim() || 'Company Name';
          const dates = emp.dates.trim() || 'Dates of Employment';
          const loc = emp.location.trim() || '';
          const bulletsHtml = formatBulletList(emp.bullets);

          return `
            <div class="ats-exp-entry">
              <div class="ats-exp-header">
                <strong class="ats-role">${escapeHtml(role)}</strong>
                <span class="ats-dates">${escapeHtml(dates)}</span>
              </div>
              <div class="ats-exp-sub">
                <span class="ats-company">${escapeHtml(company)}</span>
                ${loc ? `<span class="ats-location">${escapeHtml(loc)}</span>` : ''}
              </div>
              ${bulletsHtml}
            </div>
          `;
        }).join('');
      } else {
        previewElements.experience.innerHTML = '<p style="color: #777777; font-size: 9.5pt;">Add employers in the Work Experience tab...</p>';
      }
    }

    // 7. Education & Certifications
    if (previewElements.education) {
      const eduRaw = inputs.education ? inputs.education.value.trim() : '';
      if (eduRaw) {
        previewElements.education.innerHTML = formatBulletList(eduRaw);
      } else {
        previewElements.education.innerHTML = `
          <ul class="ats-list" style="color: #777777;">
            <li>B.S. in Computer Science | University of California (2016 - 2020)</li>
            <li>Certified Scrum Product Owner (CSPO) | Scrum Alliance</li>
          </ul>
        `;
      }
    }

    // 8. Hobbies & Interests
    if (previewElements.hobbies) {
      const hobbiesRaw = inputs.hobbies ? inputs.hobbies.value.trim() : '';
      if (hobbiesRaw) {
        previewElements.hobbies.textContent = hobbiesRaw;
        previewElements.hobbies.style.color = '#1f2937';
      } else {
        previewElements.hobbies.textContent = 'Marathon running, Landscape photography, Mentoring junior engineers, Open-source contributor, Chess';
        previewElements.hobbies.style.color = '#777777';
      }
    }

    // 9. Sync PDF document title and preview modal header
    updateResumeTitles();
  }

  function formatBulletList(rawText) {
    if (!rawText) return '';
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return '';
    const items = lines.map(line => {
      const cleanLine = line.replace(/^[•\-\*]\s*/, '');
      return `<li>${escapeHtml(cleanLine)}</li>`;
    });
    return `<ul class="ats-list">${items.join('')}</ul>`;
  }

  // Helper to ensure any typed values in DOM cards are synchronized into state
  function syncEmployersFromDOM() {
    if (!employersContainer) return;
    const cards = employersContainer.querySelectorAll('.employer-form-card');
    cards.forEach(card => {
      const id = parseInt(card.dataset.id, 10);
      const emp = employers.find(e => e.id === id);
      if (emp) {
        const roleEl = card.querySelector('.emp-role-input');
        const companyEl = card.querySelector('.emp-company-input');
        const datesEl = card.querySelector('.emp-dates-input');
        const locEl = card.querySelector('.emp-loc-input');
        const bulletsEl = card.querySelector('.emp-bullets-input');
        if (roleEl) emp.role = roleEl.value;
        if (companyEl) emp.company = companyEl.value;
        if (datesEl) emp.dates = datesEl.value;
        if (locEl) emp.location = locEl.value;
        if (bulletsEl) emp.bullets = bulletsEl.value;
      }
    });
  }

  // Multi-Page Paper Pagination & Pure White Canvas Guarantee
  function updatePreviewPaperPagination() {
    const paper = document.getElementById('resume-preview-document');
    if (!paper) return;

    // Clear any prior dividers
    const oldDividers = paper.querySelectorAll('.ats-page-divider');
    oldDividers.forEach(d => d.remove());

    // Standard letter height is 11in at 96 DPI = 1056px
    const PAGE_HEIGHT = 1056;
    paper.style.minHeight = '1056px';

    // Allow browser to render layout and calculate actual height
    const naturalHeight = paper.scrollHeight;
    const totalPages = Math.max(1, Math.ceil(naturalHeight / PAGE_HEIGHT));

    // Force paper min-height so EVERY subsequent page (page 2, 3...) has a full white canvas
    paper.style.minHeight = `${totalPages * PAGE_HEIGHT}px`;

    // Render subtle page boundary markers between pages on screen
    if (totalPages > 1) {
      for (let p = 1; p < totalPages; p++) {
        const divider = document.createElement('div');
        divider.className = 'ats-page-divider';
        divider.style.top = `${p * PAGE_HEIGHT}px`;
        divider.innerHTML = `<span class="page-divider-tag">Page ${p + 1}</span>`;
        paper.appendChild(divider);
      }
    }
  }

  // Resume Preview Modal Control (On-Demand Preview with Latest Text)
  const resumeModal = document.getElementById('resume-preview-modal');
  const closePreviewBtn = document.getElementById('resume-preview-close');
  const openModalTriggers = document.querySelectorAll('.open-preview-modal-trigger, #open-preview-modal-btn, #open-preview-modal-bottom-btn');
  const printBtn = document.getElementById('print-resume-btn');

  function openResumePreviewModal() {
    // 1. Sync employer values directly from active DOM inputs
    syncEmployersFromDOM();
    // 2. Render preview document with the absolute latest text
    updatePreview();
    // 3. Set the PDF document title while preview is active
    updateResumeTitles();
    // 4. Display modal first so DOM is visible for accurate layout calculation
    if (resumeModal) {
      resumeModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    // 5. Guarantee multi-page white background and page dividers after DOM reflow
    requestAnimationFrame(() => {
      updatePreviewPaperPagination();
    });
  }

  function closeResumePreviewModal() {
    if (resumeModal) {
      resumeModal.classList.remove('active');
      document.body.style.overflow = '';
    }
    restoreAppDocumentTitle();
  }

  // Wire open triggers (top header button & bottom action button)
  openModalTriggers.forEach(btn => {
    btn.addEventListener('click', openResumePreviewModal);
  });

  // Wire close button
  if (closePreviewBtn) {
    closePreviewBtn.addEventListener('click', closeResumePreviewModal);
  }

  // Close on backdrop click
  if (resumeModal) {
    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) {
        closeResumePreviewModal();
      }
    });
  }

  // Close on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && resumeModal && resumeModal.classList.contains('active')) {
      closeResumePreviewModal();
    }
  });

  let originalViewportContent = null;

  function preparePrintEnvironment() {
    syncEmployersFromDOM();
    updatePreview();
    const firstName = getResumeFirstName();
    document.title = `${firstName} - Resume.pdf`;

    // Temporarily set viewport meta tag to desktop width (1024px) so mobile browsers render full desktop layout during print
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta && !originalViewportContent) {
      originalViewportContent = viewportMeta.getAttribute('content');
      viewportMeta.setAttribute('content', 'width=1024, initial-scale=1.0');
    }

    const paper = document.getElementById('resume-preview-document');
    if (paper) {
      paper.style.minHeight = '0';
      const dividers = paper.querySelectorAll('.ats-page-divider');
      dividers.forEach(d => d.remove());
    }
  }

  function restorePrintEnvironment() {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta && originalViewportContent) {
      viewportMeta.setAttribute('content', originalViewportContent);
      originalViewportContent = null;
    }
    updatePreviewPaperPagination();
    if (!resumeModal || !resumeModal.classList.contains('active')) {
      restoreAppDocumentTitle();
    }
  }

  // Print / Save as PDF Button inside preview modal
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      preparePrintEnvironment();
      window.print();
      // Safety restoration timeout for mobile browsers where afterprint may not fire immediately
      setTimeout(restorePrintEnvironment, 1500);
    });
  }

  // Automatically sync and refresh preview if user invokes native print (Cmd+P / Ctrl+P)
  window.addEventListener('beforeprint', preparePrintEnvironment);
  window.addEventListener('afterprint', restorePrintEnvironment);

  window.addEventListener('resize', () => {
    if (resumeModal && resumeModal.classList.contains('active')) {
      updatePreviewPaperPagination();
    }
  });

  // Live input sync across all resume inputs
  Object.values(inputs).forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        updatePreview();
        if (resumeModal && resumeModal.classList.contains('active')) {
          updateResumeTitles();
          updatePreviewPaperPagination();
        }
      });
    }
  });

  // Populate preview DOM once initially on load
  updatePreview();
  updatePreviewPaperPagination();
}

/* ==========================================================================
   6. VIDEO GALLERY MODAL
   ========================================================================== */
const videoList = [
  { id: '1', title: 'Connecting the Dots in Setbacks', speaker: 'Steve Jobs', videoId: 'UF8uR6Z6KLc', tag: 'Mindset' },
  { id: '2', title: 'Finding Your Purpose & Next Direction', speaker: 'Simon Sinek', videoId: 'XZ5NaZ2Ucdo', tag: 'Career Strategy' },
  { id: '3', title: 'The Power of Vulnerability & Self-Compassion', speaker: 'Brené Brown', videoId: 'iCvmsMzlF7o', tag: 'Emotional Strength' },
  { id: '4', title: 'Create a Daily Schedule & Stick To It', speaker: 'Jordan Peterson', videoId: 'iFqaO1GkOUo', tag: 'Focus & Routine' },
  { id: '5', title: "Identity Crisis: Don't Define Yourself by Your Job", speaker: 'Harvard Business Review', videoId: 'L5lsYI0Q8zw', tag: 'Perspective' },
  { id: '6', title: '5 Time Management Principles for Transitions', speaker: 'Oliver Burkeman', videoId: 'maG5Q0EG7ik', tag: 'Time Management' }
];

function initVideoGallery() {
  const modal = document.getElementById('video-modal');
  const iframe = document.getElementById('video-iframe');
  const closeBtn = document.getElementById('modal-close');

  const videoCards = document.querySelectorAll('.video-card');

  videoCards.forEach((card) => {
    card.addEventListener('click', () => {
      const ytId = card.dataset.youtubeId;
      if (ytId && iframe && modal) {
        iframe.src = `https://www.youtube.com/embed/${ytId}?autoplay=1`;
        modal.classList.add('active');
      }
    });
  });

  if (closeBtn && modal && iframe) {
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  function closeModal() {
    if (modal && iframe) {
      modal.classList.remove('active');
      iframe.src = '';
    }
  }
}

/* ==========================================================================
   7. AMBIENT AUDIO GENERATOR (WEB AUDIO API SYNTHESIS)
   ========================================================================== */
function initAmbientSound() {
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const audioPanel = document.getElementById('audio-panel');
  const optionBtns = document.querySelectorAll('.audio-option-btn');

  let audioCtx = null;
  let activeSources = [];
  let activeTimers = [];
  let isPlaying = false;
  let currentSound = 'off';

  if (audioToggleBtn && audioPanel) {
    audioToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      audioPanel.classList.toggle('show');
    });

    const closeAudioPanelBtn = document.getElementById('audio-panel-close-btn');
    if (closeAudioPanelBtn) {
      closeAudioPanelBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        audioPanel.classList.remove('show');
      });
    }

    document.addEventListener('click', (e) => {
      if (!audioPanel.contains(e.target) && e.target !== audioToggleBtn) {
        audioPanel.classList.remove('show');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && audioPanel.classList.contains('show')) {
        audioPanel.classList.remove('show');
      }
    });
  }

  optionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      optionBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const soundType = btn.dataset.sound;

      if (soundType === 'off') {
        stopAmbientSound();
        if (audioToggleBtn) audioToggleBtn.classList.remove('active');
        showToast('🔇 Ambient sound muted');
      } else {
        currentSound = soundType;
        playAmbientSound(soundType);
        if (audioToggleBtn) audioToggleBtn.classList.add('active');
      }
    });
  });

  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Create 3-second looping pink noise buffer (Paul Kellet algorithm)
  function createPinkNoiseBuffer(ctx) {
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.09;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  // Create 3-second looping brown noise buffer (integrated random walk)
  function createBrownNoiseBuffer(ctx) {
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + (0.025 * white)) / 1.025;
      data[i] = lastOut * 1.8;
    }
    return buffer;
  }

  // Create 3-second looping white noise buffer
  function createWhiteNoiseBuffer(ctx) {
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.22;
    }
    return buffer;
  }

  function playAmbientSound(type) {
    stopAmbientSound();
    const ctx = getAudioContext();

    if (type === 'whitenoise') {
      // 1. White Noise: Smooth air-purifier frequency spectrum
      const buf = createWhiteNoiseBuffer(ctx);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(1400, ctx.currentTime);

      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(80, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime);

      src.connect(lowpass);
      lowpass.connect(highpass);
      highpass.connect(gain);
      gain.connect(ctx.destination);

      src.start();
      activeSources.push(src);
      showToast('🔊 Playing White Noise soundscape');



    } else if (type === 'waterfall') {
      // 3. Waterfall: Deep roaring plunge + foaming cascade spray
      const brownBuf = createBrownNoiseBuffer(ctx);
      const plungeSrc = ctx.createBufferSource();
      plungeSrc.buffer = brownBuf;
      plungeSrc.loop = true;

      const plungeFilter = ctx.createBiquadFilter();
      plungeFilter.type = 'lowpass';
      plungeFilter.frequency.setValueAtTime(320, ctx.currentTime);
      plungeFilter.Q.setValueAtTime(1.8, ctx.currentTime);

      const plungeGain = ctx.createGain();
      plungeGain.gain.setValueAtTime(0.18, ctx.currentTime);

      plungeSrc.connect(plungeFilter);
      plungeFilter.connect(plungeGain);
      plungeGain.connect(ctx.destination);
      plungeSrc.start();
      activeSources.push(plungeSrc);

      // Layer: Cascading rush and foam
      const pinkBuf = createPinkNoiseBuffer(ctx);
      const spraySrc = ctx.createBufferSource();
      spraySrc.buffer = pinkBuf;
      spraySrc.loop = true;

      const sprayFilter = ctx.createBiquadFilter();
      sprayFilter.type = 'bandpass';
      sprayFilter.frequency.setValueAtTime(880, ctx.currentTime);
      sprayFilter.Q.setValueAtTime(0.9, ctx.currentTime);

      const sprayGain = ctx.createGain();
      sprayGain.gain.setValueAtTime(0.12, ctx.currentTime);

      spraySrc.connect(sprayFilter);
      sprayFilter.connect(sprayGain);
      sprayGain.connect(ctx.destination);
      spraySrc.start();
      activeSources.push(spraySrc);

      showToast('🔊 Playing Waterfall soundscape');

    } else if (type === 'thunderstorm') {
      // 4. Thunderstorm: Soothing continuous rain + distant rolling thunder
      const pinkBuf = createPinkNoiseBuffer(ctx);
      const rainSrc = ctx.createBufferSource();
      rainSrc.buffer = pinkBuf;
      rainSrc.loop = true;

      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.setValueAtTime(920, ctx.currentTime);

      const rainGain = ctx.createGain();
      rainGain.gain.setValueAtTime(0.15, ctx.currentTime);

      rainSrc.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(ctx.destination);
      rainSrc.start();
      activeSources.push(rainSrc);

      // Layer: Periodic rolling thunder
      const brownBuf = createBrownNoiseBuffer(ctx);
      function triggerThunder() {
        if (!audioCtx || audioCtx.state === 'closed') return;
        const thunderSrc = ctx.createBufferSource();
        thunderSrc.buffer = brownBuf;
        thunderSrc.loop = true;

        const thunderFilter = ctx.createBiquadFilter();
        thunderFilter.type = 'lowpass';
        thunderFilter.frequency.setValueAtTime(75, ctx.currentTime);
        thunderFilter.Q.setValueAtTime(3.8, ctx.currentTime);

        const thunderGain = ctx.createGain();
        const now = ctx.currentTime;
        thunderGain.gain.setValueAtTime(0.001, now);
        thunderGain.gain.exponentialRampToValueAtTime(0.26, now + 0.9);
        thunderGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.3);

        thunderSrc.connect(thunderFilter);
        thunderFilter.connect(thunderGain);
        thunderGain.connect(ctx.destination);

        thunderSrc.start(now);
        thunderSrc.stop(now + 4.5);
        thunderSrc.onended = () => {
          const idx = activeSources.indexOf(thunderSrc);
          if (idx !== -1) activeSources.splice(idx, 1);
        };
        activeSources.push(thunderSrc);
      }

      // Initial roll at 1.5s, then repeated every 13s
      const initialThunder = setTimeout(triggerThunder, 1500);
      activeTimers.push(initialThunder);

      const thunderInterval = setInterval(triggerThunder, 13000);
      activeTimers.push(thunderInterval);

      showToast('🔊 Playing Thunderstorm Rain soundscape');
    }

    isPlaying = true;
  }

  function stopAmbientSound() {
    activeTimers.forEach(timer => {
      clearTimeout(timer);
      clearInterval(timer);
    });
    activeTimers = [];

    activeSources.forEach(src => {
      try { src.stop(); } catch (e) { }
      try { src.disconnect(); } catch (e) { }
    });
    activeSources = [];
    isPlaying = false;
  }
}

// Gentle Web Audio Chime for timer completion
function playGentleChime() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 1.2); // E5
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 1.5);
  } catch (e) { }
}

/* ==========================================================================
   8. CALM BREATHING (4:4:4) GUIDED EXERCISE & DOUGHNUT BAR
   ========================================================================== */
function initBreathingWidget() {
  const breathingBtn = document.getElementById('breathing-btn');
  const modal = document.getElementById('breathing-modal');
  const closeBtn = document.getElementById('breathing-close');
  const circle = document.getElementById('breathing-circle');
  const instructionText = document.getElementById('breathing-instruction');
  const countdownText = document.getElementById('breathing-countdown');
  const progressBar = document.getElementById('breathing-progress-bar');

  const phaseInhalePill = document.getElementById('phase-inhale');
  const phaseHold1Pill = document.getElementById('phase-hold-1') || document.getElementById('phase-hold');
  const phaseExhalePill = document.getElementById('phase-exhale');
  const phaseHold2Pill = document.getElementById('phase-hold-2');

  const CIRCUMFERENCE = 552.92; // 2 * PI * 88
  const PHASE_DURATION = 4000; // 4 seconds = 4:4:4:4
  const TICK_MS = 50;

  let breathingInterval = null;
  let currentPhase = 0; // 0: Inhale, 1: Hold (Full), 2: Exhale, 3: Hold (Empty)
  let phaseRemainingMs = PHASE_DURATION;

  const phases = [
    {
      name: 'Inhale',
      class: 'breathing-circle-wrap inhale',
      pill: phaseInhalePill,
      color: 'var(--primary-sage)'
    },
    {
      name: 'Hold',
      class: 'breathing-circle-wrap hold',
      pill: phaseHold1Pill,
      color: 'var(--accent-amber)'
    },
    {
      name: 'Exhale',
      class: 'breathing-circle-wrap exhale',
      pill: phaseExhalePill,
      color: 'var(--accent-blue)'
    },
    {
      name: 'Hold',
      class: 'breathing-circle-wrap hold-empty',
      pill: phaseHold2Pill,
      color: '#c084fc'
    }
  ];

  function setPhase(phaseIndex) {
    currentPhase = phaseIndex;
    phaseRemainingMs = PHASE_DURATION;
    const p = phases[currentPhase];

    if (circle) circle.className = p.class;
    if (instructionText) instructionText.textContent = p.name;
    if (countdownText) countdownText.textContent = '4';

    // Highlight active phase step pill
    [phaseInhalePill, phaseHold1Pill, phaseExhalePill, phaseHold2Pill].forEach(pill => {
      if (pill) pill.classList.remove('active');
    });
    if (p.pill) p.pill.classList.add('active');

    // Update doughnut color
    if (progressBar && p.color) {
      progressBar.style.stroke = p.color;
    }
  }

  function startBreathing() {
    stopBreathing();
    setPhase(0);

    breathingInterval = setInterval(() => {
      phaseRemainingMs -= TICK_MS;

      // Countdown integer (4, 3, 2, 1)
      const secsLeft = Math.max(1, Math.ceil(phaseRemainingMs / 1000));
      if (countdownText) countdownText.textContent = secsLeft;

      // Doughnut Progress Animation
      if (progressBar) {
        if (currentPhase === 0) {
          // Inhale: fills clockwise 0 -> 100%
          const progress = 1 - (phaseRemainingMs / PHASE_DURATION);
          progressBar.style.strokeDashoffset = CIRCUMFERENCE * (1 - Math.min(1, Math.max(0, progress)));
        } else if (currentPhase === 1) {
          // Hold Full: stays full with warm amber accent
          progressBar.style.strokeDashoffset = 0;
        } else if (currentPhase === 2) {
          // Exhale: empties smoothly 100% -> 0%
          const progress = phaseRemainingMs / PHASE_DURATION;
          progressBar.style.strokeDashoffset = CIRCUMFERENCE * (1 - Math.min(1, Math.max(0, progress)));
        } else if (currentPhase === 3) {
          // Hold Empty: stays empty at 0%
          progressBar.style.strokeDashoffset = CIRCUMFERENCE;
        }
      }

      // Transition to next phase in 4-part square box
      if (phaseRemainingMs <= 0) {
        const nextPhase = (currentPhase + 1) % 4;
        setPhase(nextPhase);
      }
    }, TICK_MS);
  }

  function stopBreathing() {
    if (breathingInterval) {
      clearInterval(breathingInterval);
      breathingInterval = null;
    }
    if (circle) circle.className = 'breathing-circle-wrap';
    if (instructionText) instructionText.textContent = 'Get Ready';
    if (countdownText) countdownText.textContent = '4';
    if (progressBar) progressBar.style.strokeDashoffset = CIRCUMFERENCE;
    [phaseInhalePill, phaseHold1Pill, phaseExhalePill, phaseHold2Pill].forEach(pill => {
      if (pill) pill.classList.remove('active');
    });
    if (phaseInhalePill) phaseInhalePill.classList.add('active');
  }

  function openModal() {
    if (modal) {
      modal.classList.add('active');
      startBreathing();
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('active');
      stopBreathing();
    }
  }

  if (breathingBtn) {
    breathingBtn.addEventListener('click', openModal);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   9. CONTACT FORM HANDLER
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value;
      showToast(`💌 Thank you, ${name}! Your message has been received. You are not alone, and I will reply within 24 hours.`);
      form.reset();
    });
  }
}

/* ==========================================================================
   UTILITY FUNCTIONS
   ========================================================================== */
function showToast(message) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // Enforce maximum 2 notification toasts visible at any time
  const MAX_TOASTS = 2;
  const existingToasts = Array.from(container.querySelectorAll('.toast'));
  if (existingToasts.length >= MAX_TOASTS) {
    const toRemoveCount = existingToasts.length - MAX_TOASTS + 1;
    for (let i = 0; i < toRemoveCount; i++) {
      if (existingToasts[i]) {
        existingToasts[i].remove();
      }
    }
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid fa-heart"></i> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.4s ease';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 400);
  }, 4000);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}

/* ==========================================================================
   11. THEME MANAGER (DARK / LIGHT MODE)
   ========================================================================== */
function initThemeManager() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeBtnLabel = document.getElementById('theme-btn-label');

  function getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  function applyTheme(theme, showNotification = false) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sanctuary-theme', theme);

    if (themeToggleBtn) {
      const icon = themeToggleBtn.querySelector('i');
      if (theme === 'dark') {
        if (icon) icon.className = 'fa-solid fa-moon';
        if (themeBtnLabel) themeBtnLabel.textContent = 'Dark';
        themeToggleBtn.setAttribute('title', 'Switch to Light Theme');
      } else {
        if (icon) icon.className = 'fa-solid fa-sun';
        if (themeBtnLabel) themeBtnLabel.textContent = 'Light';
        themeToggleBtn.setAttribute('title', 'Switch to Dark Theme');
      }
    }

    if (showNotification) {
      showToast(theme === 'dark' ? '🌙 Dark Mode Activated' : '☀️ Light Mode Activated');
    }
  }

  // Read saved or default to dark
  const currentTheme = localStorage.getItem('sanctuary-theme') || 'dark';
  applyTheme(currentTheme, false);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const active = getTheme();
      const nextTheme = active === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme, true);
    });
  }
}

/* ==========================================================================
   12. SCROLL SPY FOR NAVIGATION HIGHLIGHTING
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = 'hero';
    const scrollPos = window.scrollY + 140;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${current}`);
    });
  }, { passive: true });
}

/* ==========================================================================
   13. MOBILE NAVIGATION DRAWER TOGGLE
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const mainNav = document.getElementById('main-nav') || document.querySelector('.main-nav');
  const navLinks = document.querySelectorAll('.nav-link');

  if (toggleBtn && mainNav) {
    toggleBtn.addEventListener('click', () => {
      const isActive = mainNav.classList.toggle('mobile-active');
      toggleBtn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
      toggleBtn.innerHTML = isActive ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('mobile-active');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
      });
    });

    document.addEventListener('click', (e) => {
      if (!mainNav.contains(e.target) && !toggleBtn.contains(e.target) && mainNav.classList.contains('mobile-active')) {
        mainNav.classList.remove('mobile-active');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
      }
    });
  }
}

/* ==========================================================================
   14. COLLAPSIBLE FEATURE BENEFITS SHOWCASE
   ========================================================================== */
function initBenefitsShowcase() {
  const showcases = document.querySelectorAll('.feature-benefits-showcase');
  if (!showcases.length) return;

  function syncStateForViewport() {
    const isMobile = window.innerWidth <= 768;
    showcases.forEach(showcase => {
      const toggleHeader = showcase.querySelector('.showcase-header');
      if (!toggleHeader) return;

      // Only apply default if user has not manually toggled in this session
      if (!showcase.dataset.userToggled) {
        if (isMobile) {
          showcase.classList.add('is-collapsed');
          toggleHeader.setAttribute('aria-expanded', 'false');
        } else {
          showcase.classList.remove('is-collapsed');
          toggleHeader.setAttribute('aria-expanded', 'true');
        }
      }
    });
  }

  showcases.forEach(showcase => {
    const toggleHeader = showcase.querySelector('.showcase-header');
    if (!toggleHeader) return;

    toggleHeader.addEventListener('click', () => {
      showcase.dataset.userToggled = 'true';
      const isCurrentlyCollapsed = showcase.classList.contains('is-collapsed');
      showcase.classList.toggle('is-collapsed', !isCurrentlyCollapsed);
      toggleHeader.setAttribute('aria-expanded', isCurrentlyCollapsed ? 'true' : 'false');
    });

    toggleHeader.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleHeader.click();
      }
    });
  });

  // Initial sync
  syncStateForViewport();

  // Re-check on resize (debounced)
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(syncStateForViewport, 150);
  });
}



