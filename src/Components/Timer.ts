import {
  collection, addDoc,
} from 'firebase/firestore';

import { fireStoreDb } from '../lib/firebase-init';

export default class Timer {
  private milliseconds: number = 0;

  private seconds: number = 0;

  private minutes: number = 0;

  private hours: number = 0;

  public int: any = null;

  private timerRef: any;

  private startTime: number | null = null;

  private elapsedTime: number = 0;

  private paused: boolean = true;

  constructor() {
    this.timerRef = document.querySelector('.display_timer');
    document.getElementById('start-timer')?.addEventListener('click', () => {
      if (this.int !== null) {
        clearInterval(this.int);
      }
      this.int = setInterval(this.displayTimer.bind(this), 10);
    });
    document.getElementById('pause-timer')?.addEventListener('click', () => {
      clearInterval(this.int);
    });
    document.getElementById('reset_timer')?.addEventListener('click', () => {
      clearInterval(this.int);
      this.milliseconds = 0;
      this.seconds = 0;
      this.minutes = 0;
      this.hours = 0;
      this.timerRef.innerHTML = '00 : 00 : 00 : 000 ';
    });
  }

  public startTimerWithTargetTime(targetTime: number) {
    if (this.paused) {
      this.startTime = Date.now() - this.elapsedTime;
      this.paused = false;
      this.int = setInterval(this.displayTimer.bind(this), 10);
    }
  }

  public pauseTimer() {
    if (!this.paused) {
      clearInterval(this.int);
      this.paused = true;
      this.elapsedTime = Date.now() - this.startTime;
    }
  }

  public updateTimerDisplay() {
    const h = Math.floor(this.milliseconds / 3600000);
    const m = Math.floor((this.milliseconds % 3600000) / 60000);
    const s = Math.floor((this.milliseconds % 60000) / 1000);
    const ms = this.milliseconds % 1000;

    const hh = h < 10 ? `0${h}` : h.toString();
    const mm = m < 10 ? `0${m}` : m.toString();
    const ss = s < 10 ? `0${s}` : s.toString();
    const mss = ms < 10 ? `00${ms}` : ms < 100 ? `0${ms}` : ms.toString();
    const formattedTime = `${hh} : ${mm} : ${ss} : ${mss}`;
    this.timerRef.innerHTML = formattedTime;
  }

  public startTimer(projectId: string) {
    // Start the timer and associate it with the specified project
    // Save the timer start time and project ID in Firestore
    const timerSessionRef = collection(fireStoreDb, 'timerSessions');
    const startTime = new Date();
    const timerSessionData = {
      projectId,
      startTime,
    };
    addDoc(timerSessionRef, timerSessionData);

    if (this.int !== null) {
      clearInterval(this.int);
    }
    this.int = setInterval(this.displayTimer.bind(this), 10);
  }

  private displayTimer() {
    if (!this.paused && this.startTime !== null) {
      const currentTime = Date.now();
      this.elapsedTime = currentTime - this.startTime;

      // Calculate hours, minutes, seconds, and milliseconds
      const h = Math.floor(this.elapsedTime / 3600000);
      const m = Math.floor((this.elapsedTime % 3600000) / 60000);
      const s = Math.floor((this.elapsedTime % 60000) / 1000);
      const ms = this.elapsedTime % 1000;

      // Format the time values with leading zeros if needed
      const hh = h < 10 ? `0${h}` : h.toString();
      const mm = m < 10 ? `0${m}` : m.toString();
      const ss = s < 10 ? `0${s}` : s.toString();
      const mss = ms < 10 ? `00${ms}` : ms < 100 ? `0${ms}` : ms.toString();

      // Update the timer display with the formatted time
      const formattedTime = `${hh} : ${mm} : ${ss} : ${mss}`;
      this.timerRef.innerHTML = formattedTime;
    }
  }
}
