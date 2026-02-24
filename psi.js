
// Get elements from page
const scoreElement = document.getElementById('score');
const timeElement = document.getElementById('time');
const passwordInput = document.getElementById('password');
const strengthMeter = document.getElementById('strength-meter');
const plaintext = document.getElementById('plaintext');
const strengthText = document.getElementById('strength-text');
const feedbackList = document.getElementById('feedback-list');

let excludedWords = [];

// Set up event listener for password input
document.getElementById('password').addEventListener('input', function() {

    // Get password
    const password = passwordInput.value;

    // If empty, revert to defaults
    if (!password) {
        strengthMeter.value = 0;
        strengthMeter.className = "";
        strengthText.textContent = "Strength: Very Weak";
        feedbackList.innerHTML = "";
        plaintext.textContent = "";
        scoreElement.textContent = `Entropy: 0 bits`;
        timeElement.textContent = `Password Strength Score: 0`;
        strengthMeter.classList.add("very-weak");

        return;
    }

    // Get entropy and feeback
    let {entropy, feedback} = getPasswordEntropy(password);
    let time = timeToCrack(entropy);
    
    // Calculate Score
    let score = scorePassword(entropy);

    // Update UI
    scoreElement.textContent = `Entropy: ${entropy} bits`;
    timeElement.textContent = `Password Strength Score: ${score.toFixed(2)}`;
    strengthMeter.value = score;
    let categoryName = category(score);
    strengthText.textContent = `Strength: ${categoryName}`;
    plaintext.textContent = password;

    // Set meter color
    strengthMeter.classList.remove("very-weak", "weak", "fair", "strong", "very-strong");
    if(categoryName === "Very Weak"){
        strengthMeter.classList.add("very-weak");
    }
    else if(categoryName === "Weak"){
        strengthMeter.classList.add("weak");
    }
    else if(categoryName === "Fair"){
        strengthMeter.classList.add("fair");
    }
    else if(categoryName === "Strong"){
        strengthMeter.classList.add("strong");
    }
    else if(categoryName === "Very Strong"){
        strengthMeter.classList.add("very-strong");
    }
    //console.log(strengthMeter.className);
    //strengthMeter.style.color = colors[categoryName];
    
    // Update feedback list
    feedbackList.innerHTML = "";
    for (let item of feedback) {
        const li = document.createElement("li");
        li.textContent = item;
        if(li.textContent.startsWith("Consider removing common words")){
            li.classList.add("bad");
        }
        feedbackList.appendChild(li);
    }
});

// Get common words from files directory
window.onload = async function() {
    const fileList = await fetch('files.json').then(r => r.json());

    for (const filename of fileList) {
        const data = await fetch(`words/${filename}`).then(r => r.text());
        const lines = data.split('\n');

        for (const line of lines) {
            if (line.trim().length > 2) {
                excludedWords.push(line.trim());
            }
        }
    }

}

function getPasswordEntropy(password){
    
    // character set size
    let charset = 0;

    let feedback = [];

    // Find character set size
    if (/[a-z]/.test(password))
         charset += 26;
    else
        feedback.push("Add lowercase letters");

    if (/[A-Z]/.test(password)) 
        charset += 26;
    else
        feedback.push("Add uppercase letters");

    if (/[0-9]/.test(password)) 
        charset += 10;
    else
        feedback.push("Add numbers");
    
    if (/[^a-zA-Z0-9]/.test(password)) 
        charset += 32;
    else
        feedback.push("Add special characters");

    // Check for common words and calculate good characters
    let {flags, matchedWords} = cleanPassword(password);
    console.log(matchedWords);

    // Penalize for characters in word list
    let goodCharacters = 0;
    for (let i = 0; i < flags.length; i++) {
        //goodCharacters += flags[i];
        if(flags[i] === 1){
            goodCharacters++;
        }
        else{
            goodCharacters += 0.25; // 75% penatly for characters in common words
        }
    }

    // If entire password is a common word, score 0, combination of words is penalized but scores
    if (excludedWords.includes(password.toLowerCase())) { 
        goodCharacters = 0;
    }

    // Finally calculate entropy
    const entropy = Math.floor(goodCharacters * Math.log2(charset));

    // If no character sets are used, return 0 entropy
    if(charset === 0) return 0;

    // Add feedback for common words
    if (matchedWords.length > 0) {
        feedback.push(`Consider removing common words: ${matchedWords.join(", ")}`);
    }

    return {entropy, feedback};
}

// Search for common words and set flags
function cleanPassword(password){
    let cleanedPassword = password.toLowerCase();

    let flags = [];
    let matchedWords = [];
    for (let i = 0; i < cleanedPassword.length; i++) {
        flags.push(1);
    }

    for (let word of excludedWords) {
        let index = cleanedPassword.indexOf(word);

        if(index !== -1){
            
            // Add matched word
            matchedWords.push(word);
            
            // Set flags
            for (let i = 0 ; i < word.length; i++) {
                flags[index + i] = 0;
            }
        }
    }

    return {flags, matchedWords};
}

// Calculate time to crack in years based on entropy
function timeToCrack(entropy) {
    const attemptsPerSecond = 1e10;
    const totalAttempts = Math.pow(2, entropy - 1); // Attacker using brute force would need to try half of combinations on average (entropy - 1)
    const seconds = totalAttempts / attemptsPerSecond;
    const secondsInYear = 60 * 60 * 24 * 365;
    
    const fiftyYears = 50 * secondsInYear;
    const tenYears = 10 * secondsInYear;

    const timeToCrack = seconds / tenYears;

    return timeToCrack;
}

// Find target entropy for a given time to crack and attempts per second
function entropyTarget(secondsToCrack, attemptsPerSecond){
    return Math.ceil(Math.log2(secondsToCrack * attemptsPerSecond)) + 1; // +1 because average case is half of the total compinations (entropy - 1)
}

// Give score out of 100
function scorePassword(entropy){

    const secondsInYear = 60 * 60 * 24 * 365;
    const attemptsPerSecond = 1e10;
    const hundreadYears = 100 * secondsInYear;
    const fiftyYears = 50 * secondsInYear;
    const tenYears = 10 * secondsInYear;

    const score = 100 * (entropy / entropyTarget(hundreadYears, attemptsPerSecond));
    return Math.min(score, 100);
}

// Categorize password strength based on score
function category(entropy){
    if (entropy >= 100)
        return "Very Strong";
    if (entropy >= 80)
        return "Strong";
    if (entropy >= 60)
        return "Fair";
    if (entropy >= 30)
        return "Weak";
    return "Very Weak";
}