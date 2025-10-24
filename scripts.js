const stationFrom = document.getElementById('from');
const stationTo = document.getElementById('to');
const dateInput = document.getElementById('date');
const resultsEl = document.getElementById('results');
const bookingForm = document.querySelector('.booking-card form');

// Prevent selecting past dates: set the min attribute to today's date (local)
if (dateInput) {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  dateInput.min = `${yyyy}-${mm}-${dd}`;
}


fetch("https://railway.stepprojects.ge/api/stations")
    .then(response => response.json())
    .then(data => {
        data.forEach(station => {
            const optionFrom = document.createElement('option');
            optionFrom.value = station.name;
            optionFrom.textContent = station.name;
            stationFrom.appendChild(optionFrom);
        });

        data.forEach(station => {
            const optionTo = document.createElement('option');
            optionTo.value = station.name;
            optionTo.textContent = station.name;
            stationTo.appendChild(optionTo);
        });
    })
    .catch(error => console.error(error));

function renderResults(items) {
  if (!resultsEl) return;
  if (!Array.isArray(items) || items.length === 0) {
    resultsEl.innerHTML = '<div class="results__empty">არ მოიძებნა გამგზავრება არჩეულ დღეს</div>';
    return;
  }
  const html = items.map(dep => {
    const trains = Array.isArray(dep.trains) ? dep.trains : [];
    return trains.map(t => {
      const trainNumber = t?.number ?? '';
      const trainName = t?.name ?? '';
      const departTime = t?.departure ?? '';
      const arriveTime = t?.arrive ?? '';
      const from = t?.from ?? dep?.source ?? '';
      const to = t?.to ?? dep?.destination ?? '';
      return `
      <div class="result-card">
        <div class="result-card__left">
          <div class="result-card__train">#${trainNumber}</div>
          <div class="result-card__name">${trainName}</div>
        </div>
        <div class="result-card__mid">
          <div class="result-card__time">${departTime}</div>
          <div class="result-card__city">${from}</div>
        </div>
        <div class="result-card__mid">
          <div class="result-card__time">${arriveTime}</div>
          <div class="result-card__city">${to}</div>
        </div>
        <div class="result-card__right">
          <button class="btn btn-primary" data-train-id="${t?.id}" data-departure-id="${dep?.id}">დაჯავშნა</button>
        </div>
      </div>`;
    }).join('');
  }).join('');
  resultsEl.innerHTML = html || '<div class="results__empty">ამ დღეს მატარებელი არ მოიძებნა</div>';
}

async function checkAvailability(from, to, dateStr) {
  const params = new URLSearchParams({ from, to, date: dateStr });
  const res = await fetch(`https://railway.stepprojects.ge/api/getdeparture?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch departures');
  const departures = await res.json(); // array of { id, source, destination, date, trains: [...] }
  return departures;
}

bookingForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const from = stationFrom?.value || '';
  const to = stationTo?.value || '';
  const dateStr = dateInput?.value || '';
  const passengers = document.getElementById('passengers')?.value || '';
  // Validate all fields
  if (!from || !to || !dateStr || !passengers) {
    alert('გთხოვთ შეავსოთ ყველა ველი!');
    return;
  }
  // Ensure selected date is not before min (grayed-out days)
  if (dateInput && dateInput.min && dateStr < dateInput.min) {
    alert('გთხოვთ აირჩიოთ მიმდინარე თარიღი ან მომდევნო თარიღი.');
    return;
  }
  // Redirect to tickets.html with query params
  const params = new URLSearchParams({ from, to, date: dateStr, passengers });
  window.location.href = `tickets.html?${params.toString()}`;
});

// Delegate clicks on "დაჯავშნა" buttons
resultsEl?.addEventListener('click', (e) => {
  const target = e.target;
  if (!(target instanceof Element)) return;
  const btn = target.closest('button[data-train-id]');
  if (!btn) return;
  const trainId = btn.getAttribute('data-train-id');
  const departureId = btn.getAttribute('data-departure-id');
  alert(`Train ${trainId} selected (departure ${departureId})`);
});

async function registerTicket({ trainId, dateIso, email, phoneNumber, people }) {
  const res = await fetch('https://railway.stepprojects.ge/api/tickets/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      trainId,
      date: dateIso,               // e.g. "2025-10-18T09:00:00Z"
      email,
      phoneNumber,
      people: people.map(p => ({
        seatId: p.seatId,          // required UUID
        name: p.name || null,
        surname: p.surname || null,
        idNumber: p.idNumber || null,
        status: p.status || null,
        payoutCompleted: !!p.payoutCompleted
      }))
    })
  });
  if (!res.ok) throw new Error('Ticket registration failed');
  return res.json(); // returns Ticket
}