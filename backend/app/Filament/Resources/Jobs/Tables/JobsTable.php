<?php

namespace App\Filament\Resources\Jobs\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class JobsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('title')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('department')
                    ->badge()
                    ->placeholder('—')
                    ->toggleable(),
                TextColumn::make('location')
                    ->limit(30)
                    ->searchable()
                    ->toggleable(),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state) => match ($state) {
                        'open' => 'success',
                        'closed' => 'danger',
                        default => 'warning',
                    })
                    ->sortable(),
                TextColumn::make('openings')
                    ->label('Posts')
                    ->toggleable(isToggledHiddenByDefault: true),
                // So the list can lead straight to the people who applied.
                TextColumn::make('applications_count')
                    ->label('Applicants')
                    ->counts('applications')
                    ->sortable(),
                TextColumn::make('closes_at')
                    ->label('Closes')
                    ->date('j M Y')
                    ->placeholder('No end date')
                    ->sortable(),
                TextColumn::make('created_at')
                    ->label('Added')
                    ->since()
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('status')
                    ->options(['draft' => 'Draft', 'open' => 'Open', 'closed' => 'Closed']),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make()
                    // Applications survive: the foreign key is ON DELETE SET
                    // NULL and each row keeps the job title it was sent for.
                    ->modalDescription(
                        'Applications for this role are kept — they will simply no longer be linked to it.'
                    ),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
