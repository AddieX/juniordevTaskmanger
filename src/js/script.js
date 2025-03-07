const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-items");
const taskType = document.getElementById("task-type");
const dueDate = document.getElementById("due-date");
const filterBtns = document.querySelectorAll(".filter-btn");
const taskNotes = document.getElementById("task-notes");
const taskTags = document.getElementById("task-tags");
const difficulty = document.getElementById("difficulty");
const prioritySelect = document.getElementById("priority");
const themeToggle = document.getElementById("theme-toggle-btn");
const resourceTabs = document.querySelectorAll(".resource-tab");

themeToggle.addEventListener("click", () => {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
});

const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);

resourceTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    resourceTabs.forEach((t) => t.classList.remove("active"));
    document
      .querySelectorAll(".resource-content")
      .forEach((c) => c.classList.remove("active"));

    tab.classList.add("active");
    const resourceType = tab.dataset.resource;
    document
      .getElementById(`${resourceType}-resources`)
      .classList.add("active");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const savedTodos = JSON.parse(localStorage.getItem("devTodos") || "[]");
  savedTodos.forEach((todo) => {
    createTodoItem(
      todo.text,
      todo.type,
      todo.completed,
      todo.priority,
      todo.notes,
      todo.tags,
      todo.difficulty
    );
  });
  updateProgressStats();
});

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.dataset.filter;
    filterTodos(filter);
  });
});

function filterTodos(filter) {
  const items = todoList.querySelectorAll("li");
  items.forEach((item) => {
    if (filter === "all" || item.dataset.type === filter) {
      item.style.display = "flex";
    } else {
      item.style.display = "none";
    }
  });
}

function createTodoItem(
  text,
  type,
  completed = false,
  priority = "medium",
  notes = "",
  tags = [],
  difficulty = "intermediate"
) {
  const li = document.createElement("li");
  li.dataset.type = type;
  li.dataset.priority = priority;
  li.dataset.difficulty = difficulty;
  li.classList.add(`priority-${priority}`);
  li.classList.add(`difficulty-${difficulty}`);

  const tagsHtml =
    Array.isArray(tags) && tags.length > 0
      ? `<div class="tags-container">${tags
          .map((tag) => `<span class="tag">${tag}</span>`)
          .join("")}</div>`
      : "";

  const notesHtml = notes
    ? `<div class="task-notes-content">${notes}</div>`
    : "";

  const hasDetails = notes || (Array.isArray(tags) && tags.length > 0);

  const taskDueDate = new Date(dueDate.value);
  const formattedDate = taskDueDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  li.innerHTML = `
              <div class="todo-main">
                <input type="checkbox" class="todo-checkbox" ${
                  completed ? "checked" : ""
                }>
                <div class="todo-content">
                  <span class="todo-text">${text}</span>
                  <div class="todo-meta">
                    <span class="task-type-badge" data-type="${type}">${type}</span>
                    <span class="priority-badge">${priority}</span>
                    <span class="difficulty-badge">${difficulty}</span>
                    <span class="due-date">${formattedDate}</span>
                    ${
                      hasDetails
                        ? '<button class="toggle-details-btn">Details</button>'
                        : ""
                    }
                  </div>
                  ${tagsHtml}
                </div>
                <div class="todo-actions">
                  <select class="priority-select">
                    <option value="low" ${
                      priority === "low" ? "selected" : ""
                    }>Low</option>
                    <option value="medium" ${
                      priority === "medium" ? "selected" : ""
                    }>Medium</option>
                    <option value="high" ${
                      priority === "high" ? "selected" : ""
                    }>High</option>
                  </select>
                  <button class="delete-btn">Delete</button>
                </div>
              </div>
              ${
                hasDetails
                  ? `<div class="todo-details" style="display: none;">
                ${notesHtml}
              </div>`
                  : ""
              }
            `;

  const checkbox = li.querySelector(".todo-checkbox");
  const todoText = li.querySelector(".todo-text");
  const itemPrioritySelect = li.querySelector(".priority-select");

  const toggleBtn = li.querySelector(".toggle-details-btn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const details = li.querySelector(".todo-details");
      const isVisible = details.style.display !== "none";
      details.style.display = isVisible ? "none" : "block";
      toggleBtn.textContent = isVisible ? "Details" : "Hide Details";
    });
  }

  if (completed) {
    todoText.style.textDecoration = "line-through";
  }

  checkbox.addEventListener("change", () => {
    todoText.style.textDecoration = checkbox.checked ? "line-through" : "none";
    saveTodos();
    updateProgressStats();
  });

  itemPrioritySelect.addEventListener("change", () => {
    const newPriority = itemPrioritySelect.value;
    li.dataset.priority = newPriority;
    li.className = li.className.replace(
      /priority-\w+/,
      `priority-${newPriority}`
    );
    li.querySelector(".priority-badge").textContent = newPriority;
    saveTodos();
  });

  li.querySelector(".delete-btn").addEventListener("click", () => {
    li.remove();
    saveTodos();
    updateProgressStats();
  });

  todoList.appendChild(li);
  updateProgressStats();
}

