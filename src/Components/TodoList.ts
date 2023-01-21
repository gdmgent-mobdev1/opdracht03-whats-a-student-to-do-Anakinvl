import { v4 as uuidv4 } from 'uuid';

import { dragoverHandler, dropHandler } from '../Lib/dragAndDrop';
import { addTodoFirebase, deleteTodoListFirebase } from '../lib/firebase-init';
// eslint-disable-next-line import/no-cycle
import Card from './Card';

export default class TodoList {
  place: HTMLElement;

  title: string;

  cardArray: Card[];

  input?: HTMLInputElement;

  div?: HTMLDivElement;

  h2?: HTMLHeadingElement;

  button?: HTMLButtonElement;

  deleteButton?: HTMLButtonElement;

  todoListElement?: string | HTMLElement;

  id: string;

  constructor(place: HTMLElement, title = 'to-do list', id = `_${uuidv4()}`) {
    this.id = id;
    this.place = place;
    this.title = title;
    this.cardArray = [];
    this.id = id;
    this.render();
  }

  async addToDo() {
    if (this.input instanceof HTMLInputElement && this.div instanceof HTMLDivElement) {
      const text = this.input.value;
      const cardId = await addTodoFirebase(text, this.id);
      const newCard = new Card(text, this.div, this, cardId, this.id);
      this.cardArray.push(newCard);
    }
  }

  render(): void {
    this.createToDoListElement();
    if (this.todoListElement instanceof HTMLElement) {
      this.todoListElement.addEventListener('drop', dropHandler);
      this.todoListElement.addEventListener('dragover', dragoverHandler);
      this.place.append(this.todoListElement);
    }
  }
  // todoListElement(todoListElement: any) {
  //   throw new Error("Method not implemented.");
  // }

  createToDoListElement(): void {
    // Create elements
    this.h2 = document.createElement('h2');
    this.h2.innerText = this.title;
    this.input = document.createElement('input');
    this.input.classList.add('comment');
    this.button = document.createElement('button');
    this.button.innerText = 'Add';
    this.button.classList.add('btn-save');
    this.button.id = 'to-do-list-button';
    this.div = document.createElement('div');
    this.deleteButton = document.createElement('button');
    this.deleteButton.classList.add('delete-btn');
    this.todoListElement = document.createElement('div');
    this.todoListElement.id = this.id;
    // Add Event listener
    this.button.addEventListener('click', () => {
      if ((this.input !== null) && this.input?.value !== '') {
        this.addToDo.call(this);
        this.input!.value = '';
      }
    });
    this.deleteButton.addEventListener('click', () => {
      deleteTodoListFirebase(this.id);
      document.querySelector(`#${this.id}`)?.remove();
    });

    // Append elements to the to-do list element
    this.todoListElement.append(this.h2);
    this.todoListElement.append(this.input);
    this.todoListElement.append(this.button);
    this.todoListElement.append(this.div);
    this.todoListElement.append(this.deleteButton);
    this.todoListElement.classList.add('todoList');
  }
}
