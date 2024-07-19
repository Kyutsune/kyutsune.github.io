// main.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 500;

const gridSize = 50;
const cols = canvas.width / gridSize;
const rows = canvas.height / gridSize;



const gameState = {
  grid: [],
  towers: [],
  enemies: [],
  projectiles: [],
  path: [
    { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 },
    { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 },
    { x: 8, y: 5 }, { x: 9, y: 5 }, { x: 10, y: 5 }, { x: 11, y: 5 },
    { x: 12, y: 5 }, { x: 13, y: 5 }, { x: 14, y: 5 }, { x: 15, y: 5 }
  ],
  vie: 3,
  argent: 100,
  gameOver: false,
  difficulty: 1,
  nombre_ennemis_morts: 0
};

// Variables globales pour les intervalles
// Déplacer les ennemis à intervalles réguliers
let moveInterval = 1000; // 1000 ms = 1 seconde
let createEnemiesInterval = 4000; // 4000 ms = 4 secondes

// Variables globales pour les intervalles
let moveIntervalId = null;
let createEnemiesIntervalId = null;


// Initialiser la grille
for (let y = 0; y < rows; y++) {
  const row = [];
  for (let x = 0; x < cols; x++) {
    row.push(null);
  }
  gameState.grid.push(row);
}

// Marquer le chemin dans la grille
gameState.path.forEach(point => {
  gameState.grid[point.y][point.x] = 'path';
});

gameState.projectiles.push({ x: 3 * gridSize, y: 3 * gridSize, width: 10, height: 10 });

// Variables globales pour la gestion des événements de touche
let isKeyDown = false;

// Fonction de mise à jour du jeu
// Fonction de mise à jour du jeu
function update() {
  // Mettre à jour le texte en haut à droite
  update_text(`Argent restant: ${gameState.argent}`,'Money_in_pocket');
  update_text(`Vies restantes: ${gameState.vie}`,'Lives_left');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Vérifier si le jeu est terminé
  if (checkGameOver()) {
    gameState.gameOver = true;
    displayGameOverMessage();
    return; // Arrêter la mise à jour si le jeu est terminé
  }

  // Dessiner la grille
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (gameState.grid[y][x] === 'path') {
        ctx.fillStyle = 'green';
        ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
      }
      ctx.strokeStyle = '#333';
      ctx.strokeRect(x * gridSize, y * gridSize, gridSize, gridSize);
    }
  }

  // Dessiner les tours
  gameState.towers.forEach(tower => {
    ctx.fillStyle = 'blue';
    ctx.fillRect(tower.x * gridSize, tower.y * gridSize, tower.width, tower.height);
  });

  // Dessiner les ennemis
  gameState.enemies.forEach(enemy => {
    ctx.fillStyle = 'red';
    ctx.fillRect(enemy.x * gridSize, enemy.y * gridSize, enemy.width, enemy.height);

    // Calculer les coordonnées du texte et afficher la vie de l'ennemi
    const textX = enemy.x * gridSize + enemy.width / 2;
    const textY = enemy.y * gridSize + enemy.height / 2;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = '20px Arial';
    ctx.fillText(`${enemy.vie}/${enemy.total_vie}`, textX, textY);
  });

  // Dessiner les projectiles
  gameState.projectiles.forEach(projectile => {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
  });

  console.log(gameState.nombre_ennemis_morts);
  requestAnimationFrame(update);
}




// Gestionnaire d'événements pour les touches enfoncées
document.addEventListener('keydown', function (event) {
  if (event.key === '-' && !isKeyDown && gameState.vie > 0) {
    isKeyDown = true;
    gameState.vie--; // Enlever une vie
    console.log('Vies restantes:', gameState.vie);
  }
  if (event.key === "Enter" && gameState.gameOver) {
    // Réinitialiser l'état du jeu
    restart_game();
    // Recommencer la mise à jour du jeu
    update();
  }
});


// Gestionnaire d'événements pour les touches relâchées
document.addEventListener('keyup', function (event) {
  if (event.key === '-') {
    isKeyDown = false; // Réinitialiser le drapeau lorsque la touche est relâchée
  }
});

function init() {
  startIntervals();
  update();
}

init();
