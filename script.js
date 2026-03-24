// Language strings
const messages = {
    en: {
        clickMic: "Click mic to start speaking...",
        listening: "Listening...",
        processing: "Processing...",
        speaking: "Speaking...",
        micError: "Microphone error: ",
        greeting: "Hi! How can I help you with coding or homework today?"
    },
    hi: {
        clickMic: "बात करने के लिए माइक पर क्लिक करें...",
        listening: "सुन रहे हैं...",
        processing: "प्रोसेस कर रहे हैं...",
        speaking: "बोल रहे हैं...",
        micError: "माइक्रोफोन error: ",
        greeting: "नमस्ते! आज कोडिंग या होमवर्क में कैसे मदद कर सकता हूं?"
    }
};

let currentLang = 'en';
// Removed API key dependency
let isListening = false;
let isSpeaking = false;
let isInitialized = false;
let isContinuousMode = false; // Track if we're in continuous listening mode
let lastTranscript = ''; // Avoid duplicate responses

// DOM Elements
const micBtn = document.getElementById('micBtn');
const stopBtn = document.getElementById('stopBtn');
const statusText = document.getElementById('status');
const listeningText = document.getElementById('listening-text');
const langSelect = document.getElementById('languageSelect');
const title = document.getElementById('title');
const userDisplay = document.getElementById('userDisplay');
const logoutBtn = document.getElementById('logoutBtn');

// Voice Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

// Check authentication on page load
window.addEventListener('load', () => {
    const currentUser = JSON.parse(localStorage.getItem('voiceAI_currentUser') || 'null');

    if (!currentUser) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
        return;
    }

    // Update user display
    userDisplay.textContent = `Welcome, ${currentUser.name}!`;

    // Continue with normal initialization
    showLoadingAnimation();
    setTimeout(() => {
        hideLoadingAnimation();
        initializeAI();
    }, 2000);
});

function showLoadingAnimation() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-overlay';
    loadingDiv.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <h2>Initializing AI Assistant...</h2>
            <p>Please wait...</p>
        </div>
    `;
    document.body.appendChild(loadingDiv);
}

function hideLoadingAnimation() {
    const loadingDiv = document.getElementById('loading-overlay');
    if (loadingDiv) {
        loadingDiv.style.opacity = '0';
        setTimeout(() => {
            loadingDiv.remove();
            // Show main interface
            document.getElementById('main-container').style.display = 'flex';
        }, 500);
    }
}

async function initializeAI() {
    if (!recognition) {
        statusText.textContent = '❌ Voice input not supported in your browser';
        statusText.style.color = '#f56565';
        micBtn.disabled = true;
        return;
    }

    // No API key needed anymore - works locally
    try {
        await speakResponse(messages[currentLang].greeting);
        isInitialized = true;
        startContinuousListening();
    } catch (error) {
        statusText.textContent = '❌ Voice initialization error';
        statusText.style.color = '#f56565';
        console.error(error);
    }
}

function startContinuousListening() {
    if (!isInitialized || isSpeaking) return;

    // Prevent starting when already listening
    if (isListening) return;

    isListening = true;
    isContinuousMode = true;
    recognition.language = currentLang === 'hi' ? 'hi-IN' : 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    // Improve recognition settings for better accuracy
    if (recognition.grammars) {
        const grammar = '#JSGF V1.0; grammar words; public <word> = hello | hi | yes | no | calculate | math | plus | minus | times | divide | gst | percentage | area;';
        recognition.grammars.addFromString(grammar, 1);
    }

    recognition.start();

    // Auto-restart via onend
    recognition.onend = () => {
        if (isContinuousMode && !isSpeaking) {
            setTimeout(() => {
                if (isContinuousMode) {
                    startContinuousListening();
                }
            }, 300);
        }
    };

    micBtn.classList.add('listening');
    statusText.textContent = messages[currentLang].listening;
    statusText.style.color = '#48bb78';
    listeningText.textContent = '';
}

if (true) { // Always ready since no API needed
    statusText.textContent = '✅ Ready to speak!';
}

// Language change
langSelect.addEventListener('change', (e) => {
    currentLang = e.target.value;
    updateUI();

    if (recognition) {
        recognition.language = currentLang === 'hi' ? 'hi-IN' : 'en-US';
    }

    // Restart recognition to apply language change cleanly
    if (isContinuousMode && recognition) {
        recognition.stop();
        isListening = false;
        setTimeout(() => {
            if (!isSpeaking) startContinuousListening();
        }, 200);
    }
});

// Logout functionality
logoutBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('voiceAI_currentUser');
        localStorage.removeItem('voiceAI_rememberMe');
        window.location.href = 'login.html';
    }
});

// Microphone button - toggle continuous listening
micBtn.addEventListener('click', () => {
    if (isContinuousMode) {
        // Stop continuous listening
        isContinuousMode = false;
        isListening = false;
        recognition?.stop();
        micBtn.classList.remove('listening');
        statusText.textContent = messages[currentLang].clickMic;
        statusText.style.color = '';
    } else {
        // Start continuous listening
        startContinuousListening();
    }
});

stopBtn.addEventListener('click', stopListening);

function updateUI() {
    currentLang === 'hi' 
        ? (title.textContent = '🎤 लोकल वॉइस AI असिस्टेंट')
        : (title.textContent = '🎤 Local Voice AI Assistant');
    if (!isInitialized) {
        statusText.textContent = messages[currentLang].clickMic;
        statusText.style.color = '';
    }
}

function stopListening() {
    if (!recognition) return;
    recognition.stop();
    micBtn.classList.remove('listening');
    stopBtn.classList.add('hidden');
    isListening = false;
    statusText.textContent = messages[currentLang].clickMic;
    statusText.style.color = '';
}

recognition?.addEventListener('result', (e) => {
    let transcript = '';
    let isFinal = false;
    let confidence = 0;

    if (isSpeaking) {
        return; // Avoid processing assistant's own speech as input
    }

    for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
        confidence = Math.max(confidence, e.results[i][0].confidence || 0);
        if (e.results[i].isFinal) {
            isFinal = true;
        }
    }

    listeningText.textContent = transcript.trim();

    // Process final results with better filtering
    if (isFinal && transcript.trim()) {
        const cleanTranscript = transcript.trim().toLowerCase();

        // Avoid duplicate processing of same phrase
        if (cleanTranscript === lastTranscript) {
            return;
        }

        // Skip very short responses that might be noise or single words like "ho"

        // Skip very short responses that might be noise or single words like "ho"
        if (cleanTranscript.length < 2) {
            return; // Don't process single characters
        }

        // Skip common noise words
        const noiseWords = ['um', 'uh', 'er', 'ah', 'hmm', 'ho', 'ha', 'oh'];
        if (noiseWords.includes(cleanTranscript)) {
            return; // Don't process noise
        }

        // Check confidence level (if available)
        if (confidence > 0 && confidence < 0.3) {
            listeningText.textContent = 'Low confidence, please speak clearly...';
            return; // Low confidence, ask for repetition
        }

        lastTranscript = cleanTranscript;
        processUserInput(transcript.trim());
    }
});

async function processUserInput(userMessage) {
    // Don't stop listening in continuous mode
    if (!isContinuousMode) {
        isListening = false;
        recognition.stop();
    }

    statusText.textContent = messages[currentLang].processing;
    statusText.style.color = '#f59e0b';

    try {
        const response = await getAIResponse(userMessage);
        await speakResponse(response);

        // Resume listening after response only if not in continuous mode
        if (!isContinuousMode) {
            setTimeout(() => {
                if (isInitialized) {
                    startContinuousListening();
                }
            }, 1000);
        }

    } catch (error) {
        statusText.textContent = '❌ Error processing request';
        statusText.style.color = '#f56565';
        console.error(error);

        // Resume listening after error only if not in continuous mode
        if (!isContinuousMode) {
            setTimeout(() => {
                if (isInitialized) {
                    startContinuousListening();
                }
            }, 2000);
        }
    }
}

recognition?.addEventListener('end', () => {
    isListening = false;
    // Don't remove listening class if in continuous mode
    if (!isContinuousMode) {
        micBtn.classList.remove('listening');
    }
    if (isInitialized && !isSpeaking && isContinuousMode) {
        // Auto-restart listening if not speaking and in continuous mode
        setTimeout(() => startContinuousListening(), 500);
    }
});

recognition?.addEventListener('error', (e) => {
    statusText.textContent = '❌ ' + messages[currentLang].micError + e.error;
    statusText.style.color = '#f56565';
    isListening = false;
    micBtn.classList.remove('listening');
    stopBtn.classList.add('hidden');

    // Try to restart listening after error
    setTimeout(() => {
        if (isInitialized && !isSpeaking) {
            startContinuousListening();
        }
    }, 2000);
});

// Math calculation functions
function calculateMath(expression) {
    try {
        // Basic security: only allow numbers and basic operators
        const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
        const result = eval(sanitized);
        return isNaN(result) ? null : result;
    } catch (error) {
        return null;
    }
}

function calculateGST(amount, rate = 18) {
    const gstAmount = (amount * rate) / 100;
    const total = amount + gstAmount;
    return { gstAmount, total, rate };
}

function calculatePercentage(value, percentage) {
    return (value * percentage) / 100;
}

function calculateArea(shape, dimensions) {
    switch(shape.toLowerCase()) {
        case 'circle':
            return Math.PI * Math.pow(dimensions.radius || dimensions.r, 2);
        case 'rectangle':
            return dimensions.length * dimensions.width;
        case 'square':
            return Math.pow(dimensions.side, 2);
        case 'triangle':
            return (dimensions.base * dimensions.height) / 2;
        default:
            return null;
    }
}

function processMathQuery(message, match) {
    try {
        // Handle word-based operations (plus, minus, times, etc.)
        if (match[2] && ['plus', 'add', 'जोड़', 'प्लस'].includes(match[2].toLowerCase())) {
            const num1 = parseFloat(match[1]);
            const num2 = parseFloat(match[3]);
            const result = num1 + num2;
            return `Addition: ${num1} + ${num2} = ${result}`;
        }

        if (match[2] && ['minus', 'subtract', 'घटाना', 'माइनस'].includes(match[2].toLowerCase())) {
            const num1 = parseFloat(match[1]);
            const num2 = parseFloat(match[3]);
            const result = num1 - num2;
            return `Subtraction: ${num1} - ${num2} = ${result}`;
        }

        if (match[2] && ['times', 'multiply', 'गुणा'].includes(match[2].toLowerCase())) {
            const num1 = parseFloat(match[1]);
            const num2 = parseFloat(match[3]);
            const result = num1 * num2;
            return `Multiplication: ${num1} × ${num2} = ${result}`;
        }

        if (match[2] && ['divided by', 'divide', 'भाग'].includes(match[2].toLowerCase())) {
            const num1 = parseFloat(match[1]);
            const num2 = parseFloat(match[3]);
            if (num2 === 0) return "Cannot divide by zero!";
            const result = num1 / num2;
            return `Division: ${num1} ÷ ${num2} = ${result.toFixed(2)}`;
        }

        // Basic arithmetic: 25 + 30, 15 * 8, etc.
        if (match[2] && match[1] && match[3]) {
            const num1 = parseFloat(match[1]);
            const operator = match[2];
            const num2 = parseFloat(match[3]);

            let result;
            let explanation;

            switch(operator) {
                case '+':
                    result = num1 + num2;
                    explanation = `${num1} + ${num2} = ${result}`;
                    break;
                case '-':
                    result = num1 - num2;
                    explanation = `${num1} - ${num2} = ${result}`;
                    break;
                case '*':
                case '×':
                    result = num1 * num2;
                    explanation = `${num1} × ${num2} = ${result}`;
                    break;
                case '/':
                case '÷':
                    if (num2 === 0) return "Cannot divide by zero!";
                    result = num1 / num2;
                    explanation = `${num1} ÷ ${num2} = ${result.toFixed(2)}`;
                    break;
                default:
                    return "I can do addition (+), subtraction (-), multiplication (×), and division (÷).";
            }

            return `Calculation: ${explanation}`;
        }

        // GST calculations
        if (message.includes('gst')) {
            const amount = parseFloat(match[1]);
            const gst = calculateGST(amount);
            return `GST Calculation (18% rate):
