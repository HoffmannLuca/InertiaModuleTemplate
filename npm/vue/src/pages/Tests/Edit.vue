<script setup lang="ts">
import { Link, useForm } from '@inertiajs/vue3'
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
  <main>
    <h1>{{ testRecord ? 'Edit test' : 'Create test' }}</h1>

    <form @submit.prevent="submit">
      <label>
        Name
        <input v-model="form.name" required>
        <small v-if="form.errors.name">{{ form.errors.name }}</small>
      </label>

      <label>
        Age
        <input v-model.number="form.age" type="number" min="0" max="150" required>
        <small v-if="form.errors.age">{{ form.errors.age }}</small>
      </label>

      <label>
        Test enum
        <select v-model="form.test" required>
          <option v-for="option in testOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <small v-if="form.errors.test">{{ form.errors.test }}</small>
      </label>

      <button type="submit" :disabled="form.processing">Save</button>
      <Link :href="indexUrl">Cancel</Link>
    </form>
  </main>
</template>
