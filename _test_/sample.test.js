const request = require('supertest');
const app = require('../index');
/* Here we have used one dummy coupon for test passing if we run it for first 
 time it will do the test will add that coupon 
 and if you will run this test again chnage the coupon code otherwise 
 test will not pass since it doesnt take duplicate coupon */
describe('Coupon API Tests', () => {
 const coupon = {
        code: "FUB5",
        description: "Flat 50 off any cart",
        discountType: "FLAT",
        discountValue: 5,
        maxDiscountAmount: 5,
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        usageLimitPerUser: 1,
        eligibility: {
          allowedUserTiers: ["NEW", "REGULAR", "GOLD"],
          minLifetimeSpend: 0,
          minOrdersPlaced: 0,
          firstOrderOnly: false,
          allowedCountries: ["IN"],
          minCartValue: 1,
          applicableCategories: [],
          excludedCategories: [],
          minItemsCount: 1
        }
      };

  it('Should create a new coupon', async () => {
    const res = await request(app)
      .post('/create-coupon')
      .send(coupon);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('Should not allow duplicate Coupon',async()=>{
    const res = await request(app).post('/create-coupon').send(coupon);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('success',false);
  })

  it('Should Return the best Coupon',async ()=>{
          const res = await request(app).put('/return-coupon').send({
  "user": {
    "userId": "u123",
    "userTier": "NEW",
    "country": "IN",
    "lifetimeSpend": 1200,
    "ordersPlaced": 2
  },
  "cart": {
    "items": [
      { "productId": "p1", "category": "electronics", "unitPrice": 1500, "quantity": 1 },
      { "productId": "p2", "category": "fashion", "unitPrice": 500, "quantity": 2 }
    ]
  }
});

expect(res.statusCode).toBe(200);
expect(res.body).toHaveProperty('success',true);

  })

});