Amount: ₹${amount}
GST: ₹${gst.gstAmount.toFixed(2)}
Total: ₹${gst.total.toFixed(2)}`;
        }

        // Percentage calculations
        if (message.includes('percent') || message.includes('%') || message.includes('प्रतिशत')) {
            const percentage = parseFloat(match[1]);
            const value = parseFloat(match[2]);
            if (!isNaN(percentage) && !isNaN(value)) {
                const result = calculatePercentage(value, percentage);
                if (currentLang === 'hi') {
                    return `${value} का ${percentage}% = ${result}`;
                }
                return `${percentage}% of ${value} = ${result}`;
            }

            const hindiMatch1 = message.match(/(\d+(?:\.\d+)?)\s*प्रतिशत\s*(\d+(?:\.\d+)?)/);
            if (hindiMatch1) {
                const p = parseFloat(hindiMatch1[1]);
                const v = parseFloat(hindiMatch1[2]);
                if (!isNaN(p) && !isNaN(v)) {
                    const r = calculatePercentage(v, p);
                    return currentLang === 'hi' ? `${v} का ${p}% = ${r}` : `${p}% of ${v} = ${r}`;
                }
            }

            const hindiMatch2 = message.match(/(\d+(?:\.\d+)?)\s*(?:क|का|के)\s*(\d+(?:\.\d+)?)\s*प्रतिशत/i);
            if (hindiMatch2) {
                const v = parseFloat(hindiMatch2[1]);
                const p = parseFloat(hindiMatch2[2]);
                if (!isNaN(p) && !isNaN(v)) {
                    const r = calculatePercentage(v, p);
                    return currentLang === 'hi' ? `${v} का ${p}% = ${r}` : `${p}% of ${v} = ${r}`;
                }
            }
        }

        // Area calculations
        if (message.includes('area')) {
            const shape = match[1];
            // For now, return general explanation - could be enhanced with specific dimensions
            return `To calculate the area of a ${shape}, I need the dimensions. For example:
• Circle: Area = π × radius²
• Rectangle: Area = length × width
• Square: Area = side × side
• Triangle: Area = (base × height) ÷ 2

