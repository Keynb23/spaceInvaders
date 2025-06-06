// ================== DOM References ==================
let activeAsteroids = [];
const maxAsteroids = 7;

const spaceship = document.getElementById("spaceship");
const lazer = document.getElementById("lazer");
const explosion = document.getElementById("explosion");
const boss = document.getElementById("boss");
const bossHealthbar = document.getElementById("bossHealthbar");
const shield = document.getElementById("shield");
const scoreDisplay = document.getElementById("score");

// ================== Game Settings ==================
const gameWidth = 1600;
const gameHeight = 1200;
const lazerSpeed = 10;
let spaceshipSpeed = 15;
let lazerActive = false;
let bossHealth = 100;
let playerScore = 0;
let playerHits = 0;
let playerHearts = 3;

let alienSpeed = 3;
let alienCount = 2;
let aliensArray = [];
let currentLevel = 1;

// ================== Initial Setup ==================
explosion.style.display = "none";
lazer.style.display = "none";
shield.style.display = "none";
boss.style.display = "none";

spaceship.style.left = gameWidth / 2 - spaceship.offsetWidth / 2 + "px";
spaceship.style.bottom = "20px";

const hearts = document.querySelectorAll(".heart");
hearts.forEach((heart) => heart.style.position = "relative");

// ================== Movement ==================
function moveSpaceship(direction) {
    const currentLeft = spaceship.offsetLeft;
    if (direction === "left" && currentLeft > 0) {
        spaceship.style.left = currentLeft - spaceshipSpeed + "px";
    }
    if (direction === "right" && currentLeft + spaceship.offsetWidth < gameWidth) {
        spaceship.style.left = currentLeft + spaceshipSpeed + "px";
    }
    updateLazerPostion();
}

function updateLazerPostion() {
    lazer.style.left = spaceship.offsetLeft + spaceship.offsetWidth / 2 - 1.5 + "px";
    lazer.style.top = spaceship.offsetTop - 25 + "px";
}

