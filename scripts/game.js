import { GameConfig } from './config/gameConfig.js';
import { Assets } from './assets.js';
import { GameWorld } from './entities/GameWorld.js';
import { Keyboard } from './inputs/keyboard.js';
import { Canvas2D } from './canvas.js';
import { Mouse } from './inputs/mouse.js';

//------Configurations------//

const sprites = GameConfig.sprites;
const inputConfig = GameConfig.input;

export class Game {
    _poolGame;
    _isLoading = false;
    _inGame = true;

    //------Methods------//

    displayLoadingScreen() {
        return new Promise((resolve) => {
            this._isLoading = true;
            console.log(Assets.getSprite(sprites.paths.controls))
            Canvas2D.clear();
            Canvas2D.drawImage(
                Assets.getSprite(sprites.paths.controls),
                GameConfig.loadingScreenImagePosition
            );
            setTimeout(() => {
                this._isLoading = false;
                resolve();
            }, GameConfig.loadingScreenTimeout);
        });
    }

    handleInput() {
        if(this._inGame && Keyboard.isPressed(inputConfig.toggleMenuKey)) {
            if(this._menu.active) {
                this._menu.active = false;
            }
            else {
                this.initMainMenu();
                this._menu.active = true;
            }
        }
    }

    update() {
        if (this._isLoading) return;
        this.handleInput();
        this._poolGame.update();
        Keyboard.reset();
        Mouse.reset();
    }

    draw() {
        Canvas2D.clear();
        this._poolGame.draw();
    }

    gameLoop() {
        this.update();
        this.draw();
        window.requestAnimationFrame(() => {
            this.gameLoop();
        });
    }

    //------Methods------//
    async init() {
        console.log("load")
        await Assets.loadGameAssets();
        console.log("din")
        this._poolGame = new GameWorld();
        this.gameLoop();
    }

    start() {
        this.displayLoadingScreen().then(() => {
            this._inGame = true;
            this._poolGame = new GameWorld();
            this._poolGame.initMatch();
        });
    }
}

const game = new Game();
await game.init();
game.start()