import { JwtAdapter, bcryptAdapter, envs } from "../../config";
import { UserModel } from "../../data";
import { CustomError, RegisterUserDto, UserEntity } from "../../domain";
import { LoginUserDto } from "../../domain/dtos/auth/login-user.dto";
import { EmailService } from "./email.service";

export class AuthService {
  // DI
  constructor(private readonly emailService: EmailService) {}

  public async registerUser(registerUserDto: RegisterUserDto) {
    const existeUser = await UserModel.findOne({
      email: registerUserDto.email,
    });

    if (existeUser) throw CustomError.badRequest("Email already exist");

    try {
      const user = new UserModel(registerUserDto);

      // Encriptar el password

      user.password = bcryptAdapter.hash(registerUserDto.password);

      await user.save();

      // JWT <------- para mantener la autenticacion del usuario

      // Email de confirmacion
      await this.sendEmailValidationLink(user.email);

      const { password, ...userEntity } = UserEntity.fromObject(user);

      const token = await JwtAdapter.generateToken({ id: user.id });
      if (!token) throw CustomError.internalServer("Error while creating JWT");

      return {
        user: userEntity,
        token: token,
      };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  public async loginUser(loginUserDto: LoginUserDto) {
    // Findone para verificar si existe

    const user = await UserModel.findOne({ email: loginUserDto.email });
    if (!user) throw CustomError.badRequest("Email not exist");

    // isMatching.... bcrypt....
    const isMatching = bcryptAdapter.compare(
      loginUserDto.password,
      user.password
    );
    if (!isMatching) throw CustomError.badRequest("Password is not valid");

    const { password, ...userEntity } = UserEntity.fromObject(user);

    const token = await JwtAdapter.generateToken({ id: user.id });
    if (!token) throw CustomError.internalServer("Error while creating JWT");

    return {
      user: userEntity,
      token: token,
    };
  }

  private sendEmailValidationLink = async (email: string) => {
    const token = await JwtAdapter.generateToken({ email });

    if (!token) throw CustomError.internalServer("Error  gettin token");

    const link = `${envs.WEBSERVICE_URL}/auth/validate-email/${token}`;

    const html = `
      <h1>Validate your email</h1>
      <p>Click on the following link to validate your email</p>
      <a href"${link}" Validate your email: ${email}
    `;

    const options = {
      to: email,
      subject: "Validate your email",
      htmlBody: html,
    };

    const isSet = await this.emailService.sendEmail(options);

    if (!isSet) throw CustomError.internalServer("Error sending email");
  };
}
