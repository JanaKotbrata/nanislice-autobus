# Multiplayer Card Game

A multiplayer card game where players compete to be the first to empty their bus of all cards. The game is built on a modern JavaScript stack with real-time interaction and a clean, responsive UI.

## Contents

- [About the Game](#about-the-game)
- [Game Rules](#game-rules)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Testing](#testing)
- [License](#license)

## About the Game

The goal of the game is to get rid of all the cards in your bus. The first player to play all their bus cards wins. Players take turns and interact with the board in real time.

## Game Rules

1. Each player receives 5 cards in hand and 10 cards in the bus. Additionally, each player has 4 bus stop slots where they can place cards temporarily.
2. At the beginning of each turn, the player draws cards until they have 5 in hand.
3. The first card played on the game board must be an Ace or a Joker (Joker can substitute any card). The pile is then built up in order: 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K. When the pile ends with a King, it is closed and shuffled back into the draw deck.
4. If the player has a valid card in hand, in the stop, or on top of the bus, they may play it.
5. If the player cannot play any valid card, they must place a card into their bus stop. Jokers and Aces cannot be placed in the bus stop. If the bus stop slots are full, the player may stack a bus stop if they have a card of the same rank. Otherwise, the card must be placed at the bottom of the bus. If the player has no cards in hand, they draw up to 5 and continue.
6. Tips:
    - Double-click on the bus to peek at your last bus card.
    - Hover over a bus to see how many cards are left.
    - Hover over a stop pile to see how many cards it contains.

## Live app
App url: https://autobus.dmw.cz/


## Tech Stack

### Frontend

- **React** – for the user interface
- **Tailwind CSS** – utility-first styling
- **Axios** – REST API communication
- **WebSockets** – real-time game communication using `socket.io-client`

### Backend

- **Node.js + Express.js** – REST API and WebSocket server
- **MongoDB** – database for game and user data
- **Passport.js** – user authentication
- **Joi** – input validation

### Testing

- **Jest** – for unit and integration tests

## Installation

1. Clone the repository:
```bash
git clone https://github.com/JanaKotbrata/nanislice-autobus.git
```
2. Install dependencies:
```bash
cd server 
npm install 

cd ../client 
npm install
```
3. Start both the frontend and backend (in separate terminals):
```bash
# server
npm start

# client
npm run dev
```
4. The frontend will be available by default at `http://localhost:5173`

## Testing

Run the test suite:
```bash
# inside the server directory
npm test
```

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.  
Commercial use is **not permitted**.  
See the [LICENSE](./LICENSE) file for details.
