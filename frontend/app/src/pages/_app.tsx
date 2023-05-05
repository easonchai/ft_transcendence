import "@/styles/globals.css";
import "antd/dist/reset.css";
import type { AppProps } from "next/app";
import { SessionProvider, useSession } from "next-auth/react";
import Layout from "@/components/Layout";
import dynamic from "next/dynamic";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/router";
import { QueryClient, QueryClientProvider } from "react-query";
import {
  Button,
  ConfigProvider,
  Form,
  Input,
  Modal,
  Space,
  message,
} from "antd";
import locale from "antd/locale/en_US";
import { ProCard } from "@ant-design/pro-components";
import { TwoFactorStatus } from "@prisma/client";
import apiClient from "@/apis/ApiClient";

const DynamicProLayout = dynamic(() => import("../components/Layout"), {
  ssr: false,
});

interface TwoFaModalProps {
  modalIsOpen: boolean;
  setModalIsOpen: Dispatch<SetStateAction<boolean>>;
}

const TwoFaModal = (props: TwoFaModalProps) => {
  return (
    <Modal
      open={props.modalIsOpen}
      onCancel={() => props.setModalIsOpen(false)}
    >
      Hello world
    </Modal>
  );
};

function MyComponent(props: AppProps) {
  const queryClient = new QueryClient();
  const router = useRouter();
  const [form] = Form.useForm();
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const {
    status,
    data: session,
    update: updateSession,
  } = useSession({
    required: true,
    onUnauthenticated: () => {
      router.push("/api/auth/signin");
    },
  });

  useEffect(() => {
    if (
      session &&
      session.user.two_factor &&
      session.two_fa !== TwoFactorStatus.PASSED
    ) {
      router.push("/2fa");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, router.asPath]);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={locale}>
        <DynamicProLayout>
          <props.Component {...props.pageProps} />
        </DynamicProLayout>
      </ConfigProvider>
      <TwoFaModal {...{ modalIsOpen, setModalIsOpen }} />
    </QueryClientProvider>
  );
}

export default function App(props: AppProps) {
  return (
    <SessionProvider session={props.pageProps.session}>
      <MyComponent {...props} />
    </SessionProvider>
  );
}
