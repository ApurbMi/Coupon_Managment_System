const express = require('express');
const app = express();
const couponRoute = require('./Routers/coupon.Route');
require('dotenv').config();

app.use(express.json());
app.use('/',couponRoute);
const date = new Date().getTime();
console.log(typeof date);
app.listen(5000,()=>{
    console.log('Server is online....');
})