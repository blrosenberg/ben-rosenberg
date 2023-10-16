function PIConvert(theta) {
  if (theta < 0) {
    return TWO_PI + theta;
  }
  return theta;
}

class Eye {
  constructor(
    x,
    y,
    radius = 800,
    followMouse = true,
    aperture = PI / 2,
    theta = 0,
    lineCount = 200,
    col = [255, 255, 255, 100],
    wf = -1,
    carId = 0,
    isSun = false,
    size = 10,
    mvmt = 5,
    business = 100,
    waver = 0,
    uniqueId = -1
  ) {
    this.pos = createVector(x, y);
    this.zone = floor(this.pos.y / radius);
    this.vel = createVector(0, 0);
    this.fric = 0.9;
    this.r = radius;
    this.size = size;
    this.m = followMouse;
    this.theta = theta;
    this.aperture = aperture;
    this.lineCount = lineCount;
    this.lineAngle = this.aperture / this.lineCount;
    this.movement = mvmt;
    this.col = col;
    this.initAlpha = col[3];
    this.carId = carId;
    this.uniqueId = uniqueId;
    if (uniqueId < 0) {
      this.uniqueId = floor(random() * 10000);
    }
    this.isSun = isSun;
    this.carColor = createVector(random(255), random(255), random(255));
    this.lastChange = 0;
    this.toggleOn = true;
    this.objId = objList.length;
    this.siren = false;
    this.createSiren = false;
    this.waver = waver;
    this.active = true;
    if (this.carId > 0) {
      objList.push(
        new Boundary(
          this.pos.x,
          this.pos.y - sin(this.theta) * 20,
          this.pos.x,
          this.pos.y,
          2 +
            2 * (this.carId % 1 != 0) * (sin(this.theta) > 0.5) +
            2 * (this.carId % 1 == 0) * (sin(this.theta) < 0)
        )
      );
    }

    if (wf >= 1) {
      this.wrapFactor = wf;
    } else {
      this.wrapFactor = random(1, 1 + 4 / business);
    }
  }

  seeWalkers(dx, dy, radius, walkers) {
    let x1;
    let y1;
    let x2;
    let y2;
    let x3 = this.pos.x;
    let y3 = this.pos.y;
    let x4 = this.pos.x + dx;
    let y4 = this.pos.y + dy;
    let l = radius;

    let visible = [];

    for (let i = 0; i < walkers.length; i++) {
      if (abs(eyes[i].zone - this.zone) <= 1) {
        visible.push(i);
      }
    }

    for (let v of visible) {
      let w = walkers[v];
      x1 = w.pos.x;
      y1 = w.pos.y;
      x2 = w.pos.x + 0.5;
      y2 = w.pos.y + 0.5;
      let den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

      let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
      let u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
      if (t > 0 && t < 1 && u > 0) {
        let pt = createVector();
        pt.x = x1 + t * (x2 - x1);
        pt.y = y1 + t * (y2 - y1);
        let d = dist(x3, y3, pt.x, pt.y);

        if (d < l) {
          walkers[v].state = 10;
        }
      }
    }
  }

  cast(dx, dy, radius, objList) {
    let x1;
    let y1;
    let x2;
    let y2;
    let x3 = this.pos.x;
    let y3 = this.pos.y;
    let x4 = this.pos.x + dx;
    let y4 = this.pos.y + dy;
    let l = radius;

    for (let o of objList) {
      x1 = o.a.x;
      y1 = o.a.y;
      x2 = o.b.x;
      y2 = o.b.y;
      let den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
      if (den == 0) {
        return radius;
      }

      let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
      let u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
      if (t > 0 && t < 1 && u > 0) {
        let pt = createVector();
        pt.x = x1 + t * (x2 - x1);
        pt.y = y1 + t * (y2 - y1);
        let d = dist(x3, y3, pt.x, pt.y);
        let except = false;
        switch (o.allow) {
          case 1:
            except = pt.y > y3;
            break;
          case 2:
            except = pt.x < x3;
            break;
          case 3:
            except = pt.y < y3;
            break;
          case 4:
            except = pt.x > x3;
            break;
        }
        if (!o.active) {
          return l;
        }
        if (d < l && d > this.size && !except) {
          l = d;
        }
      }
    }
    return l;
  }

