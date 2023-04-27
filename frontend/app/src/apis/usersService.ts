import {
  Channels,
  FriendStatus,
  User,
  UserBlocks,
  UserFriends,
  UserMessages,
} from "@prisma/client";
import apiClient from "./ApiClient";
import { TwoFactorSetup } from "../../types/next-auth";
import { AxiosResponse } from "axios";

const getAllUsers = async (): Promise<User[]> => {
  const res = await apiClient.get("/users");
  return res.data;
};

const getUserById = async (id: string): Promise<User> => {
  const res = await apiClient.get(`/users/user/${id}`);
  return res.data;
};

const getAcceptedFriends = async (id: string): Promise<User[]> => {
  const res = await apiClient.get(`/users/friends/${id}`);
  return res.data;
};

const getPendingFriends = async (): Promise<User[]> => {
  const res = await apiClient.get(`/users/pending`);
  return res.data;
};

const getRequestedFriends = async (): Promise<User[]> => {
  const res = await apiClient.get(`/users/requested`);
  return res.data;
};

const getBlocked = async (): Promise<User[]> => {
  const res = await apiClient.get(`/users/blocked`);
  return res.data;
};

const getBlockedBy = async (): Promise<User[]> => {
  const res = await apiClient.get(`/users/blockedby`);
  return res.data;
};

const getChats = async (): Promise<User[]> => {
  const res = await apiClient.get(`/users/chats`);
  return res.data;
};

const getMyChannels = async (): Promise<Channels[]> => {
  const res = await apiClient.get(`/users/channels`);
  return res.data;
};

const getUserMessages = async (id: string): Promise<UserMessages[]> => {
  const res = await apiClient.get(`/users/messages/${id}`);
  return res.data;
};

const get2faCode = async (): Promise<TwoFactorSetup> => {
  const res = await apiClient.get(`/users/2fa/setup`);
  return res.data;
};

// Post

const createUserFriends = async (id: string): Promise<UserFriends> => {
  const res = await apiClient.post(`/users/friends/${id}`);
  return res.data;
};

const createUserBlock = async (id: string): Promise<UserBlocks> => {
  const res = await apiClient.post(`/users/block/${id}`);
  return res.data;
};

const completeSetup2fa = async (
  code: string
): Promise<AxiosResponse<any, any>> => {
  return apiClient.post(`/users/2fa/complete`, {
    code,
  });
};

const verify2fa = async (code: string) => {
  const res = await apiClient.post(`/users/2fa`, {
    code,
  });
  return res.data;
};

const disable2fa = async (code: string) => {
  const res = await apiClient.post(`/users/2fa/disable`, {
    code,
  });
  return res.data;
};

// Update

const updateUser = async (body: { name: string }): Promise<User> => {
  const res = await apiClient.patch(`/users`, body);
  return res.data;
};

const updateUserFriends = async (
  id: string,
  body: { status: FriendStatus }
): Promise<UserFriends> => {
  const res = await apiClient.patch(`/users/friends/${id}`, body);
  return res.data;
};

const updateImage = async (data: FormData): Promise<User> => {
  const res = await apiClient.patch(`/users/image`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Delete

const deleteUserFriend = async (id: string): Promise<UserFriends> => {
  const res = await apiClient.delete(`/users/friends/${id}`);
  return res.data;
};

const deleteUserBlock = async (id: string): Promise<UserBlocks> => {
  const res = await apiClient.delete(`/users/block/${id}`);
  return res.data;
};

export const usersService = {
  getAllUsers,
  getUserById,
  getAcceptedFriends,
  getPendingFriends,
  getRequestedFriends,
  getBlocked,
  getBlockedBy,
  getChats,
  getMyChannels,
  getUserMessages,
  get2faCode,
  createUserFriends,
  createUserBlock,
  completeSetup2fa,
  verify2fa,
  disable2fa,
  updateUser,
  updateUserFriends,
  deleteUserFriend,
  deleteUserBlock,
  updateImage,
};
