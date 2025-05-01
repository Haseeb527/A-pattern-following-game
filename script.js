const tiles = document.querySelectorAll(".tile");
const startBtn = document.getElementById("start-btn");
const difficultySelect = document.getElementById("difficulty");
const scoreDisplay = document.getElementById("score");
const messageDisplay = document.getElementById("message");
const character = document.getElementById("character");
const backgroundMusic = document.getElementById("background-music");

let sequence = [];
let playerSequence = [];
let score = 0;
let isPlaying = false;
let isMusicPlaying = false;

// Sound effects
const sounds = {
    red: new Audio("https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3"),
    blue: new Audio("https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3"),
    green: new Audio("https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3"),
    yellow: new Audio("https://assets.mixkit.co/sfx/preview/mixkit-retro-arcade-casino-notification-211.mp3"),
    win: new Audio("https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3"),
    lose: new Audio("https://assets.mixkit.co/sfx/preview/mixkit-retro-arcade-lose-2027.mp3"),
    correct: new Audio("https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3"),
    complete: new Audio("https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3")
};

// Character reactions
const characterReactions = {
    happy: ["😊", "😄", "🎉", "👏", "🐶", "🐱"],
    sad: ["😢", "😭", "🙁", "🐼", "🦊"]
};

// Play sequence of sounds for correct pattern
function playSuccessSounds() {
    // Play individual correct sounds first
    sounds.correct.play();
    
    // Then play the complete sequence sound after a delay
    setTimeout(() => {
        sounds.complete.play();
    }, 500);
}

// Highlight a tile with animation
function highlightTile(tile) {
    tile.classList.add("glow");
    playSound(tile.dataset.color);
    
    // Make emoji bounce
    const emoji = tile.querySelector(".emoji");
    emoji.style.transform = "scale(1.3)";
    
    setTimeout(() => {
        tile.classList.remove("glow");
        emoji.style.transform = "scale(1)";
    }, 500);
}

// Play sound
function playSound(color) {
    sounds[color].currentTime = 0;
    sounds[color].play();
}

// Generate a random sequence
function generateSequence(length) {
    sequence = [];
    for (let i = 0; i < length; i++) {
        const randomTile = tiles[Math.floor(Math.random() * tiles.length)];
        sequence.push(randomTile.dataset.color);
    }
}

// Play the sequence for the player
function playSequence() {
    let i = 0;
    const interval = setInterval(() => {
        const tile = document.querySelector(`[data-color="${sequence[i]}"]`);
        highlightTile(tile);
        i++;
        if (i >= sequence.length) {
            clearInterval(interval);
            isPlaying = true;
            updateCharacter("happy");
            messageDisplay.textContent = "Your turn! Repeat the pattern!";
            messageDisplay.classList.add("animate__bounce");
        }
    }, 1000);
}

// Check player's input
function checkInput(tile) {
    if (!isPlaying) return;
    
    const selectedColor = tile.dataset.color;
    playerSequence.push(selectedColor);
    highlightTile(tile);
    
    // Check if the sequence matches
    if (playerSequence[playerSequence.length - 1] !== sequence[playerSequence.length - 1]) {
        endGame(false);
        return;
    }
    
    // Play correct sound for each correct step
    playSound(selectedColor);
    
    // If sequence is complete
    if (playerSequence.length === sequence.length) {
        score++;
        scoreDisplay.textContent = score;
        playSuccessSounds(); // Play special success sounds
        messageDisplay.textContent = "Great job! Get ready for the next round...";
        messageDisplay.classList.add("animate__tada");
        setTimeout(() => {
            nextRound();
        }, 1500);
    }
}

// Move to the next round
function nextRound() {
    playerSequence = [];
    isPlaying = false;
    const difficulty = parseInt(difficultySelect.value);
    generateSequence(difficulty + Math.floor(score / 2)); // Increase difficulty as score goes up
    
    messageDisplay.classList.remove("animate__tada", "animate__bounce");
    messageDisplay.textContent = "Watch carefully...";
    
    setTimeout(() => {
        playSequence();
    }, 1000);
}

// End the game
function endGame(win) {
    isPlaying = false;
    sounds.lose.play();
    updateCharacter("sad");
    
    if (!win) {
        messageDisplay.textContent = `Game Over! Your score was ${score}. Try again!`;
        messageDisplay.classList.add("animate__shakeX");
        sequence = [];
        playerSequence = [];
        score = 0;
        scoreDisplay.textContent = score;
    }
}

// Update character reaction
function updateCharacter(mood) {
    character.classList.add("animate__bounce");
    setTimeout(() => {
        character.classList.remove("animate__bounce");
    }, 1000);
    
    if (mood === "happy") {
        const randomHappy = Math.floor(Math.random() * characterReactions.happy.length);
        character.textContent = characterReactions.happy[randomHappy];
    } else {
        const randomSad = Math.floor(Math.random() * characterReactions.sad.length);
        character.textContent = characterReactions.sad[randomSad];
    }
}

// Toggle background music
function toggleMusic() {
    if (isMusicPlaying) {
        backgroundMusic.pause();
        isMusicPlaying = false;
    } else {
        backgroundMusic.volume = 0.3;
        backgroundMusic.play();
        isMusicPlaying = true;
    }
}

// Event Listeners
startBtn.addEventListener("click", () => {
    if (sequence.length === 0) {
        toggleMusic();
        const difficulty = parseInt(difficultySelect.value);
        generateSequence(difficulty);
        messageDisplay.textContent = "Watch the pattern carefully...";
        setTimeout(() => {
            playSequence();
        }, 1000);
    }
});

tiles.forEach(tile => {
    tile.addEventListener("click", () => checkInput(tile));
});

// Add music toggle on click anywhere
document.body.addEventListener("click", () => {
    if (!isMusicPlaying && sequence.length > 0) {
        toggleMusic();
    }
});

// Reset message animations when they end
messageDisplay.addEventListener("animationend", () => {
    messageDisplay.classList.remove("animate__tada", "animate__bounce", "animate__shakeX");
});