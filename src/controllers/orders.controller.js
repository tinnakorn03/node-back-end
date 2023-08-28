const { secret, firebase } = require('../configs');
const { query, orderByChild, equalTo, child, get, update, ref, push, set, remove } = require("@firebase/database");
const { result, result_error} = require("../commons/convert"); 
const { getRunningNoOrderKey } = require('../commons/calculate');
const { getPagination } = require('../utils/pagination.util')


async function updateProductQuantity(product_id, orderedQuantity) {
    try {
        const productRef = ref(firebase, 'products/' + product_id);
    
        // Fetch the current product data
        const productSnapshot = await get(productRef);
        if (!productSnapshot.exists()) {
            throw new Error("Product not found");
        }

        const currentProductData = productSnapshot.val();
        const updatedQuantity = currentProductData.quantity - orderedQuantity;

        if (updatedQuantity < 0) {
            throw new Error("Ordered quantity exceeds available stock");
        }

        // Update the product quantity in the database without touching other fields
        await update(productRef, { quantity: updatedQuantity });

    } catch (err) {
        throw err;
    }
}


module.exports = {
    async createOrder(ctx, _next) {
        try {
            const {
                userId,
                total_qty,
                total_price, 
                deliverry_price,
                orders
            } = ctx.request.body;
    
            if (!orders || orders.length === 0) {
                ctx.body = result_error(400, "No products provided in the order");
                return;
            }
    
            // Create a reference to the orders collection
            const ordersRef = ref(firebase, 'orders');
    
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
            const runningNo = await getRunningNoOrderKey(currentYear + currentMonth);  
    
            // Construct the transactionNo
            const transactionNo = `T_${currentYear}${currentMonth}_${runningNo}`;  
            
            const specificOrdersRef = child(ordersRef, transactionNo);
    
            // Construct the order data
            const orderData = {
                userId,
                transactionNo,
                transactionDate: currentDate.toISOString(),
                status: 'อยู่ระหว่างการจัดส่ง',
                total_qty,
                total_price,
                deliverry_price,
                orders: orders.map(order => ({
                    product_id: order.product_id,
                    product_name: order.product_name,
                    image: order.image,
                    description: order.description,
                    quantity: order.quantity,
                    price: order.price
                }))
            };
    
            await set(specificOrdersRef, orderData);
            for (let order of orders) {
                await updateProductQuantity(order.product_id, order.quantity);
            }
            ctx.body = result(200, { message: "Order creation successful", transactionNo: transactionNo });
    
        } catch (err) {
            ctx.body = result_error(500, err);
        }
    },
    async getOrderByTransactionNo(ctx, _next) {
        try { 
            const { transactionNo } = ctx.params;   
            const specificOrderRef = ref(firebase, `orders/${transactionNo}`); 
            const orderSnapshot = await get(specificOrderRef); 

            if (!orderSnapshot.exists()) {
                ctx.body = result_error(404, "Order not found");
                return;
            }
            
            const orderData = orderSnapshot.val(); 
            ctx.body = result(200, orderData);
    
        } catch (err) {
            ctx.body = result_error(500, err);
        }
    },
    async getOrders(ctx, _next) {
        try {
            const { page, size } = ctx.request.query;
            const { limit, offset } = getPagination(page, size);
    
            const ordersRef = ref(firebase, 'orders');
            const ordersSnapshot = await get(ordersRef);
            
            if (!ordersSnapshot.exists()) {
                ctx.body = result_error(404, "No orders found");
                return;
            }
     
            const rawData = ordersSnapshot.val();
            const orders = Object.keys(rawData).map(key => rawData[key]);

            const paginatedOrders = orders.slice(offset, offset + limit); 
            ctx.body = result(200, paginatedOrders);
    
        } catch (err) {
            ctx.body = result_error(500, err);
        }
    },
    async deleteOrder(ctx, _next) {
        try {
            const { transactionNo } = ctx.params;  // Assuming orderId is a route parameter
    
            // Check if the order exists before deleting
            const orderToDeleteRef = ref(firebase, `orders/${transactionNo}`);
            const orderSnapshot = await get(orderToDeleteRef);
            if (!orderSnapshot.exists()) {
                ctx.body = result_error(404, "Order not found");
                return;
            }
     
            await remove(orderToDeleteRef);
            ctx.body = result(200, { message: "Order deletion successful" ,transactionNo});
    
        } catch (err) {
            ctx.body = result_error(500, err);
        }
    } 
};