<?php

namespace App\Http\Controllers;

use App\Models\FoodItem;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class RestaurantController extends Controller
{
    public function menu(): JsonResponse
    {
        return response()->json(FoodItem::query()->where('is_available', true)->orderBy('category')->orderBy('name')->get());
    }

    public function placeOrder(Request $request): JsonResponse
    {
        $customer = $this->requireCustomer();
        $data = $request->validate([
            'customer_phone' => ['required', 'string', 'max:40'],
            'delivery_address' => ['required', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1', 'max:30'],
            'items.*.food_item_id' => ['required', 'integer', 'distinct', 'exists:food_items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:20'],
        ]);

        $order = DB::transaction(function () use ($data, $customer) {
            $requested = collect($data['items'])->keyBy('food_item_id');
            $foods = FoodItem::query()->whereIn('id', $requested->keys())->where('is_available', true)->get()->keyBy('id');
            abort_if($foods->count() !== $requested->count(), 422, 'One or more menu items are no longer available.');
            $total = $requested->sum(fn ($item) => $foods[$item['food_item_id']]->price * $item['quantity']);
            $order = Order::create([
                'order_number' => 'NK-'.now()->format('ymd').'-'.strtoupper(bin2hex(random_bytes(3))),
                'user_id' => $customer->id,
                'customer_name' => $customer->name,
                'customer_email' => $customer->email,
                'customer_phone' => $data['customer_phone'],
                'delivery_address' => $data['delivery_address'],
                'total' => $total,
            ]);
            foreach ($requested as $id => $item) {
                $food = $foods[$id];
                $order->items()->create(['food_item_id' => $food->id, 'food_name' => $food->name, 'unit_price' => $food->price, 'quantity' => $item['quantity']]);
            }

            return $order->load('items');
        });

        return response()->json($order, 201);
    }

    public function trackOrder(Request $request): JsonResponse
    {
        $data = $request->validate(['order_number' => ['required', 'string'], 'customer_email' => ['required', 'email']]);

        return response()->json(Order::with('items')->where('order_number', $data['order_number'])->where('customer_email', $data['customer_email'])->firstOrFail());
    }

    public function customerStatus(): JsonResponse
    {
        $user = Auth::user();
        $customer = $user instanceof User && ! $user->is_admin ? $user : null;

        return response()->json([
            'authenticated' => $customer !== null,
            'customer' => $customer?->only(['id', 'name', 'email']),
        ]);
    }

    public function customerRegister(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);
        $customer = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'is_admin' => false,
        ]);
        Auth::login($customer);
        $request->session()->regenerate();

        return response()->json(['customer' => $customer->only(['id', 'name', 'email'])], 201);
    }

    public function customerLogin(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($data) || Auth::user()?->is_admin) {
            Auth::logout();

            return response()->json(['message' => 'Email or password is incorrect.'], 422);
        }
        $request->session()->regenerate();

        return response()->json(['customer' => Auth::user()->only(['id', 'name', 'email'])]);
    }

    public function customerLogout(Request $request): JsonResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['ok' => true]);
    }

    public function customerOrders(): JsonResponse
    {
        $customer = $this->requireCustomer();

        return response()->json(Order::with('items')->where('user_id', $customer->id)->latest()->limit(25)->get());
    }

    public function adminLogin(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'string', 'max:190'], 'password' => ['required', 'string']]);
        $user = User::query()
            ->where('email', $data['email'])
            ->orWhere('name', $data['email'])
            ->first();

        if (! $user?->is_admin || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Those admin credentials were not accepted.'], 422);
        }

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json(['name' => $user->name]);
    }

    public function adminLogout(Request $request): JsonResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['ok' => true]);
    }

    public function adminStatus(): JsonResponse
    {
        return response()->json(['authenticated' => (bool) Auth::user()?->is_admin]);
    }

    public function adminFoods(): JsonResponse
    {
        $this->requireAdmin();

        return response()->json(FoodItem::query()->orderByDesc('created_at')->get());
    }

    public function saveFood(Request $request, ?FoodItem $food = null): JsonResponse
    {
        $this->requireAdmin();
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'], 'category' => ['required', 'string', 'max:80'],
            'description' => ['nullable', 'string', 'max:500'], 'price' => ['required', 'integer', 'min:1', 'max:10000000'],
            'image_url' => ['nullable', 'url', 'max:500'], 'is_available' => ['sometimes', 'boolean'],
        ]);
        $data['is_available'] = $data['is_available'] ?? true;
        if ($food?->exists) {
            $food->update($data);
        } else {
            $food = FoodItem::create($data);
        }

        return response()->json($food, $food->wasRecentlyCreated ? 201 : 200);
    }

    public function deleteFood(FoodItem $food): JsonResponse
    {
        $this->requireAdmin();
        $food->delete();

        return response()->json(['ok' => true]);
    }

    public function adminOrders(): JsonResponse
    {
        $this->requireAdmin();

        return response()->json(Order::with('items')->latest()->limit(100)->get());
    }

    public function updateOrder(Request $request, Order $order): JsonResponse
    {
        $this->requireAdmin();
        $data = $request->validate(['status' => ['required', Rule::in(['received', 'preparing', 'ready', 'delivered', 'cancelled'])]]);
        $order->update($data);

        return response()->json($order->load('items'));
    }

    private function requireAdmin(): void
    {
        abort_unless(Auth::user()?->is_admin, 403, 'Admin access is required.');
    }

    private function requireCustomer(): User
    {
        $user = Auth::user();
        abort_unless($user instanceof User && ! $user->is_admin, 401, 'Sign in to your customer account first.');

        return $user;
    }
}
