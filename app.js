const suits = [
  { symbol: "♠", key: "spades", color: "black" },
  { symbol: "♥", key: "hearts", color: "red" },
  { symbol: "♦", key: "diamonds", color: "red" },
  { symbol: "♣", key: "clubs", color: "black" },
];

const ranks = [
  { label: "A", value: 14, chips: 11 },
  { label: "K", value: 13, chips: 10 },
  { label: "Q", value: 12, chips: 10 },
  { label: "J", value: 11, chips: 10 },
  { label: "10", value: 10, chips: 10 },
  { label: "9", value: 9, chips: 9 },
  { label: "8", value: 8, chips: 8 },
  { label: "7", value: 7, chips: 7 },
  { label: "6", value: 6, chips: 6 },
  { label: "5", value: 5, chips: 5 },
  { label: "4", value: 4, chips: 4 },
  { label: "3", value: 3, chips: 3 },
  { label: "2", value: 2, chips: 2 },
];

const handScores = {
  "Royal Flush": [120, 10],
  "Straight Flush": [100, 8],
  "Four of a Kind": [60, 7],
  "Full House": [40, 4],
  Flush: [35, 4],
  Straight: [30, 4],
  "Three of a Kind": [30, 3],
  "Two Pair": [20, 2],
  Pair: [10, 2],
  "High Card": [5, 1],
};

const jokerPool = [
  { name: "Chip Stack", cost: 4, text: "+35 chips", apply: (score) => ({ ...score, chips: score.chips + 35 }) },
  { name: "Loud Jacket", cost: 5, text: "+3 mult", apply: (score) => ({ ...score, mult: score.mult + 3 }) },
  { name: "Flush Fund", cost: 6, text: "Flushes earn +$2", payout: (hand) => (hand.name.includes("Flush") ? 2 : 0) },
  { name: "Pair Press", cost: 4, text: "Pairs gain +4 mult", apply: (score) => (score.name.includes("Pair") ? { ...score, mult: score.mult + 4 } : score) },
  { name: "Face Value", cost: 5, text: "+5 chips per face card", apply: (score, cards) => ({ ...score, chips: score.chips + cards.filter((card) => card.value >= 11).length * 5 }) },
  { name: "Lucky Seven", cost: 3, text: "+77 chips if a 7 is scored", apply: (score, cards) => (cards.some((card) => card.value === 7) ? { ...score, chips: score.chips + 77 } : score) },
];

const tutorialSteps = [
  {
    title: "Clear the blind",
    copy: "Your goal is to reach the target score before you run out of hands.",
    bullets: ["Each round starts with 4 hands and 3 discards.", "Select up to 5 cards, then play them for chips x mult.", "If your score reaches the target, the shop opens."],
  },
  {
    title: "Build poker hands",
    copy: "Better poker hands start with stronger base chips and multipliers.",
    bullets: ["Pairs are useful early.", "Straights, flushes, full houses, and four of a kind score much higher.", "Card ranks add chips on top of the hand bonus."],
  },
  {
    title: "Use discards",
    copy: "Discards let you throw away selected cards and draw back to eight.",
    bullets: ["Discard weak singles to chase pairs or flushes.", "Discards are limited, so keep made hands.", "Cards refill automatically after each play or discard."],
  },
  {
    title: "Buy jokers",
    copy: "After clearing a blind, spend cash on jokers before the next round.",
    bullets: ["Jokers modify chips, mult, or rewards.", "You can hold up to 5 jokers.", "Targets rise each round, so upgrades matter."],
  },
];

const els = {
  ante: document.querySelector("#ante"),
  round: document.querySelector("#round"),
  target: document.querySelector("#target"),
  score: document.querySelector("#score"),
  hands: document.querySelector("#hands"),
  discards: document.querySelector("#discards"),
  cash: document.querySelector("#cash"),
  result: document.querySelector("#result"),
  hand: document.querySelector("#hand"),
  jokers: document.querySelector("#jokers"),
  shopPanel: document.querySelector("#shop-panel"),
  shop: document.querySelector("#shop"),
  play: document.querySelector("#play"),
  discard: document.querySelector("#discard"),
  nextRound: document.querySelector("#next-round"),
  newRun: document.querySelector("#new-run"),
  rules: document.querySelector("#rules"),
  tutorial: document.querySelector("#tutorial"),
  tutorialStep: document.querySelector("#tutorial-step"),
  tutorialTitle: document.querySelector("#tutorial-title"),
  tutorialCopy: document.querySelector("#tutorial-copy"),
  tutorialList: document.querySelector("#tutorial-list"),
  tutorialBack: document.querySelector("#tutorial-back"),
  tutorialNext: document.querySelector("#tutorial-next"),
  tutorialStart: document.querySelector("#tutorial-start"),
};

