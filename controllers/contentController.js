import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import ContentSchema from "../models/contentModal.js";
import dotEnv from "dotenv";
import { firebaseStorage } from "../firebase/firebaseApp.js";
import { generateStringOfNumberAndLetters, parseJwt } from "../utils/index.js";
import { contentTypeEnum } from "../enums/contentModuleEnums.js";

dotEnv.config();

const addOrUpdateContent = async (req, isUpdate = false) => {
  try {
    // destructuring the values from request
    const parsedToken = parseJwt(token);
    const creatorAccountAddress = parsedToken?.result?.accountAddress;
    const creatorId = parsedToken?.result?._id;
    const channelId = parsedToken?.currentChannel?._id;

    const {
      newsTitle,
      newsBody,
      isMemberOnly,
      status,
      contentCategory,
      contentType,
    } = req.body;

    const { contentId } = req.params;

    const { videoFile, thumbnailFile, podcastFile } = req?.files;

    const objToBeSend = {
      id: 0,
      newsTitle,
      newsBody,
      isMemberOnly,
      status,
      contentCategory,
      creatorId,
      creatorAccountAddress,
      contentType,
      thumbnailUrl: "",
      contentUrl: "",
      contentFileName: "",
      thumbnailFileName: "",
    };

    if (contentId) {
      objToBeSend.id = parseInt(contentId);
    } else {
      objToBeSend.id = (await ContentSchema.collection.countDocuments()) + 1;
    }

    // generating the reference for firebase

    const storageRef = ref(
      firebaseStorage,
      `creator_content/${creatorAccountAddress}/${channelId}`
    );

    const userFileStorageRef = ref(
      storageRef,
      `/${
        contentType == contentTypeEnum.VIDEO
          ? "videos"
          : contentType == contentTypeEnum.PODCAST
          ? "audios"
          : ""
      }/${objToBeSend.id}`
    );

    // uploading data to firebase

    const uploadContentThumbnail = async (uploadRef, thumbnailFile) => {
      if (thumbnailFile) {
        await uploadBytes(uploadRef, thumbnailFile[0]?.buffer, {
          contentType: thumbnailFile[0]?.mimetype,
        });
      }
    };

    const getDownloadUrlFromStorage = async (fileName) => {
      let urlFromResponse;
      await getDownloadURL(ref(userFileStorageRef, fileName))
        .then((url) => {
          if (url) {
            urlFromResponse = url;
          }
        })
        .catch((error) => console.log(error));
      return urlFromResponse;
    };

    if (thumbnailFile) {
      objToBeSend.thumbnailFileName = generateStringOfNumberAndLetters(12);
    }

    if (videoFile || podcastFile) {
      objToBeSend.contentFileName = generateStringOfNumberAndLetters(12);
    }

    await uploadContentThumbnail(
      ref(userFileStorageRef, objToBeSend.thumbnailFileName),
      thumbnailFile
    )
      .then(async () => {
        if (videoFile || podcastFile) {
          await uploadBytes(
            ref(userFileStorageRef, objToBeSend.contentFileName),
            videoFile
              ? videoFile[0]?.buffer
              : podcastFile
              ? podcastFile[0]?.buffer
              : null,
            {
              contentType: videoFile
                ? videoFile[0]?.mimetype
                : podcastFile
                ? podcastFile[0]?.mimetype
                : null,
            }
          );
        }
      })
      .catch((error) => {
        console.log(error);
      });

    // retrieving url from firebase

    await getDownloadUrlFromStorage(objToBeSend.thumbnailFileName).then(
      (url) => (objToBeSend.thumbnailUrl = url)
    );

    await getDownloadUrlFromStorage(objToBeSend.contentFileName).then(
      (url) => (objToBeSend.contentUrl = url)
    );

    // pushing the data to mongo db

    if (!isUpdate) {
      await ContentSchema.create({ ...objToBeSend });
    } else {
      const existingContentObject = await ContentSchema.find({
        id: objToBeSend.id,
      });

      await ContentSchema.findByIdAndUpdate(
        existingContentObject[0]._id,
        { ...objToBeSend },
        {
          new: true,
        }
      );
    }
  } catch (error) {
    console.log(error);
  }
};

