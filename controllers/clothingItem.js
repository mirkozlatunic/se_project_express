const ClothingItem = require('../models/clothingItem');
const { OK, CREATED } = require("../utils/errors");
const { handleHttpError } = require("../utils/errorHandlers");

const createItem = (req, res) => {
    const {name, weather, imageUrl} = req.body;
    const owner = req.user._id;

    ClothingItem.create({name, weather, imageUrl, owner}).then((item) => {
        res.status(CREATED).send({data:item})
    }). catch((e) => {
        handleHttpError(req, res, e);
    })
}

const getItems = (req, res) => {
    ClothingItem.find({}).then((items) => res.send(items))
    .catch((e) => {
        handleHttpError(req, res, e);
    })
}

const deleteItem = (req, res) => {
    const {itemId} = req.params;

    ClothingItem.findByIdAndDelete(itemId).orFail().then((item) => res.status(OK).send(item)).catch((e) => {
        handleHttpError(req, res, e)})
}

const likeItem = (req, res) => {
    const {itemId} = req.params;

    ClothingItem.findByIdAndUpdate(itemId, {$addToSet: {likes: req.user._id}}, {new: true}).orFail().then((like) => {res.status(OK).send(like);}).catch((e) => {
        handleHttpError(req, res, e)})
}

const dislikeItem = (req, res) => {
    const {itemId} = req.params;

    ClothingItem.findByIdAndUpdate(itemId, {$pull: {likes: req.user._id}}, {new: true}).orFail().then((dislike) => {res.status(OK).send(dislike);}).catch((e) => {
        handleHttpError(req, res, e)})
}

module.exports = {createItem, getItems, deleteItem, likeItem, dislikeItem}