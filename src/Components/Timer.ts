export default class Timer {
  private milliseconds: number = 0;

  private seconds: number = 0;

  private minutes: number = 0;

  private hours: number = 0;

  private int: any = null;

  private timerRef: any;

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

  private displayTimer() {
    this.milliseconds += 10;
    if (this.milliseconds === 1000) {
      this.milliseconds = 0;
      // eslint-disable-next-line no-plusplus
      this.seconds++;
      if (this.seconds === 60) {
        this.seconds = 0;
        // eslint-disable-next-line no-plusplus
        this.minutes++;
        if (this.minutes === 60) {
          this.minutes = 0;
          // eslint-disable-next-line no-plusplus
          this.hours++;
        }
      }
    }
    const h = this.hours < 10 ? `0${this.hours}` : this.hours;
    const m = this.minutes < 10 ? `0${this.minutes}` : this.minutes;
    const s = this.seconds < 10 ? `0${this.seconds}` : this.seconds;
    // eslint-disable-next-line no-nested-ternary
    const ms = this.milliseconds < 10
      ? `00${this.milliseconds}`
      : this.milliseconds < 100
        ? `0${this.milliseconds}`
        : this.milliseconds;
    this.timerRef.innerHTML = ` ${h} : ${m} : ${s} : ${ms}`;
  }

  const timer = new Timer();
}
