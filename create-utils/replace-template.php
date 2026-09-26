<?php

declare(strict_types=1);

$target = requireEnvironmentVariable('CREATE_TARGET');
$replacements = [
    requireEnvironmentVariable('CREATE_TEMPLATE_ORGANIZATION') => requireEnvironmentVariable('CREATE_ORGANIZATION'),
    requireEnvironmentVariable('CREATE_TEMPLATE_PASCAL') => requireEnvironmentVariable('CREATE_MODULE_PASCAL'),
    requireEnvironmentVariable('CREATE_TEMPLATE_TITLE') => requireEnvironmentVariable('CREATE_MODULE_TITLE'),
    requireEnvironmentVariable('CREATE_TEMPLATE_UPPER_SNAKE') => requireEnvironmentVariable('CREATE_MODULE_UPPER_SNAKE'),
    requireEnvironmentVariable('CREATE_TEMPLATE_SNAKE') => requireEnvironmentVariable('CREATE_MODULE_SNAKE'),
    requireEnvironmentVariable('CREATE_TEMPLATE_KEBAB') => requireEnvironmentVariable('CREATE_MODULE_KEBAB'),
];

$files = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($target, FilesystemIterator::SKIP_DOTS),
);

foreach ($files as $file) {
    if (! $file->isFile()) {
        continue;
    }

    $contents = file_get_contents($file->getPathname());

    if ($contents === false) {
        throw new RuntimeException("Unable to read {$file->getPathname()}");
    }

    if (str_contains($contents, "\0")) {
        continue;
    }

    $updated = str_replace(array_keys($replacements), array_values($replacements), $contents);

    if ($updated !== $contents && file_put_contents($file->getPathname(), $updated) === false) {
        throw new RuntimeException("Unable to write {$file->getPathname()}");
    }
}

$paths = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($target, FilesystemIterator::SKIP_DOTS),
    RecursiveIteratorIterator::CHILD_FIRST,
);

foreach ($paths as $path) {
    $oldPath = $path->getPathname();
    $newName = str_replace(array_keys($replacements), array_values($replacements), $path->getBasename());

    if ($newName === $path->getBasename()) {
        continue;
    }

    $newPath = $path->getPath().DIRECTORY_SEPARATOR.$newName;

    if (! rename($oldPath, $newPath)) {
        throw new RuntimeException("Unable to rename {$oldPath} to {$newPath}");
    }
}

function requireEnvironmentVariable(string $name): string
{
    $value = getenv($name);

    if ($value === false || $value === '') {
        throw new RuntimeException("Missing environment variable: {$name}");
    }

    return $value;
}
