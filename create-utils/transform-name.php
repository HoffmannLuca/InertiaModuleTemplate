<?php

declare(strict_types=1);

if ($argc !== 3) {
    fwrite(STDERR, "Usage: php transform-name.php <organization|pascal|title|upper-snake> <value>\n");
    exit(1);
}

[$script, $operation, $value] = $argv;

$result = match ($operation) {
    'organization' => trim((string) preg_replace('/[^a-z0-9]+/', '-', strtolower(trim($value))), '-'),
    'pascal' => str_replace(' ', '', ucwords(str_replace('-', ' ', $value))),
    'title' => ucwords(str_replace('-', ' ', $value)),
    'upper-snake' => strtoupper(str_replace('-', '_', $value)),
    default => null,
};

if ($result === null) {
    fwrite(STDERR, "Unknown name transformation: {$operation}\n");
    exit(1);
}

echo $result;
