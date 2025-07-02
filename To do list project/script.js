const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const message = document.getElementById("message");

window.addEventListener("load", () => {
  const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  savedTasks.forEach(task => renderTask(task.text, task.completed));
});

addBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  if (text !== "") {
    renderTask(text);
    saveTask(text, false);
    showMessage("Task added successfully!");
    taskInput.value = "";
  }
});

function renderTask(text, isCompleted = false) {
  const li = document.createElement("li");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = isCompleted;

  const span = document.createElement("span");
  span.textContent = text;
  span.classList.add("task-text");

  const actions = document.createElement("div");
  actions.classList.add("action-buttons");

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.classList.add("btn", "edit");
  editBtn.onclick = () => {
    const newText = prompt("Edit task:", span.textContent);
    if (newText !== null && newText.trim() !== "") {
      span.textContent = newText.trim();
      updateLocalStorage();
      showMessage("Task edited successfully!");
    }
  };

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.classList.add("btn", "delete");
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    li.remove();
    updateLocalStorage();
    showMessage("Task deleted successfully!");
  };

  if (isCompleted) li.classList.add("completed");

  checkbox.addEventListener("change", () => {
    li.classList.toggle("completed");
    updateLocalStorage();
    showMessage("Task updated successfully!");
  });

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(actions);
  taskList.appendChild(li);
}

function saveTask(text, completed) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push({ text, completed });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateLocalStorage() {
  const tasks = [];
  document.querySelectorAll("#taskList li").forEach(li => {
    const checkbox = li.querySelector("input[type='checkbox']");
    const text = li.querySelector(".task-text").textContent.trim();
    tasks.push({
      text,
      completed: checkbox.checked
    });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function showMessage(msg) {
  message.textContent = msg;
  setTimeout(() => {
    message.textContent = "";
  }, 2000);
}
