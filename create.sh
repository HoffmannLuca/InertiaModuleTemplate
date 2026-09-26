#!/usr/bin/env bash

set -euo pipefail

readonly TEMPLATE_KEBAB='aaa-module-template-zzz'
readonly TEMPLATE_ORGANIZATION='aaa-organization-zzz'
readonly TEMPLATE_SNAKE='aaa_module_template_zzz'
readonly TEMPLATE_UPPER_SNAKE='AAA_MODULE_TEMPLATE_ZZZ'
readonly TEMPLATE_PASCAL='AaaModuleTemplateZzz'
readonly TEMPLATE_TITLE='Aaa Module Template Zzz'

usage() {
    echo "Usage: ./create.sh <module-name> [organization]" >&2
    echo "Example: ./create.sh customer-portal acme" >&2
}

confirm() {
    local answer

    read -r -p "$1 [Y/n] " answer
    answer="$(printf '%s' "$answer" | tr '[:upper:]' '[:lower:]')"

    [[ -z "$answer" || "$answer" == 'y' || "$answer" == 'yes' || "$answer" == 'j' || "$answer" == 'ja' ]]
}

choose_license() {
    local choice

    echo 'Choose a license:'
    echo '  1) MIT (default)'
    echo '  2) Apache-2.0'
    echo '  3) GPL-3.0-only'
    echo '  4) Proprietary'
    read -r -p 'License [1]: ' choice

    case "${choice:-1}" in
        1)
            SELECTED_LICENSE='MIT'
            NPM_LICENSE='MIT'
            LICENSE_FILE='MIT.md'
            ;;
        2)
            SELECTED_LICENSE='Apache-2.0'
            NPM_LICENSE='Apache-2.0'
            LICENSE_FILE='Apache-2.0.md'
            ;;
        3)
            SELECTED_LICENSE='GPL-3.0-only'
            NPM_LICENSE='GPL-3.0-only'
            LICENSE_FILE='GPL-3.0-only.md'
            ;;
        4)
            SELECTED_LICENSE='proprietary'
            NPM_LICENSE='UNLICENSED'
            LICENSE_FILE='Proprietary.md'
            ;;
        *)
            echo "Error: invalid license selection '$choice'." >&2
            exit 1
            ;;
    esac
}

