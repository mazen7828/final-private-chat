/**
 * Private Chat - Main Orchestration
 * Handles initialization and cross-module event flow.
 */

// Initialize App
function init() {
    loadData();
    checkAndResetDailyLimits(onReset);
    
    const savedIdentity = localStorage.getItem(IDENTITY_KEY);
    if (savedIdentity) {
        setCurrentSender(savedIdentity);
        
        // Firebase-ready: Mark user as online (would use Firebase presence in production)
        markUserOnline(savedIdentity);
        
        // Check for unread messages and show divider if any exist
        const firstUnreadIndex = getFirstUnreadIndex(savedIdentity);
        renderAllMessages(elements, handleReplyClick, handleEditClick, firstUnreadIndex);
        
        // Mark messages as read after rendering
        // Firebase-ready: This would be a Firebase update in production
        if (firstUnreadIndex !== -1) {
            markMessagesAsRead(savedIdentity);
        }
        
        checkUIState(elements);
        
        // Start presence status updates
        startPresenceUpdates(elements);
    } else {
        renderAllMessages(elements, handleReplyClick, handleEditClick);
        elements.identityModal.classList.add('show');
    }
    
    updateCounters(elements);
    setupEventListeners(() => updateCounters(elements), handleReplyClick, handleEditClick);
    setupPresenceTracking(handleReplyClick, handleEditClick);
    setInterval(() => checkAndResetDailyLimits(onReset), 1000);
}

function onReset() {
    updateCounters(elements);
    checkUIState(elements);
}

function handleReplyClick(messageId) {
    startReply(messageId, elements);
}

function handleEditClick(messageId) {
    startEdit(messageId, elements);
    updateQuickMessageVisibility();
}

// App Kickoff
init();
updateQuickMessageVisibility();