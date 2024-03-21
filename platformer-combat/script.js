document.addEventListener("DOMContentLoaded", function () {
	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d");

	// UTILS

	function offsetVector(a, b) {
		const offset = { x: a.x - b.x, y: a.y - b.y };
		return offset;
	}
	function getVectorLength(a) {
		const length = Math.sqrt(Math.pow(a.x, 2) + Math.pow(a.y, 2));
		return length;
	}
	function getVectorDistance(a, b) {
		const distance = getVectorLength(offsetVector(a, b));
		return distance;
	}
	function normaliseVector(a) {
		const normalised = {
			x: a.x / getVectorLength(a),
			y: a.y / getVectorLength(a),
		};
		return normalised;
	}
	function getDotProduct(a, b) {
		const dotProduct = a.x * b.x + a.y * b.y;
		return dotProduct;
	}
	function addVector(a, b) {
		const vector = { x: a.x + b.x, y: a.y + b.y };
		return vector;
	}

	// VARIABLES

	const GRAVITY = 2;

	const enemies = [
		{
			x: 300,
			y: 200,
			vx: 0,
			vy: 0,
			ax: 0,
			ay: 0,
			speed: 45,
			weight: 0.5,
			deceleration: 0.91,
			width: 20,
			height: 20,
			color: "blue",
			jumpSpeed: 750,
			onGround: false,
			direction: 0,
			isAttacking: false,
			pY: 0,
			health: 100,
			damage: 20,
		},
	];

	const player = {
		x: 20,
		pY: 0,
		y: 100,
		vx: 0,
		vy: 0,
		ax: 0,
		ay: 0,
		speed: 30,
		weight: 1,
		deceleration: 0.91,
		width: 20,
		height: 20,
		color: "cyan",
		jumpSpeed: 750,
		grounded: false,
		direction: "idle",
		isAttacking: false,
		health: 100,
		damage: 20,
	};

	const platforms = [
		{
			x: 0,
			y: canvas.height - 20,
			width: canvas.width,
			height: 50,
			color: "green",
		},
		{
			x: 300,
			y: canvas.height - 100,
			width: 100,
			height: 50,
			color: "green",
		},
		{
			x: 400,
			y: canvas.height - 150,
			width: 100,
			height: 50,
			color: "green",
		},
		{
			x: 150,
			y: canvas.height - 200,
			width: 100,
			height: 50,
			color: "green",
		},
	];

	const projectiles = [];

	// RENDERING FUNCTIONS
	function renderEnemy() {
		for (let i = 0; i < enemies.length; i++) {
			ctx.fillStyle = enemies[i].color;
			ctx.beginPath();
			ctx.arc(
				enemies[i].x + enemies[i].width / 2,
				enemies[i].y + enemies[i].height / 2,
				enemies[i].width / 2,
				0,
				2 * Math.PI
			);
			ctx.fill();
			ctx.closePath();
		}
	}

	function renderPlatforms() {
		platforms.forEach(function (platform) {
			ctx.fillStyle = platform.color;
			ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
		});
	}

	function renderPlayer() {
		ctx.fillStyle = player.color;
		ctx.beginPath();
		ctx.arc(
			player.x + player.width / 2,
			player.y + player.height / 2,
			player.width / 2,
			0,
			2 * Math.PI
		);
		ctx.fill();
		ctx.closePath();
	}

	function renderProjectiles() {
		for (let i = 0; i < projectiles.length; i++) {
			ctx.fillStyle = projectiles[i].color;
			ctx.beginPath();
			ctx.arc(
				projectiles[i].x + projectiles[i].width / 2,
				projectiles[i].y + projectiles[i].height / 2,
				projectiles[i].width / 2,
				0,
				2 * Math.PI
			);
			ctx.fill();
			ctx.closePath();
		}
	}

	// PHYSICS FUNCTIONS

	function checkPlatformCollisionEnemy() {
		for (let i = 0; i < enemies.length; i++) {
			enemies[i].onGround = false;
			for (let j = 0; j < platforms.length; j++) {
				if (
					enemies[i].x < platforms[j].x + platforms[j].width &&
					enemies[i].x + enemies[i].width > platforms[j].x &&
					enemies[i].y < platforms[j].y + platforms[j].height &&
					enemies[i].y + enemies[i].height > platforms[j].y
				) {
					const bottomEnemy = enemies[i].y + enemies[i].height;
					const fromTop = enemies[i].pY + enemies[i].height <= platforms[j].y;

					if (fromTop && bottomEnemy >= platforms[j].y) {
						enemies[i].y = platforms[j].y - enemies[i].height;
						enemies[i].vy = 0;
						enemies[i].onGround = true;
					} else {
						// should stop here
					}
				}
			}
			enemies[i].pY = enemies[i].y;
		}
	}

	function checkPlatformCollisionPlayer() {
		player.grounded = false;
		for (let i = 0; i < platforms.length; i++) {
			if (
				player.x < platforms[i].x + platforms[i].width &&
				player.x + player.width > platforms[i].x &&
				player.y < platforms[i].y + platforms[i].height &&
				player.y + player.height > platforms[i].y
			) {
				const bottomPlayer = player.y + player.height;
				const fromTop = player.pY + player.height <= platforms[i].y;
				if (fromTop && bottomPlayer >= platforms[i].y) {
					player.y = platforms[i].y - player.height;
					player.vy = 0;
					player.grounded = true;
				}
			}
		}
		player.pY = player.y;
	}

	function checkBoundariesEnemy() {
		for (let i = 0; i < enemies.length; i++) {
			if (enemies[i].x < 0) {
				enemies[i].x = 0;
			} else if (enemies[i].x + enemies[i].width > canvas.width) {
				enemies[i].x = canvas.width - enemies[i].width;
			}
		}
	}

	function checkBoundariesPlayer() {
		if (player.x < 0) {
			player.x = 0;
		} else if (player.x + player.width > canvas.width) {
			player.x = canvas.width - player.width;
		}
	}

	function applyGravityEnemy() {
		for (let i = 0; i < enemies.length; i++) {
			if (!enemies[i].grounded) {
				enemies[i].ay += GRAVITY * enemies[i].weight;
			} else {
				enemies[i].ay = 0;
			}
		}
	}

	function applyGravityPlayer() {
		if (!player.grounded) {
			player.ay += GRAVITY * player.weight;
		} else {
			player.ay = 0;
		}
	}

	// PLAYER FUNCTIONS

	function updatePlayer(deltaTime) {
		player.vx += player.ax;
		player.vy += player.ay;
		player.vx *= player.deceleration;
		player.vy *= player.deceleration;
		player.x += player.vx * deltaTime;
		player.y += player.vy * deltaTime;
	}

	function playerJump() {
		player.vy = -player.jumpSpeed;
	}

	function playerAttackEnemy(enemy) {
		const distance = getVectorDistance(player, enemy);
		if (distance < 50) {
			enemy.x += enemy.x > player.x ? 10 : -10;
			enemy.health -= player.damage;
			enemy.color = "red";
		} else {
			enemy.color = "blue";
		}
	}

	function playerAttack() {
		for (let i = 0; i < enemies.length; i++) {
			const enemy = enemies[i];
			const distance = getVectorDistance(player, enemy);
			player.isAttacking = true;
			if (distance < 50) {
				playerAttackEnemy(enemy);
				setTimeout(function () {
					enemy.color = "blue";
					player.isAttacking = false;
				}, 500);
			} else {
				setTimeout(function () {
					player.isAttacking = false;
				}, 500);
			}
		}
	}

	// PROJECTILE FUNCTIONS

	function updateProjectiles(deltaTime) {
		for (let j = 0; j < projectiles.length; j++) {
			const projectile = projectiles[j];
			projectile.x += projectile.vx * deltaTime;
			if (
				projectile.x < 0 ||
				projectile.x > canvas.width ||
				projectile.y < 0 ||
				projectile.y > canvas.height
			) {
				projectiles.splice(j, 1);
			}
			for (let i = 0; i < enemies.length; i++) {
				const enemy = enemies[i];
				const distance = getVectorDistance(projectile, enemy);
				if (distance < projectile.width / 2 + enemy.width / 2) {
					projectiles.splice(j, 1);
					enemies[i].health -= player.damage;
				}
			}
		}
	}

	function playerProjectile(direction) {
		projectiles.push({
			x: player.x + player.width / 2,
			y: player.y + player.height / 2,
			vx: player.vx,
			vy: player.vy,
			ax: 0,
			ay: 0,
			width: 5,
			height: 5,
			color: "orange",
		});

		setTimeout(function () {
			projectiles.pop();
			player.isAttacking = false;
		}, 300);

		if (direction === "left") {
			projectiles[projectiles.length - 1].vx = -900;
		} else if (direction === "right") {
			projectiles[projectiles.length - 1].vx = 900;
		}
	}

	function shootProjectile() {
		if (player.isAttacking) {
			return;
		}
		player.isAttacking = true;
		const direction = player.direction;
		playerProjectile(direction);
	}

	// AI FUNCTIONS

	function updateEnemy(deltaTime) {
		for (let i = 0; i < enemies.length; i++) {
			const enemy = enemies[i];
			enemy.vx += enemy.ax;
			enemy.vy += enemy.ay;
			enemy.vx *= enemy.deceleration;
			enemy.vy *= enemy.deceleration;
			enemy.x += enemy.vx * deltaTime;
			enemy.y += enemy.vy * deltaTime;

			moveAI(enemy);
			enemyAttack(enemy);
		}
	}

	function moveAI(enemy) {
		const distance = getVectorDistance(enemy, player);

		if (distance < 100) {
			const directionVector = offsetVector(player, enemy);
			const normalizedVector = normaliseVector(directionVector);

			enemy.vx = normalizedVector.x * enemy.speed;
		} else {
			enemy.vx = 0;
		}
	}

	function enemyAttack(enemy) {
		const distance = getVectorDistance(enemy, player);
		if (distance < 20) {
			player.health -= 1;
			player.x += player.x > enemy.x ? 10 : -10;
		} else {
			setTimeout(function () {
				player.color = "cyan";
			}, 500);
			enemy.color = "blue";
		}
	}

	// INPUT FUNCTIONS
	const keys = {
		left: false,
		right: false,
		jump: false,
		attack: false,
		shoot: false,
		down: false,
		up: false,
	};

	function checkKeys() {
		if (keys.left) {
			player.ax = -player.speed;
			player.direction = "left";
		} else if (keys.right) {
			player.ax = player.speed;
			player.direction = "right";
		} else {
			player.ax = 0;
		}
		if (keys.jump) {
			if (player.grounded) {
				playerJump();
			}
		}
		if (keys.attack) {
			if (!player.isAttacking) {
				playerAttack();
			}
		}
		if (keys.shoot) {
			if (!player.isAttacking) {
				shootProjectile();
			}
		}
	}

	// EVENTS

	document.addEventListener("keydown", function movePlayer(e) {
		e.preventDefault();
		switch (e.keyCode) {
			case 37: // Left
				keys.left = true;
				break;
			case 65: // Left
				keys.left = true;
				break;
			case 39: // Right
				keys.right = true;
				break;
			case 68: // Right
				keys.right = true;
				break;
			case 32: // Space
				keys.jump = true;
				break;
			case 38: // Up
				keys.up = true;
				break;
			case 87: // Up
				keys.up = true;
				break;
			case 83: // Down
				keys.down = true;
				break;
			case 40: // Down
				keys.down = true;
				break;
			case 16: // Right Shift
				keys.attack = true;
				break;
			case 17: // Right Control
				keys.shoot = true;
				break;
		}
	});

	document.addEventListener("keyup", function stopPlayer(e) {
		switch (e.keyCode) {
			case 37: // Left
				keys.left = false;
				break;
			case 65: // Left
				keys.left = false;
				break;
			case 39: // Right
				keys.right = false;
				break;
			case 68: // Right
				keys.right = false;
				break;
			case 32: // Space
				keys.jump = false;
				break;
			case 38: // Up
				keys.up = false;
				break;
			case 87: // Up
				keys.up = false;
				break;
			case 83: // Down
				keys.down = false;
				break;
			case 40: // Down
				keys.down = false;
				break;
			case 16: // Right Shift
				keys.attack = false;
				break;
			case 17: // Right Control
				keys.shoot = false;
				break;
		}
	});

	// GAME LOGIC

	function render() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		renderPlatforms();
		renderEnemy();
		renderPlayer();
		renderProjectiles();
	}

	function update(deltaTime) {
		updatePlayer(deltaTime);
		updateEnemy(deltaTime);
		updateProjectiles(deltaTime);
	}

	function input() {
		checkKeys();
	}

	function physics() {
		// ENEMY
		checkPlatformCollisionEnemy();
		checkBoundariesEnemy();
		applyGravityEnemy();

		// PLAYER
		checkPlatformCollisionPlayer();
		checkBoundariesPlayer();
		applyGravityPlayer();
	}

	function debug(deltaTime) {
		const log = console.log;
		log(enemies[0].health);
	}

	let lastTime = performance.now();

	function animate(timestamp = 0) {
		const deltaTime = (timestamp - lastTime) / 1000;
		lastTime = timestamp;

		input();
		update(deltaTime);
		physics(deltaTime);
		render();
		debug(deltaTime);

		requestAnimationFrame(animate);
	}

	animate();
});
