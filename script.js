const taskInput = document.getElementById("taskInput");
const dueDate = document.getElementById("dueDate");
const category = document.getElementById("category");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const themeBtn = document.getElementById("themeBtn");
const filterBtns = document.querySelectorAll(".filter-btn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

renderTasks();

addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keypress", (e)=>{
  if(e.key === "Enter"){
    addTask();
  }
});

searchInput.addEventListener("input", renderTasks);

themeBtn.addEventListener("click", ()=>{
  document.body.classList.toggle("dark");

  if(document.body.classList.contains("dark")){
    themeBtn.innerHTML = "☀️ Light Mode";
  }else{
    themeBtn.innerHTML = "🌙 Dark Mode";
  }
});

filterBtns.forEach(btn=>{
  btn.addEventListener("click", ()=>{

    filterBtns.forEach(b=>b.classList.remove("active"));

    btn.classList.add("active");

    currentFilter = btn.dataset.filter;

    renderTasks();
  });
});

function addTask(){

  if(taskInput.value.trim() === ""){
    alert("Please enter a task");
    return;
  }

  const task = {
    id: Date.now(),
    text: taskInput.value,
    date: dueDate.value,
    category: category.value,
    completed:false
  };

  tasks.push(task);

  saveTasks();

  renderTasks();

  taskInput.value = "";
  dueDate.value = "";
}

function renderTasks(){

  taskList.innerHTML = "";

  let filteredTasks = tasks.filter(task=>{

    const matchesSearch = task.text.toLowerCase()
    .includes(searchInput.value.toLowerCase());

    if(currentFilter === "completed"){
      return task.completed && matchesSearch;
    }

    if(currentFilter === "pending"){
      return !task.completed && matchesSearch;
    }

    return matchesSearch;
  });

  filteredTasks.forEach(task=>{

    const li = document.createElement("li");

    li.className = "task";

    if(task.completed){
      li.classList.add("completed");
    }

    li.draggable = true;

    li.innerHTML = `
      <div class="task-left">
        <h3>${task.text}</h3>

        <div class="task-category">
          ${task.category}
        </div>

        <div class="task-date">
          Due: ${task.date || "No date"}
        </div>
      </div>

      <div class="task-actions">

        <button class="complete-btn">
          ✓
        </button>

        <button class="edit-btn">
          Edit
        </button>

        <button class="delete-btn">
          Delete
        </button>

      </div>
    `;

    // Complete
    li.querySelector(".complete-btn")
    .addEventListener("click", ()=>{

      task.completed = !task.completed;

      saveTasks();

      renderTasks();
    });

    // Delete
    li.querySelector(".delete-btn")
    .addEventListener("click", ()=>{

      tasks = tasks.filter(t=>t.id !== task.id);

      saveTasks();

      renderTasks();
    });

    // Edit
    li.querySelector(".edit-btn")
    .addEventListener("click", ()=>{

      const newText = prompt("Edit task", task.text);

      if(newText !== null){
        task.text = newText;

        saveTasks();

        renderTasks();
      }
    });

    // Drag Start
    li.addEventListener("dragstart", ()=>{
      li.classList.add("dragging");
    });

    // Drag End
    li.addEventListener("dragend", ()=>{
      li.classList.remove("dragging");
    });

    taskList.appendChild(li);
  });
}

taskList.addEventListener("dragover", (e)=>{
  e.preventDefault();

  const dragging = document.querySelector(".dragging");

  const afterElement = getDragAfterElement(taskList, e.clientY);

  if(afterElement == null){
    taskList.appendChild(dragging);
  }else{
    taskList.insertBefore(dragging, afterElement);
  }
});

function getDragAfterElement(container, y){

  const draggableElements = [
    ...container.querySelectorAll(".task:not(.dragging)")
  ];

  return draggableElements.reduce((closest, child)=>{

    const box = child.getBoundingClientRect();

    const offset = y - box.top - box.height / 2;

    if(offset < 0 && offset > closest.offset){

      return {
        offset: offset,
        element: child
      };

    }else{
      return closest;
    }

  }, {
    offset: Number.NEGATIVE_INFINITY
  }).element;
}

function saveTasks(){
  localStorage.setItem("tasks", JSON.stringify(tasks));
}