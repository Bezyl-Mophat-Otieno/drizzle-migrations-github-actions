import { db } from '@/db'
import { sql } from 'drizzle-orm'
import { z } from 'zod'

export abstract class BaseRepository<T> {
  abstract tableName: string
  abstract findById(id: string | number): Promise<T | undefined>
  abstract findAll(): Promise<T[]>
  abstract create(entity: T): Promise<T | undefined>
  abstract update(id: string | number, entity: Partial<T>): Promise<T>
  abstract delete(id: string | number): Promise<boolean>

  async executeRawQuery<R>(query: string, resultSchema: z.ZodType<R>): Promise<R[]> {
    try {
      const result = await db.execute(sql.raw(query))
      return result.rows.map((row) => resultSchema.parse(row))
    } catch (error) {
      console.log(error)
      this.handleError('executeRawQuery', error)
    }
  }

protected handleError(operation: string, error: unknown): never {
  if (error instanceof z.ZodError) {
    throw new Error('Please check your input and try again. Some required fields may be missing or invalid.')
  }

  if (error instanceof Error) {
    // Map common database errors to user-friendly messages
    if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
      throw new Error('This record already exists. Please use different information.')
    }
    
    if (error.message.includes('foreign key') || error.message.includes('violates')) {
      throw new Error('Unable to complete this action due to related data. Please try again.')
    }
    
    if (error.message.includes('not found')) {
      throw new Error('The requested information could not be found.')
    }
    
    if (error.message.includes('connection') || error.message.includes('timeout')) {
      throw new Error('Connection issue. Please check your internet and try again.')
    }
    
    // Generic fallback for other database errors
    throw new Error('Something went wrong. Please try again or contact support if the problem persists.')
  }

  throw new Error('An unexpected error occurred. Please try again or contact support if the problem persists.')
}

}
