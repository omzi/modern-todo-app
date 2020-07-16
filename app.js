// DEFINING CONSTANTS 
const toDoInput = document.querySelector("#todo");
const editInput = document.querySelector("#edit");
const saveEditButton = document.querySelector(".save-edit");
const toDoList = document.querySelector("ul.collection");
const addToDoButton = document.querySelector(".add-todo");
const deleteToDoButton = document.querySelector(".delete-todo");
const clearToDoButton = document.querySelector(".clear-todo");
const actualClearToDoButton = document.querySelector(".actualclear-todo");
const filter = document.querySelector("#filter");



// CURRENT TODO BEFORE EDITING VARIABLE
let currentToDo = "";
// CURRENT DELETED TODO
let currentDeletedToDo = "";
// TODO DELETE STATUS
let deleteStatus = 0;
// SAVE CHANGE STATUS FOR BROWSER POPUP
saveChangeStatus = 0;

const loadEventListeners = () => {
  // DOM LOADED EVENT
  document.addEventListener("DOMContentLoaded", loadToDo);
  // ADD UNDO DELETE LISTENER
  document.addEventListener("click", undoDelete);
  // EDIT TODO EVENT
  document.addEventListener("click", editToDo);
  // ADD TODO EVENT
  addToDoButton.addEventListener("click", addToDo);
  // SAVE TODO EVENT
  saveEditButton.addEventListener("click", saveEdit);
  // DELETE TODO EVENT
  toDoList.addEventListener("click", deleteToDo);
  // CLEAR TODO EVENT
  clearToDoButton.addEventListener("click", clearToDo);
  // ACTUAL CLEAR TODO EVENT
  actualClearToDoButton.addEventListener("click", actualClearToDo);
  // FILTER TODO EVENT
  filter.addEventListener("keyup", filterToDo);
}

// ADD ENTER KEY EVENT LISTENER TO ADD TODO
addEventListener('keydown', (e) => {
  if ((e.key === "Enter") && toDoInput.matches(":focus")) {
    addToDo();
  }
});

// LOAD TODO FROM LOCAL STORAGE IF ANY
const loadToDo = () => {
  let ToDos;
  // CHECK IF "TODO" LOCALSTORAGE ITEM IS AN EMPTY ARRAY OR NULL
  if (localStorage.getItem(':ToDo') === null || (JSON.parse(localStorage.getItem(':ToDo')).length === 0)) {
    // ADD EMPTY CLASS TO LIST ELEMENT
    toDoList.classList.add("empty");
    ToDos = [];
  } else {
    // REMOVE EMPTY CLASS TO LIST ELEMENT
    toDoList.classList.remove("empty");

    ToDos = JSON.parse(localStorage.getItem(':ToDo'));
    ToDos.forEach((todo) => {
      // CREATE LI ELEMENT
      const li = document.createElement("li");
      // ADD CLASS
      li.className = "collection-item valign-wrapper";
      // ADD TEXT CONTENT TO LI
      li.textContent = todo;
      // CREATE ICON BOX ELEMENT
      const span = document.createElement("span");
      // ADD CLASS
      span.className = "icons-box";
      // ADD ICON HTML
      span.innerHTML = `<i class="edit-todo fa fa-pencil"></i><i class="delete-todo fa fa-remove"></i>`;
      // APPEND LINK TO THE LI
      li.appendChild(span);
      // APPEND LI TO THE UL
      toDoList.appendChild(li);
    })
  }
}

