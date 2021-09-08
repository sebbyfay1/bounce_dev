import express, { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { validateRequest, requireAuth, NotFoundError, databaseClient } from '@bouncedev1/common';
import { ObjectId } from 'mongodb';

import { GoerAttrs } from '../models/goer';

const router = express.Router();

router.get(
    '/api/goers/:id',
    requireAuth,
    [
        param('id').isAlphanumeric()
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { id } = req.params;
    const userObjectId = ObjectId.createFromHexString(id);
    
    const userCollection = databaseClient.client.db('bounce_dev1').collection('test');
    const goer = await userCollection.findOne({ _id: userObjectId });
    if (!goer) {
        throw new NotFoundError();
    }
    
    // check if user is private
    // check if current user is following
    
    res.send(goer);
});

export { router as getGoerRouter };