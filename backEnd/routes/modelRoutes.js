import express from 'express';
import multer from 'multer';

import { getModels, getModelsById, postModel, postFormData } from '../controller/modelController.js';

const router = express.Router()
const upload = multer();

router.route('/').get(getModels);
router.route('/executeModel/').post(postModel);
router.route('/executeMultimediaModel/').post(upload.single('file'), postFormData);

router.route('/:id').get(getModelsById)



export default router