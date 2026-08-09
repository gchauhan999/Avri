<?php

namespace App\Filament\Resources\Enquiries\Tables;

use App\Jobs\SendEnquiryNotification;
use App\Models\Enquiry;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Notifications\Notification;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class EnquiriesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('kind')
                    ->label('Type')
                    ->badge()
                    ->formatStateUsing(fn (string $state) => $state === 'quote_request' ? 'Quote' : 'Enquiry')
                    ->color(fn (string $state) => $state === 'quote_request' ? 'info' : 'gray'),
                TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('company')
                    ->searchable()
                    ->placeholder('—')
                    ->toggleable(),
                TextColumn::make('phone')
                    ->searchable(['phone', 'phone_normalised'])
                    ->url(fn (Enquiry $r) => 'tel:'.$r->phone_normalised),
                TextColumn::make('subject')
                    ->limit(30)
                    ->placeholder('—')
                    ->toggleable(),
                TextColumn::make('service')
                    ->badge()
                    ->placeholder('—')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state) => match ($state) {
                        'won' => 'success',
                        'lost', 'spam' => 'danger',
                        'contacted', 'quoted' => 'info',
                        default => 'warning',
                    })
                    ->sortable(),
                TextColumn::make('email_status')
                    ->label('Notified')
                    ->badge()
                    ->color(fn (string $state) => match ($state) {
                        'sent' => 'success',
                        'failed' => 'danger',
                        default => 'gray',
                    })
                    ->toggleable(),
                TextColumn::make('created_at')
                    ->label('Received')
                    ->dateTime('j M Y, g:i a')
                    ->timezone('Asia/Kolkata')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('kind')
                    ->label('Type')
                    ->options(['enquiry' => 'Enquiry', 'quote_request' => 'Quote request']),
                SelectFilter::make('status')->options(array_combine(
                    Enquiry::STATUSES,
                    ['New', 'Contacted', 'Quoted', 'Won', 'Lost', 'Spam']
                )),
            ])
            ->recordActions([
                Action::make('resend')
                    ->label('Resend')
                    ->icon(Heroicon::OutlinedEnvelope)
                    ->requiresConfirmation()
                    ->visible(fn (Enquiry $r) => $r->email_status !== 'sent')
                    ->action(function (Enquiry $r) {
                        SendEnquiryNotification::dispatch($r->id);

                        Notification::make()
                            ->title('Queued for sending')
                            ->success()
                            ->send();
                    }),
                EditAction::make()->label('Open'),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->emptyStateHeading('Nothing yet')
            ->emptyStateDescription('Enquiries from the website land here.');
    }
}
