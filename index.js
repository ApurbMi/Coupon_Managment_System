const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const couponRoute = require('./Routers/coupon.Route');
require('dotenv').config();
let addres = path.join(__dirname,'./coupon.json');

app.use(express.json());
app.use('/',couponRoute);

app.listen(process.env.PORT,()=>{
    console.log('Server is online....');
})
module.exports = app;