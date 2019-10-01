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
    getCards()

    // fetch("http://localhost:3000/api/v1/cards")
    // .then(function(response) {
    //     return response.json()
    // })
    // .then(shuffleCards)
    // renderInitialCards(shuffledCards)
    // removeCards(12)

}

function getCards() {
    fetch("http://localhost:3000/api/v1/cards")
    .then(function(response) {
        return response.json()
    })
    .then(shuffleCards)
}

function shuffleCards(cards) {
    while (cards.length) {
        let randomNumber = Math.floor(Math.random() * cards.length)
        shuffledCards.push(cards[randomNumber])
        cards.splice(randomNumber, 1)
    }
    renderInitialCards(shuffledCards)
}

function renderInitialCards(cards) {
    for (let i=0; i<12; i++) {
        renderSingleCard(cards[i])
    }
    removeCards(12)
}

function renderSingleCard(card) {
    const svg = svgBuilder(card)
    board.insertAdjacentHTML("beforeend",
    `<div class="card ${card.number} ${card.color} ${card.shape} ${card.fill}" data-id="${card.id}" data-number="${card.number}" data-color="${card.color}" data-shape="${card.shape}" data-fill="${card.fill}">
        ${svg}
    </div>`)
}

function removeCards(numCards) {
    shuffledCards.splice(0, numCards)
}

board.addEventListener("click", function(e) {
    if (e.target.classList.contains("card")) {
        if (e.target.classList.contains("selected")) {
            e.target.classList.remove("selected")
            selectedCounter--
        }
        else {
            e.target.classList.add("selected")
            selectedCounter++
            if (selectedCounter === 3) {
                checkForSet()
            }
        }
    }
})

function checkForSet() {
    const selectedCards = board.querySelectorAll('.card.selected')
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
        alert("YES!")
        return true
    }
    else {
        alert("Nope, try again")
        return false
    }

}

function allTheSame(array) {
    let propertyName = array[0]
    for (let i = 1; i < 3; i++) {
        if (array[i] != propertyName) {
            console.log("not all the same")
            return false
        }
    }
    console.log("all the same!")
    return true
}

function allTheDifferent(array) {
    if (array[0] != array[1] && array[0] != array[2] && array[1] != array[2]) {
        console.log("all different!")
        return true
    }
    console.log("Not all different")
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
}