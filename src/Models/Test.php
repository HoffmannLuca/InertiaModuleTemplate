<?php

namespace AaaModuleTemplateZzz\Models;

use AaaModuleTemplateZzz\Enums\Test as TestEnum;
use Illuminate\Database\Eloquent\Model;

class Test extends Model
{
    protected $table = 'aaa_module_template_zzz_tests';

    protected $fillable = [
        'name',
        'age',
        'test',
    ];

    protected function casts(): array
    {
        return [
            'age' => 'integer',
            'test' => TestEnum::class,
        ];
    }
}
