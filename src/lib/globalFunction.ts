import { NextResponse } from "next/server";
import url from "url";
export function unauthorizeResponse() {
  return NextResponse.json({ message: "Unauthorize Request" }, { status: 401 });
}

export function errorResponse(error: string | null) {
  return NextResponse.json(
    { message: error ? error : "Something Wrong" },
    { status: 400 }
  );
}

export function successResponse() {
  return NextResponse.json({ success: true }, { status: 200 });
}
export async function getQuery(urlString: string) {
  return url.parse(urlString, true).query;
}
export function getParams(urlString: string) {
  return url.parse(urlString, true).pathname?.split("/").pop();
}
