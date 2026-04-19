// ============================================
//  HOPE Tracker — Frontend Script
//  Reads from server cache only.
//  Fresh data is fetched only on Refresh click.
// ============================================

// ---------- Config ----------
const TOTAL_EASY = 850;
const TOTAL_MEDIUM = 1800;
const TOTAL_HARD = 780;

// ---------- State ----------
let leaderboardData = [];
let currentSort = { key: 'totalSolved', dir: 'desc' };
let isLoading = false;

// ---------- DOM ----------
const dom = {
    body: () => document.getElementById('leaderboardBody'),
    memberCount: () => document.getElementById('memberCount'),
    lastUpdated: () => document.getElementById('lastUpdated'),
    loadingBar: () => document.getElementById('loadingBar'),
    loadingProgress: () => document.getElementById('loadingProgress'),
    loadingText: () => document.getElementById('loadingText'),
    searchInput: () => document.getElementById('searchInput'),
    collegeFilter: () => document.getElementById('collegeFilter'),
    branchFilter: () => document.getElementById('branchFilter'),
    refreshBtn: () => document.getElementById('refreshBtn'),
    // Modal
    modal: () => document.getElementById('profileModal'),
    modalClose: () => document.getElementById('closeModal'),
    modalAvatar: () => document.getElementById('modalAvatar'),
    modalName: () => document.getElementById('modalName'),
    modalBadge: () => document.getElementById('modalBadge'),
    modalPhone: () => document.getElementById('modalPhone'),
    modalEmail: () => document.getElementById('modalEmail'),
    modalLeetCode: () => document.getElementById('modalLeetCode'),
};

// ---------- Utilities ----------
const AVATAR_COLORS = [
    '#E74C3C', '#E67E22', '#F1C40F', '#2ECC71', '#1ABC9C',
    '#3498DB', '#9B59B6', '#E91E63', '#00BCD4', '#FF5722',
    '#795548', '#607D8B', '#8BC34A', '#FF9800', '#673AB7',
];

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
}

function getAvatarColor(name) {
    return AVATAR_COLORS[hashString(name) % AVATAR_COLORS.length];
}

