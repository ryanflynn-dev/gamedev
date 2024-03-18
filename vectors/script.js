document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("myCanvas");
  const ctx = canvas.getContext("2d");

  // Initial vector positions
  const vectors = [
    {
      x: canvas.width / 2,
      y: canvas.height / 2,
      dx: 100,
      dy: 50,
      isDragging: false,
      color: "cyan",
    },
    {
      x: canvas.width / 2,
      y: canvas.height / 2,
      dx: -50,
      dy: 100,
      isDragging: false,
      color: "red",
    },
  ];
  function offsetVector(a, b) {
    const offset = { x: a.dx - b.dx, y: a.dy - b.dy };
    return offset;
  }
  function getVectorLength(a) {
    const length = Math.sqrt(Math.pow(a.x, 2) + Math.pow(a.y, 2));
    return length;
  }
  function getVectorDistance(vectors) {
    const distance = getVectorLength(offsetVector(vectors[0], vectors[1]));
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
    const dotProduct = a.dx * b.dx + a.dy * b.dy;
    return dotProduct;
  }
  function drawVectors() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawUnitCircle();
    vectors.forEach(function (vec) {
      ctx.beginPath();
      ctx.moveTo(vec.x, vec.y);
      ctx.lineTo(vec.x + vec.dx, vec.y + vec.dy);
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = vec.color || "black";
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = vec.color || "black";
      ctx.arc(vec.x + vec.dx, vec.y + vec.dy, 10, 0, 2 * Math.PI);
      ctx.fill();
    });
  }
  function drawUnitCircle() {
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 10, 0, 2 * Math.PI);
    ctx.stroke();
  }
  function moveVector(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const distVectors = getVectorDistance(vectors);

    if (distVectors < 100) {
      vectors[0].color = "green";
    } else {
      vectors[0].color = "cyan";
    }

    vectors.forEach(function (vec) {
      if (vec.isDragging) {
        vec.dx = mouseX - vec.x;
        vec.dy = mouseY - vec.y;
        drawVectors();
      }
    });
  }
  canvas.addEventListener("mousedown", function (e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    vectors.forEach(function (vec) {
      if (
        Math.abs(mouseX - (vec.x + vec.dx)) < 5 &&
        Math.abs(mouseY - (vec.y + vec.dy)) < 5
      ) {
        vec.isDragging = true;
      }
    });
  });
  canvas.addEventListener("mouseup", function () {
    vectors.forEach(function (vec) {
      vec.isDragging = false;
    });
  });

  canvas.addEventListener("mousemove", moveVector);

  drawVectors();
  drawUnitCircle();
});
