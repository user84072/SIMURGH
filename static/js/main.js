document.addEventListener("DOMContentLoaded", () => {
  // ---------- math ----------
  if (window.renderMathInElement) {
    renderMathInElement(document.body, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
      ],
      ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
    });
  }

  // ---------- placeholders for media that isn't uploaded yet ----------
  const markMissing = (slot) => slot.classList.add("slot-missing");

  document.querySelectorAll(".video-slot").forEach((slot) => {
    const video = slot.querySelector("video");
    if (!video) return;
    const sources = video.querySelectorAll("source");
    const last = sources[sources.length - 1];
    if (last) last.addEventListener("error", () => markMissing(slot));
    video.addEventListener("error", () => markMissing(slot));
    // The error may already have fired before this deferred script ran.
    if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) markMissing(slot);

    if (slot.dataset.speed) {
      const badge = document.createElement("span");
      badge.className = "speed-badge";
      badge.textContent = slot.dataset.speed;
      slot.appendChild(badge);
    }
  });

  document.querySelectorAll(".img-slot").forEach((slot) => {
    const img = slot.querySelector("img");
    if (!img) return;
    img.addEventListener("error", () => markMissing(slot));
    if (img.complete && img.naturalWidth === 0) markMissing(slot);
  });

  // ---------- autoplaying clips only play while on screen ----------
  const autoplayers = document.querySelectorAll("video[autoplay]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) target.play().catch(() => {});
        else target.pause();
      });
    }, { threshold: 0.25 });
    autoplayers.forEach((v) => io.observe(v));
  }

  // ---------- tabs ----------
  document.querySelectorAll(".tabs").forEach((tabs) => {
    const section = tabs.closest("section");
    tabs.querySelectorAll(".tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        tabs.querySelectorAll(".tab").forEach((b) => b.classList.toggle("active", b === btn));
        section.querySelectorAll(".tab-panel").forEach((panel) => {
          const active = panel.dataset.panel === btn.dataset.tab;
          panel.classList.toggle("active", active);
          if (!active) panel.querySelectorAll("video").forEach((v) => v.pause());
        });
      });
    });
  });

  // ---------- copy bibtex ----------
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = document.querySelector(btn.dataset.copy).innerText;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "Copied!";
      } catch {
        btn.textContent = "Select & copy";
      }
      setTimeout(() => (btn.textContent = "Copy"), 1500);
    });
  });
});
