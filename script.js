// ============================================
//  HOPE Tracker — Script
// ============================================

// ---------- Configuration ----------
const API_BASE = 'https://alfa-leetcode-api.onrender.com';
const CACHE_KEY = 'hope_tracker_cache_v2';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const BATCH_SIZE = 5;
const BATCH_DELAY = 350; // ms between batches

// Approximate total LeetCode problems (2025)
const TOTAL_EASY = 850;
const TOTAL_MEDIUM = 1800;
const TOTAL_HARD = 780;

// ---------- Participant Data ----------
const PARTICIPANTS = [
    { name: "Thilamaren S S", branch: "CSE", college: "St. Joseph's College of Engineering", username: "thilamaren_" },
    { name: "Ganesh Kumaar B", branch: "AI", college: "St. Joseph's College of Engineering", username: "upNrLbHogs" },
    { name: "Kartheesh Shankar", branch: "AIML", college: "St. Joseph's College of Engineering", username: "K6N78Wp7dH" },
    { name: "Leon Raj J", branch: "CSE", college: "St. Joseph's College of Engineering", username: "leonraj" },
    { name: "Jayden Jeswin Raj G", branch: "CSE", college: "St. Joseph's College of Engineering", username: "PhoenixKiller" },
    { name: "Viviyan Prince P", branch: "CSE", college: "St. Joseph's College of Engineering", username: "viviyanprince1212" },
    { name: "Dhanush Raj VR", branch: "AIML", college: "St. Joseph's College of Engineering", username: "020308" },
    { name: "Harish Balaji R", branch: "CSE", college: "St. Joseph's College of Engineering", username: "HarishBalajiR" },
    { name: "Thirupathi Selvaraj V R", branch: "CSE", college: "St. Joseph's College of Engineering", username: "SELVAx1257" },
    { name: "Meenakshi M", branch: "CSC", college: "St. Joseph's College of Engineering", username: "meenakshi007" },
    { name: "Gowtham M", branch: "CSE", college: "St. Joseph's College of Engineering", username: "GowthamM_21" },
    { name: "Rukmangathan R P", branch: "AI", college: "St. Joseph's College of Engineering", username: "9HUi9KPB3S" },
    { name: "Sunil N", branch: "CSE", college: "St. Joseph's College of Engineering", username: "sunil_n_21" },
    { name: "Ashwikha S", branch: "CSE", college: "St. Joseph's College of Engineering", username: "ASHWIKHA" },
    { name: "Gadamsetty V N Sanjana", branch: "AI", college: "St. Joseph's College of Engineering", username: "SanjanaGadamsetty" },
    { name: "Kevin Jonathan A K", branch: "AIML", college: "St. Joseph's College of Engineering", username: "AK_Kevin" },
    { name: "Vishnu Priya K", branch: "ECE", college: "St. Joseph's College of Engineering", username: "K_VISHNU_PRIYA" },
    { name: "Shreyas S", branch: "CSBS", college: "St. Joseph's College of Engineering", username: "Shreyas_S1403" },
    { name: "Mohamed Fadhil M", branch: "CSE", college: "St. Joseph's College of Engineering", username: "Mohamed_Fadhil" },
    { name: "Rokeshwaran M", branch: "AI", college: "St. Joseph's College of Engineering", username: "tKw7goeaf5" },
    { name: "Shruthika Suyaraj", branch: "IT", college: "St. Joseph's College of Engineering", username: "ShruthikaS_" },
    { name: "Ashok K", branch: "AI", college: "St. Joseph's College of Engineering", username: "MR_ASHOK_06" },
    { name: "Mohamed Rakshan S", branch: "ECE", college: "St. Joseph's College of Engineering", username: "Rakshan_Md" },
    { name: "Anandhavel A", branch: "CSE", college: "St. Joseph's College of Engineering", username: "ANANDHAVEL019" },
    { name: "Girish R M", branch: "ECE", college: "St. Joseph's College of Engineering", username: "rmgirish" },
    { name: "Rishikumar D", branch: "CSC", college: "St. Joseph's College of Engineering", username: null },
    { name: "Dhanush Kumar S", branch: "AI", college: "St. Joseph's College of Engineering", username: "Danush_kumar" },
    { name: "Maria K Paul", branch: "MCSE", college: "St. Joseph's College of Engineering", username: "Maria_K_Paul" },
    { name: "Balaji Sanjay A", branch: "CSE", college: "St. Joseph's College of Engineering", username: "BalajiSanjay_A" },
    { name: "Angeline Marry D", branch: "CSC", college: "St. Joseph's College of Engineering", username: "Angeline_D07" },
    { name: "Reyhaan S", branch: "IT", college: "St. Joseph's College of Engineering", username: "Blueundead" },
    { name: "Karunya Adhvaidhi S", branch: "ECE", college: "St. Joseph's College of Engineering", username: "karunya_shan" },
    { name: "Bharani P", branch: "CSBS", college: "St. Joseph's College of Engineering", username: "GsomMXg9AA" },
    { name: "Janani B N", branch: "CSE", college: "St. Joseph's College of Engineering", username: "Janani_bn" },
    { name: "Jaya Prathiba Prabakaran", branch: "EEE", college: "St. Joseph's College of Engineering", username: "Jaya_Prathiba" },
    { name: "Harini G", branch: "IT", college: "St. Joseph's College of Engineering", username: "harichillin" },
    { name: "Harish Kumar K", branch: "AI", college: "St. Joseph's College of Engineering", username: "harish_cr7" },
    { name: "Gautham Krishna A", branch: "AIML", college: "St. Joseph's College of Engineering", username: "gautham112" },
    { name: "Jerim W", branch: "AIML", college: "St. Joseph's College of Engineering", username: "Jerim_0510" },
    { name: "Sivagnanavel G", branch: "AI", college: "St. Joseph's College of Engineering", username: null },
    { name: "Pon Swetha G J", branch: "CSE", college: "St. Joseph's College of Engineering", username: "swethanishanth" },
    { name: "Parmesh KS", branch: "AI", college: "St. Joseph's College of Engineering", username: "Parmesh_KS" },
    { name: "Mohamed Aaqil M", branch: "AI", college: "St. Joseph's College of Engineering", username: "Aaqil_2007" },
    { name: "Sri Varshni M", branch: "CSE", college: "St. Joseph's College of Engineering", username: null },
    { name: "Vishanth V S", branch: "AI", college: "St. Joseph's College of Engineering", username: "vishanth_vs21" },
    { name: "Gnanasakthi T", branch: "CSE", college: "St. Joseph's College of Engineering", username: "LC_GST" },
    { name: "Ganeshbabu B", branch: "IT", college: "St. Joseph's College of Engineering", username: "ganeshbaabu" },
    { name: "Sanjay Narayanan N", branch: "ECE", college: "St. Joseph's Institute of Technology", username: "SANJAYN3010" },
    { name: "Devesh Nathan", branch: "CSE", college: "St. Joseph's Institute of Technology", username: "Devesh5Nathan" },
    { name: "Naveen S", branch: "ECE", college: "St. Joseph's Institute of Technology", username: "8nPXgNTvdf" },
    { name: "Kevin Joel V", branch: "CSC", college: "St. Joseph's Institute of Technology", username: "kevin08joel" },
    { name: "Nirula V", branch: "CSE", college: "St. Joseph's Institute of Technology", username: "nirula23" },
    { name: "Hanniel Jose", branch: "CSE", college: "St. Joseph's Institute of Technology", username: "Hanniel677" },
    { name: "Akshaya Sriram", branch: "IT", college: "St. Joseph's Institute of Technology", username: "Akshaya_Sriram" },
    { name: "Alekh Kumar", branch: "AI", college: "St. Joseph's Institute of Technology", username: "_alekh" },
    { name: "Vaibhav S", branch: "AIML", college: "St. Joseph's Institute of Technology", username: "vaibhavsriram" },
    { name: "Thulasidass R", branch: "ECE", college: "St. Joseph's Institute of Technology", username: "Thulasidass_1410" },
    { name: "Dineshkumar V", branch: "CSE", college: "St. Joseph's Institute of Technology", username: "_Dinesh_Kumar_V" },
    { name: "Roshan Shakthi S", branch: "CSE", college: "St. Joseph's Institute of Technology", username: "tgKu37Q3Tk" },
    { name: "Melvin N", branch: "CSE", college: "St. Joseph's Institute of Technology", username: "Melvin_N" },
    { name: "Harinee S", branch: "CSE", college: "St. Joseph's Institute of Technology", username: "Harinee_Suresh" },
    { name: "Gokul Raam H R", branch: "CSE", college: "St. Joseph's Institute of Technology", username: "gokulraam03" },
    { name: "Madhesh S", branch: "AI", college: "St. Joseph's Institute of Technology", username: "madhesh1341" },
    { name: "Flavin M L", branch: "CSC", college: "St. Joseph's Institute of Technology", username: "Flavin07" },
    { name: "Sree Harini R S", branch: "AI", college: "St. Joseph's Institute of Technology", username: "SREE_HARINI_R_S" },
    { name: "Jayachandiran T V", branch: "CSE", college: "St. Joseph's Institute of Technology", username: "Jayachandirantv" },
    { name: "Sainimal G E", branch: "IT", college: "St. Joseph's Institute of Technology", username: "tscJjzjhAq" },
    { name: "Pradeep Chengada K", branch: "CSE", college: "St. Joseph's Institute of Technology", username: "Pradeep_Chengada" },
    { name: "Yuvan PM", branch: "CSC", college: "St. Joseph's Institute of Technology", username: "yuvan_gg" },
    { name: "Muthubala K", branch: "AI", college: "St. Joseph's Institute of Technology", username: "muthu1324" },
    { name: "Gokulraj D", branch: "AI", college: "St. Joseph's Institute of Technology", username: "gokul0410" },
    { name: "Prazila Pearl J", branch: "CSE", college: "St. Joseph's Institute of Technology", username: "Prazi_Pearl" },
    { name: "Prisha Adithi Murugan", branch: "AI", college: "St. Joseph's Institute of Technology", username: "Prisha_Adithi_Murugan" },
    { name: "Guruprasath S B", branch: "AIML", college: "St. Joseph's Institute of Technology", username: "GURUPRASATHSB" },
    { name: "Nandha Kumar M", branch: "CSE", college: "St. Joseph's Institute of Technology", username: "Nandhu2432" },
    { name: "Jeffrin Jebuson K", branch: "CSE", college: "St. Joseph's Institute of Technology", username: "Jeffrin_1111" },
    { name: "Sudhanjanan D V", branch: "CSE", college: "St. Joseph's Institute of Technology", username: "5FhSF6BrJO" },
];

