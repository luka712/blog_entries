class ScrollingSprite {
    constructor(image, x, y, width, height, speed) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }

    scroll() {
        this.x -= this.speed;
        if (this.x <= -this.width) {
            this.x = this.width - 1;
        }
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

window.onload = () => {

    const canvas = document.getElementById("render-canvas");
    const ctx = canvas.getContext('2d');

    const backgroundImage = new Image();
    backgroundImage.src = 'https://luka712.github.io/images/11/BG.png';

    const backgroudSprite = new ScrollingSprite(backgroundImage, 0, 0, canvas.width, canvas.height, 1);
    const backgroundSprite2 = new ScrollingSprite(backgroundImage, -canvas.width, 0, canvas.width, canvas.height, 1);

    const bakcgroundBuildingsImage = new Image();
    bakcgroundBuildingsImage.src = 'https://luka712.github.io/images/11/Background 1.png';

    const backgroundBuildingsSprite = new ScrollingSprite(bakcgroundBuildingsImage, 0, 0, canvas.width, canvas.height, 2);
    const backgroundBuildingsSprite2 = new ScrollingSprite(bakcgroundBuildingsImage, -canvas.width, 0, canvas.width, canvas.height);

    const bridgeImage = new Image();
    bridgeImage.src = 'https://luka712.github.io/images/11/Middle.png';

    const middleSprite = new ScrollingSprite(bridgeImage, 0, 0, canvas.width, canvas.height, 2.5);
    const middleSprite2 = new ScrollingSprite(bridgeImage, -canvas.width, 0, canvas.width, canvas.height, 2.5);

    const foregroundBuildingImage = new Image();
    foregroundBuildingImage.src = 'https://luka712.github.io/images/11/Foreground.png';

    const foregroundBuildingSprite = new ScrollingSprite(foregroundBuildingImage, 0, 0, canvas.width, canvas.height, 3);
    const foregroundBuildingSprite2 = new ScrollingSprite(foregroundBuildingImage, -canvas.width, 0, canvas.width, canvas.height, 3);

    const spriteArray = [
        backgroudSprite,
        backgroundSprite2,
        backgroundBuildingsSprite,
        backgroundBuildingsSprite2,
        middleSprite,
        middleSprite2,
        foregroundBuildingSprite,
        foregroundBuildingSprite2
    ];

    // Draw loop
    const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        spriteArray.forEach(sprite => {
            sprite.scroll();
            sprite.draw(ctx);
        });

        window.requestAnimationFrame(render);
    }
    render();
}