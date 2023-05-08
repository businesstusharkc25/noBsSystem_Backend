import jwt from "jsonwebtoken";
import UserSchema from "../models/userModal.js";
import ContentSchema from "../models/contentModal.js";
import ChannelSchema from "../models/channelModal.js";
import { parseJwt } from "../utils/index.js";

export const connectMobileWallet = async (req, res) => {
  const { accountAddress } = req.body;

  try {
    const result = await UserSchema.findOne(
      {
        accountAddress,
      },
      { __v: 0, createdAt: 0 }
    );
    if (result) {
      const token = jwt.sign({ result }, process.env.JWT_SECRET, {});
      res.status(200).json({
        token,
        isSuccess: true,
        message: "wallet connected successfully",
      });
    } else {
      const result = await UserSchema.create({
        accountAddress,
      });
      const token = jwt.sign({ result }, process.env.JWT_SECRET, {});

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

export const getContent = async (req, res) => {
  try {
    const { showLatestContent = false, contentCategory } = req.query;

    const filterQueryObj = {};

    if (contentCategory) filterQueryObj.contentCategory = contentCategory;

    const resultFromQuery = await ContentSchema.find(
      {
        ...filterQueryObj,
      },
      {
        creatorAccountAddress: 0,
        creatorId: 0,
        _id: 0,
      }
    ).sort({ createdAt: showLatestContent ? -1 : null });
    const resultWithChannelInfo = [];

    for (let index = 0; index < resultFromQuery.length; index++) {
      const content = resultFromQuery[index];
      resultWithChannelInfo.push({
        content,
        channelInfo: await ChannelSchema.findOne({
          _id: resultFromQuery[index].channelId,
        }),
      });
    }

    res.status(200).json({
      isSuccess: true,
      results: resultWithChannelInfo,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong", isSuccess: false });
  }
};

export const getContentById = async (req, res) => {
  try {
    const { id } = req.params;

    const resultWithChannelInfo = {};

    resultWithChannelInfo.content = await ContentSchema.findOne(
      {
        id,
      },
      {
        creatorAccountAddress: 0,
        creatorId: 0,
        _id: 0,
      }
    );

    resultWithChannelInfo.channelInfo = await ChannelSchema.findOne({
      _id: resultWithChannelInfo.content.channelId,
    });

    res.status(200).json({
      isSuccess: true,
      result: resultWithChannelInfo,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong", isSuccess: false });
  }
};

export const addComment = async (req, res) => {
  try {
    const { contentId } = req?.params;
    const { comment, replyingTo } = req?.body;

    const token = await req.headers.authorization.split(" ")[1];
    const parsedToken = parseJwt(token);

    const userAccountAddress = parsedToken?.result?.accountAddress;

    const replyData = { userAddress: userAccountAddress, comment };

    const currentContent = await ContentSchema.findOne({
      id: contentId,
    });

    if (!replyingTo) {
      currentContent?.comments.push(replyData);
    } else {
      currentContent?.comments
        ?.find((comment) => comment._id == replyingTo)
        ?.replies.push(replyData);
    }

    await ContentSchema.findByIdAndUpdate(
      currentContent?._id,
      { ...currentContent },
      {
        new: true,
      }
    );

    res.status(200).json({
      isSuccess: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong", isSuccess: false });
  }
};
