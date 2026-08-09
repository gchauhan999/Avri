<?php

namespace App\Filament\Resources\AdminUsers\Schemas;

use App\Models\AdminUser;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class AdminUserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')->required()->maxLength(120),
                TextInput::make('email')
                    ->email()
                    ->required()
                    ->maxLength(255)
                    ->unique(ignoreRecord: true),
                TextInput::make('password_hash')
                    ->label('Password')
                    ->password()
                    ->revealable()
                    ->minLength(12)
                    ->maxLength(200)
                    // The model casts this to `hashed`, so the plain value
                    // never reaches the database.
                    ->required(fn (string $operation) => $operation === 'create')
                    // Blank on edit means "leave it alone" rather than "set the
                    // password to an empty string".
                    ->dehydrated(fn (?string $state) => filled($state))
                    ->helperText('At least 12 characters. Leave blank to keep the current one.'),
                Select::make('role')
                    ->options(array_combine(AdminUser::ROLES, ['Super admin', 'Editor']))
                    ->default('editor')
                    ->required()
                    ->helperText('Only a super admin can manage accounts.'),
                Toggle::make('is_active')
                    ->label('Can sign in')
                    ->default(true)
                    ->helperText('Turning this off locks the account out immediately.'),
                Toggle::make('must_change_password')
                    ->label('Force a new password at next sign-in')
                    ->helperText('Use this after setting a password on someone\'s behalf.'),
            ])
            ->columns(2);
    }
}
