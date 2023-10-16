let buildings = [];
let nBuildings = 25;
let clouds = [];
let nClouds = 35;
let lightningP = 0.98;
let pWindow = 100;
let prevPW = 100;
let counter = 0;

let headerSize = 20;

let strikeCounts = [];

let windowSlider;
let lightningSlider;
let pCheckbox;
let showExp = false;

let strikeTracker = [];
let stWidth = 1;
let stCol = [80, 100, 150, 255, 255, 150];
let posY = 0;

let fact = [1];

for (let i = 1; i < 9; i++) {
  fact.push(fact[fact.length - 1] * i);
}

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

function setup() {
  if (1200 > windowWidth) {
    cnv = createCanvas(windowWidth, windowWidth / 2);
    headerSize *= windowWidth / 1200;
  } else {
    cnv = createCanvas(1200, 600);
  }

  cnv.mouseClicked(playPause);

  for (let i = 0; i < nBuildings; i++) {
    buildings.push([
      floor(random(width / 2 - 20)),
      floor(random(height / 7)),
      floor(random(50)),
    ]);
  }
  for (let i = 0; i < nClouds; i++) {
    clouds.push([
      (i * (width / 2)) / nClouds,
      floor(random(20 + height / 8)),
      floor(random(8)),
    ]);
  }

  stWidth = (width * 0.4) / pWindow;
  windowSlider = createSlider(1, 100, 50, 1);
  windowSlider.position(width / 2, height + 10);
  windowSlider.style("width", width * 0.12 + "px");

  lightningSlider = createSlider(0.01, 0.99, 0.05, 0.01);
  lightningSlider.position(width * 0.8, height + 10);
  lightningSlider.style("width", width * 0.12 + "px");

  pCheckbox = createCheckbox("Show Expected", false);
  pCheckbox.position(width * 0.65, height + 10);
  pCheckbox.style("font-size", headerSize + "px");
  pCheckbox.style("font-family", "sans-serif");
  pCheckbox.changed(() => {
    showExp = !showExp;
  });
  noLoop();
}

