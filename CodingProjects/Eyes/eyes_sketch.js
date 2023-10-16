let player;
let c;

let walkers = [];

let sun;
let popSlider;
let wSlider;
let popSlider_prev;
let wSlider_prev;

let seen = 0;
let unseen = 0;
let pUnseen = 0;

let maxPop = 20;
let maxWalkers = 40;

let windowView = 1;
let windowDist = 1;
let view = 2;

let w_height = 400;
let hdiff = 0;
let hourUnit = 0;
let w_width = 600;
let showFC = false;

let roads = [];
let buildings = [];
let cars = [];
let windows = [];
let walls = [];
let objList = [];
let eyes = [];
let incidentals = {};

let scoreHistory = [];

let paused = true;

function playPause() {
  if (paused) {
    loop();
    paused = false;
  } else {
    noLoop();
    paused = true;
  }
}

function resetRatio() {
  //seen = 0
  //unseen = 0
  return "Ratio zeroed";
}

function wrap(x, max, offset = 0) {
  return ((x + offset + 2 * max) % max) - offset;
}

function keyTyped() {
  if (key == " ") {
    player.col[3] = +(player.col[3] != 100) * 100;
  }
}

function markEdgeWalker() {
  let edgescores = [];
  for (let i = 0; i < walkers.length; i++) {
    let w = walkers[i];
    let yd1 = abs(w_height / 2 - w.pos.y);
    let yd2 = abs(w_height / 2 - (w.pos.y + w.vel));
    let remaining = abs((w_height / 2 - yd1) / w.vel);
    edgescores.push(remaining + 500 * (yd2 > yd1));
  }
  let ind = edgescores.indexOf(min(edgescores));
  walkers[ind].marked = true;
}

function newBuilding() {
  let r = random(40, 100);
  let side = +(random() > 0.5);
  let rd = roads[floor(random(roads.length))];
  let x = rd.a.x + [1, -1][side] * (40 + r / 2);
  let y = random(height);
  let dsts = [];
  for (let i = 0; i < buildings.length; i++) {
    let b = buildings[i];
    let d = dist(x, y, b.pos.x, b.pos.y);
    dsts.push(d - b.s * 0.5 - r / 2);
  }
  if (min(dsts) > 0 || dsts.length == 0) {
    buildings.push(new Box(x, y, r, 1, side));
  } else {
    newBuilding();
  }
}

function setup() {
  cnv = createCanvas(w_width, w_height + 100);
  cnv.mouseClicked(playPause);
  hdiff = height - w_height;
  hourUnit = (width - 40) / 24;
  player = new Eye(w_width / 2, w_height / 2);
  player.col[3] = +(player.col[3] != 100) * 100;

  roads.push(
    new Road(w_width * 0.35, 0, w_width * 0.35, w_height, 2, "y=", 10, 100)
  );

  roads.push(
    new Road(w_width * 0.7, 0, w_width * 0.7, w_height, 2, "y=", 10, 100)
  );

  for (let i = 0; i < maxPop; i++) {
    newBuilding();
  }

  let d = createDiv();
  d.style("padding-left: 0px;");
  //d.style('transform-origin: 0 0 0');
  d.style("transform: rotate(270deg)");
  d.position(-40, w_height / 2);

  sun = new Eye(
    -200,
    w_height * 1.1,
    3000,
    false,
    TWO_PI,
    0,
    2000,
    [255, 230, 150, 40],
    1.5,
    false,
    true,
    200,
    3
  );
  popSlider = createSlider(1, maxPop, 10, 0.5);
  wSlider = createSlider(0, 1, 0.5, 0.05);
  wSlider.position(0, 30);
  d.child(popSlider);
  d.child(wSlider);
  noLoop();
}

