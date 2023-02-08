let particles = [];
let poti;
let button;
let logo;
let ballWidth = 15;
let ballHeight = 15;
let ballDirectX = -1;
let ballDirectY = 1;
let ballX;
let ballY;
let ballSpeed = 5;

let hitPaddleSound;
let boostSound;

const canvasWidth = 700;
const canvasHeight = 900;

let boost = 3;
let prevBallSpeed = 0;
let powerShot = false;


//player one
let p1X = canvasWidth / 2;
let p1Y = canvasHeight - 20 ;
let p1Speed = 20;
let pointP1 = 0;
//player two
let p2X = canvasWidth / 2;
let p2Y = 20;
let p2Speed = 6;
let pointP2 = 0;
//paddle dimensions
let paddleHeight = canvasHeight /50;
let paddleWidth = canvasWidth / 5;


//To keep track of which page we want to be on
//page 0 welcome page
//page 1 playing game
//page 3 player one wins
//page 4 computer wins
let page = 0;

function preload() {
	logo = loadImage('images/p5.jpg')
}

function setup () {
	hitPaddleSound = new Audio("../sound/paddleHit.wav");
	boostSound = new Audio("../sound/boost.wav");
	var cnv = createCanvas(canvasWidth, canvasHeight);
	//center the canvas in the browser window
	var x = (windowWidth - width) / 2;
	var y = (windowHeight - height) / 2;
	cnv.position(x, y);
  
  
	//start the ball in the middle
	rectMode(CENTER);
	ballX = width/2;
	ballY = height/2;

	button = connectSensor( SENSOR_BUTTON, 2 );
	button.pressed( buttonPressed );
	button.released( buttonReleased );

	//want to be able to move the potentiometer the whole screen
	poti = connectSensor( SENSOR_POTENTIOMETER, 'A0', canvasWidth + 250, -250);
}

function draw () {
	background( 255 );

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
	text("SQUEEZE HANDLE TO START",(canvasWidth/2), canvasHeight/2 + 70);
  }
  
  function playerWin(){
	background(0);
	fill("white");
	textSize(90);
	textAlign(CENTER, CENTER);
	text("You Win!!", (canvasWidth/2), canvasHeight/2);
	textSize(20);
	text("SQUEEZE HANDLE TO PLAY AGAIN",(canvasWidth/2), canvasHeight/2 + 70);
  }
  function computerWin(){
	background(0);
	fill("white");
	textSize(90);
	textAlign(CENTER, CENTER);
	text("YOU LOST!!", (canvasWidth/2), canvasHeight/2);
	textSize(20);
	text("SQUEEZE HANDLE TO TRY AGAIN",(canvasWidth/2), canvasHeight/2 + 70);
  }
  
  
  function setLineDash(list) {
	drawingContext.setLineDash(list);
  }
  
  function mainGame() {
	//calling functions to make smooth movement of paddle
	hitPaddleSound.loop = false;
	keyTyped();
  
	moveUser();
	
	background(0);
  
	noFill();
	stroke("white");
	//center line
	strokeWeight(3);
	setLineDash([10, 10]); //create the dashed line pattern here
	line(1, canvasHeight/2, canvasHeight, canvasHeight/2);
	
  
	fill(255);
	noStroke();
  
	//draw the ball experimending with the ball being fire it doesn't work as well though.
	// NOT NEEDED WITH THE TRAIL
	// ellipse(ballX, ballY, ballWidth, ballHeight);
	// image(fire,ballX,ballY,ballWidth + 10,ballHeight + 10);
  
	//draw p1
	rect(p1X, p1Y, paddleWidth, paddleHeight);
  
	//draw p2 will become the computer
	rect(p2X, p2Y, paddleWidth, paddleHeight);

	//Score
	fill("white");
	textSize(20);
	textAlign(CENTER, CENTER);
	textSize(30);
	text(pointP2, 30, (canvasHeight/2) - 20);
	text(pointP1, 30, (canvasHeight/2) + 20);
  
	//ball movement
	ballX += ballDirectX*ballSpeed;
	ballY += ballDirectY*ballSpeed;
  
	//ball collision with right wall
	if(ballX >= canvasWidth){
	  ballDirectX = ballDirectX*(-1)
	}
	//ball collision left top wall
	if(ballX <= 0){
	  ballDirectX = ballDirectX*(-1)
	}
  
	//Player one scores
	if(ballY <= 0)
	{
	  pointP1 += 1;
	  ballX = width/2;
	  ballY = height/2;
	  ballSpeed = 5;
	}
	//Player two scores
	if(ballY >= canvasHeight)
	{
	  pointP2 += 1;
	  ballX = width/2;
	  ballY = height/2;
	  ballSpeed = 5;
	}
  
	//Paddle collisions if in the area of the paddle then it will shoot the ball the other way aka change reverse the x direction
	if(ballX >= (p1X - (paddleWidth/2)) && ballX <= (p1X + (paddleWidth/2)) && ballY >= (p1Y - (paddleHeight/2)) && ballY <= (p1Y + (paddleHeight/2)))
	{
		hitPaddleSound.play();
	  ballDirectY = ballDirectY*(-1)
	  ballSpeed += .5;
	}
  
	//the functionality of the computer.
	if(ballX >= (p2X - (paddleWidth/2)) && ballX <= (p2X + (paddleWidth/2)) && ballY >= (p2Y - (paddleHeight/2)) && ballY <= (p2Y + (paddleHeight/2)))
	{
		hitPaddleSound.play();
	  ballDirectY = ballDirectY*(-1)
	  ballSpeed += .5;
	}
	//if the ball is above the paddle then we want to move up and vise versa
	//TO hard tho lets make them only move when the ball is getting close to their half
	if(ballX >= p2X && (p2X + (paddleWidth/2)) <= canvasWidth && (ballY <= canvasHeight/2))
	{
	  p2X = p2X + p2Speed;
	}
	if(ballX <= p2X && (p2X - (paddleWidth/2)) >= 0 && (ballY <= canvasHeight/2))
	{
	  p2X = p2X - p2Speed;
	}
  
	//check if a player has made it to five goals if they have take to the respective page
	if(pointP1 >= 5)
	{
	  page = 2;
	  ballSpeed = 5;
	  pointP1 = 0;
	  pointP2 = 0;
	  boost = 3;
	}
	else if(pointP2 >= 5)
	{
	  page = 3;
	  ballSpeed = 5;
	  pointP1 = 0;
	  pointP2 = 0;
	  boost = 3;
	}
	if(powerShot && boost != -1)
	{
		for (let i = 0; i < 5; i++) {
			let p = new Particle(ballX, ballY, true);
			particles.push(p);
		  }
		  for (let i = particles.length - 1; i >= 0; i--) {
			particles[i].update();
			particles[i].show();
			if (particles[i].finished()) {
			  particles.splice(i, 1);
			}
		  }
		if(ballY >= 40 && ballDirectY >= 0)
		{
			ballSpeed = prevBallSpeed;
		}
		fill("white");
		textSize(20);
		text("POWER SHOT" , (canvasWidth/2), 90);
		text(boost + " REMAINING!" , (canvasWidth/2), 150);
	}
	else if(!powerShot)
	{
		for (let i = 0; i < 5; i++) {
			let p = new Particle(ballX, ballY, false);
			particles.push(p);
		  }
		  for (let i = particles.length - 1; i >= 0; i--) {
			particles[i].update();
			particles[i].show();
			if (particles[i].finished()) {
			  particles.splice(i, 1);
			}
		  }
	}

}

