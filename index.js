const container = document.querySelector('.container')
const menu = document.querySelector('.menu')
const options = document.querySelector('.options')
const timerContainer = options.querySelector('#timer')
const cardNum = options.querySelector('#cardnum')
const login = document.querySelector('.login')
const loginForm = login.querySelector('form')
const board = document.querySelector('.board')
const rulesModal = document.querySelector('.my-modal.rules')
const scoresModal = document.querySelector('.my-modal.scores')
const gameOverModal = document.querySelector('.my-modal.game-over')
let shuffledCards = []
let selectedCounter = 0
let timer;
let currentUser;

//listen for submits on "login" form and create a new user with the name they provided
loginForm.addEventListener('submit', function(e) {
    e.preventDefault()
    const name = e.target.name.value
    createUser(name)
})

//create new user with provided name and save new user to currentUser variable to be used later
//replace login form with welcome message
function createUser(name) {
    fetch(`https://set-backend.herokuapp.com/api/v1/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            name: name,
        })
    })
    .then(function(response) {
        return response.json()
    })
    .then(function(user) {
        currentUser = user
        login.innerHTML =
            `<h1>Welcome ${currentUser.name}</h1>
            <h3>To play, click New Game</h3>`
    })
}

//create new game on click of the new game button
document.addEventListener('click', function(e) {
    //only create a new game on click of new game when user exists
    if (e.target.dataset.action === "create" && currentUser) {
        if (gameOverModal.style.display = "block") {
            gameOverModal.style.display = "none"
        }
        createGame()
    }
    //if someone clicks new game and user does not exist, prompt them to log in
    else if (e.target.dataset.action === "create" && !currentUser) {
        if (!login.querySelector('h3')) {
            login.insertAdjacentHTML("afterbegin",
            `<h3>Please enter your name to play</h3>`)
        }
    }
    //shows rules modal if you click on the rules menu option
    else if (e.target.dataset.action === "rules") {
        rulesModal.style.display = "block"
    }
    //shows scores modal if you click on the scores menu option
    else if (e.target.dataset.action === "scores") {
        fetchGames()
    }
})

//creates a new game in the DB and starts setting it up on the frontend
function createGame() {
    fetch("https://set-backend.herokuapp.com/api/v1/games", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            score: 0,
            status: "in progress",
            user_id: parseInt(currentUser.id)
        })
    })
    .then(function(response) {
        return response.json()
    })
    .then(function(game) {
        login.innerHTML = ""
        resetBoard()
        initializeGame(game)
    })
}

//closes any of the modals if you click anywhere on the screen (modal becomes the whole screen) or the x-button
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('my-modal')) {
        e.target.style.display = "none"
    }
    else if (e.target.classList.contains('close')) {
        e.target.closest('.my-modal').style.display = "none"
    }
})

//resets the board, timer, and all options
function resetBoard() {
    board.innerHTML = ""
    board.classList.remove("fadeout")
    timerContainer.innerHTML = ""
    clearInterval(timer)
    cardNum.innerHTML = ""
    selectedCounter = 0
}

//sets up initial board and game, fetches cards from DB
function initializeGame(game) {
    fetch("https://set-backend.herokuapp.com/api/v1/cards")
    .then(function(response) {
        return response.json()
    })
    .then(function(cards) {
        board.dataset.id = game.id
        shuffleCards(cards)
        renderTimer()
        renderOptions()
        renderInitialCards(shuffledCards)
        removeCards(12)
        startTimer()
    })
}

//randomly shuffles the cards and stores them in the shuffled cards array
function shuffleCards(cards) {
    shuffledCards = []
    while (cards.length) {
        let randomNumber = Math.floor(Math.random() * cards.length)
        shuffledCards.push(cards[randomNumber])
        cards.splice(randomNumber, 1)
    }
}

//renders 12 cards to the window
function renderInitialCards(cards) {
    for (let i=0; i<12; i++) {
        renderSingleCard(cards[i])
    }
}

//adds a single card to the window with all of the card attributes
function renderSingleCard(card) {
    let svg = svgBuilder(card)
    board.insertAdjacentHTML("beforeend",
    `<div class="card ${card.number} ${card.color} ${card.shape} ${card.fill}" data-id="${card.id}" data-number="${card.number}" data-color="${card.color}" data-shape="${card.shape}" data-fill="${card.fill}">
        <div class="shapes">${svg}</div>
    </div>`)
}

//builds card images
function svgBuilder(card) {
    let svg = ""
    let num
    if (card.number === "one") {
        num = 1
    }
    else if (card.number === "two") {
        num = 2
    }
    else if (card.number === "three") {
        num = 3
    }

    for (let i = 0; i < num; i++) {
        svg += `<img src="./assets/${card.color}-${card.fill}-${card.shape}.svg">`
    }
    return svg
}

//adds timer and pause button after board has been created
function renderTimer() {
    timerContainer.insertAdjacentHTML("beforeend",
    `<div class="ui statistic">
        <div class="value">
            0
        </div>
        <div class="label">
            Time Elapsed
        </div>
    </div>
    <button data-action="pause" class="ui secondary button">
        <i class="pause icon"></i>
        Pause
    </button>`)
}

//adds no set button and card count after board has been created
function renderOptions() {
    cardNum.insertAdjacentHTML("beforeend",
    `<div class="ui statistic">
        <div class="value">
            ${shuffledCards.length}
        </div>
        <div class="label">
            Cards Left
        </div>
    </div>
    <button data-action="noset" class="ui secondary button">
        No Set
    </button>`)
}

//removes dealt cards from the shuffled deck and updates card count displayed
function removeCards(numCards) {
    shuffledCards.splice(0, numCards)
    cardNum.querySelector(".value").innerText = shuffledCards.length
}

//starts the clock and increments the timer every second
function startTimer() {
    timer = setInterval(function() {
        let current = timerContainer.querySelector(".value")
        current.innerText = parseInt(current.innerText) + 1
    },1000)
}

//fetch games from DB - only sending top 10 scores
function fetchGames() {
    fetch("https://set-backend.herokuapp.com/api/v1/games")
    .then(function(response) {
        return response.json()
    })
    .then(function(games) {
        renderHighScores(games)
    })
}

//shows the scores modal, resets scores, renders score for each game we got back
function renderHighScores(games) {
    scoresModal.style.display = "block"
    scoresModal.querySelector('ol').innerHTML = ""
    games.forEach(function(game) {
        renderHighScore(game)
    })
}

//renders game score and adds to the scores ul as an li
//have access to game.user.name since passing in user along with game in the backend
function renderHighScore(game) {
        scoresModal.querySelector('ol').insertAdjacentHTML("beforeend",
        `<br><li>${game.user.name} - ${game.score} seconds</li>`)
}

//listens for clicks on the board
board.addEventListener("click", function(e) {
    if (e.target.closest('.card')) {
        //if it already was selected, remove the border so it is no longer selected
        if (e.target.closest('.card').classList.contains("selected")) {
            removeSelected(e.target.closest('.card'))
        }
        //if a card is clicked, show it as selected with a border
        else {
            addSelected(e.target.closest('.card'))
            //if we selected 3 cards, check if they make a set
            if (selectedCounter === 3) {
                const selectedCards = board.querySelectorAll('.card.selected')
                //if it is a set, swap out the cards and show new ones
                if (checkForSet(selectedCards)) {
                    //slow down adding 'fadeout' class so third card spins before the cards fade
                    setTimeout(function() {
                        selectedCards.forEach(function(card) {
                            card.classList.add("fadeout")
                        })
                    },700)
                    //slow down swapping out cards
                    setTimeout(function() {
                        swapCards(selectedCards)
                    },1200)
                }
                //if it isn't a set, unselect those cards
                else {
                    //slow down adding "wrong" class so third card spins before they bounce in red
                    setTimeout(function() {
                        selectedCards.forEach(function(card) {
                            card.classList.add("wrong")
                        })
                    },700)
                    //slow down removing selected, so the third card spins back if we don't have a set
                    setTimeout(function() {
                        selectedCards.forEach(function(card) {
                            card.classList.remove("wrong")
                            removeSelected(card)
                        })
                    },1200)
                }
            }
        }
    }
})

//add a selected class to a card (adds a border) and increment counter
function addSelected(element) {
    element.classList.add("selected")
    element.classList.remove("unselected")
    selectedCounter++
}

//removes a selected class to a card (removes a border) and decrement counter
function removeSelected(element) {
    element.classList.remove("selected")
    element.classList.add("unselected")
    selectedCounter--
}

//swaps out card info for a specific number of cards based on new cards from the shuffled deck
function swapCards(selectedCards) {
    selectedCards.forEach(function(card) {
        removeSelected(card)
        //if there are still cards to be dealt in the deck, deal a new card and swap it with the one from the set
        if (shuffledCards.length) {
            newCard = shuffledCards[0]
            removeCards(1)
            swapCard(card, newCard)
            setTimeout(function() {
                    card.classList.remove("fadein")
            },1200)
        }
        //if there aren't any more cards in the deck, just remove the cards that made a set
        else {
            card.remove()
            const boardCards = board.querySelectorAll('.card')
            setTimeout(function() {
                //if there aren't any more cards on the board, game is over.
                if (!boardCards.length) {
                    gameOver("No cards left!")
                }
            },500)
        }
    })
}

//changes innerHTML, classes, and dataset information on the card we are swapping out
function swapCard(card, newCard) {
    card.querySelector(".shapes").innerHTML = svgBuilder(newCard)
    card.classList = `card ${newCard.number} ${newCard.color} ${newCard.shape} ${newCard.fill} fadein`
    card.dataset.id = `${newCard.id}`
    card.dataset.number = `${newCard.number}`
    card.dataset.color = `${newCard.color}`
    card.dataset.shape = `${newCard.shape}`
    card.dataset.fill = `${newCard.fill}`
}

//show modal prompting user to start a new game, stops timer and removes pause/play button
//update game status and score in the DB
function gameOver(text) {
    gameOverModal.querySelector('p').innerText = text
    gameOverModal.style.display = "block"
    clearInterval(timer)
    timerContainer.querySelector('button').remove()

    const score = parseInt(timerContainer.querySelector(".value").innerText)
    updateGame(score)
}

//send a patch request to a specific game, updating status to completed and the score as their time
function updateGame(score) {
    fetch(`https://set-backend.herokuapp.com/api/v1/games/${board.dataset.id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            score: score,
            status: "completed"
        })
    })
}

