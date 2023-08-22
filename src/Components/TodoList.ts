import { v4 as uuidv4 } from 'uuid';
import {
  collection, getDocs, doc as firestoreDoc, setDoc,
} from 'firebase/firestore';
import { fireStoreDb, deleteTodoListFirebase } from '../lib/firebase-init';
import { dragoverHandler, dropHandler } from '../lib/dragAndDrop';

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

  userId: string;

  cardsCollection: ReturnType<typeof collection>;

  constructor(place: HTMLElement, userId: string, title = 'to-do list', id = `_${uuidv4()}`) {
    this.id = id;
    this.place = place;
    this.userId = userId;
    this.title = title;
    this.cardArray = [];
    this.id = id;
    this.cardsCollection = collection(fireStoreDb, 'cards'); // Update with the correct collection path
    this.fetchAndDisplayCards(); // Fetch and display cards when creating a new TodoList
    this.render();
  }

  async fetchAndDisplayCards() {
    const cardsData = await this.fetchCardsFromFirestore();
    cardsData.forEach((cardData) => {
      const newCard = new Card(cardData.text, this.div!, this, cardData.id, this.userId);
      this.cardArray.push(newCard);
    });
  }

  async fetchCardsFromFirestore() {
    const cardsSnapshot = await getDocs(this.cardsCollection);
    const cardsData = cardsSnapshot.docs.map((doc) => {
      const cardData = doc.data();
      return {
        id: doc.id,
        text: cardData.text,
      };
    });

    return cardsData;
  }

  async addToDo() {
    if (this.input instanceof HTMLInputElement && this.div instanceof HTMLDivElement) {
      const beschrijving = prompt('Enter Beschrijving:'); // Get Beschrijving from user input
      const deadline = prompt('Enter Deadline:'); // Get Deadline from user input
      const checklist = prompt('Enter Checklist:'); // Get Checklist from user input
      const ledenDeelnemers = prompt('Enter Leden/deelnemers:'); // Get Leden/deelnemers from user input
      const gespendeerdeTijd = prompt('Enter Gespendeerde tijd:'); // Get Gespendeerde tijd from user input

      const todoId = uuidv4(); // Generate a unique ID for the todo
      const todoData = {
        text: this.input.value,
        beschrijving,
        deadline,
        checklist,
        ledenDeelnemers,
        gespendeerdeTijd,
      };

      // Reference the specific project's todos collection
      const projectTodosCollectionRef = collection(fireStoreDb, `users/${this.userId}/projects/${this.id}/todos`);

      // Add the todo directly under the project's todos collection
      const todoDocRef = firestoreDoc(projectTodosCollectionRef, todoId);
      await setDoc(todoDocRef, todoData);

      const newCard = new Card(this.input.value, this.div, this, todoId, this.userId);
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
