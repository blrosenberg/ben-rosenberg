let nSide = 9;
let nSideY = 12;
let nSide_hist = nSide;
let nSideY_hist = nSideY;
let w = 800;
let h = 800;
let sideLength = (w * 0.85) / nSide;
let margin = w * 0.075;

let display = [];
let assignments = [];
let prev_rot = [];
let block_imgs_set = [];
let block_imgs = [];
let breakDown = false;
let showLabels = false;
let save_rotation = false;

let btn_offset = margin + w * 0.01;

let numBlocks = 5;
let blockOrder = [];
for (let i = 0; i < numBlocks; i++) {
  blockOrder.push(i);
}
let label_height = Math.min(h / (numBlocks * 1.5), w / (numBlocks * 1.5));

let user_files = [];
let user_imgs = [];

let mode = "Randomized";

let modes = [
  "Randomized",
  "Uniform",
  "Striped",
  "Diamond",
  "Chevron",
  "Flying Geese",
  "Square",
  "Pinwheel",
];

let nSideSlider;
let regen_button;
let break_button;
let label_button;
let flip_button;
let mode_select;
let save_rotation_button;
let saveButton;

let rel_counts = [];
let rel_counters = [];

let imgFiles = [];

let quants = [];
let actualQuants = [];
let numShown = numBlocks;
let init_table;
let prev_uf_length = 0;

for (let i = 0; i < numBlocks; i++) {
  quants.push(1);
  actualQuants.push(0);
}

function getRowStr(i, stock = true) {
  if (stock) {
    return `<tr\>\n<td id="block${i}-img" style="border: 1px solid black; width: min(50px, 10vw); padding: 4px 8px;"\>\n<img src=${imgFiles[i]} width=40px height=40px></td\>\n<td style="border: 1px solid black; padding: 4px 8px; text-align: center;"\>\n${i}\n</td\>\n<td style="border: 1px solid black; width: min(180px, 12vw); padding: 4px 8px;"\>\n <span id="block${i}-cnt" style="width: min(12px, 0.5vw); display: inline-block;"\>${quants[i]}</span\> <button id="btn_${i}_m" type="button" style="width: min(25px, 3vw); height: min(25px, 3vw); margin-left: min(10px, 1vw); padding: 0; display: inline;" onclick="(function(){quants[${i}]-=(quants[${i}]>0); updateCounts();})()"\>-</button\> <button id="btn_${i}_p" type="button" style="width: min(25px, 3vw); height: min(25px, 3vw); text-align: center; padding: 0; display: inline;" onclick="(function(){quants[${i}]+=1; updateCounts();})()"\>+</button\>\n</td\>\n<td id="block${i}-acnt"style="border: 1px solid black; width: min(50px, 10vw); text-align: center;"\>${actualQuants[i]}</td\></tr\>`;
  }
}

function updateCounts(inGen = false) {
  for (let i = 0; i < quants.length; i++) {
    let id = `block${i}-cnt`;
    document.getElementById(id).innerText = quants[i];
    document.getElementById(`block${i}-acnt`).innerText = actualQuants[i];
  }

  numShown = quants.reduce((a, b) => {
    return a + b;
  });

  if (!inGen) {
    reflectCounts();
  }
}

function reflectCounts() {
  block_imgs = [];
  for (let i = 0; i < quants.length; i++) {
    for (let j = 0; j < quants[i]; j++) {
      block_imgs.push(block_imgs_set[i]);
    }
  }

  blockGen();
}

function updateTable(i, stock = true, reset = false) {
  if (stock) {
    current = document.getElementById("relCountTable").innerHTML;
    document.getElementById("relCountTable").innerHTML = current + getRowStr(i);
  }
  if (reset) {
    document.getElementById("relCountTable").innerHTML = init_table;
  } else if (!stock) {
    current = document.getElementById("relCountTable").innerHTML;
    document.getElementById("relCountTable").innerHTML = current + getRowStr(i);
  }
}