Please provide the measurements!`;
        }

        // Power calculations
        if (message.includes('power') || message.includes('^')) {
            const base = parseFloat(match[1]);
            const exponent = parseFloat(match[2]);
            const result = Math.pow(base, exponent);
            return `${base} raised to the power of ${exponent} = ${result}`;
        }

        // Square root
        if (message.includes('square root') || message.includes('√')) {
            const number = parseFloat(match[1]);
            if (number < 0) return "Cannot calculate square root of negative numbers!";
            const result = Math.sqrt(number);
            return `√${number} = ${result.toFixed(4)}`;
        }

    } catch (error) {
        return "I couldn't understand that math problem. Please try rephrasing it.";
    }

    return "I can help with math calculations! Try asking things like '25 + 30', 'GST on 1000', or '15% of 200'.";
}

function getFlexibleMathResponse(message) {
    // Hindi and English percentage forms
    let m;

    m = message.match(/(\d+(?:\.\d+)?)\s*(?:percent|percentage|प्रतिशत|%)\s*(?:of|का|के)?\s*(\d+(?:\.\d+)?)/i);
    if (m) {
        const p = parseFloat(m[1]);
        const v = parseFloat(m[2]);
        if (!isNaN(p) && !isNaN(v)) {
            const r = calculatePercentage(v, p);
            return currentLang === 'hi' ? `${v} का ${p}% = ${r}` : `${p}% of ${v} = ${r}`;
        }
    }

    m = message.match(/(\d+(?:\.\d+)?)\s*प्रतिशत\s*(\d+(?:\.\d+)?)/);
    if (m) {
        const p = parseFloat(m[1]);
        const v = parseFloat(m[2]);
        if (!isNaN(p) && !isNaN(v)) {
            const r = calculatePercentage(v, p);
            return currentLang === 'hi' ? `${v} का ${p}% = ${r}` : `${p}% of ${v} = ${r}`;
        }
    }

    // Direct multiplication/division/addition/subtraction when no explicit operator match found
    const terms = message.match(/(-?\d+(?:\.\d+)?)/g);
    if (terms && terms.length >= 2) {
        const n1 = parseFloat(terms[0]);
        const n2 = parseFloat(terms[1]);

        if (/\b(plus|add|जोड़|प्लस)\b/i.test(message)) {
            return currentLang === 'hi' ? `${n1} + ${n2} = ${n1 + n2}` : `${n1} + ${n2} = ${n1 + n2}`;
        }
        if (/\b(minus|subtract|घटाना|माइनस)\b/i.test(message)) {
            return currentLang === 'hi' ? `${n1} - ${n2} = ${n1 - n2}` : `${n1} - ${n2} = ${n1 - n2}`;
        }
        if (/\b(times|multiply|गुणा|x|×|into|मल्टीप्लाई)\b/i.test(message)) {
            return currentLang === 'hi' ? `${n1} × ${n2} = ${n1 * n2}` : `${n1} × ${n2} = ${n1 * n2}`;
        }
        if (/\b(divided by|divide|भाग|÷)\b/i.test(message)) {
            if (n2 === 0) return currentLang === 'hi' ? 'शून्य से भाग नहीं कर सकते!' : 'Cannot divide by zero!';
            return currentLang === 'hi' ? `${n1} ÷ ${n2} = ${ (n1 / n2).toFixed(2) }` : `${n1} ÷ ${n2} = ${(n1 / n2).toFixed(2)}`;
        }
    }

    return null;
}

async function getAIResponse(userMessage) {
    // Convert to lowercase for easier matching
    const message = userMessage.toLowerCase();

    // Check for math calculations first
    const mathPatterns = [
        // Basic arithmetic with various formats
        /(\d+(?:\.\d+)?)\s*([+\-×*÷/])\s*(\d+(?:\.\d+)?)/,
        /(\d+(?:\.\d+)?)\s*(plus|minus|add|subtract|times|multiply|divided by|divide)\s*(\d+(?:\.\d+)?)/i,
        /(?:calculate|compute|what is)\s+(\d+(?:\.\d+)?)\s*([+\-×*÷/])\s*(\d+(?:\.\d+)?)/i,
        // GST calculations
        /gst\s+on\s+(\d+(?:\.\d+)?)/i,
        /gst\s+(\d+(?:\.\d+)?)/i,
        /(?:calculate|find)\s+gst\s+on\s+(\d+(?:\.\d+)?)/i,
        // Percentage calculations
        /(\d+(?:\.\d+)?)\s*percent(?:age)?\s*of\s*(\d+(?:\.\d+)?)/i,
        /(\d+(?:\.\d+)?)%\s*of\s*(\d+(?:\.\d+)?)/i,
        /(\d+(?:\.\d+)?)\s*(?:percent|percentage|प्रतिशत)\s*(?:of|का|के)?\s*(\d+(?:\.\d+)?)/i,
        /(\d+(?:\.\d+)?)\s*प्रतिशत\s*(\d+(?:\.\d+)?)/i,
        // Area calculations
        /area\s+of\s+(circle|rectangle|square|triangle)/i,
        // Power calculations
        /(\d+(?:\.\d+)?)\s*(?:power|to the power|raised to)\s*(\d+(?:\.\d+)?)/i,
        /(\d+(?:\.\d+)?)\^(\d+(?:\.\d+)?)/,
        // Square root
        /square root of (\d+(?:\.\d+)?)/i,
        /√(\d+(?:\.\d+)?)/,
        // Hindi math patterns
        /(\d+(?:\.\d+)?)\s*(?:जोड़|प्लस|माइनस|घटाना|गुणा|भाग)\s*(\d+(?:\.\d+)?)/i
    ];

    // Flexible quick math fallback (Hindi + English)
    const flexibleMath = getFlexibleMathResponse(message);
    if (flexibleMath) {
        return flexibleMath;
    }

    // Check for math calculations
    for (const pattern of mathPatterns) {
        const match = message.match(pattern);
        if (match) {
            return processMathQuery(message, match);
        }
    }

    // Local knowledge base for common queries
    const responses = {
        en: {
            // Programming basics
            'hello': 'Hello! How can I help you with programming or homework today?',
            'hi': 'Hi there! Ready to help with coding questions!',
            'what is programming': 'Programming is writing instructions for computers to solve problems. It involves languages like Python, JavaScript, Java, and C++.',
            'how to learn coding': 'Start with Python or JavaScript. Practice daily, build projects, and join coding communities. Resources: freeCodeCamp, Codecademy, or YouTube tutorials.',
            'what is python': 'Python is a popular programming language known for its simplicity. It\'s great for beginners and used in web development, data science, and automation.',
            'what is javascript': 'JavaScript is a programming language used for web development. It makes websites interactive and runs in browsers.',
            'what is html': 'HTML (HyperText Markup Language) is the standard language for creating web pages. It defines the structure and content of web documents.',
            'what is css': 'CSS (Cascading Style Sheets) is used to style HTML elements. It controls colors, fonts, layouts, and animations on web pages.',
            'how to print hello world': 'In Python: print("Hello World")\nIn JavaScript: console.log("Hello World")\nIn Java: System.out.println("Hello World")',
            'what is a variable': 'A variable is a container that stores data values. You can think of it as a labeled box where you put information.',
            'what is a function': 'A function is a block of code that performs a specific task. It can take inputs (parameters) and return outputs.',
            'what is a loop': 'A loop repeats a block of code multiple times. Common types are for loops and while loops.',
            'what is an array': 'An array is a data structure that stores multiple values in a single variable. Like a list of items.',
            'what is debugging': 'Debugging is finding and fixing errors in your code. Use print statements, debuggers, and check for syntax errors.',
            'help': 'I can help with programming basics, homework questions, coding concepts, and general computer science topics. What would you like to know?',
            'thanks': 'You\'re welcome! Happy coding!',
            'bye': 'Goodbye! Keep practicing your coding skills!',
            'thank you': 'You\'re welcome! Feel free to ask more questions.',

            // Web Development Code Examples
            'create a website': `Here's a complete basic website code:

HTML (index.html):
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>Welcome to My Website</h1>
        <nav>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section id="home">
            <h2>Home Section</h2>
            <p>This is a basic website created with HTML and CSS.</p>
        </section>

        <section id="about">
            <h2>About Section</h2>
            <p>Learn more about what this website is about.</p>
        </section>

        <section id="contact">
            <h2>Contact Section</h2>
            <p>Get in touch with us!</p>
        </section>
    </main>

    <footer>
        <p>&copy; 2024 My Website. All rights reserved.</p>
    </footer>

    <script src="script.js"></script>
