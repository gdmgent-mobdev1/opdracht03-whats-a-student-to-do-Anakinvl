import { Property } from '../lib';
// eslint-disable-next-line import/no-cycle
import Card from './Card';

export default class EditableText {
  text: string;

  place: HTMLElement;

  card: Card;

  typeOfInput: string;

  div?: HTMLDivElement;

  p?: HTMLParagraphElement;

  input?: HTMLInputElement;

  saveButton?: HTMLButtonElement;

  property: Property;

  constructor(
    text: string,
    place: HTMLElement,
    card: Card,
    property:
    Property,
    typeOfInput: string,
  ) {
    this.text = text;
    this.place = place;
    this.card = card;
    this.property = property;
    this.typeOfInput = typeOfInput;
    this.render();
  }

  render(): void {
    this.div = document.createElement('div');
    this.p = document.createElement('p');

    this.p.innerText = this.text;

    this.p.addEventListener('click', () => {
      this.showEditableTextArea.call(this);
    });

    this.div.append(this.p);
    this.place.append(this.div);
  }

  showEditableTextArea(): void {
    const oldText = this.text;

    this.input = document.createElement(this.typeOfInput) as HTMLInputElement;
    this.saveButton = document.createElement('button');
    if (this.p instanceof HTMLParagraphElement) { this.p.remove(); }
    this.input.value = oldText;
    this.saveButton.innerText = 'Save';
    this.saveButton.className = 'btn-save';
    this.input.classList.add('comment');

    this.saveButton.addEventListener('click', () => {
      console.log(this);
      if (this.input instanceof HTMLTextAreaElement || this.input instanceof HTMLInputElement) {
        this.text = this.input.value;
      }

      if (this.property === 'description' && this.input != null) {
        this.card.state.description = this.input.value;
      }

      if (this.property === 'text' && this.input != null && this.card.p != null) {
        this.card.p.innerText = this.input.value;
        this.card.state.text = this.input.value;
      }

      this.div?.remove();
      this.render();
    });

    function clickSaveButton(event: KeyboardEvent, object: { saveButton: HTMLElement }): void {
      // Number 13 is the "Enter" key on the keyboard
      if (event.key === 'Enter') {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        object.saveButton.click();
      }
    }

    this.input.addEventListener('keyup', (e: KeyboardEvent) => {
      if (this.typeOfInput === 'input') {
        clickSaveButton(e, this as { saveButton: HTMLElement });
      }
    });

    this?.div?.append(this.input);

    if (this.typeOfInput === 'textarea') {
      this?.div?.append(this.saveButton);
    }

    this.input.select();
  }
}
