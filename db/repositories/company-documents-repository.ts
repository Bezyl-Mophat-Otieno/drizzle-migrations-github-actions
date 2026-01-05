import { db } from '@/db'
import { CompanyDocument, companyDocuments, NewCompanyDocument } from '@/db/schema/company-documents'
import { eq } from 'drizzle-orm'
import { BaseRepository } from './base-repository'

export class CompanyDocumentRepository extends BaseRepository<CompanyDocument | NewCompanyDocument | null> {
  tableName = 'company_documents'

  async create(document: NewCompanyDocument): Promise<CompanyDocument | undefined> {
    try {
      const [created] = await db
        .insert(companyDocuments)
        .values({
          ...document,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
      return created
    } catch (error) {
      this.handleError('create', error)
    }
  }

  async batchCreate(documents: NewCompanyDocument[]): Promise<CompanyDocument[] | undefined> {
    try {
      const created = await db
        .insert(companyDocuments)
        .values(documents)
        .returning()
      return created
    } catch (error) {
      this.handleError('create', error)
    }
  }

  async findById(id: string): Promise<CompanyDocument | undefined> {
    try {
      const [document] = await db.select().from(companyDocuments).where(eq(companyDocuments.id, id)).limit(1)
      return document
    } catch (error) {
      this.handleError('findById', error)
    }
  }

  async findAll(): Promise<CompanyDocument[]> {
    try {
      return await db.select().from(companyDocuments)
    } catch (error) {
      this.handleError('findAll', error)
    }
  }

  async update(id: string, data: Partial<NewCompanyDocument>): Promise<CompanyDocument> {
    try {
      const [updated] = await db
        .update(companyDocuments)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(companyDocuments.id, id))
        .returning()
      return updated
    } catch (error) {
      this.handleError('update', error)
    }
  }

  async delete(documentId: string): Promise<boolean> {
    try {
      const [deleted] = await db.delete(companyDocuments).where(eq(companyDocuments.id, documentId)).returning()
      return !!deleted
    } catch (error) {
      this.handleError('delete', error)
    }
  }

  async deleteAll(): Promise<boolean> {
    try {
      const [deleted] = await db.delete(companyDocuments).returning()
      return !!deleted
    } catch (error) {
      this.handleError('delete', error)
    }
  }

  async findByCompany(companyId: string): Promise<CompanyDocument[]> {
    try {
      return await db.select().from(companyDocuments).where(eq(companyDocuments.companyId, companyId))
    } catch (error) {
      this.handleError('findByCompany', error)
    }
  }

  async updateStatus(documentId: string, status: 'accepted' | 'declined' | 'pending'): Promise<boolean> {
    try {
      const [updated] = await db
        .update(companyDocuments)
        .set({ status, updatedAt: new Date() })
        .where(eq(companyDocuments.id, documentId))
        .returning()
      return !!updated
    } catch (error) {
      this.handleError('updateStatus', error)
    }
  }
}

export const companyDocumentRepository = new CompanyDocumentRepository()
