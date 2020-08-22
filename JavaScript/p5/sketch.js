
N_FRAMES_TO_RECORD = 3600;

class MoveCommand {
  constructor(gameObj, x, y) {
    this.gameObj = gameObj;
    this.x = x;
    this.y = y;
  }

  execute() {
    this.gameObj.move(this.x, this.y);
  }

  undo() {
    this.gameObj.move(-this.x, -this.y);
  }
}

class GameObject {


  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.commands = [];
    this.state = "play";
    this.replayIndex = 0;
  }

  move(x, y) {
    this.x += x;
    this.y += y;
  }
  
  play(){
    this.state = "play";
    for(let i = this.replayIndex; i < N_FRAMES_TO_RECORD; i++)
    {
     this.commands.pop(); 
    }
  }

  replay() {
    this.state = "replay";
  }
  
  pause(){
   this.state = "pause"; 
  }

  update() {
    if (this.state === "play") {
      let mx = 0;
      let my = 0;

      if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
        mx = -1;
      } else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
        mx = 1;
      }

      if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
        my = -1;
      } else if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
        my = 1;
      }

      const command = new MoveCommand(this, mx, my);
      command.execute();
      this.commands.push(command);
      if (this.commands.length > N_FRAMES_TO_RECORD) {
        this.commands.shift();
      }
      this.replayIndex = this.commands.length - 1;
      
      
    } else if (this.state === "replay") {
      if (this.replayIndex >= 0) {
        this.commands[this.replayIndex--].undo();
      } else {
        this.state = "pause";
      }
    }
  }

  draw() {
    rect(this.x, this.y, 55, 55);
    textSize(18);
    text("Current state: " + this.state, 20 ,60);
  }
}


let gameObject;

function setup() {
  createCanvas(400, 400);

  gameObject = new GameObject(width / 2, height / 2);
  
  const replayButton = createButton("replay");
  replayButton.mousePressed(replay);
  
  const pauseButton = createButton("pause");
  pauseButton.mousePressed(pause);
  
  const playButton = createButton("play");
  playButton.mousePressed(play);
}


function replay() {
  gameObject.replay();
}

    
function pause(){
  gameObject.pause();    
}

function play(){
  gameObject.play(); 
}

function draw() {
  background(102);

  fill("white");
  textSize(14);
  text("use arrow keys or wasd to move square around", 20 ,20);

  gameObject.update();
  gameObject.draw();
}