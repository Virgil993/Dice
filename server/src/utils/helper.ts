import { User } from "@/db/models/user";
import { UserDTO } from "@/dtos/user";

export function toUTCDate(dateString: string): Date {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date string");
  }
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    )
  );
}

export function userToDTO(user: User): UserDTO {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    birthday: user.birthday,
    description: user.description,
    gender: user.gender,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    verified: user.verified,
    totpEnabled: user.totpEnabled,
    deletedAt: user.deletedAt,
  };
}
