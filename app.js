const express = require("express")
const dotenv =require("dotenv")
const connectDB = require("./dataBase/dBConnection")
const authrouter = require("./routes/auth.router")
const orderRouter = require("./routes/order.router")
const reservationRouter = require("./routes/reservation.router")


dotenv.config()
const app = express()
app.use(express.json())
const port = process.env.PORT 



app.use("/api/v1",authrouter)
app.use("/api/v1/orders", orderRouter)
app.use("/api/v1/reservations",reservationRouter)


//db connection 
connectDB();
//server
app.listen(port,()=>{
console.log(`Server is working on port ${port}`)
}) 



