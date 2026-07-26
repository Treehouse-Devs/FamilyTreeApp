<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Users } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { useTree } from '@/composables/queries/useTrees'
import { useTreeStore } from '@/stores/tree'
import type { Person } from '@/types/tree'
import AppShell from '@/layouts/AppShell.vue'
import Button from '@/components/ui/Button.vue'
import FamilyTree from '@/components/family-tree/FamilyTree.vue'

/** Ported from `app/(authenticated)/tree/[id]/index.tsx`. */
const props = defineProps<{ id: string }>()

const { t } = useI18n()
const router = useRouter()
const treeStore = useTreeStore()
const { selectedRoot } = storeToRefs(treeStore)

const { isPending, error } = useTree(() => props.id)

// Keep the store's selection in step with the URL, so a deep link works.
watch(() => props.id, id => treeStore.selectTree(id), { immediate: true })

const treeName = computed(() =>
  treeStore.trees.find(tree => tree.id === props.id)?.name ?? t('familyTree'),
)

const treeRef = ref<InstanceType<typeof FamilyTree> | null>(null)

async function onPressNode(person: Person) {
  await router.push({
    name: 'person-detail',
    params: { id: props.id, personId: person.id },
  })
}
</script>

<template>
  <AppShell>
    <template #title>
      {{ treeName }}
    </template>

    <template #actions>
      <Button
        variant="ghost"
        size="sm"
        @click="router.push({ name: 'tree-members', params: { id } })"
      >
        <Users class="size-4" />
        {{ t('familyMemberList') }}
      </Button>
    </template>

    <!-- The canvas fills the shell's content area; Vue Flow needs a sized parent. -->
    <div class="relative h-[calc(100dvh-8rem)] w-full overflow-hidden rounded-none bg-linear-to-b from-primary-50 to-background-0 md:rounded-xl">
      <p v-if="isPending" class="p-6 text-sm text-typography-500">
        {{ t('uploading') }}
      </p>

      <p v-else-if="error" class="p-6 text-sm text-error-600" role="alert">
        {{ error.message }}
      </p>

      <FamilyTree
        v-else-if="selectedRoot"
        ref="treeRef"
        :root="selectedRoot"
        @press-node="onPressNode"
      />

      <p v-else class="p-6 text-sm text-typography-500">
        {{ t('noTreeYetDescription') }}
      </p>
    </div>
  </AppShell>
</template>
