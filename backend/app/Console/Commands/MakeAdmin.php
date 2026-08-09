<?php

namespace App\Console\Commands;

use App\Models\AdminUser;
use Illuminate\Console\Command;

use function Laravel\Prompts\confirm;
use function Laravel\Prompts\password;
use function Laravel\Prompts\select;
use function Laravel\Prompts\text;

/**
 * Creates an admin account interactively.
 *
 * Prompts rather than taking arguments, so the password never lands in `.env`,
 * shell history, a process listing or a backup. It is not echoed as it is
 * typed.
 */
class MakeAdmin extends Command
{
    protected $signature = 'avri:make-admin';

    protected $description = 'Create an admin account for the panel';

    public function handle(): int
    {
        $this->newLine();
        $this->info('Create an Avri Energy admin');
        $this->newLine();

        $name = text(
            label: 'Full name',
            required: true,
            validate: fn (string $value) => mb_strlen(trim($value)) < 2
                ? 'Please enter a name.'
                : null,
        );

        $email = mb_strtolower(trim(text(
            label: 'Email',
            required: true,
            validate: function (string $value) {
                $value = mb_strtolower(trim($value));

                if (! filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    return 'That is not a valid email address.';
                }

                return AdminUser::where('email', $value)->exists()
                    ? 'That address already has an account.'
                    : null;
            },
        )));

        $secret = password(
            label: 'Password',
            required: true,
            validate: fn (string $value) => mb_strlen($value) < 12
                ? 'Use at least 12 characters.'
                : null,
        );

        if (password(label: 'Confirm password', required: true) !== $secret) {
            $this->error('Those passwords do not match. Nothing was created.');

            return self::FAILURE;
        }

        $role = select(
            label: 'Role',
            options: ['super_admin' => 'Super admin', 'editor' => 'Editor'],
            default: 'super_admin',
        );

        $mustChange = confirm(
            label: 'Force a password change at first sign-in?',
            default: false,
            hint: 'Say yes if you are setting this password on someone else\'s behalf.',
        );

        AdminUser::create([
            'name' => trim($name),
            'email' => $email,
            // The model casts this to `hashed`, so the plain value never
            // reaches the database.
            'password_hash' => $secret,
            'role' => $role,
            'is_active' => true,
            'must_change_password' => $mustChange,
        ]);

        $this->newLine();
        $this->info("Created {$role} {$email}.");
        $this->line('Sign in at '.rtrim(config('app.url'), '/').'/admin');
        $this->newLine();

        return self::SUCCESS;
    }
}
