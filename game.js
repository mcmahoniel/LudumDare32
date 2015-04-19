var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { 
    preload: preload, create: create, update: update });

// Declare the sprites globally so we can modify them later
var background;
var plots;
var flowers;
var weeds;
var weapons;

// Declare the text fields
var gameInfoText;
var flowerText;
var weedText;

// Declare our buttons
var acid_button;
var fireball_button;
var sawblade_button;
var uav_button;

// Declare our score trackers
var flowerCount = 0;
var weedCount = 0;

// Set our default weapon
var currentWeapon = 0;

// Declare the game timers
var time;
var weaponLastFired;

// Declare our sound effects
var acid_sound;
var fireball_sound;
var sawblade_sound;
var uav_sound;
var flower_pain_sound_1;
var flower_pain_sound_2;
var weed_pain_sound;

// Declare our game state
var paused = true;
var gameOver = false;

function preload() {
    // Load the background image and game sprites
    // TODO: Combine sprites into an atlas
    game.load.image('background', 'assets/sprites/background.png');
    game.load.image('acid_icon', 'assets/sprites/acid_icon.png');
    game.load.image('fireball_icon', 'assets/sprites/fireball_icon.png');
    game.load.image('sawblade_icon', 'assets/sprites/sawblade_icon.png');
    game.load.image('uav_icon', 'assets/sprites/uav_icon.png');
    game.load.image('plot', 'assets/sprites/plot.png');
    game.load.spritesheet('flower_1', 'assets/sprites/flower_1.png', 64, 128);
    game.load.spritesheet('flower_2', 'assets/sprites/flower_2.png', 64, 128);
    game.load.image('weed_1', 'assets/sprites/weed_1.png');
    game.load.image('acid_weapon', 'assets/sprites/acid_weapon.png');
    game.load.image('fireball_weapon', 'assets/sprites/fireball_weapon.png');
    game.load.image('sawblade_weapon', 'assets/sprites/sawblade_weapon.png');
    game.load.image('uav_weapon', 'assets/sprites/uav_weapon.png');
    
    // Load sound effects
    game.load.audio('acid', 'assets/sounds/acid.wav');
    game.load.audio('fireball', 'assets/sounds/fireball.wav');
    game.load.audio('sawblade', 'assets/sounds/sawblade.wav');
    game.load.audio('uav', 'assets/sounds/uav.wav');
    game.load.audio('flower_pain_1', 'assets/sounds/flower_pain_1.wav');
    game.load.audio('flower_pain_2', 'assets/sounds/flower_pain_2.wav');
    game.load.audio('weed_pain', 'assets/sounds/weed_pain.wav');
}

