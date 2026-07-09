import type { Tree, DetailedPerson } from '@/store/slices/tree/types'
import { Gender } from '@treely/dto'
import { pseudoUuidv4 } from '../index'

type TreeMock = {
  trees: Tree[]
  createTree: (name: string) => Tree
}

export type TreeMockWithParams = {
  fetchTreeById: (id: string) => Tree
  fetchPersonById: (id: string) => { person: DetailedPerson }
}

export const treeMocks: TreeMock = {
  trees: [
    {
      id: '1f7d15dd-11bc-4e6c-888d-19a1f633d83e',
      name: 'Bardock Family Tree',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ],
  createTree: (name: string) => {
    const id = pseudoUuidv4()
    const newTree: Tree = {
      ...treeMocksWithParams.fetchTreeById(id),
      id,
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    treeMocks.trees.push(newTree)

    return newTree
  },
}

export const treeMocksWithParams: TreeMockWithParams = {
  fetchTreeById: (_id: string) => ({
    id: '1f7d15dd-11bc-4e6c-888d-19a1f633d83e',
    name: 'Bardock Family Tree',
    createdAt: 1754784000000,
    updatedAt: 1754784000000,
    familyImageUrl: undefined,
    rootId: 'dbc07888-3701-40c4-87be-4df09f04e324',
    persons: [
      // Root: Bardock
      {
        id: 'dbc07888-3701-40c4-87be-4df09f04e324',
        name: 'Bardock',
        gender: 'male',
        imageThumbnailUrl: undefined,
        birthDate: -916617600000,
        deathDate: 1628553600000,
        spouseId: 'b83d4904-b535-401c-9c63-37f0d9096435',
      },
      // Bardock's spouse: Gine
      {
        id: 'b83d4904-b535-401c-9c63-37f0d9096435',
        name: 'Gine',
        gender: 'female',
        imageThumbnailUrl: undefined,
        birthDate: -773798400000,
        spouseId: 'dbc07888-3701-40c4-87be-4df09f04e324',
      },
      // Raditz (Bardock's child)
      {
        id: 'c6a256ab-7747-488b-81de-a7cf9c9b2910',
        name: 'Raditz',
        gender: 'male',
        imageThumbnailUrl: undefined,
        birthDate: -296438400000,
        spouseId: 'f2ac7d84-a7ea-4195-8e46-04042cfc81c8',
        fatherId: 'dbc07888-3701-40c4-87be-4df09f04e324',
        motherId: 'b83d4904-b535-401c-9c63-37f0d9096435',
      },
      // Raditz's spouse: Launch
      {
        id: 'f2ac7d84-a7ea-4195-8e46-04042cfc81c8',
        name: 'Launch',
        gender: 'female',
        imageThumbnailUrl: undefined,
        birthDate: -198720000000,
        spouseId: 'c6a256ab-7747-488b-81de-a7cf9c9b2910',
      },
      // Raditz's children
      {
        id: '5330e122-3fec-4e4e-97be-0a7868c49242',
        name: 'Rashi',
        gender: 'male',
        imageThumbnailUrl: undefined,
        birthDate: 490233600000,
        fatherId: 'c6a256ab-7747-488b-81de-a7cf9c9b2910',
        motherId: 'f2ac7d84-a7ea-4195-8e46-04042cfc81c8',
      },
      {
        id: 'a83d4904-b535-401c-9c63-37f0d9096435',
        name: 'Ranch',
        gender: 'female',
        imageThumbnailUrl: undefined,
        birthDate: 543628800000,
        fatherId: 'c6a256ab-7747-488b-81de-a7cf9c9b2910',
        motherId: 'f2ac7d84-a7ea-4195-8e46-04042cfc81c8',
      },
      {
        id: '123d4904-b535-401c-9c63-37f0d9096435',
        name: 'Mooli',
        gender: 'male',
        imageThumbnailUrl: undefined,
        birthDate: 613440000000,
        fatherId: 'c6a256ab-7747-488b-81de-a7cf9c9b2910',
        motherId: 'f2ac7d84-a7ea-4195-8e46-04042cfc81c8',
      },
      // Goku (Bardock's child)
      {
        id: '56dc74ba-7600-4f0b-ad06-bab252a8f0de',
        name: 'Goku',
        gender: 'male',
        imageThumbnailUrl: undefined,
        birthDate: -146102400000,
        spouseId: '783d4904-b535-401c-9c63-37f0d9096435',
        fatherId: 'dbc07888-3701-40c4-87be-4df09f04e324',
        motherId: 'b83d4904-b535-401c-9c63-37f0d9096435',
      },
      // Goku's spouse: Chi-Chi
      {
        id: '783d4904-b535-401c-9c63-37f0d9096435',
        name: 'Chi-Chi',
        gender: 'female',
        imageThumbnailUrl: undefined,
        birthDate: 74304000000,
        spouseId: '56dc74ba-7600-4f0b-ad06-bab252a8f0de',
      },
      // Gohan (Goku's child)
      {
        id: 'e1a15888-6a4b-4143-9521-fc45deb5d2a5',
        name: 'Gohan',
        gender: 'male',
        imageThumbnailUrl: undefined,
        birthDate: 543024000000,
        spouseId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        fatherId: '56dc74ba-7600-4f0b-ad06-bab252a8f0de',
        motherId: '783d4904-b535-401c-9c63-37f0d9096435',
      },
      // Gohan's spouse: Videl
      {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'Videl',
        gender: 'female',
        imageThumbnailUrl: undefined,
        birthDate: 568944000000,
        spouseId: 'e1a15888-6a4b-4143-9521-fc45deb5d2a5',
      },
      // Pan (Gohan's child)
      {
        id: 'c5d4904a-b535-401c-9c63-37f0d9096435',
        name: 'Pan',
        gender: 'female',
        imageThumbnailUrl: undefined,
        birthDate: 1192060800000,
        fatherId: 'e1a15888-6a4b-4143-9521-fc45deb5d2a5',
        motherId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      },
      // Goten (Goku's child)
      {
        id: '883d4904-b535-401c-9c63-37f0d9096435',
        name: 'Goten',
        gender: 'male',
        imageThumbnailUrl: undefined,
        birthDate: 718588800000,
        fatherId: '56dc74ba-7600-4f0b-ad06-bab252a8f0de',
        motherId: '783d4904-b535-401c-9c63-37f0d9096435',
      },
    ],
  }),
  fetchPersonById: (id: string) => {
    const detailedPersons: Record<string, DetailedPerson> = {
      // Bardock
      'dbc07888-3701-40c4-87be-4df09f04e324': {
        id: 'dbc07888-3701-40c4-87be-4df09f04e324',
        name: 'Bardock',
        gender: Gender.MALE,
        birthDate: -916617600000,
        deathDate: 1628553600000,
        location: {
          nationality: 'Saiyan',
          hometown: 'Planet Vegeta',
          domicile: 'Planet Vegeta',
        },
        contact: {
          phoneNumber: null,
          homeNumber: null,
        },
        occupation: {
          occupation: 'Low-Class Warrior',
          officeAddress: 'Frieza Force Base',
        },
        imageThumbnailUrl: undefined,
        fullImageUrl: undefined,
      },
      // Gine
      'b83d4904-b535-401c-9c63-37f0d9096435': {
        id: 'b83d4904-b535-401c-9c63-37f0d9096435',
        name: 'Gine',
        gender: Gender.FEMALE,
        birthDate: -773798400000,
        location: {
          nationality: 'Saiyan',
          hometown: 'Planet Vegeta',
          domicile: 'Planet Vegeta',
        },
        contact: {
          phoneNumber: null,
          homeNumber: null,
        },
        occupation: {
          occupation: 'Meat Distribution Employee',
          officeAddress: 'Planet Vegeta',
        },
        imageThumbnailUrl: undefined,
        fullImageUrl: undefined,
      },
      // Raditz
      'c6a256ab-7747-488b-81de-a7cf9c9b2910': {
        id: 'c6a256ab-7747-488b-81de-a7cf9c9b2910',
        name: 'Raditz',
        gender: Gender.MALE,
        birthDate: -296438400000,
        location: {
          nationality: 'Saiyan',
          hometown: 'Planet Vegeta',
          domicile: 'Earth (briefly)',
        },
        contact: {
          phoneNumber: null,
          homeNumber: null,
        },
        occupation: {
          occupation: 'Mid-Class Warrior',
          officeAddress: 'Frieza Force',
        },
        imageThumbnailUrl: undefined,
        fullImageUrl: undefined,
      },
      // Launch
      'f2ac7d84-a7ea-4195-8e46-04042cfc81c8': {
        id: 'f2ac7d84-a7ea-4195-8e46-04042cfc81c8',
        name: 'Launch',
        gender: Gender.FEMALE,
        birthDate: -198720000000,
        location: {
          nationality: 'Earthling',
          hometown: 'West City',
          domicile: 'Kame House',
        },
        contact: {
          phoneNumber: '15550123',
          homeNumber: '15550124',
        },
        occupation: {
          occupation: 'Homemaker',
          officeAddress: 'Kame House',
        },
        imageThumbnailUrl: undefined,
        fullImageUrl: undefined,
      },
      // Rashi
      '5330e122-3fec-4e4e-97be-0a7868c49242': {
        id: '5330e122-3fec-4e4e-97be-0a7868c49242',
        name: 'Rashi',
        gender: Gender.MALE,
        birthDate: 490233600000,
        location: {
          nationality: 'Saiyan-Human Hybrid',
          hometown: 'Earth',
          domicile: 'West City',
        },
        contact: {
          phoneNumber: '15550127',
          homeNumber: '15550120',
        },
        occupation: {
          occupation: 'Student',
          officeAddress: '',
        },
        imageThumbnailUrl: undefined,
        fullImageUrl: undefined,
      },
      // Ranch
      'a83d4904-b535-401c-9c63-37f0d9096435': {
        id: 'a83d4904-b535-401c-9c63-37f0d9096435',
        name: 'Ranch',
        gender: Gender.FEMALE,
        birthDate: 543628800000,
        location: {
          nationality: 'Saiyan-Human Hybrid',
          hometown: 'Earth',
          domicile: 'West City',
        },
        contact: {
          phoneNumber: '15550127',
          homeNumber: '15550120',
        },
        occupation: {
          occupation: 'Student',
          officeAddress: '',
        },
        imageThumbnailUrl: undefined,
        fullImageUrl: undefined,
      },
      // Mooli
      '123d4904-b535-401c-9c63-37f0d9096435': {
        id: '123d4904-b535-401c-9c63-37f0d9096435',
        name: 'Mooli',
        gender: Gender.MALE,
        birthDate: 613440000000,
        location: {
          nationality: 'Saiyan-Human Hybrid',
          hometown: 'Earth',
          domicile: 'West City',
        },
        contact: {
          phoneNumber: '15550127',
          homeNumber: '15550120',
        },
        occupation: {
          occupation: 'Student',
          officeAddress: '',
        },
        imageThumbnailUrl: undefined,
        fullImageUrl: undefined,
      },
      // Goku
      '56dc74ba-7600-4f0b-ad06-bab252a8f0de': {
        id: '56dc74ba-7600-4f0b-ad06-bab252a8f0de',
        name: 'Goku',
        gender: Gender.MALE,
        birthDate: -146102400000,
        location: {
          nationality: 'Saiyan',
          hometown: 'Planet Vegeta',
          domicile: 'Mount Paozu, Earth',
        },
        contact: {
          phoneNumber: '15550127',
          homeNumber: '15550120',
        },
        occupation: {
          occupation: 'Martial Artist',
          officeAddress: '',
        },
        imageThumbnailUrl: undefined,
        fullImageUrl: undefined,
      },
      // Chi-Chi
      '783d4904-b535-401c-9c63-37f0d9096435': {
        id: '783d4904-b535-401c-9c63-37f0d9096435',
        name: 'Chi-Chi',
        gender: Gender.FEMALE,
        birthDate: 74304000000,
        location: {
          nationality: 'Earthling',
          hometown: 'Fire Mountain',
          domicile: 'Mount Paozu, Earth',
        },
        contact: {
          phoneNumber: '15550456',
          homeNumber: '15550457',
        },
        occupation: {
          occupation: 'Homemaker',
          officeAddress: '',
        },
        imageThumbnailUrl: undefined,
        fullImageUrl: undefined,
      },
      // Gohan
      'e1a15888-6a4b-4143-9521-fc45deb5d2a5': {
        id: 'e1a15888-6a4b-4143-9521-fc45deb5d2a5',
        name: 'Gohan',
        gender: Gender.MALE,
        birthDate: 543024000000,
        location: {
          nationality: 'Saiyan-Human Hybrid',
          hometown: 'Mount Paozu',
          domicile: 'Satan City',
        },
        contact: {
          phoneNumber: '15550789',
          homeNumber: '15550790',
        },
        occupation: {
          occupation: 'Scholar / Martial Artist',
          officeAddress: 'Orange Star University',
        },
        imageThumbnailUrl: undefined,
        fullImageUrl: undefined,
      },
      // Videl
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890': {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'Videl',
        gender: Gender.FEMALE,
        birthDate: 568944000000,
        location: {
          nationality: 'Earthling',
          hometown: 'Satan City',
          domicile: 'Satan City',
        },
        contact: {
          phoneNumber: '15551234',
          homeNumber: '15551235',
        },
        occupation: {
          occupation: 'Martial Artist / Crime Fighter',
          officeAddress: '',
        },
        imageThumbnailUrl: undefined,
        fullImageUrl: undefined,
      },
      // Pan
      'c5d4904a-b535-401c-9c63-37f0d9096435': {
        id: 'c5d4904a-b535-401c-9c63-37f0d9096435',
        name: 'Pan',
        gender: Gender.FEMALE,
        birthDate: 1192060800000,
        location: {
          nationality: 'Saiyan-Human Hybrid',
          hometown: 'Satan City',
          domicile: 'Satan City',
        },
        contact: {
          phoneNumber: '15551234',
          homeNumber: '15551235',
        },
        occupation: {
          occupation: 'Student / Martial Artist',
          officeAddress: '',
        },
        imageThumbnailUrl: undefined,
        fullImageUrl: undefined,
      },
      // Goten
      '883d4904-b535-401c-9c63-37f0d9096435': {
        id: '883d4904-b535-401c-9c63-37f0d9096435',
        name: 'Goten',
        gender: Gender.MALE,
        birthDate: 718588800000,
        location: {
          nationality: 'Saiyan-Human Hybrid',
          hometown: 'Mount Paozu',
          domicile: 'Mount Paozu',
        },
        contact: {
          phoneNumber: '15555678',
          homeNumber: '15555679',
        },
        occupation: {
          occupation: 'Student / Martial Artist',
          officeAddress: '',
        },
        imageThumbnailUrl: undefined,
        fullImageUrl: undefined,
      },
    }

    const person = detailedPersons[id]
    if (!person) {
      throw new Error(`Person with id ${id} not found`)
    }

    return { person }
  },
}
