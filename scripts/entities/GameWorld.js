import { mapRange } from '../common/mapRange.js';
import { Referee } from './Referee.js';
import { Player } from './Player.js';
import { Stick } from './Stick.js';
import { Color } from '../common/color.js';
import { Vector2 } from '../geom/vector2.js';
import { GameConfig } from '../config/gameConfig.js';
import { Assets } from '../assets.js';
import { Canvas2D } from '../canvas.js';
import { Ball } from './Ball.js';
import { Mouse } from '../inputs/mouse.js';
import { State } from './State.js';

//------Configurations------//

const physicsConfig = GameConfig.physics;
const inputConfig = GameConfig.input;
const ballConfig = GameConfig.ball;
const tableConfig = GameConfig.table;
const labelsConfig = GameConfig.labels;
const matchScoreConfig = GameConfig.matchScore;
const gameSize = GameConfig.gameSize;
const sprites = GameConfig.sprites;
const sounds = GameConfig.sounds;

export class GameWorld {
    //------Members------//
    _stick;
    _cueBall;
    _8Ball;
    _balls;
    _players = [new Player(), new Player()];
    _currentPlayerIndex = 0;
    _turnState;
    _referee;
    //------Properties------//
    get currentPlayer() {
        return this._players[this._currentPlayerIndex];
    }

    get nextPlayer() {
        return this._players[(this._currentPlayerIndex + 1) % this._players.length];
    }

    get balls() {
        return this._balls
    }

    get isBallInHand() {
        return this._turnState.ballInHand;
    }

    get isTurnValid() {
        return this._turnState.isValid;
    }

    get isGameOver() {
        return this._referee.isGameOver(this.currentPlayer, this._cueBall, this._8Ball);
    }

    get isBallsMoving() {
        return this._balls.some(ball => ball.moving);
    }

    get numOfPocketedBallsOnTurn() {
        return this._turnState.pocketedBalls.length;
    }
    //------Constructor------//
    constructor() {
        this.initMatch();
    }
    //------Methods------//
    getBallsByColor(color) {
        return this._balls.filter((ball) => ball.color === color);
    }

    handleInput() {
        if (Mouse.isPressed(inputConfig.mouseShootButton)) {
            this.shootCueBall(this._stick.power, this._stick.rotation);
        }
    }

    isBallPosOutsideTopBorder(position) {
        const topBallEdge = position.y - ballConfig.diameter / 2;
        return topBallEdge <= tableConfig.cushionWidth;
    }

    isBallPosOutsideLeftBorder(position) {
        const leftBallEdge = position.x - ballConfig.diameter / 2;
        return leftBallEdge <= tableConfig.cushionWidth;
    }

    isBallPosOutsideRightBorder(position) {
        const rightBallEdge = position.x + ballConfig.diameter / 2;
        return rightBallEdge >= gameSize.x - tableConfig.cushionWidth;
    }

    isBallPosOutsideBottomBorder(position) {
        const bottomBallEdge = position.y + ballConfig.diameter / 2;
        return bottomBallEdge >= gameSize.y - tableConfig.cushionWidth;
    }

    handleCollisionWithTopCushion(ball) {
        ball.position = ball.position.addY(tableConfig.cushionWidth - ball.position.y + ballConfig.diameter / 2);
        ball.velocity = new Vector2(ball.velocity.x, -ball.velocity.y);
    }

    handleCollisionWithLeftCushion(ball) {
        ball.position = ball.position.addX(tableConfig.cushionWidth - ball.position.x + ballConfig.diameter / 2);
        ball.velocity = new Vector2(-ball.velocity.x, ball.velocity.y);
    }

    handleCollisionWithRightCushion(ball) {
        ball.position = ball.position.addX(gameSize.x - tableConfig.cushionWidth - ball.position.x - ballConfig.diameter / 2);
        ball.velocity = new Vector2(-ball.velocity.x, ball.velocity.y);
    }

    handleCollisionWithBottomCushion(ball) {
        ball.position = ball.position.addY(gameSize.y - tableConfig.cushionWidth - ball.position.y - ballConfig.diameter / 2);
        ball.velocity = new Vector2(ball.velocity.x, -ball.velocity.y);
    }

    resolveBallCollisionWithCushion(ball) {

        let collided = false;

        if(this.isBallPosOutsideTopBorder(ball.nextPosition)) {
            this.handleCollisionWithTopCushion(ball);
            collided = true;
        }
        if(this.isBallPosOutsideLeftBorder(ball.nextPosition)) {
            this.handleCollisionWithLeftCushion(ball);
            collided = true;
        }
        if(this.isBallPosOutsideRightBorder(ball.nextPosition)) {
            this.handleCollisionWithRightCushion(ball);
            collided = true;
        }
        if(this.isBallPosOutsideBottomBorder(ball.nextPosition)) {
            this.handleCollisionWithBottomCushion(ball);
            collided = true;
        }

        if(collided) {
            ball.velocity = ball.velocity.mult(1 - physicsConfig.collisionLoss);
        }
    }

