import { StyleSheet, RefreshControl, View } from 'react-native'
import FamilyList from '@/components/custom//family-list/list'
import { FamilyService } from '@/services/familiyService'
import { useApi } from '@/hooks/useApi'
import React from 'react'
import { FamilyNode } from '@/components/custom//family-list/list.type'
import { Input, InputField } from '@/components/ui/input'
import { Controller, useForm } from 'react-hook-form'
import { t } from 'i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { familyRequestSchema } from '@/validator/family/familyValidation'
import { useFocusEffect } from '@react-navigation/native'
import { router } from 'expo-router'

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

  const navigateToFamilyTree = (family: FamilyNode) => {
    // Navigate to the family tree screen with the selected family's ID
    router.push(`/(authenticated)/tree/${family.id}/tree`)
  }

  React.useEffect(() => {
    void api.fetchFamiliesList()
  }, [])

  // Auto-refresh when screen comes into focus (e.g., when returning from add-family page)
  useFocusEffect(
    React.useCallback(() => {
      void api.fetchFamiliesList()
    }, []),
  )

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input className="mb-3 mx-1">
            <InputField
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={t('search')}
              onSubmitEditing={() => void handleSubmit(onSearch)()}
              returnKeyType="search"
              className="bg-orange-50 outline-orange-200 rounded-2xl focus:border-orange-300 focus:bg-orange-100"
              placeholderTextColor="#fb923c"
            />
          </Input>
        )}
      />

      <FamilyList
        data={result?.data || []}
        onSelect={family => navigateToFamilyTree(family)}
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
    paddingTop: 10,
    paddingHorizontal: 10,
  },
})
