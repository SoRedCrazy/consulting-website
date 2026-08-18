/* ============================================================
   AUREA CONSULTING — Page Avis
   Formulaire public pour laisser un avis
   ============================================================ */

let rating = 0;
const stars = document.querySelectorAll('#avis-stars button');

function highlight(n) {
  stars.forEach((s, i) => s.classList.toggle('active', i < n));
}

stars.forEach((star) => {
  star.addEventListener('click', () => {
    rating = parseInt(star.dataset.star, 10);
    highlight(rating);
  });
  star.addEventListener('mouseenter', () => {
    highlight(parseInt(star.dataset.star, 10));
  });
});

document.getElementById('avis-stars').addEventListener('mouseleave', () => {
  highlight(rating);
});

document.getElementById('avis-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('avis-name').value.trim();
  const message = document.getElementById('avis-message').value.trim();
  const status = document.getElementById('avis-status');
  status.textContent = '';
  status.className = 'form__status';

  if (!name || !message || rating === 0) {
    status.textContent = 'Veuillez remplir tous les champs et choisir une note.';
    status.className = 'form__status err';
    return;
  }

  try {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, rating, message })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur');
    document.getElementById('avis-form').hidden = true;
    document.getElementById('avis-success').hidden = false;
  } catch (err) {
    status.textContent = err.message;
    status.className = 'form__status err';
  }
});
