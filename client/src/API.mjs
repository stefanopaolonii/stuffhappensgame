const SERVER_URL = 'http://localhost:3001/api';

// Function to handle invalid responses
function handleInvalidResponse(response) {
    if (!response.ok) { throw Error(response.statusText) }
    let type = response.headers.get('Content-Type');
    if (type !== null && type.indexOf('application/json') === -1){
        throw new TypeError(`Expected JSON, got ${type}`)
    }
    return response;
}

// API functions to get session
async function getSession() {
    return await fetch(`${SERVER_URL}/sessions/current`, {
        method: 'GET',
        credentials: 'include', 
    })
    .then(handleInvalidResponse)
    .then(response => response.json());
};

// API functions to log in 
async function logIn(credentials) {
    return await fetch(`${SERVER_URL}/sessions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify(credentials),
    })
    .then(handleInvalidResponse)
    .then(response => response.json());
};

// API functions to log out
async function logOut() {
    return await fetch(`${SERVER_URL}/sessions/current`, {
        method: 'DELETE',
        credentials: 'include',
    })
    .then(handleInvalidResponse);
};

// API functions to get user games history
async function getUserGames() {
    return await fetch(`${SERVER_URL}/game/history`, {
        method: 'GET',
        credentials: 'include', 
    })
    .then(handleInvalidResponse)
    .then(response => response.json());
};

// API functions to start a new game
async function startGame() {
    return await fetch(`${SERVER_URL}/game/start`, {
        method: 'POST',
        credentials: 'include', 
    })
    .then(handleInvalidResponse)
    .then(response => response.json());
};

// API functions to get the next round
async function getRound() {
    return await fetch(`${SERVER_URL}/game/nextround`, {
        method: 'POST',
        credentials: 'include', 
    })
    .then(handleInvalidResponse)
    .then(response => response.json());
};

// API functions to send an answer
async function sendAnswer(cardId, selectedPosition) {
    return await fetch(`${SERVER_URL}/game/answer`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify({ cardId, selectedPosition }),
    })
    .then(handleInvalidResponse)
    .then(response => response.json());
};


const API = {getSession, logIn, logOut, getUserGames, startGame, getRound, sendAnswer};
export default API;