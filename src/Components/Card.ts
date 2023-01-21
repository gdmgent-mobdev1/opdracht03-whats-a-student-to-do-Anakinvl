/* eslint-disable import/no-cycle */
import { v4 as uuidv4 } from 'uuid';
import { root, State } from '../Lib';
import { dragstartHandler } from '../Lib/dragAndDrop';
import Comment from './Comment';
import EditableText from './EditableText';
import TodoList from './TodoList';

export default class Card {
  place: HTMLElement;

  todoList: TodoList;

  state: State;

  menuContainer?: HTMLElement;

  card?: HTMLDivElement;

  deleteButton?: HTMLButtonElement;

  p?: HTMLParagraphElement;

  menu?: HTMLDivElement;

  menuTitle?: HTMLDivElement;

  menuDescription?: HTMLDivElement;

  commentsInput?: HTMLInputElement;

  commentsButton?: HTMLButtonElement;

  menuComments?: HTMLDivElement;

  editableDescription?: EditableText;

  editableTitle?: EditableText;

  id: string;

  constructor(text: string, place: HTMLElement, todoList: TodoList) {
    this.id = uuidv4();
    this.place = place;
    this.todoList = todoList;
    this.state = {
      text,
      description: 'Click to write a description...',
      comments: [],
    };
    this.render();
  }

  render(): void {
    this.card = document.createElement('div');
    this.card.classList.add('card');
    this.card.setAttribute('draggable', 'true');
    this.card.id = this.id;
    this.card.addEventListener('click', (e) => {
      if (e.target !== this.deleteButton) {
        this.showMenu.call(this);
      }
    });
    this.card.addEventListener('dragstart', dragstartHandler);

    this.p = document.createElement('p');
    this.p.innerText = this.state.text;

    this.deleteButton = document.createElement('button');
    this.deleteButton.innerText = 'X';
    this.deleteButton.addEventListener('click', () => {
      this.deleteCard.call(this);
    });

    this.card.append(this.p);
    this.card.append(this.deleteButton);

    this.place.append(this.card);
  }

  deleteCard(): void {
    this.card?.remove();
    const i = this.todoList.cardArray.indexOf(this);
    this.todoList.cardArray.splice(i, 1);
  }

  showMenu(): void {
    // Create elements
    this.menu = document.createElement('div');
    this.menuContainer = document.createElement('div');
    this.menuTitle = document.createElement('div');
    this.menuDescription = document.createElement('div');
    this.commentsInput = document.createElement('input');
    this.commentsButton = document.createElement('button');
    this.menuComments = document.createElement('div');

    // Add class names
    this.menu.className = 'menu';
    this.menuContainer.className = 'menuContainer';
    this.menuTitle.className = 'menuTitle';
    this.menuDescription.className = 'menuDescription';
    this.menuComments.className = 'menuComments';
    this.commentsInput.className = 'commentsInput comment';
    this.commentsButton.className = 'commentsButton btn-save';

    // Add inner Text
    this.commentsButton.innerText = 'Add';
    this.commentsInput.placeholder = 'Write a comment...';

    // Event listeners
    this.menuContainer.addEventListener('click', (e: MouseEvent) => {
      if ((e.target as HTMLElement).classList.contains('menuContainer') && (this.menuContainer != null)) {
        this.menuContainer?.remove();
      }
    });

    this.commentsButton.addEventListener('click', () => {
      if (this.commentsInput?.value !== '' && (this.commentsInput != null)) {
        this.state.comments?.push(this.commentsInput.value);
        this.renderComments();
        this.commentsInput.value = '';
      }
    });

    // Append
    this.menu.append(this.menuTitle);
    this.menu.append(this.menuDescription);
    this.menu.append(this.commentsInput);
    this.menu.append(this.commentsButton);
    this.menu.append(this.menuComments);
    this.menuContainer.append(this.menu);
    root.append(this.menuContainer);

    this.editableDescription = new EditableText(this.state.description, this.menuDescription, this, 'description', 'textarea');
    this.editableTitle = new EditableText(this.state.text, this.menuTitle, this, 'text', 'input');

    this.renderComments();
  }

  renderComments(): void {
    if (this.menuComments instanceof HTMLElement && this.menuComments != null) {
      const currentCommentsDOM = Array.from(this.menuComments.childNodes);
      currentCommentsDOM.forEach((commentDOM) => {
        commentDOM.remove();
      });

      this.state.comments?.forEach((comment) => {
        if (this.menuComments instanceof HTMLElement) {
          // eslint-disable-next-line no-new
          new Comment(comment, this.menuComments, this);
        }
      });
    }
  }
}
