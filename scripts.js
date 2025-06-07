// ================== DOM References ==================
let activeAsteroids = [];
const maxAsteroids = 7;

const spaceship = document.getElementById("spaceship");
const explosion = document.getElementById("explosion");
const boss = document.getElementById("boss");
const bossHealthbar = document.getElementById("bossHealthbar");
const shield = document.getElementById("shield");
const scoreDisplay = document.getElementById("score");

// ================== Game Settings ==================
const gameWidth = 1600;
const gameHeight = 1200;
const lazerSpeed = 10;
const maxBossHealth = 1000;
let bossHealth = maxBossHealth;
let spaceshipSpeed = 15;
let playerScore = 0;
let playerHits = 0;
const maxPlayerHits = 9;
let alienSpeed = 3;
let alienCount = 2;
let aliensArray = [];
let currentLevel = 1;
let lazerFireInterval = null;
const keysHeld = { left: false, right: false, space: false };

// Flags to manage the boss fight stages
let is50PercentWaveTriggered = false;
let is25PercentWaveTriggered = false;
let is50PercentWaveDefeated = false;
let is25PercentWaveDefeated = false;


// ================== Initial Setup ==================
explosion.style.display = "none";
shield.style.display = "none";
boss.style.display = "none";
spaceship.style.left = gameWidth / 2 - spaceship.offsetWidth / 2 + "px";
spaceship.style.bottom = "20px";

// ================== Player Functions ==================
function moveSpaceship(direction) {
  const currentLeft = spaceship.offsetLeft;
  if (direction === "left" && currentLeft > 0) {
    spaceship.style.left = currentLeft - spaceshipSpeed + "px";
  }
  if (direction === "right" && currentLeft + spaceship.offsetWidth < gameWidth) {
    spaceship.style.left = currentLeft + spaceshipSpeed + "px";
  }
}

function fireLazer() {
  const newLazer = document.createElement("div");
  newLazer.classList.add("lazer");
  newLazer.style.position = "absolute";
  newLazer.style.left =
    spaceship.offsetLeft + spaceship.offsetWidth / 2 - 1.5 + "px";
  newLazer.style.top = spaceship.offsetTop - 25 + "px";
  document.body.appendChild(newLazer);

  const lazerInterval = setInterval(() => {
    let top = newLazer.offsetTop;
    if (top < 0 || !document.body.contains(newLazer)) {
      clearInterval(lazerInterval);
      if (document.body.contains(newLazer)) newLazer.remove();
      return;
    }
    newLazer.style.top = top - lazerSpeed + "px";

    aliensArray.forEach((alien, index) => {
      if (document.body.contains(alien) && checkCollision(newLazer, alien)) {
        showExplosion(alien.offsetLeft, alien.offsetTop);
        alien.remove();
        aliensArray.splice(index, 1);
        updateScore(10);
        clearInterval(lazerInterval);
        newLazer.remove();
      }
    });

    activeAsteroids.forEach((asteroid, index) => {
      if (document.body.contains(newLazer) && document.body.contains(asteroid) && checkCollision(newLazer, asteroid)) {
        showExplosion(asteroid.offsetLeft, asteroid.offsetTop);
        asteroid.remove();
        activeAsteroids.splice(index, 1);
        clearInterval(lazerInterval);
        newLazer.remove();
        updateScore(5);
      }
    });

    if (boss.style.display === 'block' && checkCollision(newLazer, boss)) {
      if (shield.style.display !== 'block') {
        reduceBossHealth(10);
      }
      clearInterval(lazerInterval);
      newLazer.remove();
    }
  }, 30);
}

function startFiringLazer() {
  if (lazerFireInterval !== null) return;
  fireLazer();
  lazerFireInterval = setInterval(fireLazer, 200);
}

function stopFiringLazer() {
  clearInterval(lazerFireInterval);
  lazerFireInterval = null;
}

// ================== Shared Functions ==================
function showExplosion(x, y) {
  const expl = document.createElement('div');
  expl.classList.add('explosion');
  expl.style.left = x + "px";
  expl.style.top = y + "px";
  document.body.appendChild(expl);
  setTimeout(() => expl.remove(), 500);
}

