console.log("script.js読み込まれた");

const addButton = document.getElementById("add-button");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const searchInput = document.getElementById("search-input");
const sortBtns = document.querySelectorAll(".sort-btn");
const deleteCompletedBtn = document.getElementById("delete-completed-btn");

let allTodos = [];
let searchQuery = "";
let sortMode = "order";
let editingId = null;
let dragSrcId = null;

loadTodos();

addButton.addEventListener("click", addTodo);

todoInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTodo();
});

searchInput.addEventListener("input", () => {
  searchQuery = searchInput.value;
  applyFiltersAndSort();
});

sortBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    sortMode = btn.dataset.sort;
    sortBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    applyFiltersAndSort();
  });
});

deleteCompletedBtn.addEventListener("click", deleteCompleted);


function loadTodos() {
  fetch("http://localhost:3000/todos")
    .then(res => res.json())
    .then(data => {
      allTodos = data;
      applyFiltersAndSort();
    })
    .catch(err => console.error(err));
}

function applyFiltersAndSort() {
  let todos = [...allTodos];

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    todos = todos.filter(t => t.text.toLowerCase().includes(q));
  }

  if (sortMode === "pickup") {
    todos.sort((a, b) => b.pickup - a.pickup || a.sort_order - b.sort_order);
  } else if (sortMode === "completed") {
    todos.sort((a, b) => {
      if (a.completed && b.completed) {
        if (!a.completed_at && !b.completed_at) return a.sort_order - b.sort_order;
        if (!a.completed_at) return 1;
        if (!b.completed_at) return -1;
        return new Date(b.completed_at) - new Date(a.completed_at);
      }
      if (a.completed) return -1;
      if (b.completed) return 1;
      return a.sort_order - b.sort_order;
    });
  } else {
    todos.sort((a, b) => a.sort_order - b.sort_order);
  }

  renderTodos(todos);
}

function addTodo() {
  const text = todoInput.value.trim();
  if (!text) {
    alert("入力してください");
    return;
  }
  fetch("http://localhost:3000/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  })
    .then(res => res.json())
    .then(() => {
      todoInput.value = "";
      loadTodos();
    })
    .catch(err => console.error(err));
}

function deleteTodo(id) {
  fetch(`http://localhost:3000/todos/${id}`, { method: "DELETE" })
    .then(res => res.json())
    .then(() => loadTodos())
    .catch(err => console.error(err));
}

function deleteCompleted() {
  fetch("http://localhost:3000/todos/completed", { method: "DELETE" })
    .then(res => res.json())
    .then(() => loadTodos())
    .catch(err => console.error(err));
}

function toggleTodo(id) {
  fetch(`http://localhost:3000/todos/${id}`, { method: "PUT" })
    .then(res => res.json())
    .then(() => loadTodos())
    .catch(err => console.error(err));
}

function editTodo(id, text) {
  if (!text) return;
  fetch(`http://localhost:3000/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  })
    .then(res => res.json())
    .then(() => {
      editingId = null;
      loadTodos();
    })
    .catch(err => console.error(err));
}

function togglePickup(id) {
  fetch(`http://localhost:3000/todos/${id}/pickup`, { method: "PATCH" })
    .then(res => res.json())
    .then(() => loadTodos())
    .catch(err => console.error(err));
}

function reorderTodos(srcId, destId) {
  const srcIdx = allTodos.findIndex(t => t.id === srcId);
  const destIdx = allTodos.findIndex(t => t.id === destId);
  if (srcIdx === -1 || destIdx === -1) return;

  const reordered = [...allTodos];
  const [moved] = reordered.splice(srcIdx, 1);
  reordered.splice(destIdx, 0, moved);

  const updates = reordered.map((t, i) => ({ id: t.id, sort_order: i }));

  fetch("http://localhost:3000/todos/reorder", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates)
  })
    .then(res => res.json())
    .then(() => loadTodos())
    .catch(err => console.error(err));
}

function renderTodos(todos) {
  todoList.innerHTML = "";

  todos.forEach(todo => {
    const li = document.createElement("li");
    if (todo.completed) li.classList.add("completed");

    // ドラッグ設定（編集中は無効）
    if (editingId !== todo.id) {
      li.draggable = true;
      li.addEventListener("dragstart", (e) => {
        dragSrcId = todo.id;
        e.dataTransfer.effectAllowed = "move";
        setTimeout(() => li.classList.add("dragging"), 0);
      });
      li.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        li.classList.add("drag-over");
      });
      li.addEventListener("dragleave", () => {
        li.classList.remove("drag-over");
      });
      li.addEventListener("drop", (e) => {
        e.preventDefault();
        li.classList.remove("drag-over");
        if (dragSrcId !== null && dragSrcId !== todo.id) {
          reorderTodos(dragSrcId, todo.id);
        }
      });
      li.addEventListener("dragend", () => {
        li.classList.remove("dragging");
        todoList.querySelectorAll("li").forEach(l => l.classList.remove("drag-over"));
        dragSrcId = null;
      });
    }

    // 完了チェックボックス
    const completedCheckbox = document.createElement("input");
    completedCheckbox.type = "checkbox";
    completedCheckbox.className = "completed-checkbox";
    completedCheckbox.checked = !!todo.completed;
    completedCheckbox.addEventListener("change", () => toggleTodo(todo.id));

    const actionBtns = document.createElement("div");
    actionBtns.className = "action-btns";

    if (editingId === todo.id) {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "edit-input";
      input.value = todo.text;

      const saveBtn = document.createElement("button");
      saveBtn.textContent = "保存";
      saveBtn.className = "text-btn";
      saveBtn.addEventListener("click", () => editTodo(todo.id, input.value.trim()));

      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "キャンセル";
      cancelBtn.className = "text-btn";
      cancelBtn.addEventListener("click", () => {
        editingId = null;
        applyFiltersAndSort();
      });

      actionBtns.appendChild(saveBtn);
      actionBtns.appendChild(cancelBtn);

      li.appendChild(completedCheckbox);
      li.appendChild(input);
      li.appendChild(actionBtns);
    } else {
      const span = document.createElement("span");
      span.textContent = todo.text;

      const editBtn = document.createElement("button");
      editBtn.textContent = "✏️";
      editBtn.className = "icon-btn";
      editBtn.title = "編集";
      editBtn.addEventListener("click", () => {
        editingId = todo.id;
        applyFiltersAndSort();
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️";
      deleteBtn.className = "icon-btn";
      deleteBtn.title = "削除";
      deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

      const favoriteBtn = document.createElement("button");
      favoriteBtn.textContent = todo.pickup ? "★" : "☆";
      favoriteBtn.className = `icon-btn favorite${todo.pickup ? " active" : ""}`;
      favoriteBtn.title = "お気に入り";
      favoriteBtn.addEventListener("click", () => togglePickup(todo.id));

      actionBtns.appendChild(editBtn);
      actionBtns.appendChild(deleteBtn);
      actionBtns.appendChild(favoriteBtn);

      li.appendChild(completedCheckbox);
      li.appendChild(span);
      li.appendChild(actionBtns);
    }

    todoList.appendChild(li);
  });
}
