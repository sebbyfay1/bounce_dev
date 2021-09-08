import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { ObjectId } from 'mongodb';
import { validateRequest, requireAuth, NotFoundError, databaseClient } from '@bouncedev1/common';

import { GoerAttrs } from '../models/goer';

const router = express.Router();

router.post(
    '/api/hosts/update',
    requireAuth,
    [
        body('firstName').optional().isAlpha(),
        body('lastName').optional().isAlpha(),
        body('birthday').optional().isDate({
            format: 'YYYY-MM-DD',
            delimiters: ['/', '-'],
            strictMode: false
        }),
        body('address').optional(),
        body('city').optional().isAlpha(),

        body('bio').optional().isLength({ max: 300 })
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { 
        firstName,
        lastName,
        birthday,
        bio,
        address,
        city
    } = req.body;

    const goerObjectId: ObjectId = ObjectId.createFromHexString(req.currentUser!.userId);
    const goerCollection = databaseClient.client.db('bounce_dev1').collection('test');
    const goer = await goerCollection.findOne({ _id: goerObjectId });
    if (!goer) {
        throw new NotFoundError();
    }

    if (firstName) { goer.firstName = firstName; }
    if (lastName) { goer.lastName = lastName; }
    if (birthday) { goer.birthday = birthday; }
    if (bio) { goer.bio = bio; }
    if (address) { goer.address = address; }
    if (city) { goer.city = city; }

    const result = await goerCollection.replaceOne({ _id: goerObjectId }, goer);
    if (!result.matchedCount) {
        throw new NotFoundError();
    }

    res.send(goer);
});

export { router as updateRouter };