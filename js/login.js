const users = {
  isabel: "lese123",
  admin: "admin123"
};

document.getElementById('loginBtn').onclick = () => {
  const u = document.getElementById('username').value.trim().toLowerCase();
  const p = document.getElementById('password').value;

  if (!u || !p) {
    alert("Bitte Benutzername und Passwort eingeben.");
    return;
  }

  if (!(u in users) || users[u] !== p) {
    alert("Ungültiger Benutzername oder Passwort.");
    return;
  }

  if (u === "admin") {
    sessionStorage.setItem('role', 'admin');
    sessionStorage.setItem('userName', u);
    window.location = 'admin.html';
  } else {
    sessionStorage.setItem('role', 'user');
    sessionStorage.setItem('userName', u);
    window.location = 'user.html';
  }
};
