if (sessionStorage.getItem('role') !== 'user') {
  alert("Kein Zugriff!");
  window.location = 'login.html';
}

const u = sessionStorage.getItem('userName');
document.getElementById('uName').textContent = u.charAt(0).toUpperCase() + u.slice(1);

const data = JSON.parse(localStorage.getItem('tickets') || '{}');
const user = data[u] || { count: 0, used: [] };

function updateCount() {
  document.getElementById('ticketCount').textContent = Math.max(0, user.count - user.used.length);
}
updateCount();

const results = document.getElementById('results');
const searchTermInput = document.getElementById('searchTerm');

let debounceTimer = null;

function searchBooks(term) {
  if (!term) {
    results.innerHTML = "";
    return;
  }

  results.innerHTML = '<p>Lädt… 📚</p>';

  fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(term)}&limit=20`) // mehr Bücher
    .then(res => res.json())
    .then(data => {
      const books = (data.docs || []).map(doc => {
        return {
          title: doc.title,
          img: doc.cover_i
            ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
            : '',
          source: 'OpenLibrary'
        };
      });

      if (books.length === 0) {
        results.innerHTML = '<p>Keine Ergebnisse gefunden.</p>';
        return;
      }

      const html = books.map(book => `
        <div class="book-card">
          <img src="${book.img || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iOTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjZGRkZGRkIi8+PHRleHQgeD0iMzAiIHk9IjQ1IiBmb250LXNpemU9IjEwIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY2NiI+S2VpbiBDb3ZlcjwvdGV4dD48L3N2Zz4='}" data-title="${book.title}" />
          <div>
            <h3>${book.title}</h3>
            <small style="opacity: 0.6;">Quelle: ${book.source}</small><br>
            <button class="btn redeem" data-title="${book.title}">Einlösen</button>
          </div>
        </div>
      `).join('');

      results.innerHTML = html;

      document.querySelectorAll('.redeem').forEach(btn => {
        btn.onclick = () => {
          if (user.used.length >= user.count) {
            alert("Keine Tickets mehr!");
            return;
          }
          const title = btn.getAttribute('data-title');
          if (user.used.find(b => b.title === title)) {
            alert(`Du hast "${title}" bereits eingelöst.`);
            return;
          }
          const img = btn.closest('.book-card').querySelector('img').src;
user.used.push({ title, date: new Date().toISOString(), img });

          data[u] = user;
          localStorage.setItem('tickets', JSON.stringify(data));
          updateCount();
          alert(`"${title}" eingelöst! Viel Spaß beim Lesen ❤️`);
          renderRedeemedBooks(); // Direkt neu rendern
        };
      });
    })
    .catch(() => {
      results.innerHTML = '<p>Fehler beim Laden der Bücher.</p>';
    });
}


searchTermInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const term = searchTermInput.value.trim();
    searchBooks(term);
  }, 500);
});

// Optional: Suche starten wenn Seite geladen wird mit leerem Input
// searchBooks("");

document.getElementById('logout').onclick = () => {
  sessionStorage.clear();
  window.location = 'login.html';
};

function renderRedeemedBooks() {
 // Entferne vorherige Tabs, wenn vorhanden
  const oldTabs = document.querySelector('.tabs')?.parentElement;
  if (oldTabs) {
    oldTabs.remove();
  }

  const redeemed = user.used.filter(b => !b.purchased);
  const purchased = user.used.filter(b => b.purchased);

  const container = document.createElement('div');

  container.innerHTML = `
    <div class="tabs">
      <button class="tab-btn active" data-tab="redeemed">📚 Eingelöste Bücher</button>
      <button class="tab-btn" data-tab="archive">✅ Archiv</button>
    </div>
    <div id="redeemed" class="tab-content active"></div>
    <div id="archive" class="tab-content"></div>
  `;

  document.querySelector('.container').appendChild(container);

  const redeemedContainer = document.getElementById('redeemed');
  const archiveContainer = document.getElementById('archive');

  if (redeemed.length === 0) {
    redeemedContainer.innerHTML = "<p>Du hast aktuell keine offenen Bücher.</p>";
  } else {
    redeemed.forEach(b => {
      // OpenLibrary Cover über Suche ermitteln
      const coverUrl = b.img || 'data:image/svg+xml;base64,...'; // Platzhalter, falls kein Bild


      const card = document.createElement('div');
      card.className = 'book-card';
      card.innerHTML = `
        <img src="${coverUrl}" alt="Cover zu ${b.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iOTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjZGRkZGRkIi8+PHRleHQgeD0iMzAiIHk9IjQ1IiBmb250LXNpemU9IjEwIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY2NiI+S2VpbiBDb3ZlcjwvdGV4dD48L3N2Zz4='"/>
        <div>
          <h3>${b.title}</h3>
          <p>Eingelöst am: ${new Date(b.date).toLocaleDateString()}</p>
        </div>
      `;
      redeemedContainer.appendChild(card);
    });
  }

  if (purchased.length === 0) {
    archiveContainer.innerHTML = "<p>Hier erscheinen die gekauften Bücher 💜</p>";
  } else {
    purchased.forEach(b => {
     const coverUrl = b.img || 'data:image/svg+xml;base64,...'; // Platzhalter, falls kein Bild

      const card = document.createElement('div');
      card.className = 'book-card';
      card.style.opacity = "0.6";
      card.innerHTML = `
        <img src="${coverUrl}" alt="Cover zu ${b.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iOTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjZGRkZGRkIi8+PHRleHQgeD0iMzAiIHk9IjQ1IiBmb250LXNpemU9IjEwIiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY2NiI+S2VpbiBDb3ZlcjwvdGV4dD48L3N2Zz4='"/>
        <div>
          <h3>${b.title}</h3>
          <p>Gekauft am: ${new Date(b.date).toLocaleDateString()}</p>
        </div>
      `;
      archiveContainer.appendChild(card);
    });
  }

  // Tabs aktivieren
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const tab = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      document.getElementById(tab).classList.add('active');
    });
  });
}



renderRedeemedBooks();