// ---------- State ----------
let leaderboardData = [];
let currentSort = { key: 'totalSolved', dir: 'desc' };
let isLoading = false;

// ---------- DOM References ----------
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function collegeShortName(college) {
    if (college.includes('Institute')) return 'SJIT';
    return 'SJCE';
}

// ---------- Cache ----------
function getCache() {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
}

function setCache(data) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('Cache write failed:', e);
    }
}

function clearCache() {
    localStorage.removeItem(CACHE_KEY);
}

function getCachedUser(username) {
    const cache = getCache();
    const entry = cache[username];
    if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
    return null;
}

function setCachedUser(username, data) {
    const cache = getCache();
    cache[username] = { data, ts: Date.now() };
    setCache(cache);
}

// ---------- API ----------
async function fetchWithTimeout(url, timeoutMs = 15000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (e) {
        clearTimeout(id);
        throw e;
    }
}

async function fetchUserStats(username) {
    // Check cache
    const cached = getCachedUser(username);
    if (cached) return cached;

    try {
        const [solvedRes, contestRes, calendarRes] = await Promise.allSettled([
            fetchWithTimeout(`${API_BASE}/${username}/solved`),
            fetchWithTimeout(`${API_BASE}/${username}/contest`),
            fetchWithTimeout(`${API_BASE}/${username}/calendar`),
        ]);

        const solved = solvedRes.status === 'fulfilled' ? solvedRes.value : {};
        const contest = contestRes.status === 'fulfilled' ? contestRes.value : {};
        const calendar = calendarRes.status === 'fulfilled' ? calendarRes.value : {};

        const data = {
            totalSolved: solved.solvedProblem || 0,
            easySolved: solved.easySolved || 0,
            mediumSolved: solved.mediumSolved || 0,
            hardSolved: solved.hardSolved || 0,
            contestRating: Math.round(contest.contestRating || 0),
            contestAttend: contest.contestAttend || 0,
            consistency30: calculateConsistency(calendar.submissionCalendar),
            totalActiveDays: calendar.totalActiveDays || 0,
            streak: calendar.streak || 0,
            fetched: true,
            error: false,
        };

        setCachedUser(username, data);
        return data;
    } catch (e) {
        console.error(`Failed to fetch ${username}:`, e.message);
        return {
            totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0,
            contestRating: 0, contestAttend: 0, consistency30: 0,
            totalActiveDays: 0, streak: 0,
            fetched: true, error: true,
        };
    }
}

