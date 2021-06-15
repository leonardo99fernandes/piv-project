import { Color } from '../common/color.js';

export class Referee {
    //------Methods------//
    isValidFirstTouch(player, collidedBallColor, somePocketed) {
        if(!collidedBallColor) {
            return false;
        }
        if(!player.color) {
            return collidedBallColor !== Color.black;
        }
        return player.color === collidedBallColor || 
               (player.matchScore === 1 && somePocketed && collidedBallColor !== Color.black) ||
               (player.matchScore === 7 && collidedBallColor === Color.black) ||
               (player.matchScore === 8 && collidedBallColor === Color.black); 
    }

    isValidPocketedBalls(player, pocketedBalls) {
        if(pocketedBalls.length === 0) {
            return true;
        }
        if(player.color) {
            if (player.matchScore === 8) {
                return pocketedBalls.length === 1 && pocketedBalls[0].color === Color.black;
            }
            else {
                return pocketedBalls.every((ball) => ball.color === player.color);
            }
        } else {
            const color = pocketedBalls[0].color;
            return color !== Color.white &&
                   color !== Color.black &&
                   pocketedBalls.every((ball) => ball.color === color);
        }
    }
    //------Methods------//
    isValidTurn(player, state) {
        return this.isValidFirstTouch(player, state.firstCollidedBallColor, state.pocketedBalls.length > 0) &&
               this.isValidPocketedBalls(player, state.pocketedBalls);
    }

    isGameOver(currentPlayer, cueBall, eightBall) {
        return !eightBall.visible || 
               (!cueBall.visible && currentPlayer.matchScore === 7) ||
               (!cueBall.visible && currentPlayer.matchScore === 8)
    }
}