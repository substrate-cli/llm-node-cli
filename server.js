import express from 'express';
import cors from 'cors';
import { getPort } from './utils/configuration.js';
import { setupAMQPConnection } from './connections/setupamqp.js';

const app = express()
const router = express.Router()
const PORT = getPort()

app.use(express.json())
app.use(cors())

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