import express, { Request, Response } from 'express';
import { param } from 'express-validator';
import { validateRequest, requireAuth, NotFoundError, databaseClient } from '@bouncedev1/common';
import { ObjectId } from 'mongodb';

const router = express.Router();

router.get(
    '/api/goers/header/:goerId',
    requireAuth,
    [
        param('goerId').isMongoId()
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { goerId } = req.params;
    const goerObjectId = ObjectId.createFromHexString(goerId);
    const userCollection = databaseClient.client.db('bounce_dev1').collection('goers');
    const goer = await userCollection.findOne({ _id: goerObjectId }, { projection: { _id: 1, username: 1, firstName: 1, lastName: 1, profilePictureUrl: 1 } });
    if (!goer) {
        throw new NotFoundError();
    }
    res.send(goer);
});

export { router as getGoerHeaderRouter };