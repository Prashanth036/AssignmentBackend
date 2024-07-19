import jwt from 'jsonwebtoken';

export const generateAccessToken = (username, secret, time, userId) => {
  return jwt.sign({
    username, userId
  },
  secret,
  {
    expiresIn: time
  });
}

export const tokenController = (req, res) => {
  const refreshToken = req.cookies?.jwt;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const accessToken = generateAccessToken(decoded.username, process.env.JWTSECRET, "10m", decoded.userId);
    return res.json({ accessToken });
  });
}

export const isAuthenticatedMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const refreshToken = req.cookies?.jwt;

  console.log(refreshToken)

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Invalid auth mechanism.' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWTSECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid access token.' });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decodedRefresh) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid refresh token.' });
      }
      console.log(decodedRefresh)
      req.user = decodedRefresh; // Attach user data to request object
      next();
    });
  });
}
