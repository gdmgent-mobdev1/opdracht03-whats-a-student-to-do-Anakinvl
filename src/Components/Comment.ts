/* eslint-disable import/no-cycle */
import { v4 as uuidv4 } from 'uuid';
import { doc, updateDoc } from 'firebase/firestore';
import Card from './Card';
import { fireStoreDb } from '../lib/firebase-init';

export default class Comment {
  title: string;

  place: HTMLElement;

  card: Card;

  div?: HTMLDivElement;

  id: string;

  constructor(text: string, place: HTMLElement, card: Card) {
    this.title = text;
    this.place = place;
    this.card = card;
    this.id = uuidv4();
    this.render();
  }

  async saveCommentChanges() {
    const cardDocRef = doc(fireStoreDb, 'cards', this.card.id);
    const updatedComments = this.card.state.comments || [];

    await updateDoc(cardDocRef, {
      comments: updatedComments,
    });
  }

  render(): void {
    this.div = document.createElement('div');
    this.div.className = 'comment';
    this.card.id = this.id;
    this.div.innerText = this.title;
    this.place.append(this.div);
  }
}
