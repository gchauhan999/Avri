<?php

namespace App\Filament\Resources\Posts\Schemas;

use App\Models\Post;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class PostForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('The article')
                    ->schema([
                        TextInput::make('title')
                            ->required()
                            ->maxLength(220)
                            ->live(onBlur: true)
                            ->afterStateUpdated(function ($state, $set, ?string $operation) {
                                // Only while creating: changing a published
                                // article's slug breaks every shared link and
                                // loses its search ranking.
                                if ($operation === 'create') {
                                    $set('slug', Str::slug((string) $state));
                                }
                            }),
                        TextInput::make('slug')
                            ->required()
                            ->maxLength(240)
                            ->unique(ignoreRecord: true)
                            ->helperText('The public URL. Changing it on a live article breaks links.'),
                        Select::make('category_id')
                            ->label('Category')
                            ->relationship('category', 'name')
                            ->required()
                            ->preload(),
                        Textarea::make('excerpt')
                            ->rows(2)
                            ->maxLength(400)
                            ->helperText('Shown on cards and in search results. Left blank, the opening lines are used.'),
                        RichEditor::make('body')
                            ->required()
                            ->columnSpanFull()
                            // The stored HTML is sanitised by the model on
                            // save, so whatever the editor produces is cleaned
                            // before it reaches the database.
                            ->helperText('Formatting is cleaned on save; scripts and inline styles are removed.'),
                    ])
                    ->columns(2),

                Section::make('Cover image')
                    ->schema([
                        FileUpload::make('cover_image_path')
                            ->label('Image')
                            ->disk('uploads')
                            ->directory('posts')
                            ->image()
                            ->imageEditor()
                            ->maxSize((int) (config('avri.uploads.max_image_bytes') / 1024))
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp']),
                        TextInput::make('cover_image_alt')
                            ->label('Describe the image')
                            ->maxLength(255)
                            ->helperText('Read aloud by screen readers, and shown if the image fails to load.'),
                    ])
                    ->columns(2),

                Section::make('Publishing')
                    ->schema([
                        Select::make('status')
                            ->options(array_combine(Post::STATUSES, ['Draft', 'Published', 'Archived']))
                            ->default('draft')
                            ->required(),
                        DateTimePicker::make('published_at')
                            ->label('Publish date')
                            ->seconds(false)
                            ->helperText('Leave blank to stamp the moment it is first published. A future date holds it back.'),
                        Toggle::make('is_featured')
                            ->label('Feature on the blog index')
                            ->helperText('Only one article can be featured; turning this on clears the others.'),
                    ])
                    ->columns(3),

                Section::make('Search engines')
                    ->collapsed()
                    ->schema([
                        TextInput::make('seo_title')->maxLength(200),
                        TextInput::make('seo_description')->maxLength(320),
                        TextInput::make('seo_keywords')->maxLength(400),
                        TextInput::make('canonical_url')
                            ->url()
                            ->maxLength(400)
                            ->helperText('Only if this article was first published elsewhere.'),
                    ])
                    ->columns(2),
            ]);
    }
}
