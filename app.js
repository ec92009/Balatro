const suits = [
  { symbol: "♠", color: "black" },
  { symbol: "♥", color: "red" },
  { symbol: "♦", color: "red" },
  { symbol: "♣", color: "black" },
];

const ranks = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"];

const cardsElement = document.querySelector("#cards");
const dealButton = document.querySelector("#deal-button");
const scoreButton = document.querySelector("#score-button");
const handNameElement = document.querySelector("#hand-name");
const scoreElement = document.querySelector("#score");

let currentHand = [];

function buildDeck() {
  return suits.flatMap((suit) => ranks.map((rank) => ({ rank, ...suit })));
}

function dealHand() {
  const deck = buildDeck();
  currentHand = [];

  while (currentHand.length < 5) {
    const index = Math.floor(Math.random() * deck.length);
    currentHand.push(deck.splice(index, 1)[0]);
  }

  renderHand();
  scoreElement.textContent = "0";
  handNameElement.textContent = "Ready";
}

function scoreHand() {
  const rankCounts = currentHand.reduce((counts, card) => {
    counts.set(card.rank, (counts.get(card.rank) || 0) + 1);
    return counts;
  }, new Map());

  const groups = [...rankCounts.values()].sort((a, b) => b - a);
  const score = currentHand.reduce((total, card) => total + rankValue(card.rank), 0);
  const handName = nameHand(groups);

  handNameElement.textContent = handName;
  scoreElement.textContent = String(score * multiplierFor(handName));
}

function rankValue(rank) {
  if (rank === "A") return 11;
  if (["K", "Q", "J"].includes(rank)) return 10;
  return Number(rank);
}

function nameHand(groups) {
  if (groups[0] === 4) return "Four of a Kind";
  if (groups[0] === 3 && groups[1] === 2) return "Full House";
  if (groups[0] === 3) return "Three of a Kind";
  if (groups[0] === 2 && groups[1] === 2) return "Two Pair";
  if (groups[0] === 2) return "Pair";
  return "High Card";
}

function multiplierFor(handName) {
  return {
    "Four of a Kind": 7,
    "Full House": 5,
    "Three of a Kind": 4,
    "Two Pair": 3,
    Pair: 2,
    "High Card": 1,
  }[handName];
}

function renderHand() {
  cardsElement.replaceChildren(
    ...currentHand.map((card) => {
      const cardElement = document.createElement("article");
      cardElement.className = `card ${card.color}`;
      cardElement.innerHTML = `
        <span class="rank">${card.rank}</span>
        <span class="suit">${card.symbol}</span>
      `;
      return cardElement;
    }),
  );
}

dealButton.addEventListener("click", dealHand);
scoreButton.addEventListener("click", scoreHand);

dealHand();
