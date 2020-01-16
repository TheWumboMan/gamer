function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, angle, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;

    ctx.setTransform(1, 0, 0, 1, locX, locY);
    ctx.rotate(angle);
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight, -this.frameWidth/2, -this.frameHeight/2,
                  this.frameWidth * scaleBy, this.frameHeight * scaleBy);
    ctx.rotate(angle);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Background(game) {
    Entity.call(this, game, 0, 0);
    this.radius = 0;
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
}

Background.prototype.draw = function (ctx) {
    ctx.drawImage(ASSET_MANAGER.getAsset("./img/background.png"), 0, 0);
    Entity.prototype.draw.call(this);
}

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Crump(game) {
    this.idle = new Animation(ASSET_MANAGER.getAsset("./img/LilCrump.png"), 0, 128, 128, 128, 0.4, 2, true, false);
    this.walk = new Animation(ASSET_MANAGER.getAsset("./img/LilCrump.png"), 0, 0, 128, 128, 0.1, 8, true, false);
    this.swordIdle = new Animation(ASSET_MANAGER.getAsset("./img/LilCrump.png"), 0, 456, 200, 200, 0.4, 2, true, false);
    this.swordWalk = new Animation(ASSET_MANAGER.getAsset("./img/LilCrump.png"), 0, 256, 200, 200, 0.1, 8, true, false);
    this.swordAttack = new Animation(ASSET_MANAGER.getAsset("./img/LilCrump.png"), 400, 456, 200, 200, 0.1, 5, false, false);
    this.radius = 38;
    Entity.call(this, game, 400, 400);

    this.velocity = { x: 0, y: 0 };
    this.acceleration = 100;
    this.maxSpeed = 250;
}

Crump.prototype = new Entity();
Crump.prototype.constructor = Crump;

Crump.prototype.update = function () {
    if (this.game.clickmouse && this.game.space) this.attacking = true;
    if (this.attacking) {
        this.radius = 68;
        if (this.swordAttack.isDone()) {
            this.swordAttack.elapsedTime = 0;
            this.attacking = false;
            this.radius = 38;
        }
    }

    if (this.game.up) this.velocity.y -= this.acceleration;
    if (this.game.down) this.velocity.y += this.acceleration;
    if (this.game.left) this.velocity.x -= this.acceleration;
    if (this.game.right) this.velocity.x += this.acceleration;

    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > this.maxSpeed) {
        var ratio = this.maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
    Entity.prototype.update.call(this);

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * (1/friction);
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
    }
    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * (1/friction);
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
    }

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    this.velocity.x -= friction * this.game.clockTick * this.velocity.x;
    this.velocity.y -= friction * this.game.clockTick * this.velocity.y;
}

Crump.prototype.draw = function (ctx) {

    var rotation = Math.atan2(this.game.mouse.y - this.y, this.game.mouse.x - this.x) + Math.PI/2;

    if (this.attacking) this.swordAttack.drawFrame(this.game.clockTick, ctx, this.x, this.y, rotation);
    else {
        if (this.game.up || this.game.left || this.game.down || this.game.right) {
            if (this.game.space) this.swordWalk.drawFrame(this.game.clockTick, ctx, this.x, this.y, rotation);
            else this.walk.drawFrame(this.game.clockTick, ctx, this.x, this.y, rotation);
        }
        else {
            if (this.game.space) this.swordIdle.drawFrame(this.game.clockTick, ctx, this.x, this.y, rotation);
            else this.idle.drawFrame(this.game.clockTick, ctx, this.x, this.y, rotation);
        }
    }
    Entity.prototype.draw.call(this);
}

function Enemy(game) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/Enemy.png"), 0, 0, 128, 128, 0.4, 2, true, false);
    this.radius = 38;
    this.enemy = true;
    Entity.call(this, game, 200, 200);

    this.velocity = { x: 0, y: 0 };
    this.acceleration = 100;
    this.maxSpeed = 200;
}

Enemy.prototype = new Entity();
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function () {
    Entity.prototype.update.call(this);

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * (1/friction);
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }
    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * (1/friction);
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (!ent.enemy) {
            var dist = distance(this, ent);
            if (dist > this.radius + ent.radius + 10) {
                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * this.acceleration / (dist*dist);
                this.velocity.y += difY * this.acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
                if (speed > this.maxSpeed) {
                    var ratio = this.maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            if (dist > this.radius + ent.radius) {
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x -= difX * this.acceleration / (dist * dist);
                this.velocity.y -= difY * this.acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > this.maxSpeed) {
                    var ratio = this.maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
        }
    }

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    this.velocity.x -= friction * this.game.clockTick * this.velocity.x;
    this.velocity.y -= friction * this.game.clockTick * this.velocity.y;
}

Enemy.prototype.draw = function (ctx) {
    this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 0);
    Entity.prototype.draw.call(this);
}

// the "main" code begins here

var friction = 8;

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/background.png")
ASSET_MANAGER.queueDownload("./img/LilCrump.png");
ASSET_MANAGER.queueDownload("./img/Enemy.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var bg = new Background(gameEngine);
    var crump = new Crump(gameEngine);
    var enemy = new Enemy(gameEngine);

    gameEngine.addEntity(bg);
    gameEngine.addEntity(crump);
    gameEngine.addEntity(enemy);
 
    gameEngine.init(ctx);
    gameEngine.start();
});
