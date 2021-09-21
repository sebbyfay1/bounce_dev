import express, { Request, Response } from 'express';
import { body, Result } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError, databaseClient } from '@bouncedev1/common';
import { ObjectId } from 'mongodb';


import { UserAttrs } from '../models/user';
import { GoerAttrs } from '../models/goer';
import { HostAttrs } from '../models/host';
import { Password } from '../util/password';

const router = express.Router();

router.post(
    '/api/users/signup', 
    [
        body('email').isEmail().withMessage('Email must be valid'),
        body('username').notEmpty().withMessage('Username must not be empty.'),
        body('password')
            .isLength({ min: 4, max: 20 })
            .withMessage('Password must be between 4 and 20 characters'),
        body('isGoer').notEmpty().toBoolean()
    ], 
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, username, password, isGoer } = req.body;

        const usersCollection = databaseClient.client.db('bounce_dev1').collection('test');
        var cursor = await usersCollection.findOne({ email });
        if (cursor) { throw new BadRequestError('Email already in use'); }
        cursor = await usersCollection.findOne({ username });
        if (cursor) { throw new BadRequestError('Username already in use'); }

        // create new goer or host object
        var newObjectId: ObjectId;
        if (isGoer) {
            const goer: GoerAttrs = {
                username,
                isGoer
            }
            const goersCollection = databaseClient.client.db('bounce_dev1').collection('test');
            const result = await goersCollection.insertOne(goer);
            newObjectId = result.insertedId; 
        } else {
            const host: HostAttrs = {
                username,
                isGoer
            };
            const hostsCollection = databaseClient.client.db('bounce_dev1').collection('test');
            const result = await hostsCollection.insertOne(host);
            newObjectId = result.insertedId; 
        }

        // create and save new user
        const user: UserAttrs = {
            email,
            username,
            password: await Password.toHash(password),
            userId: newObjectId,
            isGoer
        };
        const result = await usersCollection.insertOne(user);

        // generate jwt
        const userJwt = jwt.sign(
            {
                id: result.insertedId,
                userId: newObjectId,
                email: user.email
            }, 
            process.env.JWT_KEY!,
            {
                expiresIn: '24d'
            }
        );

        res.status(201).send({
            user,
            userJwt
        });
});

export { router as signupRouter }; 