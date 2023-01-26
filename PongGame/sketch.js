let ballX;
let ballY;
let ballWidth = 15;
let ballHeight = 15;

const canvasWidth = 1000;
const canvasHeight = 600;


//player one
let p1X = 25;
let p1Y = 300;
let speed = 5;
//player two
let p2X = canvasWidth - 25;
let p2Y = canvasHeight / 2;
//paddle dimensions
let paddleWidth = canvasWidth /50;
let paddleHeight = canvasHeight/3;

function setup() {
  var cnv = createCanvas(canvasWidth, canvasHeight);
  //center the canvas in the browser window
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
  cnv.position(x, y);


  //start the ball in the middle
  rectMode(CENTER);
  ballX = width/2;
  ballY = height/2;
}

function draw() {
  //calling functions to make smooth movement of paddle
  keyTyped();

  
  background(0);

  noFill();
  stroke("white");
  rect(canvasWidth/2, canvasHeight/2, canvasWidth, canvasHeight)

  //center line
  line(canvasWidth/2, 0, canvasWidth/2, canvasHeight)
  

  fill(255);
  noStroke();

  //draw the ball
  rect(ballX, ballY, ballWidth, ballHeight);

  //draw p1
  rect(p1X, p1Y, paddleWidth, paddleHeight);

  //draw p2 will become the computer
  rect(p2X, p2Y, paddleWidth, paddleHeight);
}



//function that will watch for key presses to player one
function keyTyped(){
  if(key == "i" && keyIsPressed){
    p1Y = p1Y - speed;
  }

  if(key == "k" && keyIsPressed){
    p1Y = p1Y + speed;
  }
}