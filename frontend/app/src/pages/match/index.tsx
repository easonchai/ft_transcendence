import { PageContainer, ProCard } from "@ant-design/pro-components";
import { Button, List } from "antd";
import {
  KeyboardEvent,
  RefObject,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import PIXI, { Graphics, Stage, useTick, Container, useApp } from "@pixi/react";
import { ProCardType } from "@ant-design/pro-card/es/ProCard";
import useResizeObserver from "@react-hook/resize-observer";
import { Provider } from "react-redux";
import store from "@/store/store";
import PongApp from "@/components/pong/PongContainer";
import { AppContext } from "@/components/Layout";

interface StageSize {
  height: number;
  width: number;
}

const useSize = (target: RefObject<HTMLDivElement>) => {
  const [size, setSize] = useState<StageSize>({ height: 800, width: 600 });
  useLayoutEffect(() => {
    setSize({
      height: target.current!.getBoundingClientRect()!.width * 0.5256,
      width: target.current!.getBoundingClientRect()!.width - 48,
    });
  }, [target]);
  useResizeObserver(target, (entry) =>
    setSize({
      height: entry.contentRect.width * 0.5256,
      width: entry.contentRect.width - 48,
    })
  );
  return size;
};

const index = () => {
  const cardRef = useRef<HTMLDivElement>(null);
	
	const context = useContext(AppContext);
	
	useEffect(() => {
		context.socket.emit('inGame');
		
		return () => {
			context.socket.emit('leaveGame');
		}
	}, [])

  return (
    <PageContainer title={false}>
      <ProCard>
        <ProCard title="Pong" headerBordered bordered ref={cardRef}>
          <Provider store={store}>
            <PongApp />
          </Provider>
        </ProCard>
      </ProCard>
    </PageContainer>
  );
};

export default index;
