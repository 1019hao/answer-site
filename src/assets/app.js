const MODAL = document.getElementById('modal');
document.getElementById('close-modal').onclick = () => {
  MODAL.classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  initApp();
};

const REPO = '1019hao/answer-site';                 // ★ 改成你的 user/repo
const INDEX_URL = `https://raw.githubusercontent.com/${REPO}/data/search-index.json`;
const IMG_BASE  = `https://raw.githubusercontent.com/${REPO}/main/books`;
let books = [];

async function loadIndex() {
  try {
    const res = await fetch(INDEX_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    books = await res.json();
  } catch (e) {
    console.error('索引加载失败', e);
    document.getElementById('list').textContent = '⚠️ 无法加载书目，请稍后刷新';
  }
}

const gradeSel = document.getElementById('grade');
for (let g = 1; g <= 6; g++) {
  const o = document.createElement('option');
  o.value = g; o.textContent = `${g}年级`;
  gradeSel.appendChild(o);
}

const listEl = document.getElementById('list');
function render(filtered) {
  listEl.innerHTML = '';
  if (!filtered.length) { listEl.textContent = '没有匹配的书籍'; return; }
  filtered.forEach(b => {
    const card = document.createElement('article');
    card.className = 'book-card';
    const coverUrl = b.cover ? `${IMG_BASE}/${encodeURIComponent(b.name)}/pages/${b.cover}` : '';
    card.innerHTML = `
      <div class="book-cover">
        ${coverUrl ? `<img src="${coverUrl}" alt="${b.name} 封面" loading="lazy"/>` : `<div class="placeholder">暂无封面</div>`}
      </div>
      <div class="book-info">
        <h2>${b.name}</h2>
        <p class="meta">${b.grade}年级 ${b.semester}学期 · ${b.subject} · ${b.publisher}</p>
      </div>`;
    card.onclick = () => openViewer(b.name);
    listEl.appendChild(card);
  });
}
function applyFilter() {
  const kw = document.getElementById('kw').value.trim().toLowerCase();
  const g  = document.getElementById('grade').value;
  const s  = document.getElementById('semester').value;
  const sub = document.getElementById('subject').value;
  const filtered = books.filter(b => {
    if (kw && !b.name.toLowerCase().includes(kw) && !(b.publisher||'').toLowerCase().includes(kw)) return false;
    if (g && String(b.grade) !== g) return false;
    if (s && b.semester !== s) return false;
    if (sub && b.subject !== sub) return false;
    return true;
  });
  render(filtered);
}
['kw','grade','semester','subject'].forEach(id =>
  document.getElementById(id).addEventListener('input', applyFilter)
);

const viewer = document.getElementById('viewer');
const imgEl = document.getElementById('viewer-img');
const paginationEl = document.getElementById('pagination');
let curBook = null, curIdx = 0;

async function openViewer(bookName) {
  const url = `https://raw.githubusercontent.com/${REPO}/data/books/${encodeURIComponent(bookName)}/pages-index.json`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return alert('加载失败');
  curBook = await res.json();
  curIdx = 0;
  showPage();
  viewer.showModal();
  buildPagination();
}
viewer.querySelector('.viewer-close').onclick = () => viewer.close();
viewer.querySelector('.viewer-prev').onclick = () => navigate(-1);
viewer.querySelector('.viewer-next').onclick = () => navigate(+1);
document.addEventListener('keydown', e => {
  if (!viewer.open) return;
  if (e.key === 'ArrowLeft') navigate(-1);
  if (e.key === 'ArrowRight') navigate(+1);
  if (e.key === 'Escape') viewer.close();
});
function showPage() {
  const src = `${IMG_BASE}/${encodeURIComponent(curBook.name)}/pages/${curBook.pages[curIdx]}`;
  imgEl.src = src;
  imgEl.alt = `${curBook.name} 第 ${curIdx+1} 页`;
  document.querySelectorAll('.page-btn').forEach((btn,i)=>btn.classList.toggle('active', i===curIdx));
}
function navigate(d) {
  const n = curIdx + d;
  if (n < 0 || n >= curBook.pages.length) return;
  curIdx = n; showPage();
}
function buildPagination() {
  paginationEl.innerHTML = '';
  curBook.pages.forEach((_,i)=>{
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (i===0?' active':'');
    btn.textContent = i+1;
    btn.onclick = () => { curIdx=i; showPage(); };
    paginationEl.appendChild(btn);
  });
}

async function initApp() {
  await loadIndex();
  render(books);
}
