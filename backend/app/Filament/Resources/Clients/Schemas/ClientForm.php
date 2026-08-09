<?php

namespace App\Filament\Resources\Clients\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class ClientForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('The company')
                    ->schema([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(180)
                            ->live(onBlur: true)
                            // Only fill the slug while creating. Changing it on
                            // an existing client would break any link already
                            // shared.
                            ->afterStateUpdated(function (Get $get, $state, $set, ?string $operation) {
                                if ($operation === 'create') {
                                    $set('slug', Str::slug((string) $state));
                                }
                            }),
                        TextInput::make('slug')
                            ->required()
                            ->maxLength(200)
                            ->unique(ignoreRecord: true)
                            ->helperText('Used in URLs. Changing it breaks existing links.'),
                        TextInput::make('website_url')
                            ->label('Website')
                            ->url()
                            ->maxLength(300)
                            ->placeholder('https://'),
                        TextInput::make('sector')->maxLength(120),
                        FileUpload::make('logo_path')
                            ->label('Logo')
                            ->disk('uploads')
                            ->directory('clients')
                            ->image()
                            ->imageEditor()
                            ->maxSize((int) (config('avri.uploads.max_image_bytes') / 1024))
                            // SVG is deliberately absent: it is a document that
                            // can carry script, and it would be served from our
                            // own domain.
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                            ->helperText('PNG, JPEG or WebP. A mark on white works best.'),
                        TextInput::make('sort_order')
                            ->numeric()
                            ->default(0)
                            ->helperText('Lower numbers appear first.'),
                    ])
                    ->columns(2),

                Section::make('Permission to show the logo')
                    ->description(
                        'Publishing a company logo without written permission is a trademark '.
                        'risk, so this is recorded rather than assumed.'
                    )
                    ->schema([
                        Toggle::make('is_authorized')
                            ->label('We hold written permission')
                            ->live()
                            ->helperText('Turning this off also unpublishes the client.'),
                        Textarea::make('authorization_note')
                            ->label('How permission was given')
                            ->rows(2)
                            ->maxLength(400)
                            ->placeholder('e.g. logo use approved by email from R. Kumar, 4 March 2026')
                            // The note is the evidence. Authorised without it
                            // is just a tick box, which is the thing this
                            // section exists to avoid.
                            ->required(fn (Get $get) => (bool) $get('is_authorized'))
                            ->visible(fn (Get $get) => (bool) $get('is_authorized')),
                        Toggle::make('is_published')
                            ->label('Show on the website')
                            ->disabled(fn (Get $get) => ! $get('is_authorized'))
                            ->helperText(fn (Get $get) => $get('is_authorized')
                                ? null
                                : 'Available once permission is recorded above.'),
                    ]),
            ]);
    }
}