function preload() {
  init_table = document.getElementById("relCountTable").innerHTML;
  for (let i = 0; i < numBlocks; i++) {
    imgFiles.push("squares/" + i + ".png");
    block_imgs_set.push(loadImage("squares/" + i + ".png"));
    block_imgs_set[i].y = i;
  }
  reflectCounts();
}

function flip() {
  for (let row of assignments) {
    for (let block of row) {
      block.y += 2;
    }
  }
}

function summarize() {
  assn = [];
  rot = [];
  out = [[nSide, nSideY]];
  for (let row of assignments) {
    let arow = [];
    let rrow = [];
    for (let block of row) {
      arow.push(block.x);
      rrow.push(block.y % 4);
    }
    assn.push(arow);
    rot.push(rrow);
  }
  out.push(assn);
  out.push(rot);
  return out;
}

function adjustSize() {
  if (displayWidth < w) {
    w = displayWidth * 0.95;
    h = displayHeight * 0.7;
    margin = w * 0.025;
    btn_offset = w * 0.12;
  }
}

function interpret(summary) {
  let sides = summary[0];
  nSide = sides[0];
  nSideY = sides[1];
  let assn = summary[1];
  let rot = summary[2];
  let out = [];
  for (let i = 0; i < assn.length; i++) {
    let arow = assn[i];
    let rrow = rot[i];
    let row = [];
    for (let j = 0; j < arow.length; j++) {
      row.push(createVector(arow[j], rrow[j]));
    }
    out.push(row);
  }
  assignments = out;
}

function getBlock(index) {
  if (index % numShown == 0) {
    blockOrder = shuffle(blockOrder);
  }
  let ind = blockOrder[index % numShown];
  return ind;
}

function blockGen() {
  for (let i = 0; i < actualQuants.length; i++) {
    actualQuants[i] = 0;
  }
  if (blockOrder.length != numShown) {
    blockOrder = [];
    for (let i = 0; i < numShown; i++) {
      blockOrder.push(i);
    }
  }

  let style = mode;
  if (style != "Randomized" && save_rotation) {
    for (let r of assignments) {
      let temp_row = [];
      for (let b of r) {
        temp_row.push(b.y);
      }
      prev_rot.push(temp_row);
    }
  }

  sideLength = min((w * 0.9) / nSide, (h * 0.7) / nSideY);
  display = [];
  for (let i = 0; i < nSideY; i++) {
    let row = [];
    for (let j = 0; j < nSide; j++) {
      row.push(
        createVector(
          margin + (j + 0.5) * sideLength,
          margin + (i + 0.5) * sideLength
        )
      );
    }
    display.push(row);
  }

  assignments = [];
  for (let i = 0; i < nSideY; i++) {
    let row = [];
    for (let j = 0; j < nSide; j++) {
      let n = i * nSide + j;
      let blockChoice = getBlock(n);
      actualQuants[block_imgs[blockChoice].y]++;
      let rotation = 0;

      if (style == "Randomized") {
        rotation = floor(random() * 4);
        console.log("randomized");
      } else if (style == "Uniform") {
        rotation = 0;
      } else if (style == "Striped") {
        console.log("striped");
        rotation = 3 + (j % 2) * 2 + (i % 2) * 2;
      } else if (style == "Diamond") {
        console.log("diamond");
        rotation = 3 + (j % 2) * 2;
      } else if (style == "Chevron") {
        console.log("chevron");
        rotation = -!(j % 2) + 2 * (i % 2);
      } else if (style == "Flying Geese") {
        console.log("honk");
        rotation = -!(j % 2);
      } else if (style == "Square") {
        console.log("square");
        rotation = -!(j % 2);
        if (i % 2) {
          rotation = 2 - (j % 2);
        }
      } else if (style == "Pinwheel") {
        console.log("pinwheel");
        rotation = 2 + (j % 2) + (i % 2) + 2 * !(j % 2) * (i % 2);
      }
      if (prev_rot.length) {
        rotation = prev_rot[i][j];
      }
      row.push(createVector(blockChoice, rotation));
    }
    assignments.push(row);
  }

  try {
    updateCounts(true);
  } catch {
    null;
  }
}

