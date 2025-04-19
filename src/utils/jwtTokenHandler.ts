import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: any;
  email: string;
}

async function jwtToken(data: JwtPayload): Promise<string> {
  try {
    const privateKey = process.env.PRIVATEKEY;
    if (!privateKey) {
      throw new Error('PRIVATEKEY environment variable is not set');
    }
    const accessToken = jwt.sign(data, privateKey, { expiresIn: '7d' }); 
    return accessToken;
  } catch (error) {
    throw new Error('Error signing token');
  }
}

export { jwtToken };
