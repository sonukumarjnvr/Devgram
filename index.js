import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRouter from './routes/userRouter.js';
import postRouter from './routes/postRouter.js';
import profileRouter from './routes/profileRouter.js';

dotenv.config();

const app = express();

app.use(cors());

app.use(bodyParser.json({ limits: '50mb' }));

app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    parameterLimit: '100000',
    extended: true,
  })
);

const port = process.env.PORT || 8000;

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to DB');
  })
  .catch((err) => {
    console.log(err);
  });

//user routers
app.use('/api/users', userRouter);
//posts routers
app.use('/api/posts', postRouter);
//profile routers
app.use('/api/profiles', profileRouter);

app.listen(port, () => {
  console.log(`Server is running at port: ${port}`);
});
