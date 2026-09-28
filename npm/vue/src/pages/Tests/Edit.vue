<script setup lang="ts">
import { Link, useForm } from '@inertiajs/vue3'
import { Button } from '@starter-solutions/vue-ui/base/button'
import { Card, CardContent, CardHeader, CardTitle } from '@starter-solutions/vue-ui/base/card'
import { Input } from '@starter-solutions/vue-ui/base/input'
import { Label } from '@starter-solutions/vue-ui/base/label'
import { NativeSelect, NativeSelectOption } from '@starter-solutions/vue-ui/base/native-select'
import type { Test, TestEnum } from '../../generated/backend'

interface TestRecord extends Test {
  id: number
}

const props = defineProps<{
  testRecord: TestRecord | null
  testOptions: Array<{ label: string; value: TestEnum }>
  submitUrl: string
  indexUrl: string
}>()

const form = useForm({
  name: props.testRecord?.name ?? '',
  age: props.testRecord?.age ?? 18,
  test: props.testRecord?.test ?? props.testOptions[0]?.value ?? '',
})

function submit(): void {
  if (props.testRecord) {
    form.put(props.submitUrl)
  } else {
    form.post(props.submitUrl)
  }
}
</script>

<template>
  <main class="mx-auto max-w-2xl p-6">
    <Card>
      <CardHeader>
        <CardTitle>{{ testRecord ? 'Edit test' : 'Create test' }}</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="space-y-6" @submit.prevent="submit">
          <div class="space-y-2">
            <Label for="test-name">Name</Label>
            <Input id="test-name" v-model="form.name" required />
            <p v-if="form.errors.name" class="text-sm text-destructive">{{ form.errors.name }}</p>
          </div>

          <div class="space-y-2">
            <Label for="test-age">Age</Label>
            <Input id="test-age" v-model.number="form.age" type="number" min="0" max="150" required />
            <p v-if="form.errors.age" class="text-sm text-destructive">{{ form.errors.age }}</p>
          </div>

          <div class="space-y-2">
            <Label for="test-enum">Test enum</Label>
            <NativeSelect id="test-enum" v-model="form.test" required>
              <NativeSelectOption v-for="option in testOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </NativeSelectOption>
            </NativeSelect>
            <p v-if="form.errors.test" class="text-sm text-destructive">{{ form.errors.test }}</p>
          </div>

          <div class="flex gap-3">
            <Button type="submit" :disabled="form.processing">Save</Button>
            <Button variant="outline" as-child>
              <Link :href="indexUrl">Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </main>
</template>
