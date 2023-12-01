document.addEventListener('DOMContentLoaded', function () {
    var chatContainer = document.getElementById('my-chatbot-container');
    var toggleButton = document.getElementById('chatbot-toggle');
    var sendButton = document.getElementById('send-button');
    var chatInput = document.getElementById('chat-input');
    var chatMessages = document.getElementById('chat-messages');
    var awaitingDateRange = false;
    var selectedPropertyId = null;

     
     function initializeChat() {
        addInitialMessage();
        addChatOptions();
    }

    function createEnquiryForm() {
        var form = document.createElement('div');
        form.id = 'enquiry-form';
        form.classList.add('enquiry-form');
    
        var fields = [
            { id: 'arrival-date', type: 'text', placeholder: 'Arrival (yyyy-mm-dd)' },
            { id: 'departure-date', type: 'text', placeholder: 'Departure (yyyy-mm-dd)' },
            { id: 'number-of-people', type: 'number', placeholder: 'Number of people' },
            { id: 'guest-name', type: 'text', placeholder: 'Your name' },
            { id: 'guest-email', type: 'email', placeholder: 'Your email' },
            { id: 'guest-phone', type: 'text', placeholder: 'Your phone' },
            { id: 'enquiry-message', type: 'textarea', placeholder: 'Your message' }
        ];
    
        fields.forEach(function(field) {
            var input = document.createElement(field.type === 'textarea' ? 'textarea' : 'input');
            input.type = field.type !== 'textarea' ? field.type : undefined;
            input.id = field.id;
            input.placeholder = field.placeholder;
            input.classList.add('form-input');
            form.appendChild(input);
        });
    
        var submitButton = document.createElement('button');
        submitButton.id = 'submit-enquiry';
        submitButton.textContent = 'Submit Booking Enquiry';
        submitButton.classList.add('submit-button');
        form.appendChild(submitButton);
    
        chatMessages.appendChild(form);
        scrollChatToBottom();
    
        document.getElementById('submit-enquiry').addEventListener('click', submitEnquiry);
    }
    
    function submitEnquiry() {
        var arrivalDate = document.getElementById('arrival-date').value;
        var departureDate = document.getElementById('departure-date').value;
        var numberOfPeople = document.getElementById('number-of-people').value;
        var guestName = document.getElementById('guest-name').value;
        var guestEmail = document.getElementById('guest-email').value;
        var guestPhone = document.getElementById('guest-phone').value;
        var message = document.getElementById('enquiry-message').value;

        
        if (!arrivalDate || !departureDate || !numberOfPeople || !guestName || !guestEmail || !guestPhone || !message) {
            addBotMessage("Please fill out all fields.");
            return;
        }

        
        var enquiryData = {
            arrival: arrivalDate,
            departure: departureDate,
            people: numberOfPeople,
            property_id: selectedPropertyId,
            guest: {
                name: guestName,
                email: guestEmail,
                phone: guestPhone
            },
            messages: [
                {
                    subject: "Enquiry for Property ID: " + selectedPropertyId,
                    message: message
                }
            ]
        };

        
        sendEnquiryData(enquiryData);
    }

    
    function sendEnquiryData(enquiryData) {
        fetch('https://chatbot-api-ywul.onrender.com/create-enquiry', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(enquiryData)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Enquiry created:", data);
            addBotMessage("Your enquiry has been sent. Thank you!");
        })
        .catch(error => {
            console.error('Error:', error);
            addBotMessage("Sorry, there was an error creating your enquiry.");
        });
    }



    function enquireProperty(propertyId) {
        selectedPropertyId = propertyId;
        
        console.log('Enquire property:', propertyId);
    }

    toggleButton.addEventListener('click', function() {
        chatContainer.classList.toggle('closed');
    });

    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    function addInitialMessage() {
        var initialMessage = document.createElement('div');
        initialMessage.textContent = "This is Kunda House chatbot. How can I help you?";
        initialMessage.classList.add('chat-message', 'bot-message');
        chatMessages.insertBefore(initialMessage, chatMessages.firstChild);
    }

    
    function addChatOptions() {
        var options = [
            { id: 'check-availability', text: 'Check for available rooms' },
            { id: 'create-enquiry', text: 'Create a Booking / Enquiry' }
        ];

        options.forEach(function(option) {
            var button = document.createElement('button');
            button.textContent = option.text;
            button.className = 'chat-option';
            button.id = option.id;
            button.addEventListener('click', function() { handleOptionClick(option.id); });
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
            case 'make-booking':
                
                break;
            case 'recommend-place':
                fetchPropertyListings();
                break;
            case 'create-enquiry':
                createEnquiryForm();
                break;
            default:
                    console.log("Unknown option selected");
        }
    }

    function fetchPropertyListings() {
        fetch(`https://chatbot-api-ywul.onrender.com/listings/`, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json()) 
        .then(data => {
            if (Array.isArray(data)) { 
                displayPropertiesCarousel(data); 
            } else {
                console.error("Received data is not an array:", data);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            addBotMessage(`Sorry, there was an error fetching property listings: ${error.message}`);
        });
    }

    function displayPropertyListings(data) {
        data.forEach(property => {
            var propertyButton = document.createElement('button');
            propertyButton.textContent = `Property: ${property.name}, Location: ${property.location}`;
            propertyButton.classList.add('property-listing');
            propertyButton.onclick = function() {
                selectedPropertyId = property.id;
                addBotMessage(`You selected property: ${property.name}`);
            };
            chatMessages.appendChild(propertyButton);
        });
    }

    function createEnquiry() {
        var arrivalDate = prompt("Enter arrival date (yyyy-mm-dd):");
        var departureDate = prompt("Enter departure date (yyyy-mm-dd):");
        var numberOfPeople = prompt("Enter number of people:");
        var guestName = prompt("Enter your name:");
        var guestEmail = prompt("Enter your email:");
        var guestPhone = prompt("Enter your phone:");
        var subject = "Enquiry for Property ID: " + selectedPropertyId;
        var message = prompt("Enter your message:", "We'd love to talk to you about your booking details please let us know here.");
    
        var enquiryData = {
            arrival: arrivalDate,
            departure: departureDate,
            people: numberOfPeople,
            property_id: selectedPropertyId,
            guest: {
                name: guestName,
                email: guestEmail,
                phone: guestPhone
            },
            messages: [
                {
                    subject: subject,
                    message: message
                }
            ]
        };

        
        fetch('https://chatbot-api-ywul.onrender.com/create-enquiry', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(enquiryData)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Enquiry created:", data);
            addBotMessage("Your enquiry has been sent. Thank you!");
        })
        .catch(error => {
            console.error('Error:', error);
            addBotMessage("Sorry, there was an error creating your enquiry.");
        });
    }

    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    initializeChat();

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

        const openAIRequestData = {
            messages: [
                { role: "user", content: message }
            ]
        };

        fetch(`https://chatbot-api-ywul.onrender.com/query-openai/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(openAIRequestData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            addBotMessage(data.choices[0].message.content.trim());
        })
        .catch(error => {
            console.error('Error:', error);
            addBotMessage("Sorry, there was an error processing your request.");
        });
    }

    function handleDateRangeInput(messageText) {
        var dates = messageText.split(' to ');
        if (dates.length === 2 && isValidDate(dates[0]) && isValidDate(dates[1])) {
            checkRoomAvailabilityApi(dates[0], dates[1]);
            awaitingDateRange = false;
        } else {
            addBotMessage("Please enter a valid date range (yyyy-mm-dd to yyyy-mm-dd):");
        }
    }

    function isValidDate(dateString) {
        var regex = /^\d{4}-\d{2}-\d{2}$/;
        return regex.test(dateString);
    }

    function checkRoomAvailabilityApi(startDate, endDate) {
        fetch(`https://chatbot-api-ywul.onrender.com/check-availability/?start_date=${startDate}&end_date=${endDate}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            addBotMessage(data.message);
            chatInput.setAttribute('placeholder', 'Type your message here...');
        })
        .catch(error => {
            console.error('Error:', error);
            addBotMessage("Sorry, there was an error checking availability.");
        });
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