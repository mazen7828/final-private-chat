// State Management Module

const DAILY_LIMIT = 20;
const STORAGE_KEY = 'privateChatData_v3';
const IDENTITY_KEY = 'privateChatIdentity';
const REACTIONS_KEY = 'privateChatReactions';
const EMOJI_USAGE_KEY = 'privateChatEmojiUsage';
const PRESENCE_KEY = 'privateChatPresence';

const IS_TIMER_ENABLED = true;
const DAILY_LIMIT_SYSTEM_ENABLED = true;

const BLOCK_MESSAGES = {
    ASMAA: "يلا يا بنوتي قومي خلصي اللي وراكي او نامي يا ماما وبكره نبقي نكمل كلامنا",
    MAZEN: "قوم بقي ياعم بطل محن بقي قوم يلاااا"
};

let state = {
    messages: [],
    limits: {
        MAZEN: { count: 0, date: getTodayDate(), finalNoteSent: false },
        ASMAA: { count: 0, date: getTodayDate(), finalNoteSent: false }
    }
};

let reactions = {};
let emojiUsage = {};

// Presence tracking
// Firebase-ready: In production, this would be replaced with Firebase Realtime Database presence system
let presence = {
    MAZEN: { isOnline: false, lastSeen: Date.now() },
    ASMAA: { isOnline: false, lastSeen: Date.now() }
};

let currentSender = null;

function setCurrentSender(sender) {
    currentSender = sender;
}

function getCurrentSender() {
    return currentSender;
}

function loadData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            state = { ...state, ...parsed };
            // Ensure all messages have readBy property for backward compatibility
            state.messages = state.messages.map(msg => {
                if (!msg.readBy) {
                    msg.readBy = { MAZEN: true, ASMAA: true };
                }
                return msg;
            });
        } catch (e) {
            console.error("Error parsing storage data", e);
        }
    }
    
    const storedReactions = localStorage.getItem(REACTIONS_KEY);
    if (storedReactions) {
        try {
            reactions = JSON.parse(storedReactions);
        } catch (e) {
            console.error("Error parsing reactions data", e);
        }
    }
    
    const storedEmojiUsage = localStorage.getItem(EMOJI_USAGE_KEY);
    if (storedEmojiUsage) {
        try {
            emojiUsage = JSON.parse(storedEmojiUsage);
        } catch (e) {
            console.error("Error parsing emoji usage data", e);
        }
    }
    
    // Firebase-ready: Load presence from localStorage (would be Firebase in production)
    const storedPresence = localStorage.getItem(PRESENCE_KEY);
    if (storedPresence) {
        try {
            presence = JSON.parse(storedPresence);
        } catch (e) {
            console.error("Error parsing presence data", e);
        }
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function saveReactions() {
    localStorage.setItem(REACTIONS_KEY, JSON.stringify(reactions));
}

function saveEmojiUsage() {
    localStorage.setItem(EMOJI_USAGE_KEY, JSON.stringify(emojiUsage));
}

// Firebase-ready: Save presence to localStorage (would be Firebase Realtime Database in production)
function savePresence() {
    localStorage.setItem(PRESENCE_KEY, JSON.stringify(presence));
}

// Firebase-ready: Mark user as online (would update Firebase presence in production)
function markUserOnline(user) {
    if (!user) return;
    presence[user] = {
        isOnline: true,
        lastSeen: Date.now()
    };
    savePresence();
}

// Firebase-ready: Mark user as offline (would update Firebase presence in production)
function markUserOffline(user) {
    if (!user) return;
    presence[user] = {
        isOnline: false,
        lastSeen: Date.now()
    };
    savePresence();
}

// Firebase-ready: Update user's last seen timestamp (would update Firebase in production)
function updateUserActivity(user) {
    if (!user) return;
    presence[user] = {
        isOnline: true,
        lastSeen: Date.now()
    };
    savePresence();
}

// Get the other user's name
function getOtherUser(currentUser) {
    if (currentUser === 'MAZEN') return 'ASMAA';
    if (currentUser === 'ASMAA') return 'MAZEN';
    return null;
}

function getTodayDate() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function checkAndResetDailyLimits(onResetCallback) {
    if (!IS_TIMER_ENABLED) return;

    const today = getTodayDate();
    let resetHappened = false;
    
    ['MAZEN', 'ASMAA'].forEach(user => {
        if (state.limits[user].date !== today) {
            state.limits[user] = { 
                count: 0, 
                date: today, 
                finalNoteSent: false 
            };
            resetHappened = true;
        }
    });
    
    if (resetHappened) {
        saveData();
        if (onResetCallback) onResetCallback();
        console.log("Midnight Reset Triggered: Limits cleared.");
    }
}

function updateCounters(elements) {
    elements.mazenCounter.textContent = `${state.limits.MAZEN.count}/${DAILY_LIMIT}`;
    elements.asmaaCounter.textContent = `${state.limits.ASMAA.count}/${DAILY_LIMIT}`;
}

// Firebase-ready: This function would query unread count from Firebase in production
function getUnreadCount(user) {
    if (!user) return 0;
    return state.messages.filter(msg => 
        msg.sender !== user && !msg.readBy[user]
    ).length;
}

// Firebase-ready: This would update Firebase read status in production
function markMessagesAsRead(user) {
    if (!user) return;
    let updated = false;
    state.messages.forEach(msg => {
        if (msg.sender !== user && !msg.readBy[user]) {
            msg.readBy[user] = true;
            updated = true;
        }
    });
    if (updated) {
        saveData();
    }
}

// Get index of first unread message for current user
function getFirstUnreadIndex(user) {
    if (!user) return -1;
    return state.messages.findIndex(msg => 
        msg.sender !== user && !msg.readBy[user]
    );
}