// Test script for math functions
console.log("Testing math functions...");

// Test calculateMath
function calculateMath(expression) {
    try {
        const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
        const result = eval(sanitized);
        return isNaN(result) ? null : result;
    } catch (error) {
        return null;
    }
}

// Test calculateGST
function calculateGST(amount, rate = 18) {
    const gstAmount = (amount * rate) / 100;
    const total = amount + gstAmount;
    return { gstAmount, total, rate };
}

// Test calculatePercentage
function calculatePercentage(value, percentage) {
    return (value * percentage) / 100;
}

// Test cases
console.log("25 + 30 =", calculateMath("25 + 30"));
console.log("GST on 1000 =", calculateGST(1000));
console.log("15% of 200 =", calculatePercentage(200, 15));
console.log("2^3 =", Math.pow(2, 3));
console.log("√16 =", Math.sqrt(16));

console.log("All tests completed!");