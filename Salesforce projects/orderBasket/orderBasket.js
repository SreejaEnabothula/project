import { LightningElement, api } from 'lwc';
import getOrderItems from '@salesforce/apex/OrderBasketController.getOrderItems';
import updateQuantities from '@salesforce/apex/OrderBasketController.updateQuantities';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class OrderProductBasket extends LightningElement {
  @api recordId;

  orderIdInput = '';
  rows = [];
  draftValues = [];
  loading = false;

  // ✅ Include Line Total column
  columns = [
    { label: 'Product', fieldName: 'productName' },
    { label: 'Unit Price', fieldName: 'unitPrice', type: 'currency' },
    {
      label: 'Quantity',
      fieldName: 'quantity',
      type: 'number',
      editable: true,
      typeAttributes: {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        step: '0.01',
        min: 0
      }
    },
    { label: 'Line Total', fieldName: 'lineTotal', type: 'currency' }  // 👈
  ];

  connectedCallback() {
    if (this.recordId) {
      this.loadData();
    }
  }

  get effectiveOrderId() {
    return (this.recordId || this.orderIdInput || '').trim();
  }

  get hasRows() {
    return this.rows && this.rows.length > 0;
  }

  // ✅ Basket Total = sum of line totals
  get basketTotal() {
    return (this.rows || []).reduce((sum, r) => sum + (r.lineTotal || 0), 0);
  }

  get isUpdateDisabled() {
    return !this.draftValues || this.draftValues.length === 0;
  }

  // UI handlers
  handleOrderIdChange(e) {
    this.orderIdInput = e.target.value;
  }
  handleLoad() {
    this.loadData();
  }
  handleCellChange(e) {
    this.mergeDrafts(e.detail.draftValues || []);
  }
  handleSave(e) {
    const changes = e.detail.draftValues || [];
    this.saveChanges(changes);
  }
  handleUpdateButton() {
    this.saveChanges(this.draftValues);
  }

  // ✅ Calculate lineTotal for each row
  loadData() {
    const oid = this.effectiveOrderId;
    if (!oid) {
      this.toast('Order Id required', 'Enter an Order Id or place the component on an Order record page.', 'warning');
      return;
    }
    this.loading = true;
    getOrderItems({ orderId: oid })
      .then(data => {
        const safe = data || [];

        // 👇 lineTotal = quantity × unitPrice
        this.rows = safe.map(d => ({
          ...d,
          lineTotal: Number((d.quantity || 0) * (d.unitPrice || 0))
        }));

        this.draftValues = [];
      })
      .catch(err => this.toast('Failed to load basket', this.errMsg(err), 'error'))
      .finally(() => (this.loading = false));
  }

  saveChanges(changes) {
    const clean = (changes || [])
      .filter(c => c && c.id)
      .map(c => ({ id: c.id, quantity: c.quantity !== undefined ? Number(c.quantity) : null }));

    if (clean.length === 0) {
      this.toast('Nothing to update', 'Edit Quantity and try again.', 'info');
      return;
    }

    this.loading = true;
    updateQuantities({ changes: clean })
      .then(() => {
        this.toast('Updated', 'Quantities updated successfully.', 'success');
        this.draftValues = [];
        this.loadData();
      })
      .catch(err => this.toast('Update failed', this.errMsg(err), 'error'))
      .finally(() => (this.loading = false));
  }

  mergeDrafts(newDrafts) {
    const byId = new Map((this.draftValues || []).map(d => [d.id, { ...d }]));
    for (const d of newDrafts) {
      byId.set(d.id, { ...(byId.get(d.id) || {}), ...d });
    }
    this.draftValues = Array.from(byId.values());
  }

  // Utilities
  toast(title, message, variant) {
    this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
  }
  errMsg(error) {
    if (!error) return 'Unknown error';
    if (Array.isArray(error.body)) return error.body.map(e => e.message).join(', ');
    if (error.body && error.body.message) return error.body.message;
    return error.message || 'Unknown error';
  }
}
