const express = require('express');
const fs = require('fs');
const path = require('path');
const route = express.Router();
const address = path.join(__dirname,'../coupon.json');

const readJsonFile = function () {
    const value = fs.readFileSync(address,"utf-8");
    return JSON.parse(value);
}

const writeJsonFile = function(val){
    fs.writeFileSync(address,JSON.stringify(val,null,2));
}

function containCountry(userCountry,couponValidCountries){
    return couponValidCountries.includes(userCountry);
}
function UserType(userType,couponValidTypes){
    return couponValidTypes.includes(userType);
}
function ApplicableCategories(cartCategories, applicableCategories){
    for(let i=0;i<applicableCategories.length;i++){
        if(cartCategories.includes(applicableCategories[i])){
            return true;
        }
    }
    return false;
}

function ExcludedCategories(cartCategories, excludedCategories){
   for(let i=0;i<excludedCategories.length;i++){
        if(cartCategories.includes(excludedCategories[i])){
            return false;
        }
   }
   return true;
}


function eligibleCoupon(Coupon, userData){

    const TodayDate = new Date().getTime();
    const startDate = new Date(Coupon.startDate).getTime();
    const endDate = new Date(Coupon.endDate).getTime();

    let totalQuantity = 0;   
    const cartCategories = [];

    
    const cartValue = userData.cart.items.reduce((acc, val)=>{
        totalQuantity += val.quantity;
        cartCategories.push(val.category);
        acc += (val.unitPrice * val.quantity);
        return acc;
    }, 0);

    
    const e = Coupon.eligibility;

    if (
        startDate <= TodayDate &&
        TodayDate <= endDate &&
        (Coupon.usageLimitPerUser>0) &&
        ((e.minLifetimeSpend===0) || userData.user.lifetimeSpend >= e.minLifetimeSpend) &&
        ((e.allowedCountries.length===0) || containCountry(userData.user.country, e.allowedCountries)) &&
        ((e.allowedUserTiers.length===0) || UserType(userData.user.userTier, e.allowedUserTiers)) &&
        (!e.minOrdersPlaced || userData.user.ordersPlaced >= e.minOrdersPlaced) &&
        (!e.minCartValue || cartValue >= e.minCartValue) &&
        (!e.minItemsCount || totalQuantity >= e.minItemsCount) &&
        ((e.applicableCategories.length===0) || ApplicableCategories(cartCategories, e.applicableCategories)) &&
        ((e.excludedCategories.length===0) || ExcludedCategories(cartCategories, e.excludedCategories))
    ){

        if(!e.firstOrderOnly) return true;

        if(e.firstOrderOnly && userData.user.ordersPlaced === 0){
            return true;
        }

        return false;
    }

    return false;
}



function ModifiedCouponArray(cart, eligibleCouponsArray){

    const totalCartPrice = cart.items.reduce((acc,val)=>{
        acc += (val.unitPrice * val.quantity);
        return acc;
    },0);

    const modifiedArray = eligibleCouponsArray.map((val)=>{

        const code = val.code;
        const endDate = val.endDate;

        let discount = 0;   

        if(val.discountType === 'FLAT'){
            discount = Math.min(val.discountValue, val.maxDiscountAmount);
        }
        else{
            discount = (val.discountValue / 100) * totalCartPrice;
            discount = Math.min(discount, val.maxDiscountAmount);
        }

        return {
            code,
            endDate,
            discount
        }
    });

    return modifiedArray;
}

route.get('/get-all-coupon',(req,res)=>{
     const textFromFile = readJsonFile();
     if(!Array.isArray(textFromFile)){
        return res.status(404).json({
            message:"File dont have array of object",
            message:false
        })
     }

     res.status(200).json({
        Coupon_List:textFromFile,
        success:true
     })

})


route.post('/create-coupon',(req,res)=>{
    
    const newCoupon = req.body;

    const textFromFile = readJsonFile();
   
   
    if(!Array.isArray(textFromFile)){
      return res.status(404).json({
            message:"File is empty or have no array of object in it",
            success:false
        })
    }
   


   const duplicate =   textFromFile.find((val)=>{
             return val.code == newCoupon.code;
     })

     if(duplicate){
       return res.status(404).json({
            message:'Duplicate Coupon Code is not allowed',
            success:false
        })
     }

      if(newCoupon.code.length===0  || !(['FLAT','PERCENT'].includes(newCoupon.discountType)) ||
        (newCoupon.eligibility.minLifetimeSpend<0) || (newCoupon.eligibility.minCartValue<0) || (newCoupon.eligibility.minOrdersPlaced<0))
{
  return res.status(404).json({
        message:"Fill Data properly",
        status:false
    })
}



     
    textFromFile.push(newCoupon);
    writeJsonFile(textFromFile);

   return res.status(200).json({
        message:"Coupon saved successfully",
        success:true
    })

})

route.put('/return-coupon',(req,res)=>{
        
    const userData = req.body;

    if(!userData){
        return res.status(404).json({
            message:"userdata is empty",
            success:false
        })
    }

    const couponArray = readJsonFile();

    if(!couponArray){
        return res.status(404).json({
            message:"Coupon file is empty",
            success:false
        })
    }

    
    const eligibleCouponsArray = couponArray.filter((val)=>{
        return eligibleCoupon(val,userData);
    });


    const modifiedArray = ModifiedCouponArray(userData.cart, eligibleCouponsArray);
    
    

    modifiedArray.sort((a, b) => {

        if (a.discount !== b.discount) {
            return b.discount - a.discount;
        }

        const dateA = new Date(a.endDate);
        const dateB = new Date(b.endDate);

      if (dateA.getTime() !== dateB.getTime()) {
    return dateA - dateB;
}


        return a.code.localeCompare(b.code);
    });

if(modifiedArray.length!=0){
    const code = modifiedArray[0].code
    let CouponArray = readJsonFile();
  CouponArray = CouponArray.map((val)=>{
          if(val.code===code){
            val.usageLimitPerUser = val.usageLimitPerUser - 1;
          }
          return val;
    })
    writeJsonFile(CouponArray);
}


    res.status(200).json({
        coupon: (modifiedArray.length !== 0) ? modifiedArray[0] : null,
        success: true
    });

});

module.exports = route;
