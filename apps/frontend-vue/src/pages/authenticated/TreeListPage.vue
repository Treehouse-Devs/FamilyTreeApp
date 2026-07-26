<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Plus, TreePine } from '@lucide/vue'
import { useCreateTree, useTrees } from '@/composables/queries/useTrees'
import { useProfile } from '@/composables/queries/useProfile'
import { useTreeStore } from '@/stores/tree'
import { toDisplayError } from '@/lib/queryClient'
import AppShell from '@/layouts/AppShell.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'

/** Ported from `app/(authenticated)/index.tsx`. */
const { t } = useI18n()
const router = useRouter()
const treeStore = useTreeStore()

// The RN app gates this screen's render on `useFetchUser`; here the profile query
// runs alongside and the guard has already confirmed a session.
useProfile()

const { trees, isPending, error } = useTrees()
const { mutateAsync: createTree, isPending: isCreating } = useCreateTree()

const showCreate = ref(false)
const newTreeName = ref('')
const createError = ref<string | null>(null)

async function submitCreate() {
  const name = newTreeName.value.trim()
  if (!name) return

  createError.value = null
  try {
    const tree = await createTree(name)
    showCreate.value = false
    newTreeName.value = ''
    await openTree(tree.id)
  } catch (err) {
    createError.value = toDisplayError(err).message
  }
}

async function openTree(id: string) {
  treeStore.selectTree(id)
  await router.push({ name: 'tree', params: { id } })
}
</script>

<template>
  <AppShell>
    <template #title>
      {{ t('familyTree') }}
    </template>

    <template #actions>
      <Button size="sm" @click="showCreate = !showCreate">
        <Plus class="size-4" />
        {{ t('createNew') }}
      </Button>
    </template>

    <div class="flex flex-col gap-4 p-4 md:p-0">
      <Card v-if="showCreate" class="flex flex-col gap-3">
        <h2 class="text-sm font-semibold text-typography-800">
          {{ t('createNewFamilyTree') }}
        </h2>
        <Input v-model="newTreeName" :placeholder="t('enterTreeName')" />
        <p v-if="createError" class="text-xs text-error-600" role="alert">
          {{ createError }}
        </p>
        <div class="flex gap-2">
          <Button :loading="isCreating" @click="submitCreate">
            {{ t('create') }}
          </Button>
          <Button variant="ghost" @click="showCreate = false">
            {{ t('cancel') }}
          </Button>
        </div>
      </Card>

      <p v-if="isPending" class="text-sm text-typography-500">
        {{ t('uploading') }}
      </p>

      <p v-else-if="error" class="text-sm text-error-600" role="alert">
        {{ toDisplayError(error).message }}
      </p>

      <div v-else-if="trees.length === 0" class="flex flex-col items-center gap-3 py-16 text-center">
        <TreePine class="size-12 text-typography-300" />
        <h2 class="text-lg font-semibold text-typography-800">
          {{ t('noTreeYet') }}
        </h2>
        <p class="max-w-xs text-sm text-typography-600">
          {{ t('noTreeYetDescription') }}
        </p>
        <Button class="mt-2" @click="showCreate = true">
          {{ t('startCreating') }}
        </Button>
      </div>

      <ul v-else class="grid gap-3 md:grid-cols-2">
        <li v-for="tree in trees" :key="tree.id">
          <Card interactive as="button" class="flex w-full items-center gap-3 text-left" @click="openTree(tree.id)">
            <span class="flex size-10 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
              <TreePine class="size-5" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate font-semibold text-typography-900">{{ tree.name }}</span>
            </span>
          </Card>
        </li>
      </ul>
    </div>
  </AppShell>
</template>
