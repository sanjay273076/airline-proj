const express=require('express')


const {ServerConfig,Logger}=require('./config')

const apiRoutes=require("./routes")


const app=express()

app.use((req,res,next)=>{
    res.set({
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Headers':'Content-Type, x-idempotency-key',
        'Access-Control-Allow-Methods':'GET,POST,PATCH,DELETE,OPTIONS'
    })
    if(req.method==='OPTIONS') return res.sendStatus(204)
    next()
})

app.use(express.json())

app.use(express.urlencoded({extended:true}))

app.use('/api',apiRoutes)


app.listen(ServerConfig.PORT,()=>{
    console.log(`Successfully started the server on PORT:${ServerConfig.PORT}`),
    Logger.info("Successfully started the server","root",{})
})