import { GameConfig } from './config/gameConfig.js';
import { Assets } from './assets.js';
import { GameWorld } from './entities/GameWorld.js';
import { Keyboard } from './inputs/keyboard.js';
import { Canvas2D } from './canvas.js';
import { Mouse } from './inputs/mouse.js';
export class Game {
    _poolGame; 
    _isLoading = false;
    _inGame = true;

    displayLoadingScreen = () => {
        return new Promise((resolve) => {
            this._isLoading = true;
            Canvas2D.clear();
            setTimeout(() => {
                this._isLoading = false;
                resolve();
            }, GameConfig.loadingScreenTimeout);
        });
    }

    update = () =>  {
        if (this._isLoading) return;
        this._poolGame.update();
        Keyboard.reset();
        Mouse.reset();
    }

    draw = () =>  {
        Canvas2D.clear();
        this._poolGame.draw();
    }

    gameLoop = () =>  {
        this.update();
        this.draw();
        window.requestAnimationFrame(() => {
            this.gameLoop();
        });
    }

    init = async() =>  {
        await Assets.loadGameAssets();
        this._poolGame = new GameWorld();
        this.gameLoop();
    }

    start = () =>  {
        this.displayLoadingScreen().then(() => {
            this._inGame = true;
            this._poolGame.initMatch();
        });
    }
}

const game = new Game();
await game.init();
game.start()