// function that player one will move the user based on where the potentiometer is at.
function moveUser(){
	if((p1X - (paddleWidth/2)) >= 15 && poti.value() <= p1X){
	  	p1X = p1X - p1Speed;
	}
  
	if((p1X + (paddleWidth/2)) <= canvasWidth - 15 && poti.value() >= p1X){
		p1X = p1X + p1Speed;
	}
}

//function that player one will use it will watch for key presses to player one will also check for paddle being to far up or down.kkki
function keyTyped(){
	//will decide if the user wants to move on from the welcome page... only want this to run if user is on home page
	if((page == 0 || page == 2 || page == 3) && key == " " && keyIsPressed)
	{
	  page = 1;
	}
}

//This will be used to increase the speed of a shot you get a few per game
function buttonPressed() {
	console.log('PRESS')

	//allow game play to begin by pressing the button
	if((page == 0 || page == 2 || page == 3))
	{
	  page = 1;
	}
	//only want the boost to work if ball is going towards the computer
	else if(ballDirectY < 0 && boost != 0)
	{
		powerShot = true;
		prevBallSpeed = ballSpeed;
		ballSpeed = 15;
		boost = boost - 1;
		boostSound.play();
	}
	else if(boost == 0)
	{
		fill("white");
		textSize(20);
		text("OUT OF POWER SHOTS!" , (canvasWidth/2), 90);
	}
}

function buttonReleased() {
		setTimeout(powerShotEnd,2000);
   console.log('RELEASED');
}

function powerShotEnd(){
	powerShot = false;
}


//Fire Effect https://editor.p5js.org/Allayna/sketches/o239lOcns
class Particle {
	constructor(x, y, grey) {
	  this.x = x;
	  this.y = y;
	  this.vx = random(-1, 1);
	  this.vy = random(-5, -1);
	  this.alpha = 200;
	  this.d = 16;
	  this.grey = grey;
	}
  
	finished() {
	  return this.alpha < 0;
	}
  
	update() {
	  this.x += this.vx;
	  this.y += this.vy;
	  this.alpha -= 3;
	  this.d -= random(0.05, 0.1);
	}
  
	show() {
	  noStroke();
	  if(this.grey)
	  {
		fill(random(215,230), random(215,230), random(215,230), this.alpha);
	  }
	  else{
		fill(random(200,230), random(50, 150), 10, this.alpha);
	  }
	  ellipse(this.x, this.y, this.d);
	}
}
//Fire Effect END