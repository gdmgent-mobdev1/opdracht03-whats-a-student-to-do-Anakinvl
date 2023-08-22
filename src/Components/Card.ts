/* eslint-disable import/no-cycle */
// import { v4 as uuidv4 } from 'uuid';
import {
  doc as firestoreDoc, collection, addDoc, getDocs, setDoc, query,
  where,
} from 'firebase/firestore';
import { fireStoreDb } from '../lib/firebase-init';
import { root, State } from '../lib';
import { dragstartHandler } from '../lib/dragAndDrop';
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

  userId: string;

  listId: string;

  cardId: string;

  // firestoreDocRef: any;
  firestoreDocRef: any;

  constructor(
    text: string,
    place: HTMLElement,
    todoList: TodoList,
    cardId: string,
    userId: string,
    // beschrijving: string,
    // deadline: string,
    // checklist: string,
    // ledenDeelnemers: string,
    // gespendeerdeTijd: string,
    // comments: [],
  ) {
    this.id = cardId;
    this.place = place;
    this.todoList = todoList;
    this.userId = userId;
    this.state = {
      id: this.id,
      title: 'Title',
      text,
      description: 'Click to write a description...',
      comments: [],
    };

    this.listId = todoList.id; // Store the list ID in the card instance
    this.cardId = cardId;
    const userDocRef = firestoreDoc(fireStoreDb, 'users', userId);
    const listDocRef = firestoreDoc(userDocRef, 'lists', todoList.id);
    // Create a reference to the card's document in the comments subcollection
    this.firestoreDocRef = firestoreDoc(listDocRef, 'comments', cardId);

    this.firestoreDocRef = firestoreDoc(fireStoreDb, 'cards', cardId);
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

    // Create elements for title, description, and comments
    this.p = document.createElement('p');
    this.p.innerText = this.state.text;

    this.menu = document.createElement('div');
    this.menu.className = 'menu';

    this.menuContainer = document.createElement('div');
    this.menuContainer.className = 'menuContainer';

    this.menuTitle = document.createElement('div');
    this.menuTitle.className = 'menuTitle';
    this.editableTitle = new EditableText(this.state.text, this.menuTitle, this, 'text', 'input');

    this.menuDescription = document.createElement('div');
    this.menuDescription.className = 'menuDescription';
    this.editableDescription = new EditableText(this.state.description, this.menuDescription, this, 'description', 'textarea');

    this.menuComments = document.createElement('div');
    this.menuComments.className = 'menuComments';

    // // Add Beschrijving field
    // const beschrijvingEditable = new EditableText(
    //   this.state.beschrijving,
    //   this.menuDescription,
    //   this,
    //   'description',
    //   'textarea',
    // );

    // // Add Deadline field
    // const deadlineEditable = new EditableText(
    //   this.state.deadline,
    //   this.menuTitle,
    //   this,
    //   'deadline',
    //   'input',
    // );

    // // Add Checklist field
    // const checklistEditable = new EditableText(
    //   this.state.checklist,
    //   this.menuComments, // Update this to the appropriate container
    //   this,
    //   'checklist',
    //   'textarea',
    // );

    // // Add Leden/deelnemers field
    // const ledenDeelnemersEditable = new EditableText(
    //   this.state.ledenDeelnemers,
    //   this.div,
    //   this,
    //   'textarea',
    //   'ledenDeelnemers',
    // );

    // // Add Gespendeerde tijd field
    // const gespendeerdeTijdEditable = new EditableText(
    //   this.state.gespendeerdeTijd,
    //   this.div,
    //   this,
    //   'input',
    //   'gespendeerdeTijd',
    // );

    // if (this.property === 'description' && this.input != null) {
    //   this.card.state.beschrijving = this.input.value;
    // }

    // if (this.property === 'deadline' && this.input != null) {
    //   this.card.state.deadline = this.input.value;
    // }

    // if (this.property === 'checklist' && this.input != null) {
    //   this.card.state.checklist = this.input.value;
    // }

    // if (this.property === 'ledenDeelnemers' && this.input != null) {
    //   this.card.state.ledenDeelnemers = this.input.value;
    // }

    // if (this.property === 'gespendeerdeTijd' && this.input != null) {
    //   this.card.state.gespendeerdeTijd = this.input.value;
    // }

    // Render comments on the UI
    this.renderComments();

    // Create and set up the delete button
    this.deleteButton = document.createElement('button');
    this.deleteButton.innerText = 'X';
    this.deleteButton.addEventListener('click', () => {
      this.deleteCard.call(this);
    });

    // Append elements to the card
    this.card.append(this.p);
    this.card.append(this.menuContainer);
    this.card.append(this.deleteButton);

    this.place.append(this.card);
  }

  async fetchAndRenderComments() {
    const commentsCollectionRef = collection(fireStoreDb, 'comments');

    // Fetch comments with matching listId and cardId
    const querySnapshot = await getDocs(
      query(
        commentsCollectionRef,
        where('listId', '==', this.listId),
        where('cardId', '==', this.cardId),
      ),
    );

    const commentsData = querySnapshot.docs.map((doc) => doc.data().text);

    // Update the state with fetched comments
    this.state.comments = commentsData;

    // Render comments on the UI
    this.renderComments();
  }

  async addComment(commentText: string) {
    const commentsCollectionRef = collection(fireStoreDb, 'comments');

    await addDoc(commentsCollectionRef, {
      listId: this.listId,
      cardId: this.cardId,
      text: commentText,
      timestamp: new Date(),
    });

    // Fetch and render updated comments
    await this.fetchAndRenderComments();
  }

  async saveCommentChanges() {
    if (this.firestoreDocRef) {
      // Get the document reference for this card within the comments subcollection
      const cardCommentDocRef = firestoreDoc(
        fireStoreDb,
        'comments',
        `${this.listId}-${this.cardId}`, // Use a combined ID for the card's comment document
      );

      // Fetch the existing comments from the state
      const existingComments = this.state.comments || [];

      // Update the comments in the card's subcollection document
      await setDoc(cardCommentDocRef, { comments: existingComments });
    }
  }

  async deleteComment(comment: Comment) {
    const commentIndex = this.state.comments?.indexOf(comment.title);
    if (commentIndex !== undefined && commentIndex !== -1) {
      this.state.comments?.splice(commentIndex, 1);
      this.renderComments();
      await this.saveCommentChanges(); // Update comments in Firestore
    }
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

    this.commentsButton.addEventListener('click', async () => {
      if (this.commentsInput && this.commentsInput.value !== '') {
        this.state.comments?.push(this.commentsInput.value);
        this.renderComments();
        this.commentsInput.value = '';
        await this.saveCommentChanges();
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
