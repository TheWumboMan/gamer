function Frump(game) {
    this.idle = new Animation(ASSET_MANAGER.getAsset("./img/LilFrump.png"), 0, 200, 200, 200, 0.4, 2, true, false);
    this.walk = new Animation(ASSET_MANAGER.getAsset("./img/LilFrump.png"), 0, 0, 200, 200, 0.1, 8, true, false);
    this.hurting = new Animation(ASSET_MANAGER.getAsset("./img/LilFrump.png"), 0, 1300, 200, 200, 0.1, 1, false, false);
    this.attack = new Animation(ASSET_MANAGER.getAsset("./img/LilFrump.png"), 400, 200, 200, 200, 0.1, 4, false, false);
    this.deathAnim = new Animation(ASSET_MANAGER.getAsset("./img/LilFrump.png"), 200, 1300, 200, 300, 0.1, 5, false, false);
    // this.dead = new Animation(ASSET_MANAGER.getAsset("./img/LilFrump.png"), 400, 1200, 200, 200, 1, 1, false, false);
    this.knifeWalk = new Animation(ASSET_MANAGER.getAsset("./img/LilFrump.png"), 0, 400, 200, 200, 0.1, 8, true, false);
    this.knifeIdle = new Animation(ASSET_MANAGER.getAsset("./img/LilFrump.png"), 0, 600, 200, 200, 0.4, 2, true, false);
    this.knifeAttack = new Animation(ASSET_MANAGER.getAsset("./img/LilFrump.png"), 400, 600, 200, 200, 0.05, 4, false, false);
    this.swordWalk = new Animation(ASSET_MANAGER.getAsset("./img/LilFrump.png"), 0, 800, 200, 200, 0.1, 8, true, false);
    this.swordIdle = new Animation(ASSET_MANAGER.getAsset("./img/LilFrump.png"), 0, 1000, 200, 200, 0.4, 2, true, false);
    this.swordAttack = new Animation(ASSET_MANAGER.getAsset("./img/LilFrump.png"), 400, 1000, 200, 300, 0.1, 5, false, false);

    this.sides = 38;
    this.faces = 20;
    this.radius = 20;
    this.range = 58;
    this.player = true;
    this.velocity = { x: 0, y: 0 };
    this.acceleration = 100;
    this.maxSpeed = 250;
    this.attackTimer = 0;
    this.hitTimer = 0;
    this.hit = false;

    //new stuff
    this.alive = true;
    this.health = 10;
    this.weapon = "unarmed";

    Entity.call(this, game, 640, 360);
}

Frump.prototype = new Entity();
Frump.prototype.constructor = Frump;

Frump.prototype.update = function () {
    // console.log('P: ' + this.health);
    if (this.health <= 0) {
        this.dying = true;
        this.health = 10;
    }
    if (this.attackTimer > 0) this.attackTimer--;
    if (this.hitTimer > 0) this.hitTimer--;
    if (this.hitTimer == 0) this.hit = false;
    if (this.game.shift && this.game.space) {
        this.game.shift = false;
        this.game.space = false;
    }
    if (this.game.shift) this.weapon = "knife";
    if (this.game.space) this.weapon = "sword";
    if (!this.game.shift & !this.game.space) this.weapon = "unarmed";
    if (this.game.clickmouse && this.attackTimer == 0) {
        this.attacking = true;
        if (this.weapon == 'unarmed') this.attackTimer = 109;
        else if (this.weapon = 'knife') this.attackTimer = 106;
        else this.attackTimer = 112;
    }
    if (this.dying) {
        if (this.deathAnim.isDone()) {
            this.deathAnim.elapsedTime = 0;
            this.dying = false;
        }
    }
    if (this.hit) {
        if (this.hurting.isDone()) {
            this.hurting.elapsedTime = 0;
            this.hit = false;
        }
    }
    if (this.attacking) {
        if(this.weapon == "unarmed") {
            this.range = 50;
            if (this.attack.isDone()) {
                this.attack.elapsedTime = 0;
                this.attacking = false;
                this.attackTimer = 30;
            }
        }
        if(this.weapon == "knife") {
            this.range = 70;
            if (this.knifeAttack.isDone()) {
                this.knifeAttack.elapsedTime = 0;
                this.attacking = false;
                this.attackTimer = 9;
            }
        }
        if(this.weapon == "sword") {
            this.range = 100;
            if (this.swordAttack.isDone()) {
                this.swordAttack.elapsedTime = 0;
                this.attacking = false;
                this.attackTimer = 18;
            }
        }        
    }
    // extra janky death system
    // if(this.alive == false){
    //     this.maxSpeed == 0;
    //     this.velocity == 0;
    //     this.acceleration == 0;
    //     if (this.die.isDone()) {
    //         this.die.elapsedTime = 0;
    //         this.isDead == true;
    //     }
    // }

    if (this.game.up) this.velocity.y -= this.acceleration;
    if (this.game.down) this.velocity.y += this.acceleration;
    if (this.game.left) this.velocity.x -= this.acceleration;
    if (this.game.right) this.velocity.x += this.acceleration;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * (1/friction);
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 1280 - this.radius;
    }
    if (this.collideTop() || this.collideBottom()) {
        this.currentHealth -= 1;
        this.velocity.y = -this.velocity.y * (1/friction);
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 720 - this.radius;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent.enemy) {
            if (this.attacking && this.hurt(ent) && this.attackTimer <= 100 && this.attackTimer >= 88 && ent.hitTimer == 0) {
                ent.health--;
                ent.hit = true;
                if (this.weapon == 'knife') ent.hitTimer = 12;
                else if (this.weapon == 'unarmed') ent.hitTimer = 30;
                else ent.hitTimer = 32;
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

Frump.prototype.draw = function (ctx) {
    this.rotation = Math.atan2(this.game.mouse.y - this.y, this.game.mouse.x - this.x);
    //handle death animations, kind of
    // if(this.alive == false){
    //     //for the dying animation
    //     this.die.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation);
    // }
    // else if(this.isDead == true){
    //     //supposed to just play the last frame of the death animation
    //     this.dead.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation);
    // }
    if (this.dying) this.deathAnim.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation+Math.PI/2);
    else if (this.hit) this.hurting.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation+Math.PI/2);
    else if (this.attacking) {
        if (this.weapon == "unarmed") this.attack.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation+Math.PI/2);
        if (this.weapon == "knife") this.knifeAttack.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation+Math.PI/2);
        if (this.weapon == "sword") this.swordAttack.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation+Math.PI/2);
    }
    else {
        if (this.game.up || this.game.left || this.game.down || this.game.right) {
            if (this.weapon == "unarmed") this.walk.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation+Math.PI/2);
            if (this.weapon == "knife") this.knifeWalk.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation+Math.PI/2);
            if (this.weapon == "sword") this.swordWalk.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation+Math.PI/2);
        }
        else {
            if (this.weapon == "unarmed") this.idle.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation+Math.PI/2);
            if (this.weapon == "sword") this.swordIdle.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation+Math.PI/2);
            if (this.weapon == "knife") this.knifeIdle.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.rotation+Math.PI/2);
        }
    }
    Entity.prototype.draw.call(this);
}