    resolveBallsCollision (first, second) {

        if(!first.visible || !second.visible){
            return false;
        }
    
        // Find a normal vector
        const n = first.position.subtract(second.position);
    
        // Find distance
        const dist = n.length;
    
        if(dist > ballConfig.diameter){
            return false;
        }
    
        // Find minimum translation distance
        const mtd = n.mult((ballConfig.diameter - dist) / dist);
    
        // Push-pull balls apart
        first.position = first.position.add(mtd.mult(0.5));
        second.position = second.position.subtract(mtd.mult(0.5));
    
        // Find unit normal vector
        const un = n.mult(1/n.length);
    
        // Find unit tangent vector
        const ut = new Vector2(-un.y, un.x);
    
        // Project velocities onto the unit normal and unit tangent vectors
        const v1n = un.dot(first.velocity);
        const v1t = ut.dot(first.velocity);
        const v2n = un.dot(second.velocity);
        const v2t = ut.dot(second.velocity);
    
        // Convert the scalar normal and tangential velocities into vectors
        const v1nTag = un.mult(v2n);
        const v1tTag = ut.mult(v1t);
        const v2nTag = un.mult(v1n);
        const v2tTag = ut.mult(v2t);
    
        // Update velocities
        first.velocity = v1nTag.add(v1tTag);
        second.velocity = v2nTag.add(v2tTag);
    
        first.velocity = first.velocity.mult(1 - physicsConfig.collisionLoss);
        second.velocity = second.velocity.mult(1 - physicsConfig.collisionLoss);
        
        return true;
    }

    handleCollisions() {
        for(let i = 0 ; i < this._balls.length ; i++ ){ 
            
            this.resolveBallCollisionWithCushion(this._balls[i]);

            for(let j = i + 1 ; j < this._balls.length ; j++ ){
                const firstBall = this._balls[i];
                const secondBall = this._balls[j];
                const collided = this.resolveBallsCollision(firstBall, secondBall);
                
                if(collided){
                    const force = firstBall.velocity.length + secondBall.velocity.length
                    const volume = mapRange(force, 0, ballConfig.maxExpectedCollisionForce, 0, 1);
                    Assets.playSound(sounds.paths.ballsCollide, volume);

                    if(!this._turnState.firstCollidedBallColor) {
                        const color = firstBall.color === Color.white ? secondBall.color : firstBall.color;
                        this._turnState.firstCollidedBallColor = color;
                    }
                }
            }
        }    
    }

    isInsidePocket(position) {
        return tableConfig.pocketsPositions
            .some((pocketPos) => position.distFrom(pocketPos) <= tableConfig.pocketRadius);

    }

    resolveBallInPocket(ball) {
        if (this.isInsidePocket(ball.position)) {
            ball.hide();
        }
    }

    isValidPlayerColor(color) {
        return color === Color.red || color === Color.yellow;
    }

    handleBallsInPockets() {
        this._balls.forEach((ball) => {
            this.resolveBallInPocket(ball);
            if (!ball.visible && !this._turnState.pocketedBalls.includes(ball)) {
                Assets.playSound(sounds.paths.rail, 1);
                if(!this.currentPlayer.color && this.isValidPlayerColor(ball.color)) {
                    this.currentPlayer.color = ball.color;
                    this.nextPlayer.color = ball.color === Color.yellow ? Color.red : Color.yellow;
                }
                this._turnState.pocketedBalls.push(ball);
            }
        });
    }

    handleBallInHand() {
        if(Mouse.isPressed(inputConfig.mousePlaceBallButton) && this.isValidPosToPlaceCueBall(Mouse.position)) {
            this.placeBallInHand(Mouse.position);
        }
        else {
            this._stick.movable = false;
            this._stick.visible = false;
            this._cueBall.position = Mouse.position;
        }
    }

    handleGameOver() {
        if (this._turnState.isValid) {
            this.currentPlayer.overallScore++;
        }
        else {
            this.nextPlayer.overallScore++;
        }
        this.initMatch();
    }

    nextTurn() {
        const foul = !this._turnState.isValid;
        if (this.isGameOver) {
            this.handleGameOver();
            return;
        }

        if(!this._cueBall.visible){
            this._cueBall.show(Vector2.copy(GameConfig.cueBallPosition));
        }

        if(foul || this._turnState.pocketedBalls.length === 0) {
            this._currentPlayerIndex++;
            this._currentPlayerIndex = this._currentPlayerIndex % this._players.length;
        }

        this._stick.show(this._cueBall.position);

        this._turnState = new State();
        this._turnState.ballInHand = foul;

        /* if (this.isAITurn()) {
            AI.startSession(this);
        } */
    }

