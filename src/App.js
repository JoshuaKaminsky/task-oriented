/*global chrome*/

import React, { Component, createRef } from "react";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);

    this.uid = this.uid.bind(this);
    this.addTodoItem = this.addTodoItem.bind(this);
    this.completeTodoItem = this.completeTodoItem.bind(this);
    this.removeTodoItem = this.removeTodoItem.bind(this);
    this.resetCheckboxes = this.resetCheckboxes.bind(this);
    this.showHistory = this.showHistory.bind(this);

    this.checklistRef = createRef();

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

  resetCheckboxes() {
    this.checklistRef.current.querySelectorAll("input").forEach(function (input) {
      input.checked = false;
    });
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
      this.setState({ todos: [...this.state.todos, newItem] });
    }
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
    var checkboxData = [
      { value: "item1", label: "Set practice location" },
      { value: "item2", label: "Get patient vitals" },
      { value: "item3", label: "Review diagnoses" },
      { value: "item4", label: "Review treatment plan" },
      { value: "item5", label: "Review medication risks" },
      { value: "item6", label: "Send medications" },
    ];

    var checkboxes = checkboxData.map(function (item, index) {
      return (
        <div className="task-item" key={"task-item-" + index}>
          <input id={item.value} type="checkbox"></input>
          <label htmlFor={item.value}> {item.label} </label>
        </div>
      );
    }, this);

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
            <div className="item-action-buttons">
              <button
                className="circle-btn complete"
                title="complete"
                onClick={this.completeTodoItem.bind(null, todoItem.key)}
              >
                <span>✓</span>
              </button>
              <button
                className="circle-btn remove"
                title="remove"
                onClick={this.removeTodoItem.bind(null, todoItem.key)}
              >
                <span>X</span>
              </button>
            </div>
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
          <div className="task-list-header">
            <button className="circle-btn" title="reset" onClick={this.resetCheckboxes}>
              <span>R</span>
            </button>
          </div>
          {checkboxes}
        </div>

        <hr className="solid" />

        <div className="todo-list">
          <div className="todo-list-header">
            <button className="circle-btn" title="show history" onClick={this.showHistory}>
              <span>A</span>
            </button>
          </div>
          <div className="todo-input">
            <input type="text" onKeyUp={this.addTodoItem}></input>
          </div>
          {todos}
        </div>
      </div>
    );
  }
}

export default App;
