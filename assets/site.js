// YSS Ventures: reveals on scroll, and the product shot working through real jobs.
// Everything is readable without JavaScript and with reduced motion.
(function () {
  document.documentElement.classList.add("js");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Sections come up as they reach the screen
  var items = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) {
      var group = el.parentElement && el.parentElement.querySelectorAll(":scope > .reveal");
      if (group && group.length > 1) el.style.transitionDelay = Array.prototype.indexOf.call(group, el) * 80 + "ms";
      io.observe(el);
    });
  }

  // The product shot: five jobs YSS has delivered, run one after another (an illustration)
  var rows = document.querySelectorAll("#steps li");
  if (reduce || !rows.length) return;
  var jobs = [
    { label: "Sales into Tally", from: "Amazon · Flipkart · Myntra · order system", steps: ["Orders collected from each channel", "Tally entries built and posted", "Next-day check against Tally"], times: ["06:00:02", "06:00:41", "06:01:07"], done: "Posted" },
    { label: "TDS reconciliation", from: "TDS records · Tally", steps: ["Entries gathered", "Checked against Tally", "Mismatches flagged for review"], times: ["10:30:01", "10:30:07", "10:30:12"], done: "Ready for review" },
    { label: "Sales-order report", from: "Tally · Google Sheets", steps: ["Orders gathered for each unit", "Totals matched across units", "One report to the owner"], times: ["09:00:02", "09:00:06", "09:00:09"], done: "Report sent" },
    { label: "Labour bills & credit notes", from: "Google Sheets", steps: ["Work and rates gathered", "Amounts and formats checked", "Bills and notes ready to send"], times: ["18:00:03", "18:00:08", "18:00:11"], done: "Ready to send" },
    { label: "Attendance tracking", from: "Your own software", steps: ["Records gathered", "Gaps and overlaps checked", "Summary to the team lead"], times: ["19:00:01", "19:00:04", "19:00:06"], done: "Summary sent" }
  ];
  var jobEl = document.getElementById("job");
  var fromEl = document.getElementById("from");
  var stateEl = document.getElementById("state");
  var side = document.querySelectorAll("#jobs li");
  var n = 0;

  function later(ms, fn) { return setTimeout(fn, ms); }
  function run() {
    var job = jobs[n];
    jobEl.textContent = job.label;
    fromEl.textContent = "from " + job.from;
    stateEl.textContent = "Running";
    stateEl.classList.add("run");
    side.forEach(function (li, k) { li.classList.toggle("on", k === n); });
    rows.forEach(function (row, k) {
      row.classList.remove("done");
      row.classList.add("wait");
      row.querySelector("time").textContent = job.times[k];
      row.querySelector(".st-label").textContent = job.steps[k];
    });
    rows.forEach(function (row, k) {
      later(300 + k * 1400, function () { row.classList.remove("wait"); });
      later(500 + k * 1400, function () { row.classList.add("done"); });
    });
    later(300 + rows.length * 1400, function () { stateEl.textContent = job.done; stateEl.classList.remove("run"); });
    later(300 + rows.length * 1400 + 2600, function () { n = (n + 1) % jobs.length; run(); });
  }
  later(1800, run);
})();
