import type { Generation, GenerationStatus } from "@/lib/types";

export interface IGenerationRepository {
  create(generation: Generation): Promise<Generation>;
  findById(id: string): Promise<Generation | null>;

  findByUserId(
    userId: string,
    page: number,
    pageSize: number
  ): Promise<{ generations: Generation[]; total: number }>;

  updateStatus(
    id: string,
    update: {
      status: GenerationStatus;
      progress?: number;
      videoUrl?: string | null;
      thumbnailUrl?: string | null;
      cloudinaryPublicId?: string | null;
      error?: string | null;
    }
  ): Promise<Generation | null>;

  delete(id: string): Promise<boolean>;
}

// ─── In-Memory Implementation (for development) ────────────

class InMemoryGenerationRepository implements IGenerationRepository {
  private store: Map<string, Generation> = new Map();

  async create(generation: Generation): Promise<Generation> {
    this.store.set(generation.id, { ...generation });
    return { ...generation };
  }

  async findById(id: string): Promise<Generation | null> {
    const gen = this.store.get(id);
    return gen ? { ...gen } : null;
  }

  async findByUserId(
    userId: string,
    page: number,
    pageSize: number
  ): Promise<{ generations: Generation[]; total: number }> {
    const allForUser = Array.from(this.store.values())
      .filter((g) => g.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    const total = allForUser.length;
    const start = (page - 1) * pageSize;
    const generations = allForUser.slice(start, start + pageSize);

    return { generations: generations.map((g) => ({ ...g })), total };
  }

  async updateStatus(
    id: string,
    update: {
      status: GenerationStatus;
      progress?: number;
      videoUrl?: string | null;
      thumbnailUrl?: string | null;
      cloudinaryPublicId?: string | null;
      error?: string | null;
    }
  ): Promise<Generation | null> {
    const gen = this.store.get(id);
    if (!gen) return null;

    const updated: Generation = {
      ...gen,
      status: update.status,
      progress: update.progress ?? gen.progress,
      videoUrl: update.videoUrl !== undefined ? update.videoUrl : gen.videoUrl,
      thumbnailUrl:
        update.thumbnailUrl !== undefined
          ? update.thumbnailUrl
          : gen.thumbnailUrl,
      cloudinaryPublicId:
        update.cloudinaryPublicId !== undefined
          ? update.cloudinaryPublicId
          : gen.cloudinaryPublicId,
      error: update.error !== undefined ? update.error : gen.error,
      updatedAt: new Date(),
    };

    this.store.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}

let repository: IGenerationRepository | null = null;

export function getGenerationRepository(): IGenerationRepository {
  if (!repository) {
    repository = new InMemoryGenerationRepository();
  }
  return repository;
}

export function setGenerationRepository(repo: IGenerationRepository): void {
  repository = repo;
}
