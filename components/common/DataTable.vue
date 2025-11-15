<template>
  <div class="w-full">
    <div v-if="loading" class="flex justify-center p-8">
      <p>{{ $t('common.loading') }}</p>
    </div>

    <div v-else-if="error" class="text-destructive p-4">
      {{ error }}
    </div>

    <div v-else class="rounded-md border">
      <table class="w-full">
        <thead>
          <tr class="border-b bg-muted/50">
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-3 text-left text-sm font-medium"
            >
              {{ column.label }}
            </th>
            <th v-if="showActions" class="px-4 py-3 text-right text-sm font-medium">
              {{ $t('common.actions') || 'Actions' }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in data"
            :key="index"
            class="border-b hover:bg-muted/50 transition-colors"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-3 text-sm"
            >
              <slot :name="`cell-${column.key}`" :item="item">
                {{ (item as any)[column.key] }}
              </slot>
            </td>
            <td v-if="showActions" class="px-4 py-3 text-right">
              <slot name="actions" :item="item">
                <div class="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    @click="$emit('edit', item)"
                  >
                    {{ $t('common.edit') }}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    @click="$emit('delete', item)"
                  >
                    {{ $t('common.delete') }}
                  </Button>
                </div>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { Button } from '~/components/ui/button'

export interface Column {
  key: string
  label: string
}

interface Props {
  data: T[]
  columns: Column[]
  loading?: boolean
  error?: string | null
  showActions?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  showActions: true,
})

defineEmits<{
  edit: [item: T]
  delete: [item: T]
}>()
</script>
