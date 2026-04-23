import express from 'express';
import userRoute from './routes/users.route.js';
import authRoute from './routes/auth.route.js';
import successResponse from './middleware/success-response.js';
import errorResponse from './middleware/error-response.js';
import sequelize from './config/database.js';
import cors from "cors";
import dotenv from 'dotenv';
dotenv.config();


const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(successResponse);
app.use(
  cors({
    origin: "http://localhost:5174",
    credentials: true,
  })
);

app.use('/users', userRoute);
app.use('/auth', authRoute);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(errorResponse);

async function startServer() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();
