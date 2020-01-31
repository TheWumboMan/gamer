function Enemy(game) {
    this.walk = new Animation(ASSET_MANAGER.getAsset("./img/EnemyBig.png"), 0, 0, 200, 200, 0.12, 8, true, false);
    this.idle = new Animation(ASSET_MANAGER.getAsset("./img/EnemyBig.png"), 0, 0, 200, 200, 0.12, 1, true, false);
    this.hurting = new Animation(ASSET_MANAGER.getAsset("./img/EnemyBig.png"), 0, 200, 200, 200, 0.1, 1, false, false);
    this.knifeAttack = new Animation(ASSET_MANAGER.getAsset("./img/LilFrump.png"), 400, 600, 200, 200, 0.1, 4, false, false);
    this.sides = 38;
    this.faces = 20;
    this.radius = 20;
    this.range = 70;
    this.hit = false;
    this.attackTimer = 0;
    this.hitTimer = 0;
    this.enemy = true;
    this.velocity = { x: 0, y: 0 };
    this.acceleration = 100;
    this.maxSpeed = 125;
    this.health = 10;
    Entity.call(this, game, Math.random()*(1180 - 100)+100, Math.random()*(620 - 100)+100);
}

Enemy.prototype = new Entity();
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function () {
    // console.log('E: ' + this.health);
    if (this.health <= 0) {
        this.health = 10;
        this.x = Math.random()*(700-100)+100;
        this.y = Math.random()*(700-100)+100;
    }
    if (this.attackTimer > 0) this.attackTimer--;
    if (this.hitTimer > 0) this.hitTimer--;
    if (this.hitTimer == 0) this.hit = false;
    if (this.hit) {
        if (this.hurting.isDone()) {
            this.hurting.elapsedTime = 0;
            this.hit = false;
        }
    }
    if (this.attacking) {
        if (this.knifeAttack.isDone()) {
            this.knifeAttack.elapsedTime = 0;
            this.attacking = false;
        }
    }

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * (1/friction);
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 1280 - this.radius;
    }
    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * (1/friction);
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 720 - this.radius;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent.player) {
            if (distance(this, ent) < 250) {
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
                if (distance(this, ent) < 90 && this.attackTimer == 0) {
                    this.attacking = true;
                    this.attackTimer = 90;
                }
                if (this.attacking && this.hurt(ent) && this.attackTimer <= 78 && this.attackTimer >= 66 && ent.hitTimer == 0) {
                    ent.health--;
                    ent.hit = true;
                    ent.hitTimer = this.attackTimer;
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
    if (this.hit) this.hurting.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation+Math.PI/2);
    else if (this.attacking) this.knifeAttack.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation+Math.PI/2);
    else if (this.velocity.x > -5 && this.velocity.x < 5 && this.velocity.y > -5 && this.velocity.y < 5)
        this.idle.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation+Math.PI/2);
    else this.walk.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation+Math.PI/2);
    Entity.prototype.draw.call(this);
}