<?php

namespace AAAModuleTemplateZZZ\Http\Controllers;

use Illuminate\Http\JsonResponse;

class StatusController
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'data' => [
                'name' => 'aaa-module-template-zzz',
                'status' => 'ok',
            ],
        ]);
    }
}
