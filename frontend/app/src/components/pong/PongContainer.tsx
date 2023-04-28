import React, { useEffect, useState } from "react";
import { Stage } from "@pixi/react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectWinner,
  selectStatus,
	selectPlayers,
  selectConfig,
	selectRoomId,
	selectPlayerPosition,
  selectBall,
	PlayerPosition,
	syncState,
	setRoomId,
	setPlayerPosition,
} from "./pongSlice";
import Pong from "./Pong";
import { io, Socket } from "socket.io-client";

export const PongApp = () => {
  const dispatch = useDispatch();
	const players = useSelector(selectPlayers);
  const winner = useSelector(selectWinner);
  const status = useSelector(selectStatus);
  const config = useSelector(selectConfig);
  const ball = useSelector(selectBall);
	const roomId = useSelector(selectRoomId);
	const playerPosition = useSelector(selectPlayerPosition);

	// const [roomId, setRoomId] = useState<String>('');
	// const [playerPosition, setPlayerPosition] = useState<PlayerPosition>('left');
	const [socket, setSocket] = useState<Socket>();
	
  const pongContainerProps = {
    ball,
    config,
    players,
    status,
    winner,
    dispatch,
		socket,
		playerPosition,
		roomId
  };
	
	useEffect(() => {
		const s = io(`${process.env.NESTJS_WS}/match`, {
			withCredentials: true,
			reconnection: true,
			autoConnect: false
		})
		s.connect();
		s.on('connect', () => { console.log('CONNECTED'); })
		s.on('disconnect', () => {})		
		s.on('joinedRoom', (body) => {
			dispatch(setRoomId(body.roomId));
			dispatch(setPlayerPosition(body.playerPosition));
		})
		s.on('sync', (body: any) => {
			dispatch(syncState(body));
		})
		setSocket(s);
		const disconnectClient = () => {
			if (s.connected) s.disconnect();
		}
		return disconnectClient;
	}, [])
	
	useEffect(() => {
		if (winner === playerPosition) {
			socket!.emit('game-over', { roomId, playerPosition });
		}
	}, [winner])

  return (
    <div className="appContainer">
      <Stage
        width={config.width}
        height={config.height}
        options={{ autoDensity: true, backgroundColor: config.boardColor }}
      >
        <Pong {...pongContainerProps} />
      </Stage>
    </div>
  );
};

export default PongApp;
