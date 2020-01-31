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

function Street(game, image) {
    Entity.call(this, game, 0, 0);
    this.image = image;
}

Street.prototype = new Entity();
Street.prototype.constructor = Street;

Street.prototype.update = function() {
}

Street.prototype.draw = function (ctx) {
    ctx.drawImage(ASSET_MANAGER.getAsset(this.image), 0, 0);
    Entity.prototype.draw.call(this);
}

// the "main" code begins here
var friction = 8;

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/background.png");
ASSET_MANAGER.queueDownload("./img/street1.png");
ASSET_MANAGER.queueDownload("./img/LilFrump.png");
ASSET_MANAGER.queueDownload("./img/LilFrumpSheet.png");
ASSET_MANAGER.queueDownload("./img/EnemyBig.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("loading game...");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    //var bg = new Background(gameEngine);
    var street = new Street(gameEngine, "./img/street1.png");
    var frump = new Frump(gameEngine);
    //var enemy = new Enemy(gameEngine);

    gameEngine.addEntity(street);
    var enemies = Math.floor(Math.random()*2+1);
    for (var j = 0; j < enemies; j++) gameEngine.addEntity(new Enemy(gameEngine));
    gameEngine.addEntity(frump);
 
    gameEngine.init(ctx);
    gameEngine.start();
});
