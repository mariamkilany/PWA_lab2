const app = (() => {
  "use strict";

  var dbPromise = idb.open("todoDb", 1, function (upgradeDB) {
    upgradeDB.createObjectStore("todos", { keyPath: "title" });
  });

  //add days
  for (let i = 1; i <= 30; i++) {
    document.getElementById(
      "day"
    ).innerHTML += `<option value=${i}>${i}</option>`;
  }
  //add months
  for (let i = 1; i <= 12; i++) {
    document.getElementById(
      "month"
    ).innerHTML += `<option value=${i}>${i}</option>`;
  }
  //add years
  for (let i = 2024; i <= 2030; i++) {
    document.getElementById(
      "year"
    ).innerHTML += `<option value=${i}>${i}</option>`;
  }
  //get all todos
  function getAllTodos() {
    return dbPromise.then(function (db) {
      var tx = db.transaction("todos", "readonly");
      var store = tx.objectStore("todos");
      return store.getAll();
    });
  }
  //get all todos
  async function printToDOs() {
    var results = await getAllTodos();
    document.getElementsByTagName("ul")[0].innerHTML = "";
    for (let i = 0; i < results.length; i++) {
      const currentDate = new Date();
      const todoDate = new Date(results[i].date);
      if (currentDate.getTime() >= todoDate.getTime()) {
        if (!results[i].checked) {
          displayNotification(results[i].title);
          updateTodo(results[i]);
        }
        document.getElementsByTagName("ul")[0].innerHTML += `<li>  
          <h3 class="line-through">${results[i].title}</h3>
            <h4 class="line-through">${results[i].date.toISOString()}</h4>
            <button class="delete" id="${results[i].title}">❌</button>
        </li>`;
      } else {
        document.getElementsByTagName("ul")[0].innerHTML += `<li>  
           <h3 >${results[i].title}</h3>
            <h4 >${results[i].date.toISOString()}</h4>
            <button class="delete" id="${results[i].title}">❌</button>
        </li>`;
      }
    }
    var elements = document.getElementsByClassName("delete");
    for (let i = 0; i < elements.length; i++) {
      elements[i].addEventListener("click", deleteTodo);
    }
  }

  document.getElementById("add").addEventListener("click", addTodo);
  //add todos to indexedDB
  function addTodo() {
    return dbPromise
      .then(function (db) {
        //1)create transaction
        var tx = db.transaction("todos", "readwrite");
        //2)access to table
        var store = tx.objectStore("todos");
        //3)get values
        var title = document.getElementById("title").value;
        var hours = document.getElementById("hours").value;
        var mins = document.getElementById("mins").value;
        var day = document.getElementById("day").value;
        var month = document.getElementById("month").value;
        var year = document.getElementById("year").value;
        var date = new Date(year, month - 1, day, hours, mins);
        var myTodo = { title, date, checked: false };
        return store.add(myTodo);
      })
      .catch(function () {
        tx.abort();
      })
      .then(function () {
        printToDOs();
      });
  }
  //check for todo every half second
  setInterval(() => {
    printToDOs();
  }, 500);
  //delete todo from indexedDB
  function deleteTodo() {
    var id = event.target.id;
    return dbPromise
      .then(function (db) {
        //1)create transaction
        var tx = db.transaction("todos", "readwrite");
        //2)access to table
        var store = tx.objectStore("todos");
        return store.delete(id);
      })
      .catch(function () {
        tx.abort();
      })
      .then(function () {
        printToDOs();
      });
  }
  //update todo from indexedDB
  function updateTodo(obj) {
    return dbPromise.then(function (db) {
      //1)create transaction
      var tx = db.transaction("todos", "readwrite");
      //2)access to table
      var store = tx.objectStore("todos");
      obj.checked = true;
      return store.put(obj);
    });
  }
  //ask for notification permision
  Notification.requestPermission((status) => {
    console.log("Notification Permission ", status);
  });
  //display notification
  function displayNotification(taskTitle) {
    // TODO 2.3 - display a Notification
    if (Notification.permission == "granted") {
      navigator.serviceWorker.getRegistration().then((reg) => {
        const options = {
          body: `Task ${taskTitle} has expired..`,
          icon: "../to-do-list.png",
        };
        reg.showNotification("Task Expired !", options);
      });
    }
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("sw.js")
        .then((swReg) => {
          console.log("Service Worker is registered", swReg);
          swRegistration = swReg;
        })
        .catch((err) => {
          console.error("Service Worker Error", err);
        });
    });
  } else {
    console.warn("Push messaging is not supported");
  }
})();