function mouseClicked() {
  if (mouseX > margin && mouseY > margin && mouseY < h - 140) {
    let r = floor((mouseY - margin) / sideLength);
    let c = floor((mouseX - margin) / sideLength);
    try {
      assignments[r][c].y += 1;
    } catch {
      null;
    }
  }
  prev_rot = [];
}

function saveDesign() {
  let savedImg = cnv.get(
    margin + (breakDown * sideLength) / 4,
    margin + (breakDown * sideLength) / 4,
    nSide * sideLength,
    nSideY * sideLength
  );
  fn = "my-quilt";
  if (breakDown) {
    fn += "-breakdown";
  }
  savedImg.save(fn, "png");
}

function setup() {
  adjustSize();
  cnv = createCanvas(w, h);
  cnv.parent("leftSide");
  blockGen();
  nSideSlider = createSlider(2, 24, nSide);
  nSideSlider.position(btn_offset + w * 0.05, h * 0.97);
  nSideSlider.style("width", `${w * 0.14}px`);
  nSideYSlider = createSlider(2, 24, nSideY);
  nSideYSlider.position(btn_offset + w * 0.05, h * 0.875);
  nSideYSlider.style("width", `${w * 0.14}px`);

  regen_button = createButton("Regenerate");
  regen_button.position(btn_offset + w * 0.25, (h * 27) / 32);
  regen_button.size(w / 8, h / 32);
  regen_button.style(`font-size: ${(w * 14) / 800}px`);
  regen_button.style('font-family: "Rokkitt";');
  regen_button.mousePressed(blockGen);

  modeSelect = createSelect();
  modeSelect.position(btn_offset + w * 0.25, (h * 28) / 32);
  modeSelect.size(w / 8, h / 32);
  modeSelect.style(`font-size: ${(w * 14) / 800}px`);
  modeSelect.style('font-family: "Rokkitt";');

  for (let m of modes) {
    modeSelect.option(m);
    modeSelect.selected(mode);
  }

  flip_button = createButton("Invert");
  flip_button.position(btn_offset + w * 0.25, (h * 29) / 32);
  flip_button.size(w / 8, h / 32);
  flip_button.style(`font-size: ${(w * 14) / 800}px`);
  flip_button.style('font-family: "Rokkitt";');

  flip_button.mousePressed(flip);

  break_button = createButton("Breakdown");
  break_button.position(btn_offset + w * 0.25, (h * 30) / 32);
  break_button.size(w / 8, h / 32);
  break_button.style(`font-size: ${(w * 14) / 800}px`);
  break_button.style('font-family: "Rokkitt";');

  break_button.mousePressed(() => {
    breakDown = !breakDown;
    showLabels = false;
  });

  save_rotation_button = createButton("Keep Rotation");
  save_rotation_button.position(btn_offset + w * 0.25, (h * 31) / 32);
  save_rotation_button.size(w / 8, h / 32);
  save_rotation_button.style("padding: 0px;");
  save_rotation_button.style(`font-size: ${(w * 14) / 800}px`);
  save_rotation_button.style('font-family: "Rokkitt";');
  save_rotation_button.mousePressed(() => {
    save_rotation = !save_rotation;
  });

  save_button = createButton("Save\nDesign");
  save_button.position(btn_offset + w * (303 / 800), (h * 27) / 32);
  save_button.size(w / 10, (h * 5) / 32);
  save_button.style("text-align: center;");
  save_button.style(`font-size: ${(w * 14) / 800}px`);
  save_button.style('font-family: "Rokkitt";');
  save_button.mousePressed(() => {
    saveDesign();
  });
  // save_rotation_button = createButton('Save Rotation')
  // save_rotation_button.position(btn_offset+335, h-50)
  // save_rotation_button.size(70)
  // save_rotation_button.mousePressed(()=>{save_rotation = !save_rotation})

  for (let i = 0; i < numBlocks; i++) {
    updateTable(i);
  }
}

