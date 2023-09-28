import { Router } from 'express';
import * as base from '@controllers/base_controller';
import { restrictTo } from '@controllers/auth_controllers/auth_controller';
import Calendar from '@models/calendar/calendar_model';
const router = Router();

router.post('/', base.createOne(Calendar));
router.get('/:id', base.getOne(Calendar));

router.patch('/:id', base.updateOne(Calendar));
router.delete('/:id', base.deleteOne(Calendar));

router.use(restrictTo('ADMIN', 'SUPER_ADMIN'));

router.get('/', base.getAll(Calendar));

export default router;