function create() {
    // Enable the physics engine
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Apply the background sprite and set the initial background color
    background = game.add.sprite(0,0, 'background');
    background.tint = 0x0EE68;
    
    // Add the weapon selection buttons
    acid_button = game.add.sprite(25, 479, 'acid_icon');
    fireball_button = game.add.sprite(146, 479, 'fireball_icon');
    sawblade_button = game.add.sprite(558, 479, 'sawblade_icon');
    uav_button = game.add.sprite(679, 479, 'uav_icon');

    // Add our sound effects
    acid_sound = game.add.audio('acid');
    fireball_sound = game.add.audio('fireball');
    sawblade_sound = game.add.audio('sawblade');
    uav_sound = game.add.audio('uav');
    flower_pain_sound_1 = game.add.audio('flower_pain_1');
    flower_pain_sound_2 = game.add.audio('flower_pain_2');
    weed_pain_sound = game.add.audio('weed_pain');
    
    // Generate the flower/weed plots
    // TODO: Prevent overlapping plots during generation
    plots = game.add.group();
    for (var i = 0; i < 10; i++) {
        // Determine valid X/Y coordinates in the game area
        var x = i * 80;
        var y = Math.floor(Math.random() * (600 - (i * 6)) + 1);

        // Prevent sprite from extending off of the right or bottom
        if (x > 736) {
            x = 736;
        }
        if (y > 400) {
            // Leave room for bottom text and interaction area
            y = 400;
        } else if (y < 110) {
            // Leave enough room for flower to prevent clipping
            y = 110;
        }

        plot = plots.create(x, y, 'plot');
        plot.occupied = false;
    }

    // Define the flowers group and add physics properties
    flowers = game.add.group();
    flowers.enableBody = true;
    flowers.physicsBodyType = Phaser.Physics.ARCADE;
    // Spawn 10 random flowers outside the viewport
    for (var i = 0; i < 10; i++) {
        var whichFlower = Math.floor(Math.random() * 2 + 1);
        flower = flowers.create(-100, 800, 'flower_' + whichFlower);
        flower.animations.add('happy_animation', [0, 1, 2, 3], 5, true);
        flower.animations.add('acid_animation', [4], 1, true);
        flower.animations.add('fireball_animation', [5], 1, true);
        flower.animations.add('sawblade_animation', [6], 1, true);
        flower.animations.add('uav_animation', [7], 5, true);
        flower.play('happy_animation');
    }
    
    // Define the weeds group and add physics properties
    weeds = game.add.group();
    weeds.enableBody = true;
    weeds.physicsBodyType = Phaser.Physics.ARCADE;
    // Spawn 10 random weeds outside the viewport
    for (var i = 0; i < 10; i++) {
        var whichWeed = Math.floor(Math.random() * 1 + 1);
        weed = weeds.create(-100, 800, 'weed_' + whichWeed);
    }

    // Define the weaopns group and add physics properties
    weapons = game.add.group();
    weapons.enableBody = true;
    weapons.physicsBodyType = Phaser.Physics.ARCADE;
    weapons.create(-200, 800, 'acid_weapon');
    weapons.create(-200, 800, 'fireball_weapon');
    weapons.create(-200, 800, 'sawblade_weapon');
    weapons.create(-200, 800, 'uav_weapon');

    // Set up inital clock for update();
    time = game.time.now;
    // Set up initial clock for weapon firing
    weaponLastFired = game.time.now;
    
    // Tint acid_button since it's our default weapon
    acid_button.tint = 0xAABBCC;
    
    // Add and configure the score text fields
    var style = { fill: '#B208C4' };
    flowerText = game.add.text(5, 0, 'Flowers: 0', style);
    flowerText.bringToTop();
    style = { fill: '#D4691E' };
    weedText = game.add.text(5, 25, 'Weeds: 0', style);
    weedText.bringToTop();
    
    // Add and configure our game info text
    var description = 'This is your garden.\nDon\'t let it fall into the wrong hands.';
    style = { font: '50px Arial', align: 'center', fill: '#3B5A75' };
    gameInfoText = game.add.text(game.world.centerX - 395, game.world.centerY - 50, description, style);
    gameInfoText.bringToTop();
}

function update() {
    if (paused && gameOver === false) {
        if (game.input.activePointer.isDown) {
            // Delete our info text
            game.world.remove(gameInfoText);
            // Start the game
            paused = false;
        }
    } else if (flowerCount === 10 || weedCount === 10) {
        // Detect 10 flowers or weeds and end the game accordingly
        gameOver = true;
        paused = true;
        var style;
        if (flowerCount === 10) {
            // Display win text
            style = { font: '50px Arial', align: 'center', fill: '#FFEE77' };
            var winText = "You've saved the garden!\nGive yourself a pat on the back.\nYou've earned it.";
            var won = game.add.text(game.world.centerX - 360, game.world.centerY - 70, winText, style);
            won.bringToTop();
        } else {
            // Display lose text
            style = { font: '50px Arial', align: 'center', fill: '#FF0000' };
            var loseText = "Your garden is lost.\nGet a new hobby, black thumb.";
            var lost = game.add.text(game.world.centerX - 340, game.world.centerY - 50, loseText, style);
            lost.bringToTop();
        }
    } else {
        spawnOccupants();
        tintBackground();
        checkInput();
        checkCollision();
    }
}

// Set all buttons to normal before tinting the currently selected button
function resetButtons() {
    acid_button.tint = 0xFFFFFF;
    fireball_button.tint = 0xFFFFFF;
    sawblade_button.tint = 0xFFFFFF;
    uav_button.tint = 0xFFFFFF;
}

// Tint the background color based on the ratio of flowers to weeds
function tintBackground() {
    var ratioFlowersToWeeds = flowerCount / weedCount;
    
    if (ratioFlowersToWeeds < 1.0) {
        background.tint = 0x869E82;
    } else if (ratioFlowersToWeeds < 0.43) {
        background.tint = 0xA6AB79;
    } else if (ratioFlowersToWeeds < 0.12) {
        background.tint = 0x917B56;
    } else {
        background.tint = 0x0EE68;
    }
}