  update() {
    let slowdown = 0;
    this.zone = floor(this.pos.y / 30);

    for (let i of cars) {
      if (i.carId != this.carId) {
        if (abs(i.pos.y - this.pos.y) < 30 && abs(i.pos.x - this.pos.x) < 3) {
          slowdown = 2 * (0.5 - (i.pos.y < this.pos.y));
        }
      }
    }
    if (!this.m) {
      this.vel.x =
        this.movement *
        round(cos(this.theta), 1) *
        noise((frameCount + 1000 * this.wrapFactor) / 100);
      this.vel.y =
        this.movement *
          sin(this.theta) *
          noise((frameCount + 1000 * this.wrapFactor) / 100) -
        slowdown;
    }
    this.pos.add(this.vel);
    this.pos.x = wrap(this.pos.x, w_width * this.wrapFactor + 200, 200);
    this.pos.y = wrap(this.pos.y, w_height * this.wrapFactor + 200, 200);
    this.theta +=
      sin((frameCount / 10) * TWO_PI) * (PI / this.lineCount / 8) * this.waver;
    this.vel.mult(this.fric);
    if (this.m) {
      this.matchMouse();
    }
    if (this.isSun & this.toggleOn) {
      this.col[3] =
        this.initAlpha -
        (this.initAlpha * 0.8 * (abs(w_width / 2 - this.pos.x) + 100)) /
          (w_width / 2 + 100);
      this.col[2] =
        255 -
        (255 * 0.7 * (abs(w_width / 2 - this.pos.x) + 100)) /
          (w_width / 2 + 100);
      this.col[1] =
        255 -
        255 *
          0.4 *
          ((abs(w_width / 2 - this.pos.x) + 100) / (w_width / 2 + 100)) ** 4;
    }
    if (this.carId > 0) {
      if (this.createSiren) {
        incidentals[this.carId] = [];
        incidentals[this.carId].push(
          new Eye(
            this.pos.x,
            this.pos.y - sin(this.theta) * 10,
            200,
            false,
            PI / 2,
            this.theta + PI / 2,
            200,
            [255, 0, 0, 100],
            -1,
            this.carId,
            false,
            2,
            this.movement,
            100
          )
        );
        incidentals[this.carId].push(
          new Eye(
            this.pos.x,
            this.pos.y - sin(this.theta) * 10,
            200,
            false,
            PI / 2,
            this.theta - PI / 2,
            200,
            [0, 0, 255, 100],
            -1,
            this.carId,
            false,
            2,
            this.movement,
            100
          )
        );
        this.siren = true;
        this.createSiren = false;
      }
      if (this.siren) {
        for (let i = 0; i < incidentals[this.carId].length; i++) {
          incidentals[this.carId][i].pos = createVector(
            this.pos.x - sin(this.theta) * 5,
            this.pos.y - sin(this.theta) * 10
          );
          incidentals[this.carId][i].update();
          incidentals[this.carId][i].show();
        }
      }
      let s = sun.col[3];
      let sa = sun.initAlpha;
      this.col[3] =
        this.initAlpha * (1 - s / sa) * (abs(s - sa) > (sa * 2) / 3);
      objList[this.objId].a = createVector(
        this.pos.x,
        this.pos.y - sin(this.theta) * 20
      );
      objList[this.objId].b = createVector(this.pos.x, this.pos.y);
    }

    if ((this.active && !this.isSun) || (this.isSun && this.toggleOn)) {
      this.show();
    }

    if (
      (this.pos.y > w_height + 200 ||
        this.pos.x >= w_width + 200 ||
        this.pos.y + 200 < 0 ||
        this.pos.x + 200 < 0) &&
      frameCount - this.lastChange > 500
    ) {
      if (!this.carId) {
        this.toggleOn = !this.toggleOn;
        this.lastChange = frameCount;
        this.pos.x = -200;
      }
      this.newColor();
      this.lastChange = frameCount;
    }
  }

