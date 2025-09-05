import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AlarmClock extends LightningElement {
  currentTime = '';
  @track alarms = [];
  newLabel = '';
  selectedTime = ''; // "H:MM AM/PM"
  intervalId;

  connectedCallback() {
    // load persisted alarms
    try {
      const stored = localStorage.getItem('alarms');
      this.alarms = stored ? JSON.parse(stored) : [];
    } catch (e) {
      this.alarms = [];
    }

    this.updateTime(); // immediate display
    this.intervalId = setInterval(() => {
      this.updateTime();
      this.checkAlarms();
    }, 1000);
  }

  disconnectedCallback() {
    clearInterval(this.intervalId);
  }

  updateTime() {
    const now = new Date();
    let hh = now.getHours();
    const mm = now.getMinutes();
    const ampm = hh >= 12 ? 'PM' : 'AM';
    hh = hh % 12;
    if (hh === 0) hh = 12;
    const displayMinute = mm < 10 ? `0${mm}` : `${mm}`;
    this.currentTime = `${hh}:${displayMinute} ${ampm}`;
  }

  handleTimeSelected(event) {
    const { hour, minute, ampm } = event.detail;
    this.selectedTime = `${hour}:${minute} ${ampm}`;
  }

  handleLabel(event) {
    this.newLabel = event.target.value;
  }

  addAlarm() {
    if (!this.selectedTime) {
      this.showToast('Error', 'Select a time before adding an alarm', 'error');
      return;
    }

    const alarm = {
      id: Date.now().toString(),
      label: this.newLabel || 'Alarm',
      time: this.selectedTime,
      active: true
    };

    this.alarms = [...this.alarms, alarm];
    this.persistAlarms();
    this.showToast('Success', `Alarm set for ${alarm.time}`, 'success');

    // reset label (not resetting selectedTime to keep UX)
    this.newLabel = '';
  }

  checkAlarms() {
    if (!this.alarms.length) return;

    // Compare formatted strings (simple and reliable for 1-minute precision)
    this.alarms.forEach(alarm => {
      if (alarm.active && alarm.time === this.currentTime) {
        this.fireAlarm(alarm);
      }
    });
  }

  fireAlarm(alarm) {
    // Visual notification
    this.showToast(`Alarm: ${alarm.label}`, `${alarm.time} — Ring!`, 'info');

    // Mark alarm as done (or remove — choose your behavior)
    this.alarms = this.alarms.map(a => a.id === alarm.id ? { ...a, active: false } : a);
    this.persistAlarms();

    // Optional: dispatch event for other components
    this.dispatchEvent(new CustomEvent('alarmfired', { detail: alarm }));
  }

  handleDeleteAlarm(event) {
    const id = event.detail.id;
    this.alarms = this.alarms.filter(a => a.id !== id);
    this.persistAlarms();
    this.showToast('Deleted', 'Alarm removed', 'info');
  }

  persistAlarms() {
    try {
      localStorage.setItem('alarms', JSON.stringify(this.alarms));
    } catch (e) {
      // ignore persistence errors
    }
  }

  showToast(title, message, variant) {
    this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
  }
}
