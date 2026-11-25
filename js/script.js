document.addEventListener('DOMContentLoaded', () => {
    // =========================================================
    // 1. Toast Notification System
    // =========================================================
    const toastContainer = document.getElementById('toast-container');

    function showToast(message) {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(8px)';
            toast.style.transition = 'opacity 0.2s, transform 0.2s';
            setTimeout(() => toast.remove(), 220);
        }, 2800);
    }

    // =========================================================
    // 2. Dark Mode (Persistent via localStorage)
    // =========================================================
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle?.querySelector('.theme-icon');
    const themeText = themeToggle?.querySelector('.theme-text');

    function applyTheme(isDark) {
        document.body.classList.toggle('dark-mode', isDark);
        if (themeIcon) themeIcon.textContent = isDark ? '☀️' : '🌙';
        if (themeText) themeText.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    }

    const savedTheme = localStorage.getItem('portfolio_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(savedTheme ? savedTheme === 'dark' : prefersDark);

    themeToggle?.addEventListener('click', (e) => {
        const nextDark = !document.body.classList.contains('dark-mode');
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const commitTheme = () => {
            applyTheme(nextDark);
            localStorage.setItem('portfolio_theme', nextDark ? 'dark' : 'light');
        };

        if (!document.startViewTransition || prefersReducedMotion) {
            commitTheme();
            showToast(nextDark ? 'Dark Mode diaktifkan' : 'Light Mode diaktifkan');
            return;
        }

        const rect = themeToggle.getBoundingClientRect();
        const hasPointer = e.clientX !== 0 || e.clientY !== 0;
        const x = hasPointer ? e.clientX : rect.left + rect.width / 2;
        const y = hasPointer ? e.clientY : rect.top + rect.height / 2;
        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        document.documentElement.classList.add('theme-transitioning');

        const transition = document.startViewTransition(() => {
            commitTheme();
        });

        transition.ready.then(() => {
            document.documentElement.animate(
                {
                    clipPath: [
                        `circle(0px at ${x}px ${y}px)`,
                        `circle(${endRadius}px at ${x}px ${y}px)`
                    ]
                },
                {
                    duration: 550,
                    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                    pseudoElement: '::view-transition-new(root)'
                }
            );
        }).catch(() => {});

        transition.finished.finally(() => {
            document.documentElement.classList.remove('theme-transitioning');
            showToast(nextDark ? 'Dark Mode diaktifkan' : 'Light Mode diaktifkan');
        });
    });

    // =========================================================
    // 3. Mobile Menu, Scroll Progress, Active Nav & Back-to-Top
    // =========================================================
    const menuToggle = document.getElementById('menu-toggle');
    const navLinksWrap = document.getElementById('nav-links');
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollProgress = document.getElementById('scroll-progress');
    const backToTopBtn = document.getElementById('back-to-top');

    menuToggle?.addEventListener('click', () => {
        const isOpen = navLinksWrap.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinksWrap?.classList.remove('open');
            menuToggle?.setAttribute('aria-expanded', 'false');
        });
    });

    const trackedSections = Array.from(document.querySelectorAll('main section[id]'));

    function handleScroll() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const percent = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
        if (scrollProgress) scrollProgress.style.width = `${percent}%`;

        backToTopBtn?.classList.toggle('visible', scrollTop > 360);

        let currentId = trackedSections[0]?.id || '';
        trackedSections.forEach(sec => {
            if (scrollTop >= sec.offsetTop - 130) {
                currentId = sec.id;
            }
        });

        navLinks.forEach(link => {
            const hrefId = link.getAttribute('href')?.replace('#', '');
            link.classList.toggle('active', hrefId === currentId);
        });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    backToTopBtn?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // =========================================================
    // 4. Typing Effect di Hero
    // =========================================================
    const typingEl = document.getElementById('typing-role');
    const roles = [
        'Embedded Systems & Hardware Enthusiast',
        'Mahasiswa Sistem Komputer · Gunadarma',
        'PCB & Rangkaian Elektronika Builder',
        'C/C++ & Web Programming Learner'
    ];

    if (typingEl) {
        let roleIndex = 0;
        let charIndex = roles[0].length;
        let isDeleting = false;

        function tickTyping() {
            const current = roles[roleIndex];
            if (isDeleting) {
                charIndex--;
                typingEl.textContent = current.slice(0, charIndex);
            } else {
                charIndex++;
                typingEl.textContent = current.slice(0, charIndex);
            }

            let delay = isDeleting ? 35 : 65;

            if (!isDeleting && charIndex === current.length) {
                delay = 1800;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                delay = 350;
            }

            setTimeout(tickTyping, delay);
        }

        setTimeout(() => {
            isDeleting = true;
            tickTyping();
        }, 1800);
    }

    // =========================================================
    // 5. Scroll Reveal & Stats Counter Animation
    // =========================================================
    const revealEls = document.querySelectorAll('.reveal');
    const statNums = document.querySelectorAll('.stat-num');
    let statsAnimated = false;

    function animateStats() {
        if (statsAnimated) return;
        statsAnimated = true;

        statNums.forEach(el => {
            const target = Number(el.dataset.target || 0);
            const duration = 700;
            const start = performance.now();

            function step(now) {
                const progress = Math.min(1, (now - start) / duration);
                el.textContent = String(Math.round(target * progress));
                if (progress < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        });
    }

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    if (entry.target.classList.contains('stats-bar')) {
                        animateStats();
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        revealEls.forEach(el => observer.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('is-visible'));
        animateStats();
    }

    // =========================================================
    // 6. Copy to Clipboard (NPM & Email)
    // =========================================================
    document.querySelectorAll('[data-copy]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const text = btn.getAttribute('data-copy');
            if (!text) return;

            try {
                await navigator.clipboard.writeText(text);
                showToast(`Disalin ke clipboard: ${text}`);
            } catch {
                showToast(`Salin manual: ${text}`);
            }
        });
    });

    // =========================================================
    // 7. Filter & Search Projects
    // =========================================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('project-search');
    const projectCards = document.querySelectorAll('.proyek-card');
    const emptyState = document.getElementById('proyek-empty');
    let activeFilter = 'all';

    function updateProjectsVisibility() {
        const keyword = (searchInput?.value || '').trim().toLowerCase();
        let visibleCount = 0;

        projectCards.forEach(card => {
            const status = card.dataset.status || '';
            const tags = (card.dataset.tags || '').toLowerCase();
            const text = card.textContent.toLowerCase();

            const matchesFilter = activeFilter === 'all' || status === activeFilter;
            const matchesSearch = !keyword || tags.includes(keyword) || text.includes(keyword);

            const isVisible = matchesFilter && matchesSearch;
            card.hidden = !isVisible;
            if (isVisible) visibleCount++;
        });

        if (emptyState) {
            emptyState.hidden = visibleCount > 0;
        }
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            activeFilter = btn.dataset.filter || 'all';
            filterButtons.forEach(b => {
                const active = b === btn;
                b.classList.toggle('active', active);
                b.setAttribute('aria-selected', String(active));
            });
            updateProjectsVisibility();
        });
    });

    searchInput?.addEventListener('input', updateProjectsVisibility);

    // =========================================================
    // 8. Lightbox Modal Gallery (Next / Prev / Keyboard)
    // =========================================================
    const projectGalleries = {
        alarm: [
            { src: 'Alarm depan.jpg', caption: 'Prototipe Alarm Pintu — Tampak Depan' },
            { src: 'Alarm belakang.jpg', caption: 'Prototipe Alarm Pintu — Tampak Belakang (Solder PCB)' }
        ],
        dadu: [
            { src: 'Dadu Depan.jpeg', caption: 'Prototipe Dadu Digital — Tampak Depan' },
            { src: 'dadu belakang.jpg', caption: 'Prototipe Dadu Digital — Tampak Belakang' }
        ],
        lighting: [
            { src: 'auto lighting.jpeg', caption: 'Auto Lighting Control — Rangkaian Sensor LDR' }
        ]
    };

    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const modalCaption = document.getElementById('modal-caption');
    const modalCounter = document.getElementById('modal-counter');
    const modalClose = document.getElementById('modal-close');
    const modalPrev = document.getElementById('modal-prev');
    const modalNext = document.getElementById('modal-next');

    let currentGallery = [];
    let currentImgIndex = 0;

    function renderModalImage() {
        if (!currentGallery.length) return;
        const item = currentGallery[currentImgIndex];
        modalImg.src = item.src;
        modalImg.alt = item.caption;
        modalCaption.textContent = item.caption;
        modalCounter.textContent = `${currentImgIndex + 1} / ${currentGallery.length}`;

        const showNav = currentGallery.length > 1;
        if (modalPrev) modalPrev.hidden = !showNav;
        if (modalNext) modalNext.hidden = !showNav;
    }

    function openModal(projectKey, index) {
        currentGallery = projectGalleries[projectKey] || [];
        if (!currentGallery.length || !modal) return;
        currentImgIndex = Math.max(0, Math.min(index, currentGallery.length - 1));
        renderModalImage();
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        if (!modal) return;
        modal.hidden = true;
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.img-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const projectKey = trigger.dataset.project;
            const index = Number(trigger.dataset.index || 0);
            openModal(projectKey, index);
        });
    });

    modalClose?.addEventListener('click', closeModal);
    modalPrev?.addEventListener('click', () => {
        if (currentGallery.length < 2) return;
        currentImgIndex = (currentImgIndex - 1 + currentGallery.length) % currentGallery.length;
        renderModalImage();
    });
    modalNext?.addEventListener('click', () => {
        if (currentGallery.length < 2) return;
        currentImgIndex = (currentImgIndex + 1) % currentGallery.length;
        renderModalImage();
    });

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (!modal || modal.hidden) return;
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowLeft') modalPrev?.click();
        if (e.key === 'ArrowRight') modalNext?.click();
    });

    // =========================================================
    // 9. Lab Simulator Prototipe Virtual
    // =========================================================
    const simTabs = document.querySelectorAll('.sim-tab');
    const simPanels = document.querySelectorAll('.sim-panel');

    function switchSimulator(simId) {
        simTabs.forEach(tab => {
            const active = tab.dataset.simTab === simId;
            tab.classList.toggle('active', active);
            tab.setAttribute('aria-selected', String(active));
        });
        simPanels.forEach(panel => {
            panel.classList.toggle('active', panel.id === `sim-${simId}`);
        });
    }

    simTabs.forEach(tab => {
        tab.addEventListener('click', () => switchSimulator(tab.dataset.simTab));
    });

    document.querySelectorAll('.sim-jump').forEach(btn => {
        btn.addEventListener('click', () => {
            const simId = btn.dataset.sim;
            switchSimulator(simId);
            document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // --- 9A. Dadu Digital Simulator (7-Segment LED Display) ---
    const sevenSegMap = {
        1: ['b', 'c'],
        2: ['a', 'b', 'g', 'e', 'd'],
        3: ['a', 'b', 'g', 'c', 'd'],
        4: ['f', 'g', 'b', 'c'],
        5: ['a', 'f', 'g', 'c', 'd'],
        6: ['a', 'f', 'g', 'e', 'c', 'd']
    };

    const segElements = document.querySelectorAll('#seven-seg .seg[data-seg]');
    const diceValueEl = document.getElementById('dice-value');
    const btnRollDice = document.getElementById('btn-roll-dice');
    const btnResetDice = document.getElementById('btn-reset-dice');
    const diceLogEl = document.getElementById('dice-log');
    const diceHistory = [];
    let diceTimer = null;

    function renderDice(num) {
        const activeSegments = sevenSegMap[num] || [];
        segElements.forEach(seg => {
            const name = seg.dataset.seg;
            seg.classList.toggle('on', activeSegments.includes(name));
        });
        if (diceValueEl) diceValueEl.textContent = String(num);
    }

    renderDice(6);

    btnRollDice?.addEventListener('click', () => {
        if (diceTimer) return;
        btnRollDice.disabled = true;
        let ticks = 0;

        diceTimer = setInterval(() => {
            const tempVal = Math.floor(Math.random() * 6) + 1;
            renderDice(tempVal);
            ticks++;

            if (ticks >= 12) {
                clearInterval(diceTimer);
                diceTimer = null;
                btnRollDice.disabled = false;

                const finalVal = Math.floor(Math.random() * 6) + 1;
                renderDice(finalVal);

                diceHistory.unshift(finalVal);
                if (diceHistory.length > 6) diceHistory.pop();
                if (diceLogEl) {
                    diceLogEl.innerHTML = `Riwayat lemparan: <span class="mono-val">${diceHistory.join(' · ')}</span>`;
                }
            }
        }, 65);
    });

    btnResetDice?.addEventListener('click', () => {
        if (diceTimer) {
            clearInterval(diceTimer);
            diceTimer = null;
            if (btnRollDice) btnRollDice.disabled = false;
        }
        diceHistory.length = 0;
        renderDice(6);
        if (diceLogEl) {
            diceLogEl.innerHTML = 'Riwayat lemparan: <span class="mono-val">-</span>';
        }
    });

    // --- 9B. Auto Lighting Control (LDR) Simulator ---
    const ldrSlider = document.getElementById('ldr-slider');
    const potSlider = document.getElementById('pot-slider');
    const ldrValEl = document.getElementById('ldr-val');
    const potValEl = document.getElementById('pot-val');
    const roomBox = document.getElementById('room-box');
    const relayStatusEl = document.getElementById('relay-status');

    function updateLightingSim() {
        if (!ldrSlider || !potSlider) return;
        const lightLevel = Number(ldrSlider.value);
        const threshold = Number(potSlider.value);

        if (ldrValEl) ldrValEl.textContent = `${lightLevel}%`;
        if (potValEl) potValEl.textContent = `${threshold}%`;

        const isDarkRoom = lightLevel < threshold;
        roomBox?.classList.toggle('dark-room', lightLevel < 50);
        roomBox?.classList.toggle('lamp-on', isDarkRoom);

        if (relayStatusEl) {
            relayStatusEl.textContent = isDarkRoom
                ? 'RELAY: ON (Gelap · Lampu Menyala)'
                : 'RELAY: OFF (Terang · Lampu Mati)';
        }
    }

    ldrSlider?.addEventListener('input', updateLightingSim);
    potSlider?.addEventListener('input', updateLightingSim);
    updateLightingSim();

    // --- 9C. Alarm Pintu Simulator ---
    const btnArmAlarm = document.getElementById('btn-arm-alarm');
    const btnToggleDoor = document.getElementById('btn-toggle-door');
    const btnMuteAlarm = document.getElementById('btn-mute-alarm');
    const alarmBox = document.getElementById('alarm-box');
    const doorStateText = document.getElementById('door-state-text');
    const buzzerWave = document.getElementById('buzzer-wave');

    let isArmed = true;
    let isDoorOpen = false;
    let isSoundEnabled = true;
    let audioCtx = null;
    let beepInterval = null;

    function playBeep() {
        if (!isSoundEnabled) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;

        if (!audioCtx) audioCtx = new AudioContextClass();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.16);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.17);
    }

    function stopBuzzerLoop() {
        if (beepInterval) {
            clearInterval(beepInterval);
            beepInterval = null;
        }
    }

    function updateAlarmSim() {
        const triggered = isArmed && isDoorOpen;
        alarmBox?.classList.toggle('triggered', triggered);

        if (btnArmAlarm) {
            btnArmAlarm.textContent = isArmed ? 'Status: Armed' : 'Status: Disarmed';
        }
        if (btnToggleDoor) {
            btnToggleDoor.textContent = isDoorOpen ? 'Tutup Pintu' : 'Buka Pintu';
        }
        if (doorStateText) {
            const doorStr = isDoorOpen ? 'PINTU TERBUKA' : 'PINTU TERTUTUP';
            const armStr = isArmed ? 'SISTEM ARMED' : 'SISTEM DISARMED';
            doorStateText.textContent = `${doorStr} · ${armStr}`;
        }
        if (buzzerWave) {
            buzzerWave.textContent = triggered ? 'BUZZER: (PERINGATAN)' : 'BUZZER: DIAM';
        }

        if (triggered) {
            if (!beepInterval) {
                playBeep();
                beepInterval = setInterval(playBeep, 550);
            }
        } else {
            stopBuzzerLoop();
        }
    }

    btnArmAlarm?.addEventListener('click', () => {
        isArmed = !isArmed;
        updateAlarmSim();
    });

    btnToggleDoor?.addEventListener('click', () => {
        isDoorOpen = !isDoorOpen;
        updateAlarmSim();
    });

    btnMuteAlarm?.addEventListener('click', () => {
        isSoundEnabled = !isSoundEnabled;
        btnMuteAlarm.textContent = isSoundEnabled ? '🔊 Suara: ON' : '🔇 Suara: OFF';
        if (!isSoundEnabled) stopBuzzerLoop();
        else updateAlarmSim();
    });

    updateAlarmSim();

    // =========================================================
    // 10. Skill & Tools Interactive Inspector
    // =========================================================
    const skillBadges = document.querySelectorAll('.fokus-badge');
    const skillDetailText = document.getElementById('skill-detail-text');

    skillBadges.forEach(badge => {
        badge.addEventListener('click', () => {
            skillBadges.forEach(b => b.classList.remove('active'));
            badge.classList.add('active');
            const info = badge.dataset.info || '';
            if (skillDetailText) {
                skillDetailText.innerHTML = `<strong>${badge.textContent}:</strong> ${info}`;
            }
        });
    });

    // =========================================================
    // 11. Contact Form & Download CV Toast
    // =========================================================
    const contactForm = document.getElementById('contact-form');

    contactForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('sender-name')?.value.trim();
        const topic = document.getElementById('sender-topic')?.value;
        const msg = document.getElementById('sender-msg')?.value.trim();

        if (!name || !msg) {
            showToast('Mohon lengkapi nama dan pesan terlebih dahulu.');
            return;
        }

        const subject = encodeURIComponent(`[Portofolio] ${topic} - dari ${name}`);
        const body = encodeURIComponent(`Halo Anggraito,\n\nNama: ${name}\nTopik: ${topic}\n\nPesan:\n${msg}`);
        showToast('Membuka aplikasi email dengan draf pesan...');
        window.location.href = `mailto:angraitohusodo@gmail.com?subject=${subject}&body=${body}`;
        contactForm.reset();
    });

    document.querySelectorAll('.btn-download').forEach(btn => {
        btn.addEventListener('click', () => {
            showToast('Terima kasih! Mengunduh CV Anggraito Husodo...');
        });
    });
});
