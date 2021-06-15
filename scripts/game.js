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
    _menuActionsMap;
    _previousMenus = [];
    //_menu: Menu = new Menu();
    _poolGame;
    _isLoading = false;
    _inGame;

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
        /* if (this._isLoading) return;
        if(AI.finishedSession){
            Canvas2D.clear();
            this._menu.active ? this._menu.draw() : this._poolGame.draw();
        } */
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
        await Assets.loadGameAssets();
        /* this.initMenuActions();
        this.initMainMenu();
        this._menu.active = true; */
        this._poolGame = new GameWorld();
        this.gameLoop();
    }

    /* async start() {
        await Assets.loadGameAssets();
        GameConfig.ai.on = false;
        this._inGame = true;
        this._poolGame = new GameWorld();
        this.draw()
        console.log(this._poolGame)
        this._poolGame.initMatch();
        this.gameLoop();
    } */

    start() {
        this.displayLoadingScreen().then(() => {
            this._menu.active = false;
            this._inGame = true;
            this._poolGame = new GameWorld();
            this._poolGame.initMatch();
        });
    }
}

const game = new Game();
await game.init();
game.start()