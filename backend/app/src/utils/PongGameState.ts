import { BALL_DEFAULTS, GAME_HEIGHT, GameStatus, PADDLE_HEIGHT, PlayerPosition, PongState, initialState } from "./PongValues";

const randomDirection = () => {
  let direction = Math.random();
  if (direction > 0.5) {
    return -1 * direction;
  } else {
    return direction;
  }
};

export class PongGameState {
	private _state: PongState;
	
	constructor() {
		this._state = structuredClone(initialState);
	}
	
	get winner(): PlayerPosition { return this._state.winner; }
	get status(): GameStatus { return this._state.status; }
	get state(): PongState { return this._state; }
	
	setStatus(st: GameStatus) {
		this._state.status = st;
	}
	
	movePaddleUp(pos: PlayerPosition) {
		if (this._state.status !== "playing") return ;

		const player = this._state.players[pos];
		// Decrease the Y value
		player.y -= this._state.velocity;
		// Top of the board
		if (player.y < 0) {
			player.y = 0;
		}
	}
	
	movePaddleDown(pos: PlayerPosition) {
		if (this._state.status !== "playing") return ;

		const player = this._state.players[pos];

		player.y += this._state.velocity;
		// Bottom of the board
		if (player.y + PADDLE_HEIGHT > GAME_HEIGHT) {
			player.y = GAME_HEIGHT - PADDLE_HEIGHT;
		}
	}
	
	moveBall() {
		const top_y = this._state.ball.y - this._state.ball.radius;
		const right_x = this._state.ball.x + this._state.ball.radius;
		const bottom_y = this._state.ball.y + this._state.ball.radius;
		const left_x = this._state.ball.x - this._state.ball.radius;

		const paddle1 = this._state.players.left;
		const paddle2 = this._state.players.right;

		this._state.ball.x += this._state.ball.x_speed;
		this._state.ball.y += this._state.ball.y_speed;

		// Hitting the top boundary
		if (this._state.ball.y - this._state.ball.radius < 0) {
			this._state.ball.y = this._state.ball.radius; // Don't go beyond the boundary
			this._state.ball.y_speed = -this._state.ball.y_speed; // Reverse the direction
		} // Hitting the bottom boundary
		else if (this._state.ball.y + this._state.ball.radius > this._state.config.height) {
			this._state.ball.y = this._state.config.height - this._state.ball.radius; // Set the new position
			this._state.ball.y_speed = -this._state.ball.y_speed; // Reverse direction
		}

		// If the computer has scored
		if (this._state.ball.x < 0) {
			this._state.ball.x_speed = 5; // Serve the ball to the computer
			this._state.ball.y_speed = 3 * randomDirection();
			this._state.ball.x = BALL_DEFAULTS.x;
			this._state.ball.y = BALL_DEFAULTS.y;
			paddle2.score += 1;

			// Game over
			if (paddle2.score === this._state.winningScore) {
				this._state.winner = 'right';
				this.setStatus('game-over');
			}
		} // The player has scored
		else if (this._state.ball.x > this._state.config.width) {
			this._state.ball.x_speed = -5; // Serve the ball to the player
			this._state.ball.y_speed = 3 * randomDirection();
			this._state.ball.x = BALL_DEFAULTS.x;
			this._state.ball.y = BALL_DEFAULTS.y;
			paddle1.score += 1;

			// Game over
			if (paddle1.score === this._state.winningScore) {
				this._state.winner = 'left';
				this.setStatus('game-over');
			}
		}

		// If the ball is in the left half of the table
		if (right_x < this._state.config.width / 2) {
			// The ball has not yet passed the paddle
			// The ball has made contact with the paddle
			// The topmost side of the ball is in the range of the paddle
			// The bottom side of the ball is in the range of the paddle
			if (
				right_x > paddle1.x &&
				left_x < paddle1.x + paddle1.width &&
				top_y < paddle1.y + paddle1.height &&
				bottom_y > paddle1.y
			) {
				this._state.ball.x_speed = Math.abs(this._state.ball.x_speed) + Math.random();
				this._state.ball.y_speed += Math.random();
				this._state.ball.x += this._state.ball.x_speed;
			}
		} else {
			// The ball is in the right half of the table
			if (
				right_x > paddle2.x &&
				left_x < paddle2.x + paddle2.width &&
				top_y < paddle2.y + paddle2.height &&
				bottom_y > paddle2.y
			) {
				this._state.ball.x_speed = -Math.abs(this._state.ball.x_speed) - Math.random();
				this._state.ball.y_speed += Math.random();
				this._state.ball.x += this._state.ball.x_speed;
			}
		}
	}
}