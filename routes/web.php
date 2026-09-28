<?php

use AaaModuleTemplateZzz\Http\Controllers\PageController;
use AaaModuleTemplateZzz\Http\Controllers\TestController;
use Illuminate\Support\Facades\Route;

if (config('aaa_module_template_zzz.web.enabled', true)) {
    Route::prefix(config('aaa_module_template_zzz.web.prefix'))
        ->middleware(config('aaa_module_template_zzz.web.middleware', ['web']))
        ->name('aaa-module-template-zzz.web.')
        ->group(function (): void {
            Route::get('/', PageController::class)->name('index');
            Route::resource('tests', TestController::class)
                ->except('show');
        });
}
