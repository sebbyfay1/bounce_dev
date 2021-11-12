import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, requireAuth, databaseClient, NotAuthorizedError } from '@bouncedev1/common';

const router = express.Router();

router.get(
    '/api/users/refresh-jwt',
    requireAuth,
    [], 
    validateRequest, 
    async (req: Request, res: Response) => {
    console.log(req.currentUser!);
    const userCollection = databaseClient.client.db('bounce_dev1').collection('users'); 
    const user = await userCollection.findOne({ email: req.currentUser!.email });
    if (!user) { throw new NotAuthorizedError(); }
    const currentUser = req.currentUser!;
    const userJwt = jwt.sign(
        {
            id: currentUser.id,
            userId: currentUser.userId,
            email: currentUser.email
        }, 
        process.env.JWT_KEY!,
        {
            expiresIn: '24d'
        }
    );
    res.status(200).send({
        currentUser,
        userJwt
    });
});

export { router as refreshJwtRouter };