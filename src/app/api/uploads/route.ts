import { NextResponse } from "next/server";
import { saveLocalUpload } from "@/lib/storage/local";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Upload must include a file field." },
        { status: 400 },
      );
    }

    const upload = await saveLocalUpload(file);
    return NextResponse.json(upload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 500 },
    );
  }
}

