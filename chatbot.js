const API_KEY = "AIzaSyB0mkhs7Tjo75f3VC6jFDVWqlVsLmbJlwI"; // Replace with your API key
let isProcessing = false;

document.addEventListener("DOMContentLoaded", () => {
const chatContainer = document.getElementById("chat-container");
const chatToggle = document.getElementById("chat-toggle");
const closeChat = document.getElementById("close-chat");
const sizeToggle = document.getElementById("size-toggle");
const sendMessageButton = document.getElementById("send-message");
const userInput = document.getElementById("user-input");
const quickActionButtons = document.querySelectorAll(".quick-action-btn");

        // Size toggle functionality
        let isExpanded = false;
sizeToggle.addEventListener("click", () => {
    isExpanded = !isExpanded;
    chatContainer.classList.toggle("expanded");
    sizeToggle.innerHTML = isExpanded ? 
        '<i class="fas fa-compress"></i>' : 
        '<i class="fas fa-expand"></i>';
    
    // Scroll messages to bottom after resize
    const messagesContainer = document.getElementById("chat-messages");
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 300); // Match transition duration
});

    // Initialize with a welcome message
    appendMessage(
`Welcome! I'm an AI assistant created by Amrit Joshi. I can help you with:
• Latest technology news and updates
• AI developments and trends
• Gadget reviews and recommendations
• Programming and development
• Tech industry insights

Feel free to ask anything or use the quick action buttons above!`,
"bot-message"
);

    // Quick action buttons
    quickActionButtons.forEach(button => {
        button.addEventListener("click", () => {
            const question = button.dataset.question;
            userInput.value = question;
            sendMessage();
        });
    });

    // Chat toggle
    chatToggle.addEventListener("click", () => {
        chatContainer.classList.add("active");
        chatContainer.style.display = "flex";
        chatToggle.style.display = "none";
        userInput.focus();
    });

    closeChat.addEventListener("click", () => {
        chatContainer.classList.remove("active");
        chatContainer.style.display = "none";
        chatToggle.style.display = "block";
    });

    // Message handlers
    sendMessageButton.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    // Input validation
    userInput.addEventListener("input", () => {
        sendMessageButton.disabled = userInput.value.trim() === "";
    });
});

function formatBotResponse(text) {
    // Convert markdown-style bullets to HTML list
    text = text.replace(/(?:^|\n)([•\-\*] .+)/gm, function(match) {
        const items = text.match(/(?:^|\n)[•\-\*] .+/gm);
        if (items) {
            return '\n<ul>' + items.map(item => 
                `<li>${item.replace(/^[•\-\*] /, '')}</li>`
            ).join('') + '</ul>';
        }
        return match;
    });

    // Convert numbered lists
    text = text.replace(/(?:^|\n)\d+\. .+/gm, function(match) {
        const items = text.match(/(?:^|\n)\d+\. .+/gm);
        if (items) {
            return '\n<ol>' + items.map(item => 
                `<li>${item.replace(/^\d+\. /, '')}</li>`
            ).join('') + '</ol>';
        }
        return match;
    });

    // Convert code blocks
    text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

    // Convert inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Convert paragraphs
    text = text.split('\n\n').map(para => `<p>${para}</p>`).join('');

    return text;
}

function appendMessage(text, className) {
    const messageContainer = document.getElementById("chat-messages");
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", className);
    
    // Format bot messages
    if (className === "bot-message") {
        messageElement.innerHTML = formatBotResponse(text);
    } else {
        messageElement.textContent = text;
    }
    
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function showTypingIndicator() {
    const messageContainer = document.getElementById("chat-messages");
    const typingIndicator = document.createElement("div");
    typingIndicator.classList.add("typing-indicator");
    typingIndicator.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    messageContainer.appendChild(typingIndicator);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

async function sendMessage() {
    if (isProcessing) return;

    const userInput = document.getElementById("user-input");
    const message = userInput.value.trim();
    if (!message) return;

    appendMessage(message, "user-message");
    userInput.value = "";
    userInput.focus();

    showTypingIndicator();
    fetchResponseFromGPT(message);
}



function getCustomResponse(message) {
// Convert message to lowercase for easier matching
const lowerMessage = message.toLowerCase();

// Identity-related responses
const identityResponses = {
'who created you': 'I was created by Amrit Joshi, a developer specializing in artificial intelligence and natural language processing. I am designed to assist users with various tasks while maintaining high standards of accuracy and professionalism.',

'who made you': 'I am an AI assistant developed by Amrit Joshi. I was created to provide helpful and accurate assistance across a wide range of topics and tasks.',

'who are you': 'I am an advanced AI assistant developed by Amrit Joshi. I specialize in providing accurate, professional assistance for various tasks including technology discussions, coding help, and general information.',

'what are you': 'I am an AI assistant created by Amrit Joshi. I am designed to provide professional and accurate assistance while maintaining clear communication and helpful responses.',

'tell me about yourself': 'I am an AI assistant developed by Amrit Joshi. I specialize in providing accurate and professional assistance across various domains, including technology, programming, and general information. I aim to maintain clear communication while delivering helpful and reliable responses.',

'who is your creator': 'My creator is Amrit Joshi, a developer with expertise in artificial intelligence and natural language processing. I was developed to provide professional and accurate assistance while maintaining helpful and clear communication.'
};

// Check if the message matches any identity questions
for (const [question, response] of Object.entries(identityResponses)) {
if (lowerMessage.includes(question)) {
    return response;
}
}

// Return null if no identity-related response is needed
return null;
}

async function fetchResponseFromGPT(message) {
isProcessing = true;
const sendMessageButton = document.getElementById("send-message");
sendMessageButton.disabled = true;

try {
// Check for identity-related questions first
const customResponse = getCustomResponse(message);
if (customResponse) {
    const typingIndicator = document.querySelector(".typing-indicator");
    if (typingIndicator) {
        typingIndicator.remove();
    }
    appendMessage(customResponse, "bot-message");
    return;
}

// Proceed with regular API call for non-identity questions
const response = await fetch('/chatbot', {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: message }),
});

if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
}

const data = await response.json();
const text = data.response;

const typingIndicator = document.querySelector(".typing-indicator");
if (typingIndicator) {
    typingIndicator.remove();
}

appendMessage(text, "bot-message");

} catch (error) {
console.error("Error:", error);
const typingIndicator = document.querySelector(".typing-indicator");
if (typingIndicator) {
    typingIndicator.remove();
}

appendMessage(
    `I apologize, but I encountered an error while processing your request. Please try rephrasing your question or use one of the quick action buttons above. If the issue persists, please refresh the page to start a new chat session.`,
    "bot-message"
);
} finally {
isProcessing = false;
sendMessageButton.disabled = false;
}
}


// Add pulse animation to chat button
function addPulseAnimation() {
    const chatButton = document.getElementById("chat-toggle");
    chatButton.style.animation = "pulse 2s infinite";
}

// Add custom styles for pulse animation
const style = document.createElement("style");
style.textContent = `
    @keyframes pulse {
        0% {
            box-shadow: 0 0 0 0 rgba(0, 247, 255, 0.4);
        }
        70% {
            box-shadow: 0 0 0 10px rgba(0, 247, 255, 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(0, 247, 255, 0);
        }
    }

    .message a {
        color: var(--primary-color);
        text-decoration: none;
        border-bottom: 1px solid var(--primary-color);
    }

    .message a:hover {
        border-bottom: 2px solid var(--primary-color);
    }

    .chat-container.active {
        display: flex;
        animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
        from {
            transform: translateY(100px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Start pulse animation when page loads
addPulseAnimation();