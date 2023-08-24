const { secret, firebase } = require('../configs');
const { query, orderByChild, equalTo, child, get, ref, push, set, remove } = require("@firebase/database");
const { result, result_error} = require("../commons/convert"); 
const { getRunningNoProductKey } = require('../commons/calculate');
const { getPagination } = require('../utils/pagination.util')


module.exports = {
    async getProducts(ctx, _next) {
        try {
            const { page, size } = ctx.request.query;
            const { limit, offset } = getPagination(page, size);
        
            const productsRef = ref(firebase, 'products');
            const productsSnapshot = await get(productsRef);
        
            if (!productsSnapshot.exists()) {
                ctx.body = result_error(404, "No products found");
                return;
            }
    
            const products = productsSnapshot.val();
     
            const productsArray = Object.keys(products)
                .map(key => products[key])
                .filter(product => !product.isDelete); 
    
            const paginatedProducts = productsArray.slice(offset, offset + limit);
    
            ctx.body = result(200, paginatedProducts);
        
        } catch (err) {
            ctx.body = result_error(500, err);
        }
    },
    async getProductById(ctx, _next) {
        try {
            const productId = ctx.request.params.product_id;  // Assuming you have set up your route to capture product_id as a URL parameter
    
            const productRef = ref(firebase, 'products/' + productId);
            const productSnapshot = await get(productRef);
    
            if (!productSnapshot.exists()) {
                ctx.body = result_error(404, "Product not found");
                return;
            }
    
            // Get the product data without the Firebase key
            const productData = Object.values(productSnapshot.val())[0];
            
            ctx.body = result(200, productData);
    
        } catch (err) {
            ctx.body = result_error(500, err);
        }
    }, 
    async createProduct(ctx, _next) {
        try {
            const { product_name, description, quantity, price } = ctx.request.body;
            let imageBase64 = "";
            const imageFile = ctx.request.files && ctx.request.files.image; 
            if (imageFile) {
                imageBase64 = fs.readFileSync(imageFile, 'base64');
            } 

            // Create a reference to the products collection
            const productRef = ref(firebase, 'products');
        
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
            const runningNo = await getRunningNoProductKey(currentYear + currentMonth);  

            // Construct the product_id
            const productId = `P_${currentYear}${currentMonth}_${runningNo}`; 
            const specificProductRef = child(productRef, productId);

            // Create a new product
            await set(specificProductRef, {
                product_id: productId,
                product_name,
                image: imageBase64,
                description,
                quantity,
                price,
                isDelete: false
            });

            ctx.body = result(200, { message: "Product creation successful", productId: productId });

        } catch (err) {
            ctx.body = result_error(500, err);
        }
    }, 
    async updateProduct(ctx, _next) {
        try {
            const { product_id, product_name, description, quantity, price } = ctx.request.body;
    
            const productRef = ref(firebase, 'products/' + product_id);
    
            // Check if the product exists
            const productSnapshot = await get(productRef);
            if (!productSnapshot.exists()) {
                ctx.body = result_error(404, "Data Not Found");
                return;
            }
    
            // Optionally handle image update if provided
            let imageBase64 = null;
            if (ctx.request.files && ctx.request.files.image) {
                const imageFile = ctx.request.files.image;
                imageBase64 = fs.readFileSync(imageFile.path, 'base64');
            }
    
            const updates = {
                product_name,
                description,
                quantity,
                price,
            };
    
            if (imageBase64) {
                updates.image = imageBase64;
            }
    
            await set(productRef, updates, true);  
            ctx.body = result(200, { message: "Product update successful", productId: product_id });
    
        } catch (err) {
            ctx.body = result_error(500, err);
        }
    },
    async deleteProduct(ctx, _next) {
        try {
            const { product_id } = ctx.request.params.product_id;
    
            const productRef = ref(firebase, 'products/' + product_id);
    
            await set(productRef, { isDelete: true }, true);  // mark as deleted
    
            ctx.body = result(200, { message: "Product deleted successfully" });
    
        } catch (err) {
            ctx.body = result_error(500, err);
        }
    }
};