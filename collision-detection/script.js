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
	};

	const platform = {
		start: { x: 0, y: 300 },
		end: { x: 600, y: 300 },
	};

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

	function movePlayer(v) {
		addVector(player.velocity, v);
	}

	function updatePlayer() {
		addVector(player.velocity, player.acceleration);
		addVector(player.velocity, player.velocity);
		addVector(player.position, player.velocity);
	}

	function render() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "blue";
		ctx.beginPath();
		ctx.arc(player.position.x, player.position.y, 10, 0, 2 * Math.PI);
		ctx.fill();

		ctx.beginPath();
		ctx.moveTo(platform.start.x, platform.start.y);
		ctx.lineTo(platform.end.x, platform.end.y);
		ctx.stroke();
		ctx.closePath();
	}

	function update() {
		updatePlayer();
		render();
		debug();

		requestAnimationFrame(update);
	}

	function debug() {
		const log = console.log;
		log(player.velocity.y);
	}

	update();

	window.addEventListener("keydown", function (e) {
		switch (e.code) {
			case "KeyA":
				movePlayer(createVector(-player.speed, 0));
				break;
			case "KeyD":
				movePlayer(createVector(player.speed, 0));
				break;
			case "KeyW":
				movePlayer(createVector(0, -player.speed));
				break;
			case "KeyS":
				movePlayer(createVector(0, player.speed));
				break;
		}
	});
});
