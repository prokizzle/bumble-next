(function() {
    'use strict';

    // Insert CSS for the modal
    GM_addStyle(`
        #bumbleNextModal {
            position: fixed;
            bottom: 20px;
            left: 20px;
            background-color: #ffcc00;
            padding: 10px 20px;
            border-radius: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            display: flex;
            align-items: center;
            font-family: Arial, sans-serif;
            color: #444;
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            transition: transform 0.3s ease-in-out;
            transform: translateY(100%);
        }
        #bumbleNextModal.open {
            transform: translateY(0);
        }
        #bumbleNextTitle {
            font-size: 20px;
            font-weight: bold;
            margin-right: 10px;
        }
        #bumbleNextModal button {
            margin-left: 10px;
            background-color: #333;
            color: #fff;
            border: none;
            cursor: pointer;
            padding: 8px 12px;
            border-radius: 18px;
            font-size: 14px;
            min-width: 120px;
        }
        #nextConversationBtn i {
            font-style: italic;
        }
        #bumbleNextModal .stats-container {
            padding: 8px 12px;
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 18px;
            display: flex;
            align-items: center;
            margin-right: 10px;
        }
        #bumbleNextModal .toggle-container {
            padding: 8px 12px;
            display: flex;
            align-items: center;
        }
        #bumbleNextModal .toggle-button {
            background-color: #555;
            color: #fff;
            font-size: 14px;
            border-radius: 12px;
            padding: 5px 10px;
            cursor: pointer;
            text-align: center;
        }
    `);

    // Insert the modal HTML with "Bumble Next" title
    const modalHTML = `
        <div id="bumbleNextModal">
            <div id="bumbleNextTitle">Bumble Next</div>
            <div class="stats-container">
                <span id="highPriorityCount"><span class="emoji-icon">🌟</span>High: 0</span>
                <span id="lowPriorityCount"><span class="emoji-icon">📥</span>Low: 0</span>
            </div>
            <button id="nextConversationBtn"><i>Next</i> 🐝</button>
            <div class="toggle-container">
                <button id="enterKeyToggle" class="toggle-button">Disable Enter Key</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const bumbleNextModal = document.getElementById('bumbleNextModal');
    bumbleNextModal.addEventListener('click', () => {
        bumbleNextModal.classList.toggle('open');
    });

    let NEW_MESSAGES = ".has-notifications";
    let YOUR_MOVE = ".contact__move-label";
    let MESSAGE_LIST_CONTAINER = ".scroll__inner";
    let CONTACT_CLASS = ".contact";
    let CONTACT_MESSAGE_CLASS = ".contact__message";
    let allNext = [];
    let contactIndex = 0;
    let processingContacts = false;
    let enterKeyEnabled = true;

    let phoneNumberRegex = /(\+?\d{1,3}[-.\s]?)?(\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}/;

    let stillValid = (node) => {
        return node.offsetParent !== null;
    };

    function loadMoreMessages() {
        console.log("Loading more messages...");
        var objDiv = document.querySelector(MESSAGE_LIST_CONTAINER);
        objDiv.scrollTop = objDiv.scrollHeight;
    };

    window.setInterval(loadMoreMessages, 5000);

    let getPriorityConversations = () => {
        return [...document.querySelectorAll(NEW_MESSAGES), ...document.querySelectorAll(YOUR_MOVE)]
            .filter(stillValid);
    };

    let getLowPriorityConversations = () => {
        return [...document.querySelectorAll(CONTACT_CLASS)].reverse().filter(stillValid);
    };

    let updateModalCounts = () => {
        let priorityItems = getPriorityConversations();
        let lowPriorityItems = getLowPriorityConversations();

        document.getElementById('highPriorityCount').textContent = '🌟 High: ' + priorityItems.length;
        document.getElementById('lowPriorityCount').textContent = '📥 Low: ' + lowPriorityItems.length;
    };

    let containsPhoneNumber = (contact) => {
        let messageElement = contact?.parentElement?.parentElement?.parentElement?.querySelector(CONTACT_MESSAGE_CLASS)?.textContent;
        console.log({contact, messageElement});
        if (messageElement) {
            return phoneNumberRegex.test(messageElement);
        }
        return false;
    };

    let processItem = (item) => {
        if (item && typeof item.click === 'function') {
            console.log("Processing item:", item, 'phoneNumber', containsPhoneNumber(item));

            item.click();
            updateModalCounts();
            return true;
        }
        return false;
    };

    let processNextItem = () => {
        let priorityItems = getPriorityConversations().filter(item => !containsPhoneNumber(item));
        let lowPriorityItems = getLowPriorityConversations().filter(item => !containsPhoneNumber(item));

        updateModalCounts();

        if (priorityItems.length > 0) {
            processingContacts = false;
            return processItem(priorityItems[0]);
        }

        if (!processingContacts) {
            allNext = lowPriorityItems;
            contactIndex = 0;
            processingContacts = true;
        }

        if (contactIndex < allNext.length) {
            const contact = allNext[contactIndex];
            contactIndex++;

            console.log('contact', {contact});

            if (contact && containsPhoneNumber(contact)) {
                console.log("Skipping contact with phone number:", contact);
                return processNextItem();
            }

            return processItem(contact);
        }

        processingContacts = false;
        console.log("No more items to process. Restarting the cycle.");
        return false;
    };

    let processItems = () => {
        loadMoreMessages();
        if (!processNextItem()) {
            setTimeout(processItems, 1000);
        }
    };

    document.getElementById('nextConversationBtn').addEventListener('click', processNextItem);

    document.getElementById('enterKeyToggle').addEventListener('click', () => {
        enterKeyEnabled = !enterKeyEnabled;
        document.getElementById('enterKeyToggle').textContent = enterKeyEnabled ? "Disable Enter Key" : "Enable Enter Key";
    });

    document.addEventListener("keypress", ({ key }) => {
        if (key === "Enter" && enterKeyEnabled) {
            loadMoreMessages();
            console.log("Enter pressed - processing next item");
            processItems();
        } else if (key === "Escape") {
            console.log("Escape pressed - skipping current item");
            processNextItem();
        }
    });

    updateModalCounts();
})();
