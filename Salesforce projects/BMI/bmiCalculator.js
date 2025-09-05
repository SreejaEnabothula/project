import { LightningElement, track } from 'lwc';
import saveBMIRecord from '@salesforce/apex/BMIController.saveBMIRecord';

export function calculateBMI(weight, height, unit='Metric') {
    if (!weight || !height || weight <= 0 || height <= 0) return null;
    let bmi;
    if (unit === 'Imperial') {
        // weight in pounds (lb), height in inches (in), multiply by 703
        bmi = (weight / (height * height)) * 703;
    } else {
        // metric: kg and meters
        bmi = weight / (height * height);
    }
    return Math.round(bmi * 100) / 100; // round to 2 decimals
}

export default class BmiCalculator extends LightningElement {
    @track unit = 'Metric';
    @track weight = null;
    @track height = null;
    @track bmiValue = null;
    @track category = '—';

    unitOptions = [
        { label: 'Metric (kg, m)', value: 'Metric' },
        { label: 'Imperial (lb, in)', value: 'Imperial' }
    ];

    get weightUnitLabel() {
        return this.unit === 'Metric' ? 'kg' : 'lb';
    }
    get heightUnitLabel() {
        return this.unit === 'Metric' ? 'm' : 'in';
    }

    handleUnitChange(e) {
        this.unit = e.detail.value;
        // Recalculate with new unit (if inputs are present)
        this.updateBMI();
    }

    handleWeightInput(e) {
        this.weight = parseFloat(e.target.value);
        this.updateBMI();
    }

    handleHeightInput(e) {
        this.height = parseFloat(e.target.value);
        this.updateBMI();
    }

    updateBMI() {
        const val = calculateBMI(this.weight, this.height, this.unit);
        this.bmiValue = val;
        this.category = this.bmiValue ? this.getBMICategory(this.bmiValue) : '—';
    }

    getBMICategory(bmi) {
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal weight';
        if (bmi < 30) return 'Overweight';
        return 'Obesity';
    }

    get displayBMI() {
        return this.bmiValue === null ? '—' : this.bmiValue;
    }

    get saveDisabled() {
        return !(this.bmiValue && this.weight && this.height);
    }

    handleSave() {
        if (this.saveDisabled) return;
        saveBMIRecord({
            weight: this.weight,
            height: this.height,
            bmi: this.bmiValue,
            unit: this.unit,
            category: this.category
        })
        .then(id => {
            // simple success feedback (improve with Lightning toast)
            // eslint-disable-next-line no-alert
            alert('Saved record Id: ' + id);
        })
        .catch(error => {
            // eslint-disable-next-line no-console
            console.error('Save error', error);
            // eslint-disable-next-line no-alert
            alert('Error saving BMI: ' + (error.body ? error.body.message : error));
        });
    }

    handleReset() {
        this.weight = null;
        this.height = null;
        this.bmiValue = null;
        this.category = '—';
        // clear inputs visually
        this.template.querySelectorAll('input').forEach(i => i.value = '');
    }
}
