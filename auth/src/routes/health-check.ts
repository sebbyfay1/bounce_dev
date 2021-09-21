import express from 'express';

const router = express.Router();

router.get('/api/users/health', (req, res) => {
    console.log('Recieved a GET request to route: /api/users/health');
    res.send({'messsage': 'The API is working'});
});

export { router as healthCheckRouter };