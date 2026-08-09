<?php

namespace App\Filament\Resources\Enquiries;

use App\Filament\Resources\Enquiries\Pages\EditEnquiry;
use App\Filament\Resources\Enquiries\Pages\ListEnquiries;
use App\Filament\Resources\Enquiries\Schemas\EnquiryForm;
use App\Filament\Resources\Enquiries\Tables\EnquiriesTable;
use App\Models\Enquiry;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class EnquiryResource extends Resource
{
    protected static ?string $model = Enquiry::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedEnvelope;

    protected static string|\UnitEnum|null $navigationGroup = 'Inbox';

    protected static ?int $navigationSort = 1;

    protected static ?string $modelLabel = 'Enquiry';

    protected static ?string $pluralModelLabel = 'Enquiries';

    /**
     * These arrive from the website, never from here. A hand-made row would
     * have no CV and no source, and would sit in the list looking real.
     */
    public static function canCreate(): bool
    {
        return false;
    }

    /** The sidebar badge: how many still need looking at. */
    public static function getNavigationBadge(): ?string
    {
        $count = static::getModel()::where('status', 'new')->count();

        return $count > 0 ? (string) $count : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function form(Schema $schema): Schema
    {
        return EnquiryForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return EnquiriesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListEnquiries::route('/'),
            'edit' => EditEnquiry::route('/{record}/edit'),
        ];
    }
}
