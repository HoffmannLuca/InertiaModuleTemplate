<?php

namespace AaaModuleTemplateZzz\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class PageController
{
    public function __invoke(): Response
    {
        return Inertia::render(config('aaa_module_template_zzz.web.component'), [
            'module' => [
                'name' => 'aaa-module-template-zzz',
            ],
        ]);
    }
}