//gets attributes from the 3 selected cards and groups them
//if they are all the same or all different for every attribute, return true (it is a set)
//otherwise, return false
function checkForSet(selectedCards) {
    const numberArr = []
    const colorArr = []
    const shapeArr = []
    const fillArr = []

    let numberSatisfied = false
    let colorSatisfied = false
    let shapeSatisfied = false
    let fillSatisfied = false

    selectedCards.forEach(function(card) {
        numberArr.push(card.dataset.number)
        colorArr.push(card.dataset.color)
        shapeArr.push(card.dataset.shape)
        fillArr.push(card.dataset.fill)
    })

    if (allTheSame(numberArr)) {
        numberSatisfied = true
    }
    else if (allTheDifferent(numberArr)) {
        numberSatisfied = true
    }

    if (allTheSame(colorArr)) {
        colorSatisfied = true
    }
    else if (allTheDifferent(colorArr)) {
        colorSatisfied = true
    }

    if (allTheSame(shapeArr)) {
        shapeSatisfied = true
    }
    else if (allTheDifferent(shapeArr)) {
        shapeSatisfied = true
    }

    if (allTheSame(fillArr)) {
        fillSatisfied = true
    }
    else if (allTheDifferent(fillArr)) {
        fillSatisfied = true
    }

    if (numberSatisfied === true && colorSatisfied === true && shapeSatisfied === true && fillSatisfied === true) {
        return true
    }
    else {
        return false
    }
}

