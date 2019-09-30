const container = document.querySelector('#container')
const board = document.querySelector('#board')
const shuffledCards = []

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
            initializeGame(game)
        })
    }
})

function initializeGame(game) {
    getCards()
    // board.insertAdjacentHTML("beforeend", `<h2>Created Game: ${game.id}</h2>`)
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
    board.insertAdjacentHTML("beforeend", `<div class="card">Card: ${card.id}</div>`)
}

function removeCards(numCards) {
    shuffledCards.splice(0, numCards)
}