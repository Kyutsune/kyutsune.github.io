// utils.js
// Vérifier si une position est adjacente ou diagonale à une cellule de chemin
function isAdjacentToPath(x, y) {
    const adjacentOffsets = [
        [-1, 0], [1, 0], [0, -1], [0, 1],    // Adjacent (haut, bas, gauche, droite)
        [-1, -1], [-1, 1], [1, -1], [1, 1]    // Diagonales (haut-gauche, haut-droit, bas-gauche, bas-droit)
    ];

    return adjacentOffsets.some(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        return (gameState.grid[ny] !== undefined) && (gameState.grid[ny][nx] === 'path');
    });
}


// Déplacer les ennemis le long du chemin
function moveEnemies() {
    gameState.enemies.forEach((enemy, index) => {
        if (enemy.pathIndex < gameState.path.length - 1) {
            enemy.pathIndex++;
            const nextPathPoint = gameState.path[enemy.pathIndex];
            enemy.x = nextPathPoint.x;
            enemy.y = nextPathPoint.y;
        }
        // Ennemi a atteint la fin du chemin 
        else {
            console.log('Ennemi a atteint la fin du chemin !');
            gameState.vie--; // Réduire les vies
            console.log('Vies restantes:', gameState.vie);

            gameState.enemies.splice(index, 1); // Supprimer l'ennemi du tableau

            // Vérifier si le jeu est terminé
            if (checkGameOver()) {
                gameState.gameOver = true;
            }
        }
    });
}

function createEnemies() {
    const enemy = {
        x: gameState.path[0].x,
        y: gameState.path[0].y,
        width: gridSize,
        height: gridSize,
        pathIndex: 0,
        vie: 15 * gameState.difficulty,
        total_vie: 15 * gameState.difficulty
    };
    gameState.enemies.push(enemy);
}


// Initialiser les intervalles
function startIntervals() {
    // Assurez-vous de ne pas créer plusieurs intervalles en même temps
    if (moveIntervalId) clearInterval(moveIntervalId);
    if (createEnemiesIntervalId) clearInterval(createEnemiesIntervalId);

    moveIntervalId = setInterval(moveEnemies, moveInterval);
    createEnemiesIntervalId = setInterval(createEnemies, createEnemiesInterval);
}

// Arrêter les intervalles
function stopIntervals() {
    if (moveIntervalId) clearInterval(moveIntervalId);
    if (createEnemiesIntervalId) clearInterval(createEnemiesIntervalId);
    stopAttackTimers(); // Arrêter les timers d'attaque des tours
}

function restart_game() {
    console.log('Réinitialisation du jeu...');

    // Réinitialiser le jeu
    gameState.vie = 3;
    gameState.gameOver = false;
    gameState.enemies = []; // Vider les ennemis
    gameState.towers = []; // Vider les tours
    gameState.projectiles = []; // Vider les projectiles
    gameState.argent = 90; // Réinitialiser l'argent
    gameState.difficulty = 1; // Réinitialiser la difficulté
    gameState.nombre_ennemis_morts = 0; // Réinitialiser le nombre d'ennemis tués

    // Recréer la grille
    gameState.grid = [];
    for (let y = 0; y < rows; y++) {
        const row = [];
        for (let x = 0; x < cols; x++) {
            row.push(null);
        }
        gameState.grid.push(row);
    }
    gameState.path.forEach(point => {
        gameState.grid[point.y][point.x] = 'path';
    });

    gameState.projectiles.push({ x: 3 * gridSize, y: 3 * gridSize, width: 10, height: 10 });

    // Réinitialiser les intervalles
    startIntervals();
}


// Vérifier si le jeu est terminé
function checkGameOver() {
    return gameState.vie <= 0;
}

// Afficher le message de défaite et nettoyer les intervalles
function displayGameOverMessage() {
    // Effacer l'écran
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Définir le style du texte
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle'; // Centrer verticalement le texte

    // Afficher le message de défaite
    ctx.fillText('Perdu ! Vous pouvez réessayer en appuyant sur Entrée', canvas.width / 2, canvas.height / 2);

    // Arrêter les intervalles
    stopIntervals();
}



// Fonction d'attaque des ennemis
function attackEnemies() {
    gameState.towers.forEach(tower => {
        // Si le timer d'attaque n'est pas déjà en cours, démarrez-le
        if (!tower.attackTimer) {
            tower.attackTimer = setInterval(() => {
                // Trouver tous les ennemis proches de la tour
                gameState.enemies.forEach((enemy, index) => {
                    // Vérifiez si l'ennemi est à proximité de la tour (y compris les diagonales)
                    const dx = Math.abs(enemy.x - tower.x);
                    const dy = Math.abs(enemy.y - tower.y);
                    if (dx <= 1 && dy <= 1) {
                        // La tour attaque l'ennemi
                        enemy.vie -= tower.attaque;
                        if (enemy.vie <= 0) {
                            // L'ennemi est éliminé
                            gameState.enemies.splice(index, 1); // Enlever l'ennemi du tableau
                            gameState.argent += 5; // Récompenser le joueur
                            // Incrémenter le nombre d'ennemis morts
                            gameState.nombre_ennemis_morts++;

                            // Vérifier si le nombre d'ennemis morts est divisible par 2
                            if (gameState.nombre_ennemis_morts % 2 === 0) {
                                gameState.difficulty += 0.5;
                            }
                        }
                    }
                });
            }, tower.vitesse_attaque);
        }
    });
}

// Fonction pour arrêter les timers d'attaque lorsque nécessaire
function stopAttackTimers() {
    gameState.towers.forEach(tower => {
        if (tower.attackTimer) {
            clearInterval(tower.attackTimer);
            tower.attackTimer = null; // Réinitialiser le timer
        }
    });
}

// Fonction pour mettre à jour le texte de l'élément avec l'ID Money_in_pocket
function update_text(txt, element_a_modif) {
    // Sélectionner l'élément avec l'ID Money_in_pocket
    let element_a_modifier = document.getElementById(element_a_modif);

    // Mettre à jour le contenu textuel de l'élément
    element_a_modifier.textContent = txt;
}