function calculateConsistency(calendarStr) {
    if (!calendarStr) return 0;
    try {
        const calendar = typeof calendarStr === 'string' ? JSON.parse(calendarStr) : calendarStr;
        const now = Math.floor(Date.now() / 1000);
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60);
        let activeDays = 0;
        for (const [ts, count] of Object.entries(calendar)) {
            const timestamp = parseInt(ts);
            if (timestamp >= thirtyDaysAgo && timestamp <= now && count > 0) {
                activeDays++;
            }
        }
        return activeDays;
    } catch {
        return 0;
    }
}

// ---------- Data Loading ----------
async function loadAllData(forceRefresh = false) {
    if (isLoading) return;
    isLoading = true;

    const loadingBar = dom.loadingBar();
    const loadingProgress = dom.loadingProgress();
    const loadingText = dom.loadingText();
    const refreshBtn = dom.refreshBtn();

    loadingBar.classList.add('active');
    refreshBtn.classList.add('spinning');

    if (forceRefresh) clearCache();

    // Build the participant list with placeholders
    leaderboardData = PARTICIPANTS.map(p => ({
        ...p,
        totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0,
        contestRating: 0, contestAttend: 0, consistency30: 0,
        totalActiveDays: 0, streak: 0,
        fetched: !p.username, // no-username users are "fetched" with zeroes
        error: false,
    }));

    // Show skeletons
    renderSkeletons();

    // Fetch in batches
    const usersWithLC = PARTICIPANTS.filter(p => p.username);
    let completed = 0;

    for (let i = 0; i < usersWithLC.length; i += BATCH_SIZE) {
        const batch = usersWithLC.slice(i, i + BATCH_SIZE);
        const results = await Promise.all(
            batch.map(p => fetchUserStats(p.username))
        );

        results.forEach((stats, idx) => {
            const participant = batch[idx];
            const entry = leaderboardData.find(d => d.username === participant.username);
            if (entry) Object.assign(entry, stats);
        });

        completed += batch.length;
        const pct = Math.round((completed / usersWithLC.length) * 100);
        loadingProgress.style.width = pct + '%';
        loadingText.textContent = `Fetching data… ${completed}/${usersWithLC.length} users`;

        if (i + BATCH_SIZE < usersWithLC.length) {
            await sleep(BATCH_DELAY);
        }
    }

    // Done fetching
    loadingProgress.style.width = '100%';
    loadingText.textContent = '';
    setTimeout(() => {
        loadingBar.classList.remove('active');
        loadingProgress.style.width = '0%';
    }, 800);

    refreshBtn.classList.remove('spinning');
    isLoading = false;

    // Update timestamp
    const now = new Date();
    dom.lastUpdated().textContent = `Last updated: ${now.toLocaleTimeString()}`;

    // Render
    sortAndRender();
}

