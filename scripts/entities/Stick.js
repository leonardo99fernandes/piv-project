import { Keyboard } from '../inputs/keyboard.js';
import { Mouse } from '../inputs/mouse.js';
import { GameConfig } from '../config/gameConfig.js';
import { Assets } from '../assets.js';
import { Canvas2D } from '../canvas.js';
import { Vector2 } from '../geom/vector2.js';
import { mapRange } from '../common/mapRange.js';

//------Configurations------//
const inputConfig = GameConfig.input;
const stickConfig = GameConfig.stick;
const sprites = GameConfig.sprites;
const sounds = GameConfig.sounds;

export class Stick {
    //------Members------//
    _sprite = Assets.getSprite(sprites.paths.stick);
    _rotation = 0;
    _origin = Vector2.copy(stickConfig.origin);
    _power = 0;
    _movable = true;
    _visible = true;
    _position;
    //------Properties------//

    get position()  {
        return Vector2.copy(this._position);
    }
    
    get rotation() {
        return this._rotation;
    }

    get power() {
        return this._power;
    }

    set movable(value) {
        this._movable = value;
    }

    get visible() {
        return this._visible;
    }

    set visible(value) {
        this._visible = value;
    }

    set rotation(value) {
        this._rotation = value;
    }

    //------Constructor------//

    constructor(_position) {
        this._position = _position
    }

    //------Methods------//

    increasePower() {
        this._power += stickConfig.powerToAddPerFrame;
        this._origin.addToX(stickConfig.movementPerFrame);
    }

    decreasePower() {
        this._power -= stickConfig.powerToAddPerFrame;
        this._origin.addToX(-stickConfig.movementPerFrame);
    }
    
    isLessThanMaxPower() {
        return this._power < stickConfig.maxPower;
    }

    isMoreThanMinPower() {
        return this._power >= 0;
    }

    updatePower() {

        if (Keyboard.isDown(inputConfig.increaseShotPowerKey) && this.isLessThanMaxPower()) {
            this.increasePower();
        }
        else if (Keyboard.isDown(inputConfig.decreaseShotPowerKey) && this.isMoreThanMinPower()) {
            this.decreasePower();
        }
    }

    updateRotation() {
        const opposite = Mouse.position.y - this._position.y;
        const adjacent = Mouse.position.x - this._position.x;
        this._rotation = Math.atan2(opposite, adjacent);
    }

    //------Methods------//

    hide() {
        this._power = 0;
        this._visible = false;
        this._movable = false;
    }

    show(position) {
        this._position = position;
        this._origin = Vector2.copy(stickConfig.origin);
        this._movable = true;
        this._visible = true;
    }

    shoot() {
        this._origin = Vector2.copy(stickConfig.shotOrigin);
        const volume = mapRange(this._power, 0, stickConfig.maxPower, 0, 1);
        Assets.playSound(sounds.paths.strike, volume);
    }

    update() {
        if(this._movable) {
            this.updateRotation();
            this.updatePower();
        }
    }

    draw() {
        if(this._visible) {
            Canvas2D.drawImage(this._sprite, this._position, this._rotation, this._origin);
        }
    }

}