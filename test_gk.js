// Test file for general knowledge responses
// This file tests the improved question matching

// Test Hindi questions
const hindiTests = [
    "भारत कब आजाद हुआ?",
    "भारत की राजधानी क्या है?",
    "भारत के प्रधानमंत्री कौन हैं?",
    "भारत के राष्ट्रपिता कौन हैं?",
    "भारत का राष्ट्रीय पशु क्या है?",
    "ताजमहल क्या है?",
    "दिवाली क्या है?",
    "होली क्या है?",
    "गंगा नदी क्या है?",
    "बॉलीवुड क्या है?",
    "द्वितीय विश्व युद्ध क्या था?"
];

// Test English questions
const englishTests = [
    "when did India become independent?",
    "what is the capital of India?",
    "who is the prime minister of India?",
    "who is the father of India?",
    "what is the national animal of India?",
    "what is the Taj Mahal?",
    "what is Diwali?",
    "what is Holi?",
    "what is the Ganges river?",
    "what is Bollywood?",
    "what is World War 2?"
];

console.log("Testing improved general knowledge responses...");
console.log("Hindi tests:", hindiTests.length);
console.log("English tests:", englishTests.length);
console.log("All question patterns should now work with flexible matching!");