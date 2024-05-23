let npts = 100;
let pts = [];
let grid_resolution = 25;
let cellX;
let cellY;
let k = 5;
let runGrid = true;
let kslider;

function setup() {
  createCanvas(400, 400);
  cellX = width / grid_resolution;
  cellY = height / grid_resolution;
  for (let i = 0; i < npts; i++) {
    pts.push(createVector(random(), random(), random([0, 1])));
  }
  kslider = createSlider(1, npts, 5, 1);
  kslider.position(width / 3, height + 10);
}

function pts_dist(x, y) {
  let dists = [];
  for (let i = 0; i < npts; i++) {
    let distance = dist(x, y, pts[i].x, pts[i].y);
    dists.push(createVector(distance, i));
  }
  return dists.sort((a, b) => a.x - b.x);
}

function k_closest(x, y, k) {
  let dists = pts_dist(x, y);
  let out = [];
  for (let i = 0; i < k; i++) {
    out.push(dists[i].y);
  }
  return out;
}

function neighborVote(x, y, k, rnd = true) {
  let dists = pts_dist(x, y);
  let avg = 0;
  if (k > dists.length) {
    console.log("Cannot use k greater than n.");
    return null;
  }
  for (let i = 0; i < k; i++) {
    avg += pts[dists[i].y].z / k;
  }

  if (rnd) {
    avg = avg > 0.5;
  }

  return avg;
}

function colorChoose(val, alpha = 255) {
  if (val) {
    return [255, 0, 0, alpha];
  } else {
    return [0, 0, 100, alpha];
  }
}

function draw() {
  k = kslider.value();

  background(220);
  stroke(0);
  strokeWeight(5);
  for (let pt of pts) {
    stroke(colorChoose(pt.z));
    point(pt.x * width, pt.y * height);
  }
  if (runGrid) {
    for (let x = 0; x < grid_resolution; x++) {
      for (let y = 0; y < grid_resolution; y++) {
        let posX = x * cellX;
        let posY = y * cellY;
        push();
        noStroke();
        translate(posX, posY);
        let col = colorChoose(neighborVote(posX / width, posY / height, k), 25);
        fill(col);
        rect(0, 0, cellX, cellY);
        stroke(col);
        point(0, 0);
        pop();
      }
    }
  }
  push();
  stroke(0);
  strokeWeight(1);
  fill(0);
  text("k = " + k, width - 50, 15);
  pop();

  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    let mousepts = pts_dist(mouseX / width, mouseY / height);
    mousepts = mousepts.slice(0, k);

    let midX = Math.min(...mousepts.map((o) => pts[o.y].x)) / 2;
    midX += Math.min(...mousepts.map((o) => pts[o.y].x)) / 2;

    let midY = Math.max(...mousepts.map((o) => pts[o.y].y)) / 2;
    midY += Math.min(...mousepts.map((o) => pts[o.y].y)) / 2;

    push();
    stroke(0);
    strokeWeight(1);
    let neighbors = [];
    let inds = [];
    for (let mp of mousepts) {
      let pt = pts[mp.y];
      inds.push(mp.y);
      point(pt.x * width, pt.y * height);
      let angle = createVector(midX * width, midY * height)
        .sub([pt.x * width, pt.y * height])
        .heading();
      //angle = createVector(pt.x*width, pt.y*height).sub([midX*width, midY*height]).heading()
      neighbors.push(createVector(pt.x * width, pt.y * height, angle + TWO_PI));
    }

    //neighbors = neighbors.sort((a,b)=>((a.z)-(b.z)))
    //console.log(neighbors.map(o=>o.z-TWO_PI))
    //noLoop()

    //beginShape();

    let kc = k_closest(mouseX, mouseY, k);
    let nb = [];
    console.log(kc);
    for (let i in kc) {
      nb.push(pts[i].z);
    }

    for (let i = 0; i < neighbors.length; i++) {
      let n = pts[inds[i]];
      let nx = n.x * width;
      let ny = n.y * height;
      //vertex(n.x, n.y)
      //console.log(n)
      //noLoop()
      stroke(n.z * 255, 0, (1 - n.z) * 255);
      line(mouseX, mouseY, nx, ny);
    }
    let vote = neighborVote(mouseX / width, mouseY / height, k, (rnd = false));

    let k1 = floor(vote * k);
    let k0 = k - k1;

    text(k0.toString() + ":" + k1.toString(), mouseX + 10, mouseY);

    stroke(colorChoose(vote > 0.5, 255));
    //vertex(neighbors[0].x, neighbors[0].y)
    //endShape(CLOSE);
    strokeWeight(10);
    point(mouseX, mouseY);

    pop();
  }

  //noLoop();
}
