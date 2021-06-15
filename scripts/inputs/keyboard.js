import { ButtonState } from './buttonState.js';

class Keyboard_Singleton {
    //------Members------//
    _keyStates = [];
    //------Constructor------//
    constructor() {
        for(let i = 0 ; i < 256 ; i++ ) {
            this._keyStates[i] =  new ButtonState();
        }
        
        document.addEventListener('keyup', (event) => this.handleKeyUp(event));
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
    }

    //------Methods------//

    handleKeyUp(event) {
        this._keyStates[event.keyCode].down = false;
    }

    handleKeyDown(event) {
        this._keyStates[event.keyCode].pressed = true;
        this._keyStates[event.keyCode].down = true;
    }

    //------Public Methods------//

    reset() {
        for(let i = 0 ; i < 256 ; i++ ) {
            this._keyStates[i].pressed = false;
        }
    }

    isDown(keyCode) {
        return this._keyStates[keyCode].down;
    }
    
    isPressed(keyCode) {
        return this._keyStates[keyCode].pressed;
    }
}

export const Keyboard = new Keyboard_Singleton();