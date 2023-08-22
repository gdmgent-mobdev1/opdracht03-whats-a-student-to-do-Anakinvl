import { Reply } from './Reply'; // Adjust the path accordingly

export default class Question {
  text: string;

  userId: string;

  timestamp: Date;

  replies: Reply[];

  constructor(text: string, userId: string) {
    this.text = text;
    this.userId = userId;
    this.timestamp = new Date();
    this.replies = [];
  }
}
