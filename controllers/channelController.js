import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { firebaseStorage } from "../firebase/firebaseApp.js";
import ChannelSchema from "../models/channelModal.js";
import { parseJwt } from "../utils/index.js";
import mongoose from "mongoose";

const createOrUpdateChannel = async (req, isUpdate = false) => {
  try {
    let channelDoesNotExistsYet = false;

    const token = await req.headers.authorization.split(" ")[1];
    const creatorAccountAddress = parseJwt(token)?.result?.accountAddress;
    const creatorId = mongoose.Types.ObjectId(parseJwt(token)?.result?._id);
    const { channelId } = req.params;

    const { channelName, channelDescription, channelHandle } = req.body;
    const {
      channelLogo: channelLogoFile,
      channelCoverImage: channelCoverFile,
    } = req?.files;

    const channelBasedOnChannelHandle = await ChannelSchema.find({
      channelHandle: { $eq: channelHandle?.replace(/\s/g, "") },
    });

    if (channelBasedOnChannelHandle.length == 0) {
      channelDoesNotExistsYet = true;
    }

    const channelObj = {
      id: 0,
      channelHandle: channelHandle?.replace(/\s/g, ""),
      channelName,
      channelDescription,
      channelLogoUrl: "",
      channelCoverImageUrl: "",
      creatorId,
      creatorAccountAddress,
    };

    if (channelId) {
      channelObj.id = parseInt(channelId);
    } else {
      channelObj.id = (await ChannelSchema.collection.countDocuments()) + 1;
    }
    const addOrUpdateChannelImages = async () => {
      const storageRef = ref(
        firebaseStorage,
        `channels/${channelObj.creatorAccountAddress}/${channelObj.channelName}`
      );

      if (channelLogoFile) {
        await uploadBytes(
          ref(storageRef, "channelLogoImg"),
          channelLogoFile[0]?.buffer,
          { contentType: channelLogoFile[0]?.mimetype }
        )
          .then(async () => {
            await getDownloadURL(ref(storageRef, "channelLogoImg")).then(
              (url) => {
                if (url) {
                  channelObj.channelLogoUrl = url;
                }
              }
            );
          })
          .catch((error) => {
            console.log(error);
          });
      }

      if (channelCoverFile) {
        await uploadBytes(
          ref(storageRef, "channelCoverImage"),
          channelCoverFile[0]?.buffer,
          {
            contentType: channelCoverFile[0]?.mimetype,
          }
        )
          .then(async () => {
            await getDownloadURL(ref(storageRef, "channelCoverImage")).then(
              (url) => {
                if (url) {
                  channelObj.channelCoverImageUrl = url;
                }
              }
            );
          })
          .catch((error) => {
            console.log(error);
          });
      }
    };

    if (!isUpdate && channelDoesNotExistsYet) {
      await addOrUpdateChannelImages();
      await ChannelSchema.create({ ...channelObj });

      return { isSuccess: true, message: "channel created" };
    } else if (isUpdate) {
      await addOrUpdateChannelImages();
      const existingChannelObject = await ChannelSchema.find({
        id: channelObj.id,
      });

      await ChannelSchema.findByIdAndUpdate(
        existingChannelObject[0]._id,
        { ...channelObj },
        {
          new: true,
        }
      );
      return { isSuccess: true, message: "channel updated" };
    } else return { isSuccess: false, message: "channel already exists" };
  } catch (error) {
    console.log(error);
  }
};

export const createChannel = async (req, res) => {
  try {
    const result = await createOrUpdateChannel(req);

    res.status(200).json({
      ...result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
      isSuccess: false,
    });
  }
};

export const editChannel = async (req, res) => {
  try {
    const result = await createOrUpdateChannel(req, true);

    res.status(200).json({
      ...result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
      isSuccess: false,
    });
  }
};

export const deleteChannel = async (req, res) => {
  try {
    const { channelId } = req.params;

    const token = await req.headers.authorization.split(" ")[1];
    const creatorAccountAddress = parseJwt(token)?.result?.accountAddress;

    const existingChannelObj = await ChannelSchema.find({
      channelId: { $eq: channelId },
      creatorAccountAddress: { $eq: creatorAccountAddress },
    });

    const { channelName, _id } = existingChannelObj[0];

    const storageRef = ref(
      firebaseStorage,
      `channels/${creatorAccountAddress}/${channelName}`
    );
    await deleteObject(ref(storageRef, "channelCoverImage"));
    await deleteObject(ref(storageRef, "channelLogoImg"));
    await ChannelSchema.findByIdAndDelete(_id);

    res.status(200).json({
      message: "channel deletion was successful",
      isSuccess: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong", isSuccess: false });
  }
};

export const getChannel = async (req, res) => {
  try {
    const token = await req.headers.authorization.split(" ")[1];
    const creatorAccountAddress = parseJwt(token)?.result?.accountAddress;
    const creatorId = mongoose.Types.ObjectId(parseJwt(token)?.result?._id);
    const { channelId } = req.params;

    const result = await ChannelSchema.find(
      {
        id: { $eq: channelId },
        creatorAccountAddress: { $eq: creatorAccountAddress },
        creatorId: { $eq: creatorId },
      },
      { channelCreatedAt: 0, __v: 0, creatorId: 0, creatorAccountAddress: 0 }
    );

    req.status(200).json({ ...result, isSuccess: true });
  } catch (error) {
    console.log(error);
    json.status(500).json({ isSuccess: true, message: "something went wrong" });
  }
};

export const getAllChannel = async (req, res) => {
  try {
    const token = await req.headers.authorization.split(" ")[1];
    const creatorAccountAddress = parseJwt(token)?.result?.accountAddress;
    const creatorId = mongoose.Types.ObjectId(parseJwt(token)?.result?._id);

    const channelResults = await ChannelSchema.find(
      {
        creatorAccountAddress: { $eq: creatorAccountAddress },
        creatorId: { $eq: creatorId },
      },
      { channelCreatedAt: 0, __v: 0, creatorId: 0, creatorAccountAddress: 0 }
    );

    res.status(200).json({ channelResults, isSuccess: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ isSuccess: true, message: "something went wrong" });
  }
};
