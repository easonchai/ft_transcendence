import { usersService } from "@/apis/usersService";
import { UploadOutlined } from "@ant-design/icons";
import { TwoFactorStatus } from "@prisma/client";
import {
  Button,
  Form,
  Input,
  QRCode,
  Switch,
  Typography,
  Upload,
  message,
} from "antd";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";

const Onboarding = () => {
  const [form] = Form.useForm();
  const [image, setImage] = useState<any>();
  const [name, setName] = useState<string>("");
  const [twofa, setTwofa] = useState<boolean>();
  const [code, setCode] = useState<string>();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const { data: session, update: updateSession } = useSession();

  const onboardingMutation = useMutation({
    mutationKey: "onboarding",
    mutationFn: async () => {
      if (image) {
        let formdata = new FormData();

        formdata.append(
          "file",
          image.file.originFileObj,
          image.file.originFileObj.name
        );
        await usersService.updateImage(formdata);
      }
      if (code) {
        // If first time setting up 2FA, we should ensure that the 2FA setup succeeds
        await usersService.completeSetup2fa(code);
      }

      return usersService.updateUser({
        name,
      });
    },
    onSuccess: async (res) => {
      messageApi.success("Successfully saved!");

      await updateSession({ ...session, user: res });
      router.push("/");
    },
    onError: async (e: any) => {
      messageApi.error(e.response?.data?.message || e.message);
    },
  });
  const [secret, setSecret] = useState<string>();

  useEffect(() => {
    const setup2fa = async () => {
      if (twofa) {
        const res = await usersService.get2faCode();
        setSecret(res.otpauth_url);
      }
    };

    if (twofa) {
      setup2fa();
    } else {
      setSecret(undefined);
    }
  }, [twofa]);

  useEffect(() => {
    if (session) {
      // We check if the user has already been onboarded by comparing the createdAt & updatedAt
      // If it matches, they can still use this page cuz nothing has changed yet. But if already onboarded, they cannot
      if (session.user.created_at !== session.user.updated_at) {
        router.push("/");
      }

      // Update name as default
      setName(session.user.name || "");
    }
  }, [session]);

  return (
    session && (
      <div className="flex flex-col gap-4 my-8 text-center">
        {contextHolder}
        <Typography.Text className="font-bold text-2xl">
          Ready Player One?
        </Typography.Text>
        <Typography.Text className="secondary">
          Hallo! 👋🏼 <br />
          Welcome to the world of P̴̗̘̥͙͉̈̿͑̄͆̊̆̀͂Ǫ̵̨̣̦̠͙̟͎̳̎̾̀̋Ņ̶̘̰͕̹̦̟̫̯͚̊̈̒͌͝G̶͎̻̗͍̹͂̓! Please setup your account for the first
          time to access the platform (o̶̼͓͎̥͛ṛ̶̢̖̗̩͈̗̀̒͐̏̅͊͜͠ ̸̢̢̧̭̥͖̫̀̈́̈̿̂́̈́̚͜b̵̧̥̳̪̺͕̩̋̍̃̍͂e̴̫̪̞͙̎́̉͛̀̄̾́ ̴̨̲̼̗̐̾̔ͅa̶̹̜͈͇͛́͊ ̵͙̦̠̓́͊b̸̮̥̠̟̒̔́̂͂̒̀̆͠ͅį̴̻͇̝̯̹͈̦̈́̓̓̕t̸̡̃͌̌̑̈́̏̂̅c̸̛̮̘̻͎̞̩̰̒̓̀̐̽͑̋̊͘h̵͇͊͐̓͆̿̑̃̆͝͝ ̴̱̮̝̪̳̣͕̏̏̂́͊̆̚̕͝ą̷̢̨͇̖̮̗̦̆̑̎̐͘̕n̸̡̼̱͖̫̒͜ḋ̵͖͈̲͓͌̈́̾̾̌͆̆̎͂ ̶̯̠͓̭̥̍̏̔̎̀͂̒̚̕ḏ̶̳͖͓̹̞̟͐̅̽̽͜o̵̲̰̍̉̈̊͝͠ń̸̝͍͋̎͊͆̏̇̔̓͘&apos;t̷̡̲͉̠̟͎̮͍͕̓̌͠)
        </Typography.Text>
        <Form
          form={form}
          onFinish={() => {
            onboardingMutation.mutate();
            form.resetFields;
          }}
          className="text-start"
        >
          <Form.Item
            name="image"
            label="Image"
            getValueFromEvent={(e) => {
              setImage(e);
            }}
            valuePropName="fileList"
          >
            <Upload
              multiple={false}
              maxCount={1}
              accept="image/png, image/jpg, image/jpeg"
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            name="name"
            label="Name"
            initialValue={session.user.name}
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input
              value={name || ""}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            name="two_factor"
            label="Two Factor Authorization"
            initialValue={false}
          >
            <Switch
              onChange={(checked) => {
                setTwofa(checked);
              }}
            />
          </Form.Item>
          {secret && (
            <>
              <QRCode value={secret} />
              <Form.Item name="code" label="2FA Code" className="mt-4">
                <Input value={code} onChange={(e) => setCode(e.target.value)} />
              </Form.Item>
            </>
          )}
        </Form>

        <Button onClick={form.submit}>Save</Button>

        <Typography.Text className="secondary">
          Forgotten your 2FA code? <br />
          <Link href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">
            Click here to reset your 2FA
          </Link>
        </Typography.Text>
      </div>
    )
  );
};

export default Onboarding;
