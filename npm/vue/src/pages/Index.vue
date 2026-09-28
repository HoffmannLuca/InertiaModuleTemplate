<script setup lang="ts">
import { Link } from '@inertiajs/vue3'

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
  <main>
    <h1>{{ module.name }}</h1>
    <p>The Inertia module page was loaded from the module's npm package.</p>
    <Link :href="testsUrl">Open example CRUD</Link>
  </main>
</template>
