<?php

namespace App\Filament\Resources\Applications\Schemas;

use App\Models\Application;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

/**
 * Reviewing an application.
 *
 * Everything the applicant wrote is shown but not editable: this is a record of
 * what someone sent, and quietly correcting their phone number or their
 * covering note would make it a record of what we remember instead. Only the
 * two internal fields — where they are in the process, and our own notes — can
 * be changed.
 */
class ApplicationForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Where this stands')
                    ->schema([
                        Select::make('status')
                            ->options(array_combine(Application::STATUSES, [
                                'New', 'Shortlisted', 'Interviewing', 'Rejected', 'Hired',
                            ]))
                            ->required(),
                        Textarea::make('admin_notes')
                            ->label('Internal notes')
                            ->rows(4)
                            ->maxLength(5000)
                            ->helperText('Only visible here. Never shown to the applicant.'),
                    ]),

                Section::make('What they sent')
                    ->schema([
                        TextEntry::make('full_name')->label('Name'),
                        TextEntry::make('job_title_snapshot')->label('Applied for'),
                        TextEntry::make('phone')->url(fn ($record) => 'tel:'.$record->phone_normalised),
                        TextEntry::make('email')->url(fn ($record) => 'mailto:'.$record->email),
                        TextEntry::make('current_location')->label('Location')->placeholder('—'),
                        TextEntry::make('current_company')->label('Current company')->placeholder('—'),
                        TextEntry::make('experience_years')->label('Experience')->suffix(' years')->placeholder('—'),
                        TextEntry::make('notice_period')->label('Notice period')->placeholder('—'),
                        TextEntry::make('linkedin_url')
                            ->label('LinkedIn')
                            ->url(fn ($record) => $record->linkedin_url)
                            ->placeholder('—'),
                        TextEntry::make('created_at')
                            ->label('Received')
                            ->dateTime('j F Y, g:i a')
                            ->timezone('Asia/Kolkata'),
                        TextEntry::make('cover_letter')
                            ->label('Their note')
                            ->placeholder('—')
                            ->columnSpanFull(),
                        TextEntry::make('resume_original_name')
                            ->label('CV')
                            ->formatStateUsing(fn ($state, $record) => $state.' · '
                                .number_format($record->resume_size_bytes / 1024).' kB')
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

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
