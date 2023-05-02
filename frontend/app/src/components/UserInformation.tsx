import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { ProCard } from "@ant-design/pro-components";
import {
  Badge,
  Button,
  Form,
  Input,
  Modal,
  QRCode,
  Space,
  Statistic,
  Switch,
} from "antd";
import Link from "next/link";
import { User } from "@prisma/client";
import { UseMutationResult, useMutation } from "react-query";
import { usersService } from "@/apis/usersService";
import { MessageInstance } from "antd/es/message/interface";
import { AppContext } from "./Layout";
import UserStatus from "./UserStatus";
import { useSession } from "next-auth/react";
import apiClient from "@/apis/ApiClient";

interface UserInformationProps {
  user: User;
  isLoading: boolean;
  isMe: boolean;
  messageApi: MessageInstance;
  setUser: Dispatch<SetStateAction<User | undefined>>;
}

const UserInformation = (props: UserInformationProps) => {
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const [modalInput, setModalInput] = useState<{
    name: string;
    two_factor: boolean;
    code: string;
  }>({ name: props.user.name, two_factor: props.user.two_factor, code: "" });
  const context = useContext(AppContext);
  const { update: updateSession, data: session } = useSession();

  const updateUserMutation = useMutation({
    mutationKey: "updateUser",
    mutationFn: async () => {
      if (modalInput.code && !props.user.two_factor) {
        // If first time setting up 2FA, we should ensure that the 2FA setup succeeds
        await usersService.completeSetup2fa(modalInput.code);
      }
      return usersService.updateUser({
        name: modalInput.name,
      });
    },
    onSuccess: (res) => {
      props.messageApi.success("Successfully update user");

      props.setUser({
        ...props.user,
        name: res.name,
        two_factor: res.two_factor,
      });
      setModalIsOpen(false);
      updateSession({ ...session, user: res });
    },
    onError: (e: any) => {
      props.messageApi.error(e.response?.data?.message || e.message);
    },
  });

  const disableTwoFactorMutation = useMutation({
    mutationKey: "disable2fa",
    mutationFn: async () => {
      if (modalInput.code && props.user.two_factor) {
        return await usersService.disable2fa(modalInput.code);
      }
      throw new Error("No 2FA code supplied");
    },
    onSuccess: (res) => {
      props.messageApi.success("Successfully disabled 2FA");

      props.setUser({
        ...props.user,
        name: res.name,
        two_factor: false,
      });
      setModalInput({
        ...modalInput,
        two_factor: false,
        code: "",
      });
      setModalIsOpen(false);
      updateSession({ ...session, user: res, two_fa: null });
    },
    onError: (e: any) => {
      props.messageApi.error(e.response?.data?.message || e.message);
    },
  });

  return (
    <ProCard.Group
      title="Information"
      direction="row"
      headerBordered
      bordered
      extra={
        props.isMe
          ? [
              <Button key="1" onClick={() => setModalIsOpen(true)}>
                Edit
              </Button>,
            ]
          : []
      }
    >
      <ProCard>
        <Statistic
          title="Name"
          value={props.user ? props.user.name : ""}
          loading={props.isLoading}
          formatter={(value) => (
            <Space>
              {value}
              <UserStatus id={props.user.id} />
            </Space>
          )}
        />
      </ProCard>
      <ProCard.Divider />
      <ProCard>
        <Statistic
          title="Email"
          value={props.user ? props.user.email! : ""}
          loading={props.isLoading}
        />
      </ProCard>
      <EditModal
        {...{
          setModalInput,
          modalInput,
          modalIsOpen,
          setModalIsOpen,
          updateUserMutation,
          disableTwoFactorMutation,
          hasActivatedTwoFactor: props.user.two_factor,
        }}
      />
    </ProCard.Group>
  );
};

interface EditModalProps {
  setModalInput: Dispatch<
    SetStateAction<{ name: string; two_factor: boolean; code: string }>
  >;
  modalInput: { name: string; two_factor: boolean; code: string };
  modalIsOpen: boolean;
  hasActivatedTwoFactor: boolean;
  setModalIsOpen: Dispatch<SetStateAction<boolean>>;
  updateUserMutation: UseMutationResult<User, unknown, void, unknown>;
  disableTwoFactorMutation: UseMutationResult<User, unknown, void, unknown>;
}

const EditModal = (props: EditModalProps) => {
  const [form] = Form.useForm();
  const [secret, setSecret] = useState<string>();

  useEffect(() => {
    const setup2fa = async () => {
      if (props.modalInput.two_factor && !props.hasActivatedTwoFactor) {
        const res = await usersService.get2faCode();
        setSecret(res.otpauth_url);
      }
    };

    if (props.modalInput.two_factor && !props.hasActivatedTwoFactor) {
      setup2fa();
    } else {
      setSecret(undefined);
    }
  }, [props.hasActivatedTwoFactor, props.modalInput.two_factor]);

  return (
    <Modal
      title="Edit user"
      okButtonProps={{ type: "default" }}
      cancelButtonProps={{ type: "default", danger: true }}
      okText="Submit"
      cancelText="Cancel"
      onOk={() => form.submit()}
      onCancel={() => props.setModalIsOpen(false)}
      open={props.modalIsOpen}
    >
      <Form
        form={form}
        onFinish={() => {
          props.updateUserMutation.mutate();
          form.resetFields;
        }}
      >
        <Form.Item
          name="name"
          label="Name"
          initialValue={props.modalInput.name}
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input
            value={props.modalInput.name}
            onChange={(e) =>
              props.setModalInput({ ...props.modalInput, name: e.target.value })
            }
          />
        </Form.Item>
        <Form.Item
          name="two_factor"
          label="Two Factor Authorization"
          initialValue={props.modalInput.two_factor}
        >
          <Switch
            defaultChecked={props.modalInput.two_factor}
            disabled={props.hasActivatedTwoFactor}
            onChange={(checked) => {
              props.setModalInput({
                ...props.modalInput,
                two_factor: checked,
              });
            }}
          />
        </Form.Item>
        {props.hasActivatedTwoFactor && (
          <div className="flex flex-row gap-4">
            <Form.Item name="code" label="2FA Code">
              <Input
                value={props.modalInput.code}
                onChange={(e) =>
                  props.setModalInput({
                    ...props.modalInput,
                    code: e.target.value,
                  })
                }
              />
            </Form.Item>
            <Button
              onClick={() => {
                props.disableTwoFactorMutation.mutate();
                form.resetFields;
              }}
            >
              Disable 2FA
            </Button>
          </div>
        )}
        {secret && (
          <>
            <QRCode value={secret} />
            <Form.Item name="code" label="2FA Code" className="mt-4">
              <Input
                value={props.modalInput.code}
                onChange={(e) =>
                  props.setModalInput({
                    ...props.modalInput,
                    code: e.target.value,
                  })
                }
              />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default UserInformation;
