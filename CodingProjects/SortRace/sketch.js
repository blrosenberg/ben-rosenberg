let size = 40;
let ra = [];
let ra_sorted = '';
let iW;
let iH = 200;

let fr = 60;
let algorithms = 3;

let dataWidth=400;

let displayText=[];
let searchIndex=[];
let maxIndex=[];
let solved=[];
let roundCount=[];
let name=[];


for (let i=0; i<algorithms; i++) {
  displayText.push('');
  searchIndex.push(0);
  maxIndex.push(0);
  solved.push(0);
  roundCount.push(0);
  name.push('');
}

function winner(x) {
  push();
  fill(150, 255, 150);
  stroke(0);
  textAlign(CENTER);
  textSize(48);
  text('WINNER', dataWidth/2, iH*(x+.75));
  pop();
  noLoop();
}

function trade(arr, i, j) {
  let a = arr[i]
  arr[i] = arr[j]
  arr[j] = a
}

function simpleMax(arr, x) { 
  //scans the entire array, storing the largest value seen
  if (arr[searchIndex[x]] > arr[maxIndex[x]]) {
    maxIndex[x]=searchIndex[x]
  }
  if (searchIndex[x] < arr.length-solved[x]) {
    searchIndex[x] += 1
  }
  displayText[x] = 'Max: ' + round(arr[maxIndex[x]]).toString()
}

function sMSort(arr, x) { //sorts using the simpleMax() function
  name[x] = 'Simple Max Sort'
  simpleMax(arr, x)
  if (searchIndex[x]==arr.length-solved[x]) {
    arr.splice(arr.length-solved[x], 0, arr[maxIndex[x]])
    arr.splice(maxIndex[x], 1)
    maxIndex[x]=0
    searchIndex[x]=0
    solved[x]+=1
  }
  displayText[x] = 'Solved: ' + solved[x].toString()
}

function bubbleSort(arr, x) {
  //sorts by adjacent values
  name[x] = 'Bubble Sort'
  i = searchIndex[x]
  if (arr[i] > arr[i+1]) {
    maxIndex[x]=i+1
    trade(arr, i, i+1)
    roundCount[x]+=1
  }
  searchIndex[x] += 1
  if (searchIndex[x] >= arr.length) {
    searchIndex[x] = 0
    solved[x] += 1
    roundCount[x] = 0
  }
  displayText[x] = 'Round: ' + solved[x].toString()
}

function selectionSort(arr, x) {
  //trades 
  i = searchIndex[x]
  if (arr[i] < arr[maxIndex[x]]) {
    maxIndex[x]=i
  }
  if (searchIndex[x] == arr.length) {
    trade(arr, maxIndex[x], solved[x])
    solved[x] += 1
    searchIndex[x]=solved[x]
    maxIndex[x]=solved[x]
  }

  searchIndex[x] += 1
  displayText[x] = 'Solved: ' + solved[x].toString()
  name[x] = 'Selection Sort'
}

function setup() {
  frameRate(fr);
  createCanvas(500, iH*algorithms);
  iW = dataWidth/size;
  let arr_init = []
  for (let i=0;i<size;i++) {
    arr_init.push(Math.floor(random(iH)))
  }
  for (let i=0;i<algorithms;i++) {
    ra.push([...arr_init])
  }
  ra_sorted = [...arr_init].sort(function(a, b){return a-b}).toString()
}

function draw() {
  push(); //data background
  fill(240)
  noStroke();
  rect(0, 0, dataWidth, iH*algorithms);
  pop();

  
  for (let x=0; x<algorithms; x++) {
    push(); //text window
    fill(50)
    rect(dataWidth, x*iH, width-dataWidth, iH)
    stroke(255)
    fill(255)
    text(displayText[x], dataWidth+10, x*iH+iH/3)
    text(name[x], dataWidth+10, x*iH+iH/2)
    pop();
    
    for (let i=0;i<ra[x].length;i++) {
      push();
      if (i==maxIndex[x]) {
        fill(255, 200, 200);
      } else if (i==searchIndex[x]) {
        fill(200, 200, 255)
      } else {
        fill(0);
      }
      rect(iW*i, (x+1)*iH, iW, -ra[x][i]);
      pop();
    }
    if (ra[x].toString()===ra_sorted) {
      winner(x)
    }
  }

  
  push();
  fill(255)
  stroke(255)
  text((round(10*frameCount/fr)/10).toString() + 's', dataWidth+10, 15)
  text('Array Size: ' + size, dataWidth+10, 35)
  pop();
  
  bubbleSort(ra[0], 0)
  sMSort(ra[2], 2)
  selectionSort(ra[1], 1)
}