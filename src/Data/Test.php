<?php

namespace AaaModuleTemplateZzz\Data;

use AaaModuleTemplateZzz\Enums\Test as TestEnum;

class Test
{
    public function __construct(
        public string $name,
        public int $age,
        public TestEnum $test,
    ) {}
}
