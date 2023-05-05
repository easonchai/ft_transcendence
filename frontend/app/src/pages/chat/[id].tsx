import { usersService } from "@/apis/usersService";
import ChatWindow from "@/components/ChatWindow";
import { PageContainer, ProCard } from "@ant-design/pro-components";
import { User, UserMessages } from "@prisma/client";
import { Avatar, Button, Col, Divider, Input, Row, Space, message } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { io, Socket } from "socket.io-client";

const chat = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { id } = router.query;
  const [messages, setMessages] = useState<UserMessages[]>([]);
  const [msg, setMsg] = useState<string>();
  const [user, setUser] = useState<User>();
  const [messageApi, contextHolder] = message.useMessage();
  const [socket, setSocket] = useState<Socket>();
  const [roomId, setRommId] = useState<string>("");

  const { isLoading: getUserMessagesIsLoading } = useQuery({
    queryKey: "getUserMessagesIsLoading",
    queryFn: () => usersService.getUserMessages(id as string),
    onSuccess: (res) => setMessages(res),
    enabled: !!id,
  });

  const { isLoading: getUserIsLoading } = useQuery({
    queryKey: "getUserInDM",
    queryFn: () => usersService.getUserById(id as string),
    onSuccess: (res) => {
      console.log(res);
      setUser(res);
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (id) {
      const s = io(
        `${process.env.NEXT_PUBLIC_NESTJS_WS}/chats?receiver_id=${id}`,
        {
          reconnection: false,
          withCredentials: true,
          forceNew: true,
        }
      );
      s.on("connect", () => {
        messageApi.success("Message gateway connected!");
      });
      s.on("connect_error", () => {
        messageApi.error("Message gateway connect error.");
      });
      s.on("joinedRoom", (body: { roomId: string }) => {
        setRommId(body.roomId);
      });
      s.on("exception", (error) => {
        messageApi.error(error.message);
      });
      s.on("chatMessages", (body) => {
        setMessages((prev) => [...prev, body]);
      });
      const cleanWs = () => {
        s.disconnect();
      };
      setSocket(s);
      return cleanWs;
    }
  }, [id]);

  const emitChatMessages = () => {
    socket?.emit("chatMessages", { message: msg, roomId: roomId });
    setMsg("");
  };

  return (
    <PageContainer title="Chat">
      {contextHolder}
      <ProCard>
        <ProCard
          title={user?.name}
          headerBordered
          bordered
          bodyStyle={{ display: "block" }}
        >
          {user ? (
            <ChatWindow
              chats={messages}
              isLoading={getUserMessagesIsLoading}
              isDM={true}
              blockedUsers={[]}
              users={[user as User, session?.user as User]}
            />
          ) : (
            ""
          )}
          <Row className="pt-3">
            <Space.Compact className="w-full">
              <Input
                placeholder="Type messages here..."
                onChange={(e) => setMsg(e.target.value)}
                onPressEnter={() => emitChatMessages()}
                value={msg}
              />
              <Button onClick={() => emitChatMessages()}>Send</Button>
            </Space.Compact>
          </Row>
        </ProCard>
      </ProCard>
    </PageContainer>
  );
};

export default chat;
