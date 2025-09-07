import { Tree, Person } from '@/store/slices/treeSlice'
import { MockConfig } from '@/types/mockDevTool'

type TreeMock = {
  trees: {
    allTrees: Tree[]
  }
}

export type TreeMockWithParams = {
  fetchTreeById: (id: string) => { tree: Tree }
  fetchPersonById: (id: string) => { person: Person }
}

export const treeMocksWithParams: TreeMockWithParams = {
  fetchTreeById: (_id: string) => ({
    tree: {
      id: '1f7d15dd-11bc-4e6c-888d-19a1f633d83e',
      name: 'Bardock Family Tree',
      createdAt: 1754784000000,
      updatedAt: 1754784000000,
      root: {
        id: 'dbc07888-3701-40c4-87be-4df09f04e324',
        name: 'Bardock',
        imageThumbnailUrl: '/images/thumbnails/dbc07888-3701-40c4-87be-4df09f04e324.jpg',
        birthDate: -916617600000,
        deathDate: 1628553600000,
        children: [
          {
            id: 'c6a256ab-7747-488b-81de-a7cf9c9b2910',
            name: 'Raditz',
            imageThumbnailUrl: '/images/thumbnails/c6a256ab-7747-488b-81de-a7cf9c9b2910.jpg',
            birthDate: -296438400000,
            children: [
              {
                id: '5330e122-3fec-4e4e-97be-0a7868c49242',
                name: 'Rashi',
                imageThumbnailUrl: '/images/thumbnails/5330e122-3fec-4e4e-97be-0a7868c49242.jpg',
                birthDate: 490233600000,
                children: [],
                isBloodRelated: true,
              },
              {
                id: 'a83d4904-b535-401c-9c63-37f0d9096435',
                name: 'Ranch',
                imageThumbnailUrl: '/images/thumbnails/a83d4904-b535-401c-9c63-37f0d9096435.jpg',
                birthDate: 543628800000,
                children: [],
                isBloodRelated: true,
              },
              {
                id: '123d4904-b535-401c-9c63-37f0d9096435',
                name: 'Mooli',
                imageThumbnailUrl: '/images/thumbnails/123d4904-b535-401c-9c63-37f0d9096435.jpg',
                birthDate: 613440000000,
                children: [],
                isBloodRelated: true,
              },
            ],
            spouse: {
              id: 'f2ac7d84-a7ea-4195-8e46-04042cfc81c8',
              name: 'Launch',
              imageThumbnailUrl: '/images/thumbnails/f2ac7d84-a7ea-4195-8e46-04042cfc81c8.jpg',
              birthDate: -198720000000,
              children: [],
              isBloodRelated: false,
            },
            isBloodRelated: true,
          },
          {
            id: '56dc74ba-7600-4f0b-ad06-bab252a8f0de',
            name: 'Goku',
            imageThumbnailUrl: '/images/thumbnails/56dc74ba-7600-4f0b-ad06-bab252a8f0de.jpg',
            birthDate: -146102400000,
            children: [
              {
                id: 'e1a15888-6a4b-4143-9521-fc45deb5d2a5',
                name: 'Gohan',
                imageThumbnailUrl: '/images/thumbnails/e1a15888-6a4b-4143-9521-fc45deb5d2a5.jpg',
                birthDate: 543024000000,
                children: [
                  {
                    id: 'c5d4904a-b535-401c-9c63-37f0d9096435',
                    name: 'Pan',
                    imageThumbnailUrl: '/images/thumbnails/c5d4904a-b535-401c-9c63-37f0d9096435.jpg',
                    birthDate: 1192060800000,
                    children: [],
                    isBloodRelated: true,
                  },
                ],
                spouse: {
                  id: 'f2ac7d84-a7ea-4195-8e46-04042cfc81c8',
                  name: 'Videl',
                  imageThumbnailUrl: '/images/thumbnails/f2ac7d84-a7ea-4195-8e46-04042cfc81c8.jpg',
                  birthDate: 568944000000,
                  children: [],
                  isBloodRelated: false,
                },
                isBloodRelated: true,
              },
              {
                id: '883d4904-b535-401c-9c63-37f0d9096435',
                name: 'Goten',
                imageThumbnailUrl: '/images/thumbnails/883d4904-b535-401c-9c63-37f0d9096435.jpg',
                birthDate: 718588800000,
                children: [],
                isBloodRelated: true,
              },
            ],
            spouse: {
              id: '783d4904-b535-401c-9c63-37f0d9096435',
              name: 'Chi-Chi',
              imageThumbnailUrl: '/images/thumbnails/783d4904-b535-401c-9c63-37f0d9096435.jpg',
              birthDate: 74304000000,
              children: [],
              isBloodRelated: false,
            },
            isBloodRelated: true,
          },
        ],
        spouse: {
          id: 'b83d4904-b535-401c-9c63-37f0d9096435',
          name: 'Gine',
          imageThumbnailUrl: '/images/thumbnails/b83d4904-b535-401c-9c63-37f0d9096435.jpg',
          birthDate: -773798400000,
          children: [],
          isBloodRelated: true,
        },
        isBloodRelated: true,
      },
    },
  }),
  fetchPersonById: (_id: string) => ({
    person: {
      id: 'dbc07888-3701-40c4-87be-4df09f04e324',
      treeId: '1f7d15dd-11bc-4e6c-888d-19a1f633d83e',
      name: 'Bardock',
      gender: 'male',
      birthDate: -295833600000,
      deathDate: 1628553600000,
      nationality: 'Indonesia',
      addresses: {
        hometown: 'Jalan Indonesia Raya, Jakarta',
        residence: 'Istana Negara, IKN',
      },
      contact: {
        mobile: '+62 8181818181',
        home: '',
      },
      job: {
        title: 'Tukang Parkir',
        officeAddress: 'Jalan Indonesia Raya, Jakarta',
      },
      imageThumbnailUrl: '/images/thumbnails/dbc07888-3701-40c4-87be-4df09f04e324.jpg',
      fullImageUrl: '/images/full/dbc07888-3701-40c4-87be-4df09f04e324.jpg',
      isBloodRelated: true,
    },
  }),
}

export const treeMocks: MockConfig[] = [
  {
    id: 'family-list-success',
    endpoint: 'trees/family-1',
    method: 'get',
    enabled: true,
    responseType: 'success',
    delay: 500,
    statusCode: 200,
    description: 'Successful fetch of family tree with CRUD simulation',
    responseData: treeMocksWithParams.fetchTreeById('family-1').tree,
  },
]
