// events.js

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / gridSize);
    const y = Math.floor((event.clientY - rect.top) / gridSize);

    // Ici x et y représentent la position de la souris dans la grille
    // Vérifier si la cellule est vide et que ce qu'il y a autour est bien un chemin valide
    if (gameState.grid[y][x] === null && isAdjacentToPath(x, y) && gameState.argent >= 10) {
        // Ajouter une tour à la position du clic
        gameState.towers.push({
            x,
            y,
            width: gridSize,
            height: gridSize,
            attaque: 1,
            vitesse_attaque: 1000, // Vitesse d'attaque en millisecondes
            attackTimer: null // Pour stocker l'identifiant de l'intervalle d'attaque
        });
        attackEnemies();
        gameState.argent -= 10;
    }
});



// Réinitialiser le jeu lorsque la touche Entrée est pressée
document.addEventListener('keydown', (event) => {
    if (event.code === 'Enter' && gameState.gameOver) {
        // Réinitialiser l'état du jeu
        gameState.vie = 3;
        gameState.enemies = [];
        gameState.towers = [];
        gameState.projectiles = [];
        gameState.grid = [];

        // Re-créer la grille
        for (let y = 0; y < rows; y++) {
            const row = [];
            for (let x = 0; x < cols; x++) {
                row.push(null);
            }
            gameState.grid.push(row);
        }

        // Re-marquer le chemin dans la grille
        gameState.path.forEach(point => {
            gameState.grid[point.y][point.x] = 'path';
        });

        // Ajouter des tours, des ennemis, et des projectiles pour redémarrer le jeu
        gameState.towers.push({ x: 2, y: 2, width: gridSize, height: gridSize });
        gameState.enemies.push({
            x: gameState.path[0].x,
            y: gameState.path[0].y,
            width: gridSize,
            height: gridSize,
            pathIndex: 0
        });
        gameState.projectiles.push({ x: 3 * gridSize, y: 3 * gridSize, width: 10, height: 10 });

        // Réinitialiser le statut de fin de jeu
        gameState.gameOver = false;
    }
});
