import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { ObjectId } from 'mongodb';
import { validateRequest, requireAuth, NotFoundError, databaseClient } from '@bouncedev1/common';

import { HostAttrs } from '../models/host';

const router = express.Router();

router.post(
    '/api/hosts/create',
    requireAuth,
    [
        body('name').isString().isLength({ max: 300 }),
        body('description').isString().isLength({ max: 3000 }),
        body('tags').isString(),
        body('address').isString(),
        body('city').isString(),
        body('state').isString()
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { 
        name,
        description,
        tags,
        address,
        city,
        state
    } = req.body;

    const hostObjectId: ObjectId = ObjectId.createFromHexString(req.currentUser!.userId);
    const hostCollection = databaseClient.client.db('bounce_dev1').collection('test');
    const host = await hostCollection.findOne({ _id: hostObjectId });
    if (!host) {
        throw new NotFoundError();
    }

    if (name) { host.name = name; }
    if (description) { host.description = description; }
    if (address) { host.address = address; }
    if (city) { host.city = city; }
    if (state) { host.state = state; }
    if (tags) { host.tags = tags.split(','); }

    const result = await hostCollection.replaceOne({ _id: hostObjectId }, host);
    if (!result.matchedCount) {
        throw new NotFoundError();
    }

    res.send(host);
});

export { router as updateRouter };