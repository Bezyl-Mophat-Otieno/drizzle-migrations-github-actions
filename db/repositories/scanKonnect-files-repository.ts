import { eq, inArray } from "drizzle-orm";
import { db } from "../index";
import { scankonnectFiles, type NewScanKonnectFile, type ScanKonnectFile } from "../schema/scanKonnect-files";
import { BaseRepository } from "./base-repository";

export class ScanKonnectFilesRepository extends BaseRepository<ScanKonnectFile> {
  create(entity: { id: string; createdAt: Date; size: number; type: string | null; deletedAt: Date | null; fileName: string; mimeType: string; scanKonnectQrcodeId: string; fileUrl: string }): Promise<{ id: string; createdAt: Date; size: number; type: string | null; deletedAt: Date | null; fileName: string; mimeType: string; scanKonnectQrcodeId: string; fileUrl: string } | undefined> {
    throw new Error("Method not implemented.")
  }
  tableName = "scankonnect_files"

  async addFiles(
    qrcodeId: string,
    files: Omit<NewScanKonnectFile, "scanKonnectQrcodeId">[],
  ): Promise<ScanKonnectFile[]> {
    try {
      const filesToInsert = files.map((file) => ({
        ...file,
        scanKonnectQrcodeId: qrcodeId,
      }))
      return await db.insert(scankonnectFiles).values(filesToInsert).returning()
    } catch (error) {
      this.handleError("addFiles", error)
      return []
    }
  }

  async deleteFiles(fileIds: string[]): Promise<boolean> {
    try {
      if (fileIds.length === 0) return true
      const result = await db
        .update(scankonnectFiles)
        .set({ deletedAt: new Date() })
        .where(inArray(scankonnectFiles.id, fileIds))
        .returning()
      return result.length > 0
    } catch (error) {
      this.handleError("deleteFiles", error)
      return false
    }
  }

  async replaceFiles(
    qrcodeId: string,
    filesToDelete: string[],
    filesToAdd: Omit<NewScanKonnectFile, "scanKonnectQrcodeId">[],
  ): Promise<ScanKonnectFile[]> {
    try {
      return await db.transaction(async (tx) => {
        // Soft delete old files
        if (filesToDelete.length > 0) {
          await tx
            .update(scankonnectFiles)
            .set({ deletedAt: new Date() })
            .where(inArray(scankonnectFiles.id, filesToDelete))
        }

        // Add new files
        const filesToInsert = filesToAdd.map((file) => ({
          ...file,
          scanKonnectQrcodeId: qrcodeId,
        }))
        return await tx.insert(scankonnectFiles).values(filesToInsert).returning()
      })
    } catch (error) {
      this.handleError("replaceFiles", error)
      return []
    }
  }

  async listFiles(qrcodeId: string): Promise<ScanKonnectFile[]> {
    try {
      return await db.select().from(scankonnectFiles).where(eq(scankonnectFiles.scanKonnectQrcodeId, qrcodeId))
    } catch (error) {
      this.handleError("listFiles", error)
      return []
    }
  }

  async findById(id: string): Promise<ScanKonnectFile | undefined> {
    try {
      const [file] = await db.select().from(scankonnectFiles).where(eq(scankonnectFiles.id, id)).limit(1)
      return file
    } catch (error) {
      this.handleError("findById", error)
    }
  }

  async findAll(): Promise<ScanKonnectFile[]> {
    try {
      return await db.select().from(scankonnectFiles)
    } catch (error) {
      this.handleError("findAll", error)
      return []
    }
  }

  async update(id: string | number, data: Partial<ScanKonnectFile>): Promise<ScanKonnectFile> {
    try {
      const [file] = await db.update(scankonnectFiles).set(data).where(eq(scankonnectFiles.id, String(id))).returning()
      if (!file) {
        throw new Error(`File with id ${id} not found`)
      }
      return file
    } catch (error) {
      this.handleError("update", error)
      throw error
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await db.delete(scankonnectFiles).where(eq(scankonnectFiles.id, id)).returning()
      return result.length > 0
    } catch (error) {
      this.handleError("delete", error)
      return false
    }
  }
}

export const scankonnectFilesRepository = new ScanKonnectFilesRepository()
