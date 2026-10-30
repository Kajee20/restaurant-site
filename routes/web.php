<?php

use App\Http\Controllers\RestaurantController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'welcome');
Route::prefix('api')->group(function () {
    Route::get('/menu', [RestaurantController::class, 'menu']);
    Route::post('/orders', [RestaurantController::class, 'placeOrder']);
    Route::post('/orders/track', [RestaurantController::class, 'trackOrder']);
    Route::get('/user/status', [RestaurantController::class, 'customerStatus']);
    Route::post('/user/register', [RestaurantController::class, 'customerRegister'])->middleware('throttle:3,1');
    Route::post('/user/login', [RestaurantController::class, 'customerLogin'])->middleware('throttle:5,1');
    Route::post('/user/logout', [RestaurantController::class, 'customerLogout']);
    Route::get('/user/orders', [RestaurantController::class, 'customerOrders']);
    Route::post('/admin/login', [RestaurantController::class, 'adminLogin'])->middleware('throttle:5,1');
    Route::post('/admin/logout', [RestaurantController::class, 'adminLogout']);
    Route::get('/admin/status', [RestaurantController::class, 'adminStatus']);
    Route::get('/admin/foods', [RestaurantController::class, 'adminFoods']);
    Route::post('/admin/foods', [RestaurantController::class, 'saveFood']);
    Route::put('/admin/foods/{food}', [RestaurantController::class, 'saveFood']);
    Route::delete('/admin/foods/{food}', [RestaurantController::class, 'deleteFood']);
    Route::get('/admin/orders', [RestaurantController::class, 'adminOrders']);
    Route::patch('/admin/orders/{order}', [RestaurantController::class, 'updateOrder']);
});
