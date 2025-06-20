import { NextRequest, NextResponse } from "next/server";
import driver from "@/app/lib/neo4j";

export async function GET(
  req: NextRequest,
  context: { params: Record<string, string> }
) {
  const region = decodeURIComponent((await context.params).region);
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (e:Event)-[:LOCATED_IN]->(p:Province)-[:IN_REGION]->(r:Region {name: $region})
      OPTIONAL MATCH (e)-[:ORGANIZED_BY]->(party:Party)
      RETURN 
        e.id AS id, 
        e.name AS name, 
        e.description AS description, 
        e.date AS date,
        e.location AS location, 
        party.name AS party, 
        party.id AS partyId,
        r.name AS region
      ORDER BY e.date DESC
      `,
      { region }
    );

    const events = result.records.map((record) => ({
      id:
        typeof record.get("id")?.toNumber === "function"
          ? record.get("id").toNumber()
          : record.get("id"),
      name: record.get("name") ?? "",
      description: record.get("description") ?? "",
      date: record.get("date") ?? "",
      location: record.get("location") ?? "",
      party: record.get("party") ?? null,
      partyId: typeof record.get("partyId")?.toNumber === "function"
        ? record.get("partyId").toNumber()
        : record.get("partyId") ?? null,
      region: record.get("region") ?? "",
    }));

    return NextResponse.json(events);
  } catch (err) {
    console.error("Neo4j Error:", err);
    return NextResponse.json({ error: "ไม่สามารถโหลดกิจกรรมได้" }, { status: 500 });
  } finally {
    await session.close();
  }
}