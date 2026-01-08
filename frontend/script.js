var API_BASE = "https://book-recommender-jura.onrender.com/";
function setStatus(msg) {
      document.getElementById('status').innerText = msg;
}
function showSpinner() {
  document.getElementById('loadingSpinner').classList.remove('hidden');
}

function hideSpinner() {
  document.getElementById('loadingSpinner').classList.add('hidden');
}
function openModal(title, author, description) {
  var overlay = document.getElementById('modalOverlay');
  var modalTitle = document.getElementById('modalTitle');
  var modalAuthor = document.getElementById('modalAuthor');
  var modalBody = document.getElementById('modalBody');

  modalTitle.innerText = title || 'Details';
  modalAuthor.innerText = author ? ('by ' + author) : '';
  modalBody.innerText = description || '';

  overlay.classList.remove('hidden');
  overlay.classList.add('flex');
}

function closeModal() {
  var overlay = document.getElementById('modalOverlay');
  overlay.classList.add('hidden');
  overlay.classList.remove('flex');
}

// Wire up modal close actions once
document.getElementById('modalCloseBtn').addEventListener('click', closeModal);

document.getElementById('modalOverlay').addEventListener('click', function (e) {
  // Only close when clicking the dark overlay, not the modal box
  if (e.target.id === 'modalOverlay') closeModal();
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeModal();
});

function clearResults() {
        var ul = document.getElementById('results');
        while (ul.firstChild) ul.removeChild(ul.firstChild);
}      

function addResult(title, author, description, imageUrl, score) {
  var ul = document.getElementById('results');

  var li = document.createElement('li');
  li.className = "flex gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm";

  if (imageUrl) {
    var img = document.createElement('img');
    img.className = "h-28 w-20 rounded-md object-cover flex-none";
    img.src = imageUrl;
    img.alt = title || 'Book cover';
    img.onerror = function () { img.remove(); };
    li.appendChild(img);
  }

  var textDiv = document.createElement('div');
  textDiv.className = "min-w-0";

  var titleDiv = document.createElement('div');
  titleDiv.className = "text-base font-semibold text-gray-900";
  titleDiv.innerText = title || '(No title)';
  textDiv.appendChild(titleDiv);

  if (author) {
    var authorDiv = document.createElement('div');
    authorDiv.className = "text-sm text-gray-600";
    authorDiv.innerText = author;
    textDiv.appendChild(authorDiv);
  }

  if (description) {
    var descDiv = document.createElement('div');
    descDiv.className = "mt-2 text-sm text-gray-700 leading-relaxed line-clamp-2";
    descDiv.innerText = description;
    textDiv.appendChild(descDiv);

    var moreBtn = document.createElement('button');
    moreBtn.className = "mt-1 text-sm font-medium text-blue-600 hover:underline";
    moreBtn.innerText = "Read more";
    moreBtn.onclick = function () {
      openModal(title, author, description);
    };

    textDiv.appendChild(moreBtn);
  }



  if (typeof score === 'number') {
    var scoreDiv = document.createElement('div');
    scoreDiv.className = "mt-2 text-xs text-gray-500";
    scoreDiv.innerText = 'Similarity: ' + score.toFixed(3);
    textDiv.appendChild(scoreDiv);
  }

  li.appendChild(textDiv);
  ul.appendChild(li);
}


function fetchRecommendations(query) {
  clearResults();
  setStatus('');

  // Show spinner only if request is slow (cold start-like)
  var spinnerTimer = setTimeout(function () {
    showSpinner();
  }, 900); // adjust: 700–1500ms feels good

  fetch(API_BASE + '/api/recommend?title=' + encodeURIComponent(query), { method: 'GET' })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      var recs = (data && data.recommendations) ? data.recommendations : [];
      if (recs.length === 0) {
        setStatus('No recommendations found. Try a different title/keyword.');
        return;
      }

      setStatus('Top recommendations:');
      console.log('First rec:', recs[0]);

      recs.forEach(function (r) {
        addResult(r.title, r.author, r.description, r.cover_image, r.score);
      });
    })
    .catch(function (err) {
      setStatus('Error: ' + err.message);
    })
    .finally(function () {
      // Always stop spinner (whether fast or slow)
      clearTimeout(spinnerTimer);
      hideSpinner();
    });
}


document.getElementById('goBtn').addEventListener('click', function () {
        var q = document.getElementById('titleInput').value;
        fetchRecommendations(q);
});

document.getElementById('titleInput').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          var q = document.getElementById('titleInput').value;
          fetchRecommendations(q);
        }
});