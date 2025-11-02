import * as SQLite from "expo-sqlite";

export interface FavoritePokemon {
  id: number;
  name: string;
  image_url: string;
  created_at: string;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

  private async getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (this.db) {
      return this.db;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        const database = await SQLite.openDatabaseAsync("pokedex.db");
        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            image_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);
        this.db = database;
        this.initPromise = null;
        return database;
      } catch (error) {
        console.error("Error initializing database:", error);
        this.initPromise = null;
        throw error;
      }
    })();

    return this.initPromise;
  }

  async initDatabase(): Promise<void> {
    await this.getDatabase();
  }

  async addFavorite(
    pokemonId: number,
    name: string,
    imageUrl?: string
  ): Promise<void> {
    try {
      const db = await this.getDatabase();
      await db.runAsync(
        "INSERT OR REPLACE INTO favorites (id, name, image_url) VALUES (?, ?, ?)",
        [pokemonId, name, imageUrl || ""]
      );
    } catch (error) {
      console.error("Error adding favorite:", error);
      throw error;
    }
  }

  async removeFavorite(pokemonId: number): Promise<void> {
    try {
      const db = await this.getDatabase();
      await db.runAsync("DELETE FROM favorites WHERE id = ?", [pokemonId]);
    } catch (error) {
      console.error("Error removing favorite:", error);
      throw error;
    }
  }

  async isFavorite(pokemonId: number): Promise<boolean> {
    try {
      const db = await this.getDatabase();
      const result = await db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM favorites WHERE id = ?",
        [pokemonId]
      );
      return (result?.count || 0) > 0;
    } catch (error) {
      console.error("Error checking favorite status:", error);
      return false;
    }
  }

  async getAllFavorites(): Promise<FavoritePokemon[]> {
    try {
      const db = await this.getDatabase();
      const result = await db.getAllAsync<FavoritePokemon>(
        "SELECT * FROM favorites ORDER BY created_at DESC"
      );
      return result;
    } catch (error) {
      console.error("Error getting favorites:", error);
      return [];
    }
  }
}

export const databaseService = new DatabaseService();

