import express from 'express';
import cors from 'cors';
import { getPort, getSafeOrigins } from './utils/configuration.js';
import { setupAMQPConnection } from './connections/setupamqp.js';

const app = express()
const router = express.Router()
const PORT = getPort()

const allowedOrigins = getSafeOrigins().split(",")

const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};


app.use(express.json())
app.use(cors(corsOptions))

app.use((req, res, next) => {
  return res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// ====== Global Error Handler ======
app.use((err, req, res, next) => {
  console.error("Error:", err.message || err);

  return res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});


app.listen(PORT, (error) => {
    if(!error) {
		console.log('Server is Successfully Running on PORT ' + PORT);
		setupAMQPConnection() //with retry ----
	} else {
		console.log(error)
		console.log('Connection error')
	 }
})

router.get("/", (req, res) => {
   return res.send("llm-node, 1.0.0")
})


app.use(router)