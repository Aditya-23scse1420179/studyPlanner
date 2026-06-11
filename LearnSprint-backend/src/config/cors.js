const getCorsOptions = () => {
  if (process.env.NODE_ENV === "development") {
    return {
      origin: "*",
      credentials: false,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      optionsSuccessStatus: 200,
    };
  }

  const trustedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:5175",
  ].filter(Boolean);

  return {
    origin: (origin, callback) => {
      if (!origin || trustedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS rejected origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
    optionsSuccessStatus: 200,
  };
};

module.exports = { getCorsOptions };