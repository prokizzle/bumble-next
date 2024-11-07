  // ==UserScript==
  // @name         Bumble Next
  // @namespace    http://tampermonkey.net/
  // @version      1.1
  // @description  Automatically process contacts and messages, with a dynamic UI modal to show status and control on Bumble.
  // @author       Nick Prokesch
  // @match        https://bumble.com/app/connections*
  // @grant        GM_addStyle
  // ==/UserScript==

  (function () {
    'use strict';

    // Insert CSS for the modal
    GM_addStyle(`
          #bumbleNextModal {
              position: fixed;
              bottom: 20px;
              right: 20px;
              background-color: #ffcc00;
              padding: 10px 20px; /* Updated padding for better spacing */
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
          }
          #bumbleNextTitle {
              font-size: 20px; /* Larger font size for the title */
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
              font-style: italic; /* Italicized 'Next' text */
          }
          #bumbleNextModal .stats-container {
              padding: 8px 12px;
              background-color: rgba(0, 0, 0, 0.2); /* Slightly darker background for contrast */
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

    let NEW_MESSAGES = ".has-notifications";
    let YOUR_MOVE = ".contact__move-label";
    let MESSAGE_LIST_CONTAINER = ".scroll__inner";
    let CONTACT_CLASS = ".contact";
    let CONTACT_MESSAGE_CLASS = ".contact__message";
    let allNext = [];
    let contactIndex = 0;
    let processingContacts = false;
    let enterKeyEnabled = true;  // State to track if Enter keypress is enabled

    // Enhanced regex to detect phone numbers in various formats
    let phoneNumberRegex = /(\+?\d{1,3}[-.\s]?)?(\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}/;

    // Checks if a node is still valid and visible on the screen
    let stillValid = (node) => {
      return node.offsetParent !== null;
    };

    // Simulates scrolling to load more messages in a container
    let loadMoreMessages = () => {
      var objDiv = document.querySelector(MESSAGE_LIST_CONTAINER);
      objDiv.scrollTop = objDiv.scrollHeight;
    };

    // Gets all priority conversations that are either new or awaiting a response
    let getPriorityConversations = () => {
      return [...document.querySelectorAll(NEW_MESSAGES), ...document.querySelectorAll(YOUR_MOVE)]
        .filter(stillValid);
    };

    // Gets lower priority conversations when main conversations are exhausted
    let getLowPriorityConversations = () => {
      // Get all '.contact' elements, reverse them to start from the bottom
      return [...document.querySelectorAll(CONTACT_CLASS)].reverse().filter(stillValid);
    };

    // Update the modal with current conversation counts
    let updateModalCounts = () => {
      let priorityItems = getPriorityConversations();
      let lowPriorityItems = getLowPriorityConversations();

      document.getElementById('highPriorityCount').textContent = '🌟 High: ' + priorityItems.length;
      document.getElementById('lowPriorityCount').textContent = '📥 Low: ' + lowPriorityItems.length;
    };

    // Checks if the contact's message contains a phone number
    let containsPhoneNumber = (contact) => {
      let messageElement = contact.querySelector(CONTACT_MESSAGE_CLASS);
      if (messageElement) {
        return phoneNumberRegex.test(messageElement.textContent);
      }
      return false;
    };

    // Processes a single conversation or contact
    let processItem = (item) => {
      if (item && typeof item.click === 'function') {
        console.log("Processing item:", item);
        item.click();
        updateModalCounts();  // Update counts after processing an item
        return true;
      }
      return false;
    };

    // Function to rebuild click targets when new messages come in
    let rebuildClickTargets = () => {
      allNext = [];
      contactIndex = 0;
      processingContacts = false;
      updateModalCounts();
    };

    // Function to handle processing the next conversation or contact
    let processNextItem = () => {
      // Rebuild click targets when new messages come in
      rebuildClickTargets();

      // Always check for priority conversations first
      let priorityItems = getPriorityConversations();
      let lowPriorityItems = getLowPriorityConversations();

      // Update the modal with the current counts
      updateModalCounts();

      if (priorityItems.length > 0) {
        processingContacts = false;
        return processItem(priorityItems[0]);
      }

      // If no priority items, process lower priority contacts
      if (!processingContacts) {
        allNext = lowPriorityItems;
        contactIndex = 0;
        processingContacts = true;
      }

      if (contactIndex < allNext.length) {
        const contact = allNext[contactIndex];
        contactIndex++;

        // Skip contacts containing phone numbers
        if (contact && containsPhoneNumber(contact)) {
          console.log("Skipping contact with phone number:", contact);
          return processNextItem();  // Skip and move to the next
        }

        return processItem(contact);
      }

      // If no more contacts, reset
      processingContacts = false;
      console.log("No more items to process. Restarting the cycle.");
      return false;
    };

    // Main function to initiate processing
    let processItems = () => {
      if (!processNextItem()) {
        // Optionally, add a delay and then try to process again
        setTimeout(processItems, 1000);  // Wait 1 second before trying again
      }
    };

    // Button to manually advance to the next conversation or contact
    document.getElementById('nextConversationBtn').addEventListener('click', processNextItem);

    // Toggle the Enter key functionality based on the button
    document.getElementById('enterKeyToggle').addEventListener('click', () => {
      enterKeyEnabled = !enterKeyEnabled;
      document.getElementById('enterKeyToggle').textContent = enterKeyEnabled ? "Disable Enter Key" : "Enable Enter Key";
    });

    // Key press event listeners for manual control
    document.addEventListener("keypress", ({ key }) => {
      if (key === "Enter" && enterKeyEnabled) {
        console.log("Enter pressed - processing next item");
        processItems();
      } else if (key === "Escape") {
        console.log("Escape pressed - skipping current item");
        processNextItem();
      }
    });

    // Initial update of the modal counts
    updateModalCounts();
  })();
