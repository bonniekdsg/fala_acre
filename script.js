const revealTargets = [
    [".brand", "reveal-left", 0],
    [".header-action", "reveal-right", 180],
    [".hero-visual", "reveal-right", 260],
    [".eyebrow", "reveal-left", 420],
    [".hero-title", "reveal-left", 640],
    [".hero h2", "reveal-left", 860],
    [".hero-actions", "reveal-left", 1080],
    [".hero-person", "reveal-scale", 1240],
    [".info-card", "reveal-scale", 240],
    [".form-heading", "reveal", 0],
    [".field-block", "reveal", 0],
    [".theme-section", "reveal", 0],
    [".axis-card", "reveal-scale", 0],
    [".auth-section", "reveal", 0],
    [".auth-card", "reveal-scale", 0],
    [".submit-area", "reveal", 0],
    [".footer-brand", "reveal-left", 0],
    [".site-footer nav", "reveal", 120],
    [".footer-contact", "reveal-right", 220]
];

const revealElements = [];
let scrollFrame = null;

revealTargets.forEach(([selector, effect, baseDelay]) => {
    document.querySelectorAll(selector).forEach((element, index) => {
        element.classList.add("reveal", effect);
        const stepDelay = selector === ".info-card" ? 260 : 140;
        element.style.setProperty("--reveal-delay", `${baseDelay + Math.min(index, 6) * stepDelay}ms`);
        revealElements.push(element);
    });
});

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px"
    });

    revealElements.forEach((element) => revealObserver.observe(element));
} else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
}

function easeInOutCubic(progress) {
    return progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

function smoothScrollToTarget(target, duration = 1450) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        target.scrollIntoView({ block: "start" });
        return;
    }

    if (scrollFrame) {
        cancelAnimationFrame(scrollFrame);
    }

    document.documentElement.classList.add("is-programmatic-scroll");

    const scroller = document.scrollingElement || document.documentElement;
    const headerOffset = document.querySelector(".site-header")?.offsetHeight || 0;
    const start = scroller.scrollTop;
    const targetTop = target.getBoundingClientRect().top + start - headerOffset - 16;
    const maxScroll = scroller.scrollHeight - window.innerHeight;
    const end = Math.max(0, Math.min(targetTop, maxScroll));
    const distance = end - start;
    const startTime = performance.now();

    function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        scroller.scrollTop = start + distance * easeInOutCubic(progress);

        if (progress < 1) {
            scrollFrame = requestAnimationFrame(step);
            return;
        }

        scroller.scrollTop = end;
        scrollFrame = null;
        document.documentElement.classList.remove("is-programmatic-scroll");
    }

    scrollFrame = requestAnimationFrame(step);
}

document.querySelectorAll(".header-action, .primary-button").forEach((button) => {
    button.addEventListener("click", (event) => {
        const targetId = button.getAttribute("href");
        const target = targetId ? document.querySelector(targetId) : null;

        if (!target) {
            return;
        }

        event.preventDefault();
        smoothScrollToTarget(target);
    });
});

document.querySelectorAll(".auth-card input").forEach((input) => {
    input.addEventListener("change", () => {
        document.querySelectorAll(".auth-card").forEach((card) => {
            card.classList.toggle("selected", card.contains(input) && input.checked);
        });
    });
});

document.querySelector(".survey-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const button = event.currentTarget.querySelector("button[type='submit']");
    const originalText = button.textContent.trim();

    button.disabled = true;
    button.textContent = "Contribuição registrada";

    window.setTimeout(() => {
        button.disabled = false;
        button.textContent = originalText;
    }, 2200);
});
