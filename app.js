import express from 'express';
import userRoute from './routes/users.route.js';
import authRoute from './routes/auth.route.js';
import cartRoute from './routes/cart.route.js';
import productRoute from './routes/product.route.js';
import successResponse from './middleware/success-response.js';
import errorResponse from './middleware/error-response.js';
import sequelize from './config/database.js';
import cors from "cors";
import dotenv from 'dotenv';
import "./models/associations.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors({
  origin: ["http://localhost:5174", "http://localhost:5173"],
  credentials: true,
}));

app.use(express.json());
app.use(successResponse);

app.use('/users', userRoute);
app.use('/auth', authRoute);
app.use('/products', productRoute);
app.use('/cart', cartRoute);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(errorResponse);

async function startServer() {
  try {
    await sequelize.authenticate();

    // await sequelize.sync();
    await sequelize.sync({ alter: true }); // use only in development if model changes need DB update

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();
