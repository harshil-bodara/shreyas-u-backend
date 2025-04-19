import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user.routes';
import friendRoutes from './routes/friendRequest.routes';
import companyRoutes from './routes/company.routes';
import exploreRoutes from './routes/explore.routes';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/users', userRoutes);
app.use('/friend',friendRoutes);
app.use('/company', companyRoutes);
app.use('/explore', exploreRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ message: 'shreyas-u!' });
});


export default app;

