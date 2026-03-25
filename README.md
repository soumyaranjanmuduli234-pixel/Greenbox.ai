# Voice AI Assistant

A modern, offline voice-controlled AI assistant for coding, homework, cooking, and general knowledge with advanced features.

## ✨ New Features Added

### 🧠 Smart Context Memory
- Remembers previous conversations
- Provides contextual follow-up responses
- Maintains conversation history for better interactions

### 🎨 Advanced Animations
- Glassmorphism UI design
- Floating particle animations in background
- Smooth transitions and hover effects

### 📱 PWA Support
- Install on phone as native app
- Works offline with cached resources
- App-like experience on mobile devices

### ⚡ Offline Mode
- Service worker for offline functionality
- Cached responses for offline use
- Network-first caching strategy

### 🎵 Sound Effects
- Audio feedback for mic on/off
- Processing sound effects
- Immersive user experience

### 📊 Chat History
- Save all conversations locally
- View previous interactions
- Export chat history as JSON
- Clear history functionality

### 🔍 Search Suggestions
- Auto-complete search input
- Keyboard navigation (arrow keys)
- Click or press Enter to select

### 🌙 Dark/Light Theme Toggle
- Switch between dark and light themes
- Theme preference saved locally
- Smooth theme transitions

### 📱 Voice Commands
- "Change language" - Switch between English/Hindi
- "Clear history" - Remove all chat history
- "Toggle theme" - Switch theme

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
- 🧠 **Context Memory**: Remembers conversation context
- 📊 **Chat History**: Persistent conversation storage
- 🔍 **Search Suggestions**: Auto-complete functionality
- 🌙 **Theme Toggle**: Dark/Light mode switching
- 📱 **PWA Ready**: Installable web app with offline support

## Getting Started

1. **First Time Setup**:
   - Open `login.html` in your browser
   - Click "Sign up" to create a new account
   - Or use the demo credentials (if available)

2. **Using the Assistant**:
   - Click the microphone button to start continuous listening
   - Type in the search box for suggestions
   - Ask questions about programming, coding, web development, cooking recipes, or general knowledge
   - Use voice commands: "change language", "clear history", "toggle theme"
   - Switch between English and Hindi using the language selector
   - Toggle between dark/light themes using the theme button
   - View chat history using the history button
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
voice-ai-assistant/
├── index.html          # Main voice assistant interface
├── login.html          # User login page
├── register.html       # User registration page
├── forgot-password.html # Password reset page
├── style.css           # Modern styling with glassmorphism & themes
├── script.js           # Main application logic with all new features
├── auth.js             # Authentication system
├── manifest.json       # PWA manifest for app installation
├── sw.js              # Service worker for offline functionality
└── README.md           # This documentation
```

## Technical Details

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Voice**: Web Speech API (Speech Recognition & Synthesis)
- **Audio**: Web Audio API for sound effects
- **Storage**: Local Storage for user data, chat history, and preferences
- **PWA**: Service Worker for offline functionality and app installation
- **Design**: Glassmorphism UI with CSS Grid/Flexbox and particle animations
- **Responsive**: Mobile-first design approach
- **Features**: Context memory, theme switching, search suggestions, voice commands

## Browser Support

- Chrome/Edge (recommended for full voice features)
- Firefox (partial voice support)
- Safari (partial voice support)
- Mobile browsers (PWA installable)

## Privacy & Security

- All data stored locally in browser
- No external API calls or data transmission
- User authentication handled client-side
- Chat history saved locally only

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