function draw() {
  let bg_basegray = 50;

  let walkerCount = floor(
    popSlider.value() * 1.5 * (sqrt(abs(sun.col[3] / 150)) + 0.5)
  );

  let currentWalkers = 0;

  for (let w of walkers) {
    currentWalkers += !w.marked;
  }

  if (walkerCount > currentWalkers) {
    walkers.push(new Walker(-1, floor(random(2)) * w_height));
  } else if (walkerCount < currentWalkers) {
    markEdgeWalker();
  }

  let sunChange = sqrt(abs(sun.col[3] / 150)) * (80 - bg_basegray);
  background(
    bg_basegray + sunChange,
    bg_basegray + sunChange * 2,
    bg_basegray + sunChange,
    255
  );

  for (let rd of roads) {
    rd.show();
  }

  for (let o of objList) {
    o.show();
  }

  for (let w of walls) {
    w.active = 0;
  }

  //player.update()

  for (let c of cars) {
    c.update();
  }

  windowView = ((maxPop - popSlider.value()) / maxPop) ** 2 + 0.5;
  for (let w of windows) {
    w.aperture = (PI / 4) * view * windowView;
    w.r = 500 / sqrt(popSlider.value() + 10);
  }

  for (let w of windows) {
    w.active = false;
  }

  for (let i = 0; i < popSlider.value(); i++) {
    if (i < buildings.length) {
      let b = buildings[i];
      w_index = -1;
      for (let j = 0; j < windows.length; j++) {
        if (windows[j].uniqueId == b.id) {
          w_index = j;
          break;
        }
      }
      if (w_index >= 0) {
        windows[w_index].active = true;
        windows[w_index].update();
      }
      b.show();
    }
    if ((i + 1) * 4 <= walls.length) {
      for (let j = 0; j < 4; j++) {
        walls[i * 4 + j].show();
        walls[i * 4 + j].active = true;
      }
    }
  }

  for (let i of eyes) {
    //if (i.active) {
    i.update();
  }

  for (let w of walkers) {
    w.update();
    w.show();
    w.state = (w.state - 1) * (w.state > 0);
  }
  push();
  fill(255);
  noStroke();
  textAlign(CENTER);
  let score = round((seen / (unseen + seen)) * 100, 2);
  text(`Safety Score:\n ${score}`, 50, 20);

  translate(30, w_height / 3);
  rotate(-PI / 2);
  textAlign(LEFT);
  text("Population", 0, 0);
  text("Residency", 0, 30);

  textAlign(CENTER);
  rotate(PI / 2);
  translate(0, w_height / 2.5);
  text(`${popSlider.value() * 2}`, -6, 0);
  text(`${wSlider.value()}`, 25, 0);

  pop();

  sun.update();

  let dUnseen = unseen - pUnseen;
  if (dUnseen > max(0.3 * wSlider.value(), 3)) {
    if (random() > 0.9999) {
      unseen += 300;
    }
    if (random() > 0.99) {
      unseen += 100;
    }
  }

  if (popSlider.value() != popSlider_prev || wSlider.value() != wSlider_prev) {
    resetRatio();
  }

  popSlider_prev = popSlider.value();
  wSlider_prev = wSlider.value();

  pUnseen = unseen;

  rect(0, w_height, width, height - w_height);

  push();
  translate(25, height - 30);
  textAlign(CENTER);
  line(0, 0, 0, -(hdiff - 35));
  line(0, 0, hourUnit * 24, 0);
  line(hourUnit * 24, 0, hourUnit * 24, -(hdiff - 35));
  for (let i = 0; i < 24; i++) {
    line(hourUnit * i, 0, hourUnit * i, -(hdiff - 35) / 2);
    text(i, hourUnit * i, 12);
  }

  stroke(0, 0, 255, 150);
  for (let i = 1; i < scoreHistory.length; i++) {
    let s = scoreHistory[i];
    let xpos = s[0] * hourUnit;
    let ypos = (s[1] / 100) * -(hdiff - 35);
    let sdiff = s[1] - scoreHistory[i - 1][1];
    stroke((sdiff < 0) * 255, 0, (sdiff >= 0) * 255, 150);
    if (scoreHistory[i - 1][0] > scoreHistory[i][0]) {
      //endShape()
      //beginShape()
    }
    point(xpos, ypos);
  }

  if (scoreHistory.length > 2000) {
    scoreHistory.shift();
  }

  if (seen > 10000 || unseen > 10000) {
    seen = round(seen / 10, 1);
    unseen = round(unseen / 10, 1);
  }
  stroke(0);
  strokeWeight(0);
  textSize(10);
  rotate(-PI / 2);
  text("Seeing Rate", (hdiff - 35) / 2, -10);
  rotate(PI / 2);
  translate(hourUnit * 12, 0);
  text("Time of Day (hours)", 0, 25);

  pop();

  let hr = (sun.pos.x + 200 + !sun.toggleOn * 1000) / 2000 + 0.25;
  hr -= hr > 1;
  hr *= 24;
  hr = round(hr, 3);
  scoreHistory.push([hr, score]);

  if (showFC) {
    text(round(frameRate(), 2), width - 40, w_height - 10);
  }

  if (paused) {
    push();
    strokeWeight(0);
    fill(255);
    textSize(30);
    textAlign(CENTER);
    text("CLICK TO UNPAUSE", width / 2, height / 2);
    pop();
  }
}
