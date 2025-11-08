import neo4j, { Driver, Session } from "neo4j-driver";

let driver: Driver | null = null;

export function getNeo4jDriver(): Driver {
  if (!driver) {
    const uri = process.env.NEO4J_URI;
    const username = process.env.NEO4J_USERNAME;
    const password = process.env.NEO4J_PASSWORD;
    if (!uri || !username || !password) {
      throw new Error("Missing Neo4j env vars: NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD");
    }
    driver = neo4j.driver(uri, neo4j.auth.basic(username, password), {
      /* Tunables can be added here */
    });
  }
  return driver;
}

export async function withSession<T>(
  work: (session: Session) => Promise<T>,
  accessMode: "READ" | "WRITE" = "WRITE"
): Promise<T> {
  const drv = getNeo4jDriver();
  const session = drv.session({ defaultAccessMode: accessMode === "WRITE" ? neo4j.session.WRITE : neo4j.session.READ });
  try {
    return await work(session);
  } finally {
    await session.close();
  }
}


