var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });

var background;

var plots;
var flowers;
var weeds;

function preload() {
    // Load the background image and game sprites
    game.load.image('background', 'assets/background.png');
    game.load.image('test_flower', 'assets/test_flower.png');
    game.load.image('plot', 'assets/plot.png');
}

function create() {
    // Enable the physics engine
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Apply the background sprite and set the initial color tint
    background = game.add.sprite(0,0, 'background');
    background.tint = 0x0EE68;
    
    // Generate the flower/weed plots
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
        } else if (y < 64) {
            // Leave enough room for flower to prevent clipping
            y = 64;
        }

        plot = plots.create(x, y, 'plot');
    }

    // Define the flowers group and add physics properties
    flowers = game.add.group();
    flowers.enableBody = true;
    flowers.physicsBodyType = Phaser.Physics.ARCADE;
    
    // Define the weeds group and add physics properties
    weeds = game.add.group();
    weeds.enableBody = true;
    weeds.physicsBodyType = Phaser.Physics.ARCADE;
    
    // Manually add test plot/flower
    //game.add.sprite(64,64, 'plot');
    //game.add.sprite(64,8, 'test_flower');
}

function update() {
    //background.tint = 0x123456;
}