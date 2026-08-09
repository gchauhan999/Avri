<?php

namespace App\Filament\Resources\AdminUsers\Tables;

use App\Models\AdminUser;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class AdminUsersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->searchable()->sortable(),
                TextColumn::make('email')->searchable()->sortable(),
                TextColumn::make('role')
                    ->badge()
                    ->color(fn (string $state) => $state === 'super_admin' ? 'success' : 'gray')
                    ->formatStateUsing(fn (string $state) => $state === 'super_admin' ? 'Super admin' : 'Editor'),
                IconColumn::make('is_active')->label('Active')->boolean(),
                IconColumn::make('must_change_password')
                    ->label('Must reset')
                    ->boolean()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('last_login_at')
                    ->label('Last signed in')
                    ->dateTime('j M Y, g:i a')
                    ->timezone('Asia/Kolkata')
                    ->placeholder('Never')
                    ->sortable(),
            ])
            ->defaultSort('name')
            ->recordActions([
                EditAction::make(),
                DeleteAction::make()
                    // Locking yourself out of the only panel is a bad afternoon.
                    ->visible(fn (AdminUser $record) => $record->id !== auth()->id()),
            ]);
    }
}