</body>
</html>
\`\`\`

CSS (style.css):
\`\`\`css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    color: #333;
}

header {
    background: #333;
    color: white;
    padding: 1rem;
    text-align: center;
}

nav ul {
    list-style: none;
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-top: 1rem;
}

nav a {
    color: white;
    text-decoration: none;
}

main {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1rem;
}

section {
    margin-bottom: 2rem;
    padding: 2rem;
    border: 1px solid #ddd;
    border-radius: 5px;
}

footer {
    background: #333;
    color: white;
    text-align: center;
    padding: 1rem;
    margin-top: 2rem;
}
\`\`\`

JavaScript (script.js):
\`\`\`javascript
// Add some interactivity
document.addEventListener('DOMContentLoaded', function() {
    console.log('Website loaded successfully!');

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            targetSection.scrollIntoView({ behavior: 'smooth' });
        });
    });
});
\`\`\`

Save these files in the same folder and open index.html in your browser!`,

            'html template': `Here's a basic HTML template:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Hello World!</h1>
    <p>This is a paragraph.</p>

    <script src="script.js"></script>
</body>
</html>
\`\`\``,

            'css template': `Here's a basic CSS template:

\`\`\`css
/* Reset and base styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f4f4f4;
}

/* Typography */
h1, h2, h3 {
    margin-bottom: 1rem;
}

p {
    margin-bottom: 1rem;
}

/* Layout */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Components */
.btn {
    display: inline-block;
    padding: 10px 20px;
    background: #333;
    color: white;
    text-decoration: none;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.btn:hover {
    background: #555;
}
\`\`\``,

            'javascript template': `Here's a basic JavaScript template:

\`\`\`javascript
// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('JavaScript loaded!');

    // Example: Change text on button click
    const button = document.querySelector('.btn');
    if (button) {
        button.addEventListener('click', function() {
            alert('Button clicked!');
        });
    }

    // Example: Dynamic content
    function updateTime() {
        const now = new Date();
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString();
        }
    }

    // Update time every second
    setInterval(updateTime, 1000);
    updateTime(); // Initial call
});
\`\`\``,

            // Mathematics Section
            'calculate': 'I can help you with math calculations! Try asking: "calculate 25 + 30", "what is 15 times 8", "GST on 1000 rupees", or "area of circle with radius 5"',
            'math': 'I can solve math problems! Ask me about addition, subtraction, multiplication, division, percentages, GST calculations, and geometry.',
            'what is': 'I can explain mathematical concepts and solve equations. Try asking about algebra, geometry, percentages, or specific calculations.',
            'solve': 'I can solve mathematical equations and explain the steps. What equation would you like me to solve?',
            'plus': 'Addition is combining numbers. For example, 5 + 3 = 8. What calculation would you like me to do?',
            'minus': 'Subtraction is taking away. For example, 10 - 4 = 6. What would you like to subtract?',
            'times': 'Multiplication is repeated addition. For example, 4 × 3 = 12. What would you like to multiply?',
            'multiply': 'Multiplication combines groups of equal size. For example, 6 × 7 = 42. What numbers should I multiply?',
            'divide': 'Division splits numbers into equal parts. For example, 20 ÷ 4 = 5. What would you like to divide?',
            'percentage': 'Percentage means "per hundred". For example, 25% of 200 = 50. What percentage calculation do you need? (eg. "What is 15% of 200")',
            'how to calculate percentage': 'To calculate percentage: (value * percent) / 100. For example, 15% of 200 is 30.',
            'gst': 'GST (Goods and Services Tax) is added to the price. Standard rate is 18%. For example, GST on ₹1000 = ₹180, total = ₹1180.',
            'area': 'Area measures the space inside a shape. I can calculate areas of circles, rectangles, squares, and triangles.',
            'perimeter': 'Perimeter is the distance around a shape. For rectangles: 2×(length + width), for circles: 2×π×radius.',
            'algebra': 'Algebra uses letters to represent numbers. For example, solve for x: 2x + 5 = 15, so x = 5.',
            'geometry': 'Geometry studies shapes and their properties. I can help with areas, perimeters, and basic theorems.',
            'square root': 'Square root of a number x is a number that when multiplied by itself equals x. For example, √9 = 3.',
            'power': 'Power means multiplication by itself. For example, 2³ = 2×2×2 = 8. What power would you like to calculate?',
            'fraction': 'Fractions represent parts of a whole. For example, ½ + ¼ = ¾. I can help with fraction operations.',
            'decimal': 'Decimals are numbers with decimal points. For example, 0.5 = ½. I can convert between fractions and decimals.',

            // Cooking Recipes and Help
            'cooking': 'I can help with cooking recipes and tips! Try asking about chicken biryani, pizza, pasta, or general cooking questions.',
            'recipe': 'I can provide recipes for various dishes. What would you like to cook?',
            'chicken biryani': `Here's a delicious Chicken Biryani recipe for 4 people:

Ingredients:
• 500g chicken pieces
• 2 cups basmati rice
• 2 onions, sliced
• 2 tomatoes, chopped
• 2 tbsp ginger-garlic paste
• 1 cup yogurt
• 2 tbsp biryani masala
• 1/2 cup oil
• 4 boiled eggs
• Fresh coriander and mint leaves
• Saffron strands (optional)

Steps:
1. Marinate chicken with yogurt, ginger-garlic paste, and biryani masala for 1 hour.
2. Cook rice until 70% done, drain and set aside.
3. Fry onions until golden, add tomatoes and cook until soft.
4. Add marinated chicken and cook for 15-20 minutes.
5. Layer rice and chicken mixture in a pot, add boiled eggs on top.
6. Cook on low heat for 20 minutes. Garnish with coriander and serve hot!

Cooking time: 45 minutes. Enjoy your homemade biryani!`,
            'pizza': `Here's a simple homemade Pizza recipe:

Ingredients for dough:
• 2 cups flour
• 1 tsp yeast
• 1 tsp sugar
• 1 tsp salt
• 1 cup warm water
• 2 tbsp olive oil

Toppings:
• Tomato sauce
• Mozzarella cheese
• Pepperoni or vegetables
• Oregano and basil

Steps:
1. Mix yeast, sugar, and warm water. Let sit for 5 minutes.
2. Add flour, salt, and oil. Knead for 10 minutes.
3. Let dough rise for 1 hour.
4. Roll out dough, add sauce, cheese, and toppings.
5. Bake at 220°C for 12-15 minutes.

Your pizza is ready!`,
            'pasta': `Here's a quick Pasta Carbonara recipe:

Ingredients:
• 200g spaghetti
• 100g pancetta or bacon
• 2 eggs
• 1/2 cup parmesan cheese
• Black pepper
• Salt

Steps:
1. Cook pasta in salted boiling water.
2. Fry pancetta until crispy.
3. Mix eggs and cheese in a bowl.
4. Drain pasta, mix with pancetta.
5. Remove from heat, add egg mixture quickly while stirring.
6. Season with pepper and serve immediately!

Ready in 15 minutes.`,
            'how to cook': 'Cooking is fun! Start with simple recipes, read instructions carefully, and practice. What dish interests you?',
            'baking': 'Baking requires precision with measurements and temperatures. Try cookies or cakes first. What would you like to bake?',
            'vegetarian': 'I have many vegetarian recipes! Try asking about paneer butter masala, vegetable biryani, or pasta primavera.',

            // General Knowledge
            'india independence': 'India got independence from British rule on August 15, 1947. The independence movement was led by Mahatma Gandhi and other freedom fighters.',
            'when did india become independent': 'India became independent on August 15, 1947, after 200 years of British rule.',
            'who is the father of india': 'Mahatma Gandhi is considered the Father of the Nation in India. He led the non-violent independence movement.',
            'mahatma gandhi': 'Mahatma Gandhi (1869-1948) was a leader of India\'s independence movement. He advocated non-violent civil disobedience and inspired civil rights movements worldwide.',
            'capital of india': 'The capital of India is New Delhi. It\'s located in the National Capital Territory of Delhi.',
            'prime minister of india': 'The current Prime Minister of India is Narendra Modi. He has been in office since 2014.',
            'president of india': 'The current President of India is Droupadi Murmu. She is the 15th President of India.',
            'largest state in india': 'Rajasthan is the largest state in India by area, covering about 342,239 square kilometers.',
            'national animal of india': 'The national animal of India is the Bengal Tiger (Panthera tigris tigris).',
            'national bird of india': 'The national bird of India is the Indian Peacock (Pavo cristatus).',
            'taj mahal': 'The Taj Mahal is a beautiful white marble mausoleum in Agra, India. It was built by Mughal Emperor Shah Jahan in memory of his wife Mumtaz Mahal.',
            'ganges river': 'The Ganges River is the longest river in India, flowing 2,525 km from the Himalayas to the Bay of Bengal. It\'s considered sacred by Hindus.',
            'bollywood': 'Bollywood is the Hindi-language film industry based in Mumbai, India. It\'s one of the largest film industries in the world.',
            'cricket': 'Cricket is the most popular sport in India. The Indian cricket team has won the Cricket World Cup twice (1983, 2011).',
            'diwali': 'Diwali is the festival of lights celebrated in India. It symbolizes the victory of light over darkness and good over evil.',
            'holi': 'Holi is the festival of colors celebrated in India. People throw colored powder and water at each other to celebrate the arrival of spring.',
            'ramadan': 'Ramadan is the ninth month of the Islamic calendar, observed by Muslims worldwide as a month of fasting, prayer, and reflection.',
            'christmas': 'Christmas is celebrated on December 25th to commemorate the birth of Jesus Christ. It\'s a major holiday in many countries.',
            'new year': 'New Year is celebrated on January 1st in most countries. It marks the beginning of a new calendar year.',
            'world war 2': 'World War II (1939-1945) was a global war involving most of the world\'s nations. It ended with the defeat of Nazi Germany and Imperial Japan.',
            'united nations': 'The United Nations (UN) is an international organization founded in 1945 to promote peace, security, and cooperation among countries.',
            'who is': 'I can tell you about famous people, leaders, and historical figures. Who would you like to know about?',

            // Default response
            'default': 'I can help with programming, web development, mathematics, cooking recipes, and general knowledge! Try asking about coding, math calculations, recipes, or historical facts!'
        },
        hi: {
            // Programming basics in Hindi
            'hello': 'नमस्ते! आज प्रोग्रामिंग या होमवर्क में कैसे मदद कर सकता हूं?',
            'hi': 'नमस्ते! कोडिंग सवालों में मदद करने के लिए तैयार हूं!',
            'namaste': 'नमस्ते! प्रोग्रामिंग में आपकी क्या मदद चाहिए?',
            'क्या है प्रोग्रामिंग': 'प्रोग्रामिंग कंप्यूटर को समस्याएं हल करने के लिए निर्देश लिखना है। इसमें Python, JavaScript, Java और C++ जैसी भाषाएं शामिल हैं।',
            'कोडिंग कैसे सीखें': 'Python या JavaScript से शुरू करें। रोजाना अभ्यास करें, प्रोजेक्ट बनाएं, और कोडिंग कम्युनिटीज में जुड़ें। संसाधन: freeCodeCamp, Codecademy, या YouTube ट्यूटोरियल।',
            'पायथन क्या है': 'पायथन एक लोकप्रिय प्रोग्रामिंग भाषा है जो अपनी सरलता के लिए जानी जाती है। यह शुरुआती लोगों के लिए बढ़िया है और वेब डेवलपमेंट, डेटा साइंस और ऑटोमेशन में इस्तेमाल होती है।',
            'जावास्क्रिप्ट क्या है': 'जावास्क्रिप्ट वेब डेवलपमेंट के लिए इस्तेमाल होने वाली प्रोग्रामिंग भाषा है। यह वेबसाइटों को इंटरैक्टिव बनाती है और ब्राउज़रों में चलती है।',
            'एचटीएमएल क्या है': 'HTML (HyperText Markup Language) वेब पेज बनाने की मानक भाषा है। यह वेब दस्तावेजों की संरचना और सामग्री को परिभाषित करती है।',
            'सीएसएस क्या है': 'CSS (Cascading Style Sheets) HTML एलिमेंट्स को स्टाइल करने के लिए इस्तेमाल होती है। यह रंग, फॉन्ट, लेआउट और एनिमेशन को कंट्रोल करती है।',
            'हैलो वर्ल्ड कैसे प्रिंट करें': 'Python में: print("Hello World")\nJavaScript में: console.log("Hello World")\nJava में: System.out.println("Hello World")',
            'वेरिएबल क्या है': 'वेरिएबल एक कंटेनर है जो डेटा वैल्यूज स्टोर करता है। आप इसे सूचना रखने वाला लेबल्ड बॉक्स समझ सकते हैं।',
            'फंक्शन क्या है': 'फंक्शन कोड का एक ब्लॉक है जो एक विशिष्ट टास्क परफॉर्म करता है। यह इनपुट (पैरामीटर्स) ले सकता है और आउटपुट रिटर्न कर सकता है।',
            'लूप क्या है': 'लूप एक ब्लॉक ऑफ कोड को कई बार रिपीट करता है। कॉमन टाइप्स हैं for loops और while loops।',
            'अरे क्या है': 'अरे एक डेटा स्ट्रक्चर है जो एक वेरिएबल में कई वैल्यूज स्टोर करता है। जैसे आइटम्स की लिस्ट।',
            'डिबगिंग क्या है': 'डिबगिंग आपके कोड में एरर्स ढूंढना और ठीक करना है। प्रिंट स्टेटमेंट्स, डिबगर्स इस्तेमाल करें, और सिंटैक्स एरर्स चेक करें।',
            'मदद': 'मैं प्रोग्रामिंग बेसिक्स, होमवर्क सवालों, कोडिंग कॉन्सेप्ट्स और जनरल कंप्यूटर साइंस टॉपिक्स में मदद कर सकता हूं। आप क्या जानना चाहेंगे?',
            'धन्यवाद': 'आपका स्वागत है! हैप्पी कोडिंग!',
            'अलविदा': 'अलविदा! अपने कोडिंग स्किल्स को प्रैक्टिस करते रहें!',
            'शुक्रिया': 'आपका स्वागत है! और सवाल पूछने में हिचकिचाहट न करें।',

            // Cooking Recipes and Help in Hindi
            'खाना बनाना': 'मैं खाना बनाने में मदद कर सकता हूं! चिकन बिरयानी, पिज़्ज़ा, पास्ता या अन्य व्यंजनों के बारे में पूछें।',
            'रेसिपी': 'मैं विभिन्न व्यंजनों की रेसिपी दे सकता हूं। आप क्या बनाना चाहेंगे?',
            'चिकन बिरयानी': `यहाँ 4 लोगों के लिए स्वादिष्ट चिकन बिरयानी की रेसिपी है:

सामग्री:
• 500g चिकन टुकड़े
• 2 कप बासमती चावल
• 2 प्याज़, कटा हुआ
• 2 टमाटर, कटा हुआ
• 2 tbsp अदरक-लहसुन का पेस्ट
• 1 कप दही
• 2 tbsp बिरयानी मसाला
• 1/2 कप तेल
• 4 उबले अंडे
• ताजा धनिया और पुदीना पत्ते
• केसर (वैकल्पिक)

विधि:
1. चिकन को दही, अदरक-लहसुन पेस्ट और बिरयानी मसाले से 1 घंटा मारिनेट करें।
2. चावल को 70% तक पकाएं, पानी निकालकर अलग रखें।
3. प्याज़ को सुनहरा होने तक तलें, टमाटर डालें और नरम होने तक पकाएं।
4. मारिनेटेड चिकन डालें और 15-20 मिनट तक पकाएं।
5. एक बर्तन में चावल और चिकन मिश्रण को लेयर करें, ऊपर उबले अंडे रखें।
6. धीमी आंच पर 20 मिनट तक पकाएं। धनिया से गार्निश करें और गरम सर्व करें!

पकाने का समय: 45 मिनट। अपने होममेड बिरयानी का आनंद लें!`,
            'पिज़्ज़ा': `यहाँ साधारण होममेड पिज़्ज़ा की रेसिपी है:

दोई के लिए सामग्री:
• 2 कप आटा
• 1 tsp यीस्ट
• 1 tsp चीनी
• 1 tsp नमक
• 1 कप गर्म पानी
• 2 tbsp ऑलिव ऑयल

टॉपिंग्स:
• टमाटर सॉस
• मोज़रेला चीज़
• पेपरौनी या सब्जियाँ
• ओरिगैनो और बेसिल

विधि:
1. यीस्ट, चीनी और गर्म पानी मिलाएं। 5 मिनट तक रखें।
2. आटा, नमक और ऑयल डालें। 10 मिनट तक गूंधें।
3. दोई को 1 घंटा तक उठने दें।
4. दोई को बेलें, सॉस, चीज़ और टॉपिंग्स डालें।
5. 220°C पर 12-15 मिनट तक बेक करें।

आपका पिज़्ज़ा तैयार है!`,
            'पास्ता': `यहाँ त्वरित पास्ता कार्बोनारा की रेसिपी है:

सामग्री:
• 200g स्पेगेटी
• 100g पैनकेटा या बेकन
• 2 अंडे
• 1/2 कप पैरमेसन चीज़
• काली मिर्च
• नमक

विधि:
1. नमकीन उबलते पानी में पास्ता पकाएं।
2. पैनकेटा को कुरकुरा होने तक तलें।
3. एक कटोरे में अंडे और चीज़ मिलाएं।
4. पास्ता को पानी निकालें, पैनकेटा के साथ मिलाएं।
5. आंच से उतारें, तेजी से अंडा मिश्रण डालें और चलाते रहें।
6. मिर्च से सीज़न करें और तुरंत सर्व करें!

15 मिनट में तैयार।`,
            'खाना कैसे बनाएं': 'खाना बनाना मजेदार है! सरल रेसिपी से शुरू करें, निर्देश ध्यान से पढ़ें, और प्रैक्टिस करें। कौन सा व्यंजन आपको पसंद है?',
            'बेकिंग': 'बेकिंग में माप और तापमान की सटीकता जरूरी है। पहले कुकीज़ या केक ट्राई करें। आप क्या बेक करना चाहेंगे?',
            'शाकाहारी': 'मेरे पास कई शाकाहारी रेसिपी हैं! पनीर बटर मसाला, सब्जी बिरयानी या पास्ता प्रिमावेरा के बारे में पूछें।',

            // General Knowledge in Hindi
            'भारत की आजादी': 'भारत को ब्रिटिश शासन से आजादी 15 अगस्त 1947 को मिली। आजादी आंदोलन का नेतृत्व महात्मा गांधी और अन्य स्वतंत्रता सेनानियों ने किया।',
            'भारत कब आजाद हुआ': 'भारत 200 साल के ब्रिटिश शासन के बाद 15 अगस्त 1947 को आजाद हुआ।',
            'भारत के राष्ट्रपिता कौन हैं': 'महात्मा गांधी भारत के राष्ट्रपिता माने जाते हैं। उन्होंने अहिंसात्मक आजादी आंदोलन का नेतृत्व किया।',
            'महात्मा गांधी': 'महात्मा गांधी (1869-1948) भारत के स्वतंत्रता आंदोलन के नेता थे। उन्होंने अहिंसात्मक नागरिक अवज्ञा की वकालत की और दुनिया भर में नागरिक अधिकार आंदोलनों को प्रेरित किया।',
            'भारत की राजधानी': 'भारत की राजधानी नई दिल्ली है। यह दिल्ली के राष्ट्रीय राजधानी क्षेत्र में स्थित है।',
            'भारत के प्रधानमंत्री': 'भारत के वर्तमान प्रधानमंत्री नरेंद्र मोदी हैं। वे 2014 से पद पर हैं।',
            'भारत के राष्ट्रपति': 'भारत की वर्तमान राष्ट्रपति द्रौपदी मुर्मू हैं। वे भारत की 15वीं राष्ट्रपति हैं।',
            'भारत का सबसे बड़ा राज्य': 'क्षेत्रफल के हिसाब से राजस्थान भारत का सबसे बड़ा राज्य है, जो लगभग 342,239 वर्ग किलोमीटर में फैला है।',
            'भारत का राष्ट्रीय पशु': 'भारत का राष्ट्रीय पशु बंगाल टाइगर (Panthera tigris tigris) है।',
            'भारत का राष्ट्रीय पक्षी': 'भारत का राष्ट्रीय पक्षी भारतीय मोर (Pavo cristatus) है।',
            'ताज महल': 'ताज महल आगरा, भारत में स्थित एक सुंदर सफेद संगमरमर का मकबरा है। इसे मुगल सम्राट शाहजहाँ ने अपनी पत्नी मुमताज महल की याद में बनवाया था।',
            'गंगा नदी': 'गंगा नदी भारत की सबसे लंबी नदी है, जो हिमालय से शुरू होकर बंगाल की खाड़ी तक 2,525 किमी बहती है। हिंदुओं द्वारा इसे पवित्र माना जाता है।',
            'बॉलीवुड': 'बॉलीवुड हिंदी भाषा की फिल्म इंडस्ट्री है जो मुंबई में आधारित है। यह दुनिया की सबसे बड़ी फिल्म इंडस्ट्री में से एक है।',
            'क्रिकेट': 'क्रिकेट भारत में सबसे लोकप्रिय खेल है। भारतीय क्रिकेट टीम ने दो बार क्रिकेट विश्व कप जीता है (1983, 2011)।',
            'दिवाली': 'दिवाली भारत में दीपावली का त्योहार मनाया जाता है। यह प्रकाश पर अंधकार और भलाई पर बुराई की जीत का प्रतीक है।',
            'होली': 'होली भारत में रंगों का त्योहार मनाया जाता है। लोग एक दूसरे पर रंग और पानी फेंकते हैं और वसंत ऋतु के आगमन का जश्न मनाते हैं।',
            'रमजान': 'रमजान इस्लामी कैलेंडर का नौवां महीना है, जिसे मुसलमानों द्वारा दुनिया भर में रोज़ा, प्रार्थना और चिंतन के महीने के रूप में मनाया जाता है।',
            'क्रिसमस': 'क्रिसमस 25 दिसंबर को ईसा मसीह के जन्म की याद में मनाया जाता है। यह कई देशों में प्रमुख छुट्टी है।',
            'नया साल': 'नया साल अधिकांश देशों में 1 जनवरी को मनाया जाता है। यह नए कैलेंडर वर्ष की शुरुआत का प्रतीक है।',
            'द्वितीय विश्व युद्ध': 'द्वितीय विश्व युद्ध (1939-1945) एक वैश्विक युद्ध था जिसमें दुनिया की अधिकांश राष्ट्र शामिल थे। यह नाजी जर्मनी और साम्राज्यवादी जापान की हार के साथ समाप्त हुआ।',
            'संयुक्त राष्ट्र': 'संयुक्त राष्ट्र (UN) एक अंतर्राष्ट्रीय संगठन है जो 1945 में स्थापित किया गया था ताकि देशों के बीच शांति, सुरक्षा और सहयोग को बढ़ावा दिया जा सके।',
            'कौन है': 'मैं प्रसिद्ध लोगों, नेताओं और ऐतिहासिक हस्तियों के बारे में बता सकता हूं। आप किसके बारे में जानना चाहेंगे?',

            // Default response
            'default': 'मैं प्रोग्रामिंग, वेब डेवलपमेंट, गणित, खाना बनाने की रेसिपी और सामान्य ज्ञान में मदद कर सकता हूं! कोडिंग, गणित गणना, रेसिपी या ऐतिहासिक तथ्यों के बारे में पूछें!'
        }
    };

    // Check for exact matches first
    const langResponses = responses[currentLang];
    for (const [key, response] of Object.entries(langResponses)) {
        if (key !== 'default' && message.includes(key)) {
            return response;
        }
    }

    // Check for Hindi keywords if in Hindi mode
    if (currentLang === 'hi') {
        const hindiKeywords = {
            'प्रोग्रामिंग': 'प्रोग्रामिंग कंप्यूटर को निर्देश देने की प्रक्रिया है। यह सोचने और समस्याओं को हल करने का एक तरीका है।',
            'कोड': 'कोड प्रोग्रामिंग भाषा में लिखे गए निर्देश हैं। कंप्यूटर इन निर्देशों को फॉलो करके काम करता है।',
            'वेबसाइट': 'वेबसाइट बनाने के लिए HTML, CSS और JavaScript सीखें। HTML संरचना बनाता है, CSS डिजाइन करता है, और JavaScript इंटरैक्टिव बनाता है।',
            'ऐप': 'मोबाइल ऐप बनाने के लिए React Native या Flutter सीख सकते हैं। या वेब ऐप से शुरू करें।',
            'डेटाबेस': 'डेटाबेस डेटा स्टोर करने का सिस्टम है। SQL डेटाबेस जैसे MySQL, या NoSQL जैसे MongoDB लोकप्रिय हैं।',
            // Math in Hindi
            'गणित': 'मैं गणित के सवाल हल कर सकता हूं! पूछें जैसे: 25 + 30, 15 गुणा 8, 1000 पर GST, या प्रतिशत निकालना।',
            'जोड़': 'जोड़ना दो संख्याओं को मिलाना है। जैसे 5 + 3 = 8. क्या जोड़ना है?',
            'घटाना': 'घटाना एक संख्या से दूसरी कम करना है। जैसे 10 - 4 = 6. क्या घटाना है?',
            'गुणा': 'गुणा समान समूहों को जोड़ना है। जैसे 4 × 3 = 12. क्या गुणा करना है?',
            'भाग': 'भाग समान भागों में बांटना है। जैसे 20 ÷ 4 = 5. क्या भाग करना है?',
            'प्रतिशत': 'प्रतिशत सौ में से हिस्सा है। जैसे 200 का 25% = 50. क्या प्रतिशत निकालना है?',
            'प्रतिशत कैसे निकालें': 'प्रतिशत निकालने का फ़ॉर्मूला: (मूल्य × प्रतिशत) / 100. जैसे 200 का 15% = 30.',
            'जीएसटी': 'जीएसटी (गुड्स एंड सर्विस टैक्स) मूल्य में जोड़ा जाता है। मानक दर 18% है। जैसे ₹1000 पर जीएसटी = ₹180, कुल = ₹1180.',
            'क्षेत्रफल': 'क्षेत्रफल आकार के अंदर की जगह को मापता है। मैं circle, rectangle, square और triangle का क्षेत्रफल निकाल सकता हूं।',
            'परिमाप': 'परिमाप आकार के चारों ओर की दूरी है। आयत के लिए: 2×(लंबाई + चौड़ाई), circle के लिए: 2×π×त्रिज्या।',
            // General Knowledge in Hindi
            'आजादी': 'भारत को ब्रिटिश शासन से आजादी 15 अगस्त 1947 को मिली। आजादी आंदोलन का नेतृत्व महात्मा गांधी और अन्य स्वतंत्रता सेनानियों ने किया।',
            'स्वतंत्रता': 'भारत की स्वतंत्रता दिवस 15 अगस्त 1947 को मनाया जाता है। यह दिन भारत को ब्रिटिश राज से मुक्ति मिलने का प्रतीक है।',
            'राष्ट्रपिता': 'महात्मा गांधी भारत के राष्ट्रपिता माने जाते हैं। उन्होंने अहिंसात्मक आजादी आंदोलन का नेतृत्व किया।',
            'राजधानी': 'भारत की राजधानी नई दिल्ली है। यह दिल्ली के राष्ट्रीय राजधानी क्षेत्र में स्थित है।',
            'प्रधानमंत्री': 'भारत के वर्तमान प्रधानमंत्री नरेंद्र मोदी हैं। वे 2014 से पद पर हैं।',
            'राष्ट्रपति': 'भारत की वर्तमान राष्ट्रपति द्रौपदी मुर्मू हैं। वे भारत की 15वीं राष्ट्रपति हैं।',
            'सबसे बड़ा राज्य': 'क्षेत्रफल के हिसाब से राजस्थान भारत का सबसे बड़ा राज्य है, जो लगभग 342,239 वर्ग किलोमीटर में फैला है।',
            'राष्ट्रीय पशु': 'भारत का राष्ट्रीय पशु बंगाल टाइगर (Panthera tigris tigris) है।',
            'राष्ट्रीय पक्षी': 'भारत का राष्ट्रीय पक्षी भारतीय मोर (Pavo cristatus) है।',
            'ताजमहल': 'ताज महल आगरा, भारत में स्थित एक सुंदर सफेद संगमरमर का मकबरा है। इसे मुगल सम्राट शाहजहाँ ने अपनी पत्नी मुमताज महल की याद में बनवाया था।',
            'गंगा': 'गंगा नदी भारत की सबसे लंबी नदी है, जो हिमालय से शुरू होकर बंगाल की खाड़ी तक 2,525 किमी बहती है। हिंदुओं द्वारा इसे पवित्र माना जाता है।',
            'बॉलीवुड': 'बॉलीवुड हिंदी भाषा की फिल्म इंडस्ट्री है जो मुंबई में आधारित है। यह दुनिया की सबसे बड़ी फिल्म इंडस्ट्री में से एक है।',
            'क्रिकेट': 'क्रिकेट भारत में सबसे लोकप्रिय खेल है। भारतीय क्रिकेट टीम ने दो बार क्रिकेट विश्व कप जीता है (1983, 2011)।',
            'दिवाली': 'दिवाली भारत में दीपावली का त्योहार मनाया जाता है। यह प्रकाश पर अंधकार और भलाई पर बुराई की जीत का प्रतीक है।',
            'होली': 'होली भारत में रंगों का त्योहार मनाया जाता है। लोग एक दूसरे पर रंग और पानी फेंकते हैं और वसंत ऋतु के आगमन का जश्न मनाते हैं।',
            'रमजान': 'रमजान इस्लामी कैलेंडर का नौवां महीना है, जिसे मुसलमानों द्वारा दुनिया भर में रोज़ा, प्रार्थना और चिंतन के महीने के रूप में मनाया जाता है।',
            'क्रिसमस': 'क्रिसमस 25 दिसंबर को ईसा मसीह के जन्म की याद में मनाया जाता है। यह कई देशों में प्रमुख छुट्टी है।',
            'नए साल': 'नया साल अधिकांश देशों में 1 जनवरी को मनाया जाता है। यह नए कैलेंडर वर्ष की शुरुआत का प्रतीक है।',
            'द्वितीय विश्व युद्ध': 'द्वितीय विश्व युद्ध (1939-1945) एक वैश्विक युद्ध था जिसमें दुनिया की अधिकांश राष्ट्र शामिल थे। यह नाजी जर्मनी और साम्राज्यवादी जापान की हार के साथ समाप्त हुआ।',
            'संयुक्त राष्ट्र': 'संयुक्त राष्ट्र (UN) एक अंतर्राष्ट्रीय संगठन है जो 1945 में स्थापित किया गया था ताकि देशों के बीच शांति, सुरक्षा और सहयोग को बढ़ावा दिया जा सके।'
        };

        for (const [keyword, response] of Object.entries(hindiKeywords)) {
            if (message.includes(keyword)) {
                return response;
            }
        }

        // Handle common Hindi question patterns
        if (currentLang === 'hi') {
            // Questions about India
            if (message.includes('भारत') && (message.includes('कब') || message.includes('कब हुआ'))) {
                if (message.includes('आजाद') || message.includes('आजादी') || message.includes('स्वतंत्र')) {
                    return 'भारत को ब्रिटिश शासन से आजादी 15 अगस्त 1947 को मिली। आजादी आंदोलन का नेतृत्व महात्मा गांधी और अन्य स्वतंत्रता सेनानियों ने किया।';
                }
            }

            if (message.includes('राजधानी') && message.includes('भारत')) {
                return 'भारत की राजधानी नई दिल्ली है। यह दिल्ली के राष्ट्रीय राजधानी क्षेत्र में स्थित है।';
            }

            if (message.includes('प्रधानमंत्री') && message.includes('भारत')) {
                return 'भारत के वर्तमान प्रधानमंत्री नरेंद्र मोदी हैं। वे 2014 से पद पर हैं।';
            }

            if (message.includes('राष्ट्रपति') && message.includes('भारत')) {
                return 'भारत की वर्तमान राष्ट्रपति द्रौपदी मुर्मू हैं। वे भारत की 15वीं राष्ट्रपति हैं।';
            }

            if (message.includes('राष्ट्रपिता') || (message.includes('कौन') && message.includes('पिता'))) {
                return 'महात्मा गांधी भारत के राष्ट्रपिता माने जाते हैं। उन्होंने अहिंसात्मक आजादी आंदोलन का नेतृत्व किया।';
            }

            if (message.includes('राष्ट्रीय पशु')) {
                return 'भारत का राष्ट्रीय पशु बंगाल टाइगर (Panthera tigris tigris) है।';
            }

            if (message.includes('राष्ट्रीय पक्षी')) {
                return 'भारत का राष्ट्रीय पक्षी भारतीय मोर (Pavo cristatus) है।';
            }

            // Festival questions
            if (message.includes('दिवाली') && message.includes('क्या')) {
                return 'दिवाली भारत में दीपावली का त्योहार मनाया जाता है। यह प्रकाश पर अंधकार और भलाई पर बुराई की जीत का प्रतीक है।';
            }

            if (message.includes('होली') && message.includes('क्या')) {
                return 'होली भारत में रंगों का त्योहार मनाया जाता है। लोग एक दूसरे पर रंग और पानी फेंकते हैं और वसंत ऋतु के आगमन का जश्न मनाते हैं।';
            }

            // Historical monuments
            if (message.includes('ताजमहल') || message.includes('ताज महल')) {
                return 'ताज महल आगरा, भारत में स्थित एक सुंदर सफेद संगमरमर का मकबरा है। इसे मुगल सम्राट शाहजहाँ ने अपनी पत्नी मुमताज महल की याद में बनवाया था।';
            }

            // Rivers and geography
            if (message.includes('गंगा') && message.includes('नदी')) {
                return 'गंगा नदी भारत की सबसे लंबी नदी है, जो हिमालय से शुरू होकर बंगाल की खाड़ी तक 2,525 किमी बहती है। हिंदुओं द्वारा इसे पवित्र माना जाता है।';
            }

            // Entertainment
            if (message.includes('बॉलीवुड') && message.includes('क्या')) {
                return 'बॉलीवुड हिंदी भाषा की फिल्म इंडस्ट्री है जो मुंबई में आधारित है। यह दुनिया की सबसे बड़ी फिल्म इंडस्ट्री में से एक है।';
            }

            if (message.includes('क्रिकेट') && message.includes('भारत')) {
                return 'क्रिकेट भारत में सबसे लोकप्रिय खेल है। भारतीय क्रिकेट टीम ने दो बार क्रिकेट विश्व कप जीता है (1983, 2011)।';
            }

            // World facts
            if (message.includes('द्वितीय विश्व युद्ध') || message.includes('सेकंड वर्ल्ड वॉर')) {
                return 'द्वितीय विश्व युद्ध (1939-1945) एक वैश्विक युद्ध था जिसमें दुनिया की अधिकांश राष्ट्र शामिल थे। यह नाजी जर्मनी और साम्राज्यवादी जापान की हार के साथ समाप्त हुआ।';
            }

            if (message.includes('संयुक्त राष्ट्र') || message.includes('यूनाइटेड नेशंस')) {
                return 'संयुक्त राष्ट्र (UN) एक अंतर्राष्ट्रीय संगठन है जो 1945 में स्थापित किया गया था ताकि देशों के बीच शांति, सुरक्षा और सहयोग को बढ़ावा दिया जा सके।';
            }

            // Religious festivals
            if (message.includes('रमजान') && message.includes('क्या')) {
                return 'रमजान इस्लामी कैलेंडर का नौवां महीना है, जिसे मुसलमानों द्वारा दुनिया भर में रोज़ा, प्रार्थना और चिंतन के महीने के रूप में मनाया जाता है।';
            }

            if (message.includes('क्रिसमस') && message.includes('क्या')) {
                return 'क्रिसमस 25 दिसंबर को ईसा मसीह के जन्म की याद में मनाया जाता है। यह कई देशों में प्रमुख छुट्टी है।';
            }
        }
    }

    // Check for English keywords if in English mode
    if (currentLang === 'en') {
        const englishKeywords = {
            'programming': 'Programming is writing instructions for computers. It involves logic, problem-solving, and creativity.',
            'code': 'Code is instructions written in programming languages. Computers follow these instructions to perform tasks.',
            'website': 'To build websites, learn HTML, CSS, and JavaScript. HTML creates structure, CSS handles design, JavaScript adds interactivity.',
            'app': 'For mobile apps, you can learn React Native or Flutter. Or start with web apps first.',
            'database': 'A database is a system to store data. SQL databases like MySQL, or NoSQL like MongoDB are popular options.',
            // General Knowledge in English
            'india independence': 'India got independence from British rule on August 15, 1947. The independence movement was led by Mahatma Gandhi and other freedom fighters.',
            'when did india': 'India became independent on August 15, 1947, after 200 years of British rule.',
            'father of india': 'Mahatma Gandhi is considered the Father of the Nation in India. He led the non-violent independence movement.',
            'mahatma gandhi': 'Mahatma Gandhi (1869-1948) was a leader of India\'s independence movement. He advocated non-violent civil disobedience and inspired civil rights movements worldwide.',
            'capital of india': 'The capital of India is New Delhi. It\'s located in the National Capital Territory of Delhi.',
            'prime minister of india': 'The current Prime Minister of India is Narendra Modi. He has been in office since 2014.',
            'president of india': 'The current President of India is Droupadi Murmu. She is the 15th President of India.',
            'largest state in india': 'Rajasthan is the largest state in India by area, covering about 342,239 square kilometers.',
            'national animal of india': 'The national animal of India is the Bengal Tiger (Panthera tigris tigris).',
            'national bird of india': 'The national bird of India is the Indian Peacock (Pavo cristatus).',
            'taj mahal': 'The Taj Mahal is a beautiful white marble mausoleum in Agra, India. It was built by Mughal Emperor Shah Jahan in memory of his wife Mumtaz Mahal.',
            'ganges river': 'The Ganges River is the longest river in India, flowing 2,525 km from the Himalayas to the Bay of Bengal. It\'s considered sacred by Hindus.',
            'bollywood': 'Bollywood is the Hindi-language film industry based in Mumbai, India. It\'s one of the largest film industries in the world.',
            'cricket': 'Cricket is the most popular sport in India. The Indian cricket team has won the Cricket World Cup twice (1983, 2011).',
            'diwali': 'Diwali is the festival of lights celebrated in India. It symbolizes the victory of light over darkness and good over evil.',
            'holi': 'Holi is the festival of colors celebrated in India. People throw colored powder and water at each other to celebrate the arrival of spring.',
            'ramadan': 'Ramadan is the ninth month of the Islamic calendar, observed by Muslims worldwide as a month of fasting, prayer, and reflection.',
            'christmas': 'Christmas is celebrated on December 25th to commemorate the birth of Jesus Christ. It\'s a major holiday in many countries.',
            'new year': 'New Year is celebrated on January 1st in most countries. It marks the beginning of a new calendar year.',
            'world war 2': 'World War II (1939-1945) was a global war involving most of the world\'s nations. It ended with the defeat of Nazi Germany and Imperial Japan.',
            'united nations': 'The United Nations (UN) is an international organization founded in 1945 to promote peace, security, and cooperation among countries.'
        };

        for (const [keyword, response] of Object.entries(englishKeywords)) {
            if (message.includes(keyword)) {
                return response;
            }
        }

        // Handle common English question patterns
        if (currentLang === 'en') {
            // Questions about India
            if (message.includes('india') && (message.includes('when') || message.includes('independence'))) {
                return 'India got independence from British rule on August 15, 1947. The independence movement was led by Mahatma Gandhi and other freedom fighters.';
            }

            if (message.includes('capital') && message.includes('india')) {
                return 'The capital of India is New Delhi. It\'s located in the National Capital Territory of Delhi.';
            }

            if (message.includes('prime minister') && message.includes('india')) {
                return 'The current Prime Minister of India is Narendra Modi. He has been in office since 2014.';
            }

            if (message.includes('president') && message.includes('india')) {
                return 'The current President of India is Droupadi Murmu. She is the 15th President of India.';
            }

            if (message.includes('father of') && message.includes('india')) {
                return 'Mahatma Gandhi is considered the Father of the Nation in India. He led the non-violent independence movement.';
            }

            if (message.includes('national animal') && message.includes('india')) {
                return 'The national animal of India is the Bengal Tiger (Panthera tigris tigris).';
            }

            if (message.includes('national bird') && message.includes('india')) {
                return 'The national bird of India is the Indian Peacock (Pavo cristatus).';
            }

            // Festival questions
            if (message.includes('what is diwali')) {
                return 'Diwali is the festival of lights celebrated in India. It symbolizes the victory of light over darkness and good over evil.';
            }

            if (message.includes('what is holi')) {
                return 'Holi is the festival of colors celebrated in India. People throw colored powder and water at each other to celebrate the arrival of spring.';
            }

            // Historical monuments
            if (message.includes('taj mahal')) {
                return 'The Taj Mahal is a beautiful white marble mausoleum in Agra, India. It was built by Mughal Emperor Shah Jahan in memory of his wife Mumtaz Mahal.';
            }

            // Rivers and geography
            if (message.includes('ganges') && message.includes('river')) {
                return 'The Ganges River is the longest river in India, flowing 2,525 km from the Himalayas to the Bay of Bengal. It\'s considered sacred by Hindus.';
            }

            // Entertainment
            if (message.includes('what is bollywood')) {
                return 'Bollywood is the Hindi-language film industry based in Mumbai, India. It\'s one of the largest film industries in the world.';
            }

            if (message.includes('cricket') && message.includes('india')) {
                return 'Cricket is the most popular sport in India. The Indian cricket team has won the Cricket World Cup twice (1983, 2011).';
            }

            // World facts
            if (message.includes('world war 2') || message.includes('second world war')) {
                return 'World War II (1939-1945) was a global war involving most of the world\'s nations. It ended with the defeat of Nazi Germany and Imperial Japan.';
            }

            if (message.includes('united nations') || message.includes('un')) {
                return 'The United Nations (UN) is an international organization founded in 1945 to promote peace, security, and cooperation among countries.';
            }

            // Religious festivals
            if (message.includes('what is ramadan')) {
                return 'Ramadan is the ninth month of the Islamic calendar, observed by Muslims worldwide as a month of fasting, prayer, and reflection.';
            }

            if (message.includes('what is christmas')) {
                return 'Christmas is celebrated on December 25th to commemorate the birth of Jesus Christ. It\'s a major holiday in many countries.';
            }
        }
    }

    // Return default response if no match found
    return langResponses.default;
}

