#!/usr/bin/env bash

set -euo pipefail

readonly TEMPLATE_KEBAB='aaa-module-template-zzz'
readonly TEMPLATE_SNAKE='aaa_module_template_zzz'
readonly TEMPLATE_UPPER_SNAKE='AAA_MODULE_TEMPLATE_ZZZ'
readonly TEMPLATE_PASCAL='AaaModuleTemplateZzz'
readonly TEMPLATE_TITLE='Aaa Module Template Zzz'

usage() {
    echo "Usage: ./create.sh <module-name>" >&2
    echo "Example: ./create.sh customer-portal" >&2
}

if [[ $# -ne 1 ]]; then
    usage
    exit 1
fi

readonly MODULE_KEBAB="$1"

if [[ ! "$MODULE_KEBAB" =~ ^[a-z][a-z0-9]*(-[a-z0-9]+)*$ ]]; then
    echo 'Error: module-name must be a lowercase kebab-case slug.' >&2
    exit 1
fi

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly BUILD_DIR="$SCRIPT_DIR/build"
readonly TARGET_DIR="$BUILD_DIR/$MODULE_KEBAB"
readonly MODULE_SNAKE="${MODULE_KEBAB//-/_}"
readonly MODULE_PASCAL="$(php -r 'echo str_replace(" ", "", ucwords(str_replace("-", " ", $argv[1])));' "$MODULE_KEBAB")"
readonly MODULE_TITLE="$(php -r 'echo ucwords(str_replace("-", " ", $argv[1]));' "$MODULE_KEBAB")"
readonly MODULE_UPPER_SNAKE="$(php -r 'echo strtoupper(str_replace("-", "_", $argv[1]));' "$MODULE_KEBAB")"

if [[ -e "$TARGET_DIR" ]]; then
    echo "Error: target already exists: $TARGET_DIR" >&2
    exit 1
fi

mkdir -p "$BUILD_DIR"

rsync -a \
    --exclude '/.git' \
    --exclude '/build' \
    --exclude '/composer.lock' \
    --exclude '/vendor' \
    --exclude '/npm/vue/node_modules' \
    --exclude '/npm/vue/dist' \
    --exclude '/.phpunit.cache' \
    --exclude '/.phpunit.result.cache' \
    "$SCRIPT_DIR/" "$TARGET_DIR/"

CREATE_TARGET="$TARGET_DIR" \
CREATE_TEMPLATE_KEBAB="$TEMPLATE_KEBAB" \
CREATE_TEMPLATE_SNAKE="$TEMPLATE_SNAKE" \
CREATE_TEMPLATE_UPPER_SNAKE="$TEMPLATE_UPPER_SNAKE" \
CREATE_TEMPLATE_PASCAL="$TEMPLATE_PASCAL" \
CREATE_TEMPLATE_TITLE="$TEMPLATE_TITLE" \
CREATE_MODULE_KEBAB="$MODULE_KEBAB" \
CREATE_MODULE_SNAKE="$MODULE_SNAKE" \
CREATE_MODULE_UPPER_SNAKE="$MODULE_UPPER_SNAKE" \
CREATE_MODULE_PASCAL="$MODULE_PASCAL" \
CREATE_MODULE_TITLE="$MODULE_TITLE" \
php <<'PHP'
<?php

declare(strict_types=1);

$target = requireEnvironmentVariable('CREATE_TARGET');
$replacements = [
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
PHP

echo "Created module template: $TARGET_DIR"
echo "  slug:      $MODULE_KEBAB"
echo "  namespace: $MODULE_PASCAL"
echo "  title:     $MODULE_TITLE"
echo "  snake:     $MODULE_SNAKE"
echo 'Run composer install and npm install in npm/vue to install fresh dependencies.'
