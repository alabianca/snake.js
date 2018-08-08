

const snake = document.getElementById('snake');
const target = document.getElementById('target');
const gameContainer = document.getElementById('container');
gameContainer.sibli

//w: 119
const UP = 119;
//a: 97
const LEFT = 97
//d: 100
const RIGHT = 100;
//s: 115
const DOWN = 115;

const STOP = 105; //i
const GO = 117 //u



function start() {
    const s = new Snake(snake);
    registerEventListeners(s);
    setTarget();

    s.on('gain', (historicalData)=>{
        removeTarget();
        const node = createNode();
        s.push(node);
        setTarget();
        //s.pause();
    });
    s.on('loss', ()=>{
        console.log('LOSS');
    });

    function setTarget() {
        const pos = randomPosition();
        s.setTargetCoordinates(pos.left,pos.top);
    }

    
}

function removeTarget() {
    target.style.display = 'none';
}

function createNode() {
    const node = document.createElement('span');
    node.classList.add('snake');
    return node;
}

function randomPosition() {
    const top = Math.floor(Math.random() * 100);
    const left = Math.floor(Math.random() * 100);

    target.style.display = "inline-block";
    target.style.top = top + "%";
    target.style.left = left + "%";

    return {
        top:top,
        left:left
    }
}

function registerEventListeners(snake) {
    document.addEventListener('keypress', (e)=>{
        const keyCode = e.keyCode;
        switch(keyCode) {
            case UP: snake.setDirection("UP");
                break;
            case DOWN: snake.setDirection("DOWN");
                break;
            case LEFT: snake.setDirection("LEFT");
                break;
            case RIGHT: snake.setDirection("RIGHT");
                break;
            case STOP: snake.pause();
                break;
            case GO: snake.continue();
        }
    })
}

function Snake(element) {
    this.element = element;
    this._intervalId = null;
    this._currentDirection = this.generateRandomDir();
    this._target = null;
    this._events = {};
    this._lastHitData = null;
    this.length = 1;
    this.body = [this.element];
    this.head = new $Node(element,this.length);
    this.tail = this.head;
    

    this._init();
    
}

//statics
Snake.directions = ["UP", "DOWN", "LEFT", "RIGHT"];
Snake.EVENT_GAIN = "gain";
Snake.EVENT_LOSS = "lose";

Snake.prototype.generateRandomDir = function() {
    const r = Math.random();
    const random = r*4;
    return Snake.directions[Math.floor(random)];
}

Snake.prototype.pause = function() {
    clearInterval(this._intervalId);
}

Snake.prototype.continue = function() {
    this._intervalId = setInterval(()=> this._move(),100)
}

Snake.prototype._init = function() {

    this.head.setTop(50);
    this.head.setLeft(50);
    this.setDirection(this.generateRandomDir());
    this._intervalId = setInterval(()=> this._move() ,100);
}

Snake.prototype.on = function(event, handler) {
    if(this._events[event]) {
        this._events[event].push(handler);
    } else {
        this._events[event] = [handler];
    }
}

Snake.prototype._emit = function(event,data) {
    if(this._events[event]) {
        this._events[event].forEach(handler => handler(data));
    }
}

Snake.prototype.push = function(element) {
    this.body.push(element);
    this.length++;

    const lastHitData = this._lastHitData[this._lastHitData.length-1]; //get the lastHitData for the tail
    const newTail = this.tail.push(element,this.length);

    if(lastHitData.direction === "UP") {
        const top = lastHitData.position.top + 1;
        newTail.setTop(top);
        newTail.setLeft(lastHitData.position.left);
    } else if(lastHitData.direction === "LEFT") {
        const left = lastHitData.position.left + 1;
        newTail.setTop(lastHitData.position.top);
        newTail.setLeft(left);
    } else if(lastHitData.direction === "RIGHT") {
        const left = lastHitData.position.left - 1;
        newTail.setTop(lastHitData.position.top);
        newTail.setLeft(left);
    } else {
        const top = lastHitData.position.top - 1;
        newTail.setTop(top);
        newTail.setLeft(lastHitData.position.left);
    }

    this.tail = newTail;
}

Snake.prototype.setTargetCoordinates = function(x,y) {
    this._target = {
        left:x,top:y
    }
}

