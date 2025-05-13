import { Gender, User } from "@/db/models/user";
import { UserDTO } from "@/dtos/user";
import { UserRepository } from "@/repositories/userRepository";
import { hashPassword } from "@/utils/auth";
import { toUTCDate } from "@/utils/helper";

export class UserService {
  public async createUser(
    name: string,
    email: string,
    password: string,
    birthday: string,
    gender: Gender,
    description: string
  ): Promise<UserDTO> {
    const utcTime = toUTCDate(birthday);
    const hashedPassword = await hashPassword(password);
    const newUser = User.build({
      name: name,
      email: email,
      password: hashedPassword,
      birthday: utcTime,
      description: description,
      gender: gender,
    });
    const result = await UserRepository.createUser(newUser);

    const userDto: UserDTO = {
      id: result.id,
      email: result.email,
      name: result.name,
      birthday: result.birthday,
      description: result.description,
      gender: result.gender,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      verified: result.verified,
      deletedAt: result.deletedAt,
    };

    return userDto;
  }
}
