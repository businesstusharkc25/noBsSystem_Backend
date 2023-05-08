import jwt from "jsonwebtoken";
import dotEnv from "dotenv";

dotEnv.config();

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    let decodedData;

    if (token) {
      decodedData = jwt.verify(token, process.env.JWT_SECRET);

      req.userId = decodedData.sub;
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({
      message: "user log in failed",
      isSuccess: false,
    });
  }
};

export default auth;
