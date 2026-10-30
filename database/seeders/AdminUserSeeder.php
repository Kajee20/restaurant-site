<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = config('admin.email');
        $password = config('admin.password');
        if (! $email || ! $password) {
            $this->command?->warn('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before creating the admin account.');

            return;
        }

        User::updateOrCreate(['email' => $email], [
            'name' => config('admin.name'),
            'password' => $password,
            'is_admin' => true,
        ]);
    }
}
