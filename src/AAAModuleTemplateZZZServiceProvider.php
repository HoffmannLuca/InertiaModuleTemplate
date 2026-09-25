<?php

namespace AAAModuleTemplateZZZ;

use Illuminate\Support\ServiceProvider;

class AAAModuleTemplateZZZServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(
            __DIR__.'/../config/aaa_module_template_zzz.php',
            'aaa_module_template_zzz',
        );
    }

    public function boot(): void
    {
        $this->publishes([
            __DIR__.'/../config/aaa_module_template_zzz.php' => config_path('aaa_module_template_zzz.php'),
        ], 'aaa-module-template-zzz-config');

        $this->publishesMigrations([
            __DIR__.'/../database/migrations' => database_path('migrations'),
        ], 'aaa-module-template-zzz-migrations');

        $this->publishes([
            __DIR__.'/../lang' => lang_path('vendor/aaa-module-template-zzz'),
        ], 'aaa-module-template-zzz-translations');

        if (! config('aaa_module_template_zzz.enabled')) {
            return;
        }

        $this->loadMigrationsFrom(__DIR__.'/../database/migrations');
        $this->loadTranslationsFrom(__DIR__.'/../lang', 'aaa-module-template-zzz');
        $this->loadRoutesFrom(__DIR__.'/../routes/api.php');
        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
    }
}
