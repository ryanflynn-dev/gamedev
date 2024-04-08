document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 600;
  canvas.height = 400;

  // VECTORS

  const player = {
    position: { x: 50, y: 50 },
  };

  const platforms = [];

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(player.position.x, player.position.y, 10, 0, 2 * Math.PI);
    ctx.fill();
  }

  function update() {
    render();
  }
});
