// public/js/main.js
// Keep existing behavior + add premium touches (theme, scroll shadow, esc close)

(function () {
    const backdrop = document.querySelector(".backdrop");
    const sideDrawer = document.querySelector(".mobile-nav");
    const menuToggle = document.querySelector("#side-menu-toggle");

    function openDrawer() {
        if (!backdrop || !sideDrawer) return;
        backdrop.style.display = "block";
        sideDrawer.classList.add("open");
        document.documentElement.style.overflow = "hidden";
    }

    function closeDrawer() {
        if (!backdrop || !sideDrawer) return;
        backdrop.style.display = "none";
        sideDrawer.classList.remove("open");
        document.documentElement.style.overflow = "";
    }

    if (backdrop) backdrop.addEventListener("click", closeDrawer);
    if (menuToggle) menuToggle.addEventListener("click", openDrawer);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeDrawer();
    });

    const header = document.querySelector(".main-header");
    const onScroll = () => {
        if (!header) return;
        if (window.scrollY > 6) {
            header.style.boxShadow = "var(--shadow-soft)";
        } else {
            header.style.boxShadow = "none";
        }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const THEME_KEY = "express_shop_theme";
    const themeToggle = document.querySelector('[data-theme-toggle="1"]');

    function setTheme(theme) {
        const t = theme === "light" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", t);
        try {
            localStorage.setItem(THEME_KEY, t);
        } catch (_) {}
        if (themeToggle) {
            const label = themeToggle.querySelector(".theme-toggle__label");
            if (label) label.textContent = t === "light" ? "Light" : "Dark";
        }
    }

    function initTheme() {
        let saved = null;
        try {
            saved = localStorage.getItem(THEME_KEY);
        } catch (_) {}
        if (saved === "light" || saved === "dark") return setTheme(saved);

        const prefersLight =
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: light)").matches;
        setTheme(prefersLight ? "light" : "dark");
    }

    initTheme();

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const current = document.documentElement.getAttribute("data-theme");
            setTheme(current === "light" ? "dark" : "light");
        });
    }
})();

(() => {
    const fields = document.querySelectorAll("[data-file-field]");
    if (!fields.length) return;

    fields.forEach((field) => {
        const input = field.querySelector('input[type="file"]');
        const nameEl = field.querySelector("[data-file-name]");
        if (!input || !nameEl) return;

        const setName = () => {
            const file = input.files && input.files[0];
            if (!file) {
                nameEl.textContent = "No file selected";
                field.classList.remove("is-active");
                field.classList.remove("is-invalid");
                return;
            }

            nameEl.textContent = file.name;
            field.classList.add("is-active");

            const ok = /image\/(png|jpeg|jpg)/i.test(file.type);
            field.classList.toggle("is-invalid", !ok);
        };

        input.addEventListener("change", setName);
        setName();
    });
})();
