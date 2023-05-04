import React, { Dispatch, useEffect, useState } from "react";
import * as PIXI from "pixi.js";
import { Container, Text, useApp, useTick } from "@pixi/react";
import Ball from "./Ball";
import Button from "./Button";
import Paddle from "./Paddle";
import {
  syncState,
  PaddleProps,
  GameStatus,
  BallProps,
  PlayerPosition,
  ConfigProps,
} from "./pongSlice";
import { io, Socket } from "socket.io-client";
import { ActionCreatorWithPayload, AnyAction } from "@reduxjs/toolkit";
import { MessageInstance } from "antd/es/message/interface";

interface PongProps {
  winner: PlayerPosition | null;
  players: { left: PaddleProps; right: PaddleProps };
  status: GameStatus;
  config: { boardColor: number; width: number; height: number };
  ball: BallProps;
  socket: Socket | undefined;
	dispatch: Dispatch<AnyAction>;
  playerPosition: PlayerPosition;
  roomId: String;
  scale?: number;
  containerWidth?: number;
  containerHeight?: number;
  messageApi: MessageInstance;
	keydown: "KeyA" | "KeyZ" | ""
	setKeyDown: ActionCreatorWithPayload<"" | "KeyA" | "KeyZ", "pong/setKeyDown">
}

const DEFAULTBUTTON = (config: ConfigProps, scale = 1) => {
  return {
    x: config.width / 2,
    y: config.height / 2 - 50 * scale,
    top_x: config.width / 2 - 120 * scale, // x - 120
    top_y: config.height / 2 - 100 * scale, // y - 50
  };
};

const DEFAULT_TEXT_PROPS = (
  text: string,
  config: ConfigProps,
  pos: "left" | "right" | "middle"
) => {
  let x: number;
  if (pos === "left") x = config.width / 4;
  else if (pos === "right") x = (config.width / 4) * 3;
  else x = config.width / 2;

  return {
    text: text,
    anchor: 0.5,
    x: x,
    y: pos === "middle" ? 50 : 150,
    style: new PIXI.TextStyle({
      fontSize: 60,
      fill: "#ffffff",
      letterSpacing: 10,
    }),
  };
};

let tmp: number = 0;

export default function Pong(props: PongProps) {
  const { winner, players, status, config, ball, dispatch, scale = 1, keydown, setKeyDown } = props;
	
	useTick((delta, ticker) => {
		if (tmp++ % 2 === 0) return;
		if (keydown === '') return ;
		props.socket!.emit("keyPress", {
			playerPosition: props.playerPosition,
			direction: keydown === "KeyA" ? "up" : "down",
			roomId: props.roomId,
		})
	})

	const onKeyUp = (event: KeyboardEvent) => {
		dispatch(setKeyDown(''));
	}

  const onKeyDown = (event: KeyboardEvent) => {
		if (event.code === "KeyA" || event.code === "KeyZ") {
			dispatch(setKeyDown(event.code));
		}
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("keyup", onKeyUp);
    };
  });

  const handleReadyButtonPressed = () => {
    props.messageApi.success("Ready");
    props.socket!.emit("readyButtonPressed", {
      playerPosition: props.playerPosition,
      roomId: props.roomId,
    });
  };

  const handleNewGame = () => {
    props.socket!.emit("newGamePressed");
  };

  return (
    <Container>
      <Text
        scale={scale}
        {...DEFAULT_TEXT_PROPS(players.left.score.toString(), config, "left")}
      />
      <Text
        scale={scale}
        {...DEFAULT_TEXT_PROPS(players.right.score.toString(), config, "right")}
      />
      <Paddle player={players.left} position="left" scale={scale} />
      <Paddle player={players.right} position="right" scale={scale} />
      {status === "newGamePage" && (
        <Button
          scale={scale}
          data={{ ...DEFAULTBUTTON(config, scale), text: "New Game" }}
          action={handleNewGame}
        />
      )}
      {status === "matchMakingPage" && (
        <Text
          scale={scale}
          {...DEFAULT_TEXT_PROPS("Finding player...", config, "middle")}
        />
      )}
      {status === "readyPage" && (
        <Button
          scale={scale}
          data={{ ...DEFAULTBUTTON(config, scale), text: "Ready" }}
          action={handleReadyButtonPressed}
        />
      )}
      {status === "waitingPage" && (
        <Text
          scale={scale}
          {...DEFAULT_TEXT_PROPS("Ready 1/2", config, "middle")}
        />
      )}
      {status === "playing" && <Ball data={ball} />}
      {status === "game-over" && (
        <>
          <Text
            scale={scale}
            {...DEFAULT_TEXT_PROPS(
              winner === "left" ? "Left won" : "Right won",
              config,
              "middle"
            )}
          />
          <Button
            scale={scale}
            data={{ ...DEFAULTBUTTON(config, scale), text: "New Game" }}
            action={handleNewGame}
          />
        </>
      )}
      {status === "paused" && (
        <Text
          scale={scale}
          {...DEFAULT_TEXT_PROPS("Paused", config, "middle")}
        />
      )}
    </Container>
  );
}
