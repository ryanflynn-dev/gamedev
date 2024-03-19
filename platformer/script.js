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

  const people = [
    {
      x: 300,
      y: 200,
      vx: 0,
      vy: 0,
      ax: 0,
      speed: 0.5,
      deceleration: 0.95,
      width: 20,
      height: 20,
      color: "cyan",
      gravity: 0.3,
      jumpSpeed: 10,
      onGround: false,
    },
    {
      x: 50,
      y: 200,
      vx: 0,
      vy: 0,
      ax: 0,
      speed: 0.3,
      deceleration: 0.95,
      width: 20,
      height: 20,
      color: "blue",
      gravity: 0.3,
      jumpSpeed: 4,
      onGround: false,
    },
  ];
  const player = people[0];
  const enemy = people[1];

  const platforms = [
    {
      x: 0,
      y: canvas.height - 50,
      width: canvas.width,
      height: 50,
      color: "green",
    },
    {
      x: 200,
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

  const keys = {
    left: false,
    right: false,
    jump: false,
  };

  // FUNCTIONS

  function drawPeople() {
    for (let i = 0; i < people.length; i++) {
      ctx.fillStyle = people[i].color;
      ctx.beginPath();
      ctx.arc(
        people[i].x + people[i].width / 2,
        people[i].y + people[i].height / 2,
        people[i].width / 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.closePath();
    }
  }

  function drawPlatforms() {
    platforms.forEach(function (platform) {
      ctx.fillStyle = platform.color;
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
  }

  function updatePeoplePosition() {
    for (let i = 0; i < people.length; i++) {
      people[i].vx += people[i].ax;
      people[i].vx *= people[i].deceleration;
      people[i].vy *= people[i].deceleration;
      people[i].x += people[i].vx;
      people[i].y += people[i].vy;
    }
  }

  function applyGravity() {
    for (let i = 0; i < people.length; i++) {
      if (!people[i].onGround) {
        people[i].vy += people[i].gravity;
      } else {
        people[i].vy = 0;
      }
    }
  }

  function jump() {
    if (player.onGround) {
      player.vy = -player.jumpSpeed;
    }
  }

  function checkPlatformCollision() {
    for (let i = 0; i < people.length; i++) {
      people[i].onGround = false;
      for (let j = 0; j < platforms.length; j++) {
        if (
          people[i].x < platforms[j].x + platforms[j].width &&
          people[i].x + people[i].width > platforms[j].x &&
          people[i].y < platforms[j].y + platforms[j].height &&
          people[i].y + people[i].height > platforms[j].y
        ) {
          const peopleBottom = people[i].y + people[i].height;
          const isTopCollision =
            peopleBottom <= platforms[j].y + Math.abs(people[i].vy);

          if (isTopCollision && people[i].vy >= 0) {
            people[i].y = platforms[j].y - people[i].height;
            people[i].vy = 0;
            people[i].onGround = true;
          } else {
            // should stop here
          }
        }
      }
    }
  }

  function checkBoundaries() {
    for (let i = 0; i < people.length; i++) {
      if (people[i].x < 0) {
        people[i].x = 0;
      } else if (people[i].x + people[i].width > canvas.width) {
        people[i].x = canvas.width - people[i].width;
      }
    }
  }

  function checkDistance() {
    for (let i = 0; i < people.length; i++) {
      for (let j = 0; j < people.length; j++) {
        if (i !== j) {
          const distance = getVectorDistance(people[i], people[j]);
          if (distance < 50) {
            player.color = "red";
            ctx.strokeStyle = "red";
            ctx.beginPath();
            ctx.moveTo(
              people[i].x + people[i].width / 2,
              people[i].y + people[i].height / 2
            );
            ctx.lineTo(
              people[j].x + people[j].width / 2,
              people[j].y + people[j].height / 2
            );
            ctx.stroke();
          } else {
            player.color = "cyan";
          }
        }
      }
    }
  }

  function moveAI() {
    const distance = getVectorDistance(enemy, player);

    if (distance < 200) {
      const directionVector = offsetVector(player, enemy);
      const normalizedVector = normaliseVector(directionVector);

      enemy.vx = normalizedVector.x * enemy.speed;
    } else {
      enemy.vx = 0;
    }
  }

  function checkKeys() {
    if (keys.left) {
      player.ax = -player.speed;
    } else if (keys.right) {
      player.ax = player.speed;
    } else {
      player.ax = 0;
    }
    if (keys.jump) {
      jump();
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
      case 32: // Up
        keys.jump = true;
        break;
      case 87: // Up
        keys.jump = true;
        break;
      case 83: // Down
        keys.down = true;
        break;
      case 40: // Down
        keys.down = true;
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
      case 32: // Up
        keys.jump = false;
        break;
      case 87: // Up
        keys.jump = false;
        break;
      case 83: // Down
        keys.down = false;
        break;
      case 40: // Down
        keys.down = false;
        break;
    }
  });

  // GAME
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    checkKeys();
    drawPeople();
    drawPlatforms();
    checkBoundaries();
    updatePeoplePosition();
    moveAI();
    checkDistance();
    checkPlatformCollision();
    applyGravity();

    requestAnimationFrame(animate);
  }

  animate();
});
