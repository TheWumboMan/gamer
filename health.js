function health(gameEntity, entityHealth) {
    console.log("health test");
    this.theEntity = gameEntity;
    this.currentHealth = entityHealth;
}

health.prototype.takeDamage = function(damageAmount){
    this.currentHealth -= damageAmount;
}