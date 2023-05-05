import {
  ChannelBannedResponse,
  ChannelMessagesResponse,
  channelsService,
  ChannelUsersResponse,
  EditChannelUsersRequest,
} from "@/apis/channelsService";
import ChatWindow from "@/components/ChatWindow";
import { PageContainer, ProCard } from "@ant-design/pro-components";
import {
  Avatar,
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  List,
  Modal,
  Row,
  Select,
  Space,
  Tag,
  message,
} from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { SetStateAction, useCallback, useEffect, useState } from "react";
import { useMutation, UseMutationResult, useQuery } from "react-query";
import { io, Socket } from "socket.io-client";
import dayjs from "dayjs";
import moment from "moment";
import { User } from "@prisma/client";
import { usersService } from "@/apis/usersService";
import UserStatus from "@/components/UserStatus";
import ProfilePicAvatar from "@/components/ProfilePicAvatar";

const ChannelsChat = () => {
  const router = useRouter();
  const { id } = router.query;
  const [messageApi, contextHolder] = message.useMessage();
  const [modelIsOpen, setModalIsopen] = useState<boolean>(false);
  const [modalInput, setModalInput] = useState<
    EditChannelUsersRequest & { user_id?: string }
  >({
    mute_time: new Date(),
  });
  const [channelName, setChannelName] = useState<string>("");
  const [channelUsers, setChannelUsers] = useState<ChannelUsersResponse[]>([]);
  const [bannedUsers, setBannedUsers] = useState<ChannelBannedResponse[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [me, setMe] = useState<ChannelUsersResponse>();
  const [channelMessages, setChannelMessages] = useState<
    ChannelMessagesResponse[]
  >([]);
  const [msg, setMsg] = useState<string>("");
  const [socket, setSocket] = useState<Socket>();
  const { data: session } = useSession();

  useEffect(() => {
    if (router.query.join === "1")
      messageApi.success("Successfully joined channel!");
    if (router.query.create === "1")
      messageApi.success("Successfully created channel");
  }, [router.isReady]);

  const { isLoading: getChannelByIdIsLoading } = useQuery({
    queryKey: "getChannelById",
    queryFn: () => channelsService.getChannelById(id as string | number),
    onSuccess: (res) => setChannelName(res.name),
    enabled: !!id,
  });

  const { isLoading: getChannelUsersIsLoading } = useQuery({
    queryKey: "getChannelUsers",
    queryFn: () => channelsService.getChannelUsers(id as string | number),
    onSuccess: (res) => {
      setChannelUsers(res);
      const me = res.find((obj) => obj.user.name === session?.user?.name);
      setMe(me);
    },
    enabled: !!id,
  });

  const { isLoading: getChannelMessagesIsLoading } = useQuery({
    queryKey: "getChannelMessages",
    queryFn: () => channelsService.getChannelMessages(id as string | number),
    onSuccess: (res) => setChannelMessages(res),
    enabled: !!id,
  });

  const { isLoading: getChannelBannedIsLoading } = useQuery({
    queryKey: "getChannelBanned",
    queryFn: useCallback(() => {
      return channelsService.getChannelBanned(id as string);
    }, [id]),
    onSuccess: (res) => {
      setBannedUsers(res);
    },
    enabled: !!id && me && me.type !== "MEMBER",
  });

  const { isLoading: getUsersIsLoading } = useQuery({
    queryKey: "getUsers",
    queryFn: () => usersService.getAllUsers(),
    onSuccess: (res) => {
      const r = res.filter((obj) => {
        for (const u of channelUsers) {
          if (u.user_id === obj.id) return false;
        }
        return true;
      });
      setAllUsers(r);
    },
    enabled: !!id && me && me.type !== "MEMBER" && channelUsers.length !== 0,
  });

  const editChannelUserMutation = useMutation({
    mutationFn: ({
      body,
      user_id,
    }: {
      body: EditChannelUsersRequest;
      user_id: string;
    }) => channelsService.editChannelUser(id as string, user_id, body),
    onSuccess: (res) => {
      setChannelUsers((prev) =>
        prev.map((obj) => {
          if (obj.user_id === res.user_id)
            return { ...obj, mute_time: res.mute_time, type: res.type };
          else return obj;
        })
      );
      setModalIsopen(false);
      messageApi.success("Successfully updated channel user");
    },
    onError: () => {
      setModalIsopen(false);
      messageApi.error("Failed to update channel user");
    },
  });

  const kickChannelUserMutation = useMutation({
    mutationFn: (user_id: string) =>
      channelsService.kickChannelUser(id as string, user_id),
    onSuccess: (res) => {
      setChannelUsers((prev) =>
        prev.filter((obj) => obj.user_id !== res.user_id)
      );
      setAllUsers((prev) => [...prev, res.user]);
      messageApi.success("Successfully kicked channel user");
    },
    onError: (e: any) => {
      messageApi.error("Failed to kick channel user");
    },
  });

  const unbanChannelUserMutation = useMutation({
    mutationFn: (user_id: string) =>
      channelsService.unbanChannelUser(id as string, user_id),
    onSuccess: (res) => {
      setBannedUsers((prev) =>
        prev.filter((obj) => obj.user_id !== res.user_id)
      );
      setAllUsers((prev) => [...prev, res.user]);
      messageApi.success("Successfully unban channel user");
    },
    onError: (e: any) => {
      messageApi.error("Failed to unban channel user");
    },
  });

  const banChannelUserMutation = useMutation({
    mutationFn: (user_id: string) =>
      channelsService.banChannelUser(id as string, user_id),
    onSuccess: (res) => {
      setAllUsers((prev) => prev.filter((obj) => obj.id !== res.user_id));
      setBannedUsers((prev) => [...prev, res]);
      messageApi.success("Successfully ban user");
    },
  });

  const inviteChannelUserMutation = useMutation({
    mutationFn: (user_id: string) =>
      channelsService.inviteChannelUser(id as string, user_id),
    onSuccess: (res) => {
      setChannelUsers((prev) => [...prev, res]);
      setAllUsers((prev) => prev.filter((obj) => obj.id !== res.user_id));
      messageApi.success("Successfully invited user");
    },
  });

  const leaveChannelMutation = useMutation({
    mutationFn: () => channelsService.leaveChannels(id as string),
    onSuccess: (res) => {
      router.push({ pathname: "/channels", query: { leave: 1 } });
    },
  });

  useEffect(() => {
    if (id) {
      const s = io(`${process.env.NEXT_PUBLIC_NESTJS_WS}/channels?id=${id}`, {
        reconnection: false,
        withCredentials: true,
      });
      s.on("connect", () => {
        messageApi.success("Message gateway connected!");
      });

      s.on("connect_error", (e) => {
        console.log(e);
        messageApi.error("Message gateway connect error.");
      });
      s.on("exception", (error) => {
        messageApi.error(error.message);
      });
      s.on("channelMessages", (body) => {
        setChannelMessages((prev) => [...prev, body]);
      });
      const cleanWs = () => {
        s.disconnect();
      };
      setSocket(s);
      return cleanWs;
    }
  }, [id]);

  const emitChannelMessages = () => {
    socket?.emit("channelMessages", { message: msg });
    setMsg("");
  };

  return (
    <>
      {contextHolder}
      <PageContainer title={`Channel chat`}>
        <ProCard
          title={channelName}
          headerBordered
          bordered
          loading={getChannelByIdIsLoading || leaveChannelMutation.isLoading}
          extra={[
            <Button
              key={1}
              onClick={() => leaveChannelMutation.mutate()}
              danger
            >
              Leave
            </Button>,
          ]}
        >
          <Row gutter={10}>
            <Col span={10}>
              <ProCard bordered className="h-full" tabs={{ type: "card" }}>
                <ProCard.TabPane key="1" tab="Members">
                  <List
                    dataSource={channelUsers}
                    loading={getChannelUsersIsLoading}
                    renderItem={(item, index) => (
                      <List.Item
                        key={index}
                        actions={
                          me?.type !== "MEMBER" &&
                          me !== item &&
                          item.type !== "OWNER"
                            ? [
                                <Button
                                  key={1}
                                  size="small"
                                  onClick={() => {
                                    setModalIsopen(true);
                                    setModalInput({
                                      ...modalInput,
                                      user_id: item.user_id,
                                      type: item.type,
                                      mute_time: item.mute_time,
                                    });
                                  }}
                                >
                                  Edit
                                </Button>,
                                <Button
                                  key={2}
                                  danger
                                  size="small"
                                  loading={kickChannelUserMutation.isLoading}
                                  onClick={() =>
                                    kickChannelUserMutation.mutate(item.user_id)
                                  }
                                >
                                  Kick
                                </Button>,
                              ]
                            : undefined
                        }
                      >
                        <List.Item.Meta
                          style={{ alignItems: "center" }}
                          title={
                            <Space>
                              {item.user.name}
                              <UserStatus id={item.user_id} />{" "}
                            </Space>
                          }
                          avatar={<ProfilePicAvatar user={item.user!} />}
                        />
                        <Tag color={item.type === "OWNER" ? "gold" : "default"}>
                          {item.type}
                        </Tag>
                      </List.Item>
                    )}
                  />
                </ProCard.TabPane>
                {me?.type !== "MEMBER" ? (
                  <>
                    <ProCard.TabPane key="2" tab="Banned">
                      <List
                        dataSource={bannedUsers}
                        loading={getChannelBannedIsLoading}
                        renderItem={(item, index) => (
                          <List.Item
                            key={index}
                            actions={[
                              <Button
                                key="1"
                                onClick={() =>
                                  unbanChannelUserMutation.mutate(item.user_id)
                                }
                              >
                                Unban
                              </Button>,
                            ]}
                          >
                            <List.Item.Meta
                              style={{ alignItems: "center" }}
                              title={item.user.name}
                              avatar={<ProfilePicAvatar user={item.user!} />}
                            />
                          </List.Item>
                        )}
                      />
                    </ProCard.TabPane>
                    <ProCard.TabPane key="3" tab="Users">
                      <List
                        dataSource={allUsers}
                        loading={getUsersIsLoading}
                        renderItem={(item, index) => (
                          <List.Item
                            key={index}
                            actions={
                              me?.type !== "MEMBER"
                                ? [
                                    <Button
                                      key={1}
                                      onClick={() =>
                                        inviteChannelUserMutation.mutate(
                                          item.id
                                        )
                                      }
                                    >
                                      Invite
                                    </Button>,
                                    <Button
                                      key={2}
                                      danger
                                      onClick={() =>
                                        banChannelUserMutation.mutate(item.id)
                                      }
                                    >
                                      Ban
                                    </Button>,
                                  ]
                                : []
                            }
                          >
                            <List.Item.Meta
                              style={{ alignItems: "center" }}
                              title={item.name}
                              avatar={<ProfilePicAvatar user={item!} />}
                            />
                          </List.Item>
                        )}
                      />
                    </ProCard.TabPane>
                  </>
                ) : (
                  ""
                )}
              </ProCard>
            </Col>
            <Col span={14}>
              <ChatWindow
                chats={channelMessages ?? []}
                isLoading={getChannelMessagesIsLoading}
                users={channelUsers}
                isDM={false}
              />
              <Row className="pt-3">
                <Space.Compact className="w-full">
                  <Input
                    placeholder="Type messages here..."
                    onChange={(e) => setMsg(e.target.value)}
                    onPressEnter={() => emitChannelMessages()}
                    value={msg}
                    disabled={
                      me ? (me.mute_time > new Date() ? true : false) : false
                    }
                  />
                  <Button onClick={() => emitChannelMessages()}>Send</Button>
                </Space.Compact>
              </Row>
            </Col>
          </Row>
        </ProCard>
      </PageContainer>
      <MuteChannelUserModal
        {...{
          modalIsOpen: modelIsOpen,
          setModalIsOpen: setModalIsopen,
          modalInput: modalInput,
          setModalInput: setModalInput,
          editChannelUserMutation: editChannelUserMutation,
        }}
      />
    </>
  );
};

interface MuteChannelUserModalProps {
  modalIsOpen: boolean;
  setModalIsOpen: React.Dispatch<SetStateAction<boolean>>;
  modalInput: EditChannelUsersRequest & { user_id?: string };
  setModalInput: React.Dispatch<
    SetStateAction<EditChannelUsersRequest & { user_id?: string }>
  >;
  editChannelUserMutation: UseMutationResult<any, any, any>;
}

const MuteChannelUserModal = (props: MuteChannelUserModalProps) => {
  const handleEditChannelUser = () => {
    props.editChannelUserMutation.mutate({
      user_id: props.modalInput.user_id!,
      body: {
        mute_time: props.modalInput.mute_time,
        type: props.modalInput.type,
      },
    });
  };

  return (
    <Modal
      title="Mute user"
      open={props.modalIsOpen}
      onCancel={() => props.setModalIsOpen(false)}
      onOk={() => handleEditChannelUser()}
      confirmLoading={props.editChannelUserMutation.isLoading}
      okButtonProps={{ type: "default" }}
      cancelButtonProps={{ danger: true }}
      okText={"Submit"}
      cancelText={"Cancel"}
    >
      <Form autoComplete="off" layout="vertical">
        <Form.Item
          name="mute_time"
          label="End time"
          initialValue={dayjs(moment().toISOString())}
          required={true}
        >
          <DatePicker
            className="w-full"
            showTime
            onChange={(date) => {
              props.setModalInput({
                ...props.modalInput,
                mute_time: new Date(date ? date.toISOString() : ""),
              });
            }}
            disabledDate={(current) => moment() > current}
          />
        </Form.Item>
        <Form.Item
          name="type"
          label="Type"
          initialValue={props.modalInput.type}
          required={true}
        >
          <Select
            options={[
              { value: "MEMBER", label: "MEMBER" },
              { value: "ADMIN", label: "ADMIN" },
            ]}
            onChange={(value) =>
              props.setModalInput({ ...props.modalInput, type: value })
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChannelsChat;
