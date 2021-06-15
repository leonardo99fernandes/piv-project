export class Vector2{

    //------Members------//

    _x;
    _y;

    //------Constructor------//

    constructor(x, y) {
        this._x = x;
        this._y = y;
    }

    //------Properties------//

    get x() {
        return this._x;
    }
    
    get y() {
        return this._y;
    }

    static get zero() {
        return new Vector2(0, 0);
    }

    get length() {
        return Math.sqrt(Math.pow(this._x, 2) + Math.pow(this._y, 2));
    }

    //------Public Methods------//

    static copy(vector) {
        return new Vector2(vector.x, vector.y);
    }

    addX(x) {
        return new Vector2(this._x, this._y).addToX(x);
    }

    addY(y) {
        return new Vector2(this._x, this._y).addToY(y);
    }

    addToX(x) {
        this._x += x;
        return this;
    }

    addToY(y) {
        this._y += y;
        return this;
    }

    addTo(vector) {
        return this.addToX(vector.x).addToY(vector.y);
    }

    add(vector) {
        return new Vector2(this._x, this._y).addTo(vector);
    }

    subtractTo(vector) {
        this._x -= vector.x;
        this._y -= vector.y;
        return this;
    }

    subtract(vector) {
        return new Vector2(this._x, this._y).subtractTo(vector);
    }

    mult(v) {
        return new Vector2(this._x, this._y).multBy(v);
    }

    multBy(v) {
        this._x *= v;
        this._y *= v;
        return this;
    }

    dot(vector) {
        return this._x * vector.x + this._y * vector.y;
    }

    distFrom(vector) {
        return this.subtract(vector).length;
    }
}