// ADD TODO IN DOM AND LOCAL STORAGE
const addToDo = () => {
  let toDo = toDoInput.value;

  // CHECK IF SOME CURIOUS USER LIKE ME ENTERED CHARACTERS NOT SPACES
  if (!/\S/.test(toDo)) {
    addToDoButton.classList.add("disabled");
    M.toast({html: 'Enter a todo', classes: 'red headShake animated', displayLength: 2000 ,completeCallback: function(){addToDoButton.classList.remove("disabled")}});
  } else {
    // REMOVE EMPTY CLASS FROM LIST ELEMENT
    toDoList.classList.remove("empty");
    // CREATE LI ELEMENT
    const li = document.createElement("li");
    // ADD CLASS
    li.className = "collection-item valign-wrapper";
    // ADD TEXT CONTENT TO LI
    li.textContent = toDo;
    // CREATE ICON BOX ELEMENT
    const span = document.createElement("span");
    // ADD CLASS
    span.className = "icons-box";
    // ADD ICON HTML
    span.innerHTML = `<i class="edit-todo fa fa-pencil"></i><i class="delete-todo fa fa-remove"></i>`;
    // APPEND LINK TO THE LI
    li.appendChild(span);
    // APPEND LI TO THE UL
    toDoList.appendChild(li);
    // STORE TODO IN LOCAL STORAGE
    storeToDoInLocalStorage(toDo);
    // CLEAR INPUT
    toDoInput.value = "";
    // BLUR INPUT FOR ENTER KEY
    toDoInput.blur();
    // LABEL STATE UPDATE
    M.updateTextFields();
    // TOAST TODO ADDED
    M.toast({html: 'Your todo has been added', classes: 'green', displayLength: 2000});
  }
}

const storeToDoInLocalStorage = (toDo) => {
  let ToDos;
  if (localStorage.getItem(':ToDo') === null) {
    ToDos = [];
  } else {
    ToDos = JSON.parse(localStorage.getItem(':ToDo'));
  }

  ToDos.push(toDo);
  localStorage.setItem(':ToDo', JSON.stringify(ToDos));
}

const editToDo = (e) => {
  if (e.target.classList.contains("edit-todo")) {
    let editModal = document.querySelector('#edit-modal');
    let modalInstance = M.Modal.init(editModal,{
      dismissible: false
    });
    modalInstance.open();
    editInput.value = e.target.parentElement.parentElement.textContent;
    currentToDo = e.target.parentElement.parentElement.textContent;
    editInput.focus();
    // MAKE MATERIALIZE TEXTAREA DYNAMIC
    M.textareaAutoResize($(editInput));
  }
}

const saveEdit = () => {
  if ((localStorage.getItem(':ToDo') !== null) && (currentToDo !== editInput.value)) {
    saveChangeStatus = 1;
    // GIVE IT A SEMBLANCE OF TAKING TIME TO SAVE
    setTimeout( () => {
      // UPDATE DOM
      document.querySelectorAll(".collection-item").forEach((toDo) => {
        if (toDo.textContent === currentToDo) {
          toDo.innerHTML = editInput.value + `<span class="icons-box"><i class="edit-todo fa fa-pencil"></i><i class="delete-todo fa fa-remove"></i></span>`;
        }
      });
      // CLOSE MODAL PROGRAMMATICALLY
      let editModal = document.querySelector('#edit-modal');
      let modalInstance = M.Modal.init(editModal);
      modalInstance.close();
      document.body.style.overflow = "auto";
      // UPDATE LOCAL STORAGE
      ToDos = JSON.parse(localStorage.getItem(':ToDo'));
      ToDos.forEach((toDo, index) => {
        if (toDo === currentToDo) {
          ToDos[index] = editInput.value;
        }
      });
      localStorage.setItem(":ToDo", JSON.stringify(ToDos));
      M.toast({html: "Your changes have been saved", classes: 'green', displayLength: 3000, completeCallback: function(){
        saveChangeStatus = 0;
      }});
    }, 300);
  }
}

