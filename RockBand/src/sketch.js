//Keep Track of the notes
let notesP1 = [];
let notesP2 = [];

var hitsP1 = [];
var hitsP2 = [];

let chartIndex = 0;
let chartP1 = [
  1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0,
  1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0,
  1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0,
  1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0
];
let chartP2 = [
  0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0,
  0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1,
  0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0,
  0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1,
]

let playerOnex = 250;
let playerTwoX = 600;

let noteHit = false;
let speed = 30;
let noteTotal = 0;
let size = 800;

let scoreP1 = 0;
let hitStreakP1 = 0;

let scoreP2 = 0;
let hitStreakP2 = 0;

let screenWidth = 1000;
let screenHeight = 900;

let timerP1 = 0;
let timerP2 = 0;

let hitBoxY = screenHeight - 150;

//Screen 0 = Menu
//Screen 1 = Game
//Screen 2 = Lose
let showing = 0;

let noteCount = 0;

let song;

let counter = 0;

let playerOneButton;
let playerTwoButton;
let lampButton;

function setup() {
  song = loadSound('assets/dmvdisco.wav');
  createCanvas(screenWidth, screenHeight);

  playerOneButton = connectSensor( SENSOR_BUTTON, 3);
  playerTwoButton = connectSensor( SENSOR_BUTTON, 5);
  lampButton = connectSensor( SENSOR_BUTTON, 8);

  playerOneButton.pressed(checkPointValueP1);
  playerTwoButton.pressed(checkPointValueP2);
  lampButton.pressed(lampButtonPressed);
}


function draw() {
  counter++;
  if(showing == 0)
  {
    background(300);

  }
  else if(showing = 1)
  {
    background(200);

    setupPlayField();

    // let test = randomIntFromInterval(3,5);

    if ((counter % 15) == 0) {
      if(chartP1[chartIndex] == 1) {
        //New Note for Player 1
        notesP1.push(new Note(1));
        noteCount += 1;
      }
      if(chartP2[chartIndex] == 1) {
        //New Note for Player 2
        notesP2.push(new Note(2));
        noteCount += 1;
      }
      chartIndex++;
    }

    // if ((counter % 30) == 0) {
    //   //New Note for Player 2
    //   notesP2.push(new Note(2));
    //   noteCount += 1;
    // }
    


    //display the notes for Player One
    for (let i = 0; i < notesP1.length; i++) {
      const singularNote = notesP1[i];
      if(singularNote.n == 1)
      {
        //Player 1 Note Color
        fill(0, 255, 50, 200);
      }
      rect(singularNote.x, singularNote.y, 150, 100, 20);
      singularNote.y += 8;
    }

    //display the notes for Player Two
    for (let i = 0; i < notesP2.length; i++) {
          const singularNote = notesP2[i];
          if(singularNote.n == 2)
          {
            //Player 2 Note Color
            fill(200, 0, 50, 200);
          }
          rect(singularNote.x, singularNote.y, 150, 100, 20);
          singularNote.y += 8;
        }
      }

    //displays and fades hitboxes for player One
      for (let i = 0; i < hitsP1.length; i++) {
        hitsP1[i].display();
        hitsP1[i].fade();
    }

    //Get rid of P1 hit after it fades away
    for (let i = 0; i < hitsP1.length; i++) {
        if (hitsP1[i].opacity < 0) {
            hitsP1.splice(i, 1);
        }
    }

    //displays and fades hitboxes for player Two
    for (let i = 0; i < hitsP2.length; i++) {
      hitsP2[i].display();
      hitsP2[i].fade();
      }
  
      //Get rid of P2 hit after it fades away
      for (let i = 0; i < hitsP2.length; i++) {
          if (hitsP2[i].opacity < 0) {
              hitsP2.splice(i, 1);
          }
      }


  //clear the notes shortly after the pass the hitbox and prevent array from getting to big and take away points
    for (let i = 0; i < notesP1.length; i++){
      if (notesP1[i].y > screenHeight - 30){
          // score -= 200;
          // streak = 0;
          // hit = true;
          // ht = 0;
          notesP1.splice(i, 1); //remove element from the array
          // tot++;
      }
  }

  //clear for P2
  for (let i = 0; i < notesP2.length; i++) {
    if (notesP2[i].y > screenHeight - 30) {
        // score -= 200;
        // streak = 0;
        // hit = true;
        // ht = 0;
        notesP2.splice(i, 1); //remove element from the array
        // tot++;
    }
  }
}


function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}




function setupPlayField(){
    //Set up Play Field
    stroke(0);
    strokeWeight(10);
    fill(0, 50);

    //Player one's side column
    rect(playerOnex, -10, 150, screenHeight + 50, 10);

    //Player two's side column
    rect(playerTwoX, -10, 150, screenHeight + 50, 10);

    //Player ones's Hit Box
    fill(0, 255, 50, 200);
    rect(playerOnex, hitBoxY, 150, 100, 20);

    //Player two's Hit Box
    fill(200, 0, 50, 200);
    rect(playerTwoX, hitBoxY, 150, 100, 20);
}