  matchMouse() {
    this.theta = p5.Vector.sub(
      createVector(mouseX, mouseY),
      this.pos
    ).heading();
  }

  newColor() {
    this.carColor = createVector(random(255), random(255), random(255));
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    stroke(this.col[0], this.col[1], this.col[2], this.col[3] * this.toggleOn);

    if (this.carId > 0 && this.carId % 1 == 0) {
      let wobble = noise((frameCount + 1200 * this.wrapFactor) / 10000) - 0.5;
      translate(wobble * 2, 0);
      fill(this.carColor.x, this.carColor.y, this.carColor.z, 100);
      rect(
        -1 * -sin(this.theta),
        -sin(this.theta) * 1,
        -sin(this.theta) * 10,
        -sin(this.theta) * 20
      );
    }

    if (!this.isSun) {
      strokeWeight(this.size);
      point(0, 0);
    }
    strokeWeight(2);
    this.lineAngle = this.aperture / this.lineCount;

    for (let i = 0; i < this.lineCount; i++) {
      let angle =
        this.theta -
        floor(this.lineCount / 2) * this.lineAngle +
        i * this.lineAngle;
      let dx = cos(angle);
      let dy = sin(angle);
      let mag = this.cast(dx, dy, this.r, objList);
      let mag2 = this.cast(dx, dy, this.r, walls);
      mag = min(mag, mag2);
      this.seeWalkers(dx, dy, mag, walkers);
      line(0, 0, dx * mag, dy * mag);
    }

    pop();
  }
}

class Car {
  constructor(x, y, theta, speed, spacing = 10, r = 200, carId = 1) {
    this.pos = createVector(x, y);
    this.theta = theta;
    this.movement = speed;
    this.wrapFactor = random(1, 5);
    if (carId == 1) carId = floor(random(1000));
    this.a = p5.Vector.add(
      this.pos,
      createVector(sin(theta), cos(theta)).setMag(spacing / 2)
    );
    this.b = p5.Vector.add(
      this.pos,
      createVector(-sin(theta), -cos(theta)).setMag(spacing / 2)
    );
    cars.push(
      new Eye(
        this.a.x,
        this.a.y,
        r,
        false,
        PI / 8,
        this.theta,
        100,
        [255, 255, 220, 5],
        this.wrapFactor,
        carId,
        false,
        10,
        5,
        100,
        1
      )
    );
    cars.push(
      new Eye(
        this.b.x,
        this.b.y,
        r,
        false,
        PI / 8,
        this.theta,
        100,
        [255, 255, 220, 5],
        this.wrapFactor,
        carId + 0.1,
        false
      )
    );
  }
}

class Box {
  constructor(x, y, side, fenestration = 0, dir = 0) {
    this.pos = createVector(x, y);
    this.s = side;
    this.minX = this.pos.x - this.s / 2;
    this.maxX = this.pos.x + this.s / 2;
    this.minY = this.pos.y - this.s / 2;
    this.maxY = this.pos.y + this.s / 2;
    this.id = floor(random(10000));
    this.dir = dir;
    this.residencyMinimum = round(random(), 4);
    walls.push(new Boundary(this.minX, this.minY, this.minX, this.maxY, 2));
    walls.push(new Boundary(this.minX, this.minY, this.maxX, this.minY, 3));
    walls.push(new Boundary(this.maxX, this.maxY, this.minX, this.maxY, 1));
    walls.push(new Boundary(this.maxX, this.maxY, this.maxX, this.minY, 4));
    if (fenestration) {
      windows.push(
        new Eye(
          this.pos.x,
          this.pos.y,
          90,
          false,
          PI / 4,
          PI * (1 - dir),
          100,
          [255, 255, 255, 6],
          -1,
          0,
          false,
          0,
          0,
          1,
          0,
          this.id
        )
      );
    }
  }

