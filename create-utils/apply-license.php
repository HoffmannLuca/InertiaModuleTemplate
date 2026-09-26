<?php

declare(strict_types=1);

$target = requireEnvironmentVariable('CREATE_TARGET');
$license = requireEnvironmentVariable('CREATE_LICENSE');
$npmLicense = requireEnvironmentVariable('CREATE_NPM_LICENSE');
$organizationTitle = requireEnvironmentVariable('CREATE_ORGANIZATION_TITLE');

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

$licenseFile = $target.'/LICENSE.md';
$licenseText = file_get_contents($licenseFile);

if ($licenseText === false) {
    throw new RuntimeException("Unable to read {$licenseFile}");
}

$licenseText = str_replace('Aaa Organization Zzz', $organizationTitle, $licenseText);

if (file_put_contents($licenseFile, rtrim($licenseText).PHP_EOL) === false) {
    throw new RuntimeException("Unable to write {$licenseFile}");
}

function requireEnvironmentVariable(string $name): string
{
    $value = getenv($name);

    if ($value === false || $value === '') {
        throw new RuntimeException("Missing environment variable: {$name}");
    }

    return $value;
}
