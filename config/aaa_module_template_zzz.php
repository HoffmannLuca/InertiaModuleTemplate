<?php

return [
    'enabled' => env('AAA_MODULE_TEMPLATE_ZZZ_ENABLED', true),

    'api' => [
        'enabled' => true,
        'prefix' => env('AAA_MODULE_TEMPLATE_ZZZ_ROUTE_PREFIX', 'api/aaa-module-template-zzz'),
        'middleware' => ['api'],
    ],

    'web' => [
        'enabled' => true,
        'prefix' => env('AAA_MODULE_TEMPLATE_ZZZ_WEB_ROUTE_PREFIX', 'aaa-module-template-zzz'),
        'middleware' => ['web'],
        'component' => 'AAAModuleTemplateZZZ/Index',
    ],
];