const deleteToDo = (e) => {
  if (e.target.classList.contains("delete-todo")) {
    // ADD DISABLED CLASS TO DELETE BUTTONS TO PREVENT MULTIPLE DELETIONS THAT WILL RESULT IN BUGS
    document.querySelectorAll(".delete-todo").forEach((item) => {
      item.classList.add("delete-disabled");
    });
    saveChangeStatus = 1;
    currentDeletedToDo = e.target.parentElement.parentElement;
    currentDeletedToDo.classList.add("bounceOutLeft", "animated", "slow");
    setTimeout( () => currentDeletedToDo.style.display = "none", 1000);
    // DELETE TOAST
    let deleteText = `<span>Your todo item have been deleted</span><button class="btn-flat toast-action">Undo</button>`;
    // TIMEOUT TO MATCH THE EXACT TIME FOR DELETE ANIMATION TO BE COMPLETED
    setTimeout( () => {
      M.toast({html: deleteText, classes: 'red', displayLength: 7000, completeCallback: function(){
        // REMOVE CURRENT DELETED TODO FROM DOM
        currentDeletedToDo.remove();

        deleteStatus = 1;
        saveChangeStatus = 0;
        deleteToDoFromLocalStorage(currentDeletedToDo.textContent);
      }});
    }, 1000);
  }
}

const deleteToDoFromLocalStorage = (toDoItem) => {
  if (deleteStatus) {
    let ToDos;
    if (localStorage.getItem(':ToDo') === null) {
      ToDos = [];
    } else {
      ToDos = JSON.parse(localStorage.getItem(':ToDo'));
    }

    // LOOP THROUGH ARRAY FROM LS AND DELETE THE TODO
    ToDos.forEach((toDo, index) => {
      if (toDoItem === toDo) {
        ToDos.splice(index, 1);
      }
    });

    // SET THE MODIFIED TODOS TO LOCAL STORAGE
    localStorage.setItem(":ToDo", JSON.stringify(ToDos));

    // REMOVE DISABLED CLASS FROM DELETE BUTTONS IF ANY
    document.querySelectorAll(".delete-todo").forEach((item) => {
      item.classList.remove("delete-disabled");
    });

    // CHECK IF TODO DOM AND LOCAL STORAGE ARE EMPTY
    if ((document.querySelectorAll(".collection-item").length === 0) && (JSON.parse(localStorage.getItem(':ToDo')).length === 0)) {
      // ADD EMPTY CLASS TO LIST ELEMENT
      toDoList.classList.add("empty");
    }
  }
}

const undoDelete = (e) => {
  if (e.target.classList.contains("toast-action")) {
    // REMOVE DISABLED CLASS FROM DELETE BUTTON(S)
    document.querySelectorAll(".delete-todo").forEach((item) => {
      item.classList.remove("delete-disabled");
    });

    saveChangeStatus = 0;
    deleteStatus = 0;

    // DESTROY MATERIALIZE TOAST INSTANCE AND PREVENT CALLBACK FROM HAPPENING
    let deleteToast = M.Toast.getInstance(e.target.parentElement);

    // I HAD TO EDIT MATERIALIZE.MIN.JS TO ADD THIS CUSTOM FUNCTION
    deleteToast.dismissNoCallback();

    // UNDO DELETE BOUNCE BACK ANIMATION
    // OH ANIMATIONS😌😌
    currentDeletedToDo.style.display = "flex";
    currentDeletedToDo.classList.remove("bounceOutLeft");
    currentDeletedToDo.classList.add("bounceInLeft");
  }
}

const clearToDo = () => {
  if (toDoList.hasChildNodes()) {
    let editModal = document.querySelector('#clear-modal');
    let modalInstance = M.Modal.init(editModal,{
      dismissible: false
    });
    modalInstance.open();
  }
}

const actualClearToDo = () => {
  // OPEN MODAL PROGRAMATICALLY
  let editModal = document.querySelector('#clear-modal');
  let modalInstance = M.Modal.init(editModal);
  modalInstance.close();
  document.body.style.overflow = "auto";
  
  // TIMEOUT TO MATCH THE EXACT DURATION OF MODAL CLOSING
  setTimeout(() => {
    let animationDelay = 0;
    toDoList.childNodes.forEach((toDoItem, index) => {
      // THE ACTUAL DELETE
      localStorage.setItem(':ToDo', "[]");
      // OH-SO-SWEET FADE OUT ANIMATION😍
      toDoItem.classList.add("fadeOutRight", "animated");
      toDoItem.style.animationDelay = `${animationDelay}ms`;
      animationDelay += 100;
      setTimeout( () => toDoItem.remove(), 1000);
    });
    let clearToastTimeout = (toDoList.childNodes.length * 100) + 600;
    setTimeout( () => {
      // ADD EMPTY CLASS TO LIST ELEMENT
      toDoList.classList.add("empty");

      // DELETE TOAST
      M.toast({html: "Your todo has been cleared", classes: 'red', displayLength: 3500});
    }, clearToastTimeout);
  }, 250)
}

