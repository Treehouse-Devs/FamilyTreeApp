'use client'
import React from 'react'
import { createActionsheet } from '@gluestack-ui/actionsheet'
import { tva } from '@gluestack-ui/nativewind-utils/tva'
import {
  withStyleContext,
  useStyleContext,
} from '@gluestack-ui/nativewind-utils/withStyleContext'
import { View, Text, Pressable, ScrollView } from 'react-native'
import type { VariantProps } from '@gluestack-ui/nativewind-utils'
import { PrimitiveIcon, UIIcon } from '@gluestack-ui/icon'

const SCOPE = 'ACTIONSHEET'

const AnimatedPressable = Pressable
const Root = withStyleContext(View, SCOPE)

const UIActionsheet = createActionsheet({
  Root,
  Content: View,
  Item: AnimatedPressable,
  ItemText: Text,
  DragIndicator: View,
  DragIndicatorWrapper: View,
  Backdrop: Pressable,
  ScrollView: ScrollView,
  VirtualizedList: ScrollView,
  FlatList: ScrollView,
  SectionList: ScrollView,
  SectionHeaderText: Text,
  Icon: UIIcon,
})

const actionsheetStyle = tva({
  base: 'w-full h-full flex justify-end web:pointer-events-none',
})

const actionsheetContentStyle = tva({
  base: 'items-center rounded-tl-3xl rounded-tr-3xl p-5 pt-2 bg-background-0 web:pointer-events-auto web:select-none shadow-hard-5',
})

const actionsheetItemStyle = tva({
  base: 'w-full flex-row items-center p-3 rounded data-[disabled=true]:opacity-40 data-[disabled=true]:web:pointer-events-auto data-[disabled=true]:web:cursor-not-allowed data-[hover=true]:bg-background-50 data-[active=true]:bg-background-100 data-[focus=true]:bg-background-100 web:data-[focus-visible=true]:bg-background-100 web:data-[focus-visible=true]:outline-indicator-primary web:data-[focus-visible=true]:outline-1 web:data-[focus-visible=true]:outline',
})

const actionsheetItemTextStyle = tva({
  base: 'text-typography-700 font-normal font-body',
  variants: {
    isTruncated: {
      true: '',
    },
    bold: {
      true: 'font-bold',
    },
    underline: {
      true: 'underline',
    },
    strikeThrough: {
      true: 'line-through',
    },
    size: {
      '2xs': 'text-2xs',
      'xs': 'text-xs',
      'sm': 'text-sm',
      'md': 'text-base',
      'lg': 'text-lg',
      'xl': 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
      '6xl': 'text-6xl',
    },
  },
})

const actionsheetDragIndicatorStyle = tva({
  base: 'w-16 h-1 bg-background-400 rounded-full',
})

const actionsheetDragIndicatorWrapperStyle = tva({
  base: 'w-full py-1 items-center',
})

const actionsheetBackdropStyle = tva({
  base: 'absolute left-0 top-0 right-0 bottom-0 bg-background-dark web:cursor-default web:pointer-events-auto',
})

const actionsheetScrollViewStyle = tva({
  base: 'w-full h-auto',
})

const actionsheetVirtualizedListStyle = tva({
  base: 'w-full h-auto',
})

const actionsheetFlatListStyle = tva({
  base: 'w-full h-auto',
})

const actionsheetSectionListStyle = tva({
  base: 'w-full h-auto',
})

const actionsheetSectionHeaderTextStyle = tva({
  base: 'leading-5 font-bold font-heading my-0 text-typography-500 p-3 uppercase',
  variants: {
    isTruncated: {
      true: '',
    },
    bold: {
      true: 'font-bold',
    },
    underline: {
      true: 'underline',
    },
    strikeThrough: {
      true: 'line-through',
    },
    size: {
      '5xl': 'text-5xl',
      '4xl': 'text-4xl',
      '3xl': 'text-3xl',
      '2xl': 'text-2xl',
      'xl': 'text-xl',
      'lg': 'text-lg',
      'md': 'text-md',
      'sm': 'text-sm',
      'xs': 'text-xs',
    },
  },
})

