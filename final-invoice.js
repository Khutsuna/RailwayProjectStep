// final-invoice.js
// Read info from localStorage and render invoice

function maskCard(card) {
    if (!card) return '';
    return card.slice(0,4) + '************' + card.slice(-4);
}

function renderInvoice() {
    const data = JSON.parse(localStorage.getItem('bookingData') || '{}');
    const el = document.getElementById('invoice-section');
    if (!el) return;
    const passengers = Array.isArray(data.passengers) ? data.passengers : [];
    const ticketId = data.ticketId || (passengers[0] && passengers[0].seatId) || '---';
    const purchaseDate = data.date || new Date().toLocaleDateString();

    const rows = passengers.map(p => {
        return `<tr>
            <td>${p.name || ''}</td>
            <td>${p.lastname || ''}</td>
            <td>${p.id || ''}</td>
            <td>${p.seat || ''}</td>
            <td>${p.wagon || ''}</td>
        </tr>`;
    }).join('\n') || `<tr><td colspan="5">No passengers</td></tr>`;

    // Determine total price
    let totalPrice = 0;
    if (data.price) {
        const parsed = parseFloat(String(data.price).replace(/[₾,\s]/g, ''));
        if (!Number.isNaN(parsed)) totalPrice = parsed;
    }
    if (!totalPrice) {
        const pricePer = 35.00;
        totalPrice = passengers.length ? pricePer * passengers.length : (data.price ? parseFloat(data.price) : 0);
    }

    el.innerHTML = `
        <div style="margin-bottom:18px; font-weight:600;">Step Railway</div>
        <div style="margin-bottom:12px; font-size:15px;">
            ბილეთის ნომერი: <span style="color:#2E45BF;">${ticketId}</span>
            &nbsp; &nbsp; შეძენის თარიღი: ${purchaseDate}
        </div>
        <div class="invoice-row">
            <label>გამგზავრების დრო:</label>
            <div class="value">${data.departTime || ''}</div>
            <label>სადგური:</label>
            <div class="value">${data.from || ''}</div>
            <label>ჩასვლის დრო:</label>
            <div class="value">${data.arriveTime || ''}</div>
        </div>
        <div class="invoice-row">
            <label>ელფოსტა:</label>
            <div class="value">${data.email || ''}</div>
            <label>ტელ:</label>
            <div class="value">${data.phone || ''}</div>
        </div>
        <table class="invoice-table">
            <tr><th>სახელი</th><th>გვარი</th><th>პირადი ნომერი</th><th>ადგილი</th><th>ვაგონი</th></tr>
            ${rows}
        </table>
        <div class="invoice-row">
            <label>Payment info:</label>
            <div class="value">${data.cardholder || ''}${data.cardNumber ? `<br>Credit Card - ${maskCard(data.cardNumber)}` : ''}</div>
            <div class="invoice-total">სულ გადასახდელი: ${totalPrice.toFixed(2)}₾</div>
        </div>
        <div class="invoice-footer">
            <span>ინვოისი ავტომატურად გენერირდება და არ საჭიროებს ხელმოწერას.<br>გთხოვთ შეამოწმოთ ბილეთის დეტალები თქვენს ელფოსტაზე.</span>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', renderInvoice);