const filterToDo = () => {
  // TO AVOID COMPLICATIONS
  let searchText = filter.value.toLowerCase();

  document.querySelectorAll(".collection-item").forEach((toDo) => {
    const item = toDo.firstChild.textContent;
    if (item.toLowerCase().indexOf(searchText) != -1) {
      toDo.style.display = "flex";
    } else {
      toDo.style.display = "none";
    }
  });
}

// LOAD EVENT LISTENERS
loadEventListeners();

const goGenesys = () => {
  setTimeout(() => {
    let myGenesysPlans = ["Consume at least 750GB of Genesys Tech Hub's WiFi😎", "GET THAT MACBOOK💻!", "Develop my social & teamwork skills", "Build my developer network", "Meet REAL challenges", "LEVEL UP my programming skills⚡", "Take a well-deserved sleep😴", "Read up ELOQUENT JAVASCRIPT📓!!!"];
    myGenesysPlans.forEach((plan, index) => {
      setTimeout(() => {
        toDoInput.value = plan;
        addToDo()
      }, index * 4000)
    })
  }, 2000)
  return "Here we go😎!";
}

// SHOW MY TODO ON FIRST VISIT
if (localStorage.getItem('ToDoFirstVisit') === null) {
  let ToDoFirstVisit = false;
  localStorage.setItem('ToDoFirstVisit', JSON.stringify(ToDoFirstVisit));
  goGenesys();
}

// PREVENT PAGE FROM CLOSING DURING DELETE ANIMATION BEFORE ACTUAL DELETE
window.onbeforeunload = (e) => {
  if (saveChangeStatus) {
    // UNFORTUNATELY, THIS DOESN'T WORK AS EXPECTED😒
    return "Do you really want to leave my brilliant application?";
  } else {
    return;
  }
};

var consoleStyle = [
  'background-color: #9b59b6'
  , 'background-image: radial-gradient(#000 1px, transparent 1px)'
  , 'background-size: calc(10 * 1px) calc(10 * 1px)'
  , 'border: 1px solid #000'
  , 'color: white'
  , 'display: block'
  , 'text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3)'
  , 'box-shadow: 0 1px 0 rgba(255, 255, 255, 0.4) inset, 0 5px 3px -5px rgba(0, 0, 0, 0.5), 0 -13px 5px -10px rgba(255, 255, 255, 0.4) inset'
  , 'line-height: 30px'
  , 'text-align: center'
  , 'font-weight: bold'
].join(';');

console.log(`
☆┌─┐  ─┐☆
　│▒│ /▒/
　│▒│/▒/
　│▒ /▒/─┬─┐◯
　│▒│▒|▒│▒│
┌┴─┴─┐-┘─┘
│▒┌──┘▒▒▒│◯
└┐▒▒▒▒▒▒┌┘
◯└┐▒▒▒▒┌

Hey there inspector🧐!
`);

console.log('%c If you found any bug in the app or would love to contribute to it, send me a DM on Twitter @o_obioha or send me a mail at obiohaomezibe@gmail.com. 𝘈𝘳𝘪𝘨𝘢𝘵𝘰!', consoleStyle);

/***
#### FUTURE TODO (PUN INTENDED) ####
# Avoid duplicate todo
# Add color scheme change support
# Add Markdown support
# Scroll to the bottom of the todo list and highlight newly added todo
# Make it a full-fledged PWA
# Add extra fields in todo like priority (high, normal, low) & date
# Sort todo by priority and date
***/

// If you found any bug in the app or would love to contribute to it, send me a DM on Twitter @o_obioha or send me a mail at obiohaomezibe@gmail.com