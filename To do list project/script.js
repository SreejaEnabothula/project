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
  const index = taskList.rows.length + 1;

  const row = document.createElement("tr");
  if (isCompleted) {
    row.classList.add("completed");
  }

  const numberCell = document.createElement("td");
  numberCell.textContent = index;

  const taskCell = document.createElement("td");
  taskCell.textContent = text;
  taskCell.classList.add("task-text");

  const checkboxCell = document.createElement("td");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = isCompleted;
  checkbox.addEventListener("change", () => {
    row.classList.toggle("completed");
    updateLocalStorage();
    showMessage("Task updated successfully!");
  });
  checkboxCell.appendChild(checkbox);

  const actionCell = document.createElement("td");
  const actions = document.createElement("div");
  actions.classList.add("action-buttons");

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.classList.add("btn", "edit");
  editBtn.onclick = () => {
    const newText = prompt("Edit task:", taskCell.textContent);
    if (newText !== null && newText.trim() !== "") {
      taskCell.textContent = newText.trim();
      updateLocalStorage();
      showMessage("Task edited successfully!");
    }
  };

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.classList.add("btn", "delete");
  deleteBtn.onclick = () => {
    row.remove();
    renumberTasks();
    updateLocalStorage();
    showMessage("Task deleted successfully!");
  };

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);
  actionCell.appendChild(actions);

  row.appendChild(numberCell);
  row.appendChild(taskCell);
  row.appendChild(checkboxCell);
  row.appendChild(actionCell);

  taskList.appendChild(row);
}

function saveTask(text, completed) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push({ text, completed });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateLocalStorage() {
  const tasks = [];
  document.querySelectorAll("#taskList tr").forEach(row => {
    const text = row.querySelector(".task-text").textContent.trim();
    const checked = row.querySelector("input[type='checkbox']").checked;
    tasks.push({ text, completed: checked });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renumberTasks() {
  const rows = document.querySelectorAll("#taskList tr");
  rows.forEach((row, index) => {
    row.children[0].textContent = index + 1;
  });
}

function showMessage(msg) {
  message.textContent = msg;
  setTimeout(() => {
    message.textContent = "";
  }, 2000);
}
