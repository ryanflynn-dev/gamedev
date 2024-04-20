window.onload = () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 540;
  canvas.height = 540;

  // UTILS

  // CLASSES

  class BodyPart {
    constructor(x, y, size, color) {
      this.position = {
        x,
        y,
      };
      this.size = size;
      this.isDragging = false;
      this.color = color;
    }
    render() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
    }
    moveVector(e) {
      console.log("move vector");
      console.log(e);
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (this.isDragging) {
        this.position.x = mouseX;
        this.position.y = mouseY;
        render();
      }
    }
    startDragging() {
      this.isDragging = true;
    }
    stopDragging() {
      this.isDragging = false;
    }
  }

  class Limb extends BodyPart {
    constructor(x, y, X, Y, offset, upperLength, lowerLength, size, color) {
      super(x, y, size, color);
      this.mid = {
        x: (this.position.x + X) / 2,
        y: (this.position.y + Y) / 2,
      };
      this.end = {
        x: X,
        y: Y,
      };
      this.offset = offset;
      this.upperLength = upperLength;
      this.lowerLength = lowerLength;
      this.joint = {
        x: 0,
        y: 0,
      };
    }
    render() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();

      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.end.x, this.end.y, this.size, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();

      ctx.beginPath();
      ctx.moveTo(this.position.x, this.position.y);
      ctx.lineTo(this.end.x, this.end.y);
      ctx.stroke();
      ctx.closePath();

      ctx.strokeStyle = this.color;
      ctx.beginPath();
      ctx.bezierCurveTo(
        this.position.x,
        this.position.y,
        this.mid.x + this.offset,
        this.mid.y + this.offset,
        this.end.x,
        this.end.y
      );
      ctx.stroke();
      ctx.closePath();
    }
    moveVector(e) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (this.isDragging) {
        this.moveTo(mouseX, mouseY);

        render();
      }
    }
    moveTo(targetX, targetY) {
      let dx = targetX - this.position.x;
      let dy = targetY - this.position.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      distance = Math.min(this.upperLength + this.lowerLength, distance);
      let angleToTarget = Math.atan2(dy, dx);
      this.joint.x =
        this.position.x + Math.cos(angleToTarget) * this.upperLength;
      this.joint.y =
        this.position.y + Math.sin(angleToTarget) * this.upperLength;

      let acosArgument =
        (distance * distance +
          this.upperLength * this.upperLength -
          this.lowerLength * this.lowerLength) /
        (2 * distance * this.upperLength);
      acosArgument = Math.max(-1, Math.min(1, acosArgument));
      let jointAngleOffset = Math.acos(acosArgument);

      let jointAngle = angleToTarget + jointAngleOffset;

      this.joint.x = this.position.x + Math.cos(jointAngle) * this.upperLength;
      this.joint.y = this.position.y + Math.sin(jointAngle) * this.upperLength;

      this.end.x = this.position.x + Math.cos(angleToTarget) * distance;
      this.end.y = this.position.y + Math.sin(angleToTarget) * distance;
    }
  }

  // OBJECTS

  const hip = new BodyPart(
    canvas.width / 2,
    canvas.height / 2 + 100,
    30,
    "grey"
  );
  const head = new BodyPart(
    canvas.width / 2,
    hip.position.y - 180,
    50,
    "black"
  );
  const shoulder = new BodyPart(
    canvas.width / 2,
    hip.position.y - 80,
    40,
    "grey"
  );
  const armL = new Limb(
    shoulder.position.x - 30,
    shoulder.position.y - 20,
    shoulder.position.x - 75,
    shoulder.position.y + 75,
    -10,
    10,
    "green"
  );
  const armR = new Limb(
    shoulder.position.x + 30,
    shoulder.position.y - 20,
    shoulder.position.x + 75,
    shoulder.position.y + 75,
    20,
    10,
    "green"
  );
  const legL = new Limb(
    hip.position.x - 30,
    hip.position.y + 20,
    hip.position.x - 75,
    hip.position.y + 95,
    -10,
    10,
    "green"
  );
  const legR = new Limb(
    hip.position.x + 30,
    hip.position.y + 20,
    hip.position.x + 75,
    hip.position.y + 95,
    20,
    10,
    "green"
  );

  // LOGIC

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    armL.render();
    armR.render();
    legL.render();
    legR.render();
    hip.render();
    shoulder.render();
    head.render();
  }

  function update() {
    render();
    debug();
    requestAnimationFrame(update);
  }

  function debug() {
    const log = console.log;
    log();
  }

  function isMouseCollision(mouseX, mouseY, object) {
    return (
      Math.abs(mouseX - object.position.x) < object.size &&
      Math.abs(mouseY - object.position.y) < object.size
    );
  }

  function isMouseCollisionEnd(mouseX, mouseY, object) {
    return (
      Math.abs(mouseX - object.end.x) < object.size &&
      Math.abs(mouseY - object.end.y) < object.size
    );
  }

  canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isMouseCollision(mouseX, mouseY, hip)) {
      hip.startDragging();
    } else if (isMouseCollision(mouseX, mouseY, shoulder)) {
      shoulder.startDragging();
    } else if (isMouseCollision(mouseX, mouseY, head)) {
      head.startDragging();
    } else if (isMouseCollisionEnd(mouseX, mouseY, armL)) {
      armL.startDragging();
    } else if (isMouseCollisionEnd(mouseX, mouseY, armR)) {
      armR.startDragging();
    } else if (isMouseCollisionEnd(mouseX, mouseY, legL)) {
      legL.startDragging();
    } else if (isMouseCollisionEnd(mouseX, mouseY, legR)) {
      legR.startDragging();
    }
  });
  canvas.addEventListener("mouseup", () => {
    hip.stopDragging();
    shoulder.stopDragging();
    head.stopDragging();
    armL.stopDragging();
    armR.stopDragging();
    legL.stopDragging();
    legR.stopDragging();
  });
  canvas.addEventListener("mousemove", (e) => {
    hip.moveVector(e);
    shoulder.moveVector(e);
    head.moveVector(e);
    if (armL.isDragging) {
      armL.moveVector(e);
    }
    if (armR.isDragging) {
      armR.moveVector(e);
    }
    if (legL.isDragging) {
      legL.moveVector(e);
    }
    if (legR.isDragging) {
      legR.moveVector(e);
    }
  });

  update();
};