function updateProgressStats() {
  const totalTasks = todoList.querySelectorAll("li").length;
  const completedTasks = todoList.querySelectorAll(
    "li .todo-checkbox:checked"
  ).length;
  const inProgressTasks = totalTasks - completedTasks;

  document.getElementById("tasks-total").textContent = totalTasks;
  document.getElementById("tasks-completed").textContent = completedTasks;
  document.getElementById("tasks-inprogress").textContent = inProgressTasks;

  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const progressBar = document.getElementById("progress-bar");
  progressBar.style.width = `${progressPercentage}%`;

  if (progressPercentage < 30) {
    progressBar.className = "progress-bar progress-low";
  } else if (progressPercentage < 70) {
    progressBar.className = "progress-bar progress-medium";
  } else {
    progressBar.className = "progress-bar progress-high";
  }
}

function saveTodos() {
  const todos = Array.from(todoList.querySelectorAll("li")).map((li) => {
    const tagElements = li.querySelectorAll(".tag");
    const tags =
      tagElements.length > 0
        ? Array.from(tagElements).map((tag) => tag.textContent)
        : [];

    const notesElement = li.querySelector(".task-notes-content");
    const notes = notesElement ? notesElement.textContent : "";

    return {
      text: li.querySelector(".todo-text").textContent,
      type: li.dataset.type,
      completed: li.querySelector(".todo-checkbox").checked,
      priority: li.dataset.priority,
      difficulty: li.dataset.difficulty,
      notes: notes,
      tags: tags,
    };
  });
  localStorage.setItem("devTodos", JSON.stringify(todos));
}

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const todoText = todoInput.value.trim();
  const selectedType = taskType.value;
  const selectedDifficulty = difficulty.value;
  const selectedPriority = prioritySelect ? prioritySelect.value : "medium";
  const notes = taskNotes.value.trim();
  const dueDateValue = dueDate.value.trim();

  const tags =
    taskTags.value.trim() !== ""
      ? taskTags.value
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== "")
      : [];

  const errorMessage = document.getElementById("error-message");

  errorMessage.style.display = "none";

  if (todoText === "") {
    errorMessage.style.display = "block";
    errorMessage.textContent = "Please enter a task description";
    return;
  }

  if (dueDateValue === "") {
    errorMessage.style.display = "block";
    errorMessage.textContent = "Please select a due date";
    return;
  }

  try {
    createTodoItem(
      todoText,
      selectedType,
      false,
      selectedPriority,
      notes,
      tags,
      selectedDifficulty
    );
    todoInput.value = "";
    taskNotes.value = "";
    taskTags.value = "";
    saveTodos();
  } catch (error) {
    console.error("Error creating task:", error);
    errorMessage.style.display = "block";
    errorMessage.textContent = "Error creating task. Please try again.";
  }
});
