import MembershipSchema from "../models/membershipModal.js";
import { parseJwt } from "../utils/index.js";

const addOrUpdateMembership = async (req, isUpdate = false) => {
  try {
    const token = await req.headers.authorization.split(" ")[1];
    const parsedToken = parseJwt(token);
    const createdBy = parsedToken?.result?.accountAddress;
    const creatorId = parsedToken?.result?._id;
    const channelId = parsedToken?.currentChannel?._id;

    const { id } = req.params;
    const { membershipName, perks, price, status } = req.body;

    const membershipObj = {
      id: 0,
      membershipName,
      perks,
      price,
      status,
      creatorId,
      createdBy,
      channelId,
    };

    if (id) {
      membershipObj.id = parseInt(id);
    } else {
      membershipObj.id =
        (await MembershipSchema.collection.countDocuments()) + 1;
    }

    if (!isUpdate) {
      await MembershipSchema.create({ ...membershipObj });
    } else {
      const existingMembership = await MembershipSchema.find({ id: id });

      await MembershipSchema.findByIdAndUpdate(
        existingMembership[0]._id,
        { ...membershipObj },
        { new: true }
      );
    }
  } catch (error) {
    console.log(error);
  }
};

export const updateMembershipController = async (req, res) => {
  try {
    await addOrUpdateMembership(req, true);
    res.status(200).json({ isSuccess: true, message: "membership updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong", isSuccess: false });
  }
};

export const addMembershipController = async (req, res) => {
  try {
    await addOrUpdateMembership(req);

    res.status(201).json({
      message: "membership creation was successful",
      isSuccess: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong", isSuccess: false });
  }
};

export const getMembershipsController = async (req, res) => {
  try {
    const token = await req.headers.authorization.split(" ")[1];
    const parsedToken = parseJwt(token);
    const createdBy = parsedToken?.result?.accountAddress;
    const channelId = parsedToken?.currentChannel?._id;

    const { page = 1 } = req.query;

    const startIndex = (parseInt(page) - 1) * 6;
    const endIndex = parseInt(page) * 6;

    const resultFromQuery = await MembershipSchema.find(
      { createdBy, channelId: { $eq: channelId } },
      { _id: 0, createdBy: 0, createdAt: 0, creatorId: 0, __v: 0 }
    )
      .sort({
        _id: -1,
      })
      .limit(6)
      .skip(startIndex);

    const resultObj = {
      isSuccess: true,
      results: resultFromQuery,
      previous: { page: Number(page) - 1, limit: 6 },
    };

    if (endIndex < (await MembershipSchema.countDocuments().exec())) {
      resultObj.next = {
        page: Number(page) + 1,
        limit: 6,
      };
    }

    res.status(201).json({ ...resultObj });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong", isSuccess: false });
  }
};

export const deleteMembershipController = async (req, res) => {
  try {
    const token = await req.headers.authorization.split(" ")[1];
    const parsedToken = parseJwt(token);
    const creatorAccountAddress = parsedToken?.result?.accountAddress;
    const channelId = parsedToken?.currentChannel?._id;

    const { id } = req.params;

    const existingMembershipObject = await MembershipSchema.find({
      id,
      createdBy: { $eq: creatorAccountAddress },
      channelId: { $eq: channelId },
    });

    const { _id } = existingMembershipObject[0];

    await MembershipSchema.findByIdAndDelete(_id);

    res.status(200).json({
      message: "Deletion was successful",
      isSuccess: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong", isSuccess: false });
  }
};

export const getMembershipByIdController = async (req, res) => {
  try {
    const token = await req.headers.authorization.split(" ")[1];
    const parsedToken = parseJwt(token);
    const creatorAccountAddress = parsedToken?.result?.accountAddress;
    const channelId = parsedToken?.currentChannel?._id;

    const { id } = req.params;

    const existingMembershipObject = await MembershipSchema.find(
      {
        id,
        createdBy: { $eq: creatorAccountAddress },
        channelId: { $eq: channelId },
      },
      { _id: 0, createdBy: 0, __v: 0 }
    );

    res.status(200).json({
      isSuccess: true,
      result: existingMembershipObject[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong", isSuccess: false });
  }
};
