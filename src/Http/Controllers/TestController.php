<?php

namespace AaaModuleTemplateZzz\Http\Controllers;

use AaaModuleTemplateZzz\Data\Test as TestData;
use AaaModuleTemplateZzz\Enums\Test as TestEnum;
use AaaModuleTemplateZzz\Models\Test;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TestController
{
    public function index(): Response
    {
        return Inertia::render('AaaModuleTemplateZzz/Tests/Index', [
            'tests' => Test::query()
                ->latest('id')
                ->get()
                ->map(fn (Test $test): array => $this->serialize($test)),
            'createUrl' => route('aaa-module-template-zzz.web.tests.create'),
        ]);
    }

    public function create(): Response
    {
        return $this->form();
    }

    public function store(Request $request): RedirectResponse
    {
        Test::query()->create($this->validated($request));

        return redirect()->route('aaa-module-template-zzz.web.tests.index');
    }

    public function edit(Test $test): Response
    {
        return $this->form($test);
    }

    public function update(Request $request, Test $test): RedirectResponse
    {
        $test->update($this->validated($request));

        return redirect()->route('aaa-module-template-zzz.web.tests.index');
    }

    public function destroy(Test $test): RedirectResponse
    {
        $test->delete();

        return redirect()->route('aaa-module-template-zzz.web.tests.index');
    }

    private function form(?Test $test = null): Response
    {
        return Inertia::render('AaaModuleTemplateZzz/Tests/Edit', [
            'testRecord' => $test ? $this->serialize($test) : null,
            'testOptions' => array_map(
                fn (TestEnum $case): array => ['label' => $case->name, 'value' => $case->value],
                TestEnum::cases(),
            ),
            'submitUrl' => $test
                ? route('aaa-module-template-zzz.web.tests.update', $test)
                : route('aaa-module-template-zzz.web.tests.store'),
            'indexUrl' => route('aaa-module-template-zzz.web.tests.index'),
        ]);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'age' => ['required', 'integer', 'min:0', 'max:150'],
            'test' => ['required', Rule::enum(TestEnum::class)],
        ]);
    }

    private function serialize(Test $test): array
    {
        return [
            'id' => $test->getKey(),
            ...(array) new TestData($test->name, $test->age, $test->test),
            'links' => [
                'edit' => route('aaa-module-template-zzz.web.tests.edit', $test),
                'destroy' => route('aaa-module-template-zzz.web.tests.destroy', $test),
            ],
        ];
    }
}
