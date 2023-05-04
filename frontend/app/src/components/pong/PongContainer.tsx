import React, { useEffect, useRef, useState } from "react";
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
import { Button, Form, Select, message } from "antd";

export const PongApp = () => {
  const dispatch = useDispatch();
  const players = useSelector(selectPlayers);
  const winner = useSelector(selectWinner);
  const status = useSelector(selectStatus);
  const config = useSelector(selectConfig);
  const ball = useSelector(selectBall);
  const roomId = useSelector(selectRoomId);
  const playerPosition = useSelector(selectPlayerPosition);
  const [socket, setSocket] = useState<Socket>();
  const [messageApi, contextHolder] = message.useMessage();
  const [color, setColor] = useState<string>("#0d0c22");
  const [speed, setSpeed] = useState<number>(5);

  const pongContainerProps = {
    ball,
    config,
    players,
    status,
    winner,
    dispatch,
    socket,
    playerPosition,
    roomId,
    messageApi,
  };

  useEffect(() => {
    const s = io(`${process.env.NEXT_PUBLIC_NESTJS_WS}/match`, {
      withCredentials: true,
      reconnection: true,
      autoConnect: false,
    });
    s.connect();
    s.on("connect", () => {
      console.log("CONNECTED");
    });
    s.on("disconnect", () => {});
    s.on("joinedRoom", (body) => {
      dispatch(setRoomId(body.roomId));
      dispatch(setPlayerPosition(body.playerPosition));
    });
    s.on("sync", (body: any) => {
      dispatch(syncState(body));
    });
    s.on("customizationDone", () => {
      messageApi.success("Customized");
    });
    setSocket(s);
    const disconnectClient = () => {
      if (s.connected) s.disconnect();
    };
    return disconnectClient;
  }, []);

  useEffect(() => {
    if (winner === playerPosition) {
      socket!.emit("game-over", { roomId, playerPosition });
    }
  }, [winner]);

  const handleColorChange = (new_color: string) => {
    setColor(new_color);
  };

  const handleSpeedChange = (value: number) => {
    setSpeed(value);
  };

  const handleCustomization = () => {
    let c = color.substring(1);
    c = `0x${c}`;
    console.log(c);
    socket?.emit("customization", {
      color: Number(c),
      speed: speed,
      roomId: roomId,
    });
  };

  const stageRef = useRef(null);
  console.log(stageRef);

  return (
    <div className="appContainer" ref={stageRef}>
      {contextHolder}
      {playerPosition === "left" &&
        status !== "newGamePage" &&
        status !== "matchMakingPage" && (
          <Form layout="inline" className="pb-5">
            <Form.Item label="Speed" name="speed" initialValue={speed}>
              <Select
                options={[
                  { value: 1, label: "slow" },
                  { value: 5, label: "medium" },
                  { value: 10, label: "fast" },
                  { value: 20, label: "God-like" },
                ]}
                onChange={handleSpeedChange}
              />
            </Form.Item>
            <Button
              onClick={handleCustomization}
              type="primary"
              disabled={
                status === "playing" || status === "game-over" ? true : false
              }
            >
              Submit
            </Button>
          </Form>
        )}
      {stageRef && stageRef.current && (
        <Stage
          width={(stageRef.current as any).offsetWidth || config.width}
          height={(stageRef.current as any).offsetHeight || config.height}
          options={{
            autoDensity: true,
            backgroundColor: config.boardColor,
          }}
        >
          <Pong
            {...pongContainerProps}
            config={{
              ...pongContainerProps.config,
              width:
                (stageRef.current as any).offsetWidth ||
                pongContainerProps.config.width,
              height:
                (stageRef.current as any).offsetHeight ||
                pongContainerProps.config.height,
            }}
            scale={(stageRef.current as any).offsetWidth / 800}
            containerHeight={(stageRef.current as any).offsetHeight}
            containerWidth={(stageRef.current as any).offsetWidth}
          />
        </Stage>
      )}
    </div>
  );
};

export default PongApp;