//checks if all elements within an array are the same
function allTheSame(array) {
    let propertyName = array[0]
    for (let i = 1; i < 3; i++) {
        if (array[i] != propertyName) {
            return false
        }
    }
    return true
}

//checks if all elements within an array are different
function allTheDifferent(array) {
    if (array[0] != array[1] && array[0] != array[2] && array[1] != array[2]) {
        return true
    }
    return false
}

//listens for clicks on everything in the options div
options.addEventListener("click", function(e) {
    //if no set button was clicked, check if there is a set on the board
    if (e.target.dataset.action === "noset") {
        const cardsOnBoard = board.querySelectorAll('.card')
        //if there is a set, alert the user
        if (checkForSetOnBoard(cardsOnBoard)) {
            cardsOnBoard.forEach(function(card) {
                card.classList.add("wrong")
            })
            //slow down removing 'wrong', so the cards bounce
            setTimeout(function() {
                cardsOnBoard.forEach(function(card) {
                    card.classList.remove("wrong")
                })
            },500)
        }
        //if there is not a set on the board
        else {
            //if there are still cards in the deck, reshuffle the cards including the ones on the board and rerender the board
            if (shuffledCards.length) {
                    cardsOnBoard.forEach(function(card) {
                        card.classList.add("fadeout")
                    })
                setTimeout(function() {
                    reshuffleAndRerender(cardsOnBoard)
                }, 1000)
            }
            //if there aren't any cards left in the deck, game is over
            else {
                gameOver("There are no more sets and no more cards in the deck.")
            }
        }
    }
    //if pause button was clicked, stop the timer, change button to play button, fade the board out
    else if (e.target.dataset.action === "pause") {
        clearInterval(timer)
        e.target.dataset.action = "play"
        e.target.innerHTML = "<i class='play icon'></i>Play"
        board.classList.remove("fadein")
        board.classList.add("fadeout")
    }
    //if play button was clicked, start the timer, change button to pause button, fade in the board
    else if (e.target.dataset.action === "play") {
        startTimer()
        e.target.dataset.action = "pause"
        e.target.innerHTML = "<i class='pause icon'></i>Pause"
        board.classList.remove("fadeout")
        board.classList.add("fadein")
    }
    //if any letters of the logo are clicked, add class to make them spin
    else if (e.target.parentElement.id === "logo") {
        e.target.classList.add("spin")
        setTimeout(function() {
            e.target.classList.remove("spin")
        },900)
    }
})

