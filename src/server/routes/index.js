import express from 'express';
import logger  from 'morgan';

const router = express.Router();

router.use(logger('dev'))

let index = (req, res) => {
	res.render('index', {});
};

router.get('/', index);
router.post('/', index);

export default router;
