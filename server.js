// ============================================
//  HOPE Tracker — Server
//  Run: node server.js
//  Requires: Node.js 18+
// ============================================

const http = require('http');
const fs = require('fs');
const path = require('path');

// ---------- Config ----------
const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const CACHE_FILE = path.join(ROOT_DIR, 'cache.json');
const LEETCODE_GQL = 'https://leetcode.com/graphql';
const FETCH_DELAY = 500; // ms between users
const MAX_RETRIES = 2;

// ---------- MIME Types ----------
const MIME = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.csv': 'text/csv',
    '.md': 'text/markdown',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
};

// ---------- Participant Data ----------
const PARTICIPANTS_FILE = path.join(ROOT_DIR, 'participants.csv');

function loadParticipantsFromCSV() {
    try {
        if (!fs.existsSync(PARTICIPANTS_FILE)) {
            console.error('participants.csv not found!');
            return [];
        }
        const content = fs.readFileSync(PARTICIPANTS_FILE, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim() !== '');
        const headers = lines[0].split(',').map(h => h.trim());

        return lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const p = {};
            headers.forEach((h, i) => {
                let key = h.toLowerCase();
                if (key === 'leetcode username') key = 'username';
                if (key === 'leetcode url') key = 'leetcodeUrl';
                p[key] = values[i] || null;
            });
            // Ensure consistency with previously hardcoded names if needed
            // But CSV seems to have all necessary info
            return p;
        });
    } catch (e) {
        console.error('Error reading participants.csv:', e.message);
        return [];
    }
}

const PARTICIPANTS = loadParticipantsFromCSV();


// ---------- GraphQL Query ----------
const USER_QUERY = `
query getUserProfile($username: String!) {
    matchedUser(username: $username) {
        username
        profile { ranking userAvatar }
        submitStats: submitStatsGlobal {
            acSubmissionNum { difficulty count }
        }
        submissionCalendar
    }
    userContestRanking(username: $username) {
        rating
        attendedContestsCount
    }
}`;

// ---------- Helpers ----------
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function readCache() {
    try {
        if (fs.existsSync(CACHE_FILE)) {
            return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
        }
    } catch (e) {
        console.error('Failed to read cache:', e.message);
    }
    return null;
}

