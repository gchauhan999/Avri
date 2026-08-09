<?php

namespace App\Filament\Resources\Jobs\Schemas;

use App\Models\Job;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class JobForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('The role')
                    ->schema([
                        TextInput::make('title')
                            ->required()
                            ->maxLength(200)
                            ->live(onBlur: true)
                            ->afterStateUpdated(function ($state, $set, ?string $operation) {
                                if ($operation === 'create') {
                                    $set('slug', Str::slug((string) $state));
                                }
                            }),
                        TextInput::make('slug')
                            ->required()
                            ->maxLength(220)
                            ->unique(ignoreRecord: true),
                        TextInput::make('department')->maxLength(120),
                        TextInput::make('location')
                            ->required()
                            ->maxLength(160),
                        Select::make('employment_type')
                            ->options(array_combine(Job::EMPLOYMENT_TYPES, [
                                'Full time', 'Part time', 'Contract', 'Internship',
                            ]))
                            ->default('full_time')
                            ->required(),
                        TextInput::make('openings')
                            ->numeric()
                            ->minValue(1)
                            ->default(1)
                            ->required(),
                        Textarea::make('summary')
                            ->required()
                            ->rows(2)
                            ->maxLength(500)
                            ->columnSpanFull()
                            ->helperText('One line. Shown on the card and used as the page description in search results.'),
                        RichEditor::make('description')
                            ->required()
                            ->columnSpanFull(),
                        TagsInput::make('responsibilities')
                            ->helperText('One per line. Press Enter after each.')
                            ->columnSpanFull(),
                        TagsInput::make('requirements')
                            ->helperText('One per line. Press Enter after each.')
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

                Section::make('Experience and pay')
                    ->description('All optional. What is filled in appears on the listing; what is not is simply left out.')
                    ->schema([
                        TextInput::make('experience_min')->label('Experience from')->numeric()->suffix('years'),
                        TextInput::make('experience_max')->label('Experience to')->numeric()->suffix('years'),
                        TextInput::make('salary_range')
                            ->label('Shown as')
                            ->maxLength(120)
                            ->placeholder('₹4–6 LPA')
                            ->helperText('Free text, for the card.'),
                        TextInput::make('salary_min')->numeric(),
                        TextInput::make('salary_max')->numeric(),
                        Select::make('salary_period')
                            ->options(['month' => 'Per month', 'year' => 'Per year'])
                            ->default('month')
                            ->helperText('The numbers above feed the structured data Google reads.'),
                    ])
                    ->columns(3),

                Section::make('Publishing')
                    ->schema([
                        Select::make('status')
                            ->options(array_combine(Job::STATUSES, ['Draft', 'Open', 'Closed']))
                            ->default('draft')
                            ->required(),
                        DatePicker::make('closes_at')
                            ->label('Closes on')
                            ->helperText(
                                'The role disappears from the website the day after this. '.
                                'Google penalises sites that leave expired openings live, so it is worth setting.'
                            ),
                        TextInput::make('seo_title')->maxLength(200),
                        TextInput::make('seo_description')->maxLength(320),
                    ])
                    ->columns(2),
            ]);
    }
}
