import { GameConfig } from './config/gameConfig.js';
//------Configurations------//

const sprites = GameConfig.sprites;
const sounds = GameConfig.sounds;

class Assets_Singleton {
    //------Members------//

    _sprites;
    _sounds;
    //------Constructor------//
    constructor() {
        this._sprites = new Map();
        this._sounds = new Map();
    }

    //------Methods------//

    loadSprite(path) {
        const img = new Image();
        this._sprites.set(path, img);

        return new Promise(resolve => {
            img.onload = () => resolve();
            img.src = sprites.basePath + path;
        });
    }
    
    async loadGameSprites() {
        const loadPromises = Object.values(sprites.paths).map(this.loadSprite.bind(this));
        await Promise.all(loadPromises);
    }

    loadSound(path) {
        const audio = new Audio(sounds.basePath + path);
        this._sounds.set(path, audio);
        audio.load();

        return new Promise(resolve => {
            audio.onloadeddata = () => resolve();
        });
    }

    async loadGameSounds() {
        const loadPromises = Object.values(sounds.paths).map(this.loadSound.bind(this));
        await Promise.all(loadPromises);
    }

    //------Methods------//

    async loadGameAssets() {
        await this.loadGameSounds();
        await this.loadGameSprites();
    }

    getSprite(key) {
        return this._sprites.get(key);
    }

    getSound(key) {
        return this._sounds.get(key).cloneNode(true);
    }

    playSound(key, volume) {
        if(GameConfig.soundOn) {
            const sound = this.getSound(key);
            sound.volume = volume;
            sound.play();
        }
    }
}

export const Assets = new Assets_Singleton();