  residencyCutoff(cutoff = 0.5) {
    let w_index = -1;
    for (let i = 0; i < windows.length; i++) {
      if (windows[i].uniqueId == this.id) {
        w_index = i;
        break;
      }
    }
    if (this.residencyMinimum > cutoff && w_index >= 0) {
      windows.splice(w_index, 1);
    } else if (this.residencyMinimum <= cutoff && w_index == -1) {
      windows.push(
        new Eye(
          this.pos.x,
          this.pos.y,
          90,
          false,
          PI / 4,
          PI * (1 - this.dir),
          100,
          [255, 255, 255, 6],
          -1,
          0,
          false,
          0,
          0,
          1,
          0,
          this.id
        )
      );
    }
  }

  show() {
    this.residencyCutoff(wSlider.value());
    push();
    rectMode(CENTER);
    fill(0);
    stroke(0);
    strokeWeight(0);
    square(this.pos.x, this.pos.y, this.s);
    fill(80, 52, 35, (255 * sun.col[3]) / sun.initAlpha);
    square(this.pos.x - 1, this.pos.y + 1, this.s);
    pop();
  }
}

class Walker {
  constructor(
    x = -1,
    y = -1,
    side = -1,
    vel = 0.5,
    rd = -1,
    seeingDistance = 70
  ) {
    if (rd < 0) {
      rd = floor(random(roads.length));
    }
    let start = roads[rd].a.copy();
    if (side < 0) {
      side = +(random() > 0.5);
    }
    this.side = side;
    let d = 1;
    this.offset = floor(random() * 10000);
    vel *= (2 * noise(this.offset)) ** 2;
    start.x += [-1, 1][side] * 30 + noise(this.offset) - 0.5;
    this.pos = createVector(start.x, start.y);
    if (y > 0) {
      this.pos.y = y;
    }
    this.state = 0;
    this.vel = vel;
    if (random() > 0.5) {
      this.pos.y = w_height - 1;
      this.vel *= -1;
      d = -1;
    }
    this.rd = rd;
    this.theta = (d * PI) / 2;
    this.marked = false;
    eyes.push(
      new Eye(
        this.pos.x,
        this.pos.y,
        seeingDistance,
        false,
        PI * 1.5,
        this.theta,
        100,
        [220, 255, 220, 6],
        -1,
        0,
        false,
        0,
        0,
        1,
        0,
        this.offset
      )
    );
  }

  update() {
    this.pos.y += this.vel * noise((frameCount + this.offset) / 60);
    for (let i of eyes) {
      if (i.uniqueId == this.offset) {
        i.pos = this.pos;
        i.theta = this.theta + noise(this.offset + frameCount / 100) - 0.5;
        i.r = 6 * (20 / walkers.length) + 20;
      }
    }
    if (this.pos.y > w_height || this.pos.y < 0) {
      this.zero();
      if (!this.marked) {
        walkers.push(new Walker());
      }
    }
  }

  zero() {
    for (let i = 0; i < walkers.length; i++) {
      if (walkers[i].offset == this.offset) {
        walkers.splice(i, 1);
      }
    }
    for (let i = 0; i < eyes.length; i++) {
      if (eyes[i].uniqueId == this.offset) {
        eyes.splice(i, 1);
      }
    }
  }

  show() {
    if (this.state) {
      seen++;
    } else {
      unseen++;
    }
    push();
    stroke(255 * !this.state, 255 * this.state, 0);
    strokeWeight(5);
    point(this.pos.x, this.pos.y);
    pop();
  }
}