// ================== Laser Firing ==================
function fireLazer() {
    const newLazer = document.createElement("div");
    newLazer.classList.add("lazer");
    newLazer.style.position = "absolute";
    newLazer.style.left = spaceship.offsetLeft + spaceship.offsetWidth / 2 - 1.5 + "px";
    newLazer.style.top = spaceship.offsetTop - 25 + "px";
    document.body.appendChild(newLazer);

    const lazerInterval = setInterval(() => {
        let top = newLazer.offsetTop;
        if (top < 0) {
            clearInterval(lazerInterval);
            newLazer.remove();
            return;
        }

        newLazer.style.top = top - lazerSpeed + "px";

        aliensArray.forEach((alien, index) => {
            if (checkCollision(newLazer, alien)) {
                showExplosion(alien.offsetLeft, alien.offsetTop);
                alien.remove();
                aliensArray.splice(index, 1);
                updateScore();
                clearInterval(lazerInterval);
                newLazer.remove();
            }
        });

        if (checkCollision(newLazer, boss)) {
            reduceBossHealth(10);
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

let lazerFireInterval = null;
const keysHeld = { left: false, right: false, space: false };

// ================== Input Handling ==================
document.addEventListener("keydown", (e) => {
    if (e.key === "a") keysHeld.left = true;
    if (e.key === "d") keysHeld.right = true;
    if (e.code === "Space" && !keysHeld.space) {
        keysHeld.space = true;
        startFiringLazer();
    }
    if (keysHeld.left) moveSpaceship("left");
    if (keysHeld.right) moveSpaceship("right");
});

document.addEventListener("keyup", (e) => {
    if (e.key === "a") keysHeld.left = false;
    if (e.key === "d") keysHeld.right = false;
    if (e.code === "Space") {
        keysHeld.space = false;
        stopFiringLazer();
    }
});

// ================== Score & Levels ==================
function updateScore() {
    playerScore += 10;
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
    } else if (currentLevel === 4 && playerScore >= 100) {
        spawnAliens(80);
        boss.style.display = "block";
    }
}

// ================== Boss Mechanics ==================
function reduceBossHealth(amount) {
    bossHealth -= amount;
    if (bossHealth < 0) bossHealth = 0;
    bossHealthbar.style.width = bossHealth + "%";
    if (bossHealth === 0) {
        showExplosion(boss.offsetLeft, boss.offsetTop);
        boss.style.display = "none";
    }
}

// ================== Visual Effects ==================
function showExplosion(x, y) {
    explosion.style.left = x + "px";
    explosion.style.top = y + "px";
    explosion.style.display = "block";
    setTimeout(() => explosion.style.display = "none", 500);
}

function activateShield() {
    if (shield.style.display === "block") return;
    shield.style.display = "block";
    setTimeout(() => shield.style.display = "none", 500);
}

// ================== Aliens ==================
function spawnAliens(count) {
    aliensArray.forEach(a => a.remove());
    aliensArray = [];

    for (let i = 0; i < count; i++) {
        const alien = document.createElement("div");
        alien.classList.add("aliens");

        const columns = Math.ceil(Math.sqrt(count));
        const spacingX = gameWidth / columns;
        const spacingY = 60;

        const row = Math.floor(i / columns);
        const col = i % columns;

        alien.style.left = `${col * spacingX}px`;
        alien.style.top = `${row * spacingY + 50}px`;

        document.body.appendChild(alien);
        aliensArray.push(alien);

        moveAlien(alien);
        alienShootLoop(alien);
    }
}

function moveAlien(alien) {
    let direction = 1;
    let pos = alien.offsetLeft;
    const interval = setInterval(() => {
        pos += direction * alienSpeed;
        alien.style.left = pos + "px";
        if (pos <= 0 || pos + alien.offsetWidth >= gameWidth) direction *= -1;
        if (!document.body.contains(alien)) clearInterval(interval);
    }, 30);
}

function alienShootLoop(alien) {
    setInterval(() => {
        if (!document.body.contains(alien)) return;
        shootAlienLazer(alien);
        setTimeout(() => shootAlienLazer(alien), 300);
    }, 5000);
}

function shootAlienLazer(alien) {
    const lazer = document.createElement("div");
    lazer.classList.add("alienLazers");
    lazer.style.left = alien.offsetLeft + alien.offsetWidth / 2 + "px";
    lazer.style.top = alien.offsetTop + alien.offsetHeight + "px";
    document.body.appendChild(lazer);

    let interval = setInterval(() => {
        let top = lazer.offsetTop;
        if (top > gameHeight) {
            lazer.remove();
            clearInterval(interval);
            return;
        }

        lazer.style.top = top + lazerSpeed * 0.75 + "px";

        if (checkCollision(lazer, spaceship)) {
            lazer.remove();
            clearInterval(interval);
            playerHits++;
            updateHearts();
            if (playerHits >= 9) {
                alert("Game Over");
                location.reload();
            }
        }
    }, 30);
}

// ================== Collision Detection ==================
function checkCollision(a, b) {
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();
    return (
        aRect.left < bRect.right &&
        aRect.right > bRect.left &&
        aRect.top < bRect.bottom &&
        aRect.bottom > bRect.top
    );
}

// ================== Hearts ==================
function updateHearts() {
    const heart1 = document.getElementById("heart1");
    const heart2 = document.getElementById("heart2");
    const heart3 = document.getElementById("heart3");
    if (playerHits >= 3) heart1.style.opacity = 0.2;
    if (playerHits >= 6) heart2.style.opacity = 0.2;
    if (playerHits >= 9) heart3.style.opacity = 0.2;
}

// ================== Asteroids ==================
function spawnAsteroid() {
    if (activeAsteroids.length >= maxAsteroids) return;
    const asteroid = document.createElement("div");
    asteroid.classList.add("asteroid");
    const randomX = Math.floor(Math.random() * (gameWidth - 120));
    asteroid.style.left = randomX + "px";
    asteroid.style.top = "-100px";
    document.body.appendChild(asteroid);
    activeAsteroids.push(asteroid);

    const fallSpeed = Math.random() * 3 + 2;
    const asteroidInterval = setInterval(() => {
        const currentTop = parseInt(asteroid.style.top);
        if (currentTop > gameHeight) {
            clearInterval(asteroidInterval);
            asteroid.remove();
            activeAsteroids = activeAsteroids.filter(a => a !== asteroid);
            return;
        }
        asteroid.style.top = currentTop + fallSpeed + "px";
    }, 30);
}

setInterval(() => {
    if (Math.random() < 0.25) spawnAsteroid();
}, 1000);

// ================== Start Game ==================
updateLazerPostion();
spawnAliens(alienCount);
