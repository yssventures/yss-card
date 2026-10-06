// /card: the moving parts. Everything has a still version: with reduced motion, without JavaScript,
// or if GSAP fails to load, the page shows the same words as plain text.
// Add ?motion to the address to see the motion on a device that has it switched off.
(function () {
  var root = document.documentElement;
  var force = /[?&]motion\b/.test(location.search);
  var reduce = !force && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  root.classList.add("motion");

  function inView(el, onIn, onOut, margin) {
    if (!("IntersectionObserver" in window)) { onIn(); return; }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) onIn(); else if (onOut) onOut(); });
    }, { rootMargin: margin || "0px" }).observe(el);
  }

  // ---------- By hand, and with a system: the same rows, two speeds ----------
  var manual = document.getElementById("pane-manual");
  var auto = document.getElementById("pane-auto");
  if (manual && auto) {
    var mRows = manual.querySelectorAll(".rows li"), aRows = auto.querySelectorAll(".rows li");
    var mChip = document.getElementById("chip-manual"), aChip = document.getElementById("chip-auto");
    var mCount = document.getElementById("count-manual");
    var timers = [], looping = false;
    var at = function (ms, fn) { timers.push(setTimeout(fn, ms)); };
    var reset = function () {
      timers.forEach(clearTimeout); timers = [];
      [].forEach.call(mRows, function (r) { r.classList.remove("filled", "typing"); r.querySelectorAll(".c i").forEach(function (i) { i.style.transition = "none"; i.style.transform = "scaleX(0)"; }); });
      [].forEach.call(aRows, function (r) { r.classList.remove("filled"); r.querySelectorAll(".c i").forEach(function (i) { i.style.transition = "none"; i.style.transform = "scaleX(0)"; }); });
    };
    var cycle = function () {
      reset();
      mChip.textContent = "Typing"; aChip.textContent = "Running"; mCount.textContent = "0 of " + mRows.length + " rows";
      // The system: every row in under two seconds, then the next-day check
      [].forEach.call(aRows, function (r, k) {
        at(400 + k * 260, function () {
          r.querySelectorAll(".c i").forEach(function (i) { i.style.transition = "transform 0.35s cubic-bezier(0.22,1,0.36,1)"; i.style.transform = "scaleX(1)"; });
          setTimeout(function () { r.classList.add("filled"); }, 300);
        });
      });
      at(400 + aRows.length * 260 + 500, function () { aChip.textContent = "Posted"; });
      at(400 + aRows.length * 260 + 1900, function () { aChip.textContent = "Checked next day"; });
      // By hand: one cell at a time, with a caret, and only part of the way before the loop restarts
      var tm = 600;
      [].forEach.call(mRows, function (r, k) {
        var cells = r.querySelectorAll(".c");
        cells.forEach(function (c, j) {
          var dur = 700 + j * 250;
          at(tm, function () {
            r.classList.add("typing");
            var caret = manual.querySelector(".caret"); c.appendChild(caret);
            var i = c.querySelector("i");
            i.style.transition = "transform " + dur + "ms linear"; i.style.transform = "scaleX(1)";
            caret.style.transition = "left " + dur + "ms linear"; caret.style.left = "0"; void caret.offsetWidth; caret.style.left = "100%";
          });
          tm += dur + 120;
        });
        at(tm, function () { r.classList.remove("typing"); r.classList.add("filled"); mCount.textContent = (k + 1) + " of " + mRows.length + " rows"; });
        tm += 250;
      });
      at(9800, function () { if (looping) cycle(); });
    };
    inView(manual.parentElement, function () { if (!looping) { looping = true; cycle(); } }, function () { looping = false; reset(); }, "0px 0px -15% 0px");
  }

  // ---------- Scroll-linked parts, with GSAP ----------
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  // The statement lights up word by word as it is read
  var st = document.querySelector(".scrub");
  if (st) {
    var words = [];
    st.childNodes.forEach(function (node) {
      if (node.nodeType !== 3) return;
      var frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
        var w = document.createElement("span"); w.className = "w"; w.textContent = part; frag.appendChild(w); words.push(w);
      });
      st.replaceChild(frag, node);
    });
    gsap.fromTo(words, { opacity: 0.16 }, { opacity: 1, ease: "none", stagger: 0.1,
      scrollTrigger: { trigger: st, start: "top 80%", end: "bottom 45%", scrub: true } });
  }

  // How it starts: the line fills as you scroll past the steps
  var starts = document.querySelector(".starts");
  if (starts) {
    ScrollTrigger.create({ trigger: starts, start: "top 75%", end: "bottom 60%", scrub: true,
      onUpdate: function (s) { starts.style.setProperty("--p", s.progress.toFixed(3)); } });
    starts.style.setProperty("--p", "0");
  }

  // The proof name and the closing line grow into place
  gsap.utils.toArray(".grow").forEach(function (el) {
    gsap.fromTo(el, { scale: 0.88, opacity: 0.3 }, { scale: 1, opacity: 1, ease: "none",
      scrollTrigger: { trigger: el, start: "top 92%", end: "top 50%", scrub: true } });
  });
})();
