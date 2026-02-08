import { Tree, DetailedPerson } from '@/store/slices/treeSlice'

type TreeMock = {
  trees: Tree[]
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
}

export const treeMocksWithParams: TreeMockWithParams = {
  fetchTreeById: (_id: string) => ({
    id: '1f7d15dd-11bc-4e6c-888d-19a1f633d83e',
    name: 'Bardock Family Tree',
    createdAt: 1754784000000,
    updatedAt: 1754784000000,
    familyImageUrl: '/images/family-thumbnail.webp',
    rootId: 'dbc07888-3701-40c4-87be-4df09f04e324',
    persons: [
      // Root: Bardock
      {
        id: 'dbc07888-3701-40c4-87be-4df09f04e324',
        name: 'Bardock',
        imageThumbnailUrl: '/images/thumbnails/dbc07888-3701-40c4-87be-4df09f04e324.jpg',
        birthDate: -916617600000,
        deathDate: 1628553600000,
        spouseId: 'b83d4904-b535-401c-9c63-37f0d9096435',
        isBloodRelated: true,
      },
      // Bardock's spouse: Gine
      {
        id: 'b83d4904-b535-401c-9c63-37f0d9096435',
        name: 'Gine',
        imageThumbnailUrl: '/images/thumbnails/b83d4904-b535-401c-9c63-37f0d9096435.jpg',
        birthDate: -773798400000,
        spouseId: 'dbc07888-3701-40c4-87be-4df09f04e324',
        isBloodRelated: true,
      },
      // Raditz (Bardock's child)
      {
        id: 'c6a256ab-7747-488b-81de-a7cf9c9b2910',
        name: 'Raditz',
        imageThumbnailUrl: '/images/thumbnails/c6a256ab-7747-488b-81de-a7cf9c9b2910.jpg',
        birthDate: -296438400000,
        spouseId: 'f2ac7d84-a7ea-4195-8e46-04042cfc81c8',
        fatherId: 'dbc07888-3701-40c4-87be-4df09f04e324',
        motherId: 'b83d4904-b535-401c-9c63-37f0d9096435',
        isBloodRelated: true,
      },
      // Raditz's spouse: Launch
      {
        id: 'f2ac7d84-a7ea-4195-8e46-04042cfc81c8',
        name: 'Launch',
        imageThumbnailUrl: '/images/thumbnails/f2ac7d84-a7ea-4195-8e46-04042cfc81c8.jpg',
        birthDate: -198720000000,
        spouseId: 'c6a256ab-7747-488b-81de-a7cf9c9b2910',
        isBloodRelated: false,
      },
      // Raditz's children
      {
        id: '5330e122-3fec-4e4e-97be-0a7868c49242',
        name: 'Rashi',
        imageThumbnailUrl: '/images/thumbnails/5330e122-3fec-4e4e-97be-0a7868c49242.jpg',
        birthDate: 490233600000,
        fatherId: 'c6a256ab-7747-488b-81de-a7cf9c9b2910',
        motherId: 'f2ac7d84-a7ea-4195-8e46-04042cfc81c8',
        isBloodRelated: true,
      },
      {
        id: 'a83d4904-b535-401c-9c63-37f0d9096435',
        name: 'Ranch',
        imageThumbnailUrl: '/images/thumbnails/a83d4904-b535-401c-9c63-37f0d9096435.jpg',
        birthDate: 543628800000,
        fatherId: 'c6a256ab-7747-488b-81de-a7cf9c9b2910',
        motherId: 'f2ac7d84-a7ea-4195-8e46-04042cfc81c8',
        isBloodRelated: true,
      },
      {
        id: '123d4904-b535-401c-9c63-37f0d9096435',
        name: 'Mooli',
        imageThumbnailUrl: '/images/thumbnails/123d4904-b535-401c-9c63-37f0d9096435.jpg',
        birthDate: 613440000000,
        fatherId: 'c6a256ab-7747-488b-81de-a7cf9c9b2910',
        motherId: 'f2ac7d84-a7ea-4195-8e46-04042cfc81c8',
        isBloodRelated: true,
      },
      // Goku (Bardock's child)
      {
        id: '56dc74ba-7600-4f0b-ad06-bab252a8f0de',
        name: 'Goku',
        imageThumbnailUrl: '/images/thumbnails/56dc74ba-7600-4f0b-ad06-bab252a8f0de.jpg',
        birthDate: -146102400000,
        spouseId: '783d4904-b535-401c-9c63-37f0d9096435',
        fatherId: 'dbc07888-3701-40c4-87be-4df09f04e324',
        motherId: 'b83d4904-b535-401c-9c63-37f0d9096435',
        isBloodRelated: true,
      },
      // Goku's spouse: Chi-Chi
      {
        id: '783d4904-b535-401c-9c63-37f0d9096435',
        name: 'Chi-Chi',
        imageThumbnailUrl: '/images/thumbnails/783d4904-b535-401c-9c63-37f0d9096435.jpg',
        birthDate: 74304000000,
        spouseId: '56dc74ba-7600-4f0b-ad06-bab252a8f0de',
        isBloodRelated: false,
      },
      // Gohan (Goku's child)
      {
        id: 'e1a15888-6a4b-4143-9521-fc45deb5d2a5',
        name: 'Gohan',
        imageThumbnailUrl: '/images/thumbnails/e1a15888-6a4b-4143-9521-fc45deb5d2a5.jpg',
        birthDate: 543024000000,
        spouseId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        fatherId: '56dc74ba-7600-4f0b-ad06-bab252a8f0de',
        motherId: '783d4904-b535-401c-9c63-37f0d9096435',
        isBloodRelated: true,
      },
      // Gohan's spouse: Videl
      {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'Videl',
        imageThumbnailUrl: '/images/thumbnails/f2ac7d84-a7ea-4195-8e46-04042cfc81c8.jpg',
        birthDate: 568944000000,
        spouseId: 'e1a15888-6a4b-4143-9521-fc45deb5d2a5',
        isBloodRelated: false,
      },
      // Pan (Gohan's child)
      {
        id: 'c5d4904a-b535-401c-9c63-37f0d9096435',
        name: 'Pan',
        imageThumbnailUrl: '/images/thumbnails/c5d4904a-b535-401c-9c63-37f0d9096435.jpg',
        birthDate: 1192060800000,
        fatherId: 'e1a15888-6a4b-4143-9521-fc45deb5d2a5',
        motherId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        isBloodRelated: true,
      },
      // Goten (Goku's child)
      {
        id: '883d4904-b535-401c-9c63-37f0d9096435',
        name: 'Goten',
        imageThumbnailUrl: '/images/thumbnails/883d4904-b535-401c-9c63-37f0d9096435.jpg',
        birthDate: 718588800000,
        fatherId: '56dc74ba-7600-4f0b-ad06-bab252a8f0de',
        motherId: '783d4904-b535-401c-9c63-37f0d9096435',
        isBloodRelated: true,
      },
    ],
  }),
  fetchPersonById: (id: string) => {
    const detailedPersons: Record<string, DetailedPerson> = {
      // Bardock
      'dbc07888-3701-40c4-87be-4df09f04e324': {
        id: 'dbc07888-3701-40c4-87be-4df09f04e324',
        name: 'Bardock',
        gender: 'male',
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
        imageThumbnailUrl: '/images/thumbnails/dbc07888-3701-40c4-87be-4df09f04e324.jpg',
        fullImageUrl: '/images/full/dbc07888-3701-40c4-87be-4df09f04e324.jpg',
        isBloodRelated: true,
      },
      // Gine
      'b83d4904-b535-401c-9c63-37f0d9096435': {
        id: 'b83d4904-b535-401c-9c63-37f0d9096435',
        name: 'Gine',
        gender: 'female',
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
        imageThumbnailUrl: '/images/thumbnails/b83d4904-b535-401c-9c63-37f0d9096435.jpg',
        fullImageUrl: '/images/full/b83d4904-b535-401c-9c63-37f0d9096435.jpg',
        isBloodRelated: true,
      },
      // Raditz
      'c6a256ab-7747-488b-81de-a7cf9c9b2910': {
        id: 'c6a256ab-7747-488b-81de-a7cf9c9b2910',
        name: 'Raditz',
        gender: 'male',
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
        imageThumbnailUrl: '/images/thumbnails/c6a256ab-7747-488b-81de-a7cf9c9b2910.jpg',
        fullImageUrl: '/images/full/c6a256ab-7747-488b-81de-a7cf9c9b2910.jpg',
        isBloodRelated: true,
      },
      // Launch
      'f2ac7d84-a7ea-4195-8e46-04042cfc81c8': {
        id: 'f2ac7d84-a7ea-4195-8e46-04042cfc81c8',
        name: 'Launch',
        gender: 'female',
        birthDate: -198720000000,
        location: {
          nationality: 'Earthling',
          hometown: 'West City',
          domicile: 'Kame House',
        },
        contact: {
          phoneNumber: 15550123,
          homeNumber: 15550124,
        },
        occupation: {
          occupation: 'Homemaker',
        },
        imageThumbnailUrl: '/images/thumbnails/f2ac7d84-a7ea-4195-8e46-04042cfc81c8.jpg',
        fullImageUrl: '/images/full/f2ac7d84-a7ea-4195-8e46-04042cfc81c8.jpg',
        isBloodRelated: false,
      },
      // Rashi
      '5330e122-3fec-4e4e-97be-0a7868c49242': {
        id: '5330e122-3fec-4e4e-97be-0a7868c49242',
        name: 'Rashi',
        gender: 'male',
        birthDate: 490233600000,
        location: {
          nationality: 'Saiyan-Human Hybrid',
          hometown: 'Earth',
          domicile: 'West City',
        },
        contact: {
          phoneNumber: 15550127,
          homeNumber: 15550120,
        },
        occupation: {
          occupation: 'Student',
        },
        imageThumbnailUrl: '/images/thumbnails/5330e122-3fec-4e4e-97be-0a7868c49242.jpg',
        fullImageUrl: '/images/full/5330e122-3fec-4e4e-97be-0a7868c49242.jpg',
        isBloodRelated: true,
      },
      // Ranch
      'a83d4904-b535-401c-9c63-37f0d9096435': {
        id: 'a83d4904-b535-401c-9c63-37f0d9096435',
        name: 'Ranch',
        gender: 'female',
        birthDate: 543628800000,
        location: {
          nationality: 'Saiyan-Human Hybrid',
          hometown: 'Earth',
          domicile: 'West City',
        },
        contact: {
          phoneNumber: 15550127,
          homeNumber: 15550120,
        },
        occupation: {
          occupation: 'Student',
        },
        imageThumbnailUrl: '/images/thumbnails/a83d4904-b535-401c-9c63-37f0d9096435.jpg',
        fullImageUrl: '/images/full/a83d4904-b535-401c-9c63-37f0d9096435.jpg',
        isBloodRelated: true,
      },
      // Mooli
      '123d4904-b535-401c-9c63-37f0d9096435': {
        id: '123d4904-b535-401c-9c63-37f0d9096435',
        name: 'Mooli',
        gender: 'male',
        birthDate: 613440000000,
        location: {
          nationality: 'Saiyan-Human Hybrid',
          hometown: 'Earth',
          domicile: 'West City',
        },
        contact: {
          phoneNumber: 15550127,
          homeNumber: 15550120,
        },
        occupation: {
          occupation: 'Student',
        },
        imageThumbnailUrl: '/images/thumbnails/123d4904-b535-401c-9c63-37f0d9096435.jpg',
        fullImageUrl: '/images/full/123d4904-b535-401c-9c63-37f0d9096435.jpg',
        isBloodRelated: true,
      },
      // Goku
      '56dc74ba-7600-4f0b-ad06-bab252a8f0de': {
        id: '56dc74ba-7600-4f0b-ad06-bab252a8f0de',
        name: 'Goku',
        gender: 'male',
        birthDate: -146102400000,
        location: {
          nationality: 'Saiyan',
          hometown: 'Planet Vegeta',
          domicile: 'Mount Paozu, Earth',
        },
        contact: {
          phoneNumber: 15550127,
          homeNumber: 15550120,
        },
        occupation: {
          occupation: 'Martial Artist',
        },
        imageThumbnailUrl: '/images/thumbnails/56dc74ba-7600-4f0b-ad06-bab252a8f0de.jpg',
        fullImageUrl: '/images/full/56dc74ba-7600-4f0b-ad06-bab252a8f0de.jpg',
        isBloodRelated: true,
      },
      // Chi-Chi
      '783d4904-b535-401c-9c63-37f0d9096435': {
        id: '783d4904-b535-401c-9c63-37f0d9096435',
        name: 'Chi-Chi',
        gender: 'female',
        birthDate: 74304000000,
        location: {
          nationality: 'Earthling',
          hometown: 'Fire Mountain',
          domicile: 'Mount Paozu, Earth',
        },
        contact: {
          phoneNumber: 15550456,
          homeNumber: 15550457,
        },
        occupation: {
          occupation: 'Homemaker',
        },
        imageThumbnailUrl: '/images/thumbnails/783d4904-b535-401c-9c63-37f0d9096435.jpg',
        fullImageUrl: '/images/full/783d4904-b535-401c-9c63-37f0d9096435.jpg',
        isBloodRelated: false,
      },
      // Gohan
      'e1a15888-6a4b-4143-9521-fc45deb5d2a5': {
        id: 'e1a15888-6a4b-4143-9521-fc45deb5d2a5',
        name: 'Gohan',
        gender: 'male',
        birthDate: 543024000000,
        location: {
          nationality: 'Saiyan-Human Hybrid',
          hometown: 'Mount Paozu',
          domicile: 'Satan City',
        },
        contact: {
          phoneNumber: 15550789,
          homeNumber: 15550790,
        },
        occupation: {
          occupation: 'Scholar / Martial Artist',
          officeAddress: 'Orange Star University',
        },
        imageThumbnailUrl: '/images/thumbnails/e1a15888-6a4b-4143-9521-fc45deb5d2a5.jpg',
        fullImageUrl: '/images/full/e1a15888-6a4b-4143-9521-fc45deb5d2a5.jpg',
        isBloodRelated: true,
      },
      // Videl
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890': {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'Videl',
        gender: 'female',
        birthDate: 568944000000,
        location: {
          nationality: 'Earthling',
          hometown: 'Satan City',
          domicile: 'Satan City',
        },
        contact: {
          phoneNumber: 15551234,
          homeNumber: 15551235,
        },
        occupation: {
          occupation: 'Martial Artist / Crime Fighter',
        },
        imageThumbnailUrl: '/images/thumbnails/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg',
        fullImageUrl: '/images/full/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg',
        isBloodRelated: false,
      },
      // Pan
      'c5d4904a-b535-401c-9c63-37f0d9096435': {
        id: 'c5d4904a-b535-401c-9c63-37f0d9096435',
        name: 'Pan',
        gender: 'female',
        birthDate: 1192060800000,
        location: {
          nationality: 'Saiyan-Human Hybrid',
          hometown: 'Satan City',
          domicile: 'Satan City',
        },
        contact: {
          phoneNumber: 15551234,
          homeNumber: 15551235,
        },
        occupation: {
          occupation: 'Student / Martial Artist',
        },
        imageThumbnailUrl: '/images/thumbnails/c5d4904a-b535-401c-9c63-37f0d9096435.jpg',
        fullImageUrl: '/images/full/c5d4904a-b535-401c-9c63-37f0d9096435.jpg',
        isBloodRelated: true,
      },
      // Goten
      '883d4904-b535-401c-9c63-37f0d9096435': {
        id: '883d4904-b535-401c-9c63-37f0d9096435',
        name: 'Goten',
        gender: 'male',
        birthDate: 718588800000,
        location: {
          nationality: 'Saiyan-Human Hybrid',
          hometown: 'Mount Paozu',
          domicile: 'Mount Paozu',
        },
        contact: {
          phoneNumber: 15555678,
          homeNumber: 15555679,
        },
        occupation: {
          occupation: 'Student / Martial Artist',
        },
        imageThumbnailUrl: '/images/thumbnails/883d4904-b535-401c-9c63-37f0d9096435.jpg',
        fullImageUrl: '/images/full/883d4904-b535-401c-9c63-37f0d9096435.jpg',
        isBloodRelated: true,
      },
    }

    const person = detailedPersons[id]
    if (!person) {
      throw new Error(`Person with id ${id} not found`)
    }

    return { person }
  },
}
