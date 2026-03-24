# Voice AI Assistant

A modern, offline voice-controlled AI assistant for coding, homework, cooking, and general knowledge.

## Features

- 🎤 **Voice Input/Output**: Speak naturally and get voice responses
- 🌐 **Bilingual Support**: English and Hindi language support with improved question matching
- 💻 **Coding Help**: Comprehensive programming knowledge base
- 🌐 **Web Development**: Complete website code examples
- 🍳 **Cooking Recipes**: Step-by-step recipes for various dishes
- 📚 **General Knowledge**: Historical facts, geography, and world information with flexible question patterns
- 🔐 **User Authentication**: Login/Register system with local storage
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Glassmorphism design with smooth animations

## Getting Started

1. **First Time Setup**:
   - Open `login.html` in your browser
   - Click "Sign up" to create a new account
   - Or use the demo credentials (if available)

2. **Using the Assistant**:
   - Click the microphone button to start continuous listening
   - Ask questions about programming, coding, web development, cooking recipes, or general knowledge
   - Switch between English and Hindi using the language selector
   - The AI will respond with voice and helpful information

## Available Commands

### Programming Basics
- "What is Python?"
- "How to learn coding?"
- "What is a variable?"
- "What is a function?"
- "How to print hello world?"

### Web Development
- "Create a website" - Get complete website code
- "HTML template" - Basic HTML structure
- "CSS template" - Styling examples
- "JavaScript template" - Interactive code examples
- "Responsive website" - Mobile-friendly design

### Mathematics
- **Basic Arithmetic**: "25 + 30", "15 × 8", "100 ÷ 5", "50 - 20"
- **Word Operations**: "25 plus 30", "15 times 8", "100 divided by 5"
- **GST Calculations**: "GST on 1000", "calculate GST on 5000"
- **Percentages**: "25% of 200", "15 percent of 1000"
- **Powers**: "2 to the power 3", "5^2"
- **Square Root**: "square root of 16", "√25"
- **Area Calculations**: "area of circle", "area of rectangle"

### Cooking Recipes
- **Popular Dishes**: "chicken biryani recipe", "pizza recipe", "pasta recipe"
- **Cooking Tips**: "how to cook", "baking tips", "vegetarian recipes"
- **General**: "cooking help", "recipe for [dish name]"

### General Knowledge
- **India History**: "when did India become independent?", "who is the father of India?", "what is Diwali?"
- **Geography**: "capital of India", "largest state in India", "national animal of India", "about Taj Mahal"
- **Culture**: "what is Holi?", "about Ganges river", "what is Bollywood?", "cricket in India"
- **World Facts**: "about United Nations", "World War 2 facts", "what is Ramadan?", "what is Christmas?"
- **Current Info**: "current Prime Minister of India", "current President of India"
- **Hindi Math**: "25 जोड़ 30", "15 गुणा 8", "1000 पर जीएसटी"

### Languages Supported
- English
- हिंदी (Hindi)

## File Structure

```
chatboot site/
├── index.html          # Main voice assistant interface
├── login.html          # User login page
├── register.html       # User registration page
├── forgot-password.html # Password reset page
├── style.css           # Modern styling with glassmorphism
├── script.js           # Main application logic
├── auth.js             # Authentication system
└── README.md           # This file
```

## Technical Details

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Voice**: Web Speech API (Speech Recognition & Synthesis)
- **Storage**: Local Storage for user data
- **Design**: Glassmorphism UI with CSS Grid/Flexbox
- **Responsive**: Mobile-first design approach

## Browser Requirements

- Modern browser with Web Speech API support
- Chrome/Edge recommended for best voice experience
- HTTPS required for microphone access (or localhost)

## Privacy

- All data stored locally in your browser
- No external API calls or data transmission
- User credentials stored securely in local storage
- Voice processing happens entirely on your device

## Troubleshooting

1. **Microphone not working**: Ensure HTTPS or localhost, grant microphone permissions
2. **Voice not recognized**: Speak clearly, check microphone settings
3. **Login issues**: Clear browser data, try registering again
4. **Styling issues**: Ensure modern browser with CSS Grid support

## Development

To modify or extend the assistant:

1. **Add new responses**: Edit the `responses` object in `script.js`
2. **Change styling**: Modify `style.css` with CSS variables
3. **Add features**: Extend the JavaScript files with new functionality
4. **Improve AI**: Enhance the keyword matching and response logic

## License

This project is for educational purposes. Feel free to modify and distribute.