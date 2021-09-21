import express, { Request, Response } from 'express';
import { body, param } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, databaseClient, NotAvailableError } from '@bouncedev1/common';

const router = express.Router();

router.get(
    '/api/users/email-available/:email',
    [
        param('email').notEmpty().isEmail()
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
    const { email } = req.params;
    const usersCollection = databaseClient.client.db('bounce_dev1').collection('test');
    const user = await usersCollection.findOne({ email: email}, {});
    if (user) {
        throw new NotAvailableError();
    }
    res.send({}).status(200);
});

export { router as emailAvailableRouter };