export const addContentController = async (req, res) => {
  try {
    await addOrUpdateContent(req);
    res.status(201).json({
      message: "content creation was successful",
      isSuccess: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", isSuccess: false });
  }
};

export const updateContentController = async (req, res) => {
  try {
    await addOrUpdateContent(req, true);
    res.status(201).json({
      message: "content update was successful",
      isSuccess: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", isSuccess: false });
  }
};

export const deleteContentController = async (req, res) => {
  try {
    const token = await req.headers.authorization.split(" ")[1];
    const parsedToken = parseJwt(token);
    const creatorAccountAddress = parsedToken?.result?.accountAddress;
    const channelId = parsedToken?.currentChannel?._id;

    const { id } = req.params;

    const existingContentObject = await ContentSchema.find({
      id,
      creatorAccountAddress: { $eq: creatorAccountAddress },
    });

    const { contentType, contentFileName, thumbnailFileName, _id } =
      existingContentObject[0];

    const storageRef = ref(
      firebaseStorage,
      `creator_content/${creatorAccountAddress}/${channelId}`
    );

    const userFileStorageRef = ref(
      storageRef,
      `/${
        contentType == contentTypeEnum.VIDEO
          ? "videos"
          : contentType == contentTypeEnum.PODCAST
          ? "audios"
          : ""
      }/${id}`
    );

    await deleteObject(ref(userFileStorageRef, contentFileName));
    await deleteObject(ref(userFileStorageRef, thumbnailFileName));

    await ContentSchema.findByIdAndDelete(_id);

    res.status(200).json({
      message: "content deletion was successful",
      isSuccess: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong", isSuccess: false });
  }
};

export const getContentController = async (req, res) => {
  try {
    const token = await req.headers.authorization.split(" ")[1];
    const parsedToken = parseJwt(token);
    const userAccountAddress = parsedToken?.result?.accountAddress;
    const channelId = parsedToken?.currentChannel?._id;

    const { page = 1 } = req.query;
    const { limit = 10 } = req.query;
    const { searchText } = req.query;
    const { minimumViews = 0 } = req.query;
    const { maximumViews } = req.query;
    const { contentCategory } = req.query;

    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = parseInt(page) * parseInt(limit);

    const filterQueryObj = {
      creatorAccountAddress: userAccountAddress,
      views: { $gte: 0 },
      channelId: { $eq: channelId },
    };

    if (searchText) {
      filterQueryObj.newsTitle = { $regex: searchText, $options: "i" };
    }

    if (minimumViews) {
      filterQueryObj.views.$gte = parseInt(minimumViews);
    }

    if (maximumViews) {
      filterQueryObj.views.$lte = parseInt(maximumViews);
    }

    if (contentCategory) {
      filterQueryObj.contentCategory = { $in: contentCategory?.split(",") };
    }

    const resultFromQuery = await ContentSchema.find(
      {
        ...filterQueryObj,
      },
      {
        creatorAccountAddress: 0,
        creatorId: 0,
        _id: 0,
      }
    )
      .sort({ _id: -1 })
      .limit(limit)
      .skip(startIndex);

    const objToSend = {
      isSuccess: true,
      results: resultFromQuery,
      previous: { page: Number(page) - 1, limit: Number(limit) },
    };

    if (endIndex < (await ContentSchema.countDocuments().exec())) {
      objToSend.next = {
        page: Number(page) + 1,
        limit: Number(limit),
      };
    }

    res.status(200).json({ ...objToSend });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong", isSuccess: false });
  }
};

export const getContentById = async (req, res) => {
  try {
    const { id } = req?.params;
    const token = await req.headers.authorization.split(" ")[1];
    const parsedToken = parseJwt(token);
    const userAccountAddress = parsedToken?.result?.accountAddress;
    const channelId = parsedToken?.currentChannel?._id;

    const resultFromQuery = await ContentSchema.find(
      {
        creatorAccountAddress: userAccountAddress,
        id: { $eq: id },
        channelId: { $eq: channelId },
      },
      {
        creatorAccountAddress: 0,
        creatorId: 0,
        _id: 0,
      }
    );
    res.status(200).json({
      isSuccess: true,
      results: resultFromQuery[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong", isSuccess: false });
  }
};
