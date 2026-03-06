const express = require('express');
const router = express.Router();
const CreateActivityLog = require('../../../application/usecases/CreateActivityLog');
const GetActivityLogs = require('../../../application/usecases/GetActivityLogs');

const createActivityLog = new CreateActivityLog();
const getActivityLogs = new GetActivityLogs();


router.post('/', async (req, res) => {
  try {
    const { userId, action, metadata } = req.body;
    const result = await createActivityLog.execute({ userId, action, metadata });
    res.status(202).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await getActivityLogs.execute(req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;