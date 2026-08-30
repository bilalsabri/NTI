const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const stats = document.getElementById("stats");

async function api(path, options) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok && res.status !== 204) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

function render(tasks) {
  list.innerHTML = "";
  emptyState.classList.toggle("hidden", tasks.length > 0);

  const done = tasks.filter((t) => t.done).length;
  stats.innerHTML = tasks.length
    ? `<span>${tasks.length} total</span><span>${done} done</span><span>${
        tasks.length - done
      } open</span>`
    : "";

  for (const task of tasks) {
    const li = document.createElement("li");
    li.className = `task${task.done ? " task--done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task__checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => toggle(task, checkbox.checked));

    const title = document.createElement("span");
    title.className = "task__title";
    title.textContent = task.title;

    const del = document.createElement("button");
    del.className = "task__delete";
    del.textContent = "×";
    del.title = "Delete task";
    del.addEventListener("click", () => remove(task));

    li.append(checkbox, title, del);
    list.appendChild(li);
  }
}

async function load() {
  render(await api("/api/tasks"));
}

async function toggle(task, done) {
  await api(`/api/tasks/${task.id}`, {
    method: "PATCH",
    body: JSON.stringify({ done }),
  });
  await load();
}

async function remove(task) {
  await api(`/api/tasks/${task.id}`, { method: "DELETE" });
  await load();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  await api("/api/tasks", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
  input.value = "";
  input.focus();
  await load();
});

load().catch((err) => {
  stats.innerHTML = `<span style="color:#ef4444">${err.message}</span>`;
});