const actionsheetIconStyle = tva({
  base: 'text-background-500 fill-none',
  variants: {
    size: {
      '2xs': 'h-3 w-3',
      'xs': 'h-3.5 w-3.5',
      'sm': 'h-4 w-4',
      'md': 'h-[18px] w-[18px]',
      'lg': 'h-5 w-5',
      'xl': 'h-6 w-6',
    },
  },
})

type IActionsheetProps = Omit<
  React.ComponentPropsWithoutRef<typeof UIActionsheet>,
  'context'
> &
  VariantProps<typeof actionsheetStyle> & { className?: string }

const Actionsheet = React.forwardRef<
  React.ComponentRef<typeof UIActionsheet>,
  IActionsheetProps
>(function Actionsheet({ className, ...props }, ref) {
  return (
    <UIActionsheet
      ref={ref}
      {...props}
      className={actionsheetStyle({ class: className })}
      context={{}}
      pointerEvents="box-none"
      style={{ position: 'absolute', bottom: 0, left: 0, right: 0, justifyContent: 'flex-end' }}
    />
  )
})

type IActionsheetContentProps = React.ComponentPropsWithoutRef<
  typeof UIActionsheet.Content
> &
  VariantProps<typeof actionsheetContentStyle> & { className?: string }

const ActionsheetContent = React.forwardRef<
  React.ComponentRef<typeof UIActionsheet.Content>,
  IActionsheetContentProps
>(function ActionsheetContent({ className, ...props }, ref) {
  return (
    <UIActionsheet.Content
      ref={ref}
      {...props}
      className={actionsheetContentStyle({ class: className })}
    />
  )
})

type IActionsheetItemProps = React.ComponentPropsWithoutRef<
  typeof UIActionsheet.Item
> &
  VariantProps<typeof actionsheetItemStyle> & { className?: string }

const ActionsheetItem = React.forwardRef<
  React.ComponentRef<typeof UIActionsheet.Item>,
  IActionsheetItemProps
>(function ActionsheetItem({ className, ...props }, ref) {
  return (
    <UIActionsheet.Item
      ref={ref}
      {...props}
      className={actionsheetItemStyle({ class: className })}
    />
  )
})

type IActionsheetItemIconProps = React.ComponentPropsWithoutRef<
  typeof UIActionsheet.Icon
> &
  VariantProps<typeof actionsheetIconStyle> & {
    className?: string
    as?: React.ElementType
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xs'
  }

const ActionsheetItemIcon = React.forwardRef<
  React.ComponentRef<typeof UIActionsheet.Icon>,
  IActionsheetItemIconProps
>(function ActionsheetItemIcon({ className, size = 'md', ...props }, ref) {
  if (typeof size === 'number') {
    return (
      <UIActionsheet.Icon
        ref={ref}
        {...props}
        className={actionsheetIconStyle({ class: className })}
        size={size}
      />
    )
  }
  return (
    <UIActionsheet.Icon
      ref={ref}
      {...props}
      className={actionsheetIconStyle({
        size,
        class: className,
      })}
    />
  )
})


type IActionsheetItemTextProps = React.ComponentPropsWithoutRef<
  typeof UIActionsheet.ItemText
> &
  VariantProps<typeof actionsheetItemTextStyle> & { 
    className?: string
    children?: React.ReactNode
  }

const ActionsheetItemText = React.forwardRef<
  React.ComponentRef<typeof UIActionsheet.ItemText>,
  IActionsheetItemTextProps
>(function ActionsheetItemText(
  { className, isTruncated, bold, underline, strikeThrough, size, ...props },
  ref,
) {
  return (
    <UIActionsheet.ItemText
      ref={ref}
      {...props}
      className={actionsheetItemTextStyle({
        isTruncated,
        bold,
        underline,
        strikeThrough,
        size,
        class: className,
      })}
    />
  )
})

