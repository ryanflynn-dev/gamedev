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
      x: 600,
      y: canvas.height - 40,
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
    {
      x: 500,
      y: canvas.height - 40,
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
    {
      x: 450,
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
    maxHealth: 100,
    health: 100,
    damage: 20,
    maxEnergy: 100,
    energy: 100,
    energyRegen: 1,
    doubleJumpAvailable: false,
  };

  const inventory = [];

  const items = [
    {
      x: 400,
      y: canvas.height - 40,
      width: 20,
      height: 20,
      color: "red",
      type: "sword",
      item: "Swanky blade",
    },
  ];

  const powerUps = [
    {
      name: "doublejump",
      id: 1,
      x: 300,
      y: canvas.height - 40,
      width: 20,
      height: 20,
      color: "yellow",
    },
  ];

  const playerPowerUps = [];

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

  function renderPowerUps() {
    for (let i = 0; i < powerUps.length; i++) {
      ctx.fillStyle = powerUps[i].color;
      ctx.fillRect(
        powerUps[i].x,
        powerUps[i].y,
        powerUps[i].width,
        powerUps[i].height
      );
    }
  }

  function renderItems() {
    for (let i = 0; i < items.length; i++) {
      ctx.fillStyle = items[i].color;
      ctx.fillRect(items[i].x, items[i].y, items[i].width, items[i].height);
    }
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
          player.doubleJumpAvailable = false;
          keys.jump.active = false;
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
      if (!enemies[i].onGround) {
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

  // OTHER FUNCTIONS

  function updateItems() {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const distance = getVectorDistance(player, item);
      if (distance < player.width / 2 + item.width / 2) {
        inventory.push(item);
        items.splice(i, 1);
      }
    }
  }

  function updatePowerUps() {
    for (let i = 0; i < powerUps.length; i++) {
      const powerUp = powerUps[i];
      const distance = getVectorDistance(player, powerUp);
      if (distance < player.width / 2 + powerUp.width / 2) {
        playerPowerUps.push(powerUp.id);
        powerUps.splice(i, 1);
      }
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

    energyRegenPlayer(deltaTime);
  }

  function energyRegenPlayer(deltaTime) {
    if (player.energy < player.maxEnergy) {
      player.energy += player.energyRegen * deltaTime;
    }
  }

  function playerJump() {
    player.vy = -player.jumpSpeed;
  }

  function playerDoubleJump() {
    player.vy = -player.jumpSpeed * 1.5;
  }

  function takeDamagePlayer(enemy) {
    if (player.health > 0) {
      player.health -= enemy.damage;
    } else if (player.health <= 0) {
      player.health = 0;
      killPlayer();
    }
  }

  function killPlayer() {
    // end game here
  }

  function playerAttackEnemy(enemy) {
    const distance = getVectorDistance(player, enemy);
    if (distance < 50) {
      enemy.vx += enemy.x > player.x ? 1000 : -1000;
      takeDamageEnemy(enemy);
      enemy.color = "red";
    } else {
      enemy.color = "blue";
    }
  }

  function playerAttack() {
    if (!enemies.length) {
      return;
    }
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
          enemy.vx += enemy.x > projectile.x ? 1000 : -1000;
          takeDamageEnemy(enemy);
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
    if (player.isAttacking || player.energy < 10) {
      return;
    }
    player.isAttacking = true;
    player.energy -= 10;
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

  function takeDamageEnemy(enemy) {
    if (enemy.health > 1) {
      enemy.health -= player.damage;
    } else if (enemy.health <= 0) {
      killEnemy(enemy);
    }
  }

  function killEnemy(enemy) {
    console.log(enemy.color, "is ded");
    enemies.splice(enemies.indexOf(enemy), 1);
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
      takeDamagePlayer(enemy);
      player.vx += player.x > enemy.x ? 100 : -100;
    } else {
      setTimeout(function () {
        player.color = "cyan";
      }, 500);
      enemy.color = "blue";
    }
  }

  // INPUT FUNCTIONS
  const keys = {
    left: {
      pressed: false,
      active: false,
    },
    right: {
      pressed: false,
      active: false,
    },
    jump: {
      pressed: false,
      active: false,
    },
    up: {
      pressed: false,
      active: false,
    },
    down: {
      pressed: false,
      active: false,
    },
    attack: {
      pressed: false,
      active: false,
    },
    shoot: {
      pressed: false,
      active: false,
    },
  };

  function checkKeys() {
    if (keys.left.pressed) {
      player.ax = -player.speed;
      player.direction = "left";
    } else if (keys.right.pressed) {
      player.ax = player.speed;
      player.direction = "right";
    } else {
      player.ax = 0;
    }
    if (player.grounded && keys.jump.pressed) {
      playerJump();
      player.grounded = false;
      player.doubleJumpAvailable = true;
    }
    if (
      !player.grounded &&
      keys.jump.pressed &&
      keys.jump.active &&
      player.doubleJumpAvailable &&
      playerPowerUps.includes(1)
    ) {
      playerDoubleJump();
      player.doubleJumpAvailable = false;
      keys.jump.active = false;
    }
    if (keys.attack.pressed && !player.isAttacking) {
      playerAttack();
    }
    if (keys.shoot.pressed && !player.isAttacking) {
      shootProjectile();
    }
  }

  // EVENTS

  document.addEventListener("keydown", function keyDown(e) {
    switch (e.code) {
      case "KeyA": // Left
        keys.left.pressed = true;
        break;
      case "ArrowLeft": // Left
        keys.left.pressed = true;
        break;
      case "KeyD": // Right
        keys.right.pressed = true;
        break;
      case "ArrowRight": // Right
        keys.right.pressed = true;
        break;
      case "Space": // Jump
        keys.jump.pressed = true;
        break;
      case "ArrowUp": // Up
        keys.up.pressed = true;
        break;
      case "KeyW": // Up
        keys.up.pressed = true;
        break;
      case "ArrowDown": // Down
        keys.down.pressed = true;
        break;
      case "KeyS": // Down
        keys.down.pressed = true;
        break;
      case "Comma": // Primary
        keys.attack.pressed = true;
        break;
      case "KeyX": // Primary
        keys.attack.pressed = true;
        break;
      case "Period": // Secondary
        keys.shoot.pressed = true;
        break;
      case "KeyZ": // Secondary
        keys.shoot.pressed = true;
        break;
    }
  });

  document.addEventListener("keyup", function keyUp(e) {
    switch (e.code) {
      case "KeyA": // Left
        keys.left.pressed = false;
        break;
      case "ArrowLeft": // Left
        keys.left.pressed = false;
        break;
      case "KeyD": // Right
        keys.right.pressed = false;
        break;
      case "ArrowRight": // Right
        keys.right.pressed = false;
        break;
      case "Space": // Jump
        keys.jump.pressed = false;
        if (!player.grounded && player.doubleJumpAvailable) {
          keys.jump.active = true;
        }
        break;
      case "ArrowUp": // Up
        keys.up.pressed = false;
        keys.up.active = false;
        break;
      case "KeyW": // Up
        keys.up.pressed = false;
        keys.up.active = false;
        break;
      case "ArrowDown": // Down
        keys.down.pressed = false;
        keys.down.active = false;
        break;
      case "KeyS": // Down
        keys.down.pressed = false;
        keys.down.active = false;
        break;
      case "Comma": // Primary
        keys.attack.pressed = false;
        keys.attack.active = false;
        break;
      case "KeyX": // Primary
        keys.attack.pressed = false;
        keys.attack.active = false;
        break;
      case "Period": // Secondary
        keys.shoot.pressed = false;
        keys.shoot.active = false;
        break;
      case "KeyZ": // Secondary
        keys.shoot.pressed = false;
        keys.shoot.active = false;
        break;
    }
  });

  // GAME LOGIC

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderPlatforms();
    renderEnemy();
    renderItems();
    renderPowerUps();
    renderPlayer();
    renderProjectiles();
  }

  function update(deltaTime) {
    updatePlayer(deltaTime);
    updateEnemy(deltaTime);
    updateProjectiles(deltaTime);
    updateItems();
    updatePowerUps();
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

  function debug() {
    const log = console.log;
    log();
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
