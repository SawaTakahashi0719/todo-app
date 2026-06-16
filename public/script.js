console.log("script.js読み込まれた");


const addButton = document.getElementById("add-button");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");


loadTodos();


addButton.addEventListener("click", addTodo);

todoInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addTodo();
  }
});


function loadTodos() {
  fetch("http://localhost:3000/todos")
    .then(res => res.json())
    .then(data => {
      renderTodos(data);
    })
    .catch(err => console.error(err));
}

function addTodo() {
  const text = todoInput.value.trim();

  if (text === "") {
    alert("入力してください");
    return;
  }

  fetch("http://localhost:3000/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text: text
    })
  })
    .then(res => res.json())
    .then(() => {
      todoInput.value = "";
      loadTodos(); 
    })
    .catch(err => console.error(err));
}

function deleteTodo(id) {
  fetch(`http://localhost:3000/todos/${id}`, {
    method: "DELETE"
  })
    .then(res => res.json())
    .then(() => {
      loadTodos(); 
    })
    .catch(err => console.error(err));
}


function toggleTodo(id) {
  fetch("http://localhost:3000/todos")
    .then(res => res.json())
    .then(todos => {
      const todo = todos.find(t => t.id === id);
      return fetch(`http://localhost:3000/todos/${id}`, {
        method: "DELETE"
      }).then(() => {
        return fetch("http://localhost:3000/todos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            text: todo.text + "済"
          })
        });
      });
    })
    .then(() => loadTodos());
}


function renderTodos(todos) {
  todoList.innerHTML = "";
  todos.forEach(todo => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = todo.text;
    span.addEventListener("click", () => {
      toggleTodo(todo.id);
    });
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "削除";
    deleteButton.addEventListener("click", () => {
      deleteTodo(todo.id);
    });
    li.appendChild(span);
    li.appendChild(deleteButton);
    todoList.appendChild(li);
  });
}

