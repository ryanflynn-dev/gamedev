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

  // CLASSES

  class Sprite {
    constructor({
      position,
      imageSrc,
      width,
      height,
      frameRate = 1,
      animations = {},
      frameBuffer = 2,
      loop = true,
      autoplay = true,
    }) {
      this.position = position;
      this.image = new Image();
      this.image.onload = () => {
        this.loaded = true;
        this.width = width;
        this.height = height;
      };
      this.image.src = imageSrc;
      this.loaded = false;
      this.frameRate = frameRate;
      this.currentFrame = 0;
      this.elapsedFrames = 0;
      this.frameBuffer = frameBuffer;
      this.animations = animations;
      this.loop = loop;
      this.autoplay = autoplay;
      this.currentAnimation;
      if (this.animations) {
        for (let key in this.animations) {
          const image = new Image();
          image.src = this.animations[key].imageSrc;
          this.animations[key].image = image;
        }
      }
    }
    render() {
      if (!this.loaded) return;
      const cropBox = {
        position: {
          x: this.currentFrame * (this.image.width / this.frameRate),
          y: 0,
        },
        width: this.image.width / this.frameRate,
        height: this.image.height,
      };
      ctx.drawImage(
        this.image,
        cropBox.position.x,
        cropBox.position.y,
        cropBox.width,
        cropBox.height,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );

      this.updateFrames();
    }

    debugBox() {
      ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
      ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

      ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
      ctx.fillRect(
        this.hitbox.position.x,
        this.hitbox.position.y,
        this.hitbox.width,
        this.hitbox.height
      );
    }

    play() {
      this.autoplay = true;
    }

    updateFrames() {
      if (!this.autoplay) return;
      this.elapsedFrames++;
      if (this.elapsedFrames % this.frameRate === 0) {
        if (this.currentFrame < this.frameRate - 1) {
          this.currentFrame++;
        } else if (this.loop) {
          this.currentFrame = 0;
        }
      }
      if (this.currentAnimation?.onComplete) {
        if (
          this.currentFrame === this.frameRate - 1 &&
          !this.currentAnimation.isActive
        ) {
          this.currentAnimation.onComplete();
          this.currentAnimation.isActive = true;
        }
      }
    }
  }

  class Player extends Sprite {
    constructor({
      position,
      imageSrc,
      width,
      height,
      frameRate,
      animations,
      loop,
    }) {
      super({ imageSrc, width, height, frameRate, animations, loop });
      this.position = position;
      this.previousPosition = { x: 0, y: 0 };
      this.velocity = { x: 0, y: 0 };
      this.acceleration = { x: 0, y: 0 };
      this.speed = 30;
      this.weight = 1;
      this.deceleration = 0.91;
      this.color = "cyan";
      this.jumpSpeed = 750;
      this.onGround = false;
      this.isAttacking = false;
      this.direction = "right";
      this.state = "idle";
      this.health = 100;
      this.maxHealth = 100;
      this.energy = 100;
      this.maxEnergy = 100;
      this.energyRegen = 1;
      this.doubleJumpAvailable = false;
      this.damage = 20;
      this.hitbox = {
        position: {
          x: 0,
          y: 0,
        },
        width: 0,
        height: 0,
      };
    }
    update(deltaTime) {
      this.velocity.x += this.acceleration.x;
      this.velocity.y += this.acceleration.y;
      this.velocity.x *= this.deceleration;
      this.velocity.y *= this.deceleration;
      this.position.x += this.velocity.x * deltaTime;
      this.position.y += this.velocity.y * deltaTime;

      this.applyGravity();
      this.checkBoundaries();
      this.checkPlatformCollision();
      this.checkCeilingCollision();
      this.checkWallCollision();
      this.checkLavaCollision();
      this.energyReg(deltaTime);
      this.updateHitbox();
    }
    // Effects
    energyReg(deltaTime) {
      if (this.energy < this.maxEnergy) {
        this.energy += this.energyRegen * deltaTime;
      }
    }
    takeDamage(damage) {
      if (this.health > 0) {
        this.health -= damage;
      } else if (this.health <= 0) {
        this.killPlayer();
        this.health = 0;
      }
    }
    killPlayer() {
      console.log("End game");
      // end game here
    }
    // Abilities
    jump() {
      this.velocity.y = -player.jumpSpeed;
    }
    doubleJump() {
      player.velocity.y = -player.jumpSpeed * 1.5;
    }
    attack() {
      if (!enemies.length) {
        return;
      }
      for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        const distance = getVectorDistance(this.position, enemy);
        this.isAttacking = true;
        if (distance < 50) {
          this.attackEnemy(enemy);
          setTimeout(() => {
            this.isAttacking = false;
          }, 500);
        } else {
          setTimeout(() => {
            this.isAttacking = false;
          }, 500);
        }
      }
    }
    attackEnemy(enemy) {
      const distance = getVectorDistance(this.position, enemy);
      if (distance < 50) {
        enemy.vx += enemy.x > this.position.x ? 1000 : -1000;
        takeDamageEnemy(enemy, this.damage);
      }
    }
    // Physics
    checkBoundaries() {
      const offset = 10;
      if (this.hitbox.position.x < 0) {
        this.position.x = 0 - offset + 0.01;
      } else if (this.hitbox.position.x + this.hitbox.width > worldWidth) {
        this.position.x = worldWidth - this.width + offset - 0.01;
      }
    }
    checkPlatformCollision() {
      this.onGround = false;
      for (let i = 0; i < platforms.length; i++) {
        if (
          this.hitbox.position.x < platforms[i].x + platforms[i].width &&
          this.hitbox.position.x + this.hitbox.width > platforms[i].x &&
          this.hitbox.position.y < platforms[i].y + platforms[i].height &&
          this.hitbox.position.y + this.hitbox.height > platforms[i].y
        ) {
          const bottomPlayer = this.hitbox.position.y + this.hitbox.height;
          const fromTop =
            this.previousPosition.y + this.hitbox.height <= platforms[i].y;
          if (fromTop && bottomPlayer >= platforms[i].y) {
            this.position.y = platforms[i].y - this.height;
            this.velocity.y = 0;
            this.onGround = true;
            this.doubleJumpAvailable = false;
          }
        }
      }
      this.previousPosition.y = this.position.y;
    }
    checkCeilingCollision() {
      const offset = 40;
      for (let i = 0; i < ceilings.length; i++) {
        if (
          this.hitbox.position.x < ceilings[i].x + ceilings[i].width &&
          this.hitbox.position.x + this.hitbox.width > ceilings[i].x &&
          this.hitbox.position.y < ceilings[i].y + ceilings[i].height &&
          this.hitbox.position.y + this.hitbox.height > ceilings[i].y
        ) {
          this.position.y = ceilings[i].y + this.hitbox.height - offset + 0.01;
        }
      }
    }
    checkWallCollision() {
      for (let i = 0; i < walls.length; i++) {
        if (
          this.hitbox.position.x < walls[i].x + walls[i].width &&
          this.hitbox.position.x + this.hitbox.width > walls[i].x &&
          this.hitbox.position.y < walls[i].y + walls[i].height &&
          this.hitbox.position.y + this.hitbox.height > walls[i].y
        ) {
          const playerCenterX = this.hitbox.position.x + this.hitbox.width / 2;
          const wallCenterX = walls[i].x + walls[i].width / 2;
          const offset = 10;

          if (playerCenterX < wallCenterX) {
            this.position.x = walls[i].x - this.width + offset - 0.01;
          } else {
            this.position.x = walls[i].x + walls[i].width - offset + 0.01;
          }
        }
      }
    }
    checkLavaCollision() {
      const lavaDamage = 10;
      for (let i = 0; i < lava.length; i++) {
        if (
          this.hitbox.position.x < lava[i].x + lava[i].width &&
          this.hitbox.position.x + this.hitbox.width > lava[i].x &&
          this.hitbox.position.y < lava[i].y + lava[i].height &&
          this.hitbox.position.y + this.hitbox.height > lava[i].y - 5
        ) {
          setTimeout(() => {
            this.color = "red";
            player.takeDamage(lavaDamage);
          }, 1000);
        } else {
          this.color = "cyan";
        }
      }
    }
    applyGravity() {
      if (!this.onGround) {
        this.acceleration.y += GRAVITY * this.weight;
      } else {
        this.acceleration.y = 0;
      }
    }
    updateHitbox() {
      const offset = { x: 10, y: 15 };
      this.hitbox = {
        position: {
          x: this.position.x + offset.x,
          y: this.position.y + offset.y,
        },
        width: this.width - offset.x * 2,
        height: this.height - offset.y,
      };
    }
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

  let background = new Sprite({
    position: {
      x: 0,
      y: 0,
    },
    imageSrc: "./assets/backdrop.png",
    width: 3000,
    height: 700,
  });

  let enemies = [];

  let player;

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
      miniMapPosX + player.position.x * miniMapScale,
      miniMapPosY + player.position.y * miniMapScale,
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

  // CAMERA FUNCTIONS

  function updateCamera() {
    camera.x = Math.min(
      Math.max(player.position.x - canvas.width / 2 / camera.zoom, 0),
      worldWidth - canvas.width / camera.zoom
    );
    camera.y = Math.min(
      Math.max(player.position.y - canvas.height / 2 / camera.zoom, 0),
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

  function applyGravityEnemy() {
    for (let i = 0; i < enemies.length; i++) {
      if (!enemies[i].onGround) {
        enemies[i].ay += GRAVITY * enemies[i].weight;
      } else {
        enemies[i].ay = 0;
      }
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
          width: 3000,
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
          x: 700,
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
      player: new Player({
        position: { x: 20, y: 80 },
        imageSrc: "./assets/player/idle-right.png",
        width: 50,
        height: 50,
        frameRate: 9,
      }),
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
      const distance = getVectorDistance(player.position, item);
      if (distance < player.width / 2 + item.width / 2) {
        inventory.push(item);
        items.splice(i, 1);
      }
    }
  }

  function updatePowerUps() {
    for (let i = 0; i < powerUps.length; i++) {
      const powerUp = powerUps[i];
      const distance = getVectorDistance(player.position, powerUp);
      if (distance < player.width / 2 + powerUp.width / 2) {
        playerPowerUps.push(powerUp.id);
        powerUps.splice(i, 1);
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
      x: player.position.x + player.width / 2,
      y: player.position.y + player.height / 2,
      vx: player.velocity.x,
      vy: player.velocity.y,
      ax: 0,
      ay: 0,
      width: 5,
      height: 5,
      color: "black",
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

      const distance = getVectorDistance(enemy, player.position);
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
    const distance = getVectorDistance(enemy, player.position);
    if (distance < 100) {
      const directionVector = offsetVector(player.position, enemy);
      const normalizedVector = normaliseVector(directionVector);

      enemy.vx = normalizedVector.x * enemy.speed;
    } else {
      enemy.vx = 0;
    }
  }

  function enemyAttack(enemy) {
    player.color = "red";
    player.velocity.x += player.position.x > enemy.x ? 50 : -50;
    player.takeDamage(enemy.damage);
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
      player.acceleration.x = -player.speed;
      player.direction = "left";
      player.state = "move";
    } else if (keys.right.pressed) {
      player.acceleration.x = player.speed;
      player.direction = "right";
      player.state = "move";
    } else {
      player.acceleration.x = 0;
      if (!keys.jump.pressed && !keys.attack.pressed && !keys.shoot.pressed) {
        player.state = "idle";
      }
    }
    if (player.onGround && keys.jump.pressed) {
      player.jump();
      player.onGround = false;
      player.doubleJumpAvailable = true;
      player.state = "jump";
    }
    if (
      !player.onGround &&
      keys.jump.pressed &&
      keys.jump.active &&
      player.doubleJumpAvailable &&
      playerPowerUps.includes(1)
    ) {
      player.doubleJump();
      player.doubleJumpAvailable = false;
      keys.jump.active = false;
      player.state = "jump";
    }
    if (keys.attack.pressed && !player.isAttacking) {
      player.attack();
      player.state = "attack";
    }
    if (keys.shoot.pressed && !player.isAttacking) {
      shootProjectile();
      player.state = "shoot";
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
    background.render();
    renderPlatforms();
    renderCeilings();
    renderWalls();
    renderEmptySpace();
    renderEnemy();
    renderItems();
    renderPowerUps();
    player.render();
    // player.debugBox()
    renderProjectiles();
    renderLava();

    ctx.restore();
    renderMiniMap();
  }

  function update(deltaTime) {
    checkWin();
    player.update(deltaTime);
    updateEnemy(deltaTime);
    updateProjectiles(deltaTime);
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
  }

  function debug(deltaTime) {
    const log = console.log;
    log();
  }

  let lastTime = performance.now();

  function animate(timestamp = 0) {
    let deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    loadLevel(currentLevel);
    update(deltaTime);
    input();
    physics(deltaTime);
    render();
    debug(deltaTime);

    requestAnimationFrame(animate);
  }

  function resetGame() {
    player.reset();
    loadLevel(currentLevel);
  }

  animate();
});
