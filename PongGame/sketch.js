let ballWidth = 15;
let ballHeight = 15;
let ballDirectX = -1;
let ballDirectY = 1;
let ballX;
let ballY;
let ballSpeed = 2;

const canvasWidth = 1000;
const canvasHeight = 600;


//player one
let p1X = 25;
let p1Y = 300;
let speed = 5;
let pointP1 = 0;
//player two
let p2X = canvasWidth - 25;
let p2Y = canvasHeight / 2;
let pointP2 = 0;
//paddle dimensions
let paddleWidth = canvasWidth /50;
let paddleHeight = canvasHeight /3;

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
  ellipse(ballX, ballY, ballWidth, ballHeight);

  //draw p1
  rect(p1X, p1Y, paddleWidth, paddleHeight);

  //draw p2 will become the computer
  rect(p2X, p2Y, paddleWidth, paddleHeight);


  //Score
  textSize(30);
  text(pointP1, (canvasWidth/2) - 30 , 30);
  text(pointP2, (canvasWidth/2) + 15 , 30);

  //ball movement
  ballX += ballDirectX*ballSpeed;
  ballY += ballDirectY*ballSpeed;

  //ball collision with bottom wall
  if(ballY >= canvasHeight){
    ballDirectY = ballDirectY*(-1)
  }
  //ball collision with top wall
  if(ballY <= 0){
    ballDirectY = ballDirectY*(-1)
  }

  //Player one scores
  if(ballX <= 0)
  {
    pointP1 += 1;
    ballX = width/2;
    ballY = height/2;
  }
  //Player two scores
  if(ballX >= canvasWidth)
  {
    pointP2 += 1;
    ballX = width/2;
    ballY = height/2;
  }

  //Paddle collisions
  if(ballX >= (p1X - (paddleWidth/2)) && ballX <= (p1X + (paddleWidth/2)) && ballY >= (p1Y - (paddleHeight/2)) && ballY <= (p1Y + (paddleHeight/2)))
  {
    ballDirectX = ballDirectX*(-1)
  }


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