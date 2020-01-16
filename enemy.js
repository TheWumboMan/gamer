function Enemy(game) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/Enemy.png"), 0, 0, 128, 128, 0.4, 2, true, false);
    this.radius = 38;
    this.enemy = true;
    this.velocity = { x: 0, y: 0 };
    this.acceleration = 100;
    this.maxSpeed = 150;
    Entity.call(this, game, Math.random()*(700 - 100)+100, Math.random()*(700 - 100)+100);
}

Enemy.prototype = new Entity();
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function () {
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

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent.player) {
            var dist = distance(this, ent);
            if (dist > 250) {}
            else {
                this.rotation = Math.atan2(ent.y - this.y, ent.x - this.x);
                var difX = Math.cos(this.rotation);
                var difY = Math.sin(this.rotation);
                var delta = this.radius + ent.radius - distance(this, ent);
                if (this.collide(ent)) {
                    this.velocity.x = -this.velocity.x * (1/friction);
                    this.velocity.y = -this.velocity.y * (1/friction);
                    this.x -= difX * delta/2;
                    this.y -= difY * delta/2;
                    ent.x += difX * delta/2;
                    ent.y += difY * delta/2;

                }
                else {
                    this.velocity.x += difX * this.acceleration;
                    this.velocity.y += difY * this.acceleration;
                }
            }
        }
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

Enemy.prototype.draw = function (ctx) {
    this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation+Math.PI/2);
    Entity.prototype.draw.call(this);
}