// Every two seconds, spawn a flower or a weed on empty plots
function spawnOccupants() {
    if (game.time.now > time + 2000) {
        // Modify a random plot
        // TODO: Refactor to generate an index between 0 and 9
        var currentPlot = Math.floor(Math.random() * 10 + 1);
        if (currentPlot > 9) {
            currentPlot = 0;
        }
        
        // Save the plot's position and modify y for flower/weed placement
        var x = plots.children[currentPlot].x;
        var y = plots.children[currentPlot].y - 110;

        // If the plot isn't occupied, add a flower or weed
        if (plots.children[currentPlot].occupied === false) {
            var determineOccupant = Math.floor(Math.random() * 2);
            if (determineOccupant === 0) {
                // Spawn a flower
                flowers.children[currentPlot].x = x;
                flowers.children[currentPlot].y = y;
                
                flowerCount++;
                flowerText.text = 'Flowers: ' + flowerCount;
            } else {
                // Spawn a weed
                weeds.children[currentPlot].x = x;
                weeds.children[currentPlot].y = y;
                
                weedCount++;
                weedText.text = 'Weeds: ' + weedCount;
            }
            
            plots.children[currentPlot].occupied = true;
        }
        
        time = game.time.now;
    }
}

// Check for weapon selection and firing and spawn projectile
function checkInput() {
    if (game.input.activePointer.isDown) {
        // Get tap/click position
        var xInput = game.input.activePointer.x;
        var yInput = game.input.activePointer.y;
        
        // If y < 470, shoot the current weapon
        if (yInput < 470 && game.time.now > (weaponLastFired + 1000)) {
            // Position the correct projectile at the bottom of the viewport
            var weapon = weapons.children[currentWeapon];
            weapon.x = 400;
            weapon.y = 500;
            
            // Shoot selected weapon in direction of tap/click
            game.physics.arcade.moveToPointer(weapon, 500);
            
            // Play the appropriate weapon sound
            switch (currentWeapon) {
                case 0:
                    acid_sound.play();
                    break;
                case 1:
                    fireball_sound.play();
                    break;
                case 2:
                    sawblade_sound.play();
                    break;
                case 3:
                    uav_sound.play();
                    break;
            }
            
            weaponLastFired = game.time.now;
        } else if (yInput > 470) {
            // Detect weapon selection
            if (xInput > 25 && xInput < 121) {
                currentWeapon = 0;
                resetButtons();
                acid_button.tint = 0xAABBCC;
            } else if (xInput > 146 && xInput < 242) {
                currentWeapon = 1;
                resetButtons();
                fireball_button.tint = 0xAABBCC;
            } else if (xInput > 558 && xInput < 654) {
                currentWeapon = 2;
                resetButtons();
                sawblade_button.tint = 0xAABBCC;
            } else if (xInput > 679 && xInput < 775) {
                currentWeapon = 3;
                resetButtons();
                uav_button.tint = 0xAABBCC;
            }
        }
    }
}

// Detect any collision between flowers/weeds and a projectile
function checkCollision() {
    game.physics.arcade.collide(flowers, weapons, killObject, null, this);
    game.physics.arcade.collide(weeds, weapons, killObject, null, this);
}

// Tint whatever was collided with and then queue it for removal
function killObject(_object, _weapon) {
    // Play appropriate death animation
    if (_weapon.key === 'acid_weapon') {
        _object.animations.play('acid_animation');
    } else if (_weapon.key === 'fireball_weapon') {
        _object.animations.play('fireball_animation');
    } else if (_weapon.key === 'sawblade_weapon') {
        _object.animations.play('sawblade_animation');
    } else if (_weapon.key === 'uav_weapon') {
        _object.animations.play('uav_animation');
    }
    
    // Immediately disable collision to prevent duplicate hits
    _object.body.enable = false;

    // Decrement flower/weed count, play appropriate pain sound
    if (_object.parent === flowers) {
        flowerCount--;
        flowerText.text = 'Flowers: ' + flowerCount;
        // Play either pain sound
        var whichSound = Math.floor(Math.random() * 2);
        if (whichSound === 0) {
            flower_pain_sound_1.play();
        } else {
            flower_pain_sound_2.play();
        }
    } else {
        weedCount--;
        weedText.text = 'Weeds: ' + weedCount;
        weed_pain_sound.play();
    }
    
    // Call resetObject() after a half second delay
    setTimeout(function() { resetObject(_object); }, 500);
}

// Reset an object and associated plot to its initial settings
function resetObject(_object) {
    // Reset flower/weed position outside the viewport
    _object.x = -100;
    _object.y = 800;
    
    // Reset movement to zero
    _object.body.velocity.x = 0;
    _object.body.velocity.y = 0;
    
    // Reenable physics
    _object.body.enable = true;
    
    // Reset color
    _object.tint = 0xFFFFFF;
    
    // Reset happy animation
    _object.animations.play('happy_animation');
    
    // Get plot index from the flower/weed we're resetting
    var index = _object.parent.getIndex(_object);
    
    // Set the plot to unoccupied so it can be filled again
    plots.children[index].occupied = false;
}