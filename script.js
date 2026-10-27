(() => {
  const KEY = "gradePilot.studentRecords.v1";
  const $ = id => document.getElementById(id);
  let students = load();
  let toastTimer;

  function load() {
    try { const data = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(data) ? data.filter(s => s && s.id && s.name && Array.isArray(s.subjects)) : []; }
    catch { return []; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(students)); }
    catch { toast("Could not save. Check browser storage settings."); }
  }
  function esc(v = "") { return String(v).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c])); }
  function grade(p) { if (p >= 90) return "A+"; if (p >= 80) return "A"; if (p >= 70) return "B"; if (p >= 60) return "C"; if (p >= 35) return "D"; return "F"; }
  function result(s) {
    const subjects = s.subjects.filter(x => x.name.trim() && x.marks !== "" && Number.isFinite(Number(x.marks)) && Number(x.marks) >= 0 && Number(x.marks) <= 100);
    const total = subjects.reduce((sum, x) => sum + Number(x.marks), 0), max = subjects.length * 100;
    const percentage = max ? total / max * 100 : 0;
    return { total, max, percentage, count: subjects.length, grade: grade(percentage), passing: subjects.length > 0 && subjects.every(x => Number(x.marks) >= 35) };
  }
  function initials(name) { return name.trim().split(/\s+/).slice(0, 2).map(x => x[0] || "").join("").toUpperCase() || "ST"; }
  function toast(message) { $("toast").textContent = message; $("toast").classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => $("toast").classList.remove("show"), 2500); }
  function renderStats() {
    const valid = students.map(s => ({ s, r: result(s) })).filter(x => x.r.count);
    $("studentCount").textContent = students.length;
    $("average").textContent = valid.length ? (valid.reduce((n, x) => n + x.r.percentage, 0) / valid.length).toFixed(1) + "%" : "—";
    const top = valid.slice().sort((a, b) => b.r.percentage - a.r.percentage)[0];
    $("topName").textContent = top ? top.s.name : "—";
    $("topNote").textContent = top ? top.r.percentage.toFixed(1) + "% average" : "Add records to get started";
    const passing = valid.filter(x => x.r.passing).length;
    $("passing").textContent = passing;
    $("passingNote").textContent = valid.length ? `${passing} of ${valid.length} records pass every subject` : "No records yet";
  }
  function filtered() {
    const q = $("search").value.trim().toLowerCase(), g = $("gradeFilter").value;
    return students.filter(s => `${s.name} ${s.roll} ${s.course || ""} ${s.subjects.map(x => x.name).join(" ")}`.toLowerCase().includes(q) && (g === "all" || result(s).grade === g))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  function renderRows() {
    const list = filtered();
    $("rows").innerHTML = list.map(s => {
      const r = result(s), gc = "grade-" + r.grade.toLowerCase().replace("+", "-plus");
      return `<tr><td><div class="student-cell"><span class="avatar">${esc(initials(s.name))}</span><span class="student-info"><b>${esc(s.name)}</b><small>${esc(s.roll)}${s.course ? " · " + esc(s.course) : ""}</small></span></div></td><td>${r.count} ${r.count === 1 ? "subject" : "subjects"}</td><td>${r.total} / ${r.max}</td><td><strong>${r.count ? r.percentage.toFixed(1) + "%" : "—"}</strong></td><td><span class="pill ${gc}">${r.count ? r.grade : "—"}</span></td><td><span class="pill ${r.passing ? "passing" : "review"}">${r.passing ? "Passing" : "Review"}</span></td><td><div class="row-actions"><button data-action="edit" data-id="${esc(s.id)}" aria-label="Edit ${esc(s.name)}" title="Edit">✎</button><button data-action="delete" data-id="${esc(s.id)}" aria-label="Delete ${esc(s.name)}" title="Delete">×</button></div></td></tr>`;
    }).join("");
    $("empty").hidden = list.length > 0; $("tableWrap").hidden = list.length === 0;
    $("recordCount").textContent = `${list.length} ${list.length === 1 ? "record" : "records"} shown`;
  }
  function renderChart() {
    const list = students.map(s => ({ s, r: result(s) })).filter(x => x.r.count).sort((a, b) => b.r.percentage - a.r.percentage).slice(0, 10);
    $("chart").innerHTML = list.length ? list.map(({s,r}) => `<div class="chart-column" title="${esc(s.name)}: ${r.percentage.toFixed(1)}%"><span class="chart-value">${r.percentage.toFixed(0)}%</span><div class="track"><div class="bar" style="height:${Math.max(3,r.percentage)}%"></div></div><span class="chart-name">${esc(s.name.split(/\s+/)[0])}</span></div>`).join("") : '<p class="chart-empty">Add student records to see your chart.</p>';
  }
  function render() { renderStats(); renderRows(); renderChart(); }
  function addSubject(name = "", marks = "") {
    const row = document.createElement("div"); row.className = "subject-row";
    row.innerHTML = `<input class="subject-name" maxlength="70" required placeholder="Subject name (e.g. Maths)" aria-label="Subject name" value="${esc(name)}"><input class="subject-marks" type="number" min="0" max="100" step="0.5" required placeholder="Marks / 100" aria-label="Marks out of 100" value="${esc(marks)}"><button type="button" class="remove-subject" aria-label="Remove subject">×</button>`;
    row.querySelector(".remove-subject").addEventListener("click", () => { if ($("subjects").children.length <= 1) { $("error").textContent = "Add at least one subject."; return; } row.remove(); $("error").textContent = ""; });
    $("subjects").appendChild(row);
  }
  function openModal(s = null) {
    $("studentForm").reset(); $("error").textContent = ""; $("studentId").value = s ? s.id : "";
    $("modalTitle").textContent = s ? "Edit student record" : "Add student record";
    $("studentName").value = s?.name || ""; $("roll").value = s?.roll || ""; $("course").value = s?.course || "";
    $("subjects").innerHTML = "";
    if (s && s.subjects.length) s.subjects.forEach(x => addSubject(x.name, x.marks));
    else { addSubject("Mathematics"); addSubject("Science"); addSubject("English"); }
    $("modal").hidden = false; document.body.style.overflow = "hidden"; setTimeout(() => $("studentName").focus(), 50);
  }
  function closeModal() { $("modal").hidden = true; document.body.style.overflow = ""; }
  function submit(event) {
    event.preventDefault(); $("error").textContent = "";
    const name = $("studentName").value.trim(), roll = $("roll").value.trim(), id = $("studentId").value;
    const subjects = [...$("subjects").querySelectorAll(".subject-row")].map(row => ({ name: row.querySelector(".subject-name").value.trim(), marks: row.querySelector(".subject-marks").value }));
    if (!name || !roll) { $("error").textContent = "Please enter the student name and roll number."; return; }
    if (!subjects.length || subjects.some(x => !x.name || x.marks === "" || !Number.isFinite(Number(x.marks)) || Number(x.marks) < 0 || Number(x.marks) > 100)) { $("error").textContent = "Enter a subject name and marks from 0 to 100 for every subject."; return; }
    if (students.some(s => s.roll.toLowerCase() === roll.toLowerCase() && s.id !== id)) { $("error").textContent = "That roll number is already in use. Please enter a unique roll number."; return; }
    const old = students.find(s => s.id === id);
    const record = { id: id || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`), name, roll, course: $("course").value.trim(), subjects, createdAt: old?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
    if (old) { students = students.map(s => s.id === id ? record : s); toast("Student record updated."); }
    else { students.push(record); toast("Student record added."); }
    save(); closeModal(); render();
  }
  function exportCSV() {
    if (!students.length) { toast("Add a student record before exporting."); return; }
    const data = [["Name","Roll Number","Class/Course","Subjects","Total Marks","Maximum Marks","Percentage","Grade","Passing Status"]];
    students.forEach(s => { const r = result(s); data.push([s.name,s.roll,s.course || "",s.subjects.map(x => `${x.name}: ${x.marks}/100`).join("; "),r.total,r.max,r.count ? r.percentage.toFixed(2) : "",r.count ? r.grade : "",r.passing ? "Passing" : "Review"]); });
    const csv = data.map(row => row.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], {type:"text/csv;charset=utf-8;"}));
    const a = document.createElement("a"); a.href = url; a.download = "student-performance-records.csv"; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); toast("CSV export downloaded.");
  }
  $("dateLabel").textContent = new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"}).toUpperCase();
  ["addTop","addHero","addFirst"].forEach(id => $(id).addEventListener("click", () => openModal()));
  $("close").addEventListener("click", closeModal); $("cancel").addEventListener("click", closeModal);
  $("modal").addEventListener("click", e => { if (e.target === $("modal")) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("modal").hidden) closeModal(); });
  $("studentForm").addEventListener("submit", submit); $("addSubject").addEventListener("click", () => { addSubject(); $("error").textContent = ""; });
  $("search").addEventListener("input", renderRows); $("gradeFilter").addEventListener("change", renderRows);
  $("rows").addEventListener("click", e => {
    const b = e.target.closest("[data-action]"); if (!b) return;
    const s = students.find(x => x.id === b.dataset.id); if (!s) return;
    if (b.dataset.action === "edit") openModal(s);
    if (b.dataset.action === "delete" && confirm(`Delete the record for ${s.name}?`)) { students = students.filter(x => x.id !== s.id); save(); render(); toast("Student record deleted."); }
  });
  $("export").addEventListener("click", exportCSV);
  document.querySelectorAll(".nav").forEach(b => b.addEventListener("click", () => {
    document.querySelectorAll(".nav").forEach(n => n.classList.toggle("active", n === b));
    const section = b.dataset.section;
    document.getElementById(section === "analytics" ? "analytics" : section === "records" ? "records" : "overview").scrollIntoView({behavior:"smooth",block:"start"});
  }));
  render();
})();