// ---------- Sorting ----------
function sortData(data, key, dir) {
    return [...data].sort((a, b) => {
        // Users without LeetCode go to bottom
        if (!a.username && b.username) return 1;
        if (a.username && !b.username) return -1;
        if (!a.username && !b.username) return a.name.localeCompare(b.name);

        let valA = a[key] || 0;
        let valB = b[key] || 0;

        if (valA !== valB) {
            return dir === 'desc' ? valB - valA : valA - valB;
        }

        // Tiebreaker: hardSolved > mediumSolved > totalSolved > name
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
function renderSkeletons() {
    const tbody = dom.body();
    tbody.innerHTML = '';
    for (let i = 0; i < 15; i++) {
        const tr = document.createElement('tr');
        tr.className = 'skeleton-row';
        tr.innerHTML = `
            <td><div class="skeleton count-sk"></div></td>
            <td>
                <div class="name-cell">
                    <div class="skeleton avatar-sk"></div>
                    <div class="name-info">
                        <div class="skeleton name-sk"></div>
                        <div class="skeleton badge-sk"></div>
                    </div>
                </div>
            </td>
            <td><div class="skeleton count-sk"></div></td>
            <td><div class="skeleton count-sk"></div></td>
            <td><div class="skeleton bar-sk"></div></td>
            <td><div class="skeleton bar-sk"></div></td>
            <td><div class="skeleton bar-sk"></div></td>
            <td><div class="skeleton count-sk"></div></td>
        `;
        tr.style.animationDelay = `${i * 0.03}s`;
        tbody.appendChild(tr);
    }
}

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

        // Rank class for top 3
        if (rank <= 3) tr.classList.add(`rank-${rank}`);

        // Animation delay
        tr.style.animationDelay = `${index * 0.025}s`;

        // Rank color class
        let rankColorClass = '';
        if (rank === 1) rankColorClass = 'rank-gold';
        else if (rank === 2) rankColorClass = 'rank-silver';
        else if (rank === 3) rankColorClass = 'rank-bronze';

        // Avatar
        const avatarColor = getAvatarColor(entry.name);
        const initials = getInitials(entry.name);

        // Name link
        const profileUrl = entry.username ? `https://leetcode.com/u/${entry.username}/` : '#';
        const nameLink = entry.username
            ? `<a href="${profileUrl}" target="_blank" rel="noopener">${entry.name}</a>`
            : entry.name;

        // Badge
        const collegeBadge = collegeShortName(entry.college);
        const nolcBadge = !entry.username ? ' <span class="no-lc">NO LC</span>' : '';
        const badge = `${collegeBadge} · ${entry.branch}${nolcBadge}`;

        // Build row HTML
        tr.innerHTML = `
            <td>
                <span class="rank-number ${rankColorClass}">${rank}</span>
            </td>
            <td>
                <div class="name-cell">
                    <div class="avatar" style="background:${avatarColor}">${initials}</div>
                    <div class="name-info">
                        <div class="name-text">${nameLink}</div>
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
            const icon = th.querySelector('.sort-icon');
            if (icon) icon.textContent = currentSort.dir === 'desc' ? '▼' : '▲';
        }
    });
}

// ---------- Branch Filter Populate ----------
function populateBranchFilter() {
    const branches = [...new Set(PARTICIPANTS.map(p => p.branch))].sort();
    const select = dom.branchFilter();
    branches.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b;
        opt.textContent = b;
        select.appendChild(opt);
    });
}

// ---------- Event Listeners ----------
function setupEventListeners() {
    // Search
    let searchTimeout;
    dom.searchInput().addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => sortAndRender(), 200);
    });

    // College filter
    dom.collegeFilter().addEventListener('change', () => sortAndRender());

    // Branch filter
    dom.branchFilter().addEventListener('change', () => sortAndRender());

    // Refresh button
    dom.refreshBtn().addEventListener('click', () => {
        if (!isLoading) loadAllData(true);
    });

    // Sortable column headers
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
}

// ---------- Init ----------
function init() {
    populateBranchFilter();
    setupEventListeners();
    dom.memberCount().textContent = PARTICIPANTS.length;
    loadAllData();
}

document.addEventListener('DOMContentLoaded', init);