function activateShield() {
  if (shield.style.display === "block" || boss.style.display === "none") return;

  const bossRect = boss.getBoundingClientRect();
  const shieldSize = bossRect.width + 50;
  shield.style.width = shieldSize + 'px';
  shield.style.height = shieldSize + 'px';
  shield.style.left = (bossRect.left + (bossRect.width / 2)) - (shieldSize / 2) + 'px';
  shield.style.top = (bossRect.top + (bossRect.height / 2)) - (shieldSize / 2) + 'px';

  shield.style.display = "block";
  setTimeout(() => (shield.style.display = "none"), 5000);
}

function checkCollision(a, b) {
  if (!a || !b) return false;
  const aRect = a.getBoundingClientRect();
  const bRect = b.getBoundingClientRect();
  return (
    aRect.left < bRect.right &&
    aRect.right > bRect.left &&
    aRect.top < bRect.bottom &&
    aRect.bottom > bRect.top
  );
}

// ================== Alien Functions ==================
function spawnAliens(count) {
  aliensArray.forEach((a) => a.remove());
  aliensArray = [];

  for (let i = 0; i < count; i++) {
    const alien = document.createElement("div");
    alien.classList.add("aliens");
    const columns = count > 16 ? 8 : 4;
    const spacingX = gameWidth / (columns + 1);
    const spacingY = 80;
    const row = Math.floor(i / columns);
    const col = i % columns;
    alien.style.left = `${(col + 1) * spacingX}px`;
    alien.style.top = `${row * spacingY + 50}px`;
    document.body.appendChild(alien);
    aliensArray.push(alien);
    moveAlien(alien);
    alienShootLoop(alien);
  }
}

function moveAlien(alien) {
  let direction = 1;
  const interval = setInterval(() => {
    if (!document.body.contains(alien)) {
      clearInterval(interval);
      return;
    }
    let pos = alien.offsetLeft;
    pos += direction * alienSpeed;
    alien.style.left = pos + "px";
    if (pos <= 0 || pos + alien.offsetWidth >= gameWidth) direction *= -1;
  }, 30);
}

function alienShootLoop(alien) {
  const shootInterval = setInterval(() => {
    if (!document.body.contains(alien)) {
      clearInterval(shootInterval);
      return;
    }
    shootAlienLazer(alien);
  }, Math.random() * 4000 + 2000);
}

function shootAlienLazer(alien) {
  const lazer = document.createElement("div");
  lazer.classList.add("alienLazers");
  lazer.style.left = alien.offsetLeft + alien.offsetWidth / 2 - 1.5 + "px";
  lazer.style.top = alien.offsetTop + alien.offsetHeight + "px";
  document.body.appendChild(lazer);

  const speed = 7;
  const interval = setInterval(() => {
    if (!document.body.contains(lazer)) {
      clearInterval(interval);
      return;
    }
    let top = lazer.offsetTop;
    if (top > gameHeight) {
      lazer.remove();
      clearInterval(interval);
      return;
    }
    lazer.style.top = top + speed + "px";

    if (spaceship && checkCollision(lazer, spaceship)) {
      lazer.remove();
      clearInterval(interval);
      playerHits++;
      updateHearts();
      if (playerHits >= maxPlayerHits) {
        alert("Game Over");
        location.reload();
      }
    }
  }, 30);
}

// ================== Boss Function ==================
function reduceBossHealth(amount) {
  bossHealth -= amount;
  if (bossHealth < 0) bossHealth = 0;

  const healthPercent = (bossHealth / maxBossHealth) * 100;
  bossHealthbar.style.width = healthPercent + "%";

  if (healthPercent <= 50 && !is50PercentWaveTriggered) {
    is50PercentWaveTriggered = true;
    boss.style.display = 'none';
    shield.style.display = 'none';
    spawnAliens(16);
    return;
  }

  if (healthPercent <= 25 && !is25PercentWaveTriggered) {
    is25PercentWaveTriggered = true;
    boss.style.display = 'none';
    shield.style.display = 'none';
    spawnAliens(32);
    return;
  }

  if (bossHealth <= 0) {
    showExplosion(boss.offsetLeft, boss.offsetTop);
    boss.remove();
    shield.remove();
    clearInterval(asteroidSpawner);
    alert("YOU WIN! The galaxy is safe... for now.");
    location.reload();
  }
}

