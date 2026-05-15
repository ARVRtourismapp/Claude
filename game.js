// =============================================
// BLACKJACK GAME - game.js
// =============================================

// --- CARD DATA ---
// These arrays hold all possible suits and ranks for a deck of cards
var suits = ["Spades", "Hearts", "Diamonds", "Clubs"];
var ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

// --- GAME VARIABLES ---
// These variables keep track of everything during the game
var deck = [];         // the shuffled deck of cards
var playerHand = [];   // cards the player is holding
var dealerHand = [];   // cards the dealer is holding
var balance = 500;     // how much money the player has
var bet = 0;           // how much the player bet this round
var gameActive = false; // is a round currently being played?

// =============================================
// FUNCTION: buildDeck
// Creates a full 52-card deck and shuffles it
// =============================================
function buildDeck() {
  deck = []; // start with an empty deck

  // Loop through every suit and every rank to make all 52 cards
  for (var s = 0; s < suits.length; s++) {
    for (var r = 0; r < ranks.length; r++) {
      // Each card is an object with a rank, suit, and a hidden property
      var card = {
        rank: ranks[r],
        suit: suits[s],
        hidden: false  // hidden = true means we don't show the card face
      };
      deck.push(card);
    }
  }

  // Shuffle the deck using the Fisher-Yates shuffle algorithm
  // It goes through the deck backwards and swaps each card with a random card
  for (var i = deck.length - 1; i > 0; i--) {
    var randomIndex = Math.floor(Math.random() * (i + 1));
    var temp = deck[i];
    deck[i] = deck[randomIndex];
    deck[randomIndex] = temp;
  }
}

// =============================================
// FUNCTION: drawCard
// Removes the top card from the deck and returns it
// =============================================
function drawCard() {
  return deck.pop(); // pop() removes and returns the last item in an array
}

// =============================================
// FUNCTION: getCardValue
// Returns the point value of a single card
// =============================================
function getCardValue(card) {
  if (card.rank === "A") {
    return 11; // Aces start as 11 (adjusted later if needed)
  } else if (card.rank === "K" || card.rank === "Q" || card.rank === "J") {
    return 10; // Face cards are worth 10
  } else {
    return parseInt(card.rank); // Number cards are worth their number
  }
}

// =============================================
// FUNCTION: getHandTotal
// Adds up all the card values in a hand
// Adjusts Aces from 11 to 1 if total goes over 21
// =============================================
function getHandTotal(hand) {
  var total = 0;
  var aceCount = 0;

  for (var i = 0; i < hand.length; i++) {
    // Skip hidden cards (we don't count them yet)
    if (hand[i].hidden === true) {
      continue;
    }
    total = total + getCardValue(hand[i]);
    if (hand[i].rank === "A") {
      aceCount = aceCount + 1;
    }
  }

  // If total is over 21 and we have aces, change an Ace from 11 to 1
  while (total > 21 && aceCount > 0) {
    total = total - 10;
    aceCount = aceCount - 1;
  }

  return total;
}

// =============================================
// FUNCTION: isRedCard
// Returns true if the card is a Hearts or Diamonds (shown in red)
// =============================================
function isRedCard(card) {
  if (card.suit === "Hearts" || card.suit === "Diamonds") {
    return true;
  }
  return false;
}

// =============================================
// FUNCTION: getSuitSymbol
// Converts the suit name to its symbol character
// =============================================
function getSuitSymbol(suit) {
  if (suit === "Spades")   return "♠";
  if (suit === "Hearts")   return "♥";
  if (suit === "Diamonds") return "♦";
  if (suit === "Clubs")    return "♣";
}

// =============================================
// FUNCTION: buildCardHTML
// Returns the HTML string for displaying one card
// =============================================
function buildCardHTML(card) {
  // If the card is hidden, show a blue patterned card back
  if (card.hidden === true) {
    return '<div class="card back"></div>';
  }

  var symbol = getSuitSymbol(card.suit);
  var colorClass = "card";

  if (isRedCard(card)) {
    colorClass = "card red"; // red suits get the "red" CSS class
  }

  // Build the HTML for the card using the rank and suit symbol
  var html = '<div class="' + colorClass + '">';
  html += '<div class="corner">' + card.rank + '<br>' + symbol + '</div>';
  html += '<div class="suit-center">' + symbol + '</div>';
  html += '<div class="corner" style="transform:rotate(180deg)">' + card.rank + '<br>' + symbol + '</div>';
  html += '</div>';

  return html;
}

// =============================================
// FUNCTION: updateDisplay
// Updates what the player sees on screen
// =============================================
function updateDisplay(hideDealerCard) {
  var dealerCardsDiv = document.getElementById("dealer-cards");
  var playerCardsDiv = document.getElementById("player-cards");
  var dealerScoreDiv = document.getElementById("dealer-score");
  var playerScoreDiv = document.getElementById("player-score");

  // Build the HTML for all dealer cards
  var dealerHTML = "";
  for (var i = 0; i < dealerHand.length; i++) {
    dealerHTML += buildCardHTML(dealerHand[i]);
  }
  dealerCardsDiv.innerHTML = dealerHTML;

  // Build the HTML for all player cards
  var playerHTML = "";
  for (var i = 0; i < playerHand.length; i++) {
    playerHTML += buildCardHTML(playerHand[i]);
  }
  playerCardsDiv.innerHTML = playerHTML;

  // Show scores (hide dealer score while a card is still face-down)
  if (hideDealerCard) {
    dealerScoreDiv.textContent = "";
  } else {
    dealerScoreDiv.textContent = "Total: " + getHandTotal(dealerHand);
  }
  playerScoreDiv.textContent = "Total: " + getHandTotal(playerHand);

  // Update the balance and bet display
  document.getElementById("bal").textContent = balance;
  document.getElementById("cur-bet").textContent = bet;
}

