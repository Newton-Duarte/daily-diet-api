// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
    }

    meals: {
      id: string
      name: string
      description: string
      inside_diet: boolean
      user_id: string
      date: Date
      created_at: string
      updated_at: string
    }
  }
}
