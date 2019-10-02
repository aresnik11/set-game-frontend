const body = document.querySelector('body')
const container = document.querySelector('.container')
const menu = document.querySelector('.menu')
const options = document.querySelector('.options')
const board = document.querySelector('.board')
const rulesModal = document.querySelector('.my-modal.rules')
const scoresModal = document.querySelector('.my-modal.scores')
const gameOverModal = document.querySelector('.my-modal.game-over')
let shuffledCards = []
let selectedCounter = 0

rulesModal.addEventListener('click', function(e) {
    rulesModal.style.display = "none"
})

scoresModal.addEventListener('click', function(e) {
    scoresModal.style.display = "none"
})

gameOverModal.addEventListener('click', function(e) {
    gameOverModal.style.display = "none"
})

//create new game on click of the new game button
document.addEventListener('click', function(e) {
    if (e.target.dataset.action === "create") {
        fetch("http://localhost:3000/api/v1/games", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                score: 0,
                status: "in progress"
            })
        })
        .then(function(response) {
            return response.json()
        })
        .then(function(game) {
            //reset board and options, if there already was a board
            board.innerHTML = ""
            options.innerHTML = ""
            selectedCounter = 0
            //initialize the game
            initializeGame(game)
        })
    }
    else if (e.target.dataset.action === "rules") {
        rulesModal.style.display = "block"
    }
    else if (e.target.dataset.action === "scores") {
        scoresModal.style.display = "block"
    }
})

//sets up initial board and game, fetches cards from DB
function initializeGame(game) {
    fetch("http://localhost:3000/api/v1/cards")
    .then(function(response) {
        return response.json()
    })
    .then(function(cards) {
        // for (let i=0; i<12; i++) {
        //     shuffledCards.push(cards[i])
        // }
        shuffleCards(cards)
        renderOptions()
        renderInitialCards(shuffledCards)
        removeCards(12)
    })
}

//randomly shuffles the cards
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

//adds a single card to the window with all of the card attributes
function renderSingleCard(card) {
    let svg = svgBuilder(card)
    board.insertAdjacentHTML("beforeend",
    `<div class="card ${card.number} ${card.color} ${card.shape} ${card.fill}" data-id="${card.id}" data-number="${card.number}" data-color="${card.color}" data-shape="${card.shape}" data-fill="${card.fill}">
        <div class="shapes">${svg}</div>
    </div>`)
}

//adds no set button and card count after board has been created
function renderOptions() {
    options.insertAdjacentHTML("beforeend", `<button data-action="noset" class="ui secondary button">No Set</button>`)
    options.insertAdjacentHTML("beforeend", `<div id="cardnum">Cards Left: ${shuffledCards.length}</div>`)
}

//removes dealt cards from the shuffled deck and updates card count displayed
function removeCards(numCards) {
    shuffledCards.splice(0, numCards)
    const cardNum = options.querySelector("#cardnum")
    cardNum.innerText = "Cards Left: " + shuffledCards.length
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
                    console.log("YES! That is a set")
                    swapCards(selectedCards)
                }
                //if it isn't a set, unselect those cards
                else {
                    console.log("Try again")
                    //slow down removing selected, so the third card spins if we don't have a set
                    setTimeout(function() {
                        selectedCards.forEach(function(card) {
                            removeSelected(card)
                        })
                    }, 800)
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
        if (shuffledCards.length) {
            newCard = shuffledCards[0]
            removeCards(1)
            swapCard(card, newCard)
        }
        else {
            card.remove()
            const boardCards = board.querySelectorAll('.card')
            setTimeout(function() {
                if (!boardCards.length) {
                    gameOverModal.querySelector('p').innerText = "No cards left!"
                    gameOverModal.style.display = "block"
                }
            }, 500)

        }
    })
}

//changes innerHTML, classes, and dataset information on the card we are swapping out
function swapCard(card, newCard) {
    card.querySelector(".shapes").innerHTML = svgBuilder(newCard)
    card.classList = `card ${newCard.number} ${newCard.color} ${newCard.shape} ${newCard.fill}`
    card.dataset.id = `${newCard.id}`
    card.dataset.number = `${newCard.number}`
    card.dataset.color = `${newCard.color}`
    card.dataset.shape = `${newCard.shape}`
    card.dataset.fill = `${newCard.fill}`
}

// function getThreeCardsAttributes(selectedCards) {
//     const numberArr = []
//     const colorArr = []
//     const shapeArr = []
//     const fillArr = []

//     selectedCards.forEach(function(card) {
//         numberArr.push(card.dataset.number)
//         colorArr.push(card.dataset.color)
//         shapeArr.push(card.dataset.shape)
//         fillArr.push(card.dataset.fill)
//     })
// }

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
            console.log("there is a set on the board")
        }
        //if there is not a set on the board, reshuffle the cards
        else {
            if (shuffledCards.length) {
                console.log("you're right! reshuffling...")
                reshuffleAndRerender(cardsOnBoard)
            }
            else {
                console.log("no cards left, GAME OVER")
                gameOverModal.querySelector('p').innerText = "There are no more sets and no more cards in the deck"
                gameOverModal.style.display = "block"
            }
        }
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
        const currentDeck = shuffledCards
        shuffleCards(currentDeck)
        board.innerHTML = ""
        selectedCounter = 0
        renderInitialCards(shuffledCards)
        removeCards(12)
    })
}

//fetches card from DB given data-id on div and returns the promise
function fetchCard(card) {
    return fetch(`http://localhost:3000/api/v1/cards/${card.dataset.id}`)
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