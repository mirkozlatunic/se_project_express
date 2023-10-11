const ClothingItem = require("../models/clothingItem");
const { OK, CREATED, FORBIDDEN, handleHttpError } = require("../utils/errors");

const createItem = (req, res) => {
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  ClothingItem.create({ name, weather, imageUrl, owner })
    .then((item) => {
      res.status(CREATED).send({ data: item });
    })
    .catch((e) => {
      handleHttpError(req, res, e);
    });
};

const getItems = (req, res) => {
  ClothingItem.find({})
    .then((items) => res.send(items))
    .catch((e) => {
      handleHttpError(req, res, e);
    });
};

const deleteItem = (req, res) => {
  const { itemId } = req.params;
  const userId = req.user._id;

  ClothingItem.findById(itemId)
    .orFail()
    .then((item) => {
      console.log(item);
      if (userId !== item.owner.toString()) {
        return res.status(FORBIDDEN).send({ message: "Access denied" });
      }
      return ClothingItem.findByIdAndRemove(itemId)
        .orFail()
        .then((removedItem) => res.send(removedItem))
        .catch((err) => {
          handleHttpError(req, res, err);
        });
    })
    .catch((err) => {
      handleHttpError(req, res, err);
    });
};

const likeItem = (req, res) => {
  const { itemId } = req.params;

  ClothingItem.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail()
    .then((like) => {
      res.status(OK).send(like);
    })
    .catch((e) => {
      handleHttpError(req, res, e);
    });
};

const dislikeItem = (req, res) => {
  const { itemId } = req.params;

  ClothingItem.findByIdAndUpdate(
    itemId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail()
    .then((dislike) => {
      res.status(OK).send(dislike);
    })
    .catch((e) => {
      handleHttpError(req, res, e);
    });
};

module.exports = { createItem, getItems, deleteItem, likeItem, dislikeItem };
