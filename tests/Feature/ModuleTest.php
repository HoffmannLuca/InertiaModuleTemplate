<?php

use Illuminate\Support\Facades\Schema;

it('exposes the status endpoint', function (): void {
    $this->getJson('/api/aaa-module-template-zzz/status')
        ->assertOk()
        ->assertJsonPath('data.status', 'ok');
});

it('exposes the inertia web page', function (): void {
    $this->get('/aaa-module-template-zzz', ['X-Inertia' => 'true'])
        ->assertOk()
        ->assertJsonPath('component', 'AAAModuleTemplateZZZ/Index')
        ->assertJsonPath('props.module.name', 'aaa-module-template-zzz');
});

it('runs the package migrations', function (): void {
    $this->artisan('migrate')->assertSuccessful();

    expect(Schema::hasTable('aaa_module_template_zzz_items'))->toBeTrue();
});
