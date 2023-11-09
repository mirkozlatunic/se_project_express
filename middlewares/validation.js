const { Joi, celebrate } = require("celebrate");
const validator = require("validator");

// Validate URLs for avatars and item images
const validateURL = (value, helpers) => {
  if (validator.isURL(value)) {
    return value;
  }
  return helpers.error("strig.uri");
};

// Validate clothing item body when and item is created
module.exports.validateCardBody = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30).message({
      "string.min": 'The minimum length of the "name" field is 2',
      "string.max": 'The maximum length of the "name" field is 30',
      "string.empty": 'The "name" field must be filled in',
    }),
    avatar: Joi.string().required().custom(validateURL).message({
      "string.empty": 'The "imageUrl" field must be filled in',
      "string.uri": 'The "imageUrl" field must be a valid url',
    }),
    email: Joi.string().required().email().message({
      "string.email": 'The "email" field must be email format',
    }),
    password: Joi.string().required(),
  }),
});

// Authentification when user logs in
module.exports.validateUserLogin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email().message({
      "string.email": 'The "email" field must be email format',
    }),
    password: Joi.string().required(),
  }),
});

// Validate user and clothing item IDs when they are accessed
module.exports.validateId = celebrate({
  params: Joi.object().keys()({
    itemId: Joi.string().hex().length(24),
  }),
});

// Validate user info body when a user is updated
module.exports.validateUdateUser = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30).message({
      "string.min": 'The minimum length of the "name" field is 2',
      "string.max": 'The maximum length of the "name" field is 30',
      "string.empty": 'The "name" field must be filled in',
    }),
    avatar: Joi.string().required().custom(validateURL).message({
      "string.empty": 'The "imageUrl" field must be filled in',
      "string.uri": 'The "imageUrl" field must be a valid url',
    }),
  }),
});