type IActionsheetDragIndicatorProps = React.ComponentPropsWithoutRef<
  typeof UIActionsheet.DragIndicator
> &
  VariantProps<typeof actionsheetDragIndicatorStyle> & { className?: string }

const ActionsheetDragIndicator = React.forwardRef<
  React.ComponentRef<typeof UIActionsheet.DragIndicator>,
  IActionsheetDragIndicatorProps
>(function ActionsheetDragIndicator({ className, ...props }, ref) {
  return (
    <UIActionsheet.DragIndicator
      ref={ref}
      {...props}
      className={actionsheetDragIndicatorStyle({ class: className })}
    />
  )
})

type IActionsheetDragIndicatorWrapperProps = React.ComponentPropsWithoutRef<
  typeof UIActionsheet.DragIndicatorWrapper
> &
  VariantProps<typeof actionsheetDragIndicatorWrapperStyle> & {
    className?: string
  }

const ActionsheetDragIndicatorWrapper = React.forwardRef<
  React.ComponentRef<typeof UIActionsheet.DragIndicatorWrapper>,
  IActionsheetDragIndicatorWrapperProps
>(function ActionsheetDragIndicatorWrapper({ className, ...props }, ref) {
  return (
    <UIActionsheet.DragIndicatorWrapper
      ref={ref}
      {...props}
      className={actionsheetDragIndicatorWrapperStyle({ class: className })}
    />
  )
})

type IActionsheetBackdropProps = React.ComponentPropsWithoutRef<
  typeof UIActionsheet.Backdrop
> &
  VariantProps<typeof actionsheetBackdropStyle> & { className?: string }

const ActionsheetBackdrop = React.forwardRef<
  React.ComponentRef<typeof UIActionsheet.Backdrop>,
  IActionsheetBackdropProps
>(function ActionsheetBackdrop({ className, ...props }, ref) {
  return (
    <UIActionsheet.Backdrop
      ref={ref}
      {...props}
      className={actionsheetBackdropStyle({ class: className })}
    />
  )
})

type IActionsheetScrollViewProps = React.ComponentPropsWithoutRef<
  typeof UIActionsheet.ScrollView
> &
  VariantProps<typeof actionsheetScrollViewStyle> & { className?: string }

const ActionsheetScrollView = React.forwardRef<
  React.ComponentRef<typeof UIActionsheet.ScrollView>,
  IActionsheetScrollViewProps
>(function ActionsheetScrollView({ className, ...props }, ref) {
  return (
    <UIActionsheet.ScrollView
      ref={ref}
      {...props}
      className={actionsheetScrollViewStyle({ class: className })}
    />
  )
})

type IActionsheetVirtualizedListProps = React.ComponentPropsWithoutRef<
  typeof UIActionsheet.VirtualizedList
> &
  VariantProps<typeof actionsheetVirtualizedListStyle> & { className?: string }

const ActionsheetVirtualizedList = React.forwardRef<
  React.ComponentRef<typeof UIActionsheet.VirtualizedList>,
  IActionsheetVirtualizedListProps
>(function ActionsheetVirtualizedList({ className, ...props }, ref) {
  return (
    <UIActionsheet.VirtualizedList
      ref={ref}
      {...props}
      className={actionsheetVirtualizedListStyle({ class: className })}
    />
  )
})

type IActionsheetFlatListProps = React.ComponentPropsWithoutRef<
  typeof UIActionsheet.FlatList
> &
  VariantProps<typeof actionsheetFlatListStyle> & { className?: string }

const ActionsheetFlatList = React.forwardRef<
  React.ComponentRef<typeof UIActionsheet.FlatList>,
  IActionsheetFlatListProps
