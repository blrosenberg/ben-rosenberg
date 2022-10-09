let res = 100
let w = 400
let cellW = w/res
let gran = 1
let resSlider;
let granSlider;
let ts=10

let x, y
let fPrime_options = [
  (x,y)=>(y/x+x*x), 
  (x,y)=>(y*x), 
  (x,y)=>(x*x-x), 
  (x,y)=>(x*x*x+y),
  (x,y)=>(x*x*x*y*y),
  (x,y)=>((x+y)*(x+y)),
  (x,y)=>(5/x+10/y),
  (x,y)=>(x + x*x/y + x*x*x/(y*y))
]
let fPrime_names = [
  'y/x + x**2',
  'xy', 'x**2-x', 
  'x**3+y', 
  'x**3*y**2', 
  '(x+y)**2', 
  '5/x + 10/y',
  'x + x**2/y + x**3/y**2'
]
let fPrime_choice_index

function fPrime(x, y) {
  return fPrime_options[fPrime_choice_index](x, y)
}


function setup() {
  fPrime_choice_index = floor(random(fPrime_options.length))
  createCanvas(w+150, w);
  
  resSlider = createSlider(8, w, 8, 2)
  resSlider.position(w+5, w/5)
  
  
  granSlider = createSlider(.1, 2, 1, .05)
  granSlider.position(w+5, 2*w/5)
  
}

function draw() {
  res = resSlider.value()
  gran = Math.pow(granSlider.value(), 3)
  cellW = w/res
  
  
  
  
  background(10);
  push();
  fill(255)
  textAlign(CENTER)
  textSize(ts)
  text('Window Size', w+75, w/5-ts)
  text(resSlider.value().toString(), w+75, w/5+3*ts)
  
  text('Cell Size', w+75, 2*w/5-ts)
  text(granSlider.value().toString(), w+75, 2*w/5+3*ts)
  
  text('Cursor Position', w+75, 3*w/5-ts)
  let mX = Math.round((mouseX/w*res*gran - res/2*gran) * (100000))/(100000)
  let mY = Math.round((mouseY/w*res*gran - res/2*gran) * (-100000))/(100000)
  text('('+mX.toString() + ', ' +mY.toString()+')', w+75, 3*w/5+ts)
  text('Slope', w+75, .7*w-ts)
  text(round(fPrime(mX, mY), 3).toString(), w+75, .7*w+2*ts)
  text('dy/dx = ' + fPrime_names[fPrime_choice_index], w+75, .9*w+3*ts)
  pop();
  
  push();
  for (let i=0;i<res;i++) {
    stroke(60)
    strokeWeight(1)
    line(0, i*cellW, w, i*cellW)
    line(i*cellW, 0, i*cellW, w)
  }
  stroke(255, 100)
  strokeWeight(2)
  line(0, res/2*cellW, w, res/2*cellW)
  line(res/2*cellW, 0, res/2*cellW, w)
  pop();
  
  push();
  translate(res/2*cellW, res/2*cellW)
  //stroke(0, 0, 255, 100)
  stroke(255)
  for (let x=-res/2; x<res/2;x++) {
    for (let y=-res/2; y<res/2; y++) {
      let m = fPrime(x*gran, y*gran)
      let theta = atan(m)
      let dx = cos(theta)
      let dy = sin(theta)
      let a = createVector((x-dx/3)*cellW, (-y+dy/3)*cellW)
      let b = createVector((x+dx/3)*cellW, (-y-dy/3)*cellW)
      strokeWeight(1)
      theta = Math.abs(theta)
      let cR = cos(theta/2)*255 + 255/2
      let cG = sin(theta/2)*255 + 255/2
      let cB = sin(theta/2 - PI/2)*255 + 255/2
      stroke(cR, cG, cB)
      line(a.x, a.y, b.x, b.y)
    }
  }
  
  let midP = Math.round(res*.25*gran*1000)/1000
  
  fill(255, 100)
  stroke(255, 100)
  textSize(ts)
  line(-midP/gran*cellW, 10, -midP/gran*cellW, -10)
  line(midP/gran*cellW, 10, midP/gran*cellW, -10)
  line(-10, midP/gran*cellW, 10, midP/gran*cellW)
  line(-10, -midP/gran*cellW, 10, -midP/gran*cellW)

  strokeWeight(1)
  
  
  text((-midP).toString(), -res*.25*cellW+ts, -ts)
  text(midP.toString(), res*.25*cellW+ts, -ts)
  text((-midP).toString(), ts, res*.25*cellW+ts)
  text(midP.toString(), ts, -res*.25*cellW+ts)

  
  
  pop()

  //noLoop();
}