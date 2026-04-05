import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, UIMessage } from "ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const openclaw = createOpenAI({
  baseURL: process.env.OPENCLAW_GATEWAY_URL + "/v1",
  apiKey: process.env.OPENCLAW_BEARER_TOKEN!,
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages, projectId } = await req.json();

  let systemMessage = "You are a helpful project management assistant.";

  if (projectId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (project) {
      systemMessage = `You are a PM assistant for the project "${project.displayName}" (${project.githubRepoOwner}/${project.githubRepoName}). Help the user with questions about this project.`;
    }
  }

  const modelMessages = await convertToModelMessages(messages as UIMessage[]);

  const result = streamText({
    model: openclaw("openclaw"),
    system: systemMessage,
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
