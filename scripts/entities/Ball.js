import { GameConfig } from '../config/gameConfig.js';
import { Canvas2D } from '../canvas.js';
import { Color } from '../common/color.js';
import { Vector2 } from '../geom/vector2.js';
import { Assets } from '../assets.js';

const physicsConfig = GameConfig.physics;
const sprites = GameConfig.sprites;
const ballConfig = GameConfig.ball;

export class Ball {

    //------Members------//
    _sprite;
    _color;
    _velocity = Vector2.zero;
    _moving = false;
    _visible = true;
    _position;


    //------Properties------//

    get position() {
        return Vector2.copy(this._position);
    }

    set position(value) {
        this._position = value;
    }

    get nextPosition() {
        return this.position.add(this._velocity.mult(1 - physicsConfig.friction));
    }

    get velocity() {
        return Vector2.copy(this._velocity);
    }

    set velocity(value) {
        this._moving = value.length > 0 ? true : false;
        this._velocity = value;
    }

    get moving() {
        return this._moving;
    }

    get color() {
        return this._color;
    }

    get visible() {
        return this._visible;
    }

    //------Constructor------//

    constructor(_position, color) {
        this._position = _position
        this._color = color;
        this.resolveSprite(color);
    }

    //------Methods------//

    resolveSprite(color) {
        switch(color) {
            case Color.white:
                this._sprite = Assets.getSprite(sprites.paths.cueBall);
                break;

            case Color.black:
                this._sprite = Assets.getSprite(sprites.paths.blackBall);
                break;

            case Color.red:
                this._sprite = Assets.getSprite(sprites.paths.redBall);
                break;

            case Color.yellow:
                this._sprite = Assets.getSprite(sprites.paths.yellowBall);
                break;
        }
    }

    //------Methods------//

    shoot(power, angle) {
        this._velocity = new Vector2(power * Math.cos(angle), power * Math.sin(angle));
        this._moving = true;
    }

    show(position) {
        this._position = position;
        this._velocity = Vector2.zero;
        this._visible = true;
    }

    hide() {
        this._velocity = Vector2.zero;
        this._moving = false;
        this._visible = false;
    }

    update() {
        if(this._moving) {
            this._velocity.multBy(1 - physicsConfig.friction);
            this._position.addTo(this._velocity);

            if(this._velocity.length < ballConfig.minVelocityLength) {
                this.velocity = Vector2.zero;
                this._moving = false;
            }
        }
    }

    draw() {
        if(this._visible){
            Canvas2D.drawImage(this._sprite, this._position, 0, ballConfig.origin);
        }
    }
}