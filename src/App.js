/*global chrome*/

import React, { Component, createRef } from "react";
import ClockOutline from "mdi-material-ui/ClockOutline";
import Check from "mdi-material-ui/Check";
import Close from "mdi-material-ui/Close";
import Edit from "mdi-material-ui/FileEdit";
import "./App.css";

class App extends Component {

  constructor(props) {
    super(props);

    this.uid = this.uid.bind(this);
    this.addTodoItem = this.addTodoItem.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.completeTodoItem = this.completeTodoItem.bind(this);
    this.editTodoItem = this.editTodoItem.bind(this);
    this.removeTodoItem = this.removeTodoItem.bind(this);
    this.showHistory = this.showHistory.bind(this);

    this.checklistRef = createRef();
    this.taskInputRef = createRef();

    this.state = { todos: [] };

    var setFromStorage = function (result) {
      this.setState({
        todos: result,
      });
    }.bind(this);

    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(["task-oriented-todo-items"], function (result) {
        console.log("result from storage: ");
        console.log(result);

        if (result["task-oriented-todo-items"]) {
          setFromStorage(result["task-oriented-todo-items"]);
        }
      });
    }
  }

  uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  showHistory() {
    var includeCompleted = !this.state.includeCompleted;

    this.setState({ includeCompleted: includeCompleted });
  }

  addTodoItem(event) {
    if (event.key === "Enter" && event.target && event.target !== "") {
      console.log("adding new todo item");

      var newItem = {
        key: this.uid(),
        text: event.target.value,
        created: new Date().toUTCString(),
      };

      event.target.value = "";
      this.setState({ 
        todos: [...this.state.todos, newItem],
        currentTodoText: ""
      });
    }
  }

  handleChange(event) {
    this.setState({
      currentTodoText: event.target.value
    });
  }

  completeTodoItem(key) {
    console.log("completing todo item");
    var index = this.state.todos.findIndex(function (item) {
      return item.key === key;
    });

    if (index === -1) return;

    let todos = [...this.state.todos];

    let todo = todos[index];

    todos[index] = todo;

    todo.completed = new Date().toUTCString();

    this.setState({ todos: todos });
  }

  editTodoItem(key) {
    console.log("editing todo item");
    var index = this.state.todos.findIndex(function (item) {
      return item.key === key;
    });

    if (index === -1) return;

    this.removeTodoItem(key);

    this.setState({ currentTodoText: this.state.todos[index].text}, () => {
      this.taskInputRef.current.focus();
    });
  }

  removeTodoItem(key) {
    console.log("removing todo item");
    var index = this.state.todos.findIndex(function (item) {
      return item.key === key;
    });

    if (index === -1) return;

    var todos = [...this.state.todos];

    todos.splice(index, 1);

    this.setState({ todos: todos });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ "task-oriented-todo-items": this.state.todos });
    }
  }

  render() {
    var reminderData = [
      { label: "practice location" },
      { label: "vitals" },
      { label: "verify diagnoses" },
      { label: "treatment plan" },
      { label: "medication risks" },
      { label: "send medications" },
    ];

    var reminders = reminderData.map(function (item, index) {
      return (
        <div className="task-item" key={"task-item-" + index}>
          <ul>
            <li> {item.label} </li>
          </ul>
        </div>
      );
    }, this);

    var actionButtons = function (todoItem) {
      if (!todoItem.completed) {
        return (
          <div className="item-action-buttons">
            <button className="circle-btn complete" title="complete" onClick={this.completeTodoItem.bind(null, todoItem.key)}>
              <Check />
            </button>

            <button className="circle-btn edit" title="edit" onClick={this.editTodoItem.bind(null, todoItem.key)}>
              <Edit />
            </button>
            
            <button className="circle-btn remove" title="remove" onClick={this.removeTodoItem.bind(null, todoItem.key)}>
              <Close />
            </button>
            
          </div>
        );
      }

      return (
        <div className="item-action-buttons">
          <button className="circle-btn remove" title="remove" onClick={this.removeTodoItem.bind(null, todoItem.key)}>
            <Close />
          </button>
        </div>
      );
    }.bind(this);

    var todos = this.state.todos
      .filter(function (todoItem) {
        return this.state.includeCompleted || !todoItem.completed;
      }, this)
      .map(function (todoItem, index) {
        var itemComplete = todoItem.completed ? "completed" : "";
        return (
          <div className={"todo-item " + itemComplete} key={"todo-item-" + index}>
            <div className="item-text">{todoItem.text}</div>
            <div className="item-info">
              <div className="item-created">{new Date(todoItem.created).toLocaleString()}</div>
            </div>
            {actionButtons(todoItem)}
          </div>
        );
      }, this);

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Task Oriented </h1>
        </header>

        <hr className="solid" />

        <div className="task-list" ref={this.checklistRef}>
          {reminders}
        </div>

        <hr className="solid" />

        <div className="todo-list">
          <div className="todo-list-header">
            <button className={"circle-btn " + (this.state.includeCompleted ? "selected" : "")} title="show history" onClick={this.showHistory}>
              <ClockOutline />
            </button>
          </div>
          <div className="todo-input">
            <input name="currentTodoText" type="text" value={this.state.currentTodoText} 
            ref={this.taskInputRef}
            onKeyUp={this.addTodoItem}
            onChange={this.handleChange}></input>
          </div>
          {todos}
        </div>
      </div>
    );
  }
}

export default App;
