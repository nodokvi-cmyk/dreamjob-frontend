import {
  boolean,
  booleanOr,
  number,
  object,
  oneOf,
  optionalNumber,
  optionalString,
  string,
  stringArray,
  stringOr,
} from "@/lib/decode";
import { api } from "@/services/api";
import { parseMessage } from "@/services/auth.service";
import type {
  ChangePasswordInput,
  CvLink,
  MessageResponse,
  User,
  UserRole,
  UserUpdateInput,
} from "@/types";

function userPath(id: string, action?: string): string {
  const base = `/users/${encodeURIComponent(id)}`;
  return action ? `${base}/${action}` : base;
}

function fileBody(field: string, file: File): FormData {
  const body = new FormData();
  body.append(field, file);
  return body;
}

export function setUserPassword(id: string, input: ChangePasswordInput): Promise<MessageResponse> {
  return api(userPath(id, "password"), parseMessage, { method: "PATCH", body: input });
}

export function updateUser(id: string, input: UserUpdateInput): Promise<User> {
  return api(userPath(id), parseUser, { method: "PATCH", body: input });
}

export function uploadAvatar(id: string, file: File): Promise<User> {
  return api(userPath(id, "avatar"), parseUser, {
    method: "PATCH",
    body: fileBody("avatar", file),
  });
}

export function removeAvatar(id: string): Promise<User> {
  return api(userPath(id, "avatar"), parseUser, { method: "DELETE" });
}

export function uploadCv(id: string, file: File): Promise<User> {
  return api(userPath(id, "cv"), parseUser, { method: "PATCH", body: fileBody("cv", file) });
}

export function removeCv(id: string): Promise<User> {
  return api(userPath(id, "cv"), parseUser, { method: "DELETE" });
}

export function setCvVisibility(id: string, isCvPublic: boolean): Promise<User> {
  return api(userPath(id, "cv-visibility"), parseUser, {
    method: "PATCH",
    body: { isCvPublic },
  });
}

export function getCvLink(id: string): Promise<CvLink> {
  return api(userPath(id, "cv"), parseCvLink, { cache: "no-store" });
}

export function deleteUser(id: string): Promise<User> {
  return api(userPath(id), parseUser, { method: "DELETE" });
}

function parseCvLink(data: unknown): CvLink {
  const source = object(data, "cv");
  return { url: string(source, "url"), expiresIn: number(source, "expiresIn") };
}

const USER_ROLES: readonly UserRole[] = ["user", "admin"];

export function parseUser(data: unknown): User {
  const source = object(data, "user");
  return {
    _id: string(source, "_id"),
    role: oneOf(source, "role", USER_ROLES),
    firstName: string(source, "firstName"),
    lastName: stringOr(source, "lastName", ""),
    birthDate: optionalString(source, "birthDate"),
    age: optionalNumber(source, "age"),
    googleId: optionalString(source, "googleId"),
    email: string(source, "email"),
    phone: stringOr(source, "phone", ""),
    isVerified: boolean(source, "isVerified"),
    isCvPublic: booleanOr(source, "isCvPublic", false),
    appliedVacancies: stringArray(source, "appliedVacancies"),
    avatarUrl: stringOr(source, "avatarUrl", ""),
    hasCv: booleanOr(source, "hasCv", false),
    createdAt: string(source, "createdAt"),
    updatedAt: string(source, "updatedAt"),
  };
}