function writeCache(data) {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Cache saved → ${CACHE_FILE}`);
}

function getDefaultCache() {
    return {
        lastUpdated: null,
        users: PARTICIPANTS.map(p => ({
            name: p.name,
            branch: p.branch,
            college: p.college,
            username: p.username,
            phone: p.phone,
            email: p.email,
            leetcodeUrl: p.leetcodeUrl,
            totalSolved: 0,
            easySolved: 0,
            mediumSolved: 0,
            hardSolved: 0,
            contestRating: 0,
            contestAttend: 0,
            consistency30: 0,
            error: false,
        })),
    };
}

// ---------- LeetCode Fetching ----------
async function fetchLeetCodeUser(username) {
    const res = await fetch(LEETCODE_GQL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Referer': 'https://leetcode.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        body: JSON.stringify({ query: USER_QUERY, variables: { username } }),
    });

    if (!res.ok) throw new Error(`LeetCode returned HTTP ${res.status}`);
    const json = await res.json();

    if (json.errors) {
        throw new Error(json.errors[0]?.message || 'GraphQL error');
    }

    return json.data;
}

function parseUserData(participant, raw) {
    const base = {
        name: participant.name,
        branch: participant.branch,
        college: participant.college,
        username: participant.username,
        phone: participant.phone,
        email: participant.email,
        leetcodeUrl: participant.leetcodeUrl,
    };

    if (!raw || !raw.matchedUser) {
        return { ...base, totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0, contestRating: 0, contestAttend: 0, consistency30: 0, error: false };
    }

    const user = raw.matchedUser;
    let totalSolved = 0, easySolved = 0, mediumSolved = 0, hardSolved = 0;

    if (user.submitStats?.acSubmissionNum) {
        for (const s of user.submitStats.acSubmissionNum) {
            if (s.difficulty === 'All') totalSolved = s.count;
            if (s.difficulty === 'Easy') easySolved = s.count;
            if (s.difficulty === 'Medium') mediumSolved = s.count;
            if (s.difficulty === 'Hard') hardSolved = s.count;
        }
    }

    let contestRating = 0, contestAttend = 0;
    if (raw.userContestRanking) {
        contestRating = Math.round(raw.userContestRanking.rating || 0);
        contestAttend = raw.userContestRanking.attendedContestsCount || 0;
    }

    let consistency30 = 0;
    if (user.submissionCalendar) {
        try {
            const cal = JSON.parse(user.submissionCalendar);
            const now = Math.floor(Date.now() / 1000);
            const cutoff = now - 30 * 86400;
            for (const [ts, count] of Object.entries(cal)) {
                if (parseInt(ts) >= cutoff && parseInt(ts) <= now && count > 0) consistency30++;
            }
        } catch {}
    }

    return { ...base, totalSolved, easySolved, mediumSolved, hardSolved, contestRating, contestAttend, consistency30, error: false };
}

async function fetchWithRetry(participant, retries = MAX_RETRIES) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            if (attempt > 0) await sleep(1000 * Math.pow(2, attempt));
            const raw = await fetchLeetCodeUser(participant.username);
            return parseUserData(participant, raw);
        } catch (e) {
            console.error(`  ✗ ${participant.username} attempt ${attempt + 1}: ${e.message}`);
            if (attempt === retries) {
                return {
                    name: participant.name, branch: participant.branch, college: participant.college,
                    username: participant.username,
                    phone: participant.phone, email: participant.email, leetcodeUrl: participant.leetcodeUrl,
                    totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0,
                    contestRating: 0, contestAttend: 0, consistency30: 0, error: true,
                };
            }
        }
    }
}

// ---------- Refresh state ----------
let isRefreshing = false;

// ---------- Static File Server ----------
function serveStatic(req, res) {
    let filePath = path.join(ROOT_DIR, req.url === '/' ? 'index.html' : req.url);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

// ---------- API Handlers ----------
function handleGetData(req, res) {
    const cache = readCache() || getDefaultCache();
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
    });
    res.end(JSON.stringify(cache));
}

function handleRefresh(req, res) {
    if (isRefreshing) {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Refresh already in progress' }));
        return;
    }

    isRefreshing = true;

    // SSE headers
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });

    const sendEvent = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Handle client disconnect
    req.on('close', () => {
        // Client disconnected — we keep fetching to complete the cache update
    });

    (async () => {
        const usersWithLC = PARTICIPANTS.filter(p => p.username);
        const usersWithoutLC = PARTICIPANTS.filter(p => !p.username).map(p => ({
            name: p.name, branch: p.branch, college: p.college, username: null,
            phone: p.phone, email: p.email, leetcodeUrl: p.leetcodeUrl,
            totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0,
            contestRating: 0, contestAttend: 0, consistency30: 0, error: false,
        }));

        const results = [];
        let completed = 0;
        let errors = 0;

        console.log(`\n🔄 Refreshing data for ${usersWithLC.length} users...`);

        for (const participant of usersWithLC) {
            const stats = await fetchWithRetry(participant);
            results.push(stats);
            if (stats.error) errors++;

            completed++;
            console.log(`  [${completed}/${usersWithLC.length}] ${stats.error ? '✗' : '✓'} ${participant.username} → ${stats.totalSolved} solved`);

            sendEvent({
                type: 'progress',
                completed,
                total: usersWithLC.length,
                username: participant.username,
                errors,
            });

            // Delay between requests
            if (completed < usersWithLC.length) {
                await sleep(FETCH_DELAY);
            }
        }

        const cacheData = {
            lastUpdated: new Date().toISOString(),
            users: [...results, ...usersWithoutLC],
        };

        writeCache(cacheData);

        sendEvent({ type: 'done', data: cacheData });

        console.log(`✅ Refresh complete. ${completed - errors} succeeded, ${errors} failed.\n`);

        isRefreshing = false;
        res.end();
    })().catch(err => {
        console.error('Refresh fatal error:', err);
        sendEvent({ type: 'error', message: err.message });
        isRefreshing = false;
        res.end();
    });
}

// ---------- HTTP Server ----------
const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (url.pathname === '/api/data' && req.method === 'GET') {
        return handleGetData(req, res);
    }

    if (url.pathname === '/api/refresh' && req.method === 'GET') {
        return handleRefresh(req, res);
    }

    // Serve static files (prevent directory traversal)
    if (url.pathname.includes('..')) {
        res.writeHead(400);
        return res.end('Bad Request');
    }

    serveStatic(req, res);
});

// ---------- Start ----------

// Version check
const nodeVer = parseInt(process.versions.node.split('.')[0]);
if (nodeVer < 18) {
    console.error(`❌ Node.js 18+ required. You have v${process.versions.node}`);
    process.exit(1);
}

// Ensure cache exists
if (!fs.existsSync(CACHE_FILE)) {
    writeCache(getDefaultCache());
    console.log('Created initial cache.json with empty data.');
}

server.listen(PORT, () => {
    console.log(`\n🚀 HOPE Tracker server running at http://localhost:${PORT}`);
    console.log(`📁 Serving from: ${ROOT_DIR}`);
    console.log(`💾 Cache file:   ${CACHE_FILE}`);
    console.log(`\nOpen http://localhost:${PORT} in your browser.`);
    console.log('Click "Refresh" on the page to fetch LeetCode data.\n');
});