// =============================================
// FUNCTION: setStatus
// Updates the status message shown to the player
// =============================================
function setStatus(message) {
  document.getElementById("status").textContent = message;
}

// =============================================
// FUNCTION: deal
// Starts a new round — takes the bet and deals cards
// =============================================
function deal() {
  // Read the bet amount the player typed in
  var betInput = document.getElementById("bet-input").value;
  var betAmount = parseInt(betInput);

  // Validate the bet
  if (isNaN(betAmount) || betAmount < 1) {
    setStatus("Please enter a valid bet.");
    return;
  }
  if (betAmount > balance) {
    setStatus("You don't have enough balance!");
    return;
  }

  // Deduct the bet and set up the round
  bet = betAmount;
  balance = balance - bet;

  buildDeck();

  // Deal 2 cards to the player and 2 to the dealer
  playerHand = [drawCard(), drawCard()];
  dealerHand = [drawCard(), drawCard()];

  // Hide the dealer's second card (face-down)
  dealerHand[1].hidden = true;

  gameActive = true;

  // Enable/disable the right buttons
  document.getElementById("btn-deal").disabled = true;
  document.getElementById("btn-hit").disabled = false;
  document.getElementById("btn-stand").disabled = false;
  document.getElementById("btn-new").style.display = "none";
  document.getElementById("bet-input").disabled = true;

  updateDisplay(true);
  setStatus("Your turn — Hit or Stand?");

  // Check if the player got blackjack right away
  if (getHandTotal(playerHand) === 21) {
    stand();
  }
}

// =============================================
// FUNCTION: hit
// Player takes another card
// =============================================
function hit() {
  if (gameActive === false) return;

  playerHand.push(drawCard());
  updateDisplay(true);

  var playerTotal = getHandTotal(playerHand);

  if (playerTotal > 21) {
    setStatus("Bust! You went over 21. You lose.");
    endRound(-1); // -1 means player lost
  } else if (playerTotal === 21) {
    stand(); // automatically stand on 21
  } else {
    setStatus("Hit or Stand?");
  }
}

// =============================================
// FUNCTION: stand
// Player stops taking cards — dealer plays their turn
// =============================================
function stand() {
  if (gameActive === false) return;

  // Flip over the dealer's hidden card
  for (var i = 0; i < dealerHand.length; i++) {
    dealerHand[i].hidden = false;
  }

  updateDisplay(false);
  dealerTurn(); // now the dealer draws cards
}

// =============================================
// FUNCTION: dealerTurn
// Dealer keeps drawing cards until they reach 17 or bust
// Uses setTimeout to add a small delay between draws (looks nicer)
// =============================================
function dealerTurn() {
  var dealerTotal = getHandTotal(dealerHand);

  if (dealerTotal < 17) {
    // Dealer must draw if under 17
    dealerHand.push(drawCard());
    updateDisplay(false);

    dealerTotal = getHandTotal(dealerHand);

    if (dealerTotal > 21) {
      setStatus("Dealer busts! You win!");
      endRound(1); // 1 means player won
      return;
    }

    // Wait 500ms then check again (creates a drawing animation effect)
    setTimeout(dealerTurn, 500);

  } else {
    // Dealer is done drawing — compare totals
    var playerTotal = getHandTotal(playerHand);

    if (playerTotal > dealerTotal) {
      setStatus("You win! (" + playerTotal + " vs " + dealerTotal + ")");
      endRound(1);
    } else if (dealerTotal > playerTotal) {
      setStatus("Dealer wins. (" + dealerTotal + " vs " + playerTotal + ")");
      endRound(-1);
    } else {
      setStatus("Push! It's a tie. (" + playerTotal + " vs " + dealerTotal + ")");
      endRound(0); // 0 means tie
    }
  }
}

// =============================================
// FUNCTION: endRound
// Handles the result of the round and updates balance
// result: 1 = win, -1 = loss, 0 = tie
// =============================================
function endRound(result) {
  gameActive = false;

  if (result === 1) {
    balance = balance + (bet * 2); // win: get double your bet back
  } else if (result === 0) {
    balance = balance + bet; // tie: get your bet back
  }
  // loss: bet is already gone, nothing added back

  // Re-enable deal button, disable hit/stand
  document.getElementById("btn-hit").disabled = true;
  document.getElementById("btn-stand").disabled = true;
  document.getElementById("bet-input").disabled = false;

  if (balance <= 0) {
    document.getElementById("btn-deal").disabled = true;
    document.getElementById("btn-new").style.display = "inline-block";
    setStatus("You're out of chips! Start a new game.");
  } else {
    document.getElementById("btn-deal").disabled = false;
  }

  updateDisplay(false);
}

// =============================================
// FUNCTION: newGame
// Resets everything back to the start
// =============================================
function newGame() {
  balance = 500;
  bet = 0;
  playerHand = [];
  dealerHand = [];

  document.getElementById("dealer-cards").innerHTML = "";
  document.getElementById("player-cards").innerHTML = "";
  document.getElementById("dealer-score").textContent = "";
  document.getElementById("player-score").textContent = "";
  document.getElementById("btn-deal").disabled = false;
  document.getElementById("btn-new").style.display = "none";
  document.getElementById("bet-input").disabled = false;
  document.getElementById("bal").textContent = balance;
  document.getElementById("cur-bet").textContent = 0;

  setStatus("Place your bet and deal!");
}

// =============================================
// EVENT LISTENERS
// Connect each button to its function
// =============================================
document.getElementById("btn-deal").addEventListener("click", deal);
document.getElementById("btn-hit").addEventListener("click", hit);
document.getElementById("btn-stand").addEventListener("click", stand);
document.getElementById("btn-new").addEventListener("click", newGame);