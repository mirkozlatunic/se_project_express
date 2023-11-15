const router = require("express").Router();
const { authorize } = require("../middlewares/auth");

const {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItem");

const { validateItemBody, validateId } = require("../middlewares/validation");

router.post("/", authorize, validateItemBody, createItem);

router.get("/", getItems);

router.delete("/:itemId", authorize, validateId, deleteItem);

router.put("/:itemId/likes", authorize, validateId, likeItem);

router.delete("/:itemId/likes", authorize, validateId, dislikeItem);

module.exports = router;
