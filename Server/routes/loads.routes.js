const express = require('express');
const { loadData,getUserLoads,cancelLoad,SeeData,acceptLoad} = require('../controllers/load.controller');

const router = express.Router();
// Route to handle load data
router.post('/customer-loads', loadData);
// Route to get all loads (for admin or public view)
router.get('/getloads',getUserLoads)
router.delete('/cancel/:id',cancelLoad);

router.post('/driver-loads',SeeData);
// Route to accept a load
router.post('/accept/:id', acceptLoad);


module.exports = router;