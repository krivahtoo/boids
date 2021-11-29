let flock = []
let height = window.innerHeight * 0.9
let width = window.innerWidth * 0.9
let canvas = document.getElementById('canvas')
canvas.height = height
canvas.width = width
let ctx = canvas.getContext('2d')

function Vector(x, y) {
  this.x = x
  this.y = y
}
Vector.prototype.add = function(v) {
  this.x += v.x ? v.x : 0
  this.y += v.y ? v.y : 0
  return this
}
Vector.prototype.sub = function(v) {
  this.x -= v.x ? v.x : 0
  this.y -= v.y ? v.y : 0
  return this
}
Vector.prototype.mul = function(v) {
  this.x *= v.x ? v.x : 1
  this.y *= v.y ? v.y : 1
  return this
}
Vector.prototype.div = function(v) {
  this.x /= v.x ? v.x : 1
  this.y /= v.y ? v.y : 1
  return this
}
Vector.prototype.mag = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y)
}
Vector.prototype.normalize = function() {
  let m = this.mag()
  this.x /= m ? m : 1
  this.y /= m ? m : 1
  return this
}
Vector.prototype.angle = function() {
  return Math.atan2(this.y, this.x)
}
Vector.prototype.dist = function(v) {
  return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2))
}
Vector.prototype.limit = function(max) {
  if (this.mag() > max) {
    this.normalize()
    this.mul(max)
  }
  return this
}


function Boid(follow = false) {
  this.pos = new Vector(Math.random() * width, Math.random() * height)
  this.vel = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1)
  this.acc = new Vector(0, 0)
  this.maxSpeed = 5
  this.follow = follow
  this.r = 5
  this.maxforce = 0.005
}
Boid.prototype.update = function() {
  this.vel = this.vel.add(this.acc)
  this.pos = this.pos.add(this.vel)
  this.vel = this.vel.limit(this.maxSpeed)
  this.acc = new Vector(0, 0)
  const margin = 200;
  const turnFactor = 0.1;

  if (this.pos.x < margin) {
    this.vel.x += turnFactor;
  }
  if (this.pos.x > width - margin) {
    this.vel.x -= turnFactor
  }
  if (this.pos.y < margin) {
    this.vel.y += turnFactor;
  }
  if (this.pos.y > height - margin) {
    this.vel.y -= turnFactor;
  }
}
Boid.prototype.draw = function() {
  ctx.translate(this.pos.x, this.pos.y);
  ctx.rotate(this.vel.angle());
  ctx.translate(-this.pos.x, -this.pos.y);
  ctx.beginPath();
  ctx.moveTo(this.pos.x, this.pos.y);
  ctx.lineTo(this.pos.x - 15, this.pos.y + 5);
  ctx.lineTo(this.pos.x - 15, this.pos.y - 5);
  ctx.lineTo(this.pos.x, this.pos.y);
  ctx.fillStyle = this.follow ? "#ff0000" : "#558cf4";
  ctx.fill();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

Boid.prototype.separation = function(boids) {
  const minDist = 25
  let steer = new Vector(0, 0)
  let count = 0
  for (let boid of boids) {
    if (boid !== this) {
      if (this.pos.dist(boid.pos) < minDist) {
        let diff = new Vector(this.pos.x - boid.pos.x, this.pos.y - boid.pos.y)
        diff.normalize()
        diff.div(this.pos.dist(boid.pos))
        steer.add(diff)
        count++
      }
    }
  }
  if (count > 0) {
    steer.div(count)
  }
  if (steer.mag() > 0) {
    steer = steer.normalize()
    steer.limit(this.maxforce)
    steer.mul(1.5)
    this.acc.add(steer)
  }
}

Boid.prototype.alignment = function(boids) {
  const neighborDist = 50
  let sum = new Vector(0, 0)
  let count = 0
  for (let boid of boids) {
    if (boid !== this) {
      if (this.pos.dist(boid.pos) < neighborDist) {
        sum.add(boid.vel)
        count++
      }
    }
  }
  if (count > 0) {
    let steer = sum.div(count)
    steer.limit(this.maxforce)
    this.acc.add(steer)
  }
}

Boid.prototype.cohesion = function(boids) {
  const neighborDist = 15
  let sum = new Vector(0, 0)
  let count = 0
  for (let boid of boids) {
    if (boid !== this) {
      if (this.pos.dist(boid.pos) < neighborDist) {
        sum.add(boid.vel)
        count++
      }
    }
  }
  if (count > 0) {
    sum.div(count)
    let steer = sum.sub(this.pos)
    steer.limit(this.maxforce)
    this.acc.add(steer)
  }
}

function init() {
  flock = []
  for (let i = 0; i < 100; i++) {
    flock.push(new Boid())
  }
  flock.push(new Boid(true))
  animate()
}

function animate() {
  requestAnimationFrame(animate)
  ctx.clearRect(0, 0, width, height)
  for (let i = 0; i < flock.length; i++) {
    flock[i].separation(flock)
    flock[i].alignment(flock)
    flock[i].cohesion(flock)
    flock[i].update()
    flock[i].draw()
  }
}

init()


