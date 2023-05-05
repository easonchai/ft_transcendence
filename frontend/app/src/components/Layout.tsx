import React, {
  PropsWithChildren,
  createContext,
  useEffect,
  useState,
} from "react";
import { MenuDataItem, ProLayout } from "@ant-design/pro-components";
import {
  UserOutlined,
  RobotOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import { message } from "antd";
import { useRouter } from "next/router";
import { UserStatus } from "@prisma/client";

const layoutRoutes: MenuDataItem = {
  path: "/",
  children: [
    {
      key: "1",
      path: "users",
      name: "Users",
      icon: <UserOutlined />,
    },
    {
      key: "3",
      path: "channels",
      name: "Channels",
      icon: <CommentOutlined />,
    },
  ],
};

interface AppUserStatus {
  client_id: string;
  user_id: string;
  status: UserStatus;
}

export interface AppContextType {
  socket: Socket;
  onlineClients: AppUserStatus[];
}

export const AppContext = createContext<AppContextType>({} as AppContextType);

const Layout = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const [onlineClients, setOnlineClients] = useState<AppUserStatus[]>([]);
  const [s, setS] = useState<Socket>();

  useEffect(() => {
    const s = io(`${process.env.NEXT_PUBLIC_NESTJS_WS}/`, {
      reconnection: true,
      withCredentials: true,
    });

    s.on("connect", () => {
      console.log("Connected to root");
    });

    s.on("connect_error", (err) => {
      console.log(err);
      console.log("Error connecting to root");
    });

    s.on("connectedClients", (body) => {
      setOnlineClients(body);
    });

    s.on("exception", (error) => {
      console.log(error.message);
    });
    setS(s);
    const disconnect = () => {
      s.disconnect();
    };
    return disconnect;
  }, []);

  return (
    <AppContext.Provider value={{ socket: s!, onlineClients: onlineClients }}>
      <ProLayout
        route={layoutRoutes}
        menuItemRender={(item, dom) => <Link href={item.path!}>{dom}</Link>}
        title="Transcendence"
        token={{ sider: { colorMenuBackground: "white" } }}
        menuHeaderRender={(logo, title) => <Link href="/">{title}</Link>}
      >
        {children}
      </ProLayout>
    </AppContext.Provider>
  );
};

export default Layout;
