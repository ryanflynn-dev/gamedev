document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 600;
  canvas.height = 400;

  const player = {
    position: { x: 50, y: 50 },
    velocity: { x: 0, y: 0 },
    acceleration: { x: 0, y: 0 },
    speed: 5,
    size: { width: 20, height: 20 },
    grounded: false,
  };

  const platforms = [
    {
      start: { x: 0, y: 300 },
      end: { x: 600, y: 300 },
    },
    {
      start: { x: 300, y: 300 },
      end: { x: 600, y: 200 },
    },
  ];

  const GRAVITY = createVector(0, 0.2);

  // VECTORS

  function createVector(x, y) {
    return { x, y };
  }

  function addVector(a, b) {
    const vector = { x: a.x + b.x, y: a.y + b.y };
    return vector;
  }

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

  function multiplyVector(vector, scalar) {
    const multipliedVector = {
      x: vector.x * scalar,
      y: vector.y * scalar,
    };
    return multipliedVector;
  }

  // PHYSICS

  function checkCollision() {
    platforms.forEach((platform) => {
      const platformVector = normaliseVector(
        offsetVector(platform.end, platform.start)
      );
      const playerMovementVector = {
        x: player.velocity.x,
        y: player.velocity.y,
      };
      const projection = getDotProduct(platformVector, playerMovementVector);

      if (projection < 0) {
        const playerToPlatform = offsetVector(player.position, platform.start);
        const projectionLength = getDotProduct(
          playerToPlatform,
          platformVector
        );
        const closestPoint = addVector(
          platform.start,
          multiplyVector(platformVector, projectionLength)
        );
        const distanceToPlatform = getVectorDistance(
          player.position,
          closestPoint
        );
        if (distanceToPlatform < player.size.width / 2) {
          console.log("Collided");
          let normalVector = {
            x: -(platform.end.y - platform.start.y),
            y: platform.end.x - platform.start.x,
          };
          normalVector = normaliseVector(normalVector);
          let overlap = player.size.width / 2 - distanceToPlatform;
          player.position = addVector(
            player.position,
            multiplyVector(normalVector, overlap)
          );
          player.velocity = { x: 0, y: 0 };
        }
      }
    });
  }

  function applyForce(force) {
    player.acceleration = addVector(player.acceleration, force);
  }

  // GAME LOGIC

  function updatePlayer() {
    applyForce(GRAVITY);
    player.velocity = addVector(player.velocity, player.acceleration);
    player.velocity.x *= 0.9; // decelerate
    player.velocity.y *= 0.9;
    player.position = addVector(player.position, player.velocity);
    checkCollision();
    player.acceleration = createVector(0, 0);
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(player.position.x, player.position.y, 10, 0, 2 * Math.PI);
    ctx.fill();

    platforms.forEach((platform) => {
      ctx.beginPath();
      ctx.moveTo(platform.start.x, platform.start.y);
      ctx.lineTo(platform.end.x, platform.end.y);
      ctx.stroke();
      ctx.closePath();
    });
  }

  function update() {
    updatePlayer();
    render();
    debug();

    requestAnimationFrame(update);
  }

  function debug() {
    const log = console.log;
    log();
  }

  update();

  window.addEventListener("keydown", function (e) {
    switch (e.code) {
      case "KeyA":
        applyForce(createVector(-2, 0));
        break;
      case "KeyD":
        applyForce(createVector(2, 0));
        break;
      case "Space":
        if (player.grounded) {
          applyForce(createVector(0, -10));
        }
        break;
    }
  });

  window.addEventListener("keyup", function (e) {
    switch (e.code) {
      case "KeyA":
      case "KeyD":
        player.velocity.x = 0;
        break;
    }
  });
});
