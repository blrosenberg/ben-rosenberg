let bg = [235, 235, 200]
let pts = []
let n_points = 50
let w = 500
let h = 500
let dom = w*0.8
let ran = h*0.8
let l
let tree
let genM
let noiseScale = 10

function changeDim(x, y) {
  w = x
  h = y
  dom = x*0.8
  ran = y*0.8
}

function generatePTS(mode=false) {
  for (let i=0;i<n_points;i++) {
    pts.push(createVector(random(), random()))
  }
  
  if (mode=="linear") {
    pts = []
    genM = round(random(), 2)
    for (let i=0;i<n_points;i++) {
        pts.push(createVector((i/n_points), genM*i/n_points + noiseScale*random()/10))
    }
    console.log('Actual slope: ', genM)
  } else if (mode=="noise") {
    pts = []
    for (let i=0;i<n_points;i++) {
      pts.push(createVector(random(), random()))
    }
  }
  
  else if (mode=="quadratic") {
    pts = []
    let a = random()-0.5
    let b = random()-0.5
    let c = random()-0.5
    for (let i=0;i<n_points;i++) {
      let x = i/n_points
      pts.push(createVector(
        x,
        abs(a*x*x + b*x + c + noiseScale*random()/40)%1
      ))
    }
  } else if (mode=="slopey") {
    
  }
}


function setup() {
  //changeDim(windowWidth, windowHeight)
  createCanvas(w, h);
  frameRate(30)

  generatePTS('noise')
  
  l = new lm(pts, bounce=0.99)
  //tree = new dt(pts)
  //tree.partition()
}

function draw() {
  background(bg);
  
  if (l) {
    l.show()
    l.regress()
  }
  
  if (tree) {
    tree.show()
    if (frameCount % 60 == 0 ) {
      tree.dig()
    }
  }

  
  //axes
  push()
  stroke(0)
  strokeWeight(1)
  line(w*0.1, h*0.1, w*0.1, h*0.9)
  line(w*0.1, h*0.9, w*0.9, h*0.9)
  strokeWeight(0)
  textAlign(CENTER)
  text(ran.toString(), w*0.1, h*0.09)
  text(dom.toString(), w*0.93, h*0.91)
  pop()
  
  //pts
  push()
  translate(w*0.1, 0)
  push()
  stroke(0, 0, 255)
  strokeWeight(5)
  for (let p of pts) {
    let px = p.x*dom
    let py = h*0.9 - p.y*ran
    point(px, py)
  }
  pop()
  pop()
}