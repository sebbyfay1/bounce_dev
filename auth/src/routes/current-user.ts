import express from 'express';
import { currentUser } from '@bouncedev1/common'

const router = express.Router();

router.get('/api/users/currentuser', (req, res) => {
    res.send('Hi there')
});

export { router as currentUserRouter };