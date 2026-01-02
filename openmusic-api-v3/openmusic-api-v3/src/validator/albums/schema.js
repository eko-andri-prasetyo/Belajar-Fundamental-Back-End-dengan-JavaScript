const Joi = require('joi');

const currentYear = new Date().getFullYear();

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(currentYear)
    .required(),
});

const CoverHeadersSchema = Joi.object({
  'content-type': Joi.string().regex(/^image\/.*/).required(),
}).unknown();

module.exports = { AlbumPayloadSchema, CoverHeadersSchema };