//calls fetchCard on an array of cards (ones that are currently on the board)
//uses Promise.all to collect all of the promises and then when they are all done
//add cards on board to shuffledCards array, reshuffle, and repopulate board with cards
function reshuffleAndRerender(cards) {
    const promises = []
    cards.forEach(function(card) {
        promises.push(fetchCard(card))
    })     
    
    Promise.all(promises).then(function(newCards) {
        newCards.forEach(function(newCard) {
            shuffledCards.push(newCard)
        })
        shuffleCards(shuffledCards)
        board.innerHTML = ""
        selectedCounter = 0
        renderInitialCards(shuffledCards)
        removeCards(12)
    })
}

//fetches card from DB given data-id on div and returns the promise
function fetchCard(card) {
    return fetch(`https://set-backend.herokuapp.com/api/v1/cards/${card.dataset.id}`)
    .then(function(response) {
        return response.json()
    })
}

//finds all combinations of 3 cards and checks if any of them are a set
function checkForSetOnBoard(cards) {
    let combos = k_combinations(cards, 3)
    for (let i=0; i<combos.length; i++) {
        if (checkForSet(combos[i])) {
            return true
        }
    }
}

//function from: https://gist.github.com/axelpale/3118596
//finds all combinations of k size within the given set
function k_combinations(set, k) {
    //borrowing slice method from the Array prototype
    NodeList.prototype.slice = Array.prototype.slice

	var i, j, combs, head, tailcombs;
	
	// There is no way to take e.g. sets of 5 elements from
	// a set of 4.
	if (k > set.length || k <= 0) {
		return [];
	}
	
	// K-sized set has only one K-sized subset.
	if (k == set.length) {
		return [set];
	}
	
	// There is N 1-sized subsets in a N-sized set.
	if (k == 1) {
		combs = [];
		for (i = 0; i < set.length; i++) {
			combs.push([set[i]]);
		}
		return combs;
	}
	
	// Assert {1 < k < set.length}
	
	// Algorithm description:
	// To get k-combinations of a set, we want to join each element
	// with all (k-1)-combinations of the other elements. The set of
	// these k-sized sets would be the desired result. However, as we
	// represent sets with lists, we need to take duplicates into
	// account. To avoid producing duplicates and also unnecessary
	// computing, we use the following approach: each element i
	// divides the list into three: the preceding elements, the
	// current element i, and the subsequent elements. For the first
	// element, the list of preceding elements is empty. For element i,
	// we compute the (k-1)-computations of the subsequent elements,
	// join each with the element i, and store the joined to the set of
	// computed k-combinations. We do not need to take the preceding
	// elements into account, because they have already been the i:th
	// element so they are already computed and stored. When the length
	// of the subsequent list drops below (k-1), we cannot find any
	// (k-1)-combs, hence the upper limit for the iteration:
	combs = [];
	for (i = 0; i < set.length - k + 1; i++) {
		// head is a list that includes only our current element.
		head = set.slice(i, i + 1);
		// We take smaller combinations from the subsequent elements
		tailcombs = k_combinations(set.slice(i + 1), k - 1);
		// For each (k-1)-combination we join it with the current
		// and store it to the set of k-combinations.
		for (j = 0; j < tailcombs.length; j++) {
			combs.push(head.concat(tailcombs[j]));
		}
	}
	return combs;
}