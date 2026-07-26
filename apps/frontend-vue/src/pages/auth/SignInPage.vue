<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useMutation } from '@tanstack/vue-query'
import { AuthService } from '@/services/authService'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { toDisplayError } from '@/lib/queryClient'
import { makeLoginSchema } from '@/validator/auth/authValidation'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import FormField from '@/components/ui/FormField.vue'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const app = useAppStore()

const serverError = ref<string | null>(null)

// Rebuilt when the locale changes, which is the point of the factory schemas.
const validationSchema = computed(() => toTypedSchema(makeLoginSchema(t)))

const { handleSubmit, defineField, errors } = useForm({
  validationSchema,
  // Matches the RN forms' `mode: 'onChange'`.
  validateOnMount: false,
})

const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

const { mutateAsync, isPending } = useMutation({
  mutationFn: (values: { email: string, password: string }) =>
    AuthService.login(values.email, values.password),
})

const onSubmit = handleSubmit(async (values) => {
  serverError.value = null

  try {
    const response = await mutateAsync(values)

    auth.login({
      uid: response.user.uid,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken ?? null,
      expiredAt: response.expiredAt ?? null,
    })
    app.setHasSeenWelcome(true)

    await router.replace({ name: 'trees' })
  } catch (error) {
    serverError.value = toDisplayError(error).message
  }
})
</script>

<template>
  <div class="flex min-h-dvh flex-col justify-center bg-background-0 px-6 py-12">
    <div class="mx-auto w-full max-w-sm">
      <h1 class="text-2xl font-bold text-typography-900">
        {{ t('signin') }}
      </h1>
      <p class="mt-1 text-sm text-typography-600">
        {{ t('signinTitle') }}
      </p>

      <form class="mt-8 flex flex-col gap-4" novalidate @submit="onSubmit">
        <FormField :label="t('email')" :error="errors.email" for="email">
          <Input
            id="email"
            v-model="email"
            v-bind="emailAttrs"
            type="email"
            autocomplete="email"
            :placeholder="t('emailPlaceholder')"
            :invalid="!!errors.email"
          />
        </FormField>

        <FormField :label="t('password')" :error="errors.password" for="password">
          <Input
            id="password"
            v-model="password"
            v-bind="passwordAttrs"
            type="password"
            autocomplete="current-password"
            :placeholder="t('passwordPlaceholder')"
            :invalid="!!errors.password"
          />
        </FormField>

        <p v-if="serverError" class="text-sm text-error-600" role="alert">
          {{ serverError }}
        </p>

        <Button type="submit" block :loading="isPending" class="mt-2">
          {{ t('signin') }}
        </Button>
      </form>

      <div class="mt-6 flex flex-col items-center gap-2 text-sm">
        <RouterLink :to="{ name: 'forget-password' }" class="text-primary-600 hover:underline">
          {{ t('forgetPasswordDescription') }}
        </RouterLink>
        <p class="text-typography-600">
          {{ t('signupDescription') }}
          <RouterLink :to="{ name: 'signup' }" class="ml-1 font-semibold text-primary-600 hover:underline">
            {{ t('signup') }}
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