if [[ $# -lt 1 || $# -gt 2 ]]; then
    usage
    exit 1
fi

readonly MODULE_KEBAB="$1"

ORGANIZATION_INPUT="${2:-}"

if [[ -z "$ORGANIZATION_INPUT" ]]; then
    read -r -p 'Organization/scope: ' ORGANIZATION_INPUT
fi

ORGANIZATION_KEBAB="$(php -r '$value = strtolower(trim($argv[1])); $value = preg_replace("/[^a-z0-9]+/", "-", $value); echo trim($value, "-");' "$ORGANIZATION_INPUT")"

if [[ "$ORGANIZATION_INPUT" != "$ORGANIZATION_KEBAB" ]]; then
    echo "Warning: organization normalized from '$ORGANIZATION_INPUT' to '$ORGANIZATION_KEBAB'." >&2
fi

readonly ORGANIZATION_KEBAB

if [[ ! "$MODULE_KEBAB" =~ ^[a-z][a-z0-9]*(-[a-z0-9]+)*$ ]]; then
    echo 'Error: module-name must be a lowercase kebab-case slug.' >&2
    exit 1
fi

if [[ -z "$ORGANIZATION_KEBAB" || ! "$ORGANIZATION_KEBAB" =~ ^[a-z][a-z0-9]*(-[a-z0-9]+)*$ ]]; then
    echo 'Error: unable to derive a valid organization scope.' >&2
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
    --exclude '/create.sh' \
    --exclude '/licenses' \
    --exclude '/README.md' \
    --exclude '/vendor' \
    --exclude '/npm/vue/node_modules' \
    --exclude '/npm/vue/dist' \
    --exclude '/.phpunit.cache' \
    --exclude '/.phpunit.result.cache' \
    "$SCRIPT_DIR/" "$TARGET_DIR/"

CREATE_TARGET="$TARGET_DIR" \
CREATE_TEMPLATE_KEBAB="$TEMPLATE_KEBAB" \
CREATE_TEMPLATE_ORGANIZATION="$TEMPLATE_ORGANIZATION" \
CREATE_TEMPLATE_SNAKE="$TEMPLATE_SNAKE" \
CREATE_TEMPLATE_UPPER_SNAKE="$TEMPLATE_UPPER_SNAKE" \
CREATE_TEMPLATE_PASCAL="$TEMPLATE_PASCAL" \
CREATE_TEMPLATE_TITLE="$TEMPLATE_TITLE" \
CREATE_MODULE_KEBAB="$MODULE_KEBAB" \
CREATE_ORGANIZATION="$ORGANIZATION_KEBAB" \
CREATE_MODULE_SNAKE="$MODULE_SNAKE" \
CREATE_MODULE_UPPER_SNAKE="$MODULE_UPPER_SNAKE" \
CREATE_MODULE_PASCAL="$MODULE_PASCAL" \
CREATE_MODULE_TITLE="$MODULE_TITLE" \
php <<'PHP'
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
PHP

mv "$TARGET_DIR/ModuleREADME.md" "$TARGET_DIR/README.md"

choose_license
cp "$SCRIPT_DIR/licenses/$LICENSE_FILE" "$TARGET_DIR/LICENSE.md"

CREATE_TARGET="$TARGET_DIR" \
CREATE_LICENSE="$SELECTED_LICENSE" \
CREATE_NPM_LICENSE="$NPM_LICENSE" \
CREATE_MODULE_TITLE="$MODULE_TITLE" \
php <<'PHP'
<?php

declare(strict_types=1);

$target = getenv('CREATE_TARGET');
$license = getenv('CREATE_LICENSE');
$npmLicense = getenv('CREATE_NPM_LICENSE');
$title = getenv('CREATE_MODULE_TITLE');

if ($target === false || $license === false || $npmLicense === false || $title === false) {
    throw new RuntimeException('Missing license configuration.');
}

$packageLicenses = [
    $target.'/composer.json' => $license,
    $target.'/npm/vue/package.json' => $npmLicense,
    $target.'/npm/vue/package-lock.json' => $npmLicense,
];

foreach ($packageLicenses as $file => $identifier) {
    $contents = file_get_contents($file);

    if ($contents === false) {
        throw new RuntimeException("Unable to read {$file}");
    }

    $updated = preg_replace(
        '/"license"\s*:\s*"[^"]+"/',
        '"license": "'.$identifier.'"',
        $contents,
        1,
    );

    if ($updated === null || file_put_contents($file, $updated) === false) {
        throw new RuntimeException("Unable to update {$file}");
    }
}

$licenseText = file_get_contents($target.'/LICENSE.md');

if ($licenseText !== false) {
    $licenseText = str_replace('Aaa Module Template Zzz', $title, $licenseText);
}

if ($licenseText === false || file_put_contents($target.'/LICENSE.md', rtrim($licenseText).PHP_EOL) === false) {
    throw new RuntimeException('Unable to write LICENSE.md');
}
PHP

INITIALIZED_GIT=false
INSTALLED_DEPENDENCIES=false

if confirm 'Initialize a Git repository and create an initial commit?'; then
    INITIAL_BRANCH="$(git config --get init.defaultBranch || true)"

    if [[ -z "$INITIAL_BRANCH" ]]; then
        INITIAL_BRANCH='main'
    fi

    git -C "$TARGET_DIR" init --initial-branch="$INITIAL_BRANCH"
    git -C "$TARGET_DIR" add .
    git -C "$TARGET_DIR" commit --no-gpg-sign -m 'Initial commit'
    INITIALIZED_GIT=true
fi

if confirm 'Run Composer and npm installs?'; then
    composer install --working-dir="$TARGET_DIR" --no-interaction
    npm --prefix "$TARGET_DIR/npm/vue" install
    INSTALLED_DEPENDENCIES=true
fi

if [[ "$INITIALIZED_GIT" == true && "$INSTALLED_DEPENDENCIES" == true ]]; then
    git -C "$TARGET_DIR" add composer.lock npm/vue/package-lock.json

    if ! git -C "$TARGET_DIR" diff --cached --quiet; then
        git -C "$TARGET_DIR" commit --amend --no-edit --no-gpg-sign
    fi
fi

echo "Created module template: $TARGET_DIR"
echo "  slug:      $MODULE_KEBAB"
echo "  scope:     $ORGANIZATION_KEBAB"
echo "  namespace: $MODULE_PASCAL"
echo "  title:     $MODULE_TITLE"
echo "  snake:     $MODULE_SNAKE"
echo "  license:   $SELECTED_LICENSE"

if [[ "$INITIALIZED_GIT" == true ]]; then
    echo "Initialized Git repository on '$INITIAL_BRANCH' and created initial commit."
fi

if [[ "$INSTALLED_DEPENDENCIES" == true ]]; then
    echo 'Installed Composer and npm dependencies.'
fi