//can also add a tracker of how many different hits
function checkPointValueP1()
{
  console.log("PlayerPressed1");
  for (let i = 0; i < notesP1.length; i++) {
    if (notesP1[i].n == 1) {
        //Perfect
        if (abs(notesP1[i].y - hitBoxY) < 15){
            hitsP1.push(new Hit(1, "Perfect"));
            scoreP1 += 400;
            hitStreakP1++;
            notesP1.splice(i, 1);
            break;
        }
        //good
        else if (abs(notesP1[i].y - hitBoxY) < 35) {
            hitsP1.push(new Hit(1, "Good"));
            scoreP1 += 200;
            hitStreakP1++;
            notesP1.splice(i, 1);
            break;
        }
        //Ok
        else if (abs(notesP1[i].y - hitBoxY) < 45) {
            hitsP1.push(new Hit(1, "Ok")); 
            scoreP1 += 100;
            hitStreakP1++;
            notesP1.splice(i, 1);
            break;
        }
        //bad
        else if (abs(notesP1[i].y - hitBoxY) < 55) {
           hitsP1.push(new Hit(1, "Bad"));
            scoreP1 += 50;
            hitStreakP1++;
            notesP1.splice(i, 1);
            break;
        }
        //Miss //Could add an else here to end the game if misses becomes too many
        else{
          streak = 0;
          hitsP1.push(new Hit(1, "Miss", 1));
          break;
        }
    }
}
}

//can also add a tracker of how many different hits
function checkPointValueP2()
{
  console.log("PlayerPressed2");
  let hitValue = "";
  for (let i = 0; i < notesP2.length; i++) {
    if (notesP2[i].n == 2) {
        //Perfect
        if (abs(notesP2[i].y - hitBoxY) < 15){
            hitsP2.push(new Hit(2, "Perfect"));
            scoreP2 += 400;
            hitStreakP2++;
            notesP2.splice(i, 1);
            hitValue = "Perfect";
            break;
        }
        //good
        else if (abs(notesP2[i].y - hitBoxY) < 35) {
            hitsP2.push(new Hit(2, "Good"));
            scoreP2 += 200;
            hitStreakP2++;
            notesP2.splice(i, 1);
            hitValue = "Good";
            break;
        }
        //Ok
        else if (abs(notesP2[i].y - hitBoxY) < 45) {
            hitsP2.push(new Hit(2, "Ok")); 
            scoreP2 += 100;
            hitStreakP2++;
            notesP2.splice(i, 1);
            hitValue = "OK";
            break;
        }
        //bad
        else if (abs(notesP2[i].y - hitBoxY) < 55) {
           hitsP2.push(new Hit(2, "Bad"));
            scoreP2 += 50;
            hitStreakP2++;
            notesP2.splice(i, 1);
            hitValue = "Bad";
            break;
        }
        //Miss //Could add an else here to end the game if misses becomes too many
        else{
          streak = 0;
          hitsP2.push(new Hit(2, "Miss", 1));
          break;
        }
    }
  }
}


//checks which controller is presses
function keyTyped() {
  if (key === "a") {
    checkPointValueP1();
  }
  if (key == "l") {
    checkPointValueP2();
  }
  if (key == "g") {
    //Add in lamp feature here.
  }
}


//note object utilized by both players 
class Note {
  constructor(n) {
    if(n == 1)
    {
      //Player one note
      this.x = playerOnex;
    }
    else{
      //Player two note
      this.x = playerTwoX;
    }
    this.y = -210;
    this.n = n;
  }
}


//hitbox animation utilized by both players
class Hit {
  constructor(player, value, miss) {
    if(player == 1)
    {
      //Player one notehit
      this.x = playerOnex;
    }
    else if(player == 2){
      //Player two note hit
      this.x = playerTwoX;
    }
    this.y = hitBoxY;
    this.player = player;
    this.opacity = 255;
    this.width = 150;
    this.height = 100;
    this.hitValue = value;
    this.miss = miss;
  }

  display() {
    if(this.player == 1)
    {
      stroke(0, 255, 50, this.opacity);
    }
    else if(this.player == 2)
    {
      stroke(200, 0, 50, this.opacity);
    }
    noFill();
    strokeWeight(12);
    if(this.miss) //if the user missed we don't want the hit box but still want the miss text for a miss hit.
    {
      strokeWeight(0);
    }
    rect(this.x, this.y, this.width, this.height, 20);
    
    //Text display for perfect, good, ok, or bad
    stroke(250, 250, 250, this.opacity);
    strokeWeight(3);
    textSize(40);
    text(this.hitValue, this.x, this.y + 100);
  }

  fade() {
    this.opacity -= 10;
    this.width += 0.5;
    this.height += 0.5;
  }
}



function mousePressed() {
  if(showing == 0)
  {
    showing = 1;
    setTimeout(function() {
      song.play()
    }, 2000);
  }
}

function lampButtonPressed(){
  console.log("Lamp Pressed");
}