//TODO: ACCOUNT FOR CORNER CASES
Snake.prototype.setTop = function(value) {
    if(value === 100) {
        this.setTop(99);
        this.setDirection("LEFT");
    
    } 
    else if(value === 0) {
        this.setTop(1);
        this.setDirection("LEFT");
    }
    else {
        this.element.style.top = value + "%";
    }
}

//TODO: ACCOUNT FOR CORNER CASES
Snake.prototype.setLeft = function(value) {
    if(value === 100) {
        this.setLeft(99);
        this.setDirection("DOWN");
    } 
    else if(value === 0) {
        this.setLeft(1);
        this.setDirection("DOWN");
    }
    else {
        this.element.style.left = value + "%";
    }
}

Snake.prototype.getCurrentPosition = function() {
    const topS = this.element.style.top;
    const leftS = this.element.style.left;

    const top = parseInt(topS.split('%')[0]);
    const left = parseInt(leftS.split('%')[0]);

    return {
        top:top,
        left:left
    }
}

Snake.prototype.setDirection = function(direction) {
    this._currentDirection = direction;
    this.head.direction = direction;
}

Snake.prototype._move = function() {
    const dataAboutThisMove = [];
    this.forEach((node,index)=>{
        const move = node.move();
        this.setDirection(this._currentDirection);
        dataAboutThisMove.push(move);
        if(this._hitBody(this.head,node)) {
            this._emit(Snake.EVENT_LOSS);
        }
    });

    if(this._hitTarget(this.head)) {
        this._lastHitData = dataAboutThisMove;
        this._emit(Snake.EVENT_GAIN, dataAboutThisMove);
    }
   
}



Snake.prototype._hitTarget = function(node) {
    const pos = node.getCurrentPosition();

    if(pos.top === this._target.top && pos.left === this._target.left) {
        return true;
    }

    return false;
}

Snake.prototype._hitBody = function(head,bodyNode) {
    const headPos = head.getCurrentPosition();
    const bodyPos = bodyNode.getCurrentPosition();

    if(head === bodyNode) {
        return false;
    }

    if(headPos.top === bodyPos.top && headPos.left === bodyPos.left) {
        return true;
    }
    
    return false;
}


Snake.prototype._getNodePositionAt = function(index) {
    const node = this.body[index];
    return {
        top: parseInt(node.style.top),
        left: parseInt(node.style.left)
    }
}

Snake.prototype.forEach = function(projection) {
    let node = this.head;
    let index = 0;
    while(node) {
        projection(node,index);
        node = node.next;
        index++;
    }
}

 
function $Node(element,maxSize) {
    this.element = element;
    //this.moves = [];
    this.MAX = maxSize;
    this.next = null;
    this.prev = null;
    this.direction = null;

    this._previousPosition = null;
}



$Node.prototype.push = function(element,maxSize) {
    const parentDiv = this.element.parentNode;
    parentDiv.insertBefore(element,this.element);
    this.next = new $Node(element,maxSize);
    this.next.prev = this;
    return this.next;
}


$Node.prototype.getCurrentPosition = function() {
    const topS = this.element.style.top;
    const leftS = this.element.style.left;

    return {
        top: parseInt(topS.split('%')[0]),
        left: parseInt(leftS.split('%')[0])
    }
}

$Node.prototype.setPreviousPosition = function(top,left) {
    this._previousPosition = {
        top:top,left:left
    }
}
$Node.prototype.getPreviousPosition = function() {
    return this._previousPosition;
}

$Node.prototype.move = function() {
    const pos = this.getCurrentPosition();
    this.setPreviousPosition(pos.top,pos.left);

    const previous = this.prev;

    //check if we are curently moving the head or not
    if(previous) {
        const p = previous.getPreviousPosition();
        this.setTop(p.top);
        this.setLeft(p.left);

    } else { //we are moving the head
        switch(this.direction) {
            case "UP": this.setTop(pos.top-1);
                break;
            case "DOWN": this.setTop(pos.top+1);
                break;
            case "LEFT": this.setLeft(pos.left-1);
                break;
            case "RIGHT": this.setLeft(pos.left+1);
                break;
        }
    }


    return {
        direction:this.direction,
        position:pos
    }
}

$Node.prototype.setTop = function(value) {
    this.element.style.top = value + "%";
}

$Node.prototype.setLeft = function(value) {
    this.element.style.left = value + "%";
}

start();

