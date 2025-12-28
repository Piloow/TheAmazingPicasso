// Logo qui rétrécit au scroll
(function () {
    const THRESHOLD = 40;

    function onScroll() {
        if (window.scrollY > THRESHOLD) {
            document.body.classList.add('scrolled');
        } else {
            document.body.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', onScroll);
    onScroll();
})();

// Scroll to top quand on clique sur le logo (sur la page d'accueil)
(function () {
    const logoLink = document.querySelector('.logo-link');
    if (!logoLink) return;

    logoLink.addEventListener('click', (e) => {
        const href = logoLink.getAttribute('href') || '';
        const isHomeAnchor = href === '#top' || href === '';

        if (isHomeAnchor) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
})();

// Parallax tout simple sur les éléments avec data-parallax
(function () {
    const elements = document.querySelectorAll('[data-parallax]');
    if (!elements.length) return;

    function updateParallax() {
        const scrollY = window.scrollY || window.pageYOffset;
        elements.forEach((el) => {
            const speed = parseFloat(el.getAttribute('data-parallax')) || 0;
            el.style.transform = `translateY(${scrollY * speed}px)`;
        });
    }

    window.addEventListener('scroll', updateParallax);
    updateParallax();
})();

// Apparition au scroll (IntersectionObserver)
(function () {
    const reveals = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || !reveals.length) {
        reveals.forEach((el) => el.classList.add('reveal-visible'));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.18 }
    );

    reveals.forEach((el) => observer.observe(el));
})();

// Carte verrouillée (ToolBox) avec code secret
(function () {
    const lockedCard = document.querySelector('.nav-card-locked[data-locked="true"]');
    if (!lockedCard) return;

    lockedCard.addEventListener('click', function (e) {
        e.preventDefault();

        const message =
            "Ne sois pas pressé·e et garde le meilleur pour la fin. " +
            "Une lettre est cachée dans chaque autre page…\n\n" +
            "Si vraimeeeeent vous l'avez pas, passez en DM ;)\n\n" +
            "Entre le code pour déverrouiller :";

        const input = window.prompt(message, "");

        if (!input) return;

        if (input.trim().toLowerCase() === "wikipic!".toLowerCase()) {
            const target = lockedCard.getAttribute("href") || "toolbox.html";
            window.location.href = target;
        } else {
            window.alert(
                "Ce n'est pas le bon code. Continue d'explorer les autres pages, le message est là 😉"
            );
        }
    });
})();

// Effet carte 3D sur la photo de profil (souris + scroll)
(function () {
    const card = document.querySelector('.profile-photo-card');
    if (!card) return;

    const frame = card.querySelector('.profile-photo-frame');
    const photo = card.querySelector('.profile-photo');
    if (!frame || !photo) return;

    const maxRotate = 12; // en degrés

    let pointerRotateX = 0;
    let pointerRotateY = 0;
    let scrollRotateX = 0;

    function applyTransform() {
        const totalRotateX = pointerRotateX + scrollRotateX;
        const totalRotateY = pointerRotateY;

        frame.style.transform =
            `rotateX(${totalRotateX}deg) rotateY(${totalRotateY}deg) translateZ(10px)`;

        const hasTilt =
            Math.abs(totalRotateX) > 0.2 || Math.abs(totalRotateY) > 0.2;

        photo.style.transform = hasTilt ? 'scale(1.04)' : 'scale(1)';
    }

    // Tilt souris (desktop)
    function handleMove(e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const percentX = (x - centerX) / centerX;
        const percentY = (y - centerY) / centerY;

        pointerRotateY = percentX * maxRotate;
        pointerRotateX = -percentY * maxRotate;

        applyTransform();
    }

    function reset() {
        pointerRotateX = 0;
        pointerRotateY = 0;
        applyTransform();
    }

    // Tilt au scroll (tous appareils)
    function handleScrollTilt() {
        const rect = card.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

        const centerY = rect.top + rect.height / 2;
        const offset = (centerY - viewportHeight / 2) / (viewportHeight / 2);

        scrollRotateX = Math.max(-1, Math.min(1, offset)) * (maxRotate * 0.5);

        applyTransform();
    }

    const isPointerFine = window.matchMedia('(pointer: fine)').matches;

    if (isPointerFine) {
        card.addEventListener('mousemove', handleMove);
        card.addEventListener('mouseleave', reset);
    }

    window.addEventListener('scroll', handleScrollTilt);
    window.addEventListener('resize', handleScrollTilt);
    handleScrollTilt();
})();

// Badge Case : open/close + focus modal (12 badges)
(function () {
    const toggle = document.querySelector('.badge-case-toggle');
    const badgeCase = document.querySelector('.badge-case');
    if (!toggle || !badgeCase) return;

    const modal = document.getElementById('badgeModal');
    const modalTitle = document.getElementById('badgeModalTitle');
    const metaSemester = document.getElementById('badgeMetaSemester');
    const metaRole = document.getElementById('badgeMetaRole');
    const metaDesc = document.getElementById('badgeMetaDesc');
    const hero = document.getElementById('badgeHero');
    const heroImg = document.getElementById('badgeHeroImg');
    const variantBtn = document.getElementById('badgeVariantBtn');

    let baseSrc = '';
    let variantSrc = '';
    let showingVariant = false;

    const openModal = () => {
        if (!modal) return;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.documentElement.style.overflow = 'hidden';
    };

    const closeModal = () => {
        if (!modal) return;
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.documentElement.style.overflow = '';
        if (hero) hero.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0)';
        baseSrc = '';
        variantSrc = '';
        showingVariant = false;

        if (variantBtn) {
            variantBtn.hidden = true;
            variantBtn.textContent = 'Variante';
        }
    };

    // Open/close badge case
    const toggleCase = () => {
        const isOpen = badgeCase.getAttribute('data-open') === 'true';
        badgeCase.setAttribute('data-open', isOpen ? 'false' : 'true');
        toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    };

    toggle.addEventListener('click', (e) => {
        // ❗ Si on clique sur un badge, on ne toggle PAS la boîte
        if (e.target.closest('[data-badge]')) return;
        toggleCase();
    });

    toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleCase();
        }
    });

    // Badge click => focus modal
    badgeCase.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-badge]');
        if (!btn) return;
        if (btn.classList.contains('badge-slot-empty')) return;

        const img = btn.querySelector('img');
        if (!img) return;

        const title = btn.getAttribute('data-title') || 'Badge';
        const semester = btn.getAttribute('data-semester') || '—';
        const role = btn.getAttribute('data-role') || '—';
        const desc = btn.getAttribute('data-desc') || '—';

        if (modalTitle) modalTitle.textContent = title;
        if (metaSemester) metaSemester.textContent = semester;
        if (metaRole) metaRole.textContent = role;
        if (metaDesc) metaDesc.textContent = desc;

        baseSrc = img.getAttribute('src') || '';

        if (heroImg) {
            heroImg.src = baseSrc;
            heroImg.alt = img.getAttribute('alt') || title;
        }

        variantSrc = btn.getAttribute('data-variant-src') || '';
        showingVariant = false;

        if (variantBtn) {
            if (variantSrc) {
                variantBtn.hidden = false;
                variantBtn.textContent = btn.getAttribute('data-variant-label') || 'Variante';
            } else {
                variantBtn.hidden = true;
                variantBtn.textContent = 'Variante';
            }
        }

        openModal();
    });

    if (variantBtn) {
        variantBtn.addEventListener('click', () => {
            if (!variantSrc || !heroImg) return;

            showingVariant = !showingVariant;
            heroImg.src = showingVariant ? variantSrc : baseSrc;
        });
    }

    // Close handlers
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.closest('[data-badge-close]')) closeModal();
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
        });
    }

    // ✅ Shiny tilt follow mouse (modal) - follow la souris SUR TOUTE LA PAGE quand le focus est ouvert
    if (hero && modal) {
        const maxRotate = 28; // amplitude augmentée (tilt plus marqué)
        const zDepth = 16;
        const damping = 0.14; // plus petit = plus smooth, plus grand = plus réactif

        const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
        const lerp = (a, b, t) => a + (b - a) * t;

        let targetRX = 0;
        let targetRY = 0;
        let currentRX = 0;
        let currentRY = 0;
        let rafId = null;

        const setTargetsFromPointer = (clientX, clientY) => {
            const rect = hero.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;

            // Zone large pour que ça suive même à côté
            const denomX = Math.max(420, rect.width * 1.9);
            const denomY = Math.max(420, rect.height * 1.9);

            const nx = (clientX - cx) / denomX;
            const ny = (clientY - cy) / denomY;

            const px = clamp(nx, -1, 1);
            const py = clamp(ny, -1, 1);

            targetRY = px * maxRotate;
            targetRX = -py * maxRotate;
        };

        const apply = () => {
            // On n'anime que si le modal est ouvert
            if (!modal.classList.contains('is-open')) {
                // reset progressif vers 0
                targetRX = 0;
                targetRY = 0;
            }

            currentRX = lerp(currentRX, targetRX, damping);
            currentRY = lerp(currentRY, targetRY, damping);

            // Snap quand on est très proche (évite micro-jitter)
            if (Math.abs(currentRX - targetRX) < 0.01) currentRX = targetRX;
            if (Math.abs(currentRY - targetRY) < 0.01) currentRY = targetRY;

            hero.style.transform =
                `rotateX(${currentRX}deg) rotateY(${currentRY}deg) translateZ(${zDepth}px)`;

            rafId = requestAnimationFrame(apply);
        };

        const start = () => {
            if (rafId != null) return;
            rafId = requestAnimationFrame(apply);
        };

        const stop = () => {
            if (rafId == null) return;
            cancelAnimationFrame(rafId);
            rafId = null;
        };

        // Suivi global sur TOUTE la page (pas seulement le panel)
        const onMoveGlobal = (e) => {
            if (!modal.classList.contains('is-open')) return;
            setTargetsFromPointer(e.clientX, e.clientY);
        };

        const onLeaveWindow = () => {
            // Reset mais en douceur (via lerp)
            targetRX = 0;
            targetRY = 0;
        };

        window.addEventListener('mousemove', onMoveGlobal, { passive: true });
        window.addEventListener('blur', onLeaveWindow);

        // Démarre l'animation en continu (léger mais très smooth)
        start();

        // Safety: stop si la page est cachée
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stop();
            else start();
        });

        // Important: si le modal se ferme, on reset immédiatement (sans attendre)
        const observer = new MutationObserver(() => {
            if (!modal.classList.contains('is-open')) {
                targetRX = 0;
                targetRY = 0;
            }
        });
        observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
    }
})();