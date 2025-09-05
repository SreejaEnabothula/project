import { LightningElement, api } from 'lwc';

export default class TimeSelector extends LightningElement {
  @api hour = '12';
  @api minute = '00';
  @api ampm = 'AM';

  get hourOptions() {
    return Array.from({ length: 12 }, (_, i) => {
      const v = String(i + 1);
      return { label: v, value: v, selected: v === this.hour };
    });
  }

  get minuteOptions() {
    return Array.from({ length: 60 }, (_, i) => {
      const val = i < 10 ? `0${i}` : `${i}`;
      return { label: val, value: val, selected: val === this.minute };
    });
  }

  get isAm() {
    return this.ampm === 'AM';
  }

  get isPm() {
    return this.ampm === 'PM';
  }

  handleChange(event) {
    const field = event.target.dataset.field;
    if (field === 'hour') this.hour = event.target.value;
    if (field === 'minute') this.minute = event.target.value;
    if (field === 'ampm') this.ampm = event.target.value;

    const detail = { hour: this.hour, minute: this.minute, ampm: this.ampm };
    this.dispatchEvent(new CustomEvent('timeselected', {
      detail,
      bubbles: true,
      composed: true
    }));
  }
}
