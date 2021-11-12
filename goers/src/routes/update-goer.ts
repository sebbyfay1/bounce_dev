import express, { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, requireAuth, NotFoundError, databaseClient, NotAuthorizedError } from '@bouncedev1/common';
import { ObjectId } from 'mongodb';

const router = express.Router();

router.post(
    '/api/goers/update',
    requireAuth,
    [
        body('firstName').optional(),
        body('lastName').optional(),
        body('birthday').optional(),
        body('city').optional(),
        body('bio').optional(),
        body('profilePictureUrl').optional().isURL()
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    console.log(req.body);
    const { firstName, lastName, birthdate, city, bio, profilePictureUrl } = req.body;
    const goerObjectId = ObjectId.createFromHexString(req.currentUser!.userId);
    const goersCollections = databaseClient.client.db('bounce_dev1').collection('goers');
    const goer = await goersCollections.findOne({ _id: goerObjectId });
    if (!goer) {
        console.log('Cant find the goer');
        throw new NotFoundError();
    }
    console.log(goer);
    if (firstName) { goer.firstName = firstName; }
    if (lastName) { goer.lastName = lastName; }
    if (birthdate) { goer.birthdate = birthdate; }
    if (city) { goer.city = city; }
    if (bio) { goer.bio = bio; }
    if (profilePictureUrl) { goer.profilePictureUrl = profilePictureUrl; }
    const updateGoerResult = await goersCollections.replaceOne({ _id: goerObjectId }, goer);
    if (!updateGoerResult.matchedCount) {
        console.log('not matched');
        throw new NotFoundError();
    }
    res.send(goer);
});

export { router as updateGoerRouter };