import 'dotenv/config'
import express from 'express'

const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/test', (req, res) => {
    res.send("This is a test route")
})

app.get("/login",(req,res)=>{
    res.send("<h1>Please login</h1>")
})

app.get("/github",(req,res)=> {
    res.send("<h1>GitHub ( Pushparaj13811 ) </h1>")
})

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}!`)
})