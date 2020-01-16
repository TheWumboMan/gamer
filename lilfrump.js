function Frump(game) {
    this.idle = new Animation(ASSET_MANAGER.getAsset("./img/LilFrump.png"), 0, 128, 128, 128, 0.4, 2, true, false);
    this.walk = new Animation(ASSET_MANAGER.getAsset("./img/LilFrump.png"), 0, 0, 128, 128, 0.1, 8, true, false);
    this.swordIdle = new Animation(ASSET_MANAGER.getAsset("./img/LilFrump.png"), 0, 456, 200, 200, 0.4, 2, true, false);
    this.swordWalk = new Animation(ASSET_MANAGER.getAsset("./img/LilFrump.png"), 0, 256, 200, 200, 0.1, 8, true, false);
    this.swordAttack = new Animation(ASSET_MANAGER.getAsset("./img/LilFrump.png"), 400, 456, 200, 200, 0.1, 5, false, false);
    this.radius = 38;
    this.player = true;
    this.velocity = { x: 0, y: 0 };
    this.acceleration = 100;
    this.maxSpeed = 250;
    Entity.call(this, game, 400, 400);
}

Frump.prototype = new Entity();
Frump.prototype.constructor = Frump;

Frump.prototype.update = function () {
    if (this.game.spawn) this.game.addEntity(new Enemy(this.game));
    if (this.game.clickmouse && this.game.space) this.attacking = true;
    if (this.attacking) {
        //this.radius = 68;
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

    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > this.maxSpeed) {
        var ratio = this.maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    this.velocity.x -= friction * this.game.clockTick * this.velocity.x;
    this.velocity.y -= friction * this.game.clockTick * this.velocity.y;

    Entity.prototype.update.call(this);
}

Frump.prototype.draw = function (ctx) {
    this.rotation = Math.atan2(this.game.mouse.y - this.y, this.game.mouse.x - this.x) + Math.PI/2;
    if (this.attacking) this.swordAttack.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation);
    else {
        if (this.game.up || this.game.left || this.game.down || this.game.right) {
            if (this.game.space) this.swordWalk.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation);
            else this.walk.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation);
        }
        else {
            if (this.game.space) this.swordIdle.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation);
            else this.idle.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation);
        }
    }
    Entity.prototype.draw.call(this);
}