function checkBossPhase() {
  if (currentLevel < 4) return;

  if (is50PercentWaveTriggered && !is50PercentWaveDefeated) {
    if (aliensArray.length === 0) {
      is50PercentWaveDefeated = true;
      boss.style.display = 'block';
      activateShield();
    }
  }

  if (is25PercentWaveTriggered && !is25PercentWaveDefeated) {
    if (aliensArray.length === 0) {
      is25PercentWaveDefeated = true;
      boss.style.display = 'block';
      activateShield();
    }
  }
}

// ================== Asteroid Functions ==================
// FIX: Restored the full function body
function spawnAsteroid() {
  if (activeAsteroids.length >= maxAsteroids) return;

  const asteroid = document.createElement("div");
  asteroid.classList.add("asteroid");
  asteroid.style.left = Math.floor(Math.random() * (gameWidth - 120)) + "px";
  asteroid.style.top = "-120px";
  document.body.appendChild(asteroid);
  activeAsteroids.push(asteroid);

  const fallSpeed = Math.random() * 3 + 2;
  const asteroidInterval = setInterval(() => {
    if (!document.body.contains(asteroid)) {
      clearInterval(asteroidInterval);
      activeAsteroids = activeAsteroids.filter(a => a !== asteroid);
      return;
    }

    asteroid.style.top = parseInt(asteroid.style.top) + fallSpeed + "px";

    if (parseInt(asteroid.style.top) > gameHeight) {
      clearInterval(asteroidInterval);
      asteroid.remove();
      activeAsteroids = activeAsteroids.filter(a => a !== asteroid);
    }
  }, 30);
}

// ================== Hearts ==================
// FIX: Restored the full function body
function updateHearts() {
  const heart1 = document.querySelector(".heart1");
  const heart2 = document.querySelector(".heart2");
  const heart3 = document.querySelector(".heart3");

  if (heart1) heart1.style.opacity = playerHits >= 3 ? 0.2 : 1;
  if (heart2) heart2.style.opacity = playerHits >= 6 ? 0.2 : 1;
  if (heart3) heart3.style.opacity = playerHits >= 9 ? 0.2 : 1;
}

// ================== Score & Level ==================
function updateScore(points) {
  playerScore += points;
  if (scoreDisplay) scoreDisplay.innerText = `Score: ${playerScore}`;
  checkLevelProgression();
}

function checkLevelProgression() {
  if (currentLevel === 1 && playerScore >= 20) {
    currentLevel = 2;
    spawnAliens(4);
  } else if (currentLevel === 2 && playerScore >= 50) {
    currentLevel = 3;
    spawnAliens(16);
  } else if (currentLevel === 3 && playerScore >= 80) {
    currentLevel = 4;
    spawnAliens(32);
  } else if (currentLevel === 4 && playerScore >= 100 && boss.style.display === 'none' && !is50PercentWaveTriggered) {
    spawnAliens(0);
    boss.style.display = "block";
    activateShield();
    setInterval(activateShield, 15000);
  }
}

// ================== Input Events ==================
// FIX: Restored the full input handling logic
document.addEventListener("keydown", (e) => {
  if (e.key === "a" || e.key === "ArrowLeft") keysHeld.left = true;
  if (e.key === "d" || e.key === "ArrowRight") keysHeld.right = true;
  if (e.code === "Space" && !keysHeld.space) {
    keysHeld.space = true;
    startFiringLazer();
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "a" || e.key === "ArrowLeft") keysHeld.left = false;
  if (e.key === "d" || e.key === "ArrowRight") keysHeld.right = false;
  if (e.code === "Space") {
    keysHeld.space = false;
    stopFiringLazer();
  }
});


// ================== Game Loop ==================
function gameLoop() {
  // Check for movement keys held down
  if (keysHeld.left) moveSpaceship("left");
  if (keysHeld.right) moveSpaceship("right");

  // Check the boss phase on every frame
  checkBossPhase();

  requestAnimationFrame(gameLoop);
}

// ================== Start Game ==================
spawnAliens(alienCount);
// Assign the interval to a variable so we can clear it at the end of the game
const asteroidSpawner = setInterval(spawnAsteroid, 3000);
gameLoop(); // Starts the game loop