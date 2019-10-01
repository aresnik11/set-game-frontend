const container = document.querySelector('#container')
const board = document.querySelector('#board')
const shuffledCards = []
let selectedCounter = 0

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
            board.innerHTML = ""
            initializeGame(game)
        })
    }
})

function initializeGame(game) {
    fetch("http://localhost:3000/api/v1/cards")
    .then(function(response) {
        return response.json()
    })
    .then(function(cards) {
        shuffleCards(cards)
        renderInitialCards(shuffledCards)
        removeCards(12)
    })
}

function shuffleCards(cards) {
    while (cards.length) {
        let randomNumber = Math.floor(Math.random() * cards.length)
        shuffledCards.push(cards[randomNumber])
        cards.splice(randomNumber, 1)
    }
}

function renderInitialCards(cards) {
    for (let i=0; i<12; i++) {
        renderSingleCard(cards[i])
    }
}

function renderSingleCard(card) {
    board.insertAdjacentHTML("beforeend",
    `<div class="card ${card.number} ${card.color} ${card.shape} ${card.fill}" data-id="${card.id}" data-number="${card.number}" data-color="${card.color}" data-shape="${card.shape}" data-fill="${card.fill}">
        Card: ${card.id}
        <br>
        Number: ${card.number}
        <br>
        Color: ${card.color}
        <br>
        Shape: ${card.shape}
        <br>
        Fill: ${card.fill}
    </div>`)
}

function removeCards(numCards) {
    shuffledCards.splice(0, numCards)
}

board.addEventListener("click", function(e) {
    if (e.target.classList.contains("card")) {
        if (e.target.classList.contains("selected")) {
            removeSelected(e.target)
        }
        else {
            addSelected(e.target)
            if (selectedCounter === 3) {
                const selectedCards = board.querySelectorAll('.card.selected')
                if (checkForSet(selectedCards)) {
                    console.log("YES! That is a set")
                    swapCards(selectedCards)
                }
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

function addSelected(element) {
    element.classList.add("selected")
    selectedCounter++
}

function removeSelected(element) {
    element.classList.remove("selected")
    selectedCounter--
}

function swapCards(selectedCards) {
    selectedCards.forEach(function(card) {
        removeSelected(card)
        newCard = shuffledCards[0]
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
        removeCards(1)
    })
}

// function getThreeCardsAttributes() {
//     const selectedCards = board.querySelectorAll('.card.selected')
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

function allTheSame(array) {
    let propertyName = array[0]
    for (let i = 1; i < 3; i++) {
        if (array[i] != propertyName) {
            return false
        }
    }
    return true
}

function allTheDifferent(array) {
    if (array[0] != array[1] && array[0] != array[2] && array[1] != array[2]) {
        return true
    }
    return false
}