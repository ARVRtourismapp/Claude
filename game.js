var suits = ["Spades","Hearts","Diamonds","Clubs"];
var ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
var deck = [], playerHand = [], dealerHand = [];
var balance = 500, bet = 0, gameActive = false;

function buildDeck() {
  deck = [];
  for (var s = 0; s < suits.length; s++)
    for (var r = 0; r < ranks.length; r++)
      deck.push({ rank: ranks[r], suit: suits[s], hidden: false });
  for (var i = deck.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = deck[i]; deck[i] = deck[j]; deck[j] = tmp;
  }
}

function drawCard() { return deck.pop(); }

function cardValue(card) {
  if (card.rank === "A") return 11;
  if ("KQJ".includes(card.rank)) return 10;
  return parseInt(card.rank);
}

function handTotal(hand) {
  var total = 0, aces = 0;
  for (var i = 0; i < hand.length; i++) {
    if (hand[i].hidden) continue;
    total += cardValue(hand[i]);
    if (hand[i].rank === "A") aces++;
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

function suitSymbol(s) {
  return { Spades:"♠", Hearts:"♥", Diamonds:"♦", Clubs:"♣" }[s];
}

function buildCardHTML(card) {
  if (card.hidden) return '<div class="card back"></div>';
  var sym = suitSymbol(card.suit);
  var cls = (card.suit === "Hearts" || card.suit === "Diamonds") ? "card red" : "card";
  return '<div class="' + cls + '">'
    + '<div class="corner">' + card.rank + '<br>' + sym + '</div>'
    + '<div class="suit-center">' + sym + '</div>'
    + '<div class="corner" style="transform:rotate(180deg)">' + card.rank + '<br>' + sym + '</div>'
    + '</div>';
}

function updateDisplay(hideDealerCard) {
  document.getElementById("dealer-cards").innerHTML = dealerHand.map(buildCardHTML).join("");
  document.getElementById("player-cards").innerHTML = playerHand.map(buildCardHTML).join("");
  document.getElementById("dealer-score").textContent = hideDealerCard ? "" : "Total: " + handTotal(dealerHand);
  document.getElementById("player-score").textContent = "Total: " + handTotal(playerHand);
  document.getElementById("bal").textContent = balance;
  document.getElementById("cur-bet").textContent = bet;
}

function setStatus(msg) { document.getElementById("status").textContent = msg; }

function endRound(result) {
  gameActive = false;
  if (result === 1) balance += bet * 2;
  else if (result === 0) balance += bet;
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

function dealerTurn() {
  if (handTotal(dealerHand) < 17) {
    dealerHand.push(drawCard());
    updateDisplay(false);
    if (handTotal(dealerHand) > 21) { setStatus("Dealer busts! You win!"); endRound(1); return; }
    setTimeout(dealerTurn, 500);
  } else {
    var p = handTotal(playerHand), d = handTotal(dealerHand);
    if (p > d)      { setStatus("You win! (" + p + " vs " + d + ")"); endRound(1); }
    else if (d > p) { setStatus("Dealer wins. (" + d + " vs " + p + ")"); endRound(-1); }
    else            { setStatus("Push! It's a tie. (" + p + ")"); endRound(0); }
  }
}

function stand() {
  if (!gameActive) return;
  dealerHand.forEach(function(c) { c.hidden = false; });
  updateDisplay(false);
  dealerTurn();
}

function deal() {
  var amount = parseInt(document.getElementById("bet-input").value);
  if (isNaN(amount) || amount < 1) { setStatus("Please enter a valid bet."); return; }
  if (amount > balance) { setStatus("You don't have enough balance!"); return; }
  bet = amount;
  balance -= bet;
  buildDeck();
  playerHand = [drawCard(), drawCard()];
  dealerHand = [drawCard(), drawCard()];
  dealerHand[1].hidden = true;
  gameActive = true;
  document.getElementById("btn-deal").disabled = true;
  document.getElementById("btn-hit").disabled = false;
  document.getElementById("btn-stand").disabled = false;
  document.getElementById("btn-new").style.display = "none";
  document.getElementById("bet-input").disabled = true;
  updateDisplay(true);
  setStatus("Your turn — Hit or Stand?");
  if (handTotal(playerHand) === 21) stand();
}

function hit() {
  if (!gameActive) return;
  playerHand.push(drawCard());
  updateDisplay(true);
  var t = handTotal(playerHand);
  if (t > 21)      { setStatus("Bust! You went over 21. You lose."); endRound(-1); }
  else if (t === 21) { stand(); }
  else             { setStatus("Hit or Stand?"); }
}

function newGame() {
  balance = 500; bet = 0; playerHand = []; dealerHand = [];
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

document.getElementById("btn-deal").addEventListener("click", deal);
document.getElementById("btn-hit").addEventListener("click", hit);
document.getElementById("btn-stand").addEventListener("click", stand);
document.getElementById("btn-new").addEventListener("click", newGame);