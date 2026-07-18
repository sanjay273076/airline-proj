const express = require('express');

const { ServerConfig } = require('./config');
const apiRoutes = require('./routes');
const { BookingService } = require('./services');

const app = express();

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

app.use('/api', apiRoutes);

app.listen(ServerConfig.PORT, () => {
    console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
    setInterval(() => {
        BookingService.cancelOldBookings()
            .then((count) => { if (count) console.log(`Cancelled ${count} expired bookings`); })
            .catch((err) => console.log('Expiry sweep failed', err.message));
    }, 5 * 60 * 1000);
});
