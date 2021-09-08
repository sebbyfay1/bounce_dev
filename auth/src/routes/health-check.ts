import express from 'express';

const router = express.Router();

router.post('/api/users/health', (req, res) => {
    res.send('The API is working');
});

export { router as healthCheckRouter };