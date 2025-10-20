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
    el.innerHTML = `
        <div style="margin-bottom:18px; font-weight:600;">Step Railway</div>
        <div style="margin-bottom:12px; font-size:15px;">
            ბილეთის ნომერი: <span style="color:#2E45BF;">${data.ticketId || '---'}</span>
            &nbsp; &nbsp; შეძენის თარიღი: ${data.date || ''}
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
            <tr>
                <td>${data.passengerName || ''}</td>
                <td>${data.passengerLastname || ''}</td>
                <td>${data.passengerId || ''}</td>
                <td>${data.seat || ''}</td>
                <td>${data.wagon || ''}</td>
            </tr>
        </table>
        <div class="invoice-row">
            <label>Payment info:</label>
            <div class="value">${data.cardholder || ''}<br>Credit Card - ${maskCard(data.cardNumber)}</div>
            <div class="invoice-total">სულ გადასახდელი: ${data.price || '35'}₾</div>
        </div>
        <div class="invoice-footer">
            <span>ინვოისი ავტომატურად გენერირდება და არ საჭიროებს ხელმოწერას.<br>გთხოვთ შეამოწმოთ ბილეთის დეტალები თქვენს ელფოსტაზე.</span>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', renderInvoice);
