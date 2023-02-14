const {Router} = require('express');
const { findAll } = require('../database/databaseop');
const router = Router();
const {categoryCollection} = require('../database/databaseop/collections')

router.get("/categories", async (req, res) => {
    const query = {};
    const categories = await findAll(categoryCollection,query);
    res.send(categories);
  });

  module.exports= router;