document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  //UTILS
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
  function normaliseVector(v) {
    const length = getVectorLength(v);
    return { x: v.x / length, y: v.y / length };
  }

  //INIT
  const ships = [
    {
      x: 50,
      y: 50,
      vx: 0,
      vy: 0,
      ax: 0,
      ay: 0,
      deceleration: 0.95,
      width: 20,
      height: 20,
      color: "cyan",
      speed: 0.5,
    },
    {
      x: 200,
      y: 300,
      vx: 0,
      vy: 0,
      ax: 0,
      ay: 0,
      deceleration: 0.95,
      width: 20,
      height: 20,
      color: "blue",
      speed: 2,
    },
  ];

  const aiShip = ships[1];
  const playerShip = ships[0];

  function drawShip() {
    ships.forEach(function (ship) {
      ctx.beginPath();
      ctx.fillStyle = ship.color;
      ctx.arc(
        ship.x + ship.width / 2,
        ship.y + ship.height / 2,
        ship.width / 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.closePath();
    });
  }

  function enemyAttack() {
    const distance = getVectorDistance(playerShip, aiShip);

    if (distance < 50) {
      playerShip.color = "red";
      ctx.strokeStyle = "red";
      ctx.beginPath();
      ctx.moveTo(aiShip.x + aiShip.width / 2, aiShip.y + aiShip.height / 2);
      ctx.lineTo(
        playerShip.x + playerShip.width / 2,
        playerShip.y + playerShip.height / 2
      );
      ctx.stroke();
    } else {
      playerShip.color = "cyan";
    }
  }

  function updateShipPosition() {
    ships.forEach(function (ship) {
      ship.vx += ship.ax;
      ship.vy += ship.ay;

      ship.vx *= ship.deceleration;
      ship.vy *= ship.deceleration;

      ship.x += ship.vx;
      ship.y += ship.vy;
    });
  }

  function moveAIShip() {
    const distance = getVectorDistance(aiShip, playerShip);

    if (distance < 200) {
      const directionVector = offsetVector(playerShip, aiShip);
      const normalisedVector = normaliseVector(directionVector);

      aiShip.vx = normalisedVector.x * aiShip.speed;
      aiShip.vy = normalisedVector.y * aiShip.speed;
    } else {
      aiShip.vx = 0;
      aiShip.vy = 0;
    }
  }

  function checkBoundaries() {
    for (let i = 0; i < ships.length; i++) {
      if (ships[i].x < 0) {
        ships[i].x = 0;
      } else if (ships[i].x + ships[i].width > canvas.width) {
        ships[i].x = canvas.width - ships[i].width;
      }
      if (ships[i].y < 0) {
        ships[i].y = 0;
      } else if (ships[i].y + ships[i].height > canvas.height) {
        ships[i].y = canvas.height - ships[i].height;
      }
    }
  }

  // KEYS
  const keys = {
    left: false,
    right: false,
    up: false,
    down: false,
  };

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
    }
  });

  function checkKeys() {
    if (keys.left) {
      playerShip.ax = -playerShip.speed;
    } else if (keys.right) {
      playerShip.ax = playerShip.speed;
    } else {
      playerShip.ax = 0;
    }
    if (keys.up) {
      playerShip.ay = -playerShip.speed;
    } else if (keys.down) {
      playerShip.ay = playerShip.speed;
    } else {
      playerShip.ay = 0;
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    enemyAttack();
    checkBoundaries();
    checkKeys();
    moveAIShip();
    updateShipPosition();
    drawShip();
    requestAnimationFrame(animate);
  }

  animate();
});
