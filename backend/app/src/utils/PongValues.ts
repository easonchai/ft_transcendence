export type PlayerPosition = 'left' | 'right'
export type PlayerConnection = 'connected' | 'disconnected'
export type Direction = 'up' | 'down'
export type GameStatus = "game-over" | "paused" | "playing" | "matchMakingPage" | 'newGamePage' | 'readyPage' | 'waitingPage';

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 500;

export const PADDLE_WIDTH = 20;
export const PADDLE_HEIGHT = 100;
export const PADDLE_OFFSET_X = 20;
export const PADDLE_OFFSET_Y = 50;
export const PADDLE_SPEED = 20;

type PaddleProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
};

type BallProps = {
  x: number;
  y: number;
  radius: number;
  x_speed: number;
  y_speed: number;
};

export interface ConfigProps {
	boardColor: number;
	width: number;
	height: number;
}

export interface PongState {
  config: ConfigProps
  velocity: number;
  players: {
    left: PaddleProps;
    right: PaddleProps;
  };
  ball: BallProps;
  winner: PlayerPosition | null;
	status: GameStatus;
  winningScore: number;
}

const Player1Paddle: PaddleProps = {
  x: PADDLE_OFFSET_X,
  y: PADDLE_OFFSET_Y,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  score: 0,
};

const Player2Paddle: PaddleProps = {
  x: GAME_WIDTH - PADDLE_OFFSET_X - PADDLE_WIDTH,
  y: PADDLE_OFFSET_Y,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  score: 0,
};

export const BALL_DEFAULTS = {
  x: GAME_WIDTH / 2,
  y: GAME_HEIGHT / 2,
  radius: 10,
  x_speed: 5,
  y_speed: 5,
};

export const initialState: PongState = {
  config: {
    boardColor: 0x0d0c22,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  velocity: PADDLE_SPEED,
  players: {
    left: Player1Paddle,
    right: Player2Paddle,
  },
  ball: BALL_DEFAULTS,
	winner: null,
	status: 'newGamePage',
	winningScore: 5
};