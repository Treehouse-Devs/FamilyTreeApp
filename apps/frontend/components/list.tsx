/**
 * FamilyList Component
 *
 * Props:
 * - data: Array of family tree nodes (FamilyNode[])
 * - onSelect: Callback when an item is selected
 * - renderItem: Optional custom render function (FamilyNode => ReactElement)
 * - ListEmptyComponent: Optional ReactElement for empty state
 * - loading: Optional loading indicator
 *
 * Usage:
 * <FamilyList data={families} onSelect={handleSelect} />
 */
import React from 'react'
import {
  FlatList,
  Pressable,
  View,
  Text,
  ActivityIndicator,
  Image,
  ListRenderItemInfo,
} from 'react-native'
import { FamilyListProps, FamilyNode } from './list.type'

const FamilyList: React.FC<FamilyListProps> = ({
  data,
  onSelect,
  renderItem,
  ListEmptyComponent,
  loading = false,
  refreshControl = undefined,
}) => {
  const defaultRenderItem = ({ item }: ListRenderItemInfo<FamilyNode>) => (
    <Pressable
      onPress={() => onSelect?.(item)}
      className="flex-row items-center p-4 border-b border-gray-200 bg-white active:bg-gray-100"
      android_ripple={{ color: '#e5e7eb' }}
    >
      {item.picture
        ? (
          <Image
            source={{ uri: item.picture }}
            className="w-12 h-12 rounded-full mr-4"
          />
        )
        : (
          <View className="w-12 h-12 rounded-full bg-gray-300 mr-4" />
        )}
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-900">{item.name}</Text>
        {item.note
          ? (
            <Text className="text-xs text-gray-500">{item.note}</Text>
          )
          : null}
        <Text className="text-xs text-gray-400">
          Created:
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
        </Text>
        {typeof item.childrenCount === 'number'
          ? (
            <Text className="text-xs text-blue-500">
              Children:
              {item.childrenCount}
            </Text>
          )
          : null}
      </View>
    </Pressable>
  )

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-10">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="mt-2 text-gray-500">Loading...</Text>
      </View>
    )
  }

  return (
    <FlatList
      data={data}
      keyExtractor={item => item.id}
      renderItem={
        renderItem ? ({ item }) => renderItem(item) : defaultRenderItem
      }
      ListEmptyComponent={
        ListEmptyComponent || (
          <View className="flex-1 items-center justify-center py-10">
            <Text className="text-gray-400">No families found.</Text>
          </View>
        )
      }
      contentContainerStyle={data.length === 0 ? { flex: 1 } : undefined}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    />
  )
}

export default FamilyList
