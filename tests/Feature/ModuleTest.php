<?php

use AaaModuleTemplateZzz\Enums\Test as TestEnum;
use AaaModuleTemplateZzz\Models\Test;
use Illuminate\Support\Facades\Schema;

it('exposes the status endpoint', function (): void {
    $this->getJson('/api/aaa-module-template-zzz/status')
        ->assertOk()
        ->assertJsonPath('data.status', 'ok');
});

it('exposes the inertia web page', function (): void {
    $this->get('/aaa-module-template-zzz', ['X-Inertia' => 'true'])
        ->assertOk()
        ->assertJsonPath('component', 'AaaModuleTemplateZzz/Index')
        ->assertJsonPath('props.module.name', 'aaa-module-template-zzz');
});

it('runs the package migrations', function (): void {
    $this->artisan('migrate')->assertSuccessful();

    expect(Schema::hasTable('aaa_module_template_zzz_items'))->toBeTrue();
    expect(Schema::hasTable('aaa_module_template_zzz_tests'))->toBeTrue();
});

it('renders the example test CRUD index through inertia', function (): void {
    $this->artisan('migrate')->assertSuccessful();

    Test::query()->create([
        'name' => 'First record',
        'age' => 30,
        'test' => TestEnum::ONE,
    ]);

    $this->get('/aaa-module-template-zzz/tests', ['X-Inertia' => 'true'])
        ->assertOk()
        ->assertJsonPath('component', 'AaaModuleTemplateZzz/Tests/Index')
        ->assertJsonPath('props.tests.0.name', 'First record')
        ->assertJsonPath('props.tests.0.test', 'One');
});

it('creates an example test record', function (): void {
    $this->artisan('migrate')->assertSuccessful();

    $this->post('/aaa-module-template-zzz/tests', [
        'name' => 'Created record',
        'age' => 24,
        'test' => TestEnum::TWO->value,
    ])->assertRedirect('/aaa-module-template-zzz/tests');

    $this->assertDatabaseHas('aaa_module_template_zzz_tests', [
        'name' => 'Created record',
        'age' => 24,
        'test' => TestEnum::TWO->value,
    ]);
});

it('updates and deletes an example test record', function (): void {
    $this->artisan('migrate')->assertSuccessful();

    $test = Test::query()->create([
        'name' => 'Original record',
        'age' => 20,
        'test' => TestEnum::ONE,
    ]);

    $this->put("/aaa-module-template-zzz/tests/{$test->getKey()}", [
        'name' => 'Updated record',
        'age' => 21,
        'test' => TestEnum::THREE->value,
    ])->assertRedirect('/aaa-module-template-zzz/tests');

    $this->assertDatabaseHas('aaa_module_template_zzz_tests', [
        'id' => $test->getKey(),
        'name' => 'Updated record',
        'test' => TestEnum::THREE->value,
    ]);

    $this->delete("/aaa-module-template-zzz/tests/{$test->getKey()}")
        ->assertRedirect('/aaa-module-template-zzz/tests');

    $this->assertDatabaseMissing('aaa_module_template_zzz_tests', [
        'id' => $test->getKey(),
    ]);
});
