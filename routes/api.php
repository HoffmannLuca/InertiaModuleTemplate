<?php

use AaaModuleTemplateZzz\Http\Controllers\StatusController;
use Illuminate\Support\Facades\Route;

if (config('aaa_module_template_zzz.api.enabled', true)) {
    Route::prefix(config('aaa_module_template_zzz.api.prefix'))
        ->middleware(config('aaa_module_template_zzz.api.middleware', ['api']))
        ->name('aaa-module-template-zzz.api.')
        ->group(function (): void {
            Route::get('/status', StatusController::class)->name('status');
        });
}
