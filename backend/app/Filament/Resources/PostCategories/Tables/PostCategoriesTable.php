<?php

namespace App\Filament\Resources\PostCategories\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class PostCategoriesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->searchable()->sortable(),
                TextColumn::make('slug')->searchable()->toggleable(),
                TextColumn::make('description')->limit(60)->placeholder('—')->toggleable(),
                TextColumn::make('posts_count')
                    ->label('Articles')
                    ->counts('posts')
                    ->sortable(),
                TextColumn::make('sort_order')->label('Order')->sortable(),
            ])
            ->defaultSort('sort_order')
            ->recordActions([
                EditAction::make(),
                // The foreign key is ON DELETE RESTRICT, so a category that
                // still holds articles cannot be removed. Saying so up front
                // beats a database error.
                DeleteAction::make()
                    ->modalDescription('A category that still has articles in it cannot be deleted.'),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
