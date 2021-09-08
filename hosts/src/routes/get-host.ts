import express, { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { validateRequest, requireAuth, NotFoundError, databaseClient } from '@bouncedev1/common';
import { ObjectId } from 'mongodb';

const router = express.Router();

router.get(
    '/api/hosts/:id',
    requireAuth,
    [
        param('id').isAlphanumeric()
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { id } = req.params;
    const userObjectId = ObjectId.createFromHexString(id);
    
    const hostsCollection = databaseClient.client.db('bounce_dev1').collection('test');
    const host = await hostsCollection.findOne({ _id: userObjectId });
    if (!host) {
        throw new NotFoundError();
    }
    
    res.send(host);
});

export { router as gethostRouter };