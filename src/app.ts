import cors from 'cors';
import express, { Application } from 'express';
import httpStatus from 'http-status';
import cookieParser from 'cookie-parser';
import router from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/v1', router);
app.get('/', (req, res) => {
  res.send('Server is running successfully');
});

app.use(globalErrorHandler);

export default app;
