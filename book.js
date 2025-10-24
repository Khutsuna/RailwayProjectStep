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
        arriveTime: params.get('arriveTime') || '',
        passengers: params.get('passengers') || '1'
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

// Wagon selection modal logic
const wagonModal = document.getElementById('wagon-modal');
const closeModalBtn = document.getElementById('close-modal');
let currentPassengerIndex = 0; // Track which passenger is selecting a seat

// Arrays to track each passenger's wagon and seat selection
const passengerCount = parseInt(getQueryParams().passengers) || 1;
let passengerWagons = new Array(passengerCount).fill(null);
let passengerSeats = new Array(passengerCount).fill(null);
let passengerSeatIds = new Array(passengerCount).fill(null);

// Function to attach seat selection listeners to all passenger buttons
function attachSeatSelectionListeners() {
    document.querySelectorAll('.passenger-fields .btn-primary').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            currentPassengerIndex = parseInt(btn.getAttribute('data-passenger'));
            wagonModal.style.display = 'flex';
        });
    });
}

closeModalBtn?.addEventListener('click', () => {
    wagonModal.style.display = 'none';
});

const seatModal = document.getElementById('seat-modal');
const closeSeatModalBtn = document.getElementById('close-seat-modal');

// Invoice registration button logic
const registerBtn = document.getElementById('register-btn');

function isFormValid() {
    // Check email and phone
    if (!document.getElementById('email').value.trim() || !document.getElementById('phone').value.trim()) {
        return false;
    }
    
    // Check all passenger fields
    for (let i = 0; i < passengerCount; i++) {
        const name = document.getElementById(`passenger-name-${i}`);
        const lastname = document.getElementById(`passenger-lastname-${i}`);
        const id = document.getElementById(`passenger-id-${i}`);
        
        if (!name?.value.trim() || !lastname?.value.trim() || !id?.value.trim()) {
            return false;
        }
        
        // Check that each passenger has selected a seat
        if (!passengerSeats[i] || !passengerWagons[i]) {
            return false;
        }
    }
    
    // Check checkbox
    return document.getElementById('invoice-check').checked;
}

function updateRegisterBtn() {
    if (registerBtn) {
        registerBtn.disabled = !isFormValid();
    }
}

// Generate passenger fields based on passenger count
function generatePassengerFields(count) {
    const container = document.getElementById('passengers-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const passengerDiv = document.createElement('div');
        passengerDiv.innerHTML = `
            <div class="passenger-title">მგზავრი ${i + 1}</div>
            <div class="passenger-fields" data-passenger="${i}">
                <input type="text" class="passenger-input" id="passenger-name-${i}" placeholder="სახელი" required>
                <input type="text" class="passenger-input" id="passenger-lastname-${i}" placeholder="გვარი" required>
                <input type="text" inputmode="numeric" pattern="\\d{11}" maxlength="11" class="passenger-input passenger-id-input" id="passenger-id-${i}" placeholder="პირადი ნომერი" required>
                <button class="tab btn-primary" data-passenger="${i}">ადგილების არჩევა</button>
            </div>
        `;
        container.appendChild(passengerDiv);
    }
    
    // Reattach event listeners for dynamically created buttons
    attachSeatSelectionListeners();
    attachIdInputListeners();
    updateRegisterBtn();
}

// Ensure passenger ID inputs accept only digits and max 11 characters
function attachIdInputListeners() {
    document.querySelectorAll('.passenger-id-input').forEach(input => {
        // clean existing listener by replacing the element? We'll just add listener; duplicates are unlikely because we call after regeneration
        input.addEventListener('input', (e) => {
            const cleaned = input.value.replace(/\D/g, '').slice(0,11);
            if (input.value !== cleaned) input.value = cleaned;
            updateRegisterBtn();
        });
        // optional: prevent non-numeric keypresses
        input.addEventListener('keypress', (e) => {
            const char = String.fromCharCode(e.which || e.keyCode);
            if (!/\d/.test(char)) e.preventDefault();
        });
    });
}

// Initialize passenger fields
generatePassengerFields(passengerCount);

// Wagon button event listeners
document.querySelectorAll('.wagon-img-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.wagon-img-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const selectedWagon = btn.getAttribute('data-wagon');
        passengerWagons[currentPassengerIndex] = selectedWagon;
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
        const selectedSeat = btn.getAttribute('data-seat');
        const selectedSeatId = seatIdMap[selectedSeat] || null;
        
        // Store seat info for current passenger
        passengerSeats[currentPassengerIndex] = selectedSeat;
        passengerSeatIds[currentPassengerIndex] = selectedSeatId;
        
        // Update invoice display
        updateInvoice();
        
        // Close seat modal after selection
        seatModal.style.display = 'none';
        
        // Update register button state
        updateRegisterBtn();
    });
});

// Function to update invoice with all passenger seats and total price
function updateInvoice() {
    const invoiceSeatInput = document.querySelector('.invoice-seat');
    const invoicePriceSpan = document.querySelector('.invoice-price');
    
    // Build seat display string
    let seatDisplay = '';
    let totalPrice = 0;
    const pricePerSeat = 35.00;
    
    for (let i = 0; i < passengerCount; i++) {
        if (passengerSeats[i]) {
            seatDisplay += `${passengerWagons[i]}-${passengerSeats[i]}`;
            totalPrice += pricePerSeat;
            if (i < passengerCount - 1 && passengerSeats[i + 1]) {
                seatDisplay += ', ';
            }
        }
    }
    
    if (seatDisplay === '') {
        seatDisplay = 'სულ:';
        totalPrice = 0;
    }
    
    invoiceSeatInput.value = seatDisplay;
    invoicePriceSpan.textContent = `${totalPrice.toFixed(2)}₾`;
}

const bookingForm = document.getElementById('booking-form');
bookingForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    // Here you would POST to /api/tickets/register with all info
    alert(`დაჯავშნა დასრულებულია!\nEmail: ${email}\nPhone: ${phone}`);
});

// Listen to all relevant fields for changes
['email','phone','invoice-check'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input', updateRegisterBtn);
        el.addEventListener('change', updateRegisterBtn);
    }
});

// Listen to dynamically created passenger input fields
document.addEventListener('input', function(e) {
    if (e.target.classList.contains('passenger-input')) {
        updateRegisterBtn();
    }
});

updateRegisterBtn();

registerBtn?.addEventListener('click', function(e) {
    if (!isFormValid()) {
        e.preventDefault();
        updateRegisterBtn();
        return;
    }
    
    // Gather all passenger info with their seat selections
    const passengers = [];
    
    for (let i = 0; i < passengerCount; i++) {
        passengers.push({
            name: document.getElementById(`passenger-name-${i}`).value,
            lastname: document.getElementById(`passenger-lastname-${i}`).value,
            id: document.getElementById(`passenger-id-${i}`).value,
            wagon: passengerWagons[i],
            seat: passengerSeats[i],
            seatId: passengerSeatIds[i]
        });
    }
    
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    
    // Save to localStorage
    const bookingData = {
        passengers,
        phone,
        email,
        from: params.from,
        to: params.to,
        departTime: params.departTime,
        arriveTime: params.arriveTime,
        price: document.querySelector('.invoice-price').textContent.replace('₾','').trim()
    };
    localStorage.setItem('bookingData', JSON.stringify(bookingData));
    window.location.href = 'success.html';
});
