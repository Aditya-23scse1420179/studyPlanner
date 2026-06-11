const sendToken = (user, statusCode, message, res) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  };

  res
    .status(statusCode)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + 20 * 60 * 1000), // 20 mins
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    })
    .json({
      success: true,
      message,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
      },
      accessToken,
      refreshToken,
    });
};

module.exports = sendToken;