function draw() {
  //background(220);
  pWindow = windowSlider.value();

  if (abs(1 - lightningP - lightningSlider.value()) > 0.01) {
    strikeCounts = [];
    posY = 0;
  }
  lightningP = 1 - lightningSlider.value();

  if (pWindow != prevPW) {
    strikeCounts = [];
    posY = 0;
  }

  prevPW = pWindow;

  push(); // Sky

  fill(80, 100, 150, 80);
  rect(0, 0, width / 2, height);
  pop();

  push();
  translate(0, height);
  noStroke();

  for (let b of buildings) {
    fill(30 + parseInt(b[2]));
    rect(b[0], -b[1], sqrt(b[1]) * 2, b[1]);
  }

  fill(0);
  rect(width / 4 - 1, -height / 4, 2, height / 4);
  rect(width / 4 - 5, -height / 4 + 10, 10, height / 4 - 10);
  pop();

  push(); // Fog
  fill(100, 10);
  noStroke();
  rect(0, (height * 7) / 8, width / 2, height / 8);
  rect(0, (height * 8) / 9, width / 2, height / 9);
  rect(0, (height * 9) / 10, width / 2, height / 10);
  pop();

  push();
  let endPos = createVector(width / 4, height * 0.75);
  if (random() > lightningP) {
    counter++;
    strikeTracker.push(1);
    let startPos = createVector(random(width / 2), 0);

    let nMids = floor(random(4) + 1);
    let mids = [];
    for (let i = 0; i < nMids; i++) {
      mids.push(
        createVector(
          random(width / 8) + width / 4,
          random(height * 0.75 - 20) + 10
        )
      );
    }

    mids = mids.sort((a, b) => a.y - b.y);

    fill(255, 255, 150);
    noStroke();

    beginShape();
    vertex(startPos.x - nMids - 1, startPos.y);
    for (let i = 0; i < nMids; i++) {
      vertex(mids[i].x - i, mids[i].y);
    }
    vertex(endPos.x, endPos.y);
    for (let i = 0; i < nMids; i++) {
      let ind = nMids - 1 - i;
      vertex(mids[ind].x + ind, mids[ind].y);
    }
    vertex(startPos.x + nMids + 1, startPos.y);
    endShape(CLOSE);
  } else {
    strikeTracker.push(0);
  }
  pop();

  push(); // Clouds
  noStroke();
  for (let i = 0; i < clouds.length; i++) {
    let c = clouds[i];
    fill(100 + c[2], 200);
    circle(
      c[0] + noise(frameCount / 300 + i * 100) * 10,
      c[1] / 2 + noise(frameCount / 200 + i * 500) * 10 - 10,
      c[1]
    );
  }
  pop();

  push();
  fill(0);
  noStroke();
  rect(width / 2, 0, width / 20, height);
  rect(width / 2, 0, width / 2, height * 0.05);
  rect(width / 2 + width / 20 + pWindow * stWidth, 0, width / 2, height * 0.45);
  rect(width / 2, height * 0.45, width / 2, height * 0.55);
  pop();

  push();
  noStroke();

  fill(255);
  textAlign(CENTER);
  textSize(headerSize);
  text("Lightning Strikes", width * 0.75, headerSize);
  pop();

  push();
  noStroke();
  translate(width * 0.75, height * 0.25);
  let val = strikeTracker[strikeTracker.length - 1];
  let posX = floor(
    ((strikeTracker.length - 1) % pWindow) * stWidth - width * 0.2
  );
  fill(stCol[val * 3], stCol[val * 3 + 1], stCol[val * 3 + 2]);
  rect(
    posX - 1,
    -height * 0.2 + 10 * posY,
    stWidth + 2,
    height * 0.4 - 10 * posY
  );
  stroke(255, 255, 0);
  line(
    posX + stWidth + 1,
    -height * 0.2 + 10 * posY + 1,
    posX + stWidth + 1,
    height * 0.2
  );
  stroke(0);
  line(
    posX,
    -height * 0.2 + 10 * posY,
    posX + stWidth + 1,
    -height * 0.2 + 10 * posY
  );

  if (strikeTracker.length >= pWindow) {
    posY++;
    strikeTracker = [];
    strikeCounts.push(counter);
    counter = 0;
  }
  if (posY >= height * 0.04) {
    posY = 0;
    strikeCounts = [];
  }
  pop();

  let hist = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    ">8": 0,
  };

  for (let i = 0; i < strikeCounts.length; i++) {
    if (strikeCounts[i] < 9) {
      hist[strikeCounts[i]] += 1;
    } else {
      hist[">8"] += 1;
    }
  }

  push();
  textAlign(CENTER);
  stroke(255);
  translate(width * 0.55, height * 0.85);
  strokeWeight(2);
  fill(255);
  line(0, -height * 0.35, 0, 0);
  line(0, 0, width * 0.4, 0);
  let intSpace = width * 0.04;
  textSize(headerSize);

  if (showExp) {
    let lambda = (1 - lightningP) * pWindow;
    let e_ = exp(1);
    beginShape();
    noFill();
    strokeWeight(3);
    stroke(0, 255, 0, 180);
    let eightplus = height * 0.04;
    for (let i = 0; i < 9; i++) {
      let expected =
        ((pow(lambda, i) * pow(e_, -lambda)) / fact[i]) * height * 0.2;
      eightplus -= expected / 5;
      vertex((i + 0.5) * intSpace, (-expected * 8) / 5);
    }
    vertex(9.5 * intSpace, -eightplus * 10);
    endShape();

    fill(0, 255, 0, 180);
    noStroke();
    text(`λ = ${round(lambda, 2)}`, 9 * intSpace, -height * 0.25);
  }

  for (let i = 1; i < 11; i++) {
    strokeWeight(2);
    stroke(255);
    fill(255);
    line(intSpace * i, 0, intSpace * i, height * 0.02);
    strokeWeight(0);
    let id_ = String(i - 1);
    if (id_ > 8) {
      id_ = ">8";
    }
    text(id_, intSpace * (i - 0.5), height * 0.03);

    fill(255, 255, 150);
    rect(intSpace * (i - 1), -8 * parseInt(hist[id_]), intSpace, 8 * hist[id_]);
    fill(255);
    if (hist[id_] > 0 && id_ < 9) {
      text(hist[id_], intSpace * (i - 1 + 0.5), -8 * (hist[id_] + 0.5));
    } else if (hist[id_] > 0) {
      text(hist[">8"], intSpace * (i - 1 + 0.5), -8 * (hist[id_] + 0.5));
    }
  }

  pop();

  push();
  strokeWeight(0);
  fill(255);
  textAlign(CENTER);
  textSize(headerSize * 0.75);

  text("Window Size", width * 0.56, height - 10);
  text(`Pr(Lightning): ${round(1 - lightningP, 2)}`, width * 0.85, height - 10);

  text(
    `Poisson Window Size: ${pWindow} frame(s)`,
    width * 0.55 + (stWidth * pWindow) / 2 + (pWindow < 50) * (50 - pWindow),
    height * 0.48
  );
  translate(width * 0.53, height * 0.66);
  rotate(-PI / 2);
  text(`# of ${pWindow}-frame samples\nwith X strikes`, 0, 0);
  pop();

  push();
  stroke(255, 0, 0, sin((frameCount * PI) / 120) * 100);
  strokeWeight(2);
  point(endPos.x, endPos.y);
  pop();

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
