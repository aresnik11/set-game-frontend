const container = document.querySelector('#container')
const board = document.querySelector('#board')
const options = document.querySelector('#options')
const shuffledCards = []
let selectedCounter = 0

//create new game on click of the new game button
container.addEventListener('click', function(e) {
    if (e.target.dataset.action == "create") {
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
})

//sets up initial board and game, fetches cards from DB
function initializeGame(game) {
    fetch("http://localhost:3000/api/v1/cards")
    .then(function(response) {
        return response.json()
    })
    .then(function(cards) {
        shuffleCards(cards)
        renderInitialCards(shuffledCards)
        renderNoSetButton()
        removeCards(12)
    })
}

//randomly shuffles the cards
function shuffleCards(cards) {
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
    const svg = svgBuilder(card)
    board.insertAdjacentHTML("beforeend",
    `<div class="card ${card.number} ${card.color} ${card.shape} ${card.fill}" data-id="${card.id}" data-number="${card.number}" data-color="${card.color}" data-shape="${card.shape}" data-fill="${card.fill}">
        ${svg}
    </div>`)
}

//adds no set button after board has been created
function renderNoSetButton() {
    options.insertAdjacentHTML("beforeend", `<button data-action="noset">No Set</button>`)
}

//removes dealt cards from the shuffled deck
function removeCards(numCards) {
    shuffledCards.splice(0, numCards)
}

//listens for clicks on the board
board.addEventListener("click", function(e) {
    if (e.target.classList.contains("card")) {
        //if a card is clicked, show it as selected with a border
        if (e.target.classList.contains("selected")) {
            removeSelected(e.target)
        }
        //if it already was selected, remove the border so it is no longer selected
        else {
            addSelected(e.target)
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
                    selectedCards.forEach(function(card) {
                        removeSelected(card)
                    })
                }
            }
        }
    }
})

//add a selected class to a card (adds a border) and increment counter
function addSelected(element) {
    element.classList.add("selected")
    selectedCounter++
}

//removes a selected class to a card (removes a border) and decrement counter
function removeSelected(element) {
    element.classList.remove("selected")
    selectedCounter--
}

//swaps out card info for a specific number of cards based on new cards from the shuffled deck
function swapCards(selectedCards) {
    selectedCards.forEach(function(card) {
        removeSelected(card)
        newCard = shuffledCards[0]
        removeCards(1)
        swapCard(card, newCard)
    })
}

//changes innerHTML, classes, and dataset information on the card we are swapping out
function swapCard(card, newCard) {
    card.innerHTML = 
    `Card: ${newCard.id}
    <br>
    Number: ${newCard.number}
    <br>
    Color: ${newCard.color}
    <br>
    Shape: ${newCard.shape}
    <br>
    Fill: ${newCard.fill}`
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

function svgBuilder(card) {
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

    let opacity
    if (card.fill === "full") {
        opacity = "fill-opacity='100'"
    }
    else if(card.fill === "half") {
        opacity = "fill-opacity='0.1'"
    }
    else if(card.fill === "none") {
        opacity = "fill-opacity='0'"
    }

    let svg = ""
    for (let i = 0; i < num; i++) {
        svg += `<svg height="50" width="50">`
        if (card.shape === "circle") {
            svg += `<circle cy="25" cx="25" r="25" stroke="${card.color}" stroke-width="3" fill="${card.color}" ${opacity} />`
        }
        else if (card.shape === "square") {
            svg += `<rect width="50" height="50" stroke="${card.color}" stroke-width="3" fill="${card.color}" ${opacity} />`
        }
        else if (card.shape === "triangle") {
            svg += `<polygon points="25,0 0,50 50,50" stroke="${card.color}" stroke-width="3" fill="${card.color}" ${opacity} />`
        }
        svg += "</svg>"
    }
    return svg
//listens for clicks on everything in the options div
options.addEventListener("click", function(e) {
    //if no set button was clicked, check if there is a set on the board
    if (e.target.dataset.action === "noset") {
        const cardsOnBoard = board.querySelectorAll('.card')
        checkForSetOnBoard(cardsOnBoard)
        if (checkForSetOnBoard(cardsOnBoard)) {
            console.log("there is a set on the board")
        }
        else {
            console.log("you're right! reshuffling...")
        }
    }
})

function checkForSetOnBoard(cards) {
    cards.forEach(function(card) {
         console.log(card)
    })
}