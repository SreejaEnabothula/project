import { LightningElement, track } from 'lwc';

export default class ClockDisplay extends LightningElement {
    @track time;

    connectedCallback() {
        this.updateTime();
        setInterval(() => this.updateTime(), 1000); // update every second
    }

    updateTime() {
        const date = new Date();
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        this.time = `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')} ${ampm}`;
    }
}
