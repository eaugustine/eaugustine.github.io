// Get the HTML elements
const lettersDisplay = document.getElementById('letters-display');
const wordInput = document.getElementById('word-input');
const timerDisplay = document.getElementById('timer-display');
const startButton = document.getElementById('start-button');
const scoreDisplay = document.getElementById('score-display');
const wordsDisplay = document.getElementById('words-display');
const notification = document.getElementById('notification'); // Get the notification element
const states = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", 
  "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", 
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina",
  "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee",
  "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming", "DC"
];

let score = 0; // Initialize score
let letters = []; // Store the letters for the current round
let intervalId = null; // Store the id of the timer interval
let time = 60; // The initial time
let enteredWords = new Set(); // Initialize the set of entered words
let possibleWords = []; // Store the possible words for the current round

let lightTextStates = ['Delaware', 'Kansas', 'Vermont', 'Alaska']; // Names of states that need light text ... Note: Nevada, Florida size is weird

let highScore = 0;
const highScoreDisplay = document.getElementById('high-score-display');

// Check the user entered word
async function checkWord(word) {
  const apiKey = 'pyz0lgq908s17d2fi66rvv0uqpt9tudk5nkolpcthba0n9gma'; // replace with your API key
  const response = await fetch(`https://api.wordnik.com/v4/word.json/${word}/definitions?limit=1&includeRelated=false&useCanonical=false&includeTags=false&api_key=${apiKey}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      return false; // Wordnik couldn't find the word, so we treat it as invalid
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } else {
    const data = await response.json();
    return data.length > 0; // if the word has a definition, it's a real word
  }
}

// Generate random letters
function generateLetters() {
  letters = [];
  const letterFrequency = [
    'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 
    't', 't', 't', 't', 't', 't', 't', 't', 't', 
    'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 
    'o', 'o', 'o', 'o', 'o', 'o', 'o', 
    'i', 'i', 'i', 'i', 'i', 'i', 
    'n', 'n', 'n', 'n', 'n', 'n', 
    's', 's', 's', 's', 's', 
    'r', 'r', 'r', 'r', 
    'h', 'h', 'h', 
    'd', 'd', 'd', 
    'l', 'l', 
    'u', 'u', 
    'c', 'c', 
    'm', 'm', 
    'f', 'f', 
    'y', 'y', 
    'w', 'w', 
    'g', 'g', 
    'p', 'p', 
    'b', 'b', 
    'v', 'v', 
    'k', 'k', 
    'x', 'x', 
    'q', 'q', 
    'j', 'j', 
    'z', 'z' 
  ];

  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * letterFrequency.length);
    letters.push(letterFrequency[randomIndex]);
  }

  lettersDisplay.innerText = letters.join(' - ').toUpperCase();

  // Select a random state
  let randomIndex = Math.floor(Math.random() * states.length);
  let stateName = states[randomIndex]; // Select a random state

  if (lightTextStates.includes(stateName)) {
    lettersDisplay.style.color = '#ffffff'; // Set text color to white for these plates
  } else {
    lettersDisplay.style.color = '#000000'; // Set text color to black for all other plates
  }

  lettersDisplay.style.backgroundImage = `url('./img/${stateName}.png')`; // Update the background image path
  lettersDisplay.style.backgroundSize = "200px";
  lettersDisplay.style.backgroundRepeat = "no-repeat";
  lettersDisplay.style.backgroundPosition = "center";
}

// Validate the input
function validateInput(input) {
  const regex = new RegExp(`${letters[0]}.*${letters[1]}.*${letters[2]}`, 'i');
  return regex.test(input);
}

// Show a notification with a given message
function showNotification(message, type = '') {
  notification.innerText = message;
  if (type === 'positive') {
    notification.classList.add('show-positive');
  } else {
    notification.classList.add('show-negative');
  }

  setTimeout(() => {
    notification.classList.remove('show-positive', 'show-negative');
  }, 2000);
}

// Start the timer
function startTimer() {
  intervalId = setInterval(() => {
    time--;
    timerDisplay.innerText = time;

    if (time <= 10) {
      timerDisplay.classList.add('time-warning'); // Add the class for the last 10 seconds
    }

    if (time <= 0) {
      clearInterval(intervalId);
      timerDisplay.classList.remove('time-warning'); // Remove the class when the game ends
      endGame();
    }
  }, 1000);
}


// Listen for the 'Enter' key
wordInput.addEventListener('keydown', async (event) => {
  if (event.key === 'Enter') {
    event.preventDefault(); // Prevent form submission

    const word = wordInput.value.toLowerCase();
    
    if (enteredWords.has(word)) {
      showNotification('Already found');
    } else if (validateInput(word)) {
      const isRealWord = await checkWord(word);

      if (isRealWord) {
        enteredWords.add(word);
        score += word.length;
        scoreDisplay.innerText = `Score: ${score}`;

        // Display the congratulatory message
        const message = getCongratsMessage(word.length);
        showNotification(message, 'positive');
      } else {
        showNotification("That's not a word!");
      }
    } else {
      showNotification('Not a match! Try again!');
    }

    wordInput.value = ''; // Clear the input field regardless of the validity of the word
  }
});


// Start the game
async function startGame() {
  clearInterval(intervalId); // Clear the previous interval
  time = 60;
  score = 0;
  enteredWords.clear(); // Clear the set of entered words
  wordInput.value = '';
  notification.innerText = ''; // Clear the notification
  scoreDisplay.innerText = `Score: ${score}`;
  wordsDisplay.innerText = '';
  generateLetters();
  startTimer();
  wordInput.disabled = false; // Enable input field
  wordInput.focus(); // Set focus on the input field
  startButton.innerText = 'Restart Game'; // Change button text
  
  // Update high score display at the start of each game
  highScoreDisplay.innerText = `High Score: ${highScore}`;
}


// End the game
function endGame() {
  wordInput.disabled = true; // Disable input field

  // Calculate the number of found words
  const foundWords = enteredWords.size;

  // Update the high score if necessary
  if (score > highScore) {
    highScore = score;
    // Update high score display
    highScoreDisplay.innerText = `High Score: ${highScore}`;
  }

  // Display the score and a summary of the words
  scoreDisplay.innerText = `Score: ${score}`;
  if (foundWords === 0) {
    wordsDisplay.innerText = 'You found no words this time. Better luck next round!';
  } else {
    wordsDisplay.innerText = `You found ${foundWords} words!`;
  }
}





// Generate a congratulatory message
function getCongratsMessage(wordLength) {
  if (wordLength <= 4) {
    return 'Nice!';
  } else if (wordLength <= 7) {
    return 'Great!';
  } else if (wordLength <= 10) {
    return 'Awesome!';
  } else {
    return 'Spectacular!';
  }
}

// Listen for the button click to start the game
startButton.addEventListener('click', startGame);
