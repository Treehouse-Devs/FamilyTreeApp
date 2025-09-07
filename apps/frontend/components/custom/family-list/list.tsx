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
  Image,
  ListRenderItemInfo,
} from 'react-native'
import { FamilyListProps, FamilyNode } from './list.type'

const FamilyList: React.FC<FamilyListProps> = ({
  data,
  onSelect,
  renderItem,
  ListEmptyComponent,
  refreshControl = undefined,
}) => {
  const defaultRenderItem = ({ item }: ListRenderItemInfo<FamilyNode>) => (
    <View className="mb-3">
      <Pressable
        onPress={() => onSelect?.(item)}
        className="bg-orange-200 rounded-2xl p-4 shadow-sm active:bg-orange-300 border border-orange-600"
        android_ripple={{ color: '#fed7aa' }}
      >
        <View className="flex-row items-center">
          {item.picture
            ? (
              <Image
                source={{ uri: item.picture }}
                className="w-10 h-10 rounded-full mr-3"
              />
            )
            : (
              <View className="w-10 h-10 rounded-full bg-orange-300 mr-3 items-center justify-center">
                <Text className="text-orange-800 font-bold text-lg">
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          <View className="flex-1">
            <Text className="text-orange-900 font-bold text-lg">{item.name}</Text>
            {item.note && (
              <Text className="text-orange-700 text-sm mt-1">{item.note}</Text>
            )}
          </View>
        </View>
      </Pressable>
    </View>
  )

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
      contentContainerStyle={data.length === 0 ? { flex: 1 } : { paddingTop: 8, paddingBottom: 8 }}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    />
  )
}

export default FamilyList
