const root = document.documentElement;
const toggle = document.getElementById("themeToggle");

// Load saved theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
    root.setAttribute("data-theme", savedTheme);
    toggle.textContent = savedTheme === "dark" ? "☀️" : "🌙";
}

toggle.addEventListener("click", () => {
    const current = root.getAttribute("data-theme");
    if (current === "dark") {
        root.removeAttribute("data-theme");
        localStorage.setItem("theme", "light");
        toggle.textContent = "🌙";
    } else {
        root.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
        toggle.textContent = "☀️";
    }
});
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".toggle-password").forEach(icon => {
        icon.addEventListener("click", () => {
            const input = icon.previousElementSibling;

            if (input.type === "password") {
                input.type = "text";
                icon.textContent = "👁️";
            } else {
                input.type = "password";
                icon.textContent = "🙈";
            }
        });
    });
});
