<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3'
import { Badge } from '@starter-solutions/vue-ui/base/badge'
import { Button } from '@starter-solutions/vue-ui/base/button'
import { Card, CardContent, CardHeader, CardTitle } from '@starter-solutions/vue-ui/base/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@starter-solutions/vue-ui/base/table'
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
  <main class="mx-auto max-w-5xl space-y-6 p-6">
    <header class="flex items-center justify-between gap-4">
      <h1 class="text-2xl font-semibold">Example tests</h1>
      <Button as-child>
        <Link :href="createUrl">Create test</Link>
      </Button>
    </header>

    <Card>
      <CardHeader>
        <CardTitle>Records</CardTitle>
      </CardHeader>
      <CardContent>
        <p v-if="tests.length === 0" class="text-sm text-muted-foreground">No records yet.</p>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Enum</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="record in tests" :key="record.id">
              <TableCell class="font-medium">{{ record.name }}</TableCell>
              <TableCell>{{ record.age }}</TableCell>
              <TableCell><Badge variant="secondary">{{ enumLabel(record.test) }}</Badge></TableCell>
              <TableCell class="space-x-2 text-right">
                <Button variant="outline" size="sm" as-child>
                  <Link :href="record.links.edit">Edit</Link>
                </Button>
                <Button type="button" variant="destructive" size="sm" @click="destroy(record)">
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </main>
</template>
