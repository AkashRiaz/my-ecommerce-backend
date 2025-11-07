import cors from 'cors';
import express, { Application } from 'express';
import httpStatus from 'http-status';
import cookieParser from 'cookie-parser';


const app:Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health-check', (req, res) => {
  res.status(httpStatus.OK).send('OK');
});


export default app;