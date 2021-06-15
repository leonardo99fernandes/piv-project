import { GameConfig } from './config/gameConfig.js';
import { Vector2 } from './geom/vector2.js';

class Canvas2D_Singleton {
    /* ATRIBUTOS DA CLASS */
    _canvasContaine;
    _canvas;
    _context;
    _scale;
    _offset;

    //------Properties------//
    
    get scaleX() {
        return this._scale.x;
    }

    get scaleY() {
        return this._scale.y;
    }

    get offsetX() {
        return this._offset.x;
    }

    get offsetY() {
        return this._offset.y;
    }

    //------Constructor------//

    constructor(canvas, canvasContainer) {
        this._canvasContainer = canvasContainer;
        this._canvas = canvas;
        this._context = this._canvas.getContext('2d');
        this.resizeCanvas();
    }

    //------Public Methods------//

    resizeCanvas = () => {
        
        const originalCanvasWidth = GameConfig.gameSize.x;
        const originalCanvasHeight = GameConfig.gameSize.y;
        const widthToHeight = originalCanvasWidth / originalCanvasHeight;

        let newHeight = window.innerHeight;
        let newWidth = window.innerWidth;
       
        const newWidthToHeight = newWidth / newHeight;

        if (newWidthToHeight > widthToHeight) {
            newWidth = newHeight * widthToHeight;
        } else {
            newHeight = newWidth / widthToHeight;
        }
        
        this._canvasContainer.style.width = newWidth + 'px';
        this._canvasContainer.style.height = newHeight + 'px';
        this._canvasContainer.style.marginTop = (window.innerHeight - newHeight) / 2 + 'px';
        this._canvasContainer.style.marginLeft = (window.innerWidth - newWidth) / 2 + 'px';
        this._canvasContainer.style.marginBottom = (window.innerHeight - newHeight) / 2 + 'px';
        this._canvasContainer.style.marginRight = (window.innerWidth - newWidth) / 2 + 'px';
        this._scale = new Vector2(newWidth / originalCanvasWidth, newHeight / originalCanvasHeight);

        this._canvas.width = newWidth;
        this._canvas.height = newHeight;
        
        if (this._canvas.offsetParent) {
            this._offset = new Vector2(this._canvas.offsetLeft, this._canvas.offsetTop);
        }
    }


    clear = () => {
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }

    drawImage(
            sprite,
            position = { x: 0, y: 0 }, 
            rotation = 0, 
            origin = { x: 0, y: 0 }
        ) {    
        this._context.save();
        this._context.scale(this._scale.x, this._scale.y);
        this._context.translate(position.x, position.y);
        this._context.rotate(rotation);
        this._context.drawImage(sprite, 0, 0, sprite.width, sprite.height, -origin.x, -origin.y, sprite.width, sprite.height);
        this._context.restore();
    }


    drawText(text, font, color, position, textAlign = 'left') {
        this._context.save();
        this._context.scale(this._scale.x, this._scale.y);
        this._context.fillStyle = color;
        this._context.font = font;
        this._context.textAlign = textAlign;
        this._context.fillText(text, position.x, position.y);
        this._context.restore();
    }

    changeCursor(cursor) {
        this._canvas.style.cursor = cursor;
    }
}

const canvas  = document.getElementById('screen');
const container = document.getElementById('gameArea');
export const Canvas2D = new Canvas2D_Singleton(canvas, container);
window.addEventListener('resize', Canvas2D.resizeCanvas.bind(Canvas2D));