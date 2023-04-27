import { usersService } from "@/apis/usersService";
import { TwoFactorStatus } from "@prisma/client";
import { Button, Form, Input, Typography, message } from "antd";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useMutation } from "react-query";

const TwoFA = () => {
  const [form] = Form.useForm();
  const [code, setCode] = useState<string>();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const { data: session, update: updateSession } = useSession();

  const verify2faMutation = useMutation({
    mutationKey: "verify2fa",
    mutationFn: async () => {
      if (code) {
        return await usersService.verify2fa(code);
      }
      throw new Error("No 2FA code supplied");
    },
    onSuccess: async () => {
      messageApi.success("Successfully verified!");

      await updateSession({
        ...session,
        two_fa: TwoFactorStatus.PASSED,
      });
      router.push("/");
    },
    onError: async (e: any) => {
      messageApi.error(e.response?.data?.message || e.message);
    },
  });

  return (
    <div className="flex flex-col gap-4 my-8 text-center">
      {contextHolder}
      <Typography.Text className="font-bold text-2xl">
        Two Factor Authentication
      </Typography.Text>
      <Typography.Text className="secondary">
        You have enabled 2FA authentication on your account. You must pass this
        verification step before you can continue using this application
      </Typography.Text>
      <Form
        form={form}
        onFinish={() => {
          verify2faMutation.mutate();
          form.resetFields;
        }}
      >
        <Form.Item name="code" label="2FA Code" className="mt-4">
          <Input value={code} onChange={(e) => setCode(e.target.value)} />
        </Form.Item>
      </Form>
      <Button onClick={form.submit}>Submit</Button>

      <Typography.Text className="secondary">
        Forgotten your 2FA code? <br />
        <Link href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">
          Click here to reset your 2FA
        </Link>
      </Typography.Text>
    </div>
  );
};

export default TwoFA;
