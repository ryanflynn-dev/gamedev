document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 960; // 1920/2 = 960
  canvas.height = 540; // 1080/2 = 540

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

  // GLOBAL VARIABLES

  const GRAVITY = 2;

  const inventory = [];

  const playerPowerUps = [];

  const projectiles = [];

  const camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
    zoom: 2,
  };

  // LEVEL VARIABLES

  let enemies = [];

  let player = {};

  let items = [];

  let powerUps = [];

  let platforms = [];

  let lava = [];

  let walls = [];

  let ceilings = [];

  let emptySpace = [];

  let worldWidth = 0;

  let worldHeight = 0;

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
    for (let i = 0; i < platforms.length; i++) {
      ctx.fillStyle = platforms[i].color;
      ctx.fillRect(
        platforms[i].x,
        platforms[i].y,
        platforms[i].width,
        platforms[i].height
      );
    }
  }

  function renderLava() {
    for (let i = 0; i < lava.length; i++) {
      ctx.fillStyle = lava[i].color;
      ctx.fillRect(lava[i].x, lava[i].y, lava[i].width, lava[i].height);
    }
  }

  function renderWalls() {
    for (let i = 0; i < walls.length; i++) {
      ctx.fillStyle = walls[i].color;
      ctx.fillRect(walls[i].x, walls[i].y, walls[i].width, walls[i].height);
    }
  }

  function renderCeilings() {
    for (let i = 0; i < ceilings.length; i++) {
      ctx.fillStyle = ceilings[i].color;
      ctx.fillRect(
        ceilings[i].x,
        ceilings[i].y,
        ceilings[i].width,
        ceilings[i].height
      );
    }
  }

  function renderEmptySpace() {
    for (let i = 0; i < emptySpace.length; i++) {
      ctx.fillStyle = black;
      ctx.fillRect(
        emptySpace[i].x,
        emptySpace[i].y,
        emptySpace[i].width,
        emptySpace[i].height
      );
    }
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

  function renderEntity(entity) {
    if (!entity.imgReady) return;

    const animation = entity.animations[entity.state];
    let frameWidth = entity.img.width / animation.frameCount;
    let frameHeight = entity.img.height;
    entity.currentFrame %= animation.frameCount;

    ctx.drawImage(
      entity.img,
      entity.currentFrame * frameWidth,
      0,
      frameWidth,
      frameHeight,
      entity.x,
      entity.y,
      entity.width,
      entity.height
    );
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

  function renderMiniMap() {
    const miniMapScale = 0.1;
    const miniMapWidth = worldWidth * miniMapScale;
    const miniMapHeight = worldHeight * miniMapScale;

    const miniMapPosX = 5;
    const miniMapPosY = 5;

    ctx.fillStyle = "grey";
    ctx.fillRect(miniMapPosX, miniMapPosY, miniMapWidth, miniMapHeight);

    for (let i = 0; i < platforms.length; i++) {
      ctx.fillStyle = platforms[i].color;
      ctx.fillRect(
        miniMapPosX + platforms[i].x * miniMapScale,
        miniMapPosY + platforms[i].y * miniMapScale,
        miniMapPosX + platforms[i].width * miniMapScale,
        platforms[i].height * miniMapScale
      );
    }

    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(
      miniMapPosX + player.x * miniMapScale,
      miniMapPosY + player.y * miniMapScale,
      (player.width / 2) * miniMapScale,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }

  // ASSETS

  const playerAnimations = {
    idle: {
      startFrame: 0,
      frameCount: 9,
      frameDuration: 100,
    },
    attack: {
      startFrame: 0,
      frameCount: 5,
      frameDuration: 100,
    },
    move: {
      startFrame: 0,
      frameCount: 8,
      frameDuration: 100,
    },
    jump: {
      startFrame: 0,
      frameCount: 9,
      frameDuration: 200,
    },
    shoot: {
      startFrame: 0,
      frameCount: 14,
      frameDuration: 100,
    },
  };

  function updateEntityAnimation(entity, deltaTime) {
    const animation = entity.animations[entity.state];
    entity.timeSinceLastFrame += deltaTime;
    if (entity.timeSinceLastFrame >= animation.frameDuration) {
      entity.currentFrame++;
      entity.timeSinceLastFrame = 0;
      if (entity.currentFrame >= animation.frameCount) {
        entity.currentFrame = 0;
      }
    }
  }

  function loadImageForEntity(entity, stateChanges) {
    let baseSrc = entity.baseImagePath;
    let newState = stateChanges || entity.state;
    let newDirection = entity.direction || "right";
    let newSrc = `./${baseSrc}/${newState}-${newDirection}.png`;

    if (entity.img.src !== newSrc) {
      entity.img.src = newSrc;
      entity.imgReady = false;
      entity.img.addEventListener(
        "load",
        () => {
          entity.imgReady = true;
        },
        { once: true }
      );
    }
  }

  function setState(entity, newState) {
    if (entity.state !== newState) {
      entity.state = newState;
      loadImageForEntity(entity, newState);
    }
  }

  // CAMERA FUNCTIONS

  function updateCamera() {
    camera.x = Math.min(
      Math.max(player.x - canvas.width / 2 / camera.zoom, 0),
      worldWidth - canvas.width / camera.zoom
    );
    camera.y = Math.min(
      Math.max(player.y - canvas.height / 2 / camera.zoom, 0),
      worldHeight - canvas.height / camera.zoom
    );
  }

  function adjustZoom(level) {
    camera.zoom += level;
    camera.zoom = Math.max(1, camera.zoom);
    camera.width = canvas.width / camera.zoom;
    camera.height = canvas.height / camera.zoom;
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

  function checkLavaCollisionPlayer() {
    const lavaDamage = 10;
    for (let i = 0; i < lava.length; i++) {
      if (
        player.x < lava[i].x + lava[i].width &&
        player.x + player.width > lava[i].x &&
        player.y < lava[i].y + lava[i].height &&
        player.y + player.height > lava[i].y - 5
      ) {
        setTimeout(function () {
          player.color = "red";
          takeDamagePlayer(lavaDamage);
        }, 1000);
      } else {
        player.color = "cyan";
      }
    }
  }

  function checkWallCollisionPlayer() {
    for (let i = 0; i < walls.length; i++) {
      if (
        player.x < walls[i].x + walls[i].width &&
        player.x + player.width > walls[i].x &&
        player.y < walls[i].y + walls[i].height &&
        player.y + player.height > walls[i].y
      ) {
        const playerCenterX = player.x + player.width / 2;
        const wallCenterX = walls[i].x + walls[i].width / 2;

        if (playerCenterX < wallCenterX) {
          player.x = walls[i].x - player.width;
        } else {
          player.x = walls[i].x + walls[i].width;
        }
      }
    }
  }

  function checkWallCollisionEnemy() {
    for (let i = 0; i < enemies.length; i++) {
      for (let j = 0; j < walls.length; j++) {
        if (
          enemies[i].x < walls[j].x + walls[j].width &&
          enemies[i].x + enemies[i].width > walls[j].x &&
          enemies[i].y < walls[j].y + walls[j].height &&
          enemies[i].y + enemies[i].height > walls[j].y
        ) {
          enemies[i].x = walls[j].x - enemies[i].width;
        }
      }
    }
  }

  function checkCeilingCollisionPlayer() {
    for (let i = 0; i < ceilings.length; i++) {
      if (
        player.x < ceilings[i].x + ceilings[i].width &&
        player.x + player.width > ceilings[i].x &&
        player.y < ceilings[i].y + ceilings[i].height &&
        player.y + player.height > ceilings[i].y
      ) {
        player.y = ceilings[i].y + player.height;
      }
    }
  }

  function checkCeilingCollisionEnemy() {
    for (let i = 0; i < enemies.length; i++) {
      for (let j = 0; j < ceilings.length; j++) {
        if (
          enemies[i].x < ceilings[j].x + ceilings[j].width &&
          enemies[i].x + enemies[i].width > ceilings[j].x &&
          enemies[i].y < ceilings[j].y + ceilings[j].height &&
          enemies[i].y + enemies[i].height > ceilings[j].y
        ) {
          enemies[i].y = ceilings[j].y - enemies[i].height;
        }
      }
    }
  }

  function checkBoundariesEnemy() {
    for (let i = 0; i < enemies.length; i++) {
      if (enemies[i].x < 0) {
        enemies[i].x = 0;
      } else if (enemies[i].x + enemies[i].width > worldWidth) {
        enemies[i].x = worldWidth - enemies[i].width;
      }
    }
  }

  function checkBoundariesPlayer() {
    if (player.x < 0) {
      player.x = 0;
    } else if (player.x + player.width > worldWidth) {
      player.x = worldWidth - player.width;
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

  // LEVEL FUNCTIONS

  let currentLevel = 1;

  const levels = [
    // LEVEL 1
    {
      id: 1,
      platforms: [
        {
          x: 0,
          y: 540,
          width: 2900,
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
      ],
      items: [],
      enemies: [
        {
          color: "purple",
          x: 200,
          y: canvas.height - 40,
          vx: 0,
          vy: 0,
          ax: 0,
          ay: 0,
          speed: 45,
          weight: 0.5,
          deceleration: 0.91,
          width: 25,
          height: 25,
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
          width: 25,
          height: 25,
          color: "green",
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
          width: 25,
          height: 25,
          color: "orange",
          jumpSpeed: 750,
          onGround: false,
          direction: 0,
          isAttacking: false,
          pY: 0,
          health: 100,
          damage: 20,
        },
      ],
      player: {
        name: "player",
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
        width: 50,
        height: 50,
        color: "cyan",
        jumpSpeed: 750,
        grounded: false,
        direction: "right",
        state: "idle",
        isAttacking: false,
        maxHealth: 100,
        health: 100,
        damage: 20,
        maxEnergy: 100,
        energy: 100,
        energyRegen: 1,
        doubleJumpAvailable: false,
        img: new Image(),
        imgReady: false,
        animations: playerAnimations,
        baseImagePath: "assets/player",
        currentFrame: 0,
        timeSinceLastFrame: 0,
      },
      powerUps: [
        {
          name: "doublejump",
          id: 1,
          x: 300,
          y: canvas.height - 40,
          width: 20,
          height: 20,
          color: "pink",
        },
      ],
      entryPoints: [],
      walls: [
        {
          x: 200,
          y: canvas.height - 50,
          width: 10,
          height: 50,
          color: "blue",
        },
      ],
      ceilings: [
        {
          x: 200,
          y: canvas.height - 300,
          width: 1000,
          height: 10,
          color: "orange",
        },
      ],
      emptySpace: [],
      lava: [
        {
          x: 700,
          y: 540,
          width: 1000,
          height: 50,
          color: "red",
        },
      ],
      worldHeight: 1500,
      worldWidth: 3000,
    },
  ];

  function loadLevel(levelId) {
    const level = levels.find((l) => l.id === levelId);
    if (!level) {
      console.error("Level not found:", levelId);
      return;
    }
    currentLevel = levelId;
    platforms = level.platforms;
    lava = level.lava;
    walls = level.walls;
    ceilings = level.ceilings;
    items = level.items;
    enemies = level.enemies;
    player = level.player;
    powerUps = level.powerUps;
    worldHeight = level.worldHeight;
    worldWidth = level.worldWidth;
  }

  function checkWin() {
    if (enemies.length > 0) {
      return;
    }
    if (enemies.length === 0) {
      let nextLevel = currentLevel + 1;
      loadLevel(nextLevel);
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

  function takeDamagePlayer(damage) {
    if (player.health > 0) {
      player.health -= damage;
    } else if (player.health <= 0) {
      killPlayer();
      player.health = 0;
    }
  }

  function killPlayer() {
    // end game here
    console.log("YOU DIED");
  }

  function playerAttackEnemy(enemy) {
    const distance = getVectorDistance(player, enemy);
    if (distance < 50) {
      enemy.vx += enemy.x > player.x ? 1000 : -1000;
      takeDamageEnemy(enemy, player.damage);
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
      const projectileDamage = player.damage;
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
          takeDamageEnemy(enemy, projectileDamage);
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

      const distance = getVectorDistance(enemy, player);

      moveAI(enemy);
      if (distance < 40) {
        setTimeout(() => {
          enemyAttack(enemy);
        }, 100);
      }
    }
  }

  function takeDamageEnemy(enemy, damage) {
    if (enemy.health > 1) {
      enemy.health -= damage;
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
    player.color = "red";
    player.vx += player.x > enemy.x ? 50 : -50;
    takeDamagePlayer(enemy.damage);
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
      setState(player, "move");
    } else if (keys.right.pressed) {
      player.ax = player.speed;
      player.direction = "right";
      setState(player, "move");
    } else {
      player.ax = 0;
      if (!keys.jump.pressed && !keys.attack.pressed && !keys.shoot.pressed) {
        setState(player, "idle");
      }
    }
    if (player.grounded && keys.jump.pressed) {
      playerJump();
      player.grounded = false;
      player.doubleJumpAvailable = true;
      setState(player, "jump");
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
      setState(player, "jump");
    }
    if (keys.attack.pressed && !player.isAttacking) {
      playerAttack();
      setState(player, "attack");
    }
    if (keys.shoot.pressed && !player.isAttacking) {
      shootProjectile();
      setState(player, "shoot");
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
        break;
      case "KeyW": // Up
        keys.up.pressed = false;
        break;
      case "ArrowDown": // Down
        keys.down.pressed = false;
        break;
      case "KeyS": // Down
        keys.down.pressed = false;
        break;
      case "Comma": // Primary
        keys.attack.pressed = false;
        break;
      case "KeyX": // Primary
        keys.attack.pressed = false;
        break;
      case "Period": // Secondary
        keys.shoot.pressed = false;
        break;
      case "KeyZ": // Secondary
        keys.shoot.pressed = false;
        break;
    }
  });

  // GAME LOGIC

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    renderPlatforms();
    renderCeilings();
    renderWalls();
    renderEmptySpace();
    renderEnemy();
    renderItems();
    renderPowerUps();
    renderEntity(player);
    renderProjectiles();
    renderLava();

    ctx.restore();
    renderMiniMap();
  }

  function update(deltaTime) {
    checkWin();
    updatePlayer(deltaTime);
    updateEnemy(deltaTime);
    updateProjectiles(deltaTime);
    updateEntityAnimation(player, deltaTime);
    updateCamera();
    updateItems();
    updatePowerUps();
  }

  function input() {
    checkKeys();
  }

  function physics() {
    // ENEMY
    checkPlatformCollisionEnemy();
    checkWallCollisionEnemy();
    checkCeilingCollisionEnemy();
    checkBoundariesEnemy();
    applyGravityEnemy();

    // PLAYER
    checkPlatformCollisionPlayer();
    checkWallCollisionPlayer();
    checkCeilingCollisionPlayer();
    checkBoundariesPlayer();
    applyGravityPlayer();
    checkLavaCollisionPlayer();
  }

  function debug(deltaTime) {
    const log = console.log;
    log(player.timeSinceLastFrame);
  }

  let lastTime = performance.now();

  function animate(timestamp = 0) {
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    loadLevel(currentLevel);
    update(deltaTime);
    input();
    physics(deltaTime);
    render();
    debug(deltaTime);

    requestAnimationFrame(animate);
  }

  animate();
  loadImageForEntity(player, "idle");
});
