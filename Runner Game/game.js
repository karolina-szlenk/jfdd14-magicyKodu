//----------Canvas generator----------
const canvas = document.getElementsByClassName("canvas")[0];
const ctx = canvas.getContext("2d"); 
const scale = 10;
const columns = canvas.width / scale;
const btn = document.querySelector(".userPanel__buttons__btnStart");
const btnInstruction = document.querySelector(".userPanel__buttons__btnInstruction");
const result = document.querySelector("#current");
let resultMax = document.querySelector("#max");
const instruction = document.querySelector(".gameInstruction");
const imgBanana = document.getElementById("banana");
const imgStone = document.getElementById("stone");
const imgRunner = document.getElementById("runner"); 
const imgBird = document.getElementById("bird"); 
const gameOver = false;

//----------Configuration speed----------
let bananaSpeed = 9;
let stoneSpeed = 9;
let bananaRandomMin = 1;
let bananaRandomMax = 5;
let stoneRandomMin = 1;
let stoneRandomMax = 5;


//----------Speed change----------
const bananaSpeedRatio = 0.001; // speed up ratio
const stoneSpeedRatio = 0.001; // speed up ratio
const ratio = 0.0001 // banana/stone frequency increment

function startGame() {
//----------General Class Properties----------
class Properties {
    constructor(x, y, width, height, color, img){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.img = img;
    }
    print = () => {
        ctx.fillStyle = this.color;
        // ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }    
}

//----------Class Banana----------
class Banana extends Properties {
    x = 1200;
    y = 220;
    width = 30*2.2;
    height = 30*2.2;
    color = "yellow";
    bananaHit = false; 
    img = imgBanana;

    move = (speed) => {
        this.x -= speed;
    }
}

//----------Class Stone----------
class Stone extends Properties {
    x = 1200;
    y = 455;
    width = 40*2.5;
    height = 30*2.5;
    color= "gray";
    img = imgStone;

    move = (speed) => {
        this.x -= speed;
    }
}

//----------Class Runner----------
class Runner extends Properties {
    width = 45*3.2;
    height = 65*3.2;
    speed = 0;
    color = "black";
    score = 0;
    canJump = true;
    img = imgRunner;
    constructor(x, y) {
        super(x, y);
    }

    move = () => {  
        if (controller.up && this.canJump == false) {
            this.speed -= 50;
            this.canJump = true;
        }   
        this.speed += 1.5; // gravity
        this.y += this.speed;
        this.speed *= 0.9; // friction
        // if runner is falling below floor line
        if (this.y > 320) {
            this.canJump = false;
            this.y = 320;
            this.speed = 0;
        }
    }
}

const runner = new Runner(100, 320);

controller = {
    up:false,
    keyListener: function(ev) {
        const keyState = (ev.type == "keydown") ? true : false;
        controller.up = keyState;     
    } 
};

//----------Object Bird----------
class Bird extends Properties {
    x = 1200;
    y = 10;
    width = 160*0.5;
    height = 50*0.5;
    color= "black";
    img = imgBird;

    move = (speed) => {
        this.x -= speed;
    }
}

let bananas = [];
let stones = [];
let birds = [];

//----------Random value----------
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function newBananas() {
    let rand = getRandomInt(bananaRandomMin, bananaRandomMax);
    bananas.push(new Banana());  
    console.log(bananas);   
    if (bananas.length === 5) {
        bananas.shift();
    }
    setTimeout(newBananas, rand * 1000);
}

function newStones() {
    let rand = getRandomInt(stoneRandomMin, stoneRandomMax);
    stones.push(new Stone());
    if (stones.length === 5) {
        stones.shift();
    }
    setTimeout(newStones, rand * 1000);
} 

function newBirds() {
    let rand = getRandomInt(bananaRandomMin, bananaRandomMax*10);
    birds.push(new Bird());     
    if (birds.length === 5) {
        birds.shift();
    }
    setTimeout(newBirds, rand * 1000);
}


function catchBanana(el){
    if (el.x <= runner.x + runner.width && el.x + el.width >= runner.x // check x from both sides
        && runner.y <= el.y + el.height){ // check y just from below. You can`t jump above banana. If You would decide to do so, You would have to add another check
        runner.score += 1;
        result.innerHTML = runner.score;
        el.bananaHit = true;
        let removeIndex = bananas.map(function(el) { 
            return el.bananaHit; 
        }).indexOf(true);
        bananas.splice(removeIndex, 1);
    } 
}

function collisionWithStone(el){
    if (el.x + 20 <= runner.x + runner.width && el.x + el.width - 20 >= runner.x // check x from both sides
        && el. y + 40 <= runner.y + runner.height){ // check y just from above. You can`t jump below stone. If You would decide to do so, You would have to add another check
        gameOver = true;
        }
    storeScore(runner.score);
}

function speedUp(){
    bananaSpeed += bananaSpeedRatio;
    stoneSpeed += stoneSpeedRatio;
    bananaRandomMin -= ratio;
    bananaRandomMax -= ratio;
    stoneRandomMin -= ratio;
    stoneRandomMax -= ratio;
}

newBananas(); 
newStones();
newBirds();
hideInstruction();
  
function setUp() { 
    ctx.clearRect(0, 0, canvas.width, canvas.height);       
    runner.print();
    runner.move();
    bananas.forEach(el => {
        el.print();
        el.move(bananaSpeed); 
        catchBanana(el);                
    });     
    stones.forEach( el => {
        el.print();
        el.move(stoneSpeed);
        collisionWithStone(el);
    }); 
    birds.forEach(el => {
        el.print();
        el.move(bananaSpeed);                
    }); 
    
    speedUp();
    if (gameOver == true) {
        return;
    }        
    window.requestAnimationFrame(setUp);
}


window.addEventListener("keydown", controller.keyListener)
window.addEventListener("keyup", controller.keyListener);
window.requestAnimationFrame(setUp);
}

//----------Save to localStorage----------
function storeScore(addScore) {
    if (localStorage.getItem("savedScore") === null){
        localStorage.savedScore = JSON.stringify(addScore);
    } else {
        let retrievedScore = JSON.parse(localStorage.savedScore);
        if (retrievedScore >= addScore ) {
            maxScore = retrievedScore;
        }
        else {
            maxScore = addScore;
            localStorage.savedScore = JSON.stringify(addScore);
        }
        resultMax.innerHTML = maxScore;
    }
}

//----------Instruction option----------
function hideInstruction() {
    instruction.classList.add("hide");
}

function showInstruction() {
    instruction.classList.remove("hide");
    instruction.classList.add("active");
}

btn.addEventListener("click", startGame);
btnInstruction.addEventListener("click", showInstruction);


//-------------OLD VERSION-------------

// window.addEventListener("keydown", e => {
//     if (e.code === "ArrowUp") {
//         runner.jump(); 
//         runner.move();
//     }
// })