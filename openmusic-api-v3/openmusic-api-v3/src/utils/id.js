const { nanoid } = require('nanoid');

const createId = (prefix) => `${prefix}-${nanoid(16)}`;

module.exports = { createId };
