import { ButtonState } from './buttonState.js';
import { Canvas2D } from '../canvas.js';
import { Vector2 } from '../geom/vector2.js';

class Mouse_Singleton {
    //------Members------//
    _buttonStates = [];
    _position;
    //------Properties------//
    get position() {
        return Vector2.copy(this._position);
    }
    //------Constructor------//
    constructor() {
        for(let i = 0 ; i < 3 ; i ++ ) {
            this._buttonStates[i] = new ButtonState();
        }
        this._position = Vector2.zero;
        console.log(this._position)
        document.addEventListener('mousemove', (event) => this.handleMouseMove(event));
        document.addEventListener('mousedown', (event) => this.handleMouseDown(event));
        document.addEventListener('mouseup', (event) => this.handleMouseUp(event));
    }

    //------Methods------//
    handleMouseMove(event) {
        const mouseX = (event.pageX - Canvas2D.offsetX) / Canvas2D.scaleX;
        const mouseY = (event.pageY - Canvas2D.offsetY) / Canvas2D.scaleY;
        this._position = new Vector2(mouseX, mouseY);
    }

    handleMouseDown(event) {
        this._buttonStates[event.button].down = true;
        this._buttonStates[event.button].pressed = true;
    }

    handleMouseUp(event) {
        this._buttonStates[event.button].down = false;
    }

    //------Methods------//
    reset()  {
        for(let i = 0 ; i < 3 ; i++ ) {
            this._buttonStates[i].pressed = false;
        }
    }

    isDown(button) {
        return this._buttonStates[button].down;
    }
    
    isPressed(button) {
        return this._buttonStates[button].pressed;
    }
}

export const Mouse = new Mouse_Singleton();