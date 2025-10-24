// tickets.js
// Reads ?from=...&to=...&date=... from URL, fetches departures, renders results

const resultsEl = document.getElementById('results');

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        from: params.get('from') || '',
        to: params.get('to') || '',
        date: params.get('date') || ''
    };
}

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
            // Build ticket card markup based on provided template
            return `
            <div class="cardWrap" data-train-id="${t?.id}" data-departure-id="${dep?.id}">
              <div class="card">
                <div class="cardLeft">
                  <h1>${trainName} <span>#${trainNumber}</span></h1>
                  <div class="title"><h2>${from} → ${to}</h2><span>marsh</span></div>
                  <div class="name"><h2>${trainName}</h2><span>train</span></div>
                                    <div class="seat"><h2>${departTime}</h2><span>departure</span></div>
                                    <div class="time"><h2>${arriveTime}</h2><span>arrival</span></div>
                </div>
                <div class="cardRight">
                                    <div class="number"><h3>${trainNumber}</h3><span>train</span></div>
                                    <div class="cardRight-action">
                                        <button class="btn btn-primary book-btn" data-train-id="${t?.id}" data-departure-id="${dep?.id}">დაჯავშნა</button>
                                    </div>
                </div>
              </div>
            </div>`;
        }).join('');
    }).join('');
    resultsEl.innerHTML = html || '<div class="results__empty">ამ დღეს მატარებელი არ მოიძებნა</div>';
}

async function fetchDepartures(from, to, dateStr) {
    const params = new URLSearchParams({ from, to, date: dateStr });
    const res = await fetch(`https://railway.stepprojects.ge/api/getdeparture?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch departures');
    return res.json();
}

async function main() {
    const { from, to, date } = getQueryParams();
    if (!from || !to || !date) {
        resultsEl.innerHTML = '<div class="results__error">გთხოვთ მიუთითოთ ყველა ველი</div>';
        return;
    }
    resultsEl.innerHTML = '<div class="results__loading">მიმდინარეობს ძიება...</div>';
    try {
        const data = await fetchDepartures(from, to, date);
        renderResults(data);
    } catch (err) {
        console.error(err);
        resultsEl.innerHTML = '<div class="results__error">დაფიქსირდა შეცდომა ძიებისას</div>';
    }
}

main();

// Delegate clicks on "დაჯავშნა" buttons
resultsEl?.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    const btn = target.closest('button[data-train-id]');
    if (!btn) return;
    const trainId = btn.getAttribute('data-train-id');
    const departureId = btn.getAttribute('data-departure-id');
    // Find train info from DOM
    const card = btn.closest('.cardWrap');
    const trainNumber = card?.querySelector('.number h3')?.textContent || '';
    const trainName = card?.querySelector('.cardLeft h1')?.textContent?.replace(`#${trainNumber}`,'').trim() || '';
    const departTime = card?.querySelector('.seat h2')?.textContent || '';
    const arriveTime = card?.querySelector('.time h2')?.textContent || '';
    const fromTo = card?.querySelector('.title h2')?.textContent || '';
    const [from, to] = fromTo.split('→').map(s => s ? s.trim() : '');
    // Also get search params from URL
    const urlParams = new URLSearchParams(window.location.search);
    const date = urlParams.get('date') || '';
    const passengers = urlParams.get('passengers') || '1';
    // Redirect to book.html with all info
    const params = new URLSearchParams({
        trainId, departureId, from, to, date, trainNumber, trainName, departTime, arriveTime, passengers
    });
    window.location.href = `book.html?${params.toString()}`;
});
