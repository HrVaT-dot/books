if (sessionStorage.getItem('role') !== 'admin') {
  alert("Kein Zugriff!");
  window.location = 'login.html';
}

const ticketData = JSON.parse(localStorage.getItem('tickets') || '{}');
const ticketList = document.getElementById('ticketList');
const giveBtn = document.getElementById('giveTicket');
const isabelList = document.getElementById('isabelBooks');

function render() {
 

  // Zeige Isabels eingelöste Bücher
  renderIsabel();
}

function renderIsabel() {
  isabelList.innerHTML = '<h2>Isabels eingelöste Bücher:</h2>';
  const data = JSON.parse(localStorage.getItem('tickets') || '{}');
  const isabel = data["isabel"];
  if (!isabel || !isabel.used.length) {
    isabelList.innerHTML += '<p>Keine eingelösten Bücher.</p>';
    return;
  }

  // Nicht gefiltert – alle zeigen, aber Buttons nur für nicht gekaufte
  isabel.used.forEach((b, i) => {
    const div = document.createElement('div');
    div.className = "book-card";

    const coverUrl = b.img || `https://covers.openlibrary.org/b/title/${encodeURIComponent(b.title)}-M.jpg`;


    div.innerHTML = `
      <img src="${coverUrl}" alt="Cover von ${b.title}" onerror="this.onerror=null;this.src='data:image/svg+xml;base64,...'"/>
      <div>
        <h3>${b.title}</h3>
        <p>${b.purchased ? "✅ Gekauft" : "Eingelöst am: " + new Date(b.date).toLocaleString()}</p>
        ${!b.purchased ? `<button class="btn markPurchased" data-index="${i}">Als gekauft markieren</button>` : ""}
      </div>
    `;
    isabelList.appendChild(div);
  });

  // Richtige Indexe im Originalarray
  document.querySelectorAll('.markPurchased').forEach(btn => {
    btn.onclick = () => {
      const index = parseInt(btn.getAttribute('data-index'));
      const data = JSON.parse(localStorage.getItem('tickets') || '{}');
      data["isabel"].used[index].purchased = true;
      localStorage.setItem('tickets', JSON.stringify(data));
      renderIsabel();
    };
  });
}



giveBtn.onclick = () => {
  const u = document.getElementById('userName').value.trim().toLowerCase();
  if (!u) return alert("Username eingeben!");
  if (u !== "isabel") return alert("Nur Isabel kann Tickets bekommen.");

  const allData = JSON.parse(localStorage.getItem('tickets') || '{}');
const dt = allData[u] || { count: 0, used: [] };

  const offeneTickets = dt.count - dt.used.filter(b => b.purchased).length - dt.used.filter(b => !b.purchased).length;

  if (offeneTickets >= 3) {
    return alert("Isabel hat bereits 3 offene Tickets.");
  }

  dt.count = (dt.count || 0) + 1;
 allData[u] = dt;
localStorage.setItem('tickets', JSON.stringify(allData));
  alert(`Ticket an ${u} vergeben. Verfügbar: ${dt.count - dt.used.filter(b => !b.purchased).length}`);
  document.getElementById('userName').value = "";
  render();
};


document.getElementById('logout').onclick = () => {
  sessionStorage.clear();
  window.location = 'login.html';
};

render();
