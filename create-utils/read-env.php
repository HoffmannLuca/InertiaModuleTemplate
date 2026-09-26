<?php

declare(strict_types=1);

if ($argc !== 3) {
    fwrite(STDERR, "Usage: php read-env.php <file> <key>\n");
    exit(1);
}

[$script, $file, $key] = $argv;
$values = parse_ini_file($file, false, INI_SCANNER_RAW);

if ($values === false) {
    fwrite(STDERR, "Unable to read environment file: {$file}\n");
    exit(1);
}

$value = $values[$key] ?? '';

if (! is_string($value)) {
    fwrite(STDERR, "Environment value must be a string: {$key}\n");
    exit(1);
}

echo trim($value);
