const router = require('express').Router();

const { createItem, getItems, updateItem, deleteItem, likeItem, dislikeItem } = require('../controllers/clothingItem')

//CRUD

//Create
router.post('/', createItem)

//Read
router.get('/', getItems);

//Update
router.put('/:itemId', updateItem)

//Delete
router.delete('/:itemId', deleteItem)

//Like
router.put('/:itemId/likes', likeItem)

//Dislike
router.delete('/:itemId/likes', dislikeItem)

module.exports = router;