>(function ActionsheetFlatList({ className, ...props }, ref) {
  return (
    <UIActionsheet.FlatList
      ref={ref}
      {...props}
      className={actionsheetFlatListStyle({ class: className })}
    />
  )
})

type IActionsheetSectionListProps = React.ComponentPropsWithoutRef<
  typeof UIActionsheet.SectionList
> &
  VariantProps<typeof actionsheetSectionListStyle> & { className?: string }

const ActionsheetSectionList = React.forwardRef<
  React.ComponentRef<typeof UIActionsheet.SectionList>,
  IActionsheetSectionListProps
>(function ActionsheetSectionList({ className, ...props }, ref) {
  return (
    <UIActionsheet.SectionList
      ref={ref}
      {...props}
      className={actionsheetSectionListStyle({ class: className })}
    />
  )
})

type IActionsheetSectionHeaderTextProps = React.ComponentPropsWithoutRef<
  typeof UIActionsheet.SectionHeaderText
> &
  VariantProps<typeof actionsheetSectionHeaderTextStyle> & {
    className?: string
  }

const ActionsheetSectionHeaderText = React.forwardRef<
  React.ComponentRef<typeof UIActionsheet.SectionHeaderText>,
  IActionsheetSectionHeaderTextProps
>(function ActionsheetSectionHeaderText(
  { className, isTruncated, bold, underline, strikeThrough, size, ...props },
  ref,
) {
  return (
    <UIActionsheet.SectionHeaderText
      ref={ref}
      {...props}
      className={actionsheetSectionHeaderTextStyle({
        isTruncated,
        bold,
        underline,
        strikeThrough,
        size,
        class: className,
      })}
    />
  )
})

type IActionsheetIconProps = React.ComponentPropsWithoutRef<
  typeof UIActionsheet.Icon
> &
  VariantProps<typeof actionsheetIconStyle> & {
    className?: string
    as?: React.ElementType
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xs'
  }

const ActionsheetIcon = React.forwardRef<
  React.ComponentRef<typeof UIActionsheet.Icon>,
  IActionsheetIconProps
>(function ActionsheetIcon({ className, size = 'md', ...props }, ref) {
  if (typeof size === 'number') {
    return (
      <UIActionsheet.Icon
        ref={ref}
        {...props}
        className={actionsheetIconStyle({ class: className })}
        size={size}
      />
    )
  }
  return (
    <UIActionsheet.Icon
      ref={ref}
      {...props}
      className={actionsheetIconStyle({
        size,
        class: className,
      })}
    />
  )
})

Actionsheet.displayName = 'Actionsheet'
ActionsheetContent.displayName = 'ActionsheetContent'
ActionsheetItem.displayName = 'ActionsheetItem'
ActionsheetItemIcon.displayName = 'ActionsheetItemIcon'
ActionsheetItemText.displayName = 'ActionsheetItemText'
ActionsheetDragIndicator.displayName = 'ActionsheetDragIndicator'
ActionsheetDragIndicatorWrapper.displayName = 'ActionsheetDragIndicatorWrapper'
ActionsheetBackdrop.displayName = 'ActionsheetBackdrop'
ActionsheetScrollView.displayName = 'ActionsheetScrollView'
ActionsheetVirtualizedList.displayName = 'ActionsheetVirtualizedList'
ActionsheetFlatList.displayName = 'ActionsheetFlatList'
ActionsheetSectionList.displayName = 'ActionsheetSectionList'
ActionsheetSectionHeaderText.displayName = 'ActionsheetSectionHeaderText'
ActionsheetIcon.displayName = 'ActionsheetIcon'

export {
  Actionsheet,
  ActionsheetContent,
  ActionsheetItem,
  ActionsheetItemIcon,
  ActionsheetItemText,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetBackdrop,
  ActionsheetScrollView,
  ActionsheetVirtualizedList,
  ActionsheetFlatList,
  ActionsheetSectionList,
  ActionsheetSectionHeaderText,
  ActionsheetIcon,
}
