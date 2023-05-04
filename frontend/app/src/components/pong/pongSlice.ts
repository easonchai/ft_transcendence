import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { AppState } from "../../store/store";

export type ButtonProps = {
  x: number;
  y: number;
  top_x: number;
  top_y: number;
  text: string;
};

export type PaddleProps = {
  position: PlayerPosition;
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
};

export type PlayerPosition = "left" | "right";

export type GameStatus =
  | "game-over"
  | "paused"
  | "playing"
  | "matchMakingPage"
  | "newGamePage"
  | "readyPage"
  | "waitingPage";

export type BallProps = {
  x: number;
  y: number;
  radius: number;
  x_speed: number;
  y_speed: number;
  scale?: number;
};

export interface ConfigProps {
  boardColor: number;
  width: number;
  height: number;
}

export interface PongState {
  config: ConfigProps;
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

export interface GameState {
  state: PongState;
  roomId: string;
  playerPosition: PlayerPosition;
	keydown: "KeyA" | "KeyZ" | ""
}

const initialPongState: PongState = {
  config: {
    boardColor: 0x0d0c22,
    width: 800,
    height: 500,
  },
  velocity: 20,
  players: {
    left: { score: 0 } as PaddleProps,
    right: { score: 0 } as PaddleProps,
  },
  ball: {} as BallProps,
  winner: null,
  status: "newGamePage",
  winningScore: 1,
};

const initialState: GameState = {
  state: initialPongState,
  roomId: "",
  playerPosition: "left",
	keydown: ""
};

export const pongSlice = createSlice({
  name: "pong",
  initialState,
  reducers: {
    syncState: (state, action: { payload: PongState; type: string }) => {
      state.state = action.payload;
    },
    setRoomId: (state, action: { payload: string; type: string }) => {
      state.roomId = action.payload;
    },
    setPlayerPosition: (
      state,
      action: { payload: PlayerPosition; type: string }
    ) => {
      state.playerPosition = action.payload;
    },
		setKeyDown: (state, action: { payload: "KeyA" | "KeyZ" | ""; type: string }) => {
			state.keydown = action.payload;
		}
  },
});

// Action creators are generated for each case reducer function
export const {
  syncState,
  setRoomId,
  setPlayerPosition,
	setKeyDown
} = pongSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectWinner = (state: AppState) => state.pong.state.winner;

export const selectStatus = (state: AppState) => state.pong.state.status;

export const selectPlayers = (state: AppState) => state.pong.state.players;

export const selectConfig = (state: AppState) => state.pong.state.config;

export const selectRoomId = (state: AppState) => state.pong.roomId;

export const selectPlayerPosition = (state: AppState) =>
  state.pong.playerPosition;
	
export const selectKeyDown = (state: AppState) => state.pong.keydown;

export const selectBall = (state: AppState) => state.pong.state.ball;

export default pongSlice.reducer;