    drawCurrentPlayerLabel() {
        Canvas2D.drawText(
            labelsConfig.currentPlayer.text + (this._currentPlayerIndex + 1), 
            labelsConfig.currentPlayer.font, 
            labelsConfig.currentPlayer.color, 
            labelsConfig.currentPlayer.position, 
            labelsConfig.currentPlayer.alignment
        );
    }

    drawMatchScores() {
        for(let i = 0 ; i < this._players.length ; i++){    
            for(let j = 0 ; j < this._players[i].matchScore ; j++){
                const scorePosition = Vector2.copy(matchScoreConfig.scoresPositions[i]).addToX(j * matchScoreConfig.unitMargin);
                const scoreSprite = this._players[i].color === Color.red ? Assets.getSprite(sprites.paths.redScore) : Assets.getSprite(sprites.paths.yellowScore);
                Canvas2D.drawImage(scoreSprite, scorePosition);
            }
        }    
    }

    drawOverallScores() {
        for(let i = 0 ; i < this._players.length ; i++){ 
            Canvas2D.drawText(
                this._players[i].overallScore.toString(), 
                labelsConfig.overalScores[i].font,
                labelsConfig.overalScores[i].color,
                labelsConfig.overalScores[i].position,
                labelsConfig.overalScores[i].alignment
                );   
        }
    }

    isInsideTableBoundaries(position) {
        let insideTable =  !this.isInsidePocket(position);
        insideTable = insideTable && !this.isBallPosOutsideTopBorder(position);
        insideTable = insideTable && !this.isBallPosOutsideLeftBorder(position);
        insideTable = insideTable && !this.isBallPosOutsideRightBorder(position);
        insideTable = insideTable && !this.isBallPosOutsideBottomBorder(position);

        return insideTable;
    }
    //------Methods------//

    initMatch() {
        const redBalls = GameConfig.redBallsPositions
            .map((position) => new Ball(Vector2.copy(position), Color.get_red));

        const yellowBalls = GameConfig.yellowBallsPositions
            .map((position) => new Ball(Vector2.copy(position), Color.get_yellow));
        
        this._8Ball = new Ball(Vector2.copy(GameConfig.eightBallPosition), Color.get_black);

        this._cueBall = new Ball(Vector2.copy(GameConfig.cueBallPosition), Color.get_white);

        this._stick = new Stick(Vector2.copy(GameConfig.cueBallPosition));

        this._balls = [
            ...redBalls, 
            ... yellowBalls, 
            this._8Ball,
            this._cueBall, 
        ];

        this._currentPlayerIndex = 0;

        this._players.forEach((player) => {
            player.matchScore = 0;
            player.color = null;
        });
        this._turnState = new State();
        this._referee = new Referee();

        /* if (this.isAITurn()) {
            AI.startSession(this);
        } */
    }

    isValidPosToPlaceCueBall(position) {
        let noOverlap =  this._balls.every((ball) => {
            return ball.color === Color.white || 
                   ball.position.distFrom(position) > ballConfig.diameter;
        })

        return noOverlap && this.isInsideTableBoundaries(position);
    }

    placeBallInHand(position) {
        this._cueBall.position = position;
        this._turnState.ballInHand = false;
        this._stick.show(this._cueBall.position);
    }

    concludeTurn() {
        this._turnState.pocketedBalls.forEach((ball) => {
            const ballIndex = this._balls.indexOf(ball);
            if(ball.color != Color.white) {
                this._balls.splice(ballIndex, 1);
            }
        });
        
        if(this.currentPlayer.color) {
            this.currentPlayer.matchScore = 8 - this.getBallsByColor(this.currentPlayer.color).length - this.getBallsByColor(Color.black).length;
        }

        if(this.nextPlayer.color) {
            this.nextPlayer.matchScore = 8 - this.getBallsByColor(this.nextPlayer.color).length - this.getBallsByColor(Color.black).length;
        }

        this._turnState.isValid = this._referee.isValidTurn(this.currentPlayer, this._turnState);
    }

    shootCueBall(power, rotation) {
        if(power > 0) {
            this._stick.rotation = rotation;
            this._stick.shoot();
            this._cueBall.shoot(power, rotation);
            this._stick.movable = false;
            setTimeout(() => this._stick.hide(), GameConfig.timeoutToHideStickAfterShot);
        }
    }

    update() {
        if(this.isBallInHand) {
            this.handleBallInHand();
            return;
        }
        this.handleBallsInPockets();
        this.handleCollisions();
        this.handleInput();
        this._stick.update();
        this._balls.forEach((ball) => ball.update());

        if(!this.isBallsMoving && !this._stick.visible) {
            this.concludeTurn();
            this.nextTurn();
        }
    }

    draw() {
        Canvas2D.drawImage(Assets.getSprite(sprites.paths.table));
        this.drawCurrentPlayerLabel();
        this.drawMatchScores();
        this.drawOverallScores();
        this._balls.forEach((ball) => ball.draw());
        this._stick.draw();
    }
}