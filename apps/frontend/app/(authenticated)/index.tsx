import { StyleSheet, RefreshControl, View } from 'react-native'
import FamilyList from '@/components/list'
import { FamilyService } from '@/services/familiyService'
import { useApi } from '@/hooks/useApi'
import React from 'react'
import { FamilyNode } from '@/components/list.type'
import { Input, InputField } from '@/components/ui/input'
import { Controller, useForm } from 'react-hook-form'
import { t } from 'i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { familyRequestSchema } from '@/validator/family/familyValidation'

export default function App() {
  const {
    loading,
    result,
    api,
  } = useApi<FamilyService, { data: FamilyNode[] }>(new FamilyService())

  const {
    control,
    handleSubmit,
  } = useForm<{ name: string }>({
    resolver: zodResolver(familyRequestSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
    },
  })

  const onRefresh = async () => {
    await api.fetchFamiliesList()
  }

  const onSearch = async (data: { name: string }) => {
    if (data.name.trim() === '') {
      await api.fetchFamiliesList()
    }
    else {
      await api.fetchFamiliesList({ search: data.name })
    }
  }

  React.useEffect(() => {
    void api.fetchFamiliesList()
  }, [])

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input>
            <InputField
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={t('search')}
              onSubmitEditing={() => void handleSubmit(onSearch)()}
              returnKeyType="search"
            />
          </Input>
        )}
      />

      <FamilyList
        data={result?.data || []}
        onSelect={family => console.log('Selected family:', family)}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => void onRefresh()} />
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  welcomeText: {
    fontSize: 18,
    marginBottom: 10,
  },
})
