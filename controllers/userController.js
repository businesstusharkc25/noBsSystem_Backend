import jwt from "jsonwebtoken";
import CreatorSchema from "../models/creatorModel.js";
import ChannelSchema from "../models/channelModal.js";
import { parseJwt } from "../utils/index.js";

export const connectWallet = async (req, res) => {
  const { accountAddress } = req.body;

  try {
    const result = await CreatorSchema.findOne(
      {
        accountAddress,
      },
      { __v: 0, createdAt: 0 }
    );
    if (result) {
      const userChannels = await ChannelSchema.find(
        {
          creatorId: { $eq: result._id },
          creatorAccountAddress: { $eq: result.accountAddress },
        },
        {
          __v: 0,
          creatorAccountAddress: 0,
          creatorId: 0,
          channelCreatedAt: 0,
        }
      );

      const token = jwt.sign(
        { result, currentChannel: userChannels[0] },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      res.status(200).json({
        token,
        isSuccess: true,
        message: "wallet connected successfully",
      });
    } else {
      const result = await CreatorSchema.create({
        accountAddress,
      });
      const token = jwt.sign({ result }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.status(201).json({
        token,
        isSuccess: true,
        message: "wallet connected successfully",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong", isSuccess: false });
  }
};

export const changeCurrentChannel = async (req, res) => {
  try {
    const token = await req.headers.authorization.split(" ")[1];
    const parsedToken = parseJwt(token);
    const { channelId } = req.body;

    const updatedChannel = await ChannelSchema.find(
      {
        id: { $eq: parseInt(channelId) },
        creatorId: { $eq: parsedToken?.result?._id },
        creatorAccountAddress: { $eq: parsedToken?.result?.accountAddress },
      },
      {
        __v: 0,
        creatorAccountAddress: 0,
        creatorId: 0,
        channelCreatedAt: 0,
      }
    );

    if (updatedChannel.length == 0) {
      res
        .status(204)
        .json({ message: "channel doesn't exists", isSuccess: false });
    } else {
      const newToken = jwt.sign(
        { result: parsedToken?.result, currentChannel: updatedChannel[0] },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      res.status(200).json({
        token: newToken,
        isSuccess: true,
        message: "current channel updated",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong", isSuccess: false });
  }
};