class Road {
  constructor(
    x1,
    y1,
    x2,
    y2,
    lanes,
    linestyle = "y=",
    houses = 50,
    business = 50
  ) {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
    this.mid = createVector(
      (this.a.x + this.b.x) / 2,
      (this.a.y + this.b.y) / 2
    );
    this.v = p5.Vector.sub(this.a, this.b);
    this.len = this.v.mag();
    this.theta = this.v.heading();
    this.w = lanes * 20;
    this.linestyle = linestyle;
    //for (let i=0;i<houses;i++) {
    //  let s = random(5, 10)/(buildings.length/50)
    //  buildings.push(new Box(this.a.x-40-s/2, random(w_height), s))
    //  buildings.push(new Box(this.a.x+40+s/2, random(w_height), s))
    //}
    let c;
    c = new Car(
      this.a.x - 10,
      random(100) - 200,
      PI / 2,
      5,
      8,
      200,
      eyes.length * 2 + 1
    );
    c = new Car(
      this.a.x + 10,
      random(100) + height,
      (3 * PI) / 2,
      5,
      8,
      200,
      eyes.length * 2 + 1
    );
    if (business > 80) {
      c = new Car(
        this.a.x - 10,
        random(100) - 200,
        PI / 2,
        5,
        8,
        200,
        eyes.length * 2 + 1
      );
    }
  }

  show() {
    push();
    stroke(0);
    fill(0);
    //strokeWeight(this.w)
    let mp = translate(this.mid.x, this.mid.y);
    rectMode(CENTER);
    rect(0, 0, this.w, this.len);
    let isYellow = this.linestyle[0] == "y";
    let isDouble = this.linestyle[1] == "=";
    stroke(255);
    if (isYellow) {
      stroke(255, 255, 0);
    }
    line(-1, -this.len / 2, -1, this.len / 2);
    if (isDouble) {
      line(1, -this.len / 2, 1, this.len / 2);
    } else {
      stroke(0);
      for (let i = 0; i < this.len / 20; i++) {
        line(
          -1,
          this.len / 2 - 2 * i * 10,
          -1,
          this.len / 2 - (2 * i + 1) * 10
        );
      }
    }

    pop();
  }
}

class Boundary {
  constructor(x1, y1, x2, y2, allow = 0) {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
    this.active = true;
    this.mid = createVector((x1 + x2) / 2, (y1 + y2) / 2);
    this.length = p5.Vector.sub(this.a, this.b).mag();
    this.angle = p5.Vector.sub(this.a, this.b).heading();
    this.offset = random(1000);
    this.allow = allow;
  }
  show() {
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
  changeAngle(theta) {
    this.angle = theta;
    this.a = p5.Vector.add(
      this.mid,
      createVector(cos(this.angle), sin(this.angle)).setMag(this.length / 2)
    );
    this.b = p5.Vector.add(
      this.mid,
      createVector(-cos(this.angle), -sin(this.angle)).setMag(this.length / 2)
    );
  }
  changePos(vector) {
    this.a.add(vector);
    this.b.add(vector);
    this.mid.add(vector);
    this.recycle();
  }

  recycle() {
    let horiz = [this.a.x, this.b.x, this.mid.x];
    let hM = max(horiz);
    let hm = min(horiz);
    let verti = [this.a.y, this.b.y, this.mid.y];
    let vM = max(verti);
    let vm = min(verti);
    if (hM < 0) {
      for (let i = 0; i < horiz.length; i++) {
        horiz[i] = wrap(horiz[i], w_width) + (hM - hm);
      }
    } else if (hm > w_width) {
      for (let i = 0; i < horiz.length; i++) {
        horiz[i] = wrap(horiz[i], w_width) - (hM - hm);
      }
    }
    if (vM < 0) {
      for (let i = 0; i < verti.length; i++) {
        verti[i] = wrap(verti[i], w_height) + (vM - vm);
      }
    } else if (vm > w_height) {
      for (let i = 0; i < verti.length; i++) {
        verti[i] = wrap(verti[i], w_height) - (vM - vm);
      }
    }
    this.a = createVector(horiz[0], verti[0]);
    this.b = createVector(horiz[1], verti[1]);
    this.mid = createVector(horiz[2], verti[2]);
  }
}
