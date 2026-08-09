<?php

namespace App\Filament\Resources\PostCategories\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class PostCategoryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required()
                    ->maxLength(120)
                    ->unique(ignoreRecord: true)
                    ->live(onBlur: true)
                    ->afterStateUpdated(function ($state, $set, ?string $operation) {
                        if ($operation === 'create') {
                            $set('slug', Str::slug((string) $state));
                        }
                    }),
                TextInput::make('slug')
                    ->required()
                    ->maxLength(140)
                    ->unique(ignoreRecord: true)
                    ->helperText('Appears in the blog URL. Changing it breaks existing links.'),
                Textarea::make('description')
                    ->rows(2)
                    ->maxLength(300)
                    ->columnSpanFull(),
                TextInput::make('sort_order')
                    ->numeric()
                    ->default(0)
                    ->helperText('Lower numbers appear first in the filter rail.'),
            ])
            ->columns(2);
    }
}
