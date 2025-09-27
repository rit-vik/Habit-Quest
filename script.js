const KEY = "habitQuestData";

let state;
try {
  const raw = localStorage.getItem(KEY);
  state = raw ? JSON.parse(raw) : { habits: [], xp: 0, completions: 0, bestStreak: 0 };
  if (!state || typeof state !== "object") {
    state = { habits: [], xp: 0, completions: 0, bestStreak: 0 };
  }
} catch (e) {
  console.warn("Corrupted localStorage, resetting Habit Quest data.", e);
  state = { habits: [], xp: 0, completions: 0, bestStreak: 0 };
  localStorage.removeItem(KEY);
}

function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function addHabit() {
  const nameInput = document.getElementById("habitName");
  const name = nameInput?.value.trim();
  if (!name) return;

  state.habits.push({ name, streak: 0, total: 0, lastCompleted: null });
  nameInput.value = "";
  save();
  renderHabits();

  if (typeof loadDashboard === "function") {
    loadDashboard(); // only runs on dashboard page
  }

  nameInput.focus(); // keep focus for quick adding
}

// --- Habit Completion & Streak Logic ---
function completeHabit(index) {
  const habit = state.habits[index];
  const today = new Date().toDateString();

  if (habit.lastCompleted === today) {
    alert("You've already completed this habit today!");
    return;
  }

  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toDateString();
  if (habit.lastCompleted === yesterday) {
    habit.streak += 1;
  } else {
    habit.streak = 1;
  }

  habit.lastCompleted = today;
  habit.total = (habit.total || 0) + 1;

  state.completions = (state.completions || 0) + 1;
  state.xp = (state.xp || 0) + 10;
  if (habit.streak > (state.bestStreak || 0)) {
    state.bestStreak = habit.streak;
  }

  save();
  renderHabits();
  loadDashboard();
}

// --- Rendering ---
function renderHabits() {
  const list = document.getElementById("habitList");
  const today = new Date().toDateString();

  // Habits display
  if (list) {
    list.innerHTML = "";
    state.habits.forEach((h, i) => {
      const completedToday = h.lastCompleted === today;
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <h3>${h.name}</h3>
        <p>Streak: ${h.streak || 0} days</p>
        <p>Total Completed: ${h.total || 0}</p>
        <button onclick="completeHabit(${i})" ${completedToday ? "disabled" : ""}>
          ${completedToday ? "Completed Today" : "Mark Complete"}
        </button>
      `;
      list.appendChild(div);
    });
  }

  // Manage Habits list (only on habits page)
  const manage = document.getElementById("manageHabits");
  if (manage) {
    manage.innerHTML = "";
    state.habits.forEach((h, i) => {
      const li = document.createElement("li");
      li.textContent = h.name + " (streak: " + h.streak + ")";
      const del = document.createElement("button");
      del.textContent = "Delete";
      del.onclick = () => {
        state.habits.splice(i, 1);
        save();
        renderHabits();
        loadDashboard();
      };
      li.appendChild(del);
      manage.appendChild(li);
    });
  }

  // Greeting (only dashboard)
  const greetingEl = document.getElementById("greeting");
  if (greetingEl) {
    const hour = new Date().getHours();
    let greeting = "Welcome back";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    else greeting = "Good evening";
    greetingEl.textContent = `${greeting}!`;
  }
}

function resetData() {
  if (confirm("Reset all data?")) {
    localStorage.removeItem(KEY);
    location.reload();
  }
}

// --- Dashboard logic ---
function loadDashboard() {
  if (document.getElementById("completed")) {
    document.getElementById("completed").textContent = state.completions;
    document.getElementById("bestStreak").textContent = state.bestStreak;
    document.getElementById("xp").textContent = state.xp;

    const level = Math.floor(state.xp / 100) + 1;
    const progress = state.xp % 100;

    document.getElementById("level").textContent = level;
    document.getElementById("xpBar").style.width = progress + "%";
  }

  const badges = document.getElementById("badges");
  if (badges) {
    badges.innerHTML = "";
    if (state.completions >= 1) badges.innerHTML += "<span class='badge'>Getting Started</span>";
    if (state.bestStreak >= 5) badges.innerHTML += "<span class='badge'>5-Day Streak</span>";
    if (state.xp >= 500) badges.innerHTML += "<span class='badge'>XP Master</span>";
  }

  const feed = document.getElementById("friendsFeed");
  if (feed) {
    feed.innerHTML = `
      <li>✅ Alex completed "Workout"</li>
      <li>📚 Sam read for 2 days streak</li>
      <li>🔥 Priya hit a 5-day streak</li>
    `;
  }

  renderHabits();
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("greeting")) {
    loadDashboard();
  }
  renderHabits();
});
