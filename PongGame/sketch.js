let ballWidth = 15;
let ballHeight = 15;
let ballDirectX = -1;
let ballDirectY = 1;
let ballX;
let ballY;
let ballSpeed = 5;

const canvasWidth = 1000;
const canvasHeight = 600;


//player one
let p1X = 20;
let p1Y = 300;
let speed = 5;
let pointP1 = 0;
//player two
let p2X = canvasWidth - 20;
let p2Y = canvasHeight / 2;
let pointP2 = 0;
//paddle dimensions
let paddleWidth = canvasWidth /50;
let paddleHeight = canvasHeight /5;


//To keep track of which page we want to be on
//page 0 welcome page
//page 1 playing game
//page 3 player one wins
//page 4 computer wins
let page = 0;

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

function preload(){
  //loading image of fire 
  fire = loadImage ('fire.png');
}

function draw(){

  if(page == 0)
  {
    welcome();
  }
  else if(page == 1)
  {
    mainGame();
  }
  else if(page == 2)
  {
    playerWin();
  }
  else if(page == 3)
  {
    computerWin();
  }
}


function welcome(){
  background(0);
  fill("white");
  textSize(90);
  textAlign(CENTER, CENTER);
  text("FIRE PONG", (canvasWidth/2), canvasHeight/2);
  textSize(20);
  text("PRESS SPACE TO START",(canvasWidth/2), canvasHeight/2 + 70);
}

function playerWin(){
  background(0);
  fill("white");
  textSize(90);
  textAlign(CENTER, CENTER);
  text("You Win!!", (canvasWidth/2), canvasHeight/2);
  textSize(20);
  text("PRESS SPACE TO PLAY AGAIN",(canvasWidth/2), canvasHeight/2 + 70);
}
function computerWin(){
  background(0);
  fill("white");
  textSize(90);
  textAlign(CENTER, CENTER);
  text("YOU LOST!!", (canvasWidth/2), canvasHeight/2);
  textSize(20);
  text("PRESS SPACE TO TRY AGAIN",(canvasWidth/2), canvasHeight/2 + 70);
}


function setLineDash(list) {
  drawingContext.setLineDash(list);
}

function mainGame() {
  //calling functions to make smooth movement of paddle
  keyTyped();

  
  background(0);

  noFill();
  stroke("white");
  //center line
  strokeWeight(3);
  setLineDash([10, 10]); //create the dashed line pattern here
  line(canvasWidth/2, 0, canvasWidth/2, canvasHeight)
  

  fill(255);
  noStroke();

  //draw the ball experimending with the ball being fire it doesn't work as well though.
  ellipse(ballX, ballY, ballWidth, ballHeight);
  // image(fire,ballX,ballY,ballWidth + 10,ballHeight + 10);

  //draw p1
  rect(p1X, p1Y, paddleWidth, paddleHeight);

  //draw p2 will become the computer
  rect(p2X, p2Y, paddleWidth, paddleHeight);

  fill("black");
  rect(canvasWidth/2, 0, 10, 70);
  //Score
  fill("white");
  textSize(20);
  textAlign(CENTER, CENTER);
  text("FIRST TO 5", (canvasWidth/2), 20);
  textSize(30);
  text(pointP1, (canvasWidth/2) - 30, 50);
  text(pointP2, (canvasWidth/2)  + 30, 50);

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
    pointP2 += 1;
    ballX = width/2;
    ballY = height/2;
  }
  //Player two scores
  if(ballX >= canvasWidth)
  {
    pointP1 += 1;
    ballX = width/2;
    ballY = height/2;
  }

  //Paddle collisions if in the area of the paddle then it will shoot the ball the other way aka change reverse the x direction
  if(ballX >= (p1X - (paddleWidth/2)) && ballX <= (p1X + (paddleWidth/2)) && ballY >= (p1Y - (paddleHeight/2)) && ballY <= (p1Y + (paddleHeight/2)))
  {
    ballDirectX = ballDirectX*(-1)
    ballSpeed += .5;
  }

  //the functionality of the computer.
  if(ballX >= (p2X - (paddleWidth/2)) && ballX <= (p2X + (paddleWidth/2)) && ballY >= (p2Y - (paddleHeight/2)) && ballY <= (p2Y + (paddleHeight/2)))
  {
    ballDirectX = ballDirectX*(-1)
    ballSpeed += .5;
  }
  //if the ball is above the paddle then we want to move up and vise versa
  if(ballY >= p2Y && (p2Y + (paddleHeight/2)) <= canvasHeight )
  {
    p2Y = p2Y + speed;
  }
  if(ballY <= p2Y && (p2Y - (paddleHeight/2)) >= 0)
  {
    p2Y = p2Y - speed;
  }

  //check if a player has made it to five goals if they have take to the respective page
  if(pointP1 >= 5)
  {
    page = 2;
    ballSpeed = 5;
    pointP1 = 0;
    pointP2 = 0;
  }
  else if(pointP2 >= 5)
  {
    page = 3;
    ballSpeed = 5;
    pointP1 = 0;
    pointP2 = 0;
  }
}



//function that player one will use it will watch for key presses to player one will also check for paddle being to far up or down.kkki
function keyTyped(){
  if(key == "i" && keyIsPressed && (p1Y - (paddleHeight/2)) >= 0){
    p1Y = p1Y - speed;
  }

  if(key == "k" && keyIsPressed && (p1Y + (paddleHeight/2)) <= canvasHeight){
    p1Y = p1Y + speed;
  }

  //will decide if the user wants to move on from the welcome page... only want this to run if user is on home page
  if((page == 0 || page == 2 || page == 3) && key == " " && keyIsPressed)
  {
    page = 1;
  }
}