async function speakResponse(text) {
    if (!('speechSynthesis' in window)) {
        statusText.textContent = '❌ Voice output not supported';
        statusText.style.color = '#f56565';
        return;
    }

    isSpeaking = true;
    micBtn.classList.add('speaking');
    statusText.textContent = messages[currentLang].speaking;
    statusText.style.color = '#48bb78';
    listeningText.textContent = text;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.language = currentLang === 'hi' ? 'hi-IN' : 'en-US';

    // Prefer a female voice if available
    const voices = speechSynthesis.getVoices();
    let chosenVoice = null;
    const langPrefix = currentLang === 'hi' ? 'hi' : 'en';

    if (voices.length > 0) {
        chosenVoice = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix) && /female|female voice|woman/i.test(v.name));
        if (!chosenVoice) {
            chosenVoice = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
        }
    }

    if (chosenVoice) {
        utterance.voice = chosenVoice;
    }

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    return new Promise((resolve) => {
        utterance.addEventListener('end', () => {
            isSpeaking = false;
            micBtn.classList.remove('speaking');
            if (!isListening && isInitialized) {
                statusText.textContent = messages[currentLang].listening;
                statusText.style.color = '#48bb78';
            }
            listeningText.textContent = '';
            resolve();
        });

        utterance.addEventListener('error', () => {
            isSpeaking = false;
            micBtn.classList.remove('speaking');
            resolve();
        });

        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
    });
}

updateUI();
