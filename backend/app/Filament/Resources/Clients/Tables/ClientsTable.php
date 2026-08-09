<?php

namespace App\Filament\Resources\Clients\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class ClientsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('logo_path')
                    ->label('Logo')
                    ->disk('uploads')
                    ->height(32),
                TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('sector')
                    ->searchable()
                    ->toggleable(),
                IconColumn::make('is_authorized')
                    ->label('Permission')
                    ->boolean(),
                IconColumn::make('is_published')
                    ->label('Live')
                    ->boolean(),
                TextColumn::make('authorization_note')
                    ->label('Evidence')
                    ->limit(40)
                    ->tooltip(fn ($state) => $state)
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('authorized_at')
                    ->label('Authorised')
                    ->dateTime('j M Y')
                    ->timezone('Asia/Kolkata')
                    ->placeholder('—')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('sort_order')
                    ->label('Order')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('sort_order')
            ->filters([
                TernaryFilter::make('is_published')->label('On the website'),
                TernaryFilter::make('is_authorized')->label('Permission recorded'),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->emptyStateHeading('No clients yet')
            ->emptyStateDescription(
                'Add one once you hold written permission to show their logo.'
            );
    }
}
