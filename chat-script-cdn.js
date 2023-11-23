document.addEventListener('DOMContentLoaded', function () {
    var chatContainer = document.getElementById('my-chatbot-container');
    var toggleButton = document.getElementById('chatbot-toggle');
    var sendButton = document.getElementById('send-button');
    var chatInput = document.getElementById('chat-input');
    var chatMessages = document.getElementById('chat-messages');

    var awaitingDateRange = false;

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
            { id: 'recommend-place', text: 'Recommend a place to stay' }
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
            // Additional cases can be added here
        }
    }

    function fetchPropertyListings() {
        fetch(`https://chatbot-api-ywul.onrender.com/listings/`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayPropertyListings(data);
        })
        .catch(error => {
            console.error('Error:', error);
            addBotMessage(`Sorry, there was an error fetching property listings: ${error.message}`);
        });
    }

    function displayPropertyListings(data) {
        data.forEach(property => {
            addBotMessage(`Property: ${property.name}, Location: ${property.location}`);
        });
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
            if (awaitingDateRange) {
                handleDateRangeInput(messageText);
            } else {
                queryOpenAI(messageText);
            }
        }
        chatInput.value = '';
        chatInput.focus();
    }

    function queryOpenAI(message) {
        addBotMessage("Processing your request...");

        const openAIRequestData = { messages: [{ role: "user", content: message }] };

        fetch(`https://chatbot-api-ywul.onrender.com/query-openai/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(openAIRequestData)
        })
        .then(response => response.json())
        .then(data => addBotMessage(data.choices[0].message.content.trim()))
        .catch(error => {
            console.error('Error:', error);
            addBotMessage("Sorry, there was an error processing your request.");
        });
    }

    function handleDateRangeInput(messageText) {
        var dates = messageText.split(' to ');
        if (dates.length === 2 && isValidDate(dates[0]) && isValidDate(dates[1])) {
            checkRoomAvailabilityApi(dates[0], dates[1]);
        } else {
            addBotMessage("Please enter a valid date range (yyyy-mm-dd to yyyy-mm-dd):");
        }
    }

    function isValidDate(dateString) {
        var regex = /^\d{4}-\d{2}-\d{2}$/;
        return regex.test(dateString);
    }

    function checkRoomAvailabilityApi(startDate, endDate) {
        fetch(`https://chatbot-api-ywul.onrender.com/check-availability/?start_date=${startDate}&end_date=${endDate}`)
        .then(response => response.json())
        .then(data => addBotMessage(data.message))
        .catch(error => console.error('Error:', error));
    }

    function addBotMessage(message) {
        var botMessage = document.createElement('div');
        botMessage.textContent = message;
        botMessage.classList.add('chat-message', 'bot-message');
        chatMessages.appendChild(botMessage);
        scrollChatToBottom();
    }

    function addUserMessage(message) {
        var userMessage = document.createElement('div');
        userMessage.textContent = message;
        userMessage.classList.add('chat-message', 'user-message');
        chatMessages.appendChild(userMessage);
        scrollChatToBottom();
    }

    function scrollChatToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});