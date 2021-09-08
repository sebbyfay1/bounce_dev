import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError, databaseClient } from '@bouncedev1/common';

import { Password } from '../util/password';
import { UserAttrs } from '../models/user';

const router = express.Router();

router.post(
    '/api/users/signin',
    [
        body('email').isEmail().withMessage('Must provide a valid email.'),
        body('password').isLength({ min: 4, max: 20 }).withMessage('Must provide valid password'),
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const userCollection = databaseClient.client.db('bounce_dev1').collection('test'); 
    const user = await userCollection.findOne({ email });


    if (!user) { throw new BadRequestError('Email is not associated with profile'); }
    const passwordsMatch = await Password.compare(user.password, password);
    if (!passwordsMatch) { throw new BadRequestError('Invalid credentials'); }

    // generate jwt
    const userJwt = jwt.sign(
        {
            id: user.id,
            userId: user.userId,
            email: user.email
        }, 
        process.env.JWT_KEY!,
        {
            expiresIn: '24d'
        }
    );

    res.status(200).send({
        user,
        userJwt
    });
});

export { router as signinRouter };