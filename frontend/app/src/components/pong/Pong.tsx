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
import { AnyAction } from "@reduxjs/toolkit";

interface PongProps {
	winner: PlayerPosition | null,
	players: { left: PaddleProps, right: PaddleProps },
	status: GameStatus,
	config: { boardColor: number, width: number, height: number },
	// buttons: { restart: ButtonProps, ready: ButtonProps, resume: ButtonProps },
	ball: BallProps,
	dispatch: Dispatch<AnyAction>
	socket: Socket | undefined
	playerPosition: PlayerPosition
	roomId: String
}

const DEFAULTBUTTON = (config: ConfigProps) => {
	return {
		x: config.width / 2,
		y: config.height / 2 - 50,
		top_x: config.width / 2 - 120, // x - 120
		top_y: config.height / 2 - 100, // y - 50
	}
};

const DEFAULT_TEXT_PROPS = (text: string, config: ConfigProps, pos: 'left' | 'right' | 'middle') => {
	let x: number;
	if (pos === 'left') x = config.width / 4;
	else if (pos === 'right') x = (config.width / 4) * 3;
	else x = config.width / 2;
	
	return {
		text: text,
		anchor: 0.5,
		x: x,
		y: pos === 'middle' ? 50 : 150,
		style: new PIXI.TextStyle({
						fontSize: 60,
						fill: "#ffffff",
						letterSpacing: 10,
					})
	}
}

export default function Pong(props: PongProps) {
  const { winner, players, status, config, ball, dispatch } = props;

  const onKeyDown = (event: KeyboardEvent) => {
		console.log(event);
    switch (event.code) {
      case "KeyA": // A
        // Move the left paddle up
        // dispatch(movePaddleUp(playerPosition));
				props.socket!.emit("keyPress", { playerPosition: props.playerPosition, direction: 'up', roomId: props.roomId })
        break;
      case "KeyZ": // Z
        // Move the left paddle down
        // dispatch(movePaddleDown(playerPosition));
				props.socket!.emit("keyPress", { playerPosition: props.playerPosition, direction: 'down', roomId: props.roomId })
        break;
      default:
        return; // Do nothing
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  });
	
	const handleReadyButtonPressed = () => {
		props.socket!.emit('readyButtonPressed', { playerPosition: props.playerPosition, roomId: props.roomId });
	}
	
	const handleNewGame = () => {
		props.socket!.emit('newGamePressed');
	}

  return (
    <Container>
			<Text {...DEFAULT_TEXT_PROPS(players.left.score.toString(), config, 'left')} />
			<Text {...DEFAULT_TEXT_PROPS(players.right.score.toString(), config, 'right')} />
      <Paddle player={players.left} position="left" />
      <Paddle player={players.right} position="right" />
			{
				status === 'newGamePage' && <Button data={{...DEFAULTBUTTON(config), text: 'New Game'}} action={handleNewGame} />
			}
			{
				status === 'matchMakingPage' && <Text {...DEFAULT_TEXT_PROPS("Finding player...", config, 'middle')} />
			}
			{
				status === 'readyPage' && <Button data={{...DEFAULTBUTTON(config), text: 'Ready'}} action={handleReadyButtonPressed} />
			}
			{
				status === 'waitingPage' && <Text {...DEFAULT_TEXT_PROPS("Ready 1/2", config, 'middle')} />
			}
      {
				status === "playing" && <Ball data={ball} />
			}
      {
				status === "game-over" && (
					<>
						<Text {...DEFAULT_TEXT_PROPS(winner === 'left' ? 'Left won' : 'Right won', config, 'middle')} />
						<Button data={{...DEFAULTBUTTON(config), text: 'New Game'}} action={handleNewGame} />
					</>
				)
      }
			{
				status === 'paused' && <Text {...DEFAULT_TEXT_PROPS('Paused', config, 'middle')} />
			}
    </Container>
  );
}
