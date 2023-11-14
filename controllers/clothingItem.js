const ClothingItem = require("../models/clothingItem");
// const { OK, CREATED, FORBIDDEN, handleHttpError } = require("../utils/errors");
const BadRequestError = require("../utils/bad-request-error");
// const ConflictError = require("../utils/conflict-error");
const ForbiddenError = require("../utils/forbidden-error");
const NotFoundError = require("../utils/not-found-error");
// const UnauthorizedError = require("../utils/unauthorized-error");

const createItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  ClothingItem.create({ name, weather, imageUrl, owner })
    .then((item) => {
      res.status(200).send({ data: item });
    })
    .catch((e) => {
      if (e.name === "ValidationError") {
        next(new BadRequestError("Error from createItem"));
      } else {
        next(e);
      }
    });
};

const getItems = (req, res, next) => {
  ClothingItem.find({})
    .then((items) => res.send(items))
    .catch((e) => {
      next(e);
    });
};

const deleteItem = (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.user._id;

  ClothingItem.findById(itemId)
    .orFail()
    .then((item) => {
      if (userId !== item.owner.toString()) {
        return next(
          new ForbiddenError("You are not authorized to delete this item"),
        );
      }
      return ClothingItem.findByIdAndRemove(itemId)
        .orFail()
        .then((removedItem) => res.send(removedItem));
    })
    .catch((e) => {
      if (e.name === "DocumentNotFoundError") {
        next(new NotFoundError("Error from deleted Item"));
      } else if (e.name === "CastError") {
        next(new BadRequestError("Error from deleted Item"));
      } else {
        next(e);
      }
    });
};

const likeItem = (req, res, next) => {
  const { itemId } = req.params;

  ClothingItem.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail()
    .then((like) => {
      res.status(200).send(like);
    })
    .catch((e) => {
      if (e.name === "DocumentNotFoundError") {
        next(new NotFoundError("Error from liked Item"));
      } else if (e.name === "CastError") {
        next(new BadRequestError("Error from liked Item"));
      } else {
        next(e);
      }
    });
};

const dislikeItem = (req, res, next) => {
  const { itemId } = req.params;

  ClothingItem.findByIdAndUpdate(
    itemId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail()
    .then((dislike) => {
      res.send(dislike);
    })
    .catch((e) => {
      if (e.name === "DocumentNotFoundError") {
        next(new NotFoundError("Error from disliked Item"));
      } else if (e.name === "CastError") {
        next(new BadRequestError("Error from disliked Item"));
      } else {
        next(e);
      }
    });
};

module.exports = { createItem, getItems, deleteItem, likeItem, dislikeItem };
