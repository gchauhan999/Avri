<?php

namespace App\Filament\Resources\Applications\Tables;

use App\Jobs\SendApplicationNotification;
use App\Models\Application;
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
use Illuminate\Support\Facades\Storage;

class ApplicationsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('full_name')
                    ->label('Applicant')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('job_title_snapshot')
                    ->label('Applied for')
                    ->badge()
                    ->searchable(),
                TextColumn::make('phone')
                    ->searchable(['phone', 'phone_normalised'])
                    ->url(fn (Application $r) => 'tel:'.$r->phone_normalised),
                TextColumn::make('email')
                    ->searchable()
                    ->url(fn (Application $r) => 'mailto:'.$r->email)
                    ->toggleable(),
                TextColumn::make('experience_years')
                    ->label('Exp.')
                    ->suffix(' yrs')
                    ->placeholder('—')
                    ->toggleable(),
                TextColumn::make('current_company')
                    ->label('Company')
                    ->searchable()
                    ->placeholder('—')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state) => match ($state) {
                        'hired' => 'success',
                        'shortlisted', 'interviewing' => 'info',
                        'rejected' => 'danger',
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
                SelectFilter::make('status')->options(array_combine(
                    Application::STATUSES,
                    ['New', 'Shortlisted', 'Interviewing', 'Rejected', 'Hired']
                )),
                SelectFilter::make('job')->relationship('job', 'title')->label('Role'),
            ])
            ->recordActions([
                Action::make('resume')
                    ->label('CV')
                    ->icon(Heroicon::OutlinedArrowDownTray)
                    ->url(fn (Application $r) => route('applications.resume', $r))
                    // A normal navigation, so the browser saves the file rather
                    // than holding it in the tab.
                    ->openUrlInNewTab()
                    ->visible(fn (Application $r) => Storage::disk('resumes')->exists($r->resume_path)),

                /*
                 * Retry a notification that failed. Manual rather than
                 * automatic-only: the usual cause is a fixed configuration
                 * problem, and waiting for a sweeper is a poor experience when
                 * somebody is standing there.
                 */
                Action::make('resend')
                    ->label('Resend')
                    ->icon(Heroicon::OutlinedEnvelope)
                    ->requiresConfirmation()
                    ->visible(fn (Application $r) => $r->email_status !== 'sent')
                    ->action(function (Application $r) {
                        SendApplicationNotification::dispatch($r->id);

                        Notification::make()
                            ->title('Queued for sending')
                            ->body('The notification will go out with the next queue run.')
                            ->success()
                            ->send();
                    }),

                EditAction::make()->label('Notes'),
                DeleteAction::make()
                    ->modalDescription(
                        'The CV is deleted with the record. Keeping personal data after the '.
                        'application is gone would be both pointless and a retention problem.'
                    ),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
