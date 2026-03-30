import { compare, hash } from 'bcrypt';
import https from 'https';
import { sign, verify } from 'jsonwebtoken';
import { Service } from 'typedi';
import { SECRET_KEY } from '@config';
import { DB } from '@database';
import { CreateUserDto, LoginDto } from '@dtos/users.dto';
import { HttpException } from '@/exceptions/HttpException';
import { DataStoredInToken, TokenData, LoginResponse } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';

const ACCESS_TOKEN_EXPIRY = 60 * 60; // 1 hour
const REFRESH_TOKEN_EXPIRY = 60 * 60 * 24 * 7; // 7 days

const createAccessToken = (user: User): TokenData => {
  const dataStoredInToken: DataStoredInToken = { id: user.id };
  return {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    token: sign(dataStoredInToken, SECRET_KEY, { expiresIn: ACCESS_TOKEN_EXPIRY }),
  };
};

const createRefreshToken = (user: User): TokenData => {
  const dataStoredInToken: DataStoredInToken = { id: user.id };
  return {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    token: sign(dataStoredInToken, SECRET_KEY + '_refresh', { expiresIn: REFRESH_TOKEN_EXPIRY }),
  };
};

const createCookie = (tokenData: TokenData): string => {
  return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}; Path=/; SameSite=Strict`;
};

@Service()
export class AuthService {
  public async signup(userData: CreateUserDto): Promise<User> {
    const findUser: User = await DB.Users.findOne({ where: { email: userData.email } });
    if (findUser) throw new HttpException(409, `Email ${userData.email} đã tồn tại trong hệ thống`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = await DB.Users.create({
      ...userData,
      password: hashedPassword,
      role: (userData.role as 'admin' | 'manager' | 'teacher' | 'technician') || 'teacher',
    });

    return createUserData;
  }

  public async login(loginData: LoginDto): Promise<{ cookie: string; loginResponse: LoginResponse }> {
    // Find user by email
    const findUser: User = await DB.Users.findOne({ where: { email: loginData.email } });
    if (!findUser) throw new HttpException(401, 'Email hoặc mật khẩu không chính xác');

    // Check account status
    if (findUser.status === 'locked') {
      throw new HttpException(403, 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên');
    }
    if (findUser.status === 'inactive') {
      throw new HttpException(403, 'Tài khoản chưa được kích hoạt');
    }

    // Verify password
    console.log('[DEBUG] loginData.password:', loginData.password, 'typeof:', typeof loginData.password);
    console.log('[DEBUG] findUser.password:', findUser.password, 'typeof:', typeof findUser.password);
    console.log('[DEBUG] findUser object keys:', Object.keys((findUser as any).dataValues || findUser));
    
    if (!loginData.password || !findUser.password) {
      console.error('[ERROR] BCRYPT VALIDATION WILL FAIL: Missing password payload or hash');
    }

    const isPasswordMatching: boolean = await compare(loginData.password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(401, 'Email hoặc mật khẩu không chính xác');

    // Update last login time
    await DB.Users.update({ lastLoginAt: new Date() }, { where: { id: findUser.id } });

    // Generate tokens
    const accessTokenData = createAccessToken(findUser);
    const refreshTokenData = createRefreshToken(findUser);
    const cookie = createCookie(accessTokenData);

    const loginResponse: LoginResponse = {
      accessToken: accessTokenData.token,
      refreshToken: refreshTokenData.token,
      user: {
        id: findUser.id,
        email: findUser.email,
        fullName: findUser.fullName,
        role: findUser.role,
        avatar: findUser.avatar,
      },
    };

    return { cookie, loginResponse };
  }

  public async refreshToken(refreshToken: string): Promise<{ cookie: string; accessToken: string }> {
    try {
      const decoded = verify(refreshToken, SECRET_KEY + '_refresh') as DataStoredInToken;
      const findUser: User = await DB.Users.findByPk(decoded.id);

      if (!findUser) throw new HttpException(401, 'Token không hợp lệ');
      if (findUser.status !== 'active') throw new HttpException(403, 'Tài khoản không hoạt động');

      const accessTokenData = createAccessToken(findUser);
      const cookie = createCookie(accessTokenData);

      return { cookie, accessToken: accessTokenData.token };
    } catch (error) {
      throw new HttpException(401, 'Refresh token không hợp lệ hoặc đã hết hạn');
    }
  }

  public async logout(userData: User): Promise<User> {
    const findUser: User = await DB.Users.findByPk(userData.id);
    if (!findUser) throw new HttpException(404, 'Không tìm thấy người dùng');

    return findUser;
  }

  public async loginWithGoogle(credential: string): Promise<{ cookie: string; loginResponse: LoginResponse }> {
    try {
      // Verify Google access token by calling userinfo endpoint
      const payload = await this.verifyGoogleToken(credential);

      if (!payload || !payload.email) {
        throw new HttpException(401, 'Token Google không hợp lệ');
      }

      const email = payload.email;

      // Find user by email in database (NOT auto-create)
      const findUser: User = await DB.Users.findOne({ where: { email } });
      if (!findUser) {
        throw new HttpException(404, 'Tài khoản không tồn tại trong hệ thống. Vui lòng liên hệ quản trị viên để được cấp tài khoản.');
      }

      // Check account status
      if (findUser.status === 'locked') {
        throw new HttpException(403, 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên');
      }
      if (findUser.status === 'inactive') {
        throw new HttpException(403, 'Tài khoản chưa được kích hoạt');
      }

      // Update last login time
      await DB.Users.update({ lastLoginAt: new Date() }, { where: { id: findUser.id } });

      // Generate tokens
      const accessTokenData = createAccessToken(findUser);
      const refreshTokenData = createRefreshToken(findUser);
      const cookie = createCookie(accessTokenData);

      const loginResponse: LoginResponse = {
        accessToken: accessTokenData.token,
        refreshToken: refreshTokenData.token,
        user: {
          id: findUser.id,
          email: findUser.email,
          fullName: findUser.fullName,
          role: findUser.role,
          avatar: findUser.avatar,
        },
      };

      return { cookie, loginResponse };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(401, 'Xác thực Google thất bại');
    }
  }

  private verifyGoogleToken(accessToken: string): Promise<{ email: string; name?: string }> {
    return new Promise((resolve, reject) => {
      const url = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`;

      https
        .get(url, res => {
          let data = '';

          res.on('data', chunk => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const payload = JSON.parse(data);
              if (payload.error) {
                reject(new Error(payload.error_description || 'Invalid token'));
              } else {
                resolve(payload);
              }
            } catch {
              reject(new Error('Failed to parse Google response'));
            }
          });
        })
        .on('error', err => {
          reject(err);
        });
    });
  }
}
