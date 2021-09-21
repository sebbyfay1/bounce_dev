import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, requireAuth } from '@bouncedev1/common';

const router = express.Router();

router.get(
    '/api/users/refresh-jwt',
    requireAuth,
    [], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const currentUser = req.currentUser!;
    console.log(currentUser);
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