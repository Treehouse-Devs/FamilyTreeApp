import React from 'react'
import {
  RoundedRect,
  Text,
  useFont,
  Group,
  Circle,
  useImage,
  ImageShader,
} from '@shopify/react-native-skia'
import { TFunction } from 'i18next'
import { getYear, getAgeInfo } from '@/utils/date'
import { NodeLayout, NODE_W, NODE_H, THUMB, PADDING, RADIUS } from './types'

import DUMMY_MALE from '@/assets/images/dummy-profile-male.webp'
import DUMMY_FEMALE from '@/assets/images/dummy-profile-female.webp'

type PersonCardProps = {
  node: NodeLayout
  nameFont: ReturnType<typeof useFont>
  smallFont: ReturnType<typeof useFont>
  cardFillColor: string
  cardBorderColor: string
  textColor: string
  t: TFunction
}

export const PersonCard: React.FC<PersonCardProps> = ({
  node,
  nameFont,
  smallFont,
  cardFillColor,
  cardBorderColor,
  textColor,
  t,
}) => {
  const { person, x, y } = node
  const dummyImage = person.gender === 'female' ? DUMMY_FEMALE : DUMMY_MALE
  const imageSource = person.imageThumbnailUrl || (dummyImage as number)

  const image = useImage(imageSource)

  const yearText = getYear(person.birthDate)
  const ageText = getAgeInfo(person.birthDate, person.deathDate, t)

  // Calculate text positions (centered)
  const nameWidth = nameFont?.measureText(person.name).width || 0
  const nameY = y + THUMB + PADDING + 20

  const nameX = x + (NODE_W - nameWidth) / 2
  const infoY = nameY + 18

  // Combined year + age text
  const infoText = `${yearText} | ${ageText}`
  const infoWidth = smallFont?.measureText(infoText).width || 0
  const infoX = x + (NODE_W - infoWidth) / 2

  return (
    <Group>
      {/* Card background */}
      <RoundedRect
        x={x}
        y={y}
        width={NODE_W}
        height={NODE_H}
        r={RADIUS}
        color={cardFillColor}
      />
      {/* Card border */}
      <RoundedRect
        x={x}
        y={y}
        width={NODE_W}
        height={NODE_H}
        r={RADIUS}
        color={cardBorderColor}
        style="stroke"
        strokeWidth={2}
      />

      {/* Avatar circle background */}
      <Circle
        cx={x + NODE_W / 2}
        cy={y + THUMB / 2 + PADDING}
        r={THUMB / 2}
        color={cardBorderColor}
      />

      {/* Avatar image (if available) */}
      {image && (
        <Circle
          cx={x + NODE_W / 2}
          cy={y + THUMB / 2 + PADDING}
          r={THUMB / 2}
        >
          <ImageShader
            image={image}
            fit="cover"
            x={x + NODE_W / 2 - THUMB / 2}
            y={y + PADDING}
            width={THUMB}
            height={THUMB}
          />
        </Circle>
      )}

      {/* Name text */}
      <Text
        x={nameX}
        y={nameY}
        text={person.name}
        font={nameFont}
        color={textColor}
      />

      {/* Year and age info */}
      <Text
        x={infoX}
        y={infoY}
        text={infoText}
        font={smallFont}
        color={textColor}
      />
    </Group>
  )
}