function getInitials(name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function collegeShortName(college) {
    if (college && college.includes('Institute')) return 'SJIT';
    return 'SJCE';
}

// ---------- Modal Logic ----------
function showProfileModal(user) {
    const modal = dom.modal();
    const avatar = dom.modalAvatar();
    const name = dom.modalName();
    const badge = dom.modalBadge();
    const phone = dom.modalPhone();
    const email = dom.modalEmail();
    const leetcode = dom.modalLeetCode();

    avatar.style.background = getAvatarColor(user.name);
    avatar.textContent = getInitials(user.name);
    name.textContent = user.name;
    badge.textContent = `${collegeShortName(user.college)} · ${user.branch}`;

    if (user.phone) {
        phone.textContent = user.phone;
        phone.href = `tel:${user.phone}`;
    } else {
        phone.textContent = 'Not available';
        phone.href = '#';
    }

    if (user.email) {
        email.textContent = user.email;
        email.href = `mailto:${user.email}`;
    } else {
        email.textContent = 'Not available';
        email.href = '#';
    }

    const profileUrl = user.leetcodeUrl || (user.username ? `https://leetcode.com/u/${user.username}/` : '#');
    leetcode.href = profileUrl;
    leetcode.style.display = profileUrl === '#' ? 'none' : 'flex';

    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeProfileModal() {
    dom.modal().classList.remove('active');
    document.body.style.overflow = '';
}

// ---------- Data Loading (from server cache) ----------
async function loadCachedData() {
    try {
        const res = await fetch('/api/data');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const cache = await res.json();

        leaderboardData = cache.users || [];
        populateBranchFilter();
        sortAndRender();

        if (cache.lastUpdated) {
            const d = new Date(cache.lastUpdated);
            dom.lastUpdated().textContent = `Last updated: ${d.toLocaleString()}`;
        } else {
            dom.lastUpdated().textContent = 'No data yet — click Refresh';
        }

        dom.memberCount().textContent = leaderboardData.length;
    } catch (e) {
        console.error('Failed to load cache:', e);
        dom.loadingText().textContent = 'Failed to load data from server.';
    }
}

// ---------- Refresh (via Server-Sent Events) ----------
function refreshData() {
    if (isLoading) return;
    isLoading = true;

    const loadingBar = dom.loadingBar();
    const loadingProgress = dom.loadingProgress();
    const loadingText = dom.loadingText();
    const refreshBtn = dom.refreshBtn();

    loadingBar.classList.add('active');
    refreshBtn.classList.add('spinning');
    refreshBtn.disabled = true;
    loadingProgress.style.width = '0%';
    loadingText.textContent = 'Starting refresh…';

    const source = new EventSource('/api/refresh');

    source.addEventListener('message', (event) => {
        let msg;
        try { msg = JSON.parse(event.data); } catch { return; }

        if (msg.type === 'progress') {
            const pct = Math.round((msg.completed / msg.total) * 100);
            loadingProgress.style.width = pct + '%';
            const errText = msg.errors > 0 ? ` (${msg.errors} failed)` : '';
            loadingText.textContent = `Fetching… ${msg.completed}/${msg.total} — ${msg.username}${errText}`;
        }

        if (msg.type === 'done') {
            source.close();
            leaderboardData = msg.data.users || [];
            populateBranchFilter();
            sortAndRender();

            const d = new Date(msg.data.lastUpdated);
            dom.lastUpdated().textContent = `Last updated: ${d.toLocaleString()}`;
            dom.memberCount().textContent = leaderboardData.length;

            loadingProgress.style.width = '100%';
            loadingText.textContent = 'Refresh complete! Data saved to cache.json';
            setTimeout(() => {
                loadingBar.classList.remove('active');
                loadingProgress.style.width = '0%';
                loadingText.textContent = '';
            }, 3000);

            refreshBtn.classList.remove('spinning');
            refreshBtn.disabled = false;
            isLoading = false;
        }

        if (msg.type === 'error') {
            source.close();
            loadingText.textContent = `Error: ${msg.message}`;
            loadingBar.classList.remove('active');
            refreshBtn.classList.remove('spinning');
            refreshBtn.disabled = false;
            isLoading = false;
        }
    });

    source.addEventListener('error', () => {
        source.close();

        // Check if it was a 409 (already refreshing)
        loadingText.textContent = 'Connection lost or refresh already in progress. Try again.';
        loadingBar.classList.remove('active');
        refreshBtn.classList.remove('spinning');
        refreshBtn.disabled = false;
        isLoading = false;
    });
}

// ---------- Sorting ----------
function sortData(data, key, dir) {
    return [...data].sort((a, b) => {
        if (!a.username && b.username) return 1;
        if (a.username && !b.username) return -1;
        if (!a.username && !b.username) return a.name.localeCompare(b.name);

        let valA = a[key] || 0;
        let valB = b[key] || 0;

        if (valA !== valB) {
            return dir === 'desc' ? valB - valA : valA - valB;
        }

        if (a.hardSolved !== b.hardSolved) return b.hardSolved - a.hardSolved;
        if (a.mediumSolved !== b.mediumSolved) return b.mediumSolved - a.mediumSolved;
        if (a.totalSolved !== b.totalSolved) return b.totalSolved - a.totalSolved;
        return a.name.localeCompare(b.name);
    });
}

function sortAndRender() {
    const filtered = getFilteredData();
    const sorted = sortData(filtered, currentSort.key, currentSort.dir);
    renderTable(sorted);
    dom.memberCount().textContent = sorted.length;
    updateSortHeaders();
}

// ---------- Filtering ----------
function getFilteredData() {
    const search = (dom.searchInput().value || '').toLowerCase().trim();
    const college = dom.collegeFilter().value;
    const branch = dom.branchFilter().value;

    return leaderboardData.filter(p => {
        if (college !== 'all' && p.college !== college) return false;
        if (branch !== 'all' && p.branch !== branch) return false;
        if (search) {
            const hay = `${p.name} ${p.username || ''} ${p.branch}`.toLowerCase();
            if (!hay.includes(search)) return false;
        }
        return true;
    });
}

// ---------- Rendering ----------
function renderTable(data) {
    const tbody = dom.body();
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8">
                    <div class="empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <h3>No results found</h3>
                        <p>Try adjusting your search or filters.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    data.forEach((entry, index) => {
        const rank = index + 1;
        const tr = document.createElement('tr');

        if (rank <= 3) tr.classList.add(`rank-${rank}`);
        tr.style.animationDelay = `${index * 0.025}s`;

        let rankColorClass = '';
        if (rank === 1) rankColorClass = 'rank-gold';
        else if (rank === 2) rankColorClass = 'rank-silver';
        else if (rank === 3) rankColorClass = 'rank-bronze';

        const avatarColor = getAvatarColor(entry.name);
        const initials = getInitials(entry.name);

        const profileUrl = entry.username ? `https://leetcode.com/u/${entry.username}/` : '#';
        const nameLink = entry.username
            ? `<a href="${profileUrl}" target="_blank" rel="noopener">${entry.name}</a>`
            : entry.name;

        const collegeBadge = collegeShortName(entry.college);
        const nolcBadge = !entry.username ? ' <span class="no-lc">NO LC</span>' : '';
        const errorBadge = entry.error ? ' <span class="no-lc" style="background:#2a2a1a;color:#ffc01e">ERR</span>' : '';
        const badge = `${collegeBadge} · ${entry.branch}${nolcBadge}${errorBadge}`;

        tr.innerHTML = `
            <td>
                <span class="rank-number ${rankColorClass}">${rank}</span>
            </td>
            <td>
                <div class="name-cell">
                    <div class="avatar" style="background:${avatarColor}">${initials}</div>
                    <div class="name-info">
                        <div class="name-text">${entry.name}</div>
                        <div class="name-badge">${badge}</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="solved-count">${entry.username ? entry.totalSolved : '—'}</div>
            </td>
            <td>
                ${renderConsistency(entry)}
            </td>
            <td>
                ${renderDifficulty(entry.easySolved, TOTAL_EASY, 'easy', entry.username)}
            </td>
            <td>
                ${renderDifficulty(entry.mediumSolved, TOTAL_MEDIUM, 'medium', entry.username)}
            </td>
            <td>
                ${renderDifficulty(entry.hardSolved, TOTAL_HARD, 'hard', entry.username)}
            </td>
            <td>
                ${renderContestRating(entry)}
            </td>
        `;

        tr.addEventListener('click', () => showProfileModal(entry));
        tbody.appendChild(tr);
    });
}

function renderConsistency(entry) {
    if (!entry.username) return '<div class="consistency-cell"><span class="consistency-value" style="color:var(--text-muted)">—</span></div>';
    const days = entry.consistency30 || 0;
    const pct = Math.min((days / 30) * 100, 100);
    return `
        <div class="consistency-cell">
            <span class="consistency-value">${days}<span style="color:var(--text-muted);font-weight:400"> / 30</span></span>
            <div class="consistency-bar-container">
                <div class="consistency-bar" style="width:${pct}%;background:${days >= 20 ? 'var(--color-easy)' : days >= 10 ? 'var(--color-medium)' : 'var(--color-hard)'}"></div>
            </div>
        </div>
    `;
}

function renderDifficulty(solved, total, cls, hasUsername) {
    if (!hasUsername) {
        return `<div class="difficulty-cell"><span style="color:var(--text-muted)">—</span></div>`;
    }
    const pct = total > 0 ? Math.min((solved / total) * 100, 100) : 0;
    return `
        <div class="difficulty-cell">
            <div class="difficulty-counts">
                <span class="difficulty-solved ${cls}">${solved}</span>
                <span class="difficulty-total">/ ${total}</span>
            </div>
            <div class="difficulty-bar">
                <div class="difficulty-bar-fill ${cls}" style="width:${pct}%"></div>
            </div>
        </div>
    `;
}

function renderContestRating(entry) {
    if (!entry.username) return '<div class="contest-rating unrated">—</div>';
    if (!entry.contestRating || entry.contestRating === 0) {
        return '<div class="contest-rating unrated">—</div>';
    }
    return `<div class="contest-rating rated">${entry.contestRating}</div>`;
}

// ---------- Sort Headers ----------
function updateSortHeaders() {
    document.querySelectorAll('.leaderboard-table th.sortable').forEach(th => {
        th.classList.remove('sort-active');
        const icon = th.querySelector('.sort-icon');
        if (icon) icon.textContent = '▼';

        if (th.dataset.sort === currentSort.key) {
            th.classList.add('sort-active');
            const icon2 = th.querySelector('.sort-icon');
            if (icon2) icon2.textContent = currentSort.dir === 'desc' ? '▼' : '▲';
        }
    });
}

// ---------- Branch Filter ----------
function populateBranchFilter() {
    const select = dom.branchFilter();
    const currentVal = select.value;
    const branches = [...new Set(leaderboardData.map(p => p.branch).filter(Boolean))].sort();

    // Keep "All Branches" option, rebuild the rest
    select.innerHTML = '<option value="all">All Branches</option>';
    branches.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b;
        opt.textContent = b;
        if (b === currentVal) opt.selected = true;
        select.appendChild(opt);
    });
}

// ---------- Event Listeners ----------
function setupEventListeners() {
    let searchTimeout;
    dom.searchInput().addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => sortAndRender(), 200);
    });

    dom.collegeFilter().addEventListener('change', () => sortAndRender());
    dom.branchFilter().addEventListener('change', () => sortAndRender());

    // Refresh button → triggers server-side data fetch
    dom.refreshBtn().addEventListener('click', () => refreshData());

    // Sortable columns
    document.querySelectorAll('.leaderboard-table th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const key = th.dataset.sort;
            if (currentSort.key === key) {
                currentSort.dir = currentSort.dir === 'desc' ? 'asc' : 'desc';
            } else {
                currentSort.key = key;
                currentSort.dir = 'desc';
            }
            sortAndRender();
        });
    });

    // Modal Close
    dom.modalClose().addEventListener('click', () => closeProfileModal());
    dom.modal().addEventListener('click', (e) => {
        if (e.target === dom.modal()) closeProfileModal();
    });
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeProfileModal();
    });
}

// ---------- Init ----------
function init() {
    setupEventListeners();
    loadCachedData(); // Only reads cache — no API calls
}

document.addEventListener('DOMContentLoaded', init);