function draw() {
  mode = modeSelect.selected();
  nSide = nSideSlider.value();
  nSideY = nSideYSlider.value();
  save_rotation_button.style(
    "background-color",
    ["#eeeeee", "#aaaaff"][+save_rotation]
  );

  if (nSide != nSide_hist || nSideY != nSideY_hist) {
    blockGen();
    nSide_hist = nSide;
    nSideY_hist = nSideY;
  }
  background(255);
  push();
  stroke(210);
  fill(230);
  rect(btn_offset + w * 0.03, h * 0.825, w * 0.45, h * 0.2);
  pop();
  textFont("Rokkitt");
  textSize((w * 7) / 400);
  text("Vertical Blocks", btn_offset + w / 16, (h * 55) / 64);
  text("Horizontal Blocks", btn_offset + w / 20, (h * 61) / 64);
  text(nSideY.toString(), btn_offset + (w * 3.2) / 16, (h * 28.3) / 32);
  text(nSide.toString(), btn_offset + (w * 3.2) / 16, (h * 31.3) / 32);

  if (!breakDown && !showLabels) {
    for (let i = 0; i < nSideY; i++) {
      for (let j = 0; j < nSide; j++) {
        let block = display[i][j];
        let assigned = assignments[i][j];
        push();
        imageMode(CENTER);
        translate(block.x, block.y);
        rotate((assigned.y * PI) / 2);
        try {
          image(block_imgs[assigned.x], 0, 0, sideLength, sideLength);
        } catch {
          console.log(assigned.x);
        }
        pop();
      }
    }
  }

  if (breakDown) {
    for (let i = 0; i < nSideY; i++) {
      for (let j = 0; j < nSide; j++) {
        let block = display[i][j];
        let assigned = assignments[i][j];
        push();
        imageMode(CENTER);
        translate(block.x + sideLength * 0.2, block.y + sideLength * 0.2);
        textAlign(CENTER);
        textSize(12);
        text(block_imgs[assigned.x].y, sideLength * 0.0, -sideLength * 0.32);
        rotate((assigned.y * PI) / 2);
        try {
          image(
            block_imgs[assigned.x],
            0,
            0,
            sideLength * 0.6,
            sideLength * 0.6
          );
        } catch {
          console.log(assigned.x);
        }
        pop();
      }
    }
  }
  if (showLabels) {
    breakDown = false;
    push();
    noStroke();
    rect(0, 0, w, h - 140);
    pop();
    let x = margin;
    let splitter = floor(numBlocks / 3);
    for (let i = 0; i < block_imgs.length; i++) {
      x = margin + (floor(i / splitter) * label_height) / 2;
      push();
      translate(x, margin + label_height * (i % splitter) * 1.5);
      image(block_imgs[i], 0, 0, label_height / 2, label_height / 2);
      text(i, label_height / 4, label_height * 0.65);
      pop();
    }
  }

  if (user_files.length != prev_uf_length && user_files.length != numBlocks) {
    user_files = user_files.slice(prev_uf_length, user_files.length);
    user_imgs = user_imgs.slice(prev_uf_length, user_imgs.length);
    document.getElementById("relCountTable").innerHTML = init_table;
    numBlocks = user_imgs.length;
    numShown = numBlocks;
    block_imgs_set = user_imgs;
    for (let i = 0; i < block_imgs_set.length; i++) {
      block_imgs_set[i].y = i;
    }
    imgFiles = [];
    console.log("updating...");
    for (let i in user_files) {
      imgFiles.push(URL.createObjectURL(user_files[i]));
    }
    quants = [];
    actualQuants = [];
    for (let i = 0; i < numBlocks; i++) {
      quants.push(1);
      actualQuants.push(0);
      updateTable(i);
    }
    blockGen();
    blockGen();
    console.log(numBlocks);
    console.log(assignments);
    block_imgs = user_imgs;
    prev_uf_length = user_files.length;
  }
}
