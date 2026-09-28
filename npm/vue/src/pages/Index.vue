<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { Button } from '@starter-solutions/vue-ui/base/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@starter-solutions/vue-ui/base/card'

import { TestEnum, type Test } from '../generated/backend';

interface Props {
  module: {
    name: string
  }
  testsUrl: string
}
const test:Test = {
    name: 'gg',
    age: 122,
    test: 'One'
}

defineProps<Props>()
</script>

<template>
  <main class="mx-auto max-w-3xl p-6">
    <Card>
      <CardHeader>
        <CardTitle>{{ module.name }}</CardTitle>
        <CardDescription>
          The Inertia module page was loaded from the module's npm package.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button as-child>
          <Link :href="testsUrl">Open example CRUD</Link>
        </Button>
      </CardContent>
    </Card>
  </main>
</template>
