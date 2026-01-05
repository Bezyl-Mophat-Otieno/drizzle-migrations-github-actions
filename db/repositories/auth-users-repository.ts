import { db } from '@/db'
import { NewUser, RefreshToken, refreshTokens, User, users, VerificationToken, verificationTokens } from '@/db/schema/auth-users'
import { and, count, desc, eq, inArray } from 'drizzle-orm'
import { usersRoles } from '../schema/users-roles'
import { BaseRepository } from './base-repository'

export class AuthUsersRepository extends BaseRepository<User | NewUser | null> {
  tableName = 'users'

  async create(userData: NewUser): Promise<User | null> {
    try {
      const [user] = await db
        .insert(users)
        .values({
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
      return user
    } catch (error) {
      console.log(error)
      this.handleError('create', error)
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
      return user || null
    } catch (error) {
      this.handleError('findByEmail', error)
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
      return user || null
    } catch (error) {
      this.handleError('findById', error)
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1)
      return user || null
    } catch (error) {
      this.handleError('findByUsername', error)
    }
  }

  async setVerified(userId: string): Promise<boolean> {
    try {
      const [updated] = await db
        .update(users)
        .set({
          status: 'active',
          emailVerifiedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning()
      return !!updated
    } catch (error) {
      this.handleError('setVerified', error)
    }
  }

  async updateStatus(userId: string, status: 'pending' | 'active' | 'suspended'): Promise<boolean> {
    try {
      const [updated] = await db
        .update(users)
        .set({ status, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning()
      return !!updated
    } catch (error) {
      this.handleError('updateStatus', error)
    }
  }

  async updatePassword(userId: string, passwordHash: string): Promise<boolean> {
    try {
      const [updated] = await db
        .update(users)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning()
      return !!updated
    } catch (error) {
      this.handleError('updatePassword', error)
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await db.select().from(users).orderBy(desc(users.createdAt))

    } catch (error) {
      this.handleError('findAll', error)
    }
  }
async findAllPaginated( limit: number, offset:  number ): Promise<{ total: number, active: number, admins: number, users: User[]}> {
  try {
    const [totalUsers, totalActiveUsers, totalAAdminUsers, usersResult] = await Promise.all([
      await db
        .select({ total: count() })
        .from(users),
      await db
        .select({ total: count() })
        .from(users).where(eq(users.status, 'active')),
      await db
        .select({ total: count() })
        .from(users)
        .innerJoin(usersRoles, eq(usersRoles.userId, users.id))
        .where(inArray(usersRoles.roleId, [1])),
      await db.select().from(users).limit(limit).offset(offset).orderBy(desc(users.createdAt))
    ])
    
    return {
      total: totalUsers[0].total,
      active: totalActiveUsers[0].total,
      admins: totalAAdminUsers[0].total,
      users: usersResult,
    }

  } catch (error) {
    this.handleError('findAllPaginated', error)
  }
}


  async createMany(usersData: NewUser[]): Promise<User[]> {
    try {
      return await db.insert(users).values(usersData).returning()
    } catch (error) {
      this.handleError('createMany', error)
      return []
    }
  }

  async update(id: string, data: Partial<NewUser>): Promise<User | null> {
    try {
      const [updated] = await db
        .update(users)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning()
      return updated || null
    } catch (error) {
      this.handleError('update', error)
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const [deleted] = await db.delete(users).where(eq(users.id, id)).returning()
      return !!deleted
    } catch (error) {
      this.handleError('delete', error)
      return false
    }
  }
}

export class VerificationTokensRepository {
  async create(userId: string, type: 'email' | 'reset', expiresAt: Date): Promise<string | null> {
    try {
      const token = this.generateToken()
      const [created] = await db
        .insert(verificationTokens)
        .values({
          userId,
          token,
          type,
          expiresAt,
          createdAt: new Date(),
        })
        .returning()
      return created?.token || null
    } catch (error) {
      console.error('VerificationTokensRepository.create error:', error)
      return null
    }
  }

  async findByToken(token: string, type: 'email' | 'reset'): Promise<VerificationToken | null> {
    try {
      const [found] = await db
        .select()
        .from(verificationTokens)
        .where(and(eq(verificationTokens.token, token), eq(verificationTokens.type, type)))
        .limit(1)
      return found || null
    } catch (error) {
      console.error('VerificationTokensRepository.findByToken error:', error)
      return null
    }
  }

  async delete(token: string): Promise<boolean> {
    try {
      const [deleted] = await db.delete(verificationTokens).where(eq(verificationTokens.token, token)).returning()
      return !!deleted
    } catch (error) {
      console.error('VerificationTokensRepository.delete error:', error)
      return false
    }
  }

  async deleteAll(userId: string, type: 'email' | 'reset'): Promise<boolean> {
    try {
      await db
        .delete(verificationTokens)
        .where(and(eq(verificationTokens.userId, userId), eq(verificationTokens.type, type)))
      return true
    } catch (error) {
      console.error('VerificationTokensRepository.deleteAll error:', error)
      return false
    }
  }

  private generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }
}

export class RefreshTokensRepository {
  async create(userId: string, token: string, userAgent?: string, ip?: string): Promise<RefreshToken | null> {
    try {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      const [created] = await db
        .insert(refreshTokens)
        .values({
          userId,
          token,
          userAgent,
          ip,
          expiresAt,
          createdAt: new Date(),
        })
        .returning()
      return created || null
    } catch (error) {
      console.error('RefreshTokensRepository.create error:', error)
      return null
    }
  }

  async find(token: string): Promise<RefreshToken | null> {
    try {
      const [found] = await db.select().from(refreshTokens).where(eq(refreshTokens.token, token)).limit(1)
      return found || null
    } catch (error) {
      console.error('RefreshTokensRepository.find error:', error)
      return null
    }
  }

  async delete(token: string): Promise<boolean> {
    try {
      const [deleted] = await db.delete(refreshTokens).where(eq(refreshTokens.token, token)).returning()
      return !!deleted
    } catch (error) {
      console.error('RefreshTokensRepository.delete error:', error)
      return false
    }
  }

  async deleteAll(userId: string): Promise<boolean> {
    try {
      await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId))
      return true
    } catch (error) {
      console.error('RefreshTokensRepository.deleteAll error:', error)
      return false
    }
  }

  async deleteExpired(): Promise<number> {
    try {
      const deleted = await db.delete(refreshTokens).where(eq(refreshTokens.expiresAt, new Date())).returning()
      return deleted.length
    } catch (error) {
      console.error('RefreshTokensRepository.deleteExpired error:', error)
      return 0
    }
  }
}

// Export repository instances
export const authUsersRepository = new AuthUsersRepository()
export const verificationTokensRepository = new VerificationTokensRepository()
export const refreshTokensRepository = new RefreshTokensRepository()
