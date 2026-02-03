import dynamoose from "dynamoose";
import { Item } from "dynamoose/dist/Item.js";

import { uniqueTimestamp } from "../utils";
import { env } from "../utils/env";

export class QueryLogRecord extends Item {
  passageIndex: string;
  query: string;
  answer: string;
  thumb: -1 | 1;
  uniqueTimestamp: string;
  leadContactName: string;
  leadContactEmail: string;
  leadContactPhone: string;
  sessionId: string;
  ttl: number;
}

export const QueryLogSchema = new dynamoose.Schema({
  passageIndex: {
    type: String,
    hashKey: true,
  },
  uniqueTimestamp: {
    type: String,
    default: uniqueTimestamp,
    rangeKey: true,
  },
  query: String,
  answer: String,
  thumb: Number,
  leadContactName: String,
  leadContactEmail: String,
  leadContactPhone: String,
  sessionId: {
    type: String,
    index: {
      name: "sessionId-uniqueTimestamp-index",
    },
  },
  ttl: Number,
});

/**
 *
 * https://medium.com/@rahul.advani07/pagination-in-dynamodb-tips-tricks-and-good-practices-3c40edd479b0
 * https://dynobase.dev/dynamodb-pagination/
 */
export const QueryLogModel = dynamoose.model<QueryLogRecord>(
  env("AWS_DYNAMO_QUERY_LOG_TABLE"),
  QueryLogSchema,
);

export async function getQueryLogRecords(
  passageIndex: string,
  startDate: string,
  endDate: string,
  order: "ascending" | "descending",
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let records: any[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cursor: any = undefined;
  do {
    const queryLogs = await QueryLogModel.query("passageIndex")
      .eq(passageIndex)
      .filter("uniqueTimestamp")
      .between(startDate, `${endDate}T23:59:59`)
      .sort(order)
      .startAt(cursor)
      .limit(100)
      .exec();
    cursor = queryLogs.lastKey;
    records = [
      ...records,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...queryLogs.map((log: any) => [
        log.query,
        log.answer,
        formatUniqueTimestamp(log.uniqueTimestamp),
      ]),
    ];
  } while (cursor !== undefined);

  return records;
}

function formatUniqueTimestamp(input: string) {
  const date = new Date(input.split("#")[0] + ".000Z");
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
