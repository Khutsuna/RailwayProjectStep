// book.js
// book.js
// Reads ticket info from URL, displays summary, handles booking form

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        trainId: params.get('trainId') || '',
        departureId: params.get('departureId') || '',
        from: params.get('from') || '',
        to: params.get('to') || '',
        date: params.get('date') || '',
        trainNumber: params.get('trainNumber') || '',
        trainName: params.get('trainName') || '',
        departTime: params.get('departTime') || '',
        arriveTime: params.get('arriveTime') || ''
    };
}

function renderTicketSummary(params) {
    const el = document.getElementById('ticket-summary');
    if (!el) return;
    el.innerHTML = `
        <div>
            <div><b>#${params.trainNumber}</b></div>
            <div>${params.trainName}</div>
        </div>
        <div>
            <div>${params.departTime}</div>
            <div>${params.from}</div>
        </div>
        <div>
            <div>${params.arriveTime}</div>
            <div>${params.to}</div>
        </div>
    `;
}

const params = getQueryParams();
renderTicketSummary(params);

const bookingForm = document.getElementById('booking-form');
bookingForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    // Here you would POST to /api/tickets/register with all info
    alert(`დაჯავშნა დასრულებულია!\nEmail: ${email}\nPhone: ${phone}`);
    // Optionally redirect or show confirmation
        // On registration, save booking data and redirect to payment
        document.getElementById('register-btn').addEventListener('click', function(e) {
            e.preventDefault();
            // Gather all info
            const passengerName = document.getElementById('passenger-name').value;
            const passengerLastname = document.getElementById('passenger-lastname').value;
            const passengerId = document.getElementById('passenger-id').value;
            const phone = document.getElementById('phone').value;
            const email = document.getElementById('email').value;
            const seat = selectedSeat;
            const wagon = selectedWagon;
            // Save to localStorage
            const bookingData = {
                passengerName, passengerLastname, passengerId, phone, email, seat, wagon,
                from: searchParams.get('from'),
                to: searchParams.get('to'),
                departTime: searchParams.get('departTime'),
                arriveTime: searchParams.get('arriveTime'),
                price: document.getElementById('invoice-price').textContent
            };
            localStorage.setItem('bookingData', JSON.stringify(bookingData));
            window.location.href = 'success.html';
        });
});

// Wagon selection modal logic
const wagonModal = document.getElementById('wagon-modal');
const chooseBtn = document.querySelector('.passenger-fields .btn-primary');
const closeModalBtn = document.getElementById('close-modal');
let selectedWagon = null;

chooseBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    wagonModal.style.display = 'flex';
});

closeModalBtn?.addEventListener('click', () => {
    wagonModal.style.display = 'none';
});

const seatModal = document.getElementById('seat-modal');
const closeSeatModalBtn = document.getElementById('close-seat-modal');
let selectedSeat = null;
let selectedSeatId = null; // UUID from API

document.querySelectorAll('.wagon-img-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.wagon-img-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedWagon = btn.getAttribute('data-wagon');
        // Show seat modal and update wagon number
        document.getElementById('seat-wagon-number').textContent = selectedWagon;
        seatModal.style.display = 'flex';
        wagonModal.style.display = 'none';
    });
});

closeSeatModalBtn?.addEventListener('click', () => {
    seatModal.style.display = 'none';
});

function setOccupiedSeats(occupiedSeats) {
    document.querySelectorAll('.seat-btn').forEach(btn => {
        const seat = btn.getAttribute('data-seat');
        btn.classList.remove('occupied');
        btn.disabled = false;
        if (occupiedSeats.includes(seat)) {
            btn.classList.add('occupied');
            btn.disabled = true;
        }
    });
}

// Example usage: fetch occupied seats from API, then update
// fetch('/api/occupiedSeats?wagon=' + selectedWagon)
//   .then(res => res.json())
//   .then(seats => setOccupiedSeats(seats));

// Initial static example
setOccupiedSeats(['2B', '7D']);

// Example: seatIdMap = { '2B': '0d0f2873-a8e8-4389-b197-77f272a6eb50', ... }
let seatIdMap = {};
// TODO: Populate seatIdMap from API when loading seat modal

document.querySelectorAll('.seat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.classList.contains('occupied')) return;
        document.querySelectorAll('.seat-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedSeat = btn.getAttribute('data-seat');
        selectedSeatId = seatIdMap[selectedSeat] || null;
        // Update invoice seat and price
        document.querySelector('.invoice-seat').value = selectedSeat;
        document.querySelector('.invoice-price').textContent = '35.00₾';
    });
});

// Invoice registration button logic
const registerBtn = document.getElementById('register-btn');
function isFormValid() {
    return (
        document.getElementById('email').value.trim() &&
        document.getElementById('phone').value.trim() &&
        document.getElementById('passenger-name').value.trim() &&
        document.getElementById('passenger-lastname').value.trim() &&
        document.getElementById('passenger-id').value.trim() &&
        selectedWagon &&
        selectedSeat &&
        document.getElementById('invoice-check').checked
    );
}

function updateRegisterBtn() {
    if (registerBtn) {
        registerBtn.disabled = !isFormValid();
    }
}

// Listen to all relevant fields for changes
['email','phone','passenger-name','passenger-lastname','passenger-id','invoice-check'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input', updateRegisterBtn);
        el.addEventListener('change', updateRegisterBtn);
    }
});

// Also update when seat or wagon is selected
const origWagonSetter = selectedWagon;
document.querySelectorAll('.wagon-img-btn').forEach(btn => {
    btn.addEventListener('click', updateRegisterBtn);
});
document.querySelectorAll('.seat-btn').forEach(btn => {
    btn.addEventListener('click', updateRegisterBtn);
});

updateRegisterBtn();

registerBtn?.addEventListener('click', function(e) {
    if (!isFormValid()) {
        e.preventDefault();
        updateRegisterBtn();
        return;
    }
    // Gather all info
    const passengerName = document.getElementById('passenger-name').value;
    const passengerLastname = document.getElementById('passenger-lastname').value;
    const passengerId = document.getElementById('passenger-id').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const seat = selectedSeat;
    const wagon = selectedWagon;
    // Save to localStorage
    const bookingData = {
        passengerName, passengerLastname, passengerId, phone, email, seat, wagon,
        seatId: selectedSeatId, // UUID from API
        ticketId: selectedSeatId, // use seatId as ticketId for invoice
        from: params.from,
        to: params.to,
        departTime: params.departTime,
        arriveTime: params.arriveTime,
        price: document.querySelector('.invoice-price').textContent.replace('₾','').trim()
    };
    localStorage.setItem('bookingData', JSON.stringify(bookingData));
    window.location.href = 'success.html';
});
