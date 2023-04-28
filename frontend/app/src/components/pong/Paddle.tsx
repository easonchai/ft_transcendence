import React from 'react';
import { Graphics } from '@pixi/react';
import { PlayerPosition } from './pongSlice';

type Props = {
  player: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
	position: PlayerPosition
};

function Paddle(props: Props) {
  const {
    player: { x, y, width, height },
		position
  } = props;

  return (
    <Graphics
      draw={(g) => {
        // clear the graphics
        g.clear();
        // start drawing
        if (position === 'left') g.beginFill(0xf977a3);
        if (position === 'right') g.beginFill(0x66ddd4);
        g.drawRect(x, y, width, height);
      }}
    />
  );
}

export default Paddle;