let state;
let tutorialIndex = 0;

function newRun() {
  state = {
    ante: 1,
    round: 1,
    target: 240,
    score: 0,
    hands: 4,
    discards: 3,
    cash: 4,
    deck: shuffle(buildDeck()),
    hand: [],
    selected: new Set(),
    jokers: [],
    shop: [],
    mode: "intro",
  };
  drawTo(8);
  tutorialIndex = 0;
  render("Read the quick tutorial, then start the blind.");
}

function buildDeck() {
  return suits.flatMap((suit) =>
    ranks.map((rank) => ({
      id: `${rank.label}-${suit.key}`,
      ...rank,
      suit: suit.key,
      symbol: suit.symbol,
      color: suit.color,
    })),
  );
}

function shuffle(cards) {
  const deck = [...cards];
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function drawTo(size) {
  while (state.hand.length < size && state.deck.length) {
    state.hand.push(state.deck.pop());
  }
}

function toggleCard(id) {
  if (state.mode !== "playing") return;
  if (state.selected.has(id)) {
    state.selected.delete(id);
  } else if (state.selected.size < 5) {
    state.selected.add(id);
  }
  render();
}

function playSelected() {
  const cards = selectedCards();
  if (state.mode !== "playing" || !cards.length || state.hands < 1) return;

  let scored = evaluateHand(cards);
  state.jokers.forEach((joker) => {
    if (joker.apply) scored = joker.apply(scored, cards);
  });

  const gained = scored.chips * scored.mult;
  const bonusCash = state.jokers.reduce((sum, joker) => sum + (joker.payout ? joker.payout(scored, cards) : 0), 0);
  state.score += gained;
  state.cash += bonusCash;
  state.hands -= 1;
  removeSelected();
  drawTo(8);

  if (state.score >= state.target) {
    openShop(`${scored.name}: ${scored.chips} x ${scored.mult} = ${gained}. Blind cleared.`);
  } else if (state.hands === 0) {
    state.mode = "gameover";
    render(`${scored.name}: ${gained}. Run over. Target missed by ${state.target - state.score}.`);
  } else {
    render(`${scored.name}: ${scored.chips} x ${scored.mult} = ${gained}.`);
  }
}

function discardSelected() {
  if (state.mode !== "playing" || state.discards < 1 || state.selected.size === 0) return;
  state.discards -= 1;
  removeSelected();
  drawTo(8);
  render("Discarded. Build a stronger hand.");
}

function removeSelected() {
  state.hand = state.hand.filter((card) => !state.selected.has(card.id));
  state.selected.clear();
}

function selectedCards() {
  return state.hand.filter((card) => state.selected.has(card.id));
}

function evaluateHand(cards) {
  const values = cards.map((card) => card.value).sort((a, b) => a - b);
  const counts = groupCounts(values);
  const flush = cards.length >= 5 && new Set(cards.map((card) => card.suit)).size === 1;
  const straight = cards.length >= 5 && isStraight(values);
  const royal = straight && flush && Math.max(...values) === 14 && Math.min(...values) === 10;
  const groups = Object.values(counts).sort((a, b) => b - a);
  const name =
    (royal && "Royal Flush") ||
    (straight && flush && "Straight Flush") ||
    (groups[0] === 4 && "Four of a Kind") ||
    (groups[0] === 3 && groups[1] === 2 && "Full House") ||
    (flush && "Flush") ||
    (straight && "Straight") ||
    (groups[0] === 3 && "Three of a Kind") ||
    (groups[0] === 2 && groups[1] === 2 && "Two Pair") ||
    (groups[0] === 2 && "Pair") ||
    "High Card";
  const [baseChips, mult] = handScores[name];
  return {
    name,
    chips: baseChips + cards.reduce((sum, card) => sum + card.chips, 0),
    mult,
  };
}

function groupCounts(values) {
  return values.reduce((counts, value) => {
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function isStraight(values) {
  const unique = [...new Set(values)];
  const wheel = unique.join(",") === "2,3,4,5,14";
  return wheel || unique.length === 5 && unique[4] - unique[0] === 4;
}

function openShop(message) {
  state.mode = "shop";
  const reward = 3 + state.hands + state.ante;
  state.cash += reward;
  state.shop = shuffle(jokerPool.filter((joker) => !state.jokers.some((owned) => owned.name === joker.name))).slice(0, 3);
  render(`${message} Reward: $${reward}.`);
}

function buyJoker(name) {
  const joker = state.shop.find((item) => item.name === name);
  if (!joker || state.cash < joker.cost || state.jokers.length >= 5) return;
  state.cash -= joker.cost;
  state.jokers.push(joker);
  state.shop = state.shop.filter((item) => item.name !== name);
  render(`${joker.name} added.`);
}

function nextRound() {
  if (state.mode !== "shop") return;
  state.round += 1;
  state.ante = Math.ceil(state.round / 3);
  state.target = Math.round(220 + state.round * 110 + state.ante * 80);
  state.score = 0;
  state.hands = 4;
  state.discards = 3;
  state.deck = shuffle(buildDeck());
  state.hand = [];
  state.selected.clear();
  state.mode = "playing";
  drawTo(8);
  render("New blind. Find the score.");
}

function openRules() {
  tutorialIndex = 0;
  els.tutorial.hidden = false;
  renderTutorial();
}

function closeTutorial() {
  els.tutorial.hidden = true;
  if (state.mode === "intro") {
    state.mode = "playing";
    render("Select up to five cards, then play or discard.");
  }
}

function changeTutorialStep(delta) {
  tutorialIndex = Math.max(0, Math.min(tutorialSteps.length - 1, tutorialIndex + delta));
  renderTutorial();
}

function render(message = els.result.textContent) {
  els.ante.textContent = state.ante;
  els.round.textContent = state.round;
  els.target.textContent = state.target;
  els.score.textContent = state.score;
  els.hands.textContent = state.hands;
  els.discards.textContent = state.discards;
  els.cash.textContent = `$${state.cash}`;
  els.result.textContent = message;
  els.shopPanel.hidden = state.mode !== "shop";
  els.play.disabled = state.mode !== "playing" || state.selected.size === 0 || state.hands < 1;
  els.discard.disabled = state.mode !== "playing" || state.selected.size === 0 || state.discards < 1;
  els.tutorial.hidden = state.mode !== "intro" && els.tutorial.hidden;
  renderCards();
  renderJokers();
  renderShop();
  renderTutorial();
}

function renderTutorial() {
  if (els.tutorial.hidden) return;
  const step = tutorialSteps[tutorialIndex];
  els.tutorialStep.textContent = `Tutorial ${tutorialIndex + 1} of ${tutorialSteps.length}`;
  els.tutorialTitle.textContent = step.title;
  els.tutorialCopy.textContent = step.copy;
  els.tutorialList.replaceChildren(...step.bullets.map((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    return item;
  }));
  els.tutorialBack.disabled = tutorialIndex === 0;
  els.tutorialNext.hidden = tutorialIndex === tutorialSteps.length - 1;
  els.tutorialStart.hidden = tutorialIndex !== tutorialSteps.length - 1;
}

function renderCards() {
  els.hand.replaceChildren(
    ...state.hand.map((card) => {
      const button = document.createElement("button");
      button.className = `card ${card.color}`;
      button.type = "button";
      button.dataset.selected = state.selected.has(card.id);
      button.setAttribute("aria-pressed", state.selected.has(card.id));
      button.innerHTML = `<span>${card.label}</span><strong>${card.symbol}</strong>`;
      button.addEventListener("click", () => toggleCard(card.id));
      return button;
    }),
  );
}

function renderJokers() {
  els.jokers.replaceChildren(...(state.jokers.length ? state.jokers.map(jokerView) : [emptyView("No jokers yet")]));
}

function renderShop() {
  els.shop.replaceChildren(...state.shop.map((joker) => {
    const card = jokerView(joker);
    const buy = document.createElement("button");
    buy.type = "button";
    buy.textContent = `Buy $${joker.cost}`;
    buy.disabled = state.cash < joker.cost || state.jokers.length >= 5;
    buy.addEventListener("click", () => buyJoker(joker.name));
    card.append(buy);
    return card;
  }));
}

function jokerView(joker) {
  const item = document.createElement("article");
  item.className = "joker";
  item.innerHTML = `<strong>${joker.name}</strong><span>${joker.text}</span>`;
  return item;
}

function emptyView(text) {
  const item = document.createElement("p");
  item.className = "empty";
  item.textContent = text;
  return item;
}

els.play.addEventListener("click", playSelected);
els.discard.addEventListener("click", discardSelected);
els.nextRound.addEventListener("click", nextRound);
els.newRun.addEventListener("click", newRun);
els.rules.addEventListener("click", openRules);
els.tutorialBack.addEventListener("click", () => changeTutorialStep(-1));
els.tutorialNext.addEventListener("click", () => changeTutorialStep(1));
els.tutorialStart.addEventListener("click", closeTutorial);

newRun();
