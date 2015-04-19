var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { 
    preload: preload, create: create, update: update });

// Declare the sprites globally so we can modify them later
var background;
var plots;
var flowers;
var weeds;

// Declare the game timer
var time;

function preload() {
    // Load the background image and game sprites
    game.load.image('background', 'assets/background.png');
    // TODO: Combine sprites into an atlas
    game.load.image('plot', 'assets/plot.png');
    game.load.image('flower_1', 'assets/flower_1.png');
    game.load.image('flower_2', 'assets/flower_2.png');
    game.load.image('weed_1', 'assets/weed_1.png');
}

function create() {
    // Enable the physics engine
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Apply the background sprite and set the initial background color
    background = game.add.sprite(0,0, 'background');
    background.tint = 0x0EE68;
    
    // Generate the flower/weed plots
    // TODO: Prevent overlapping plots during generation
    plots = game.add.group();
    for (var i = 0; i < 10; i++) {
        // Determine valid X/Y coordinates in the game area
        var x = Math.floor(Math.random() * (800 - (i * 8)) + 1);
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
        flower = flowers.create(-100, -100, 'flower_' + whichFlower);
    }
    
    // Define the weeds group and add physics properties
    weeds = game.add.group();
    weeds.enableBody = true;
    weeds.physicsBodyType = Phaser.Physics.ARCADE;
    // Spawn 10 random weeds outside the viewport
    for (var i = 0; i < 10; i++) {
        var whichWeed = Math.floor(Math.random() * 1 + 1);
        weed = weeds.create(-100, -100, 'weed_' + whichWeed);
    }

    // Set up inital clock for update();
    time = game.time.now;
}

function update() {
    // Every two seconds, spawn a flower or weed
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
            } else {
                // Spawn a weed
                weeds.children[currentPlot].x = x;
                weeds.children[currentPlot].y = y;
            }
            
            plots.children[currentPlot].occupied = true;
        }
        
        time = game.time.now;
    }
}