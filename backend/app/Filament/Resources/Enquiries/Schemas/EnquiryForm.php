<?php

namespace App\Filament\Resources\Enquiries\Schemas;

use App\Models\Enquiry;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

/**
 * Working an enquiry.
 *
 * As with applications, what the sender wrote is shown but not editable — this
 * is a record of what arrived. Only the status and our own notes change.
 */
class EnquiryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Where this stands')
                    ->schema([
                        Select::make('status')
                            ->options(array_combine(Enquiry::STATUSES, [
                                'New', 'Contacted', 'Quoted', 'Won', 'Lost', 'Spam',
                            ]))
                            ->required(),
                        Textarea::make('admin_notes')
                            ->label('Internal notes')
                            ->rows(4)
                            ->maxLength(5000),
                    ]),

                Section::make('What they sent')
                    ->schema([
                        TextEntry::make('name'),
                        TextEntry::make('company')->placeholder('—'),
                        TextEntry::make('phone')->url(fn ($record) => 'tel:'.$record->phone_normalised),
                        TextEntry::make('email')
                            ->url(fn ($record) => $record->email ? 'mailto:'.$record->email : null)
                            ->placeholder('—'),
                        TextEntry::make('message')->columnSpanFull(),
                        TextEntry::make('created_at')
                            ->label('Received')
                            ->dateTime('j F Y, g:i a')
                            ->timezone('Asia/Kolkata'),
                        TextEntry::make('source_page')->label('Sent from')->placeholder('—'),
                    ])
                    ->columns(2),

                // Only meaningful for a quote request; hidden for a plain
                // enquiry, where every one of these is null.
                Section::make('Quote details')
                    ->visible(fn ($record) => $record?->kind === 'quote_request')
                    ->schema([
                        TextEntry::make('service')->placeholder('—'),
                        TextEntry::make('industry')->placeholder('—'),
                        TextEntry::make('product')->placeholder('—'),
                        TextEntry::make('location')->label('Site location')->placeholder('—'),
                        TextEntry::make('capacity')->placeholder('—'),
                        TextEntry::make('budget')->placeholder('—'),
                        TextEntry::make('timeline')->placeholder('—'),
                    ])
                    ->columns(3),

                Section::make('Notification')
                    ->collapsed()
                    ->schema([
                        TextEntry::make('email_status')->label('Status')->badge(),
                        TextEntry::make('email_attempts')->label('Attempts'),
                        TextEntry::make('email_error')->label('Last error')->placeholder('—')->columnSpanFull(),
                    ])
                    ->columns(2),
            ]);
    }
}
