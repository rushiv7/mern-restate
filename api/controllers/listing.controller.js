import Listing from "../models/listing.model.js";
import { errorCreator } from "../utils/error.js";

export const createListing = async (req, res, next) => {
  try {
    const listing = new Listing(req.body);
    await listing.save();
    res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return next(errorCreator(404, "Listing not found"));

  if (listing.userRef !== req.user.id)
    return next(errorCreator(401, "You can only delete your own listing"));
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json("Listing has been deleted!");
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return next(errorCreator(404, "Listing not found"));

  if (listing.userRef !== req.user.id)
    return next(errorCreator(404, "You can only update your own listing"));
  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(errorCreator(404, "Listing not found"));

    res.status(200).json(listing);
  } catch (error) {}
};
