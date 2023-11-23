document.addEventListener('DOMContentLoaded', function () {
    var chatContainer = document.getElementById('my-chatbot-container');
    var toggleButton = document.getElementById('chatbot-toggle');
    var sendButton = document.getElementById('send-button');
    var chatInput = document.getElementById('chat-input');
    var chatMessages = document.getElementById('chat-messages');

    var awaitingDateRange = false;
    var selectedPropertyId = null;

    var propertyIds = [
        467580, 467581, 467582, 467583, 467584, 467585, 467586, 467587, 467588,
        467589, 467590, 467591, 467593, 467594, 467595, 467596, 467597, 467598,
        467599, 467600, 467601, 467603, 467604, 467605, 467606, 467607, 467608,
        467609, 467610, 467611, 467612, 467613, 467614, 467615, 467616, 467617,
        467618, 467619, 467620, 467621, 467623, 467624, 467625, 467626, 467627,
        467628, 467629, 467630, 467632, 467633
    ];

    toggleButton.addEventListener('click', function() {
        chatContainer.classList.toggle('closed');
        if (!chatContainer.classList.contains('closed')) {
            addInitialMessageAndOptions();
        }
    });

    function addInitialMessageAndOptions() {
        addBotMessage("This is Kunda House chatbot. How can I help you?");
        setTimeout(addChatOptions, 500);
    }

    function addChatOptions() {
        var options = [
            { id: 'check-availability', text: 'Check for available rooms' },
            { id: 'make-booking', text: 'Make a booking' },
            { id: 'recommend-place', text: 'Recommend a place to stay' },
            { id: 'create-enquiry', text: 'Create an enquiry' }
        ];

        options.forEach(function(option) {
            var button = document.createElement('button');
            button.textContent = option.text;
            button.classList.add('chat-option');
            button.id = option.id;
            button.addEventListener('click', function() {
                handleOptionClick(option.id);
            });
            chatMessages.appendChild(button);
        });
    }

    function handleOptionClick(optionId) {
        switch (optionId) {
            case 'check-availability':
                addBotMessage("Please select a start date and an end date (yyyy-mm-dd to yyyy-mm-dd):");
                chatInput.setAttribute('placeholder', 'yyyy-mm-dd to yyyy-mm-dd');
                awaitingDateRange = true;
                break;
            case 'recommend-place':
                fetchPropertyListings();
                break;
            case 'create-enquiry':
                createEnquiry();
                break;
        }
    }

    function fetchPropertyListings() {
        fetch(`https://chatbot-api-ywul.onrender.com/listings/`)
        .then(response => response.json())
        .then(data => {
            displayPropertyListings(data);
        })
        .catch(error => {
            console.error('Error:', error);
            addBotMessage("Sorry, there was an error fetching property listings.");
        });
    }

    function displayPropertyListings(data) {
        data.forEach((property, index) => {
            var propertyButton = document.createElement('button');
            propertyButton.textContent = `Property: ${property.name}, Location: ${property.location}`;
            propertyButton.classList.add('property-listing');
            propertyButton.addEventListener('click', function() {
                selectedPropertyId = propertyIds[index];
                addBotMessage(`Selected Property ID: ${selectedPropertyId}`);
            });
            chatMessages.appendChild(propertyButton);
        });
    }

    function createEnquiry() {
        if (selectedPropertyId) {
            addBotMessage(`Creating an enquiry for Property ID: ${selectedPropertyId}`);
            // Add logic or API call to handle enquiry creation
        } else {
            addBotMessage("Please select a property first.");
        }
    }

    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage() {
        var messageText = chatInput.value.trim();
        if (messageText) {
            addUserMessage(messageText);
            chatInput.value = '';
            chatInput.focus();
        }
    }

    function addUserMessage(message) {
        var userMessage = document.createElement('div');
        userMessage.textContent = message;
        userMessage.classList.add('chat-message', 'user-message');
        chatMessages.appendChild(userMessage);
        scrollChatToBottom();
    }

    function addBotMessage(message) {
        var botMessage = document.createElement('div');
        botMessage.textContent = message;
        botMessage.classList.add('chat-message', 'bot-message');
        chatMessages.appendChild(botMessage);
        scrollChatToBottom();
    }

    function scrollChatToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});