document.addEventListener("DOMContentLoaded", function () {
    const startScreen = document.getElementById("start-screen");
    const playGameBtn = document.getElementById("play-game-btn");
    const bestTimeGame = document.getElementById("lowest-attempts-game");
    const gridContainer = document.getElementById("grid-container");
    const counterElement = document.getElementById("counter");
    const highscoreElement = document.getElementById("lowest-attempts-game").querySelector("#highscore");
    let endScreen = document.getElementById("end-screen");
    let playAgainBtn = document.getElementById("play-again-btn");

    let flippedCardIds = [];
    let flippedCardElements = [];
    let numOfFlippedCards = 0;
    let totalMatches = 0;
    let counter = 0;

    // Read the high score from localStorage on page load
    const highScore = parseInt(localStorage.getItem('highScore')) || 0;
    highscoreElement.innerText = highScore;

    const clearBestTimeBtn = document.getElementById("clear-lowest-attempts-btn");

    clearBestTimeBtn.addEventListener("click", function () {
        // Clear the best time from localStorage and update the UI
        localStorage.removeItem('highScore');
        highscoreElement.innerText = 'Lowest Attempts: 0';
        bestTimeGame.innerText = 'Lowest Attempts: 0';
    });

    function startGame() {
        startScreen.style.display = "none";
        gridContainer.style.display = "grid";

        // Reset game state
        flippedCardIds = [];
        flippedCardElements = [];
        numOfFlippedCards = 0;
        totalMatches = 0;
        counter = 0;
        counterElement.innerText = "Attempts: " + counter;

    }

    function showEndScreen() {
        // Display the end screen
        endScreen.style.display = "flex";

        // Reference the end-highscore-span element
        let endHighscoreSpan = document.getElementById("end-highscore-span");

        // Update the best time on the end screen
        const currentHighScore = parseInt(localStorage.getItem('highScore')) || 0;
        endHighscoreSpan.innerText = currentHighScore;
    }

    function restartGame() {
        window.location.reload();
    }

    playAgainBtn.addEventListener("click", restartGame);

    playGameBtn.addEventListener("click", startGame);

    function countMatchedCards() {
        const matchedCards = document.querySelectorAll('.card.matched');
        return matchedCards.length;
    }

    function updateTotalMatches() {
        totalMatches = countMatchedCards();
    }

    function updateHighScore() {
        const currentHighScore = parseInt(localStorage.getItem('highScore')) || 0;
    
        if (currentHighScore === 0 || counter < currentHighScore) {
            localStorage.setItem('highScore', counter);
            highscoreElement.innerText = "Lowest Attempts" + counter;
            bestTimeGame.innerText = "Lowest Attempts" + counter;
        }
    }

    function checkWin() {
        if (totalMatches === 52) {
    
            // Save the high score to local storage
            updateHighScore();
    
            // Update best time display for the game (if applicable)
            const currentHighScore = parseInt(localStorage.getItem('highScore')) || 0;
            bestTimeGame.innerText = "Lowest Attempts " + currentHighScore;
    
            showEndScreen();
        }
    }

    function increaseCounter() {
        counter++;
        counterElement.innerText = "Attempts: " + counter;
    }

    // This is used for debugging, paste maxMatches(); into the console to simulate a win.
    function maxMatches() {
        totalMatches = 52;
        console.log("Set maxMatches to 52");
        updateHighScore();

        checkWin();
    }

    // Attach maxMatches to the global object (window)
    window.maxMatches = maxMatches;

    // Fetch card definitions from JSON file
    fetch('cardDefinitions.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(cardDefinitions => {
            // Create a pool of unique cards
            const uniqueCardPool = createUniqueCardPool(cardDefinitions);

            // Shuffle the card pool
            const shuffledCardPool = shuffleArray(uniqueCardPool);

            // Define the number of squares for each row
            const rows = [4, 6, 8, 8, 8, 8, 6, 4];

            // Create the grid based on the specified number of squares in each row
            rows.forEach((numSquares) => {
                const row = document.createElement("div");
                row.classList.add("row");

                // Create cards for each square
                for (let i = 0; i < numSquares; i++) {
                    const randomCardDefinition = shuffledCardPool.pop();

                    const cardContainer = createCard(randomCardDefinition);
                    row.appendChild(cardContainer);

                    cardContainer.addEventListener("click", handleCardClick);
                }

                gridContainer.appendChild(row);
            });
        })
        .catch(error => console.error('Error loading card definitions:', error));

    function disableCardClicking() {
        gridContainer.style.pointerEvents = "none";
    }

    function enableCardClicking() {
        gridContainer.style.pointerEvents = "auto";
    }

    function handleCardClick() {
        if (numOfFlippedCards < 2) {
            const cardId = this.dataset.id;
    
            // Check if the clicked card is already flipped
            if (flippedCardIds.includes(cardId)) {
                return;
            }
    
            numOfFlippedCards++;
    
            const innerCard = this.querySelector(".inner-card");
            innerCard.style.transform = "rotateY(0deg)";
    
            flippedCardIds.push(cardId);
            flippedCardElements.push(this);
    
            if (numOfFlippedCards === 2) {
                disableCardClicking();
    
                if (checkMatch()) {
                    console.log('Matched!');
                    handleMatchedCards();
                } else {
                    console.log('Not matched!');
                    setTimeout(handleUnmatchedCards, 1000);
                }
    
                enableCardClicking();
            }
        }
    }
    
    
    function disableMatchedCardClicking() {
        const matchedCards = document.querySelectorAll('.card.matched');
        matchedCards.forEach(cardElement => {
            cardElement.removeEventListener("click", handleCardClick);
        });
    }
    
    

    function handleMatchedCards() {
        // Add the "isMatched" class to the matched cards for styling
        flippedCardElements.forEach(cardElement => {
            const frontImage = cardElement.querySelector(".front-card img");
            frontImage.classList.add("isMatched");
            cardElement.classList.add("matched");
        });
    
        updateTotalMatches();
    
        // Reset flipped card information
        flippedCardIds = [];
        flippedCardElements = [];
    
        disableMatchedCardClicking();
    
        // Allow the next flip only if no cards are currently flipped
        enableCardFlipping();

        increaseCounter();

        checkWin();
    }
    

    function handleUnmatchedCards() {
        // Reset flipped card information
        flippedCardElements.forEach(cardElement => {
            const innerCard = cardElement.querySelector(".inner-card");
            innerCard.style.transform = "rotateY(180deg)";

            // Add click event listener back after the transition is complete
            cardElement.addEventListener("click", handleCardClick);
        });

        // Reset flipped card information after a short delay
        setTimeout(() => {
            flippedCardIds = [];
            flippedCardElements = [];

            // Allow the next flip only if no cards are currently flipped
            enableCardFlipping();
        }, 500);

        increaseCounter();

        checkWin();
    }

    function checkMatch() {
        // Check if the flipped cards match based on number, face, and color
        const [id1, id2] = flippedCardIds;
        const [number1, suit1, color1] = getCardInfo(id1);
        const [number2, suit2, color2] = getCardInfo(id2);

        // Check if the numbers are equal or both are face cards
        if (
            (number1 === number2 && !isNaN(Number(number1))) ||
            (isNaN(Number(number1)) && isNaN(Number(number2)) && number1 === number2)
        ) {
            // Check if the suits match or if one is red and the other is black
            return (suit1 === suit2) && (color1 === color2) ||
                (color1 === 'red' && color2 === 'black') ||
                (color1 === 'black' && color2 === 'red');
        }

        return false;
    }

        
    function createUniqueCardPool(cardDefinitions) {
        const uniqueCardPool = [];
        const seenCardIds = new Set();

        cardDefinitions.forEach(cardDefinition => {
            // Ensure uniqueness by checking if the card ID has been seen before
            if (!seenCardIds.has(cardDefinition.id)) {
                uniqueCardPool.push(cardDefinition);
                seenCardIds.add(cardDefinition.id);
            }
        });

        return uniqueCardPool;
    }

    function shuffleArray(array) {
        // Fisher-Yates shuffle algorithm
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }

        return array;
    }

    function getCardInfo(cardId) {
        // Extract number and color from the card ID
        const number = cardId.slice(0, -1);
        const color = (cardId.slice(-1) === 'S' || cardId.slice(-1) === 'C') ? 'black' : 'red';
        return [number, color];
    }

    function enableCardFlipping() {
        // Reset the flipping variable to allow the next flip
        // This function is called only when there are no flipped cards
        numOfFlippedCards = 0;

        // Re-enable clicks on unmatched cards
        const unmatchedCards = document.querySelectorAll('.card:not(.matched)');
        unmatchedCards.forEach(cardElement => {
            cardElement.addEventListener("click", handleCardClick);
        });
    }
        

    function createCard(cardDefinition) {
        const cardContainer = document.createElement("div");
        cardContainer.classList.add("card");
        cardContainer.dataset.id = cardDefinition.id; // Set the data-id attribute

        const innerCard = document.createElement("div");
        innerCard.classList.add("inner-card");
        innerCard.style.transform = "rotateY(180deg)";

        const frontCard = document.createElement("div");
        frontCard.classList.add("front-card");

        const frontImage = document.createElement("img");
        frontImage.src = cardDefinition.imagePath;
        frontCard.appendChild(frontImage);

        // Remove the click event listener from the frontImage element
        frontImage.style.pointerEvents = "none";

        const backCard = document.createElement("div");
        backCard.classList.add("back-card");

        const backImage = document.createElement("img");
        backImage.src = "images/cardBack/greyback.png";
        backCard.appendChild(backImage);

        innerCard.appendChild(frontCard);
        innerCard.appendChild(backCard);
        cardContainer.appendChild(innerCard);

        return cardContainer;
    }
});
