<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3'
import type { Test, TestEnum } from '../../generated/backend'

interface TestRecord extends Test {
  id: number
  links: {
    edit: string
    destroy: string
  }
}

defineProps<{
  tests: TestRecord[]
  createUrl: string
}>()

function destroy(record: TestRecord): void {
  if (window.confirm(`Delete ${record.name}?`)) {
    router.delete(record.links.destroy)
  }
}

function enumLabel(value: TestEnum): string {
  return Object.entries({ ONE: 'One', TWO: 'Two', THREE: 'Three' })
    .find(([, enumValue]) => enumValue === value)?.[0] ?? value
}
</script>

<template>
  <main>
    <header>
      <h1>Example tests</h1>
      <Link :href="createUrl">Create test</Link>
    </header>

    <p v-if="tests.length === 0">No records yet.</p>

    <table v-else>
      <thead>
        <tr>
          <th>Name</th>
          <th>Age</th>
          <th>Enum</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in tests" :key="record.id">
          <td>{{ record.name }}</td>
          <td>{{ record.age }}</td>
          <td>{{ enumLabel(record.test) }}</td>
          <td>
            <Link :href="record.links.edit">Edit</Link>
            <button type="button" @click="destroy(record